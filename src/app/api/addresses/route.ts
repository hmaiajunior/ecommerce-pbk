import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const addressSchema = z.object({
  street: z.string().min(3, "Logradouro obrigatório"),
  number: z.string().min(1, "Número obrigatório"),
  complement: z.string().optional(),
  neighborhood: z.string().min(2, "Bairro obrigatório"),
  city: z.string().min(2, "Cidade obrigatória"),
  state: z.string().length(2, "UF deve ter 2 letras").toUpperCase(),
  zipCode: z
    .string()
    .regex(/^\d{5}-?\d{3}$/, "CEP inválido"),
  isDefault: z.boolean().default(false),
})

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 })
  }

  const addresses = await prisma.address.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isDefault: "desc" }, { id: "asc" }],
  })

  return NextResponse.json({ data: addresses })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  if (!body) {
    return NextResponse.json({ error: "Body inválido." }, { status: 400 })
  }

  const parsed = addressSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    )
  }

  const userId = session.user.id
  const data = parsed.data

  const address = await prisma.$transaction(async (tx) => {
    // Se este será o padrão, remove o flag dos demais
    if (data.isDefault) {
      await tx.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      })
    }

    // Se não há endereços ainda, este vira o padrão automaticamente
    const count = await tx.address.count({ where: { userId } })

    return tx.address.create({
      data: { ...data, userId, isDefault: data.isDefault || count === 0 },
    })
  })

  return NextResponse.json({ data: address }, { status: 201 })
}
