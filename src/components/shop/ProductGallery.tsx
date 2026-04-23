"use client"

import Image from "next/image"
import { useState } from "react"
import { cn } from "@/lib/utils"

type ProductImage = { url: string; alt?: string | null }

export function ProductGallery({
  images,
  name,
}: {
  images: ProductImage[]
  name: string
}) {
  const [selected, setSelected] = useState(0)

  if (images.length === 0) {
    return (
      <div className="aspect-square rounded-card bg-bg-blush flex items-center justify-center">
        <span className="text-[120px] opacity-30">👕</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Imagem principal */}
      <div className="relative aspect-square rounded-card overflow-hidden bg-bg-blush">
        <Image
          src={images[selected].url}
          alt={images[selected].alt ?? name}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
          priority
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={cn(
                "relative w-16 h-16 shrink-0 rounded-lg overflow-hidden border-2 transition-all",
                i === selected
                  ? "border-primary shadow-[0_2px_8px_rgba(255,107,74,0.30)]"
                  : "border-bg-nude hover:border-brown-muted"
              )}
            >
              <Image
                src={img.url}
                alt={img.alt ?? name}
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
