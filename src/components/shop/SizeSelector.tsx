"use client"

import { cn } from "@/lib/utils"

type Size = { size: string; stock: number }

type Props = {
  sizes: Size[]
  selected: string | null
  onChange: (size: string) => void
}

export function SizeSelector({ sizes, selected, onChange }: Props) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="font-extrabold text-sm text-brown-dark">Tamanho</p>
        {selected && (
          <span className="text-xs font-bold text-brown-muted">
            Selecionado: <span className="text-primary">{selected}</span>
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {sizes.map(({ size, stock }) => {
          const isOut = stock === 0
          const isLow = stock > 0 && stock <= 3
          return (
            <button
              key={size}
              disabled={isOut}
              onClick={() => onChange(size)}
              className={cn(
                "min-w-[44px] h-[44px] px-3 rounded-lg font-extrabold text-sm transition-all",
                isOut
                  ? "bg-bg-nude text-brown-light cursor-not-allowed line-through opacity-60"
                  : selected === size
                  ? "bg-primary text-white shadow-[0_4px_14px_rgba(255,107,74,0.30)]"
                  : "bg-bg-blush text-brown-mid hover:bg-bg-nude"
              )}
              title={isOut ? "Esgotado" : isLow ? `Últimas ${stock} unidades` : undefined}
            >
              {size}
              {isLow && !isOut && (
                <span className="block text-[9px] leading-none text-primary font-black">
                  ùlt.
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
