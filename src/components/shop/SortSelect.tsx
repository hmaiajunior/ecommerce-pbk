"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { ChevronDown } from "lucide-react"

const OPTIONS = [
  { value: "featured",   label: "Destaques" },
  { value: "newest",     label: "Mais recentes" },
  { value: "price_asc",  label: "Menor preço" },
  { value: "price_desc", label: "Maior preço" },
]

export function SortSelect() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const current = searchParams.get("sort") ?? "featured"

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = new URLSearchParams(searchParams.toString())
    next.set("sort", e.target.value)
    next.delete("page")
    router.push(`/produtos?${next.toString()}`, { scroll: false })
  }

  return (
    <div className="relative">
      <select
        value={current}
        onChange={handleChange}
        className="appearance-none bg-white border border-bg-nude rounded-pill px-4 pr-9 py-2.5 font-bold text-sm text-brown-mid cursor-pointer outline-none focus:border-primary transition-colors"
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-brown-muted pointer-events-none"
      />
    </div>
  )
}
