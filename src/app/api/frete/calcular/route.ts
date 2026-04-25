import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { calculateShipping, type ShippingQuote } from "@/lib/melhorenvio"

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

// Opções customizadas via variável de ambiente
// Formato: JSON array ex: [{"service":"Excursão","company":"Loja","price":15,"deliveryDays":3}]
function getCustomOptions(): ShippingQuote[] {
  try {
    const raw = process.env.CUSTOM_SHIPPING_OPTIONS
    console.log("[frete] CUSTOM_SHIPPING_OPTIONS:", raw)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return parsed.map((o: any, i: number) => ({
      id: -(i + 1),
      service: o.service,
      company: o.company ?? "Loja",
      price: Number(o.price),
      deliveryDays: Number(o.deliveryDays ?? 0),
    }))
  } catch (err) {
    console.error("[frete] Erro ao parsear CUSTOM_SHIPPING_OPTIONS:", err)
    return []
  }
}

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

  const customOptions = getCustomOptions()

  try {
    const quotes = await calculateShipping(
      parsed.data.zipCode,
      parsed.data.items
    )

    const all = [...customOptions, ...quotes]

    if (all.length === 0) {
      return NextResponse.json(
        { error: "Nenhuma opção de frete disponível para este CEP." },
        { status: 422 }
      )
    }

    return NextResponse.json({ data: all })
  } catch (err) {
    console.error("[frete/calcular]", err)

    // Se o Melhor Envio falhar mas houver opções customizadas, retorna elas
    if (customOptions.length > 0) {
      return NextResponse.json({ data: customOptions })
    }

    return NextResponse.json(
      { error: "Não foi possível calcular o frete. Tente novamente.", detail: String(err) },
      { status: 502 }
    )
  }
}
