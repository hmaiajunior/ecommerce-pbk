"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { useWishlistStore } from "@/store/wishlist"
import { getWishlistIds } from "@/actions/wishlist"

export function WishlistHydrator() {
  const { status } = useSession()
  const setIds = useWishlistStore((s) => s.setIds)
  const clear = useWishlistStore((s) => s.clear)

  useEffect(() => {
    if (status === "authenticated") {
      getWishlistIds().then(setIds).catch(() => setIds([]))
    } else if (status === "unauthenticated") {
      clear()
    }
  }, [status, setIds, clear])

  return null
}
