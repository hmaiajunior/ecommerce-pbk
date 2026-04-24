"use client"

import Image from "next/image"
import { Minus, Plus, Trash2 } from "lucide-react"
import { useCartStore, type CartItem as CartItemType } from "@/store/cart"
import { formatPrice } from "@/lib/utils"
import { useSession } from "next-auth/react"

export function CartItem({ item }: { item: CartItemType }) {
  const { updateQuantity, removeItem } = useCartStore()
  const { data: session, status } = useSession()
  const isWholesale = status === "authenticated"
    && session?.user.role === "WHOLESALE"
    && session.user.wholesaleApproved === true
  const price = isWholesale && item.wholesalePrice ? item.wholesalePrice : item.retailPrice

  return (
    <div className="flex gap-3 py-3 border-b border-bg-nude last:border-0">
      {/* Imagem */}
      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-bg-blush shrink-0">
        {item.imageUrl ? (
          <Image src={item.imageUrl} alt={item.name} fill sizes="64px" className="object-cover" />
        ) : (
          <span className="w-full h-full flex items-center justify-center text-2xl">👕</span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-extrabold text-sm text-brown-dark leading-tight truncate">{item.name}</p>
        <p className="text-xs font-bold text-brown-muted mt-0.5">Tam. {item.size}</p>

        <div className="flex items-center justify-between mt-2">
          {/* Controles de quantidade */}
          <div className="flex items-center gap-1 bg-bg-blush rounded-pill overflow-hidden">
            <button
              onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
              className="w-7 h-7 flex items-center justify-center text-brown-mid hover:text-primary transition-colors"
              aria-label="Diminuir"
            >
              <Minus size={12} />
            </button>
            <span className="font-black text-sm text-brown-dark w-6 text-center">
              {item.quantity}
            </span>
            <button
              onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
              className="w-7 h-7 flex items-center justify-center text-brown-mid hover:text-primary transition-colors"
              aria-label="Aumentar"
            >
              <Plus size={12} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-black text-[15px] text-primary">
              {formatPrice(price * item.quantity)}
            </span>
            <button
              onClick={() => removeItem(item.productId, item.size)}
              className="text-brown-muted hover:text-red-400 transition-colors"
              aria-label="Remover"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
