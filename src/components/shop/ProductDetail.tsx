"use client"

import { useState } from "react"
import { ProductGallery } from "./ProductGallery"
import { SizeSelector } from "./SizeSelector"
import { AddToCartButton } from "./AddToCartButton"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/utils"
import { useSession } from "next-auth/react"

type Size  = { size: string; stock: number }
type Image = { url: string; alt?: string | null }

type Props = {
  id: string
  name: string
  slug: string
  description?: string | null
  fabric?: string | null
  retailPrice: number
  wholesalePrice?: number | null
  wholesaleMinQty?: number | null
  featured: boolean
  images: Image[]
  sizes: Size[]
  category: { name: string; slug: string }
  ageRange: { name: string }
}

export function ProductDetail({
  id, name, slug, description, fabric,
  retailPrice, wholesalePrice, wholesaleMinQty,
  featured, images, sizes, category, ageRange,
}: Props) {
  const { data: session, status } = useSession()
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)

  const isWholesale = status === "authenticated"
    && session?.user.role === "WHOLESALE"
    && session.user.wholesaleApproved === true
  const displayPrice = isWholesale && wholesalePrice ? wholesalePrice : retailPrice
  const showWholesaleSavings = isWholesale && wholesalePrice && wholesalePrice < retailPrice

  const firstImage = images[0]?.url ?? null

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
      {/* Galeria */}
      <ProductGallery images={images} name={name} />

      {/* Detalhes */}
      <div className="flex flex-col gap-5">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-bold text-brown-muted">
          <span>{ageRange.name}</span>
          <span>·</span>
          <span>{category.name}</span>
          {featured && (
            <>
              <span>·</span>
              <Badge variant="novo" size="sm">Novo</Badge>
            </>
          )}
        </div>

        {/* Nome */}
        <h1 className="font-black text-[28px] md:text-[32px] text-brown-dark leading-tight">
          {name}
        </h1>

        {/* Preço */}
        <div className="flex items-baseline gap-3">
          <span className="font-black text-[32px] text-primary">
            {formatPrice(displayPrice)}
          </span>
          {showWholesaleSavings && (
            <span className="font-bold text-[16px] text-brown-muted line-through">
              {formatPrice(retailPrice)}
            </span>
          )}
          {isWholesale && wholesalePrice && (
            <Badge variant="atacado" size="sm">Preço atacado</Badge>
          )}
        </div>

        {/* Mínimo atacado */}
        {isWholesale && wholesaleMinQty && (
          <p className="text-xs font-bold text-brown-muted bg-bg-blush px-3 py-2 rounded-lg">
            ⚠️ Mínimo de <strong>{wholesaleMinQty} unidades</strong> para este produto no atacado.
          </p>
        )}

        {/* Seletor de tamanho */}
        <SizeSelector
          sizes={sizes}
          selected={selectedSize}
          onChange={setSelectedSize}
        />

        {/* Quantidade */}
        <div>
          <p className="text-xs font-black uppercase tracking-[0.1em] text-brown-muted mb-2">
            Quantidade
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              className="w-9 h-9 rounded-full border-2 border-bg-nude flex items-center justify-center font-black text-brown-mid hover:border-primary hover:text-primary transition-colors"
            >
              −
            </button>
            <span className="font-black text-lg text-brown-dark w-6 text-center">{quantity}</span>
            <button
              onClick={() => setQuantity(q => q + 1)}
              className="w-9 h-9 rounded-full border-2 border-bg-nude flex items-center justify-center font-black text-brown-mid hover:border-primary hover:text-primary transition-colors"
            >
              +
            </button>
          </div>
        </div>

        {/* Botão */}
        <AddToCartButton
          productId={id}
          slug={slug}
          name={name}
          retailPrice={retailPrice}
          wholesalePrice={wholesalePrice ?? null}
          selectedSize={selectedSize}
          imageUrl={firstImage}
          quantity={quantity}
        />

        {/* Descrição */}
        {description && (
          <div className="border-t border-bg-nude pt-5">
            <p className="text-xs font-black uppercase tracking-[0.1em] text-brown-muted mb-2">
              Descrição
            </p>
            <p className="font-semibold text-sm text-brown-mid leading-relaxed">
              {description}
            </p>
          </div>
        )}

        {/* Composição */}
        {fabric && (
          <div className="border-t border-bg-nude pt-5">
            <p className="text-xs font-black uppercase tracking-[0.1em] text-brown-muted mb-2">
              Composição
            </p>
            <p className="font-semibold text-sm text-brown-mid">{fabric}</p>
          </div>
        )}
      </div>
    </div>
  )
}
