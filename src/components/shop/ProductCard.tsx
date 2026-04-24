"use client"

import Image from "next/image"
import Link from "next/link"
import { ShoppingBag } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/store/cart"
import { formatPrice } from "@/lib/utils"
import { useSession } from "next-auth/react"

type ProductCardProps = {
  id: string
  name: string
  slug: string
  retailPrice: number | string
  wholesalePrice?: number | string | null
  featured?: boolean
  images: { url: string; alt?: string | null }[]
  sizes: { size: string }[]
}

export function ProductCard({
  id,
  name,
  slug,
  retailPrice,
  wholesalePrice,
  featured,
  images,
  sizes,
}: ProductCardProps) {
  const { data: session, status } = useSession()
  const addItem = useCartStore((s) => s.addItem)

  // Só mostra preço atacado quando a sessão estiver confirmada (não durante loading)
  const isWholesale = status === "authenticated"
    && session?.user.role === "WHOLESALE"
    && session.user.wholesaleApproved === true
  const price = isWholesale && wholesalePrice ? Number(wholesalePrice) : Number(retailPrice)
  const showWholesale = isWholesale && wholesalePrice

  const image = images[0]
  const availableSizes = sizes.map((s) => s.size)
  const isSoldOut = sizes.length === 0

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault()
    if (isSoldOut || availableSizes.length === 0) return
    addItem({
      productId: id,
      slug,
      name,
      size: availableSizes[0],
      retailPrice: Number(retailPrice),
      wholesalePrice: wholesalePrice ? Number(wholesalePrice) : null,
      imageUrl: image?.url ?? null,
    })
  }

  return (
    <Link
      href={`/produto/${slug}`}
      className="group flex flex-col bg-white rounded-card overflow-hidden shadow-[0_2px_16px_rgba(61,43,31,0.09)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_8px_28px_rgba(61,43,31,0.14)]"
    >
      {/* Imagem */}
      <div className="relative h-[200px] bg-bg-blush flex items-center justify-center overflow-hidden">
        {image ? (
          <Image
            src={image.url}
            alt={image.alt ?? name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <span className="text-6xl opacity-40">👕</span>
        )}
        {featured && !isSoldOut && (
          <div className="absolute top-3 left-3">
            <Badge variant="novo">Novo</Badge>
          </div>
        )}
        {isSoldOut && (
          <div className="absolute top-3 left-3">
            <Badge variant="esgotado">Esgotado</Badge>
          </div>
        )}
        {showWholesale && (
          <div className="absolute top-3 right-3">
            <Badge variant="atacado">Atacado</Badge>
          </div>
        )}
      </div>

      {/* Corpo */}
      <div className="flex flex-col flex-1 p-4">
        <p className="font-extrabold text-[15px] text-brown-dark mb-2 leading-snug">
          {name}
        </p>

        {/* Tamanhos */}
        {availableSizes.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {availableSizes.slice(0, 5).map((s) => (
              <span
                key={s}
                className="text-[11px] font-bold text-brown-muted bg-bg-blush px-2 py-0.5 rounded-pill"
              >
                {s}
              </span>
            ))}
            {availableSizes.length > 5 && (
              <span className="text-[11px] font-bold text-brown-muted">
                +{availableSizes.length - 5}
              </span>
            )}
          </div>
        )}

        {/* Preço */}
        <div className="flex items-baseline gap-2 mt-auto mb-3">
          {isSoldOut ? (
            <span className="text-sm font-bold text-brown-light">Esgotado</span>
          ) : (
            <>
              <span className="font-black text-[20px] text-primary">
                {formatPrice(price)}
              </span>
              {showWholesale && (
                <span className="text-[13px] font-bold text-brown-muted line-through">
                  {formatPrice(Number(retailPrice))}
                </span>
              )}
            </>
          )}
        </div>

        <Button
          variant="primary"
          size="sm"
          className="w-full"
          disabled={isSoldOut}
          onClick={handleAddToCart}
        >
          <ShoppingBag size={14} />
          {isSoldOut ? "Indisponível" : "Adicionar"}
        </Button>
      </div>
    </Link>
  )
}
