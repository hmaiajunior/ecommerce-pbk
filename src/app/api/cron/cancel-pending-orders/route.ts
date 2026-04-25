import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendOrderCancellationEmail } from "@/lib/email"

export async function GET(req: NextRequest) {
  // Valida o secret para evitar chamadas não autorizadas
  const secret = req.headers.get("authorization")?.replace("Bearer ", "")
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const cutoff = new Date(Date.now() - 30 * 60 * 1000) // 30 minutos atrás

  const pendingOrders = await prisma.order.findMany({
    where: {
      status: "PENDING_PAYMENT",
      paymentStatus: "PENDING",
      createdAt: { lt: cutoff },
    },
    include: {
      user: { select: { email: true, name: true } },
      items: {
        include: {
          product: { select: { name: true } },
        },
      },
    },
  })

  if (pendingOrders.length === 0) {
    return NextResponse.json({ cancelled: 0 })
  }

  let cancelled = 0

  for (const order of pendingOrders) {
    try {
      // Cancela o pedido e devolve o estoque atomicamente
      await prisma.$transaction(async (tx) => {
        await tx.order.update({
          where: { id: order.id },
          data: { status: "CANCELLED", paymentStatus: "REJECTED" },
        })

        for (const item of order.items) {
          await tx.productSize.updateMany({
            where: { productId: item.productId, size: item.size },
            data: { stock: { increment: item.quantity } },
          })
        }
      })

      // Envia e-mail de cancelamento
      await sendOrderCancellationEmail(
        order.user.email!,
        order.user.name,
        order.id,
        order.items.map((i) => ({
          name: i.product.name,
          size: i.size,
          quantity: i.quantity,
          price: Number(i.price),
        }))
      )

      cancelled++
    } catch (err) {
      console.error(`[cron] Erro ao cancelar pedido ${order.id}:`, err)
    }
  }

  console.log(`[cron] ${cancelled}/${pendingOrders.length} pedidos cancelados`)
  return NextResponse.json({ cancelled, total: pendingOrders.length })
}
