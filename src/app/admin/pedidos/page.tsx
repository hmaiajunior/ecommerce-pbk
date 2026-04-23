"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { ChevronDown } from "lucide-react"
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/account/OrderStatusBadge"
import { Skeleton } from "@/components/ui/skeleton"
import { cn, formatPrice } from "@/lib/utils"

type Order = {
  id: string; status: string; paymentStatus: string; paymentMethod?: string
  total: number; createdAt: string
  user: { name: string; email: string; role: string }
  address: { city: string; state: string }
  _count: { items: number }
}

const ORDER_STATUSES = ["PENDING_PAYMENT","PROCESSING","SHIPPED","DELIVERED","CANCELLED"]
const STATUS_LABEL: Record<string, string> = {
  PENDING_PAYMENT: "Aguardando pgto.", PROCESSING: "Processando",
  SHIPPED: "Enviado", DELIVERED: "Entregue", CANCELLED: "Cancelado",
}

export default function AdminPedidosPage() {
  const qc = useQueryClient()
  const [statusFilter, setStatusFilter] = useState("")
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ["admin-orders", statusFilter, page],
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page), limit: "20" })
      if (statusFilter) params.set("status", statusFilter)
      return fetch(`/api/admin/orders?${params}`).then(r => r.json())
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      fetch(`/api/admin/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-orders"] }),
  })

  const orders: Order[] = data?.data ?? []
  const meta = data?.meta ?? { total: 0, pages: 0 }

  return (
    <div className="space-y-6 max-w-5xl">
      <h1 className="font-black text-[26px] text-brown-dark">Pedidos</h1>

      {/* Filtro de status */}
      <div className="flex flex-wrap gap-2">
        {["", ...ORDER_STATUSES].map(s => (
          <button key={s || "all"}
            onClick={() => { setStatusFilter(s); setPage(1) }}
            className={cn(
              "px-4 py-2 rounded-pill font-extrabold text-xs transition-colors",
              statusFilter === s ? "bg-primary text-white shadow-[var(--shadow-coral)]" : "bg-white text-brown-muted hover:bg-bg-blush border border-bg-nude"
            )}
          >
            {s ? STATUS_LABEL[s] : "Todos"}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-card" />)}</div>
      ) : (
        <div className="bg-white rounded-card shadow-[var(--shadow-card)] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-bg-nude bg-bg-blush">
              <tr>{["Pedido","Cliente","Itens","Total","Pgto.","Status","Alterar status"].map(h => (
                <th key={h} className="text-left py-3 px-3 text-xs font-black uppercase tracking-wider text-brown-muted">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id} className="border-b border-bg-nude hover:bg-bg-blush/50 transition-colors">
                  <td className="py-3 px-3">
                    <p className="font-extrabold text-brown-dark">#{order.id.slice(-8).toUpperCase()}</p>
                    <p className="font-semibold text-[11px] text-brown-muted">{new Date(order.createdAt).toLocaleDateString("pt-BR")}</p>
                  </td>
                  <td className="py-3 px-3">
                    <p className="font-bold text-sm text-brown-dark">{order.user.name}</p>
                    <p className="font-semibold text-[11px] text-brown-muted">{order.address.city}/{order.address.state}</p>
                  </td>
                  <td className="py-3 px-3 font-semibold text-brown-muted">{order._count.items}</td>
                  <td className="py-3 px-3 font-extrabold text-primary">{formatPrice(Number(order.total))}</td>
                  <td className="py-3 px-3"><PaymentStatusBadge status={order.paymentStatus as any} /></td>
                  <td className="py-3 px-3"><OrderStatusBadge status={order.status as any} /></td>
                  <td className="py-3 px-3">
                    <div className="relative">
                      <select
                        value={order.status}
                        onChange={e => updateMutation.mutate({ id: order.id, status: e.target.value })}
                        className="appearance-none bg-bg-blush border border-bg-nude rounded-lg px-3 pr-8 py-1.5 font-bold text-xs text-brown-dark outline-none focus:border-primary cursor-pointer"
                      >
                        {ORDER_STATUSES.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                      </select>
                      <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-brown-muted pointer-events-none" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && <p className="text-center py-10 font-semibold text-brown-muted">Nenhum pedido encontrado.</p>}
        </div>
      )}

      {meta.pages > 1 && (
        <div className="flex justify-center gap-2">
          <button onClick={() => setPage(p => p - 1)} disabled={page <= 1} className="px-4 py-2 rounded-pill bg-white border border-bg-nude font-bold text-sm text-brown-muted disabled:opacity-40 hover:bg-bg-blush">← Anterior</button>
          <span className="px-4 py-2 font-bold text-sm text-brown-muted">{page} / {meta.pages}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={page >= meta.pages} className="px-4 py-2 rounded-pill bg-white border border-bg-nude font-bold text-sm text-brown-muted disabled:opacity-40 hover:bg-bg-blush">Próximo →</button>
        </div>
      )}
    </div>
  )
}
