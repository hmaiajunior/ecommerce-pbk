"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { invalidateByPattern, invalidateProduct } from "@/lib/cache"

// ─── Types ────────────────────────────────────────────────────────────────────

export type CheckoutItem = {
  productId: string
  size: string
  quantity: number
  price: number // preço unitário no momento da compra (varejo ou atacado)
}

export type CreateOrderInput = {
  items: CheckoutItem[]
  addressId: string
  shippingService: string
  shippingCost: number
  couponCode?: string
}

export type CouponResult =
  | { discount: number; couponId: string }
  | { error: string }

export type CreateOrderResult =
  | { orderId: string }
  | { error: string }

// ─── applyCoupon ──────────────────────────────────────────────────────────────

export async function applyCoupon(
  code: string,
  subtotal: number
): Promise<CouponResult> {
  const coupon = await prisma.coupon.findUnique({
    where: { code: code.trim().toUpperCase(), active: true },
  })

  if (!coupon) return { error: "Cupom inválido ou inativo." }

  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    return { error: "Este cupom está expirado." }
  }

  if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
    return { error: "Este cupom já foi totalmente utilizado." }
  }

  if (coupon.minOrder !== null && subtotal < Number(coupon.minOrder)) {
    const formatted = Number(coupon.minOrder).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
    return { error: `Pedido mínimo de ${formatted} para usar este cupom.` }
  }

  const discount =
    coupon.type === "PERCENTAGE"
      ? subtotal * (Number(coupon.discount) / 100)
      : Math.min(Number(coupon.discount), subtotal)

  return { discount: parseFloat(discount.toFixed(2)), couponId: coupon.id }
}

// ─── createOrder ──────────────────────────────────────────────────────────────

export async function createOrder(
  input: CreateOrderInput
): Promise<CreateOrderResult> {
  const session = await auth()
  if (!session?.user?.id) return { error: "Não autenticado." }

  const userId = session.user.id

  // Valida que o endereço pertence ao usuário
  const address = await prisma.address.findFirst({
    where: { id: input.addressId, userId },
  })
  if (!address) return { error: "Endereço não encontrado." }

  // Resolve cupom antes da transação
  let couponId: string | null = null
  let couponDiscount = 0

  if (input.couponCode?.trim()) {
    const subtotal = input.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    )
    const result = await applyCoupon(input.couponCode, subtotal)
    if ("error" in result) return { error: result.error }
    couponId = result.couponId
    couponDiscount = result.discount
  }

  const subtotal = input.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )
  const total = parseFloat(
    (subtotal - couponDiscount + input.shippingCost).toFixed(2)
  )

  try {
    const order = await prisma.$transaction(async (tx) => {
      // Valida estoque e move para reserva atomicamente
      for (const item of input.items) {
        const productSize = await tx.productSize.findUnique({
          where: {
            productId_size: { productId: item.productId, size: item.size },
          },
          select: { stock: true },
        })

        if (!productSize || productSize.stock < item.quantity) {
          const available = productSize?.stock ?? 0
          throw new Error(
            `Estoque insuficiente: tamanho ${item.size} — disponível ${available}, solicitado ${item.quantity}.`
          )
        }

        await tx.productSize.update({
          where: {
            productId_size: { productId: item.productId, size: item.size },
          },
          data: {
            stock: { decrement: item.quantity },
            stockReserved: { increment: item.quantity },
          },
        })
      }

      // Incrementa uso do cupom
      if (couponId) {
        await tx.coupon.update({
          where: { id: couponId },
          data: { usageCount: { increment: 1 } },
        })
      }

      // Cria o pedido com seus itens
      return tx.order.create({
        data: {
          userId,
          addressId: input.addressId,
          shippingCost: input.shippingCost,
          total,
          couponId,
          items: {
            create: input.items.map((item) => ({
              productId: item.productId,
              size: item.size,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        select: { id: true },
      })
    })

    // Invalida cache dos produtos com estoque alterado
    const slugs = await prisma.product.findMany({
      where: { id: { in: input.items.map((i) => i.productId) } },
      select: { slug: true },
    })
    await Promise.all(slugs.map((p) => invalidateProduct(p.slug)))

    return { orderId: order.id }
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro ao criar pedido. Tente novamente."
    return { error: message }
  }
}
