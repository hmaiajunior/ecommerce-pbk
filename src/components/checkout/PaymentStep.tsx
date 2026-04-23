"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, QrCode, CreditCard, FileText, Check, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn, formatPrice } from "@/lib/utils"
import { useCartStore } from "@/store/cart"
import { createOrder } from "@/actions/checkout"
import type { ShippingQuote } from "@/lib/melhorenvio"

type Address = {
  id: string; street: string; number: string; neighborhood: string
  city: string; state: string; zipCode: string
}

type Props = {
  address: Address
  shipping: ShippingQuote
  onBack: () => void
}

type PaymentMethod = "pix" | "credit_card" | "boleto"

type PixResult = { qrCode: string; qrCodeBase64: string; expiresAt: string }

export function PaymentStep({ address, shipping, onBack }: Props) {
  const router = useRouter()
  const { items, clearCart } = useCartStore()
  const [method, setMethod] = useState<PaymentMethod>("pix")
  const [cpf, setCpf] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [pixResult, setPixResult] = useState<PixResult | null>(null)
  const [copied, setCopied] = useState(false)

  async function handleConfirm() {
    setLoading(true)
    setError("")

    // 1. Cria o pedido
    const orderResult = await createOrder({
      items: items.map((i) => ({
        productId: i.productId,
        size: i.size,
        quantity: i.quantity,
        price: i.wholesalePrice ?? i.retailPrice,
      })),
      addressId: address.id,
      shippingService: shipping.service,
      shippingCost: shipping.price,
    })

    if ("error" in orderResult) {
      setError(orderResult.error)
      setLoading(false)
      return
    }

    // 2. Processa o pagamento
    const body: Record<string, unknown> = { orderId: orderResult.orderId, method }
    if (method === "boleto") body.payerCpf = cpf.replace(/\D/g, "")

    const res = await fetch("/api/checkout/create-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    setLoading(false)
    const json = await res.json()

    if (!res.ok) {
      setError(json.error ?? "Erro ao processar pagamento.")
      return
    }

    if (method === "pix") {
      setPixResult(json.data)
      return
    }

    clearCart()
    router.push(`/minha-conta/pedidos/${orderResult.orderId}`)
  }

  function copyPix() {
    if (!pixResult?.qrCode) return
    navigator.clipboard.writeText(pixResult.qrCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // ── Tela de QR Code Pix ────────────────────────────────────────
  if (pixResult) {
    return (
      <div className="space-y-6 text-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
            <QrCode size={22} className="text-secondary" />
          </div>
          <h2 className="font-black text-xl text-brown-dark">Pague com Pix</h2>
          <p className="font-semibold text-sm text-brown-muted">
            Escaneie o QR Code ou copie o código abaixo
          </p>
        </div>

        {pixResult.qrCodeBase64 && (
          <img
            src={`data:image/png;base64,${pixResult.qrCodeBase64}`}
            alt="QR Code Pix"
            className="w-48 h-48 mx-auto rounded-lg border border-bg-nude"
          />
        )}

        <div className="bg-bg-blush rounded-card p-4 text-left">
          <p className="text-xs font-black uppercase tracking-wider text-brown-muted mb-2">
            Código Pix copia e cola
          </p>
          <p className="text-xs font-mono text-brown-dark break-all mb-3 leading-relaxed">
            {pixResult.qrCode}
          </p>
          <Button variant="ghost" size="sm" className="w-full" onClick={copyPix}>
            {copied ? <><Check size={14} /> Copiado!</> : <><Copy size={14} /> Copiar código</>}
          </Button>
        </div>

        <Button
          className="w-full"
          onClick={() => {
            clearCart()
            router.push("/minha-conta/pedidos")
          }}
        >
          Já paguei — ver meus pedidos
        </Button>
      </div>
    )
  }

  // ── Seleção de método ──────────────────────────────────────────
  const METHODS = [
    { id: "pix" as const,          label: "Pix",               icon: QrCode,     desc: "Aprovação imediata" },
    { id: "credit_card" as const,  label: "Cartão de crédito", icon: CreditCard, desc: "Em até 12x" },
    { id: "boleto" as const,       label: "Boleto",            icon: FileText,   desc: "Vence em 3 dias úteis" },
  ]

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-brown-muted hover:text-primary transition-colors">
          <ArrowLeft size={18} />
        </button>
        <h2 className="font-black text-xl text-brown-dark">Pagamento</h2>
      </div>

      <div className="space-y-3">
        {METHODS.map(({ id, label, icon: Icon, desc }) => (
          <button
            key={id}
            onClick={() => setMethod(id)}
            className={cn(
              "w-full flex items-center gap-4 p-4 rounded-card border-2 transition-all",
              method === id
                ? "border-primary bg-primary/5"
                : "border-bg-nude bg-white hover:border-brown-muted"
            )}
          >
            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center",
              method === id ? "bg-primary text-white" : "bg-bg-blush text-brown-muted"
            )}>
              <Icon size={18} />
            </div>
            <div className="text-left">
              <p className="font-extrabold text-sm text-brown-dark">{label}</p>
              <p className="font-semibold text-xs text-brown-muted">{desc}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Campo extra para boleto */}
      {method === "boleto" && (
        <Input
          label="CPF do pagador"
          value={cpf}
          onChange={(e) => setCpf(e.target.value)}
          placeholder="000.000.000-00"
          maxLength={14}
        />
      )}

      {/* Aviso cartão */}
      {method === "credit_card" && (
        <div className="bg-bg-blush rounded-lg p-4 text-sm font-semibold text-brown-muted">
          ℹ️ Os dados do cartão são inseridos de forma segura via Mercado Pago — nunca passam pelo servidor da loja.
        </div>
      )}

      {error && <p className="text-sm font-bold text-red-500 bg-red-50 rounded-lg p-3">{error}</p>}

      <div className="border-t border-bg-nude pt-4">
        <p className="text-sm font-semibold text-brown-muted mb-3 text-center">
          Total a pagar: <strong className="text-primary font-black text-lg">{formatPrice(shipping.price)}</strong>
          <span className="text-xs ml-1">(frete incluso)</span>
        </p>
        <Button
          size="lg"
          className="w-full"
          disabled={loading || (method === "boleto" && cpf.replace(/\D/g, "").length !== 11)}
          onClick={handleConfirm}
        >
          {loading ? "Processando..." : "Confirmar pedido"}
        </Button>
      </div>
    </div>
  )
}
