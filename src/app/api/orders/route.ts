import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(20).default(10),
})

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 })
  }

  const parsed = querySchema.safeParse(
    Object.fromEntries(req.nextUrl.searchParams)
  )
  if (!parsed.success) {
    return NextResponse.json({ error: "Parâmetros inválidos." }, { status: 400 })
  }

  const { page, limit } = parsed.data
  const userId = session.user.id

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        status: true,
        paymentStatus: true,
        paymentMethod: true,
        total: true,
        shippingCost: true,
        createdAt: true,
        items: {
          take: 1,
          select: {
            quantity: true,
            size: true,
            product: {
              select: {
                name: true,
                slug: true,
                images: {
                  take: 1,
                  orderBy: { position: "asc" },
                  select: { url: true, alt: true },
                },
              },
            },
          },
        },
        _count: { select: { items: true } },
      },
    }),
    prisma.order.count({ where: { userId } }),
  ])

  return NextResponse.json({
    data: orders,
    meta: { total, page, limit, pages: Math.ceil(total / limit) },
  })
}
