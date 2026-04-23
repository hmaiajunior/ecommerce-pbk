"use client"

import { useQuery } from "@tanstack/react-query"
import { use } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/account/OrderStatusBadge"
import { Skeleton } from "@/components/ui/skeleton"
import { formatPrice } from "@/lib/utils"

const METHOD_LABEL: Record<string, string> = {
  pix: "Pix", credit_card: "Cartão de crédito", boleto: "Boleto",
}

export default function PedidoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data, isLoading } = useQuery({
    queryKey: ["order", id],
    queryFn: async () => {
      const res = await fetch(`/api/orders/${id}`)
      if (!res.ok) return null
      const json = await res.json()
      return json.data
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/minha-conta/pedidos" className="text-brown-muted hover:text-primary transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="font-black text-[24px] text-brown-dark">
          {isLoading ? "Carregando..." : `Pedido #${id.slice(-8).toUpperCase()}`}
        </h1>
      </div>

      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full rounded-card" />
          <Skeleton className="h-40 w-full rounded-card" />
          <Skeleton className="h-32 w-full rounded-card" />
        </div>
      )}

      {!isLoading && !data && (
        <div className="text-center py-16">
          <p className="font-extrabold text-brown-dark">Pedido não encontrado.</p>
          <Link href="/minha-conta/pedidos" className="text-primary text-sm font-bold hover:underline mt-2 block">← Voltar aos pedidos</Link>
        </div>
      )}

      {!isLoading && data && (
        <>
          {/* Status */}
          <div className="bg-white rounded-card shadow-[var(--shadow-card)] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-brown-muted mb-1">Status do pedido</p>
              <OrderStatusBadge status={data.status} />
            </div>
            <div className="text-left sm:text-right">
              <p className="text-xs font-black uppercase tracking-wider text-brown-muted mb-1">Pagamento</p>
              <div className="flex items-center gap-2 sm:justify-end flex-wrap">
                <PaymentStatusBadge status={data.paymentStatus} />
                {data.paymentMethod && (
                  <span className="text-xs font-bold text-brown-muted">
                    {METHOD_LABEL[data.paymentMethod] ?? data.paymentMethod}
                  </span>
                )}
              </div>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-xs font-black uppercase tracking-wider text-brown-muted mb-1">Data</p>
              <p className="font-bold text-sm text-brown-dark">
                {new Date(data.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
              </p>
            </div>
          </div>

          {/* Itens */}
          <div className="bg-white rounded-card shadow-[var(--shadow-card)] p-5">
            <p className="font-black text-[15px] text-brown-dark mb-4">Itens do pedido</p>
            <div className="divide-y divide-bg-nude">
              {data.items.map((item: any) => (
                <div key={item.id} className="flex gap-4 py-3">
                  <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-bg-blush shrink-0">
                    {item.product?.images?.[0]?.url ? (
                      <Image src={item.product.images[0].url} alt={item.product.name} fill sizes="56px" className="object-cover" />
                    ) : (
                      <span className="w-full h-full flex items-center justify-center text-xl">👕</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/produto/${item.product.slug}`} className="font-extrabold text-sm text-brown-dark hover:text-primary transition-colors">
                      {item.product.name}
                    </Link>
                    <p className="font-semibold text-xs text-brown-muted mt-0.5">
                      Tam. {item.size} · Qtd. {item.quantity}
                    </p>
                  </div>
                  <span className="font-extrabold text-sm text-brown-dark shrink-0">
                    {formatPrice(Number(item.price) * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Endereço + Totais */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-card shadow-[var(--shadow-card)] p-5">
              <p className="font-black text-[15px] text-brown-dark mb-3">Endereço de entrega</p>
              <p className="font-semibold text-sm text-brown-mid">
                {data.address.street}, {data.address.number}
                {data.address.complement && ` — ${data.address.complement}`}
              </p>
              <p className="font-semibold text-sm text-brown-muted">
                {data.address.neighborhood} · {data.address.city}/{data.address.state}
              </p>
              <p className="font-semibold text-sm text-brown-muted">CEP {data.address.zipCode}</p>
            </div>

            <div className="bg-white rounded-card shadow-[var(--shadow-card)] p-5 space-y-2">
              <p className="font-black text-[15px] text-brown-dark mb-3">Resumo financeiro</p>
              <div className="flex justify-between text-sm font-semibold text-brown-muted">
                <span>Subtotal</span>
                <span>{formatPrice(Number(data.total) - Number(data.shippingCost))}</span>
              </div>
              {data.coupon && (
                <div className="flex justify-between text-sm font-bold text-primary">
                  <span>Cupom {data.coupon.code}</span>
                  <span>— desconto</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-semibold text-brown-muted">
                <span>Frete</span>
                <span>{formatPrice(Number(data.shippingCost))}</span>
              </div>
              <div className="flex justify-between font-black text-base text-brown-dark border-t border-bg-nude pt-2">
                <span>Total</span>
                <span>{formatPrice(Number(data.total))}</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
