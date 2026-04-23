import { cn } from "@/lib/utils"

type OrderStatus   = "PENDING_PAYMENT" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED"
type PaymentStatus = "PENDING" | "APPROVED" | "REJECTED" | "REFUNDED"

const ORDER_MAP: Record<OrderStatus, { label: string; classes: string }> = {
  PENDING_PAYMENT: { label: "Aguardando pagamento", classes: "bg-accent/20 text-brown-dark"       },
  PROCESSING:      { label: "Em processamento",     classes: "bg-info/15 text-info"               },
  SHIPPED:         { label: "Enviado",              classes: "bg-secondary/20 text-secondary"     },
  DELIVERED:       { label: "Entregue",             classes: "bg-green-100 text-green-700"        },
  CANCELLED:       { label: "Cancelado",            classes: "bg-red-100 text-red-600"            },
}

const PAYMENT_MAP: Record<PaymentStatus, { label: string; classes: string }> = {
  PENDING:  { label: "Pendente",  classes: "bg-accent/20 text-brown-dark"  },
  APPROVED: { label: "Aprovado",  classes: "bg-green-100 text-green-700"   },
  REJECTED: { label: "Recusado",  classes: "bg-red-100 text-red-600"       },
  REFUNDED: { label: "Estornado", classes: "bg-gray-100 text-gray-600"     },
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const { label, classes } = ORDER_MAP[status] ?? ORDER_MAP.PENDING_PAYMENT
  return (
    <span className={cn("px-3 py-1 rounded-pill text-xs font-extrabold", classes)}>
      {label}
    </span>
  )
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const { label, classes } = PAYMENT_MAP[status] ?? PAYMENT_MAP.PENDING
  return (
    <span className={cn("px-3 py-1 rounded-pill text-xs font-extrabold", classes)}>
      {label}
    </span>
  )
}
