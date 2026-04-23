"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { MapPin, Plus, Trash2, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

type Address = {
  id: string; street: string; number: string; complement?: string | null
  neighborhood: string; city: string; state: string; zipCode: string; isDefault: boolean
}

const EMPTY = { street: "", number: "", complement: "", neighborhood: "", city: "", state: "", zipCode: "" }

async function fetchCep(cep: string) {
  const res = await fetch(`https://viacep.com.br/ws/${cep.replace(/\D/g, "")}/json/`)
  if (!res.ok) return null
  const d = await res.json()
  if (d.erro) return null
  return { street: d.logradouro, neighborhood: d.bairro, city: d.localidade, state: d.uf }
}

export default function EnderecosPage() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState("")
  const [cepLoading, setCepLoading] = useState(false)

  const { data, isLoading } = useQuery<Address[]>({
    queryKey: ["addresses"],
    queryFn: () => fetch("/api/addresses").then(r => r.json()).then(j => j.data ?? []),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/addresses/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["addresses"] }),
  })

  const defaultMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/addresses/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isDefault: true }),
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["addresses"] }),
  })

  async function handleCepChange(value: string) {
    setForm(f => ({ ...f, zipCode: value }))
    if (value.replace(/\D/g, "").length === 8) {
      setCepLoading(true)
      const data = await fetchCep(value)
      if (data) setForm(f => ({ ...f, ...data }))
      setCepLoading(false)
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setFormError("")
    const res = await fetch("/api/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, isDefault: (data?.length ?? 0) === 0 }),
    })
    setSaving(false)
    if (!res.ok) {
      const json = await res.json()
      setFormError(json.error ?? "Erro ao salvar endereço.")
      return
    }
    qc.invalidateQueries({ queryKey: ["addresses"] })
    setShowForm(false)
    setForm(EMPTY)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-black text-[26px] text-brown-dark">Endereços</h1>
        {!showForm && (
          <Button variant="ghost" size="sm" onClick={() => setShowForm(true)}>
            <Plus size={14} /> Novo endereço
          </Button>
        )}
      </div>

      {/* Formulário de novo endereço */}
      {showForm && (
        <div className="bg-white rounded-card shadow-[var(--shadow-card)] p-6">
          <p className="font-black text-[15px] text-brown-dark mb-4">Novo endereço</p>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input
                  label={`CEP${cepLoading ? " (buscando...)" : ""}`}
                  value={form.zipCode}
                  onChange={(e) => handleCepChange(e.target.value)}
                  placeholder="00000-000"
                  maxLength={9}
                  required
                />
              </div>
            </div>
            <Input label="Logradouro" value={form.street} onChange={(e) => setForm(f => ({ ...f, street: e.target.value }))} required />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Número" value={form.number} onChange={(e) => setForm(f => ({ ...f, number: e.target.value }))} required />
              <Input label="Complemento" value={form.complement ?? ""} onChange={(e) => setForm(f => ({ ...f, complement: e.target.value }))} />
            </div>
            <Input label="Bairro" value={form.neighborhood} onChange={(e) => setForm(f => ({ ...f, neighborhood: e.target.value }))} required />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Cidade" value={form.city} onChange={(e) => setForm(f => ({ ...f, city: e.target.value }))} required />
              <Input label="UF" value={form.state} onChange={(e) => setForm(f => ({ ...f, state: e.target.value }))} maxLength={2} required />
            </div>
            {formError && <p className="text-sm font-bold text-red-500">{formError}</p>}
            <div className="flex gap-3">
              <Button type="submit" disabled={saving}>{saving ? "Salvando..." : "Salvar endereço"}</Button>
              <Button type="button" variant="ghost" onClick={() => { setShowForm(false); setForm(EMPTY) }}>Cancelar</Button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de endereços */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2].map(i => <Skeleton key={i} className="h-24 w-full rounded-card" />)}
        </div>
      )}

      {!isLoading && (data ?? []).length === 0 && !showForm && (
        <div className="text-center py-14 bg-white rounded-card shadow-[var(--shadow-card)] space-y-3">
          <MapPin size={40} className="mx-auto text-brown-muted opacity-30" />
          <p className="font-extrabold text-brown-dark">Nenhum endereço cadastrado</p>
          <Button variant="ghost" onClick={() => setShowForm(true)}><Plus size={14} /> Adicionar endereço</Button>
        </div>
      )}

      {(data ?? []).map((addr) => (
        <div
          key={addr.id}
          className={cn(
            "bg-white rounded-card shadow-[var(--shadow-card)] p-5 border-2 transition-all",
            addr.isDefault ? "border-primary" : "border-transparent"
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <MapPin size={16} className={cn("mt-0.5 shrink-0", addr.isDefault ? "text-primary" : "text-brown-muted")} />
              <div>
                {addr.isDefault && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-pill mb-1">
                    <Star size={9} fill="currentColor" /> Padrão
                  </span>
                )}
                <p className="font-extrabold text-sm text-brown-dark">
                  {addr.street}, {addr.number}
                  {addr.complement && ` — ${addr.complement}`}
                </p>
                <p className="font-semibold text-xs text-brown-muted mt-0.5">
                  {addr.neighborhood} · {addr.city}/{addr.state} · CEP {addr.zipCode}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {!addr.isDefault && (
                <button
                  onClick={() => defaultMutation.mutate(addr.id)}
                  className="text-xs font-bold text-brown-muted hover:text-primary transition-colors px-2 py-1 rounded"
                  title="Definir como padrão"
                >
                  <Star size={14} />
                </button>
              )}
              <button
                onClick={() => deleteMutation.mutate(addr.id)}
                className="text-brown-muted hover:text-red-400 transition-colors p-1 rounded"
                title="Excluir endereço"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
