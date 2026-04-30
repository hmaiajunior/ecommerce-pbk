import Link from "next/link"
import { redirect } from "next/navigation"
import { Heart } from "lucide-react"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ProductCard } from "@/components/shop/ProductCard"
import { Button } from "@/components/ui/button"

export const dynamic = "force-dynamic"

export default async function FavoritosPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login?callbackUrl=/minha-conta/favoritos")

  const items = await prisma.wishlist.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      product: {
        include: {
          images: { orderBy: { position: "asc" }, take: 1 },
          sizes: { where: { stock: { gt: 0 } }, select: { size: true } },
        },
      },
    },
  })

  const products = items
    .map((i) => i.product)
    .filter((p) => p && p.active)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-black text-[26px] text-brown-dark">Favoritos</h1>
        <p className="font-semibold text-sm text-brown-muted mt-1">
          Produtos que você salvou para olhar depois.
        </p>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-card shadow-[var(--shadow-card)] space-y-4">
          <Heart size={48} className="mx-auto text-brown-muted opacity-30" />
          <p className="font-extrabold text-lg text-brown-dark">Sua lista está vazia</p>
          <p className="font-semibold text-sm text-brown-muted">
            Toque no <span className="text-primary">♥</span> em qualquer produto para salvá-lo aqui.
          </p>
          <Button asChild>
            <Link href="/produtos">Explorar loja</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              id={p.id}
              name={p.name}
              slug={p.slug}
              retailPrice={Number(p.retailPrice)}
              wholesalePrice={p.wholesalePrice ? Number(p.wholesalePrice) : null}
              featured={p.featured}
              images={p.images}
              sizes={p.sizes}
            />
          ))}
        </div>
      )}
    </div>
  )
}
