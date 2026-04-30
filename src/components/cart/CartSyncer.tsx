"use client"

import { useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { useCartStore } from "@/store/cart"
import { saveCartSnapshot } from "@/actions/abandoned-cart"

// Faz debounce de 4s antes de enviar para evitar muitas chamadas
// enquanto o cliente edita o carrinho.
const DEBOUNCE_MS = 4000

export function CartSyncer() {
  const { status } = useSession()
  const items = useCartStore((s) => s.items)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastSerializedRef = useRef<string>("")

  useEffect(() => {
    if (status !== "authenticated") return

    const serialized = JSON.stringify(items)
    if (serialized === lastSerializedRef.current) return
    lastSerializedRef.current = serialized

    if (timerRef.current) clearTimeout(timerRef.current)

    timerRef.current = setTimeout(() => {
      const snapshot = items.map((i) => ({
        productId: i.productId,
        slug: i.slug,
        name: i.name,
        size: i.size,
        quantity: i.quantity,
        price: i.retailPrice,
        imageUrl: i.imageUrl,
      }))
      saveCartSnapshot(snapshot).catch(() => {})
    }, DEBOUNCE_MS)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [items, status])

  return null
}
