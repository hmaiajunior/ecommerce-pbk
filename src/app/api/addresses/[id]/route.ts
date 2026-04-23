import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const updateSchema = z.object({
  street: z.string().min(3).optional(),
  number: z.string().min(1).optional(),
  complement: z.string().optional(),
  neighborhood: z.string().min(2).optional(),
  city: z.string().min(2).optional(),
  state: z.string().length(2).toUpperCase().optional(),
  zipCode: z.string().regex(/^\d{5}-?\d{3}$/).optional(),
  isDefault: z.boolean().optional(),
})

async function resolveParams(params: Promise<{ id: string }>) {
  return params
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 })
  }

  const { id } = await resolveParams(params)
  const userId = session.user.id

  const existing = await prisma.address.findFirst({ where: { id, userId } })
  if (!existing) {
    return NextResponse.json({ error: "Endereço não encontrado." }, { status: 404 })
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

  const data = parsed.data

  const address = await prisma.$transaction(async (tx) => {
    if (data.isDefault) {
      await tx.address.updateMany({
        where: { userId, isDefault: true, id: { not: id } },
        data: { isDefault: false },
      })
    }
    return tx.address.update({ where: { id }, data })
  })

  return NextResponse.json({ data: address })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 })
  }

  const { id } = await resolveParams(params)
  const userId = session.user.id

  const existing = await prisma.address.findFirst({ where: { id, userId } })
  if (!existing) {
    return NextResponse.json({ error: "Endereço não encontrado." }, { status: 404 })
  }

  // Impede excluir endereço vinculado a pedidos
  const ordersCount = await prisma.order.count({ where: { addressId: id } })
  if (ordersCount > 0) {
    return NextResponse.json(
      { error: "Este endereço está vinculado a pedidos e não pode ser excluído." },
      { status: 409 }
    )
  }

  await prisma.$transaction(async (tx) => {
    await tx.address.delete({ where: { id } })

    // Se era o padrão, promove o endereço mais antigo restante
    if (existing.isDefault) {
      const next = await tx.address.findFirst({
        where: { userId },
        orderBy: { id: "asc" },
      })
      if (next) {
        await tx.address.update({
          where: { id: next.id },
          data: { isDefault: true },
        })
      }
    }
  })

  return new NextResponse(null, { status: 204 })
}
