import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { auth } from "@/lib/auth"
import { getProductBySlug } from "@/lib/data/products"
import { ProductDetail } from "@/components/shop/ProductDetail"
import { ProductCard } from "@/components/shop/ProductCard"

export const revalidate = 300

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)
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

  const session = await auth()
  const isWholesale =
    session?.user.role === "WHOLESALE" && session.user.wholesaleApproved === true

  const product = await getProductBySlug(slug)

  if (!product) notFound()

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-8 py-10">
      <ProductDetail
        id={product.id}
        name={product.name}
        slug={product.slug}
        description={product.description}
        fabric={product.fabric}
        retailPrice={Number(product.retailPrice)}
        wholesalePrice={isWholesale && product.wholesalePrice ? Number(product.wholesalePrice) : null}
        wholesaleMinQty={isWholesale ? product.wholesaleMinQty ?? null : null}
        featured={product.featured}
        images={product.images}
        sizes={product.sizes}
        category={product.category}
        ageRange={product.ageRange}
      />

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
