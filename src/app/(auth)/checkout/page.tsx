"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useCartStore } from "@/store/cart"
import { StepIndicator } from "@/components/checkout/StepIndicator"
import { OrderSummary } from "@/components/checkout/OrderSummary"
import { AddressStep } from "@/components/checkout/AddressStep"
import { ShippingStep } from "@/components/checkout/ShippingStep"
import { PaymentStep } from "@/components/checkout/PaymentStep"
import { IdentityStep } from "@/components/checkout/IdentityStep"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import type { ShippingQuote } from "@/lib/melhorenvio"

type Address = {
  id: string; street: string; number: string; complement?: string | null
  neighborhood: string; city: string; state: string; zipCode: string; isDefault: boolean
}

export default function CheckoutPage() {
  const router = useRouter()
  const { status } = useSession()
  const items = useCartStore((s) => s.items)
  const coupon = useCartStore((s) => s.coupon)
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [address, setAddress] = useState<Address | null>(null)
  const [shipping, setShipping] = useState<ShippingQuote | null>(null)

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 flex flex-col items-center gap-5">
        <span className="text-7xl opacity-25">🛒</span>
        <p className="font-black text-xl text-brown-dark">Carrinho vazio</p>
        <p className="font-semibold text-brown-muted text-sm">Adicione produtos antes de finalizar a compra.</p>
        <Button asChild><Link href="/produtos">Ver loja</Link></Button>
      </div>
    )
  }

  if (status === "loading") {
    return (
      <div className="mx-auto max-w-5xl px-4 md:px-8 py-10">
        <Skeleton className="h-8 w-48 mb-10" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-64 rounded-card" />
          </div>
          <Skeleton className="h-48 rounded-card" />
        </div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    return (
      <div className="mx-auto max-w-5xl px-4 md:px-8 py-10">
        <h1 className="font-black text-[28px] text-brown-dark mb-10">Finalizar compra</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-card p-6 shadow-[0_2px_16px_rgba(61,43,31,0.07)]">
            <IdentityStep />
          </div>
          <div>
            <OrderSummary />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 md:px-8 py-10">
      {/* Título + progress */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <h1 className="font-black text-[28px] text-brown-dark">Finalizar compra</h1>
        <StepIndicator current={step} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulário */}
        <div className="lg:col-span-2 bg-white rounded-card p-6 shadow-[0_2px_16px_rgba(61,43,31,0.07)]">
          {step === 1 && (
            <AddressStep
              onNext={(addr) => {
                setAddress(addr)
                setStep(2)
              }}
            />
          )}
          {step === 2 && address && (
            <ShippingStep
              address={address}
              onNext={(opt) => {
                setShipping(opt)
                setStep(3)
              }}
              onBack={() => setStep(1)}
            />
          )}
          {step === 3 && address && shipping && (
            <PaymentStep
              address={address}
              shipping={shipping}
              coupon={coupon}
              onBack={() => setStep(2)}
            />
          )}
        </div>

        {/* Resumo */}
        <div>
          <OrderSummary shippingCost={shipping?.price} discount={coupon?.discount} />
        </div>
      </div>
    </div>
  )
}
