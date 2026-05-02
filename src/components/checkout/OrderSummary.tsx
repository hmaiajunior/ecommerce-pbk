import Image from "next/image"
import { useCartStore } from "@/store/cart"
import { formatPrice } from "@/lib/utils"
import { useSession } from "next-auth/react"

type Props = {
  shippingCost?: number
  discount?: number
}

export function OrderSummary({ shippingCost, discount = 0 }: Props) {
  const { items } = useCartStore()
  const { data: session, status } = useSession()
  const isWholesale = status === "authenticated"
    && session?.user.role === "WHOLESALE"
    && session.user.wholesaleApproved === true
  const sub = items.reduce((sum, item) => {
    const price = isWholesale && item.wholesalePrice ? item.wholesalePrice : item.retailPrice
    return sum + price * item.quantity
  }, 0)
  const total = sub - discount + (shippingCost ?? 0)

  return (
    <aside className="bg-white rounded-card p-5 shadow-[0_2px_16px_rgba(61,43,31,0.07)] space-y-4 sticky top-24">
      <p className="font-black text-[15px] text-brown-dark">Resumo</p>

      {/* Items */}
      <div className="space-y-3 max-h-60 overflow-y-auto">
        {items.map((item) => {
          const price = isWholesale && item.wholesalePrice ? item.wholesalePrice : item.retailPrice
          return (
            <div key={`${item.productId}-${item.size}`} className="flex gap-3">
              <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-bg-blush shrink-0">
                {item.imageUrl ? (
                  <Image src={item.imageUrl} alt={item.name} fill sizes="48px" className="object-cover" />
                ) : (
                  <span className="w-full h-full flex items-center justify-center text-lg">👕</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-xs text-brown-dark truncate">{item.name}</p>
                <p className="text-xs text-brown-muted font-semibold">Tam. {item.size} · ×{item.quantity}</p>
              </div>
              <span className="font-extrabold text-sm text-brown-dark shrink-0">
                {formatPrice(price * item.quantity)}
              </span>
            </div>
          )
        })}
      </div>

      {/* Totais */}
      <div className="border-t border-bg-nude pt-4 space-y-2">
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
          <span>{shippingCost != null ? formatPrice(shippingCost) : "—"}</span>
        </div>
        <div className="flex justify-between font-black text-lg text-brown-dark border-t border-bg-nude pt-3">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>
    </aside>
  )
}
