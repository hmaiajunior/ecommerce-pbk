"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

type Category  = { id: string; name: string; slug: string }
type AgeRange  = { id: string; name: string }

const SIZES = ["RN", "P", "M", "G", "GG", "1", "2", "4", "6", "8", "10", "12", "14", "16"]

const PRICE_RANGES = [
  { label: "Até R$ 50",        min: undefined,  max: 50  },
  { label: "R$ 50 a R$ 100",   min: 50,         max: 100 },
  { label: "R$ 100 a R$ 200",  min: 100,        max: 200 },
  { label: "Acima de R$ 200",  min: 200,         max: undefined },
]

type Props = {
  categories: Category[]
  ageRanges: AgeRange[]
}

export function FilterSidebar({ categories, ageRanges }: Props) {
  const router = useRouter()
  const params = useSearchParams()

  const active = {
    category:  params.get("category"),
    ageRange:  params.get("ageRange"),
    size:      params.get("size"),
    minPrice:  params.get("minPrice"),
    maxPrice:  params.get("maxPrice"),
  }

  function set(key: string, value: string | null) {
    const next = new URLSearchParams(params.toString())
    value ? next.set(key, value) : next.delete(key)
    next.delete("page")
    router.push(`/produtos?${next.toString()}`, { scroll: false })
  }

  function setPriceRange(min?: number, max?: number) {
    const next = new URLSearchParams(params.toString())
    min ? next.set("minPrice", String(min)) : next.delete("minPrice")
    max ? next.set("maxPrice", String(max)) : next.delete("maxPrice")
    next.delete("page")
    router.push(`/produtos?${next.toString()}`, { scroll: false })
  }

  const activePriceRange = PRICE_RANGES.find(
    (r) =>
      String(r.min ?? "") === (active.minPrice ?? "") &&
      String(r.max ?? "") === (active.maxPrice ?? "")
  )

  const hasFilters =
    active.category || active.ageRange || active.size || active.minPrice || active.maxPrice

  function clearAll() {
    router.push("/produtos", { scroll: false })
  }

  return (
    <aside className="w-full lg:w-[240px] shrink-0 space-y-6">

      {/* Header filtros */}
      <div className="flex items-center justify-between">
        <p className="font-black text-[15px] text-brown-dark">Filtros</p>
        {hasFilters && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 text-xs font-bold text-primary hover:underline"
          >
            <X size={12} /> Limpar
          </button>
        )}
      </div>

      {/* Categorias */}
      <div>
        <p className="text-xs font-black uppercase tracking-[0.1em] text-brown-muted mb-3">
          Categoria
        </p>
        <ul className="space-y-1">
          {categories.map((cat) => (
            <li key={cat.id}>
              <button
                onClick={() => set("category", active.category === cat.slug ? null : cat.slug)}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-lg font-bold text-sm transition-colors",
                  active.category === cat.slug
                    ? "bg-primary/10 text-primary"
                    : "text-brown-mid hover:bg-bg-blush"
                )}
              >
                {cat.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Faixa etária */}
      <div>
        <p className="text-xs font-black uppercase tracking-[0.1em] text-brown-muted mb-3">
          Faixa etária
        </p>
        <div className="flex flex-wrap gap-2">
          {ageRanges.map((ar) => (
            <button
              key={ar.id}
              onClick={() => set("ageRange", active.ageRange === ar.id ? null : ar.id)}
              className={cn(
                "px-3 py-1.5 rounded-pill font-bold text-xs transition-colors",
                active.ageRange === ar.id
                  ? "bg-primary text-white shadow-[0_4px_14px_rgba(255,107,74,0.25)]"
                  : "bg-bg-blush text-brown-mid hover:bg-bg-nude"
              )}
            >
              {ar.name}
            </button>
          ))}
        </div>
      </div>

      {/* Tamanhos */}
      <div>
        <p className="text-xs font-black uppercase tracking-[0.1em] text-brown-muted mb-3">
          Tamanho
        </p>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((s) => (
            <button
              key={s}
              onClick={() => set("size", active.size === s ? null : s)}
              className={cn(
                "w-10 h-10 rounded-lg font-extrabold text-xs transition-colors",
                active.size === s
                  ? "bg-primary text-white shadow-[0_4px_14px_rgba(255,107,74,0.25)]"
                  : "bg-bg-blush text-brown-mid hover:bg-bg-nude"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Faixa de preço */}
      <div>
        <p className="text-xs font-black uppercase tracking-[0.1em] text-brown-muted mb-3">
          Preço
        </p>
        <ul className="space-y-1">
          {PRICE_RANGES.map((r) => {
            const isActive = activePriceRange?.label === r.label
            return (
              <li key={r.label}>
                <button
                  onClick={() =>
                    isActive ? setPriceRange() : setPriceRange(r.min, r.max)
                  }
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-lg font-bold text-sm transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-brown-mid hover:bg-bg-blush"
                  )}
                >
                  {r.label}
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </aside>
  )
}
