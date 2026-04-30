"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { SessionProvider } from "next-auth/react"
import { useState } from "react"
import { CartDrawer } from "@/components/cart/CartDrawer"
import { CartSyncer } from "@/components/cart/CartSyncer"
import { WishlistHydrator } from "@/components/providers/WishlistHydrator"

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <WishlistHydrator />
        <CartSyncer />
        {children}
        <CartDrawer />
      </QueryClientProvider>
    </SessionProvider>
  )
}
