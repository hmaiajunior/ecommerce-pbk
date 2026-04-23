import { MercadoPagoConfig, Payment } from "mercadopago"

export const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
  options: { timeout: 5000 },
})

export const mpPayment = new Payment(mpClient)

// ─── Mapeamento de status ─────────────────────────────────────────────────────

import type { OrderStatus, PaymentStatus } from "@prisma/client"

type StatusMap = { orderStatus: OrderStatus; paymentStatus: PaymentStatus }

export function mapMpStatus(mpStatus: string | undefined): StatusMap {
  switch (mpStatus) {
    case "approved":
      return { orderStatus: "PROCESSING", paymentStatus: "APPROVED" }
    case "rejected":
    case "cancelled":
      return { orderStatus: "CANCELLED", paymentStatus: "REJECTED" }
    case "refunded":
    case "charged_back":
      return { orderStatus: "CANCELLED", paymentStatus: "REFUNDED" }
    default:
      return { orderStatus: "PENDING_PAYMENT", paymentStatus: "PENDING" }
  }
}
