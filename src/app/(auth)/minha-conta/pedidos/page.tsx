"use client"

import Link from "next/link"
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { ArrowRight, Package } from "lucide-react"
import { OrderStatusBadge } from "@/components/account/OrderStatusBadge"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/utils"
import Image from "next/image"

async function fetchOrders(page: number) {
  const res = await fetch(`/api/orders?page=${page}&limit=10`)
  if (!res.ok) return { data: [], meta: { total: 0, pages: 0 } }
  return res.json()
}

const METHOD_LABEL: Record<string, string> = {
  pix: "Pix", credit_card: "Cartão de crédito", boleto: "Boleto",
}

export default function PedidosPage() {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useQuery({
    queryKey: ["orders", page],
    queryFn: () => fetchOrders(page),
  })

  const orders = data?.data ?? []
  const meta   = data?.meta ?? { total: 0, pages: 0 }

  return (
    <div className="space-y-6">
      <h1 className="font-black text-[26px] text-brown-dark">Meus pedidos</h1>

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-card" />
          ))}
        </div>
      )}

      {!isLoading && orders.length === 0 && (
        <div className="text-center py-16 bg-white rounded-card shadow-[var(--shadow-card)] space-y-4">
          <Package size={48} className="mx-auto text-brown-muted opacity-30" />
          <p className="font-extrabold text-lg text-brown-dark">Nenhum pedido ainda</p>
          <p className="font-semibold text-sm text-brown-muted">Seu histórico aparecerá aqui após a primeira compra.</p>
          <Button asChild><Link href="/produtos">Explorar loja</Link></Button>
        </div>
      )}

      {!isLoading && orders.length > 0 && (
        <div className="space-y-3">
          {orders.map((order: any) => {
            const firstItem = order.items?.[0]
            const itemCount = order._count?.items ?? order.items?.length ?? 0
            return (
              <Link
                key={order.id}
                href={`/minha-conta/pedidos/${order.id}`}
                className="block bg-white rounded-card shadow-[var(--shadow-card)] p-5 hover:shadow-[0_6px_24px_rgba(61,43,31,0.12)] transition-shadow"
              >
                <div className="flex items-start gap-4">
                  {/* Thumb do primeiro item */}
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-bg-blush shrink-0">
                    {firstItem?.product?.images?.[0]?.url ? (
                      <Image src={firstItem.product.images[0].url} alt={firstItem.product.name} fill sizes="64px" className="object-cover" />
                    ) : (
                      <span className="w-full h-full flex items-center justify-center text-2xl">👕</span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <p className="font-extrabold text-sm text-brown-dark">
                        Pedido #{order.id.slice(-8).toUpperCase()}
                      </p>
                      <OrderStatusBadge status={order.status} />
                    </div>
                    <p className="font-semibold text-xs text-brown-muted mt-1">
                      {new Date(order.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
                      {" · "}{itemCount} {itemCount === 1 ? "item" : "itens"}
                      {order.paymentMethod && ` · ${METHOD_LABEL[order.paymentMethod] ?? order.paymentMethod}`}
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="font-black text-[17px] text-primary">
                        {formatPrice(Number(order.total))}
                      </span>
                      <span className="flex items-center gap-1 text-xs font-extrabold text-brown-muted hover:text-primary">
                        Ver detalhes <ArrowRight size={12} />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {/* Paginação simples */}
      {meta.pages > 1 && (
        <div className="flex justify-center gap-2 pt-2">
          <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Anterior</Button>
          <span className="font-bold text-sm text-brown-muted flex items-center">{page} / {meta.pages}</span>
          <Button variant="ghost" size="sm" disabled={page >= meta.pages} onClick={() => setPage(p => p + 1)}>Próximo →</Button>
        </div>
      )}
    </div>
  )
}
