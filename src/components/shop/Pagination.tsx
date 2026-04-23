"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

type Props = {
  page: number
  pages: number
  total: number
}

export function Pagination({ page, pages, total }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  if (pages <= 1) return null

  function goTo(p: number) {
    const next = new URLSearchParams(searchParams.toString())
    next.set("page", String(p))
    router.push(`/produtos?${next.toString()}`, { scroll: true })
  }

  // Janela de páginas visíveis: máximo 5
  const start = Math.max(1, page - 2)
  const end   = Math.min(pages, start + 4)
  const pageNumbers = Array.from({ length: end - start + 1 }, (_, i) => start + i)

  return (
    <nav className="flex items-center justify-center gap-1 pt-10" aria-label="Paginação">
      <button
        onClick={() => goTo(page - 1)}
        disabled={page <= 1}
        className="w-9 h-9 rounded-pill flex items-center justify-center bg-bg-blush text-brown-mid hover:bg-bg-nude disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="Página anterior"
      >
        <ChevronLeft size={16} />
      </button>

      {start > 1 && (
        <>
          <button onClick={() => goTo(1)} className="w-9 h-9 rounded-pill font-bold text-sm text-brown-mid bg-bg-blush hover:bg-bg-nude transition-colors">1</button>
          {start > 2 && <span className="w-9 text-center text-brown-muted font-bold">…</span>}
        </>
      )}

      {pageNumbers.map((p) => (
        <button
          key={p}
          onClick={() => goTo(p)}
          className={cn(
            "w-9 h-9 rounded-pill font-extrabold text-sm transition-all",
            p === page
              ? "bg-primary text-white shadow-[0_4px_14px_rgba(255,107,74,0.25)]"
              : "bg-bg-blush text-brown-mid hover:bg-bg-nude"
          )}
          aria-current={p === page ? "page" : undefined}
        >
          {p}
        </button>
      ))}

      {end < pages && (
        <>
          {end < pages - 1 && <span className="w-9 text-center text-brown-muted font-bold">…</span>}
          <button onClick={() => goTo(pages)} className="w-9 h-9 rounded-pill font-bold text-sm text-brown-mid bg-bg-blush hover:bg-bg-nude transition-colors">{pages}</button>
        </>
      )}

      <button
        onClick={() => goTo(page + 1)}
        disabled={page >= pages}
        className="w-9 h-9 rounded-pill flex items-center justify-center bg-bg-blush text-brown-mid hover:bg-bg-nude disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="Próxima página"
      >
        <ChevronRight size={16} />
      </button>

      <span className="ml-3 text-sm font-semibold text-brown-muted">
        {total} produto{total !== 1 ? "s" : ""}
      </span>
    </nav>
  )
}
