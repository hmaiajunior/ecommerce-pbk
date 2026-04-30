"use client"

import { create } from "zustand"

type WishlistStore = {
  ids: Set<string>
  hydrated: boolean
  setIds: (ids: string[]) => void
  toggle: (productId: string) => void
  has: (productId: string) => boolean
  clear: () => void
}

export const useWishlistStore = create<WishlistStore>((set, get) => ({
  ids: new Set(),
  hydrated: false,

  setIds: (ids) => set({ ids: new Set(ids), hydrated: true }),

  toggle: (productId) =>
    set((state) => {
      const next = new Set(state.ids)
      if (next.has(productId)) next.delete(productId)
      else next.add(productId)
      return { ids: next }
    }),

  has: (productId) => get().ids.has(productId),

  clear: () => set({ ids: new Set(), hydrated: false }),
}))
