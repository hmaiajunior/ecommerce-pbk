import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createCheckoutLink } from "@/lib/infinitepay"

// ─── Schema ───────────────────────────────────────────────────────────────────

const bodySchema = z.object({
  orderId: z.string(),
})

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    )
  }

  const order = await prisma.order.findFirst({
    where: { id: parsed.data.orderId, userId: session.user.id },
    include: {
      address: true,
      user: { select: { name: true, email: true } },
      items: { include: { product: { select: { name: true } } } },
    },
  })

  if (!order) {
    return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 })
  }

  if (order.status !== "PENDING_PAYMENT") {
    return NextResponse.json(
      { error: "Este pedido já possui um pagamento em andamento." },
      { status: 409 }
    )
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  const webhookSecret = process.env.INFINITEPAY_WEBHOOK_SECRET

  if (!appUrl || !webhookSecret) {
    console.error("[create-payment] variáveis de ambiente faltando")
    return NextResponse.json(
      { error: "Configuração de pagamento indisponível." },
      { status: 500 }
    )
  }

  // InfinitePay trabalha com preços em centavos (integer)
  const items = order.items.map((item) => ({
    quantity: item.quantity,
    price: Math.round(Number(item.price) * 100),
    description: item.product.name,
  }))

  // O frete é adicionado como um item extra para compor o total exato
  const shippingCents = Math.round(Number(order.shippingCost) * 100)
  if (shippingCents > 0) {
    items.push({
      quantity: 1,
      price: shippingCents,
      description: "Frete",
    })
  }

  const redirectUrl = `${appUrl}/minha-conta/pedidos/${order.id}`
  const webhookUrl = `${appUrl}/api/webhook/infinitepay?secret=${webhookSecret}`

  try {
    const checkoutUrl = await createCheckoutLink({
      items,
      orderNsu: order.id,
      redirectUrl,
      webhookUrl,
      customer: {
        name: order.user.name ?? "Cliente",
        email: order.user.email ?? "",
      },
      address: {
        cep: order.address.zipCode.replace(/\D/g, ""),
        street: order.address.street,
        neighborhood: order.address.neighborhood,
        number: order.address.number,
        ...(order.address.complement && { complement: order.address.complement }),
      },
    })

    await prisma.order.update({
      where: { id: order.id },
      data: { paymentMethod: "infinitepay_checkout" },
    })

    return NextResponse.json({ data: { checkoutUrl } }, { status: 201 })
  } catch (err) {
    console.error("[create-payment]", err)
    return NextResponse.json(
      { error: "Erro ao iniciar pagamento. Tente novamente." },
      { status: 502 }
    )
  }
}
