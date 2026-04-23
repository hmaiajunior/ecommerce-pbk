"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus, X, ToggleLeft, ToggleRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { cn, formatPrice } from "@/lib/utils"

type Coupon = {
  id: string; code: string; type: "PERCENTAGE" | "FIXED"; discount: number
  minOrder?: number; expiresAt?: string; active: boolean
  usageCount: number; usageLimit?: number
}

const EMPTY = { code: "", type: "PERCENTAGE" as const, discount: "", minOrder: "", expiresAt: "", usageLimit: "" }

export default function AdminCuponsPage() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [formErr, setFormErr] = useState("")

  const { data: coupons = [], isLoading } = useQuery<Coupon[]>({
    queryKey: ["admin-coupons"],
    queryFn: () => fetch("/api/admin/coupons").then(r => r.json()).then(j => j.data ?? []),
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      fetch(`/api/admin/coupons/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-coupons"] }),
  })

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setFormErr("")
    const body = {
      code: form.code.toUpperCase(),
      type: form.type,
      discount: parseFloat(form.discount),
      ...(form.minOrder    && { minOrder:    parseFloat(form.minOrder)    }),
      ...(form.expiresAt   && { expiresAt:   new Date(form.expiresAt).toISOString() }),
      ...(form.usageLimit  && { usageLimit:  parseInt(form.usageLimit)    }),
    }
    const res = await fetch("/api/admin/coupons", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    setSaving(false)
    if (!res.ok) { const j = await res.json(); setFormErr(j.error ?? "Erro."); return }
    qc.invalidateQueries({ queryKey: ["admin-coupons"] })
    setShowForm(false); setForm(EMPTY)
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="font-black text-[26px] text-brown-dark">Cupons de desconto</h1>
        <Button onClick={() => setShowForm(v => !v)}>
          {showForm ? <><X size={14} /> Cancelar</> : <><Plus size={14} /> Novo cupom</>}
        </Button>
      </div>

      {/* Formulário */}
      {showForm && (
        <div className="bg-white rounded-card shadow-[var(--shadow-card)] p-6 border-2 border-primary/20">
          <p className="font-black text-[15px] text-brown-dark mb-5">Criar cupom</p>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Input label="Código *" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="PROMO10" required />
              <div>
                <label className="text-xs font-black uppercase tracking-[0.1em] text-brown-muted block mb-1.5">Tipo *</label>
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as any }))}
                  className="w-full border border-bg-nude rounded-lg px-3 py-2.5 font-semibold text-sm text-brown-dark outline-none focus:border-primary">
                  <option value="PERCENTAGE">Percentual (%)</option>
                  <option value="FIXED">Valor fixo (R$)</option>
                </select>
              </div>
              <Input label={`Desconto * ${form.type === "PERCENTAGE" ? "(%)" : "(R$)"}`}
                type="number" step="0.01" value={form.discount}
                onChange={e => setForm(f => ({ ...f, discount: e.target.value }))} required />
              <Input label="Pedido mínimo (R$)" type="number" step="0.01" value={form.minOrder}
                onChange={e => setForm(f => ({ ...f, minOrder: e.target.value }))} />
              <Input label="Validade" type="datetime-local" value={form.expiresAt}
                onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))} />
              <Input label="Limite de usos" type="number" value={form.usageLimit}
                onChange={e => setForm(f => ({ ...f, usageLimit: e.target.value }))} placeholder="Ilimitado" />
            </div>
            {formErr && <p className="text-sm font-bold text-red-500">{formErr}</p>}
            <Button type="submit" disabled={saving}>{saving ? "Criando..." : "Criar cupom"}</Button>
          </form>
        </div>
      )}

      {/* Lista */}
      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-card" />)}</div>
      ) : (
        <div className="bg-white rounded-card shadow-[var(--shadow-card)] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-bg-nude bg-bg-blush">
              <tr>{["Código","Desconto","Pedido mín.","Usos","Validade","Status","Ação"].map(h => (
                <th key={h} className="text-left py-3 px-4 text-xs font-black uppercase tracking-wider text-brown-muted">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {coupons.map(c => (
                <tr key={c.id} className="border-b border-bg-nude hover:bg-bg-blush/50 transition-colors">
                  <td className="py-3 px-4 font-black text-brown-dark tracking-wider">{c.code}</td>
                  <td className="py-3 px-4 font-extrabold text-primary">
                    {c.type === "PERCENTAGE" ? `${c.discount}%` : formatPrice(Number(c.discount))}
                  </td>
                  <td className="py-3 px-4 font-semibold text-brown-muted">
                    {c.minOrder ? formatPrice(Number(c.minOrder)) : "—"}
                  </td>
                  <td className="py-3 px-4 font-semibold text-brown-muted">
                    {c.usageCount}{c.usageLimit ? ` / ${c.usageLimit}` : ""}
                  </td>
                  <td className="py-3 px-4 font-semibold text-brown-muted">
                    {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString("pt-BR") : "—"}
                  </td>
                  <td className="py-3 px-4">
                    <span className={cn("px-2 py-0.5 rounded-pill text-[11px] font-extrabold",
                      c.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-500"
                    )}>
                      {c.active ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => toggleMutation.mutate({ id: c.id, active: !c.active })}
                      className="text-brown-muted hover:text-primary transition-colors"
                      title={c.active ? "Desativar" : "Ativar"}
                    >
                      {c.active ? <ToggleRight size={20} className="text-green-600" /> : <ToggleLeft size={20} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {coupons.length === 0 && <p className="text-center py-10 font-semibold text-brown-muted">Nenhum cupom cadastrado.</p>}
        </div>
      )}
    </div>
  )
}
