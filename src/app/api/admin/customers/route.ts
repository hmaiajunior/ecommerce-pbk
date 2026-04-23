import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin-guard"

const querySchema = z.object({
  role: z.enum(["RETAIL", "WHOLESALE", "all"]).default("all"),
  wholesalePending: z.enum(["true", "false"]).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
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

  const { role, wholesalePending, search, page, limit } = parsed.data

  const where = {
    role: { not: "ADMIN" as const },
    ...(role !== "all" && { role: role as "RETAIL" | "WHOLESALE" }),
    ...(wholesalePending === "true" && {
      role: "WHOLESALE" as const,
      wholesaleApproved: false,
    }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" as const } },
        { email: { contains: search, mode: "insensitive" as const } },
      ],
    }),
  }

  const [customers, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        wholesaleApproved: true,
        createdAt: true,
        _count: { select: { orders: true } },
      },
    }),
    prisma.user.count({ where }),
  ])

  return NextResponse.json({
    data: customers,
    meta: { total, page, limit, pages: Math.ceil(total / limit) },
  })
}
