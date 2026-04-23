"use client"

import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { TrendingUp, ShoppingBag, Users, AlertTriangle, ArrowRight } from "lucide-react"
import { OrderStatusBadge } from "@/components/account/OrderStatusBadge"
import { Skeleton } from "@/components/ui/skeleton"
import { formatPrice } from "@/lib/utils"

async function fetchDashboard() {
  const res = await fetch("/api/admin/dashboard")
  if (!res.ok) return null
  const json = await res.json()
  return json.data
}

function StatCard({ label, value, sub, icon: Icon, color }: {
  label: string; value: string; sub?: string
  icon: typeof TrendingUp; color: string
}) {
  return (
    <div className="bg-white rounded-card shadow-[var(--shadow-card)] p-5">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-black uppercase tracking-wider text-brown-muted">{label}</p>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
          <Icon size={16} />
        </div>
      </div>
      <p className="font-black text-[26px] text-brown-dark leading-tight">{value}</p>
      {sub && <p className="font-semibold text-xs text-brown-muted mt-1">{sub}</p>}
    </div>
  )
}

const STATUS_LABELS: Record<string, string> = {
  PENDING_PAYMENT: "Aguardando pagto.", PROCESSING: "Em processamento",
  SHIPPED: "Enviados", DELIVERED: "Entregues", CANCELLED: "Cancelados",
}

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({ queryKey: ["admin-dashboard"], queryFn: fetchDashboard })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-card" />)}
        </div>
        <Skeleton className="h-64 rounded-card" />
      </div>
    )
  }

  if (!data) return <p className="font-bold text-red-500">Erro ao carregar dashboard.</p>

  const { revenue, ordersByStatus, recentOrders, customers, lowStock } = data

  return (
    <div className="space-y-8 max-w-5xl">
      <h1 className="font-black text-[28px] text-brown-dark">Dashboard</h1>

      {/* Receita */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Receita hoje"   value={formatPrice(revenue.today)}  sub={`${revenue.todayOrders} pedidos`}  icon={TrendingUp} color="bg-primary/15 text-primary"    />
        <StatCard label="Receita semana" value={formatPrice(revenue.week)}   sub={`${revenue.weekOrders} pedidos`}   icon={TrendingUp} color="bg-secondary/15 text-secondary" />
        <StatCard label="Receita mês"    value={formatPrice(revenue.month)}  sub={`${revenue.monthOrders} pedidos`}  icon={TrendingUp} color="bg-accent/30 text-brown-dark"   />
      </div>

      {/* Grid secundário */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pedidos por status */}
        <div className="bg-white rounded-card shadow-[var(--shadow-card)] p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="font-black text-[15px] text-brown-dark">Pedidos</p>
            <Link href="/admin/pedidos" className="text-xs font-extrabold text-primary hover:underline flex items-center gap-1">
              Ver todos <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-2">
            {Object.entries(STATUS_LABELS).map(([status, label]) => (
              <div key={status} className="flex items-center justify-between">
                <span className="font-semibold text-sm text-brown-muted">{label}</span>
                <span className="font-black text-sm text-brown-dark">
                  {ordersByStatus[status] ?? 0}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Clientes */}
        <div className="bg-white rounded-card shadow-[var(--shadow-card)] p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="font-black text-[15px] text-brown-dark">Clientes</p>
            <Link href="/admin/clientes" className="text-xs font-extrabold text-primary hover:underline flex items-center gap-1">
              Ver todos <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-bg-blush rounded-lg">
              <div className="flex items-center gap-2">
                <Users size={14} className="text-primary" />
                <span className="font-bold text-sm text-brown-mid">Varejo</span>
              </div>
              <span className="font-black text-brown-dark">{customers.RETAIL ?? 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-bg-blush rounded-lg">
              <div className="flex items-center gap-2">
                <Users size={14} className="text-info" />
                <span className="font-bold text-sm text-brown-mid">Atacado</span>
              </div>
              <span className="font-black text-brown-dark">{customers.WHOLESALE ?? 0}</span>
            </div>
          </div>
        </div>

        {/* Baixo estoque */}
        <div className="bg-white rounded-card shadow-[var(--shadow-card)] p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={15} className="text-accent" />
            <p className="font-black text-[15px] text-brown-dark">Estoque baixo</p>
          </div>
          {lowStock.length === 0 ? (
            <p className="font-semibold text-sm text-brown-muted">Tudo em ordem ✓</p>
          ) : (
            <div className="space-y-2 max-h-44 overflow-y-auto">
              {lowStock.map((item: any) => (
                <div key={`${item.product.id}-${item.size}`} className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="font-bold text-xs text-brown-dark truncate">{item.product.name}</p>
                    <p className="font-semibold text-[11px] text-brown-muted">Tam. {item.size}</p>
                  </div>
                  <span className="font-black text-sm text-primary ml-2 shrink-0">{item.stock} un.</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Pedidos recentes */}
      <div className="bg-white rounded-card shadow-[var(--shadow-card)] p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShoppingBag size={15} className="text-primary" />
            <p className="font-black text-[15px] text-brown-dark">Pedidos recentes</p>
          </div>
          <Link href="/admin/pedidos" className="text-xs font-extrabold text-primary hover:underline flex items-center gap-1">
            Ver todos <ArrowRight size={12} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-bg-nude">
                {["Pedido", "Cliente", "Total", "Status", "Data"].map(h => (
                  <th key={h} className="text-left py-2 px-2 text-xs font-black uppercase tracking-wider text-brown-muted">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order: any) => (
                <tr key={order.id} className="border-b border-bg-nude hover:bg-bg-blush transition-colors">
                  <td className="py-3 px-2 font-extrabold text-brown-dark">#{order.id.slice(-8).toUpperCase()}</td>
                  <td className="py-3 px-2 font-semibold text-brown-mid">{order.user?.name ?? "—"}</td>
                  <td className="py-3 px-2 font-extrabold text-primary">{formatPrice(Number(order.total))}</td>
                  <td className="py-3 px-2"><OrderStatusBadge status={order.status} /></td>
                  <td className="py-3 px-2 font-semibold text-brown-muted">
                    {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
