"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

type CartSnapshotItem = {
  productId: string
  slug: string
  name: string
  size: string
  quantity: number
  price: number
  imageUrl: string | null
}

const MAX_ITEMS = 50

export async function saveCartSnapshot(items: CartSnapshotItem[]): Promise<void> {
  const session = await auth()
  if (!session?.user?.id) return
  if (!Array.isArray(items) || items.length === 0) {
    // Carrinho vazio: descarta snapshot existente, se houver
    await prisma.abandonedCart
      .delete({ where: { userId: session.user.id } })
      .catch(() => null)
    return
  }

  const sanitized = items.slice(0, MAX_ITEMS).map((i) => ({
    productId: String(i.productId),
    slug: String(i.slug),
    name: String(i.name),
    size: String(i.size),
    quantity: Math.max(1, Math.floor(Number(i.quantity) || 1)),
    price: Number(i.price) || 0,
    imageUrl: i.imageUrl ?? null,
  }))

  const subtotal = sanitized.reduce((sum, i) => sum + i.price * i.quantity, 0)

  await prisma.abandonedCart.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      items: sanitized,
      subtotal,
    },
    update: {
      items: sanitized,
      subtotal,
      // Se o carrinho mudou após o envio de e-mail, permitimos novo envio
      // apenas após o cooldown — controlado no cron via emailSentAt.
    },
  })
}

export async function clearCartSnapshot(): Promise<void> {
  const session = await auth()
  if (!session?.user?.id) return
  await prisma.abandonedCart
    .delete({ where: { userId: session.user.id } })
    .catch(() => null)
}
