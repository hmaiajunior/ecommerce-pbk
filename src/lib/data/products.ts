import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { withCache } from "@/lib/cache"
import { TTL } from "@/lib/redis"

export const productQuerySchema = z.object({
  category: z.string().optional(),
  ageRange: z.string().optional(),
  size: z.string().optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  sort: z
    .enum(["featured", "price_asc", "price_desc", "newest"])
    .default("featured"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(48).default(24),
})

export type ProductQuery = z.infer<typeof productQuerySchema>

type SortKey = ProductQuery["sort"]

const sortMap: Record<SortKey, object | object[]> = {
  featured: [{ featured: "desc" }, { createdAt: "desc" }],
  price_asc: { retailPrice: "asc" },
  price_desc: { retailPrice: "desc" },
  newest: { createdAt: "desc" },
}

export function maskWholesale<T extends { wholesalePrice: unknown; wholesaleMinQty: unknown }>(
  product: T,
  isWholesale: boolean
): T {
  if (isWholesale) return product
  return { ...product, wholesalePrice: null, wholesaleMinQty: null }
}

export async function getProductsList(params: ProductQuery) {
  const cacheKey = `products:list:${JSON.stringify(params)}`

  return withCache(cacheKey, TTL.product, async () => {
    const where = {
      active: true,
      ...(params.category && { category: { slug: params.category } }),
      ...(params.ageRange && { ageRangeId: params.ageRange }),
      ...(params.size && { sizes: { some: { size: params.size } } }),
      ...((params.minPrice !== undefined || params.maxPrice !== undefined) && {
        retailPrice: {
          ...(params.minPrice !== undefined && { gte: params.minPrice }),
          ...(params.maxPrice !== undefined && { lte: params.maxPrice }),
        },
      }),
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        select: {
          id: true,
          name: true,
          slug: true,
          retailPrice: true,
          wholesalePrice: true,
          wholesaleMinQty: true,
          featured: true,
          category: { select: { id: true, name: true, slug: true } },
          ageRange: { select: { id: true, name: true } },
          images: {
            orderBy: { position: "asc" },
            take: 1,
            select: { url: true, alt: true },
          },
          sizes: {
            where: { stock: { gt: 0 } },
            orderBy: { size: "asc" },
            select: { size: true },
          },
        },
        orderBy: sortMap[params.sort] as any,
        skip: (params.page - 1) * params.limit,
        take: params.limit,
      }),
      prisma.product.count({ where }),
    ])

    return { products, total, pages: Math.ceil(total / params.limit) }
  })
}

export async function getProductBySlug(slug: string) {
  const product = await withCache(`product:${slug}`, TTL.product, async () => {
    const p = await prisma.product.findUnique({
      where: { slug, active: true },
      include: {
        category: true,
        ageRange: true,
        images: { orderBy: { position: "asc" } },
        sizes: { orderBy: { size: "asc" } },
      },
    })

    if (!p) return null

    const related = await prisma.product.findMany({
      where: { active: true, categoryId: p.categoryId, id: { not: p.id } },
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

    return { ...p, related }
  })

  return product
}
