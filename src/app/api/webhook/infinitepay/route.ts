import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { prisma } from "@/lib/prisma"
import { mapInfinitePayCapture, mapInfinitePayMethod } from "@/lib/infinitepay"
import { sendOrderConfirmationEmail } from "@/lib/email"

// ─── Validação do segredo ─────────────────────────────────────────────────────
// A API pública de checkout da InfinitePay não assina webhooks (sem HMAC).
// Protegemos o endpoint exigindo um segredo na query-string, que só a
// InfinitePay conhece porque configuramos o webhook_url com ele.

function isValidSecret(received: string | null): boolean {
  const expected = process.env.INFINITEPAY_WEBHOOK_SECRET
  if (!expected || !received) return false
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(received))
  } catch {
    return false
  }
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  console.log("[webhook/infinitepay] recebido")

  const secret = req.nextUrl.searchParams.get("secret")
  if (!isValidSecret(secret)) {
    console.warn("[webhook/infinitepay] segredo inválido ou ausente")
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 })
  }

  const payload = await req.json().catch(() => null)
  if (!payload) {
    console.warn("[webhook/infinitepay] body inválido")
    return NextResponse.json({ error: "Body inválido." }, { status: 400 })
  }

  console.log("[webhook/infinitepay] payload:", JSON.stringify(payload))

  const orderNsu = String(payload?.order_nsu ?? "")
  const transactionNsu = String(payload?.transaction_nsu ?? "")
  const captureMethod = typeof payload?.capture_method === "string"
    ? payload.capture_method
    : undefined
  const amount = Number(payload?.amount ?? 0) // em centavos

  if (!orderNsu) {
    console.warn("[webhook/infinitepay] sem order_nsu — ignorado")
    return NextResponse.json({ received: true })
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderNsu },
      include: { user: { select: { name: true, email: true } } },
    })

    if (!order) {
      console.warn(
        `[webhook/infinitepay] pedido ${orderNsu} não encontrado — ignorado`
      )
      return NextResponse.json({ received: true })
    }

    // Valida que o valor recebido é compatível com o pedido.
    // paid_amount pode ser maior que amount devido a juros do parcelamento.
    const expectedCents = Math.round(Number(order.total) * 100)
    if (amount > 0 && amount < expectedCents) {
      console.warn(
        `[webhook/infinitepay] valor divergente — esperado ${expectedCents}, recebido ${amount} (pedido ${order.id})`
      )
      return NextResponse.json({ received: true })
    }

    const { orderStatus, paymentStatus } = mapInfinitePayCapture(captureMethod)
    const paymentMethod = mapInfinitePayMethod(captureMethod)

    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: orderStatus,
        paymentStatus,
        paymentMethod,
        ...(transactionNsu && { paymentId: transactionNsu }),
      },
    })

    console.log(
      `[webhook/infinitepay] pedido ${order.id} atualizado para ${paymentStatus} (método ${paymentMethod})`
    )

    if (
      paymentStatus === "APPROVED" &&
      order.paymentStatus !== "APPROVED"
    ) {
      // Baixa definitiva: remove da reserva (stock já foi decrementado em createOrder)
      const orderWithItems = await prisma.order.findUnique({
        where: { id: order.id },
        include: { items: true },
      })
      if (orderWithItems) {
        for (const item of orderWithItems.items) {
          await prisma.productSize.updateMany({
            where: { productId: item.productId, size: item.size },
            data: { stockReserved: { decrement: item.quantity } },
          })
        }
      }

      await sendOrderConfirmationEmail(
        order.user.email ?? "",
        order.user.name ?? "",
        order.id
      )
      console.log(`[webhook/infinitepay] e-mail de confirmação enviado`)
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error("[webhook/infinitepay] erro:", err)
    // 200 evita reenvios indevidos da InfinitePay
    return NextResponse.json({ received: true })
  }
}
