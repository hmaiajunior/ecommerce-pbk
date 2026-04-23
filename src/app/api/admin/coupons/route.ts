import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin-guard"

const createSchema = z.object({
  code: z
    .string()
    .min(3)
    .max(20)
    .regex(/^[A-Z0-9_-]+$/, "Use apenas letras maiúsculas, números, _ ou -")
    .transform((v) => v.toUpperCase()),
  type: z.enum(["PERCENTAGE", "FIXED"]),
  discount: z.number().positive(),
  minOrder: z.number().positive().optional(),
  expiresAt: z.string().datetime().optional().transform((v) => (v ? new Date(v) : undefined)),
  active: z.boolean().default(true),
  usageLimit: z.number().int().min(1).optional(),
})

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  const active = req.nextUrl.searchParams.get("active")

  const coupons = await prisma.coupon.findMany({
    where: {
      ...(active !== null && { active: active === "true" }),
    },
    orderBy: { code: "asc" },
  })

  return NextResponse.json({ data: coupons })
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

  const existing = await prisma.coupon.findUnique({
    where: { code: parsed.data.code },
  })
  if (existing) {
    return NextResponse.json(
      { error: "Já existe um cupom com este código." },
      { status: 409 }
    )
  }

  const coupon = await prisma.coupon.create({ data: parsed.data })

  return NextResponse.json({ data: coupon }, { status: 201 })
}
