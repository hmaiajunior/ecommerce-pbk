import type { OrderStatus, PaymentStatus } from "@prisma/client"

const INFINITEPAY_API_URL = "https://api.infinitepay.io"

export type InfinitePayItem = {
  quantity: number
  price: number // em centavos
  description: string
}

export type CreateCheckoutLinkInput = {
  items: InfinitePayItem[]
  orderNsu: string // id interno do pedido (correlação no webhook e retorno)
  redirectUrl: string
  webhookUrl: string
  customer?: {
    name: string
    email: string
    phoneNumber?: string
  }
  address?: {
    cep: string
    street: string
    neighborhood: string
    number: string
    complement?: string
  }
}

export type CreateCheckoutLinkResponse = {
  // A API devolve o link de checkout para onde redirecionar o cliente.
  // Nomenclatura exata do campo não está 100% documentada publicamente,
  // por isso mantemos o tipo amplo e tentamos os candidatos conhecidos.
  url?: string
  checkout_url?: string
  link?: string
  [key: string]: unknown
}

export async function createCheckoutLink(
  input: CreateCheckoutLinkInput
): Promise<string> {
  const handle = process.env.INFINITEPAY_HANDLE
  if (!handle) throw new Error("INFINITEPAY_HANDLE não configurado")

  const body = {
    handle,
    items: input.items,
    order_nsu: input.orderNsu,
    redirect_url: input.redirectUrl,
    webhook_url: input.webhookUrl,
    ...(input.customer && {
      customer: {
        name: input.customer.name,
        email: input.customer.email,
        ...(input.customer.phoneNumber && { phone_number: input.customer.phoneNumber }),
      },
    }),
    ...(input.address && { address: input.address }),
  }

  const res = await fetch(
    `${INFINITEPAY_API_URL}/invoices/public/checkout/links`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  )

  const json = (await res.json().catch(() => null)) as
    | CreateCheckoutLinkResponse
    | null

  if (!res.ok || !json) {
    throw new Error(
      `InfinitePay API error ${res.status}: ${JSON.stringify(json)}`
    )
  }

  const url = json.url ?? json.checkout_url ?? json.link
  if (typeof url !== "string" || !url.startsWith("http")) {
    throw new Error(
      `InfinitePay devolveu resposta sem URL de checkout: ${JSON.stringify(json)}`
    )
  }
  return url
}

// ─── Mapeamento de métodos e status ───────────────────────────────────────────

type StatusMap = { orderStatus: OrderStatus; paymentStatus: PaymentStatus }

// O checkout público da InfinitePay só dispara webhook quando o pagamento é
// confirmado (capture_method = "credit_card" | "pix"). Para qualquer um destes,
// tratamos como APPROVED.
export function mapInfinitePayCapture(capture: string | undefined): StatusMap {
  if (capture === "credit_card" || capture === "pix") {
    return { orderStatus: "PROCESSING", paymentStatus: "APPROVED" }
  }
  return { orderStatus: "PENDING_PAYMENT", paymentStatus: "PENDING" }
}

export function mapInfinitePayMethod(capture: string | undefined): string {
  if (capture === "credit_card") return "credit_card"
  if (capture === "pix") return "pix"
  return capture ?? "unknown"
}
