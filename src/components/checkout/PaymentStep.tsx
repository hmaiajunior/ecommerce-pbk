"use client"

import { useState } from "react"
import { ArrowLeft, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/utils"
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
  coupon?: { code: string; discount: number } | null
  onBack: () => void
}

export function PaymentStep({ address, shipping, coupon, onBack }: Props) {
  const { items, clearCart } = useCartStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleConfirm() {
    setLoading(true)
    setError("")

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
      couponCode: coupon?.code,
    })

    if ("error" in orderResult) {
      setError(orderResult.error)
      setLoading(false)
      return
    }

    const res = await fetch("/api/checkout/create-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: orderResult.orderId }),
    })

    const json = await res.json()

    if (!res.ok || !json?.data?.checkoutUrl) {
      setError(json.error ?? "Erro ao iniciar pagamento.")
      setLoading(false)
      return
    }

    clearCart()
    window.location.href = json.data.checkoutUrl
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-brown-muted hover:text-primary transition-colors">
          <ArrowLeft size={18} />
        </button>
        <h2 className="font-black text-xl text-brown-dark">Pagamento</h2>
      </div>

      <div className="bg-bg-blush rounded-card p-5 space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary text-white flex items-center justify-center shrink-0">
            <Lock size={18} />
          </div>
          <div>
            <p className="font-extrabold text-sm text-brown-dark">
              Checkout seguro InfinitePay
            </p>
            <p className="font-semibold text-xs text-brown-muted mt-1 leading-relaxed">
              Ao confirmar, você será direcionado ao ambiente seguro da InfinitePay para pagar com <strong>Pix</strong> ou <strong>Cartão de crédito em até 12x</strong>. Depois do pagamento você volta automaticamente para a loja.
            </p>
          </div>
        </div>
      </div>

      {error && <p className="text-sm font-bold text-red-500 bg-red-50 rounded-lg p-3">{error}</p>}

      <div className="border-t border-bg-nude pt-4">
        <p className="text-sm font-semibold text-brown-muted mb-3 text-center">
          Total a pagar: <strong className="text-primary font-black text-lg">{formatPrice(shipping.price)}</strong>
          <span className="text-xs ml-1">(frete incluso)</span>
        </p>
        <Button
          size="lg"
          className="w-full"
          disabled={loading}
          onClick={handleConfirm}
        >
          {loading ? "Redirecionando..." : "Ir para pagamento"}
        </Button>
      </div>
    </div>
  )
}
