import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { calculateShipping } from "@/lib/melhorenvio"

const bodySchema = z.object({
  zipCode: z
    .string()
    .regex(/^\d{5}-?\d{3}$/, "CEP inválido. Use o formato 00000-000"),
  items: z
    .array(
      z.object({
        productId: z.string(),
        size: z.string(),
        quantity: z.number().int().min(1),
      })
    )
    .min(1, "Informe ao menos um item"),
})

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body) {
    return NextResponse.json({ error: "Body inválido." }, { status: 400 })
  }

  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    )
  }

  try {
    const quotes = await calculateShipping(
      parsed.data.zipCode,
      parsed.data.items
    )

    if (quotes.length === 0) {
      return NextResponse.json(
        { error: "Nenhuma opção de frete disponível para este CEP." },
        { status: 422 }
      )
    }

    return NextResponse.json({ data: quotes })
  } catch {
    return NextResponse.json(
      { error: "Não foi possível calcular o frete. Tente novamente." },
      { status: 502 }
    )
  }
}
