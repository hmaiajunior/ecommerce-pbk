"use client"

import { Truck, CheckCircle2 } from "lucide-react"
import { FREE_SHIPPING_MIN } from "@/lib/shipping-config"
import { formatPrice } from "@/lib/utils"

type Props = {
  subtotal: number
}

export function FreeShippingProgress({ subtotal }: Props) {
  const remaining = Math.max(0, FREE_SHIPPING_MIN - subtotal)
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_MIN) * 100)
  const unlocked = remaining === 0

  return (
    <div
      className={`rounded-card p-3 border ${
        unlocked
          ? "bg-emerald-50 border-emerald-200"
          : "bg-bg-blush border-bg-nude"
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        {unlocked ? (
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
        ) : (
          <Truck size={16} className="text-primary shrink-0" />
        )}
        <p
          className={`font-extrabold text-xs leading-tight ${
            unlocked ? "text-emerald-800" : "text-brown-dark"
          }`}
        >
          {unlocked ? (
            <>Você ganhou <span className="text-emerald-700">FRETE GRÁTIS!</span> 🎉</>
          ) : (
            <>
              Faltam <span className="text-primary">{formatPrice(remaining)}</span> para o
              <span className="text-primary"> FRETE GRÁTIS</span>
            </>
          )}
        </p>
      </div>

      <div className="h-2 rounded-full bg-white overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            unlocked ? "bg-emerald-500" : "bg-primary"
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
