"use client"

import { useEffect, useState } from "react"
import { Truck, ArrowLeft, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn, formatPrice } from "@/lib/utils"
import { useCartStore } from "@/store/cart"
import type { ShippingQuote } from "@/lib/melhorenvio"

type Address = { zipCode: string }

type Props = {
  address: Address
  onNext: (option: ShippingQuote) => void
  onBack: () => void
}

const ALLOW_SKIP_SHIPPING =
  process.env.NEXT_PUBLIC_ALLOW_SKIP_SHIPPING === "true"

const TEST_SHIPPING_OPTION: ShippingQuote = {
  id: 0,
  service: "Frete teste (R$ 0,00)",
  company: "Modo teste — ignora cálculo real",
  price: 0,
  deliveryDays: 0,
}

export function ShippingStep({ address, onNext, onBack }: Props) {
  const items = useCartStore((s) => s.items)
  const [options, setOptions] = useState<ShippingQuote[]>(
    ALLOW_SKIP_SHIPPING ? [TEST_SHIPPING_OPTION] : []
  )
  const [selected, setSelected] = useState<ShippingQuote | null>(
    ALLOW_SKIP_SHIPPING ? TEST_SHIPPING_OPTION : null
  )
  const [note, setNote] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const isCustom = selected !== null && Number(selected.id) < 0

  useEffect(() => {
    setLoading(true)
    setError("")
    fetch("/api/frete/calcular", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        zipCode: address.zipCode,
        items: items.map((i) => ({ productId: i.productId, size: i.size, quantity: i.quantity })),
      }),
    })
      .then((r) => r.json())
      .then((json) => {
        if (json.error && !ALLOW_SKIP_SHIPPING) {
          setError(json.error)
          return
        }
        const apiOptions: ShippingQuote[] = json.data ?? []
        const merged = ALLOW_SKIP_SHIPPING
          ? [TEST_SHIPPING_OPTION, ...apiOptions]
          : apiOptions
        setOptions(merged)
        if (merged.length > 0) setSelected(merged[0])
      })
      .catch(() => {
        if (!ALLOW_SKIP_SHIPPING) setError("Erro ao calcular frete.")
      })
      .finally(() => setLoading(false))
  }, [address.zipCode, items])

  function handleNext() {
    if (!selected) return
    onNext({ ...selected, note: isCustom && note.trim() ? note.trim() : undefined })
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-brown-muted hover:text-primary transition-colors">
          <ArrowLeft size={18} />
        </button>
        <h2 className="font-black text-xl text-brown-dark">Opções de frete</h2>
      </div>

      <p className="text-sm font-semibold text-brown-muted">
        Entrega para o CEP <strong className="text-brown-dark">{address.zipCode}</strong>
      </p>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-card bg-bg-nude animate-pulse" />
          ))}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-card p-4">
          <p className="text-sm font-bold text-red-500">{error}</p>
          <p className="text-xs font-semibold text-red-400 mt-1">
            Verifique o CEP e tente novamente.
          </p>
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-3">
          {options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => { setSelected(opt); setNote("") }}
              className={cn(
                "w-full flex items-center justify-between p-4 rounded-card border-2 transition-all",
                selected?.id === opt.id
                  ? "border-primary bg-primary/5"
                  : "border-bg-nude bg-white hover:border-brown-muted"
              )}
            >
              <div className="flex items-center gap-3">
                <Truck size={18} className={selected?.id === opt.id ? "text-primary" : "text-brown-muted"} />
                <div className="text-left">
                  <p className="font-extrabold text-sm text-brown-dark">{opt.service}</p>
                  <p className="font-semibold text-xs text-brown-muted">
                    {opt.company}
                    {opt.deliveryDays > 0 && ` · ${opt.deliveryDays} dia${opt.deliveryDays !== 1 ? "s" : ""} úteis`}
                  </p>
                </div>
              </div>
              <span className="font-black text-[17px] text-primary">
                {opt.price === 0 ? "Grátis" : formatPrice(opt.price)}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Campo de observação para opções customizadas */}
      {isCustom && (
        <div className="bg-accent/10 border border-accent/30 rounded-card p-4 space-y-2">
          <div className="flex items-center gap-2">
            <MessageSquare size={15} className="text-brown-mid" />
            <p className="font-extrabold text-sm text-brown-dark">Observação</p>
          </div>
          <p className="text-xs font-semibold text-brown-muted">
            Informe o nome da excursão, horário de entrega ou qualquer detalhe importante.
          </p>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ex: Excursão Clube das Mães — entrega às 14h"
            rows={3}
            className="w-full border border-bg-nude rounded-lg px-3 py-2 text-sm font-semibold text-brown-dark placeholder:text-brown-muted outline-none focus:border-primary resize-none"
          />
        </div>
      )}

      <Button
        size="lg"
        className="w-full"
        disabled={!selected || loading}
        onClick={handleNext}
      >
        Continuar para o pagamento →
      </Button>
    </div>
  )
}
