import Link from "next/link"
import { ProductCard } from "@/components/shop/ProductCard"

async function getFeaturedProducts() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  const res = await fetch(`${baseUrl}/api/products?sort=featured&limit=8`, {
    next: { revalidate: 300 },
  })
  if (!res.ok) return []
  const json = await res.json()
  return json.data ?? []
}

export async function FeaturedProducts() {
  const products = await getFeaturedProducts()

  if (products.length === 0) return null

  return (
    <section className="mx-auto max-w-7xl px-4 md:px-8 py-14">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.1em] text-brown-muted mb-1">
            Destaques
          </p>
          <h2 className="font-black text-[28px] md:text-[36px] text-brown-dark leading-tight">
            Lançamentos
          </h2>
        </div>
        <Link
          href="/produtos?sort=newest"
          className="font-extrabold text-sm text-primary hover:underline hidden sm:block"
        >
          Ver todos →
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((p: any) => (
          <ProductCard key={p.id} {...p} />
        ))}
      </div>
    </section>
  )
}
