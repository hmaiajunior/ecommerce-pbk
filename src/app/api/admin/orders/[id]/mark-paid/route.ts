import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin-guard"
import { sendOrderConfirmationEmail } from "@/lib/email"

// ─── POST /api/admin/orders/[id]/mark-paid ───────────────────────────────────
// Dá baixa manual num pedido quando o webhook de pagamento não chegou
// (ex: falha de entrega, pagamento fora do InfinitePay, reconciliação).
// Só executa se o pedido estiver em PENDING_PAYMENT para evitar sobrescrita
// acidental de pedidos já aprovados/cancelados.

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requireAdmin()
  if (error) return error

  const { id } = await params

  const order = await prisma.order.findUnique({
    where: { id },
    include: { user: { select: { name: true, email: true } } },
  })

  if (!order) {
    return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 })
  }

  if (order.paymentStatus === "APPROVED") {
    return NextResponse.json(
      { error: "Este pedido já está marcado como pago." },
      { status: 409 }
    )
  }

  if (order.status === "CANCELLED") {
    return NextResponse.json(
      { error: "Não é possível dar baixa em um pedido cancelado." },
      { status: 409 }
    )
  }

  const body = await req.json().catch(() => ({})) as { note?: string }
  const note = typeof body?.note === "string" ? body.note.slice(0, 200) : null

  const updated = await prisma.order.update({
    where: { id },
    data: {
      status: "PROCESSING",
      paymentStatus: "APPROVED",
      paymentMethod: order.paymentMethod ?? "manual",
    },
    select: { id: true, status: true, paymentStatus: true, updatedAt: true },
  })

  console.log(
    `[admin/mark-paid] pedido ${order.id} marcado como pago por ${session.user.email}${note ? ` — nota: ${note}` : ""}`
  )

  try {
    await sendOrderConfirmationEmail(
      order.user.email ?? "",
      order.user.name ?? "",
      order.id
    )
  } catch (err) {
    console.error("[admin/mark-paid] falha ao enviar e-mail:", err)
  }

  return NextResponse.json({ data: updated })
}
