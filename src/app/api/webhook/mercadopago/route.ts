import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { prisma } from "@/lib/prisma"
import { mpPayment, mapMpStatus } from "@/lib/mercadopago"
import { sendOrderConfirmationEmail } from "@/lib/email"

// ─── Validação de assinatura HMAC ─────────────────────────────────────────────

function validateSignature(
  xSignature: string,
  xRequestId: string,
  dataId: string
): boolean {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET
  if (!secret) return false

  // Formato do header: "ts=1704908010,v1=<hash>"
  const parts = Object.fromEntries(
    xSignature.split(",").map((p) => p.split("=") as [string, string])
  )
  const ts = parts["ts"]
  const v1 = parts["v1"]
  if (!ts || !v1) return false

  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`
  const expected = crypto
    .createHmac("sha256", secret)
    .update(manifest)
    .digest("hex")

  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(v1))
  } catch {
    return false
  }
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const xSignature = req.headers.get("x-signature") ?? ""
  const xRequestId = req.headers.get("x-request-id") ?? ""

  const body = await req.json().catch(() => null)
  if (!body) {
    return NextResponse.json({ error: "Body inválido." }, { status: 400 })
  }

  const dataId = String(body?.data?.id ?? "")

  if (!validateSignature(xSignature, xRequestId, dataId)) {
    return NextResponse.json({ error: "Assinatura inválida." }, { status: 401 })
  }

  // Apenas processa notificações de pagamento
  if (body.type !== "payment" || !dataId) {
    return NextResponse.json({ received: true })
  }

  try {
    // Busca o status atualizado do pagamento diretamente na API do MP
    const payment = await mpPayment.get({ id: dataId })

    // Localiza o pedido pelo paymentId
    const order = await prisma.order.findFirst({
      where: { paymentId: dataId },
      include: { user: { select: { name: true, email: true } } },
    })

    if (!order) {
      // Pode ser um pagamento não relacionado a esta loja
      return NextResponse.json({ received: true })
    }

    const { orderStatus, paymentStatus } = mapMpStatus(payment.status ?? undefined)

    await prisma.order.update({
      where: { id: order.id },
      data: { status: orderStatus, paymentStatus },
    })

    // Dispara e-mail de confirmação apenas na transição para APPROVED
    if (paymentStatus === "APPROVED" && order.paymentStatus !== "APPROVED") {
      await sendOrderConfirmationEmail(
        order.user.email ?? "",
        order.user.name ?? "",
        order.id
      )
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error("[webhook/mercadopago]", err)
    // Retorna 200 para evitar reenvios desnecessários do MP
    return NextResponse.json({ received: true })
  }
}
