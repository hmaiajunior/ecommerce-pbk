import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin-guard"
import { invalidateProduct } from "@/lib/cache"
import { deleteProductImage } from "@/lib/r2"

const updateSchema = z.object({
  name: z.string().min(3).optional(),
  description: z.string().optional(),
  fabric: z.string().optional(),
  retailPrice: z.number().positive().optional(),
  wholesalePrice: z.number().positive().optional(),
  wholesaleMinQty: z.number().int().min(1).optional(),
  featured: z.boolean().optional(),
  active: z.boolean().optional(),
  categoryId: z.string().optional(),
  ageRangeId: z.string().optional(),
  sizes: z
    .array(z.object({ size: z.string().min(1), stock: z.number().int().min(0) }))
    .optional(),
})

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin()
  if (error) return error

  const { id } = await params

  const product = await prisma.product.findUnique({ where: { id } })
  if (!product) {
    return NextResponse.json({ error: "Produto não encontrado." }, { status: 404 })
  }

  const body = await req.json().catch(() => null)
  if (!body) {
    return NextResponse.json({ error: "Body inválido." }, { status: 400 })
  }

  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    )
  }

  const { sizes, ...data } = parsed.data

  const updated = await prisma.$transaction(async (tx) => {
    if (sizes) {
      // Recria os tamanhos substituindo os existentes
      await tx.productSize.deleteMany({ where: { productId: id } })
      await tx.productSize.createMany({
        data: sizes.map((s) => ({ ...s, productId: id })),
      })
    }
    return tx.product.update({
      where: { id },
      data,
      include: { sizes: true, images: { orderBy: { position: "asc" } } },
    })
  })

  await invalidateProduct(product.slug)

  return NextResponse.json({ data: updated })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin()
  if (error) return error

  const { id } = await params

  const product = await prisma.product.findUnique({
    where: { id },
    include: { images: true, _count: { select: { orderItems: true } } },
  })
  if (!product) {
    return NextResponse.json({ error: "Produto não encontrado." }, { status: 404 })
  }

  if (product._count.orderItems > 0) {
    // Produto tem histórico — apenas desativa (preserva integridade de pedidos)
    await prisma.product.update({ where: { id }, data: { active: false } })
    await invalidateProduct(product.slug)
    return NextResponse.json({
      data: { message: "Produto desativado (possui pedidos vinculados)." },
    })
  }

  // Sem pedidos: exclui fisicamente e remove imagens do R2
  await prisma.product.delete({ where: { id } })

  await Promise.allSettled(
    product.images.map((img) => {
      const key = img.url.replace(`${process.env.R2_PUBLIC_URL}/`, "")
      return deleteProductImage(key)
    })
  )

  await invalidateProduct(product.slug)

  return new NextResponse(null, { status: 204 })
}
