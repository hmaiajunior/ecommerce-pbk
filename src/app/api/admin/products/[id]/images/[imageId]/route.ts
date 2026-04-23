import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin-guard"
import { deleteProductImage } from "@/lib/r2"
import { invalidateProduct } from "@/lib/cache"

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  const { error } = await requireAdmin()
  if (error) return error

  const { id, imageId } = await params

  const image = await prisma.productImage.findFirst({
    where: { id: imageId, productId: id },
    include: { product: { select: { slug: true } } },
  })
  if (!image) {
    return NextResponse.json({ error: "Imagem não encontrada." }, { status: 404 })
  }

  await prisma.productImage.delete({ where: { id: imageId } })

  const key = image.url.replace(`${process.env.R2_PUBLIC_URL}/`, "")
  await deleteProductImage(key).catch(console.error)

  await invalidateProduct(image.product.slug)

  return new NextResponse(null, { status: 204 })
}
