import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin-guard"

const updateSchema = z.object({
  status: z
    .enum(["PENDING_PAYMENT", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"])
    .optional(),
  paymentStatus: z
    .enum(["PENDING", "APPROVED", "REJECTED", "REFUNDED"])
    .optional(),
})

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin()
  if (error) return error

  const { id } = await params

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true, role: true } },
      address: true,
      coupon: { select: { code: true, type: true, discount: true } },
      items: {
        include: {
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
    },
  })

  if (!order) {
    return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 })
  }

  return NextResponse.json({ data: order })
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin()
  if (error) return error

  const { id } = await params

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

  const existing = await prisma.order.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 })
  }

  const updated = await prisma.order.update({
    where: { id },
    data: parsed.data,
    select: { id: true, status: true, paymentStatus: true, updatedAt: true },
  })

  return NextResponse.json({ data: updated })
}
