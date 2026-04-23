"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { CheckCircle, XCircle, Search } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

type Customer = {
  id: string; name: string; email: string; role: string
  wholesaleApproved: boolean; createdAt: string
  _count: { orders: number }
}

const TABS = [
  { value: "all",       label: "Todos"            },
  { value: "RETAIL",    label: "Varejo"            },
  { value: "WHOLESALE", label: "Atacado"           },
  { value: "pending",   label: "Atacado pendente"  },
]

export default function AdminClientesPage() {
  const qc = useQueryClient()
  const [tab, setTab]       = useState("all")
  const [search, setSearch] = useState("")

  const { data, isLoading } = useQuery<Customer[]>({
    queryKey: ["admin-customers", tab, search],
    queryFn: () => {
      const params = new URLSearchParams({ limit: "50" })
      if (tab === "pending") params.set("wholesalePending", "true")
      else if (tab !== "all") params.set("role", tab)
      if (search) params.set("search", search)
      return fetch(`/api/admin/customers?${params}`).then(r => r.json()).then(j => j.data ?? [])
    },
  })

  const wholesaleMutation = useMutation({
    mutationFn: ({ id, approved }: { id: string; approved: boolean }) =>
      fetch(`/api/admin/customers/${id}/wholesale`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-customers"] }),
  })

  return (
    <div className="space-y-6 max-w-5xl">
      <h1 className="font-black text-[26px] text-brown-dark">Clientes</h1>

      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        {/* Tabs */}
        <div className="flex gap-1.5 flex-wrap">
          {TABS.map(t => (
            <button key={t.value} onClick={() => setTab(t.value)}
              className={cn(
                "px-4 py-2 rounded-pill font-extrabold text-xs transition-colors",
                tab === t.value ? "bg-primary text-white shadow-[var(--shadow-coral)]" : "bg-white border border-bg-nude text-brown-muted hover:bg-bg-blush"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Busca */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brown-muted" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar nome ou e-mail..."
            className="pl-9 pr-4 py-2.5 border border-bg-nude rounded-pill font-bold text-sm text-brown-dark outline-none focus:border-primary w-64" />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-card" />)}</div>
      ) : (
        <div className="bg-white rounded-card shadow-[var(--shadow-card)] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-bg-nude bg-bg-blush">
              <tr>{["Nome","E-mail","Tipo","Pedidos","Atacado","Ação"].map(h => (
                <th key={h} className="text-left py-3 px-4 text-xs font-black uppercase tracking-wider text-brown-muted">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {(data ?? []).map(c => (
                <tr key={c.id} className="border-b border-bg-nude hover:bg-bg-blush/50 transition-colors">
                  <td className="py-3 px-4 font-extrabold text-brown-dark">{c.name}</td>
                  <td className="py-3 px-4 font-semibold text-brown-muted">{c.email}</td>
                  <td className="py-3 px-4">
                    <span className={cn("px-2 py-0.5 rounded-pill text-[11px] font-extrabold",
                      c.role === "WHOLESALE" ? "bg-info/15 text-info" : "bg-bg-nude text-brown-muted"
                    )}>
                      {c.role === "WHOLESALE" ? "Atacado" : "Varejo"}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-brown-muted">{c._count.orders}</td>
                  <td className="py-3 px-4">
                    {c.role === "WHOLESALE" ? (
                      <span className={cn("flex items-center gap-1 font-bold text-xs",
                        c.wholesaleApproved ? "text-green-600" : "text-amber-600"
                      )}>
                        {c.wholesaleApproved ? <><CheckCircle size={13} /> Aprovado</> : "Pendente"}
                      </span>
                    ) : <span className="text-brown-muted font-semibold text-xs">—</span>}
                  </td>
                  <td className="py-3 px-4">
                    {c.role === "WHOLESALE" && (
                      <button
                        onClick={() => wholesaleMutation.mutate({ id: c.id, approved: !c.wholesaleApproved })}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-1.5 rounded-pill font-extrabold text-xs transition-colors",
                          c.wholesaleApproved
                            ? "bg-red-50 text-red-500 hover:bg-red-100"
                            : "bg-green-50 text-green-700 hover:bg-green-100"
                        )}
                      >
                        {c.wholesaleApproved
                          ? <><XCircle size={12} /> Revogar</>
                          : <><CheckCircle size={12} /> Aprovar</>}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(data ?? []).length === 0 && <p className="text-center py-10 font-semibold text-brown-muted">Nenhum cliente encontrado.</p>}
        </div>
      )}
    </div>
  )
}
