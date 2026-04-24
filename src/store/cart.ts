"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export type CartItem = {
  productId: string
  slug: string
  name: string
  size: string
  quantity: number
  retailPrice: number
  wholesalePrice: number | null
  imageUrl: string | null
}

type CartStore = {
  items: CartItem[]
  coupon: { code: string; discount: number } | null
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void
  removeItem: (productId: string, size: string) => void
  updateQuantity: (productId: string, size: string, quantity: number) => void
  clearCart: () => void
  setCoupon: (coupon: { code: string; discount: number } | null) => void
  subtotal: () => number
  itemCount: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      coupon: null,

      setCoupon: (coupon) => set({ coupon }),

      addItem: (newItem) => {
        const qty = newItem.quantity ?? 1
        const existing = get().items.find(
          (i) => i.productId === newItem.productId && i.size === newItem.size
        )
        if (existing) {
          set((state) => ({
            items: state.items.map((i) =>
              i.productId === newItem.productId && i.size === newItem.size
                ? { ...i, quantity: i.quantity + qty }
                : i
            ),
          }))
        } else {
          set((state) => ({
            items: [...state.items, { ...newItem, quantity: qty }],
          }))
        }
      },

      removeItem: (productId, size) =>
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.productId === productId && i.size === size)
          ),
        })),

      updateQuantity: (productId, size, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId, size)
          return
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId && i.size === size
              ? { ...i, quantity }
              : i
          ),
        }))
      },

      clearCart: () => set({ items: [], coupon: null }),

      subtotal: () =>
        get().items.reduce((sum, item) => {
          return sum + item.retailPrice * item.quantity
        }, 0),

      itemCount: () =>
        get().items.reduce((count, item) => count + item.quantity, 0),
    }),
    { name: "playbekids-cart" }
  )
)
