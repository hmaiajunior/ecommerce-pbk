"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { ProductCard } from "@/components/shop/ProductCard"
import { Input } from "@/components/ui/input"
import { useSession } from "next-auth/react"
import { Suspense } from "react"

function BuscaContent() {
  const params = useSearchParams()
  const router = useRouter()
  const { data: session } = useSession()

  const [query, setQuery] = useState(params.get("q") ?? "")
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const q = params.get("q") ?? ""
    setQuery(q)
    if (!q) return
    setLoading(true)
    fetch(`/api/products?search=${encodeURIComponent(q)}`)
      .then((r) => r.json())
      .then((data) => setProducts(data.products ?? []))
      .finally(() => setLoading(false))
  }, [params])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) router.push(`/busca?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <main className="min-h-screen bg-bg-cream">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <h1 className="text-3xl font-black text-brown-dark mb-8">Buscar produtos</h1>

        <form onSubmit={handleSubmit} className="flex gap-3 max-w-xl mb-10">
          <Input
            id="busca"
            type="search"
            placeholder="Digite o nome do produto..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1"
          />
          <button
            type="submit"
            className="bg-primary text-white px-5 rounded-lg font-bold hover:bg-primary-hover transition-colors flex items-center gap-2"
          >
            <Search size={16} /> Buscar
          </button>
        </form>

        {loading && <p className="text-brown-muted font-semibold">Buscando...</p>}

        {!loading && params.get("q") && products.length === 0 && (
          <p className="text-brown-muted font-semibold">
            Nenhum produto encontrado para <strong>"{params.get("q")}"</strong>.
          </p>
        )}

        {products.length > 0 && (
          <>
            <p className="text-sm font-bold text-brown-muted mb-6">
              {products.length} resultado{products.length !== 1 ? "s" : ""} para "{params.get("q")}"
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((p) => (
                <ProductCard key={p.id} {...p} />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  )
}

export default function BuscaPage() {
  return (
    <Suspense>
      <BuscaContent />
    </Suspense>
  )
}
