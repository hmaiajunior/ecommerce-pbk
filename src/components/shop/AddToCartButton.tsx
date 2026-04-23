"use client"

import { useState } from "react"
import { ShoppingBag, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/store/cart"

type Props = {
  productId: string
  slug: string
  name: string
  retailPrice: number
  wholesalePrice: number | null
  selectedSize: string | null
  imageUrl: string | null
}

export function AddToCartButton({
  productId,
  slug,
  name,
  retailPrice,
  wholesalePrice,
  selectedSize,
  imageUrl,
}: Props) {
  const addItem = useCartStore((s) => s.addItem)
  const [added, setAdded] = useState(false)

  function handleClick() {
    if (!selectedSize) return
    addItem({
      productId,
      slug,
      name,
      size: selectedSize,
      retailPrice,
      wholesalePrice,
      imageUrl,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  if (!selectedSize) {
    return (
      <Button size="lg" className="w-full opacity-60 cursor-not-allowed" disabled>
        <ShoppingBag size={18} /> Selecione um tamanho
      </Button>
    )
  }

  return (
    <Button
      size="lg"
      className="w-full"
      onClick={handleClick}
      variant={added ? "teal" : "primary"}
    >
      {added ? (
        <><Check size={18} /> Adicionado!</>
      ) : (
        <><ShoppingBag size={18} /> Adicionar ao carrinho</>
      )}
    </Button>
  )
}
