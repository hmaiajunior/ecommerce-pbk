import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin-guard"
import { invalidateProduct, invalidateByPattern } from "@/lib/cache"
import { toSlug } from "@/lib/utils"

const querySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  active: z.enum(["true", "false", "all"]).default("all"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
})

const createSchema = z.object({
  name: z.string().min(3),
  slug: z.string().optional(),
  description: z.string().optional(),
  fabric: z.string().optional(),
  retailPrice: z.number().positive(),
  wholesalePrice: z.number().positive().optional(),
  wholesaleMinQty: z.number().int().min(1).optional(),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
  categoryId: z.string(),
  ageRangeId: z.string(),
  sizes: z
    .array(z.object({ size: z.string().min(1), stock: z.number().int().min(0) }))
    .optional(),
})

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  const parsed = querySchema.safeParse(
    Object.fromEntries(req.nextUrl.searchParams)
  )
  if (!parsed.success) {
    return NextResponse.json({ error: "Parâmetros inválidos." }, { status: 400 })
  }

  const { search, category, active, page, limit } = parsed.data

  const where = {
    ...(active !== "all" && { active: active === "true" }),
    ...(category && { category: { slug: category } }),
    ...(search && {
      name: { contains: search, mode: "insensitive" as const },
    }),
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        ageRange: { select: { id: true, name: true } },
        images: { orderBy: { position: "asc" }, take: 1 },
        sizes: { orderBy: { size: "asc" } },
        _count: { select: { orderItems: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where }),
  ])

  return NextResponse.json({
    data: products,
    meta: { total, page, limit, pages: Math.ceil(total / limit) },
  })
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  const body = await req.json().catch(() => null)
  if (!body) {
    return NextResponse.json({ error: "Body inválido." }, { status: 400 })
  }

  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    )
  }

  const { sizes, ...data } = parsed.data
  const slug = data.slug ?? toSlug(data.name)

  const existing = await prisma.product.findUnique({ where: { slug } })
  if (existing) {
    return NextResponse.json(
      { error: "Já existe um produto com este slug." },
      { status: 409 }
    )
  }

  const product = await prisma.product.create({
    data: {
      ...data,
      slug,
      ...(sizes && {
        sizes: { create: sizes },
      }),
    },
    include: {
      category: true,
      ageRange: true,
      sizes: true,
    },
  })

  await invalidateByPattern("products:list:*")

  return NextResponse.json({ data: product }, { status: 201 })
}
