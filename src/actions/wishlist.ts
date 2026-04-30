"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export type WishlistResult =
  | { ok: true; favorited: boolean }
  | { ok: false; error: string }

export async function toggleWishlist(productId: string): Promise<WishlistResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, error: "Faça login para favoritar produtos." }
  }

  const userId = session.user.id

  const existing = await prisma.wishlist.findUnique({
    where: { userId_productId: { userId, productId } },
  })

  if (existing) {
    await prisma.wishlist.delete({ where: { id: existing.id } })
    revalidatePath("/minha-conta/favoritos")
    return { ok: true, favorited: false }
  }

  await prisma.wishlist.create({
    data: { userId, productId },
  })

  revalidatePath("/minha-conta/favoritos")
  return { ok: true, favorited: true }
}

export async function getWishlistIds(): Promise<string[]> {
  const session = await auth()
  if (!session?.user?.id) return []

  const items = await prisma.wishlist.findMany({
    where: { userId: session.user.id },
    select: { productId: true },
  })

  return items.map((i) => i.productId)
}
