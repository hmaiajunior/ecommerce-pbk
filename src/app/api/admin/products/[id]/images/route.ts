import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin-guard"
import { uploadProductImage } from "@/lib/r2"
import { invalidateProduct } from "@/lib/cache"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin()
  if (error) return error

  const { id } = await params

  const product = await prisma.product.findUnique({
    where: { id },
    select: { slug: true, _count: { select: { images: true } } },
  })
  if (!product) {
    return NextResponse.json({ error: "Produto não encontrado." }, { status: 404 })
  }

  const formData = await req.formData().catch(() => null)
  if (!formData) {
    return NextResponse.json({ error: "FormData inválido." }, { status: 400 })
  }

  const file = formData.get("file") as File | null
  if (!file || file.size === 0) {
    return NextResponse.json({ error: "Arquivo não enviado." }, { status: 400 })
  }

  const result = await uploadProductImage(file)
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 422 })
  }

  const image = await prisma.productImage.create({
    data: {
      productId: id,
      url: result.url!,
      alt: formData.get("alt") as string | null ?? product.slug,
      position: product._count.images,
    },
  })

  await invalidateProduct(product.slug)

  return NextResponse.json({ data: image }, { status: 201 })
}
