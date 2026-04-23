import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin-guard"

const updateSchema = z.object({
  type: z.enum(["PERCENTAGE", "FIXED"]).optional(),
  discount: z.number().positive().optional(),
  minOrder: z.number().positive().optional(),
  expiresAt: z.string().datetime().optional().transform((v) => (v ? new Date(v) : undefined)),
  active: z.boolean().optional(),
  usageLimit: z.number().int().min(1).optional(),
})

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin()
  if (error) return error

  const { id } = await params

  const existing = await prisma.coupon.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: "Cupom não encontrado." }, { status: 404 })
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

  const coupon = await prisma.coupon.update({
    where: { id },
    data: parsed.data,
  })

  return NextResponse.json({ data: coupon })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin()
  if (error) return error

  const { id } = await params

  const existing = await prisma.coupon.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: "Cupom não encontrado." }, { status: 404 })
  }

  // Soft delete — preserva o histórico de pedidos que usaram o cupom
  await prisma.coupon.update({ where: { id }, data: { active: false } })

  return new NextResponse(null, { status: 204 })
}
