import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { ProductDetail } from "@/components/shop/ProductDetail"
import { ProductCard } from "@/components/shop/ProductCard"

export const revalidate = 300

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

async function getProduct(slug: string) {
  const res = await fetch(`${BASE}/api/products/${slug}`, {
    next: { revalidate: 300 },
  })
  if (!res.ok) return null
  const json = await res.json()
  return json.data ?? null
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) return { title: "Produto não encontrado" }
  return {
    title: product.name,
    description: product.description ?? `${product.name} — Playbekids`,
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const product = await getProduct(slug)

  if (!product) notFound()

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-8 py-10">
      {/* Produto */}
      <ProductDetail
        id={product.id}
        name={product.name}
        slug={product.slug}
        description={product.description}
        fabric={product.fabric}
        retailPrice={Number(product.retailPrice)}
        wholesalePrice={product.wholesalePrice ? Number(product.wholesalePrice) : null}
        wholesaleMinQty={product.wholesaleMinQty ?? null}
        featured={product.featured}
        images={product.images}
        sizes={product.sizes}
        category={product.category}
        ageRange={product.ageRange}
      />

      {/* Produtos relacionados */}
      {product.related?.length > 0 && (
        <section className="mt-16">
          <h2 className="font-black text-[24px] text-brown-dark mb-6">
            Você também pode gostar
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {product.related.map((p: any) => (
              <ProductCard key={p.id} {...p} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
