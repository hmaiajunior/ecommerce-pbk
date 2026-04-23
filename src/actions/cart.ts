"use server"

import { prisma } from "@/lib/prisma"

export type CartItemInput = {
  productId: string
  size: string
  quantity: number
}

export type StockError = {
  productId: string
  size: string
  available: number
  requested: number
}

/**
 * Verifica se todos os itens do carrinho têm estoque suficiente.
 * Deve ser chamada antes de renderizar o checkout.
 */
export async function validateCartStock(
  items: CartItemInput[]
): Promise<{ valid: boolean; errors: StockError[] }> {
  const errors: StockError[] = []

  await Promise.all(
    items.map(async (item) => {
      const productSize = await prisma.productSize.findUnique({
        where: {
          productId_size: { productId: item.productId, size: item.size },
        },
        select: { stock: true },
      })

      if (!productSize || productSize.stock < item.quantity) {
        errors.push({
          productId: item.productId,
          size: item.size,
          available: productSize?.stock ?? 0,
          requested: item.quantity,
        })
      }
    })
  )

  return { valid: errors.length === 0, errors }
}
