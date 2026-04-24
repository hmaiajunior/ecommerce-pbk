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
  const secret = req.nextUrl.searchParams.get("secret")
  if (!isValidSecret(secret)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 })
  }

  const payload = await req.json().catch(() => null)
  if (!payload) {
    return NextResponse.json({ error: "Body inválido." }, { status: 400 })
  }

  const orderNsu = String(payload?.order_nsu ?? "")
  const transactionNsu = String(payload?.transaction_nsu ?? "")
  const captureMethod = typeof payload?.capture_method === "string"
    ? payload.capture_method
    : undefined
  const paidAmount = Number(payload?.paid_amount ?? 0) // em centavos
  const amount = Number(payload?.amount ?? 0)          // em centavos

  if (!orderNsu || !transactionNsu) {
    return NextResponse.json({ received: true })
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderNsu },
      include: { user: { select: { name: true, email: true } } },
    })

    if (!order) {
      // order_nsu desconhecido - possivelmente de outra loja usando mesmo handle
      return NextResponse.json({ received: true })
    }

    // Valida que o valor recebido é compatível com o pedido.
    // paid_amount pode ser maior que amount devido a juros do parcelamento.
    const expectedCents = Math.round(Number(order.total) * 100)
    if (amount < expectedCents) {
      console.warn(
        `[webhook/infinitepay] Valor divergente — esperado ${expectedCents}, recebido ${amount} (pedido ${order.id})`
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
        paymentId: transactionNsu,
      },
    })

    if (
      paymentStatus === "APPROVED" &&
      order.paymentStatus !== "APPROVED"
    ) {
      await sendOrderConfirmationEmail(
        order.user.email ?? "",
        order.user.name ?? "",
        order.id
      )
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error("[webhook/infinitepay]", err)
    // 200 evita reenvios indevidos da InfinitePay
    return NextResponse.json({ received: true })
  }
}
