import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { withCache } from "@/lib/cache"
import { TTL } from "@/lib/redis"
import { auth } from "@/lib/auth"

type ProductWithRelated = Awaited<ReturnType<typeof fetchProduct>>

async function fetchProduct(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug, active: true },
    include: {
      category: true,
      ageRange: true,
      images: { orderBy: { position: "asc" } },
      sizes: { orderBy: { size: "asc" } },
    },
  })

  if (!product) return null

  const related = await prisma.product.findMany({
    where: {
      active: true,
      categoryId: product.categoryId,
      id: { not: product.id },
    },
    select: {
      id: true,
      name: true,
      slug: true,
      retailPrice: true,
      images: {
        orderBy: { position: "asc" },
        take: 1,
        select: { url: true, alt: true },
      },
      sizes: {
        where: { stock: { gt: 0 } },
        select: { size: true },
      },
    },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take: 4,
  })

  return { ...product, related }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  const session = await auth()
  const isWholesale =
    session?.user.role === "WHOLESALE" && session.user.wholesaleApproved === true

  const product = await withCache<ProductWithRelated>(
    `product:${slug}`,
    TTL.product,
    () => fetchProduct(slug)
  )

  if (!product) {
    return NextResponse.json({ error: "Produto não encontrado." }, { status: 404 })
  }

  return NextResponse.json({
    data: {
      ...product,
      wholesalePrice: isWholesale ? product.wholesalePrice : null,
      wholesaleMinQty: isWholesale ? product.wholesaleMinQty : null,
    },
  })
}
