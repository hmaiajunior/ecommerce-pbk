"use client"

import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { ShoppingBag, ArrowRight } from "lucide-react"
import { OrderStatusBadge } from "@/components/account/OrderStatusBadge"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/utils"

async function fetchOrders() {
  const res = await fetch("/api/orders?limit=3")
  if (!res.ok) return { data: [], meta: { total: 0 } }
  return res.json()
}

export default function ContaDashboardPage() {
  const { data: session } = useSession()
  const { data, isLoading } = useQuery({ queryKey: ["orders-preview"], queryFn: fetchOrders })

  const orders = data?.data ?? []
  const total  = data?.meta?.total ?? 0
  const firstName = session?.user.name?.split(" ")[0] ?? "Cliente"

  return (
    <div className="space-y-8">
      {/* Boas-vindas */}
      <div>
        <h1 className="font-black text-[28px] text-brown-dark">
          Olá, {firstName}! 👋
        </h1>
        <p className="font-semibold text-brown-muted mt-1">
          Gerencie seus pedidos, dados e endereços.
        </p>
      </div>

      {/* Card atacado pendente */}
      {session?.user.role === "WHOLESALE" && !session.user.wholesaleApproved && (
        <div className="bg-accent/20 border border-accent rounded-card p-4 flex items-start gap-3">
          <span className="text-2xl">⏳</span>
          <div>
            <p className="font-extrabold text-sm text-brown-dark">Conta atacado em análise</p>
            <p className="font-semibold text-xs text-brown-muted mt-1">
              Seu cadastro de revendedor está sendo analisado. Em até 2 dias úteis você receberá a confirmação por e-mail.
            </p>
          </div>
        </div>
      )}

      {/* Últimos pedidos */}
      <div className="bg-white rounded-card shadow-[var(--shadow-card)] p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <ShoppingBag size={18} className="text-primary" />
            <h2 className="font-black text-[17px] text-brown-dark">Últimos pedidos</h2>
          </div>
          {total > 3 && (
            <Link href="/minha-conta/pedidos" className="flex items-center gap-1 text-xs font-extrabold text-primary hover:underline">
              Ver todos <ArrowRight size={12} />
            </Link>
          )}
        </div>

        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
          </div>
        )}

        {!isLoading && orders.length === 0 && (
          <div className="text-center py-10 space-y-3">
            <span className="text-5xl block opacity-25">📦</span>
            <p className="font-extrabold text-brown-dark">Nenhum pedido ainda</p>
            <Button asChild size="sm"><Link href="/produtos">Explorar loja</Link></Button>
          </div>
        )}

        {!isLoading && orders.length > 0 && (
          <div className="divide-y divide-bg-nude">
            {orders.map((order: any) => (
              <Link
                key={order.id}
                href={`/minha-conta/pedidos/${order.id}`}
                className="flex items-center justify-between py-3 hover:bg-bg-blush -mx-2 px-2 rounded-lg transition-colors"
              >
                <div>
                  <p className="font-extrabold text-sm text-brown-dark">
                    #{order.id.slice(-8).toUpperCase()}
                  </p>
                  <p className="font-semibold text-xs text-brown-muted mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString("pt-BR")} ·{" "}
                    {order._count.items} {order._count.items === 1 ? "item" : "itens"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <OrderStatusBadge status={order.status} />
                  <span className="font-black text-[15px] text-brown-dark">
                    {formatPrice(Number(order.total))}
                  </span>
                  <ArrowRight size={14} className="text-brown-muted" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
