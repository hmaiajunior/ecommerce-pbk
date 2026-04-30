"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Heart } from "lucide-react"
import { toggleWishlist } from "@/actions/wishlist"
import { useWishlistStore } from "@/store/wishlist"
import { cn } from "@/lib/utils"

type Props = {
  productId: string
  variant?: "card" | "detail"
  className?: string
}

export function WishlistButton({ productId, variant = "card", className }: Props) {
  const router = useRouter()
  const { status } = useSession()
  const isFavorited = useWishlistStore((s) => s.ids.has(productId))
  const toggleLocal = useWishlistStore((s) => s.toggle)
  const [isPending, startTransition] = useTransition()

  function handleClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    if (status !== "authenticated") {
      router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`)
      return
    }

    // Atualização otimista
    toggleLocal(productId)

    startTransition(async () => {
      const result = await toggleWishlist(productId)
      if (!result.ok) {
        // Reverte em caso de erro
        toggleLocal(productId)
      }
    })
  }

  const isCard = variant === "card"

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-label={isFavorited ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      aria-pressed={isFavorited}
      title={isFavorited ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      className={cn(
        "flex items-center justify-center rounded-full transition-all duration-150 active:scale-90",
        isCard
          ? "w-9 h-9 bg-white/95 backdrop-blur-sm shadow-[0_2px_8px_rgba(61,43,31,0.15)] hover:bg-white"
          : "w-11 h-11 bg-bg-blush hover:bg-bg-nude border-2 border-bg-nude",
        isPending && "opacity-60",
        className
      )}
    >
      <Heart
        size={isCard ? 16 : 18}
        className={cn(
          "transition-all",
          isFavorited
            ? "fill-primary text-primary"
            : "text-brown-muted"
        )}
      />
    </button>
  )
}
