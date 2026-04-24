"use client"

import Link from "next/link"
import { ShoppingBag, ArrowLeft } from "lucide-react"
import { useCartStore } from "@/store/cart"
import { CartItem } from "@/components/cart/CartItem"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/utils"
import { useState } from "react"
import { applyCoupon } from "@/actions/checkout"

export default function CarrinhoPage() {
  const { items, subtotal, clearCart, coupon, setCoupon } = useCartStore()
  const [couponCode, setCouponCode] = useState(coupon?.code ?? "")
  const [couponError, setCouponError] = useState("")
  const [loadingCoupon, setLoadingCoupon] = useState(false)

  const sub = subtotal()
  const discount = coupon?.discount ?? 0
  const total = sub - discount

  async function handleCoupon() {
    if (!couponCode.trim()) return
    setLoadingCoupon(true)
    setCouponError("")
    const result = await applyCoupon(couponCode, sub)
    setLoadingCoupon(false)
    if ("error" in result) {
      setCouponError(result.error)
    } else {
      setCoupon({ discount: result.discount, code: couponCode.toUpperCase() })
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 flex flex-col items-center gap-5">
        <span className="text-8xl opacity-25">🛒</span>
        <h1 className="font-black text-2xl text-brown-dark">Seu carrinho está vazio</h1>
        <p className="font-semibold text-brown-muted">Explore nossa loja e encontre produtos incríveis!</p>
        <Button asChild><Link href="/produtos">Ver loja</Link></Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 md:px-8 py-10">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/produtos" className="text-brown-muted hover:text-primary transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="font-black text-[28px] text-brown-dark">Carrinho</h1>
        <span className="bg-primary/10 text-primary font-black text-sm px-3 py-1 rounded-pill">
          {items.length} {items.length === 1 ? "item" : "itens"}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lista de itens */}
        <div className="lg:col-span-2 bg-white rounded-card p-6 shadow-[0_2px_16px_rgba(61,43,31,0.07)]">
          {items.map((item) => (
            <CartItem key={`${item.productId}-${item.size}`} item={item} />
          ))}
          <button
            onClick={() => clearCart()}
            className="mt-4 text-xs font-bold text-brown-muted hover:text-red-400 transition-colors"
          >
            Limpar carrinho
          </button>
        </div>

        {/* Resumo */}
        <div className="bg-white rounded-card p-6 shadow-[0_2px_16px_rgba(61,43,31,0.07)] h-fit sticky top-24 space-y-5">
          <p className="font-black text-[17px] text-brown-dark">Resumo do pedido</p>

          {/* Cupom */}
          {coupon ? (
            <div className="flex items-center justify-between bg-primary/10 rounded-lg px-3 py-2">
              <div>
                <p className="font-extrabold text-sm text-primary">{coupon.code}</p>
                <p className="text-xs font-bold text-brown-muted">− {formatPrice(coupon.discount)}</p>
              </div>
              <button
                onClick={() => setCoupon(null)}
                className="text-xs font-bold text-brown-muted hover:text-red-400"
              >
                Remover
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="Cupom de desconto"
                className="flex-1 border border-bg-nude rounded-lg px-3 py-2 text-sm font-bold text-brown-dark placeholder:text-brown-muted outline-none focus:border-primary"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCoupon}
                disabled={loadingCoupon || !couponCode}
              >
                {loadingCoupon ? "..." : "Aplicar"}
              </Button>
            </div>
          )}
          {couponError && <p className="text-xs font-bold text-red-500">{couponError}</p>}

          {/* Totais */}
          <div className="space-y-2 border-t border-bg-nude pt-4">
            <div className="flex justify-between text-sm font-semibold text-brown-muted">
              <span>Subtotal</span>
              <span>{formatPrice(sub)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm font-bold text-primary">
                <span>Desconto</span>
                <span>− {formatPrice(discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-semibold text-brown-muted">
              <span>Frete</span>
              <span className="text-secondary font-bold">Calculado no checkout</span>
            </div>
            <div className="flex justify-between font-black text-lg text-brown-dark border-t border-bg-nude pt-3">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>

          <Button size="lg" className="w-full" asChild>
            <Link href="/checkout">
              <ShoppingBag size={16} /> Finalizar compra
            </Link>
          </Button>

          <Link href="/produtos" className="block text-center text-sm font-bold text-brown-muted hover:text-primary transition-colors">
            ← Continuar comprando
          </Link>
        </div>
      </div>
    </div>
  )
}
