"use client"

import Link from "next/link"
import { X, ShoppingBag } from "lucide-react"
import { useCartStore } from "@/store/cart"
import { useUIStore } from "@/store/ui"
import { CartItem } from "./CartItem"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/utils"

export function CartDrawer() {
  const { cartOpen, closeCart } = useUIStore()
  const { items, subtotal, clearCart } = useCartStore()

  return (
    <>
      {/* Overlay */}
      {cartOpen && (
        <div
          className="fixed inset-0 bg-brown-dark/40 z-40 backdrop-blur-sm"
          onClick={closeCart}
          aria-hidden
        />
      )}

      {/* Painel */}
      <aside
        className={`fixed top-0 right-0 h-full w-full max-w-[400px] bg-bg-cream z-50 shadow-[−8px_0_40px_rgba(61,43,31,0.15)] flex flex-col transition-transform duration-300 ease-out ${
          cartOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-label="Carrinho"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-bg-nude">
          <div className="flex items-center gap-2">
            <ShoppingBag size={18} className="text-primary" />
            <span className="font-black text-[17px] text-brown-dark">Carrinho</span>
            {items.length > 0 && (
              <span className="bg-primary text-white text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                {items.length}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="w-8 h-8 rounded-full bg-bg-blush flex items-center justify-center text-brown-mid hover:bg-bg-nude transition-colors"
            aria-label="Fechar carrinho"
          >
            <X size={16} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-2">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 py-16">
              <span className="text-6xl opacity-30">🛒</span>
              <p className="font-extrabold text-brown-dark">Seu carrinho está vazio</p>
              <p className="font-semibold text-sm text-brown-muted text-center">
                Explore nossa loja e adicione produtos incríveis!
              </p>
              <Button variant="primary" onClick={closeCart} asChild>
                <Link href="/produtos">Ver loja</Link>
              </Button>
            </div>
          ) : (
            <div>
              {items.map((item) => (
                <CartItem key={`${item.productId}-${item.size}`} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-5 py-5 border-t border-bg-nude space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-bold text-sm text-brown-muted">Subtotal</span>
              <span className="font-black text-xl text-brown-dark">{formatPrice(subtotal())}</span>
            </div>
            <p className="text-xs font-semibold text-brown-muted">
              Frete calculado no checkout
            </p>
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={closeCart}
              asChild
            >
              <Link href="/checkout">Finalizar compra</Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={closeCart}
              asChild
            >
              <Link href="/carrinho">Ver carrinho completo</Link>
            </Button>
          </div>
        )}
      </aside>
    </>
  )
}
