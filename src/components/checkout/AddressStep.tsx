"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { MapPin, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type Address = {
  id: string; street: string; number: string; complement?: string | null
  neighborhood: string; city: string; state: string; zipCode: string; isDefault: boolean
}

type Props = {
  onNext: (address: Address) => void
}

async function fetchAddresses(): Promise<Address[]> {
  const res = await fetch("/api/addresses")
  if (!res.ok) return []
  const json = await res.json()
  return json.data ?? []
}

async function fetchCep(cep: string) {
  const res = await fetch(`https://viacep.com.br/ws/${cep.replace(/\D/g, "")}/json/`)
  if (!res.ok) return null
  const data = await res.json()
  if (data.erro) return null
  return { street: data.logradouro, neighborhood: data.bairro, city: data.localidade, state: data.uf }
}

const EMPTY_FORM = { street: "", number: "", complement: "", neighborhood: "", city: "", state: "", zipCode: "" }

export function AddressStep({ onNext }: Props) {
  const { data: addresses = [], isLoading } = useQuery({ queryKey: ["addresses"], queryFn: fetchAddresses })
  const [selected, setSelected] = useState<Address | null>(null)
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [loadingCep, setLoadingCep] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  // Seleciona o endereço padrão automaticamente
  useEffect(() => {
    if (addresses.length > 0 && !selected) {
      const def = addresses.find((a) => a.isDefault) ?? addresses[0]
      setSelected(def)
    }
    if (addresses.length === 0 && !isLoading) setShowNew(true)
  }, [addresses, isLoading, selected])

  // Autocomplete de CEP
  useEffect(() => {
    const digits = form.zipCode.replace(/\D/g, "")
    if (digits.length !== 8) return
    setLoadingCep(true)
    fetchCep(digits).then((data) => {
      if (data) setForm((f) => ({ ...f, ...data }))
      setLoadingCep(false)
    })
  }, [form.zipCode])

  async function saveAndContinue() {
    setSaving(true)
    setError("")
    const res = await fetch("/api/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, isDefault: false }),
    })
    setSaving(false)
    if (!res.ok) {
      const json = await res.json()
      setError(json.error ?? "Erro ao salvar endereço.")
      return
    }
    const json = await res.json()
    onNext(json.data)
  }

  const canContinue = selected || (showNew && form.street && form.number && form.city)

  return (
    <div className="space-y-5">
      <h2 className="font-black text-xl text-brown-dark">Endereço de entrega</h2>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-20 rounded-card bg-bg-nude animate-pulse" />
          ))}
        </div>
      )}

      {/* Endereços salvos */}
      {!isLoading && addresses.length > 0 && (
        <div className="space-y-3">
          {addresses.map((addr) => (
            <button
              key={addr.id}
              onClick={() => { setSelected(addr); setShowNew(false) }}
              className={cn(
                "w-full text-left p-4 rounded-card border-2 transition-all",
                selected?.id === addr.id && !showNew
                  ? "border-primary bg-primary/5"
                  : "border-bg-nude bg-white hover:border-brown-muted"
              )}
            >
              <div className="flex items-start gap-3">
                <MapPin size={16} className={selected?.id === addr.id ? "text-primary mt-0.5" : "text-brown-muted mt-0.5"} />
                <div>
                  <p className="font-extrabold text-sm text-brown-dark">
                    {addr.street}, {addr.number}
                    {addr.complement && ` — ${addr.complement}`}
                  </p>
                  <p className="font-semibold text-xs text-brown-muted">
                    {addr.neighborhood} · {addr.city}/{addr.state} · CEP {addr.zipCode}
                  </p>
                </div>
              </div>
            </button>
          ))}

          <button
            onClick={() => { setShowNew(true); setSelected(null) }}
            className={cn(
              "w-full flex items-center gap-2 p-4 rounded-card border-2 border-dashed transition-all font-bold text-sm",
              showNew ? "border-primary text-primary bg-primary/5" : "border-bg-nude text-brown-muted hover:border-primary hover:text-primary"
            )}
          >
            <Plus size={16} /> Novo endereço
          </button>
        </div>
      )}

      {/* Formulário novo endereço */}
      {showNew && (
        <div className="bg-white rounded-card p-5 border border-bg-nude space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="CEP"
              value={form.zipCode}
              onChange={(e) => setForm((f) => ({ ...f, zipCode: e.target.value }))}
              placeholder="00000-000"
              maxLength={9}
            />
            <div className="flex items-end">
              {loadingCep && <p className="text-xs font-bold text-brown-muted pb-3">Buscando...</p>}
            </div>
          </div>
          <Input label="Logradouro" value={form.street} onChange={(e) => setForm((f) => ({ ...f, street: e.target.value }))} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Número" value={form.number} onChange={(e) => setForm((f) => ({ ...f, number: e.target.value }))} />
            <Input label="Complemento" value={form.complement} onChange={(e) => setForm((f) => ({ ...f, complement: e.target.value }))} />
          </div>
          <Input label="Bairro" value={form.neighborhood} onChange={(e) => setForm((f) => ({ ...f, neighborhood: e.target.value }))} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Cidade" value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} />
            <Input label="UF" value={form.state} onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))} maxLength={2} />
          </div>
          {error && <p className="text-xs font-bold text-red-500">{error}</p>}
        </div>
      )}

      <Button
        size="lg"
        className="w-full"
        disabled={!canContinue || saving}
        onClick={() => {
          if (showNew) { saveAndContinue() }
          else if (selected) { onNext(selected) }
        }}
      >
        {saving ? "Salvando..." : "Continuar para o frete →"}
      </Button>
    </div>
  )
}
