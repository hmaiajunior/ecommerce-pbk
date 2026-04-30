"use client"

import { useState } from "react"
import { Ruler } from "lucide-react"
import { cn } from "@/lib/utils"
import { SizeGuideModal } from "./SizeGuideModal"

type Size = { size: string; stock: number }

type Props = {
  sizes: Size[]
  selected: string | null
  onChange: (size: string) => void
}

const LOW_STOCK_THRESHOLD = 3

export function SizeSelector({ sizes, selected, onChange }: Props) {
  const [guideOpen, setGuideOpen] = useState(false)
  const selectedStock = sizes.find((s) => s.size === selected)?.stock ?? 0
  const showLowStockWarning = selected && selectedStock > 0 && selectedStock <= LOW_STOCK_THRESHOLD

  return (
    <div>
      <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
        <p className="font-extrabold text-sm text-brown-dark">Tamanho</p>
        <button
          type="button"
          onClick={() => setGuideOpen(true)}
          className="flex items-center gap-1.5 text-xs font-extrabold text-primary hover:underline"
        >
          <Ruler size={13} />
          Tabela de medidas
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {sizes.map(({ size, stock }) => {
          const isOut = stock === 0
          const isLow = stock > 0 && stock <= LOW_STOCK_THRESHOLD
          const isSelected = selected === size
          return (
            <button
              key={size}
              disabled={isOut}
              onClick={() => onChange(size)}
              className={cn(
                "relative min-w-[44px] h-[44px] px-3 rounded-lg font-extrabold text-sm transition-all",
                isOut
                  ? "bg-bg-nude text-brown-light cursor-not-allowed line-through opacity-60"
                  : isSelected
                  ? "bg-primary text-white shadow-[0_4px_14px_rgba(255,107,74,0.30)]"
                  : "bg-bg-blush text-brown-mid hover:bg-bg-nude"
              )}
              title={isOut ? "Esgotado" : isLow ? `Últimas ${stock} unidades` : undefined}
            >
              {size}
              {isLow && !isOut && (
                <span
                  className={cn(
                    "absolute -top-1.5 -right-1.5 text-[9px] font-black px-1.5 py-0.5 rounded-full leading-none",
                    isSelected ? "bg-white text-primary" : "bg-primary text-white"
                  )}
                >
                  {stock}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {showLowStockWarning && (
        <div className="mt-3 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <p className="text-xs font-extrabold text-amber-800">
            {selectedStock === 1
              ? "Última peça disponível neste tamanho!"
              : `Últimas ${selectedStock} peças neste tamanho`}
          </p>
        </div>
      )}

      <SizeGuideModal open={guideOpen} onClose={() => setGuideOpen(false)} />
    </div>
  )
}
