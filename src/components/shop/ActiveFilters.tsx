"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { X } from "lucide-react"

type Category = { id: string; name: string; slug: string }
type AgeRange  = { id: string; name: string }

type Props = {
  categories: Category[]
  ageRanges: AgeRange[]
}

export function ActiveFilters({ categories, ageRanges }: Props) {
  const router = useRouter()
  const params = useSearchParams()

  const chips: { key: string; label: string; value: string }[] = []

  const category = params.get("category")
  if (category) {
    const found = categories.find((c) => c.slug === category)
    if (found) chips.push({ key: "category", label: found.name, value: category })
  }

  const ageRange = params.get("ageRange")
  if (ageRange) {
    const found = ageRanges.find((a) => a.id === ageRange)
    if (found) chips.push({ key: "ageRange", label: found.name, value: ageRange })
  }

  const size = params.get("size")
  if (size) chips.push({ key: "size", label: `Tam. ${size}`, value: size })

  const minPrice = params.get("minPrice")
  const maxPrice = params.get("maxPrice")
  if (minPrice || maxPrice) {
    const label =
      !minPrice ? `Até R$ ${maxPrice}` :
      !maxPrice ? `A partir de R$ ${minPrice}` :
      `R$ ${minPrice} – R$ ${maxPrice}`
    chips.push({ key: "__price", label, value: "" })
  }

  if (chips.length === 0) return null

  function remove(key: string) {
    const next = new URLSearchParams(params.toString())
    if (key === "__price") {
      next.delete("minPrice")
      next.delete("maxPrice")
    } else {
      next.delete(key)
    }
    next.delete("page")
    router.push(`/produtos?${next.toString()}`, { scroll: false })
  }

  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((chip) => (
        <button
          key={chip.key}
          onClick={() => remove(chip.key)}
          className="flex items-center gap-1.5 bg-primary/10 text-primary font-extrabold text-xs px-3 py-1.5 rounded-pill hover:bg-primary/20 transition-colors"
        >
          {chip.label}
          <X size={11} />
        </button>
      ))}
    </div>
  )
}
