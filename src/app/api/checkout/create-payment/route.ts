import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { mpPayment, mapMpStatus } from "@/lib/mercadopago"
import { sendOrderConfirmationEmail } from "@/lib/email"

// ─── Schemas ──────────────────────────────────────────────────────────────────

const pixSchema = z.object({
  method: z.literal("pix"),
  orderId: z.string(),
})

const creditCardSchema = z.object({
  method: z.literal("credit_card"),
  orderId: z.string(),
  cardToken: z.string(),
  installments: z.number().int().min(1).max(12),
  paymentMethodId: z.string(), // "visa", "master", etc.
})

const boletoSchema = z.object({
  method: z.literal("boleto"),
  orderId: z.string(),
  payerCpf: z.string().regex(/^\d{11}$/, "CPF deve conter 11 dígitos"),
})

const bodySchema = z.discriminatedUnion("method", [
  pixSchema,
  creditCardSchema,
  boletoSchema,
])

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 })
  }

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

  const input = parsed.data

  // Busca o pedido e valida que pertence ao usuário logado
  const order = await prisma.order.findFirst({
    where: { id: input.orderId, userId: session.user.id },
    include: {
      address: true,
      user: { select: { name: true, email: true } },
    },
  })

  if (!order) {
    return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 })
  }

  if (order.status !== "PENDING_PAYMENT") {
    return NextResponse.json(
      { error: "Este pedido já possui um pagamento em andamento." },
      { status: 409 }
    )
  }

  const shortId = order.id.slice(-8).toUpperCase()
  const description = `Pedido Playbekids #${shortId}`
  const [firstName, ...rest] = (order.user.name ?? "Cliente").split(" ")
  const lastName = rest.join(" ") || firstName
  const email = order.user.email ?? ""
  const totalAmount = parseFloat(String(order.total))

  try {
    let responseData: Record<string, unknown>

    if (input.method === "pix") {
      const result = await mpPayment.create({
        body: {
          transaction_amount: totalAmount,
          description,
          payment_method_id: "pix",
          payer: { email, first_name: firstName, last_name: lastName },
        },
        requestOptions: { idempotencyKey: order.id },
      })

      await prisma.order.update({
        where: { id: order.id },
        data: { paymentId: String(result.id), paymentMethod: "pix" },
      })

      responseData = {
        paymentId: result.id,
        qrCode: result.point_of_interaction?.transaction_data?.qr_code,
        qrCodeBase64: result.point_of_interaction?.transaction_data?.qr_code_base64,
        expiresAt: result.date_of_expiration,
      }
    } else if (input.method === "credit_card") {
      const result = await mpPayment.create({
        body: {
          transaction_amount: totalAmount,
          token: input.cardToken,
          description,
          installments: input.installments,
          payment_method_id: input.paymentMethodId,
          payer: { email },
        },
        requestOptions: { idempotencyKey: order.id },
      })

      const { orderStatus, paymentStatus } = mapMpStatus(result.status ?? undefined)

      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentId: String(result.id),
          paymentMethod: "credit_card",
          status: orderStatus,
          paymentStatus,
        },
      })

      // Pagamento de cartão pode ser aprovado imediatamente
      if (paymentStatus === "APPROVED") {
        await sendOrderConfirmationEmail(email, order.user.name ?? "", order.id)
      }

      responseData = {
        paymentId: result.id,
        status: result.status,
        statusDetail: result.status_detail,
      }
    } else {
      // boleto
      const result = await mpPayment.create({
        body: {
          transaction_amount: totalAmount,
          description,
          payment_method_id: "bolbradesco",
          payer: {
            email,
            first_name: firstName,
            last_name: lastName,
            identification: { type: "CPF", number: input.payerCpf },
            address: {
              zip_code: order.address.zipCode.replace(/\D/g, ""),
              street_name: order.address.street,
              street_number: order.address.number,
              neighborhood: order.address.neighborhood,
              city: order.address.city,
              federal_unit: order.address.state,
            },
          },
        },
        requestOptions: { idempotencyKey: order.id },
      })

      await prisma.order.update({
        where: { id: order.id },
        data: { paymentId: String(result.id), paymentMethod: "boleto" },
      })

      responseData = {
        paymentId: result.id,
        boletoUrl: result.transaction_details?.external_resource_url,
        barcode: result.barcode?.content,
        expiresAt: result.date_of_expiration,
      }
    }

    return NextResponse.json({ data: responseData }, { status: 201 })
  } catch (err) {
    console.error("[create-payment]", err)
    return NextResponse.json(
      { error: "Erro ao processar pagamento. Tente novamente." },
      { status: 502 }
    )
  }
}
