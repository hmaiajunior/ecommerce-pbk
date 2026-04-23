import { Suspense } from "react"
import { SlidersHorizontal } from "lucide-react"
import { FilterSidebar } from "@/components/shop/FilterSidebar"
import { SortSelect } from "@/components/shop/SortSelect"
import { Pagination } from "@/components/shop/Pagination"
import { ActiveFilters } from "@/components/shop/ActiveFilters"
import { ProductCard } from "@/components/shop/ProductCard"
import { Skeleton } from "@/components/ui/skeleton"
import { auth } from "@/lib/auth"
import { getProductsList, productQuerySchema, maskWholesale } from "@/lib/data/products"
import { getCategories, getAgeRanges } from "@/lib/data/catalog"
import type { Metadata } from "next"

export const revalidate = 300

export const metadata: Metadata = { title: "Loja" }

type SearchParams = Promise<{
  category?: string
  ageRange?: string
  size?: string
  minPrice?: string
  maxPrice?: string
  sort?: string
  page?: string
}>

function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="rounded-card overflow-hidden bg-white shadow-sm">
          <Skeleton className="h-[200px] w-full" />
          <div className="p-4 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-9 w-full mt-2" />
          </div>
        </div>
      ))}
    </div>
  )
}

function SidebarSkeleton() {
  return (
    <div className="hidden lg:block w-[240px] shrink-0 space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-3/4" />
        </div>
      ))}
    </div>
  )
}

async function CatalogContent({ searchParams }: { searchParams: Awaited<SearchParams> }) {
  const parsed = productQuerySchema.safeParse(searchParams)
  const params = parsed.success ? parsed.data : productQuerySchema.parse({})

  const session = await auth()
  const isWholesale =
    session?.user.role === "WHOLESALE" && session.user.wholesaleApproved === true

  const [{ products: rawProducts, total, pages }, categories, ageRanges] = await Promise.all([
    getProductsList(params),
    getCategories(),
    getAgeRanges(),
  ])

  const products = rawProducts.map((p) => maskWholesale(p, isWholesale))
  const meta = { total, pages, page: params.page, limit: params.limit }

  return (
    <div className="flex gap-8 items-start">
      <div className="hidden lg:block">
        <FilterSidebar categories={categories} ageRanges={ageRanges} />
      </div>

      <div className="flex-1 min-w-0">
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <span className="text-6xl">🔍</span>
            <p className="font-extrabold text-xl text-brown-dark">Nenhum produto encontrado</p>
            <p className="font-semibold text-brown-muted text-sm">Tente ajustar os filtros.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((p: any) => (
                <ProductCard key={p.id} {...p} />
              ))}
            </div>
            <Pagination page={meta.page} pages={meta.pages} total={meta.total} />
          </>
        )}
      </div>
    </div>
  )
}

export default async function ProdutosPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const sp = await searchParams

  const [categories, ageRanges] = await Promise.all([
    getCategories(),
    getAgeRanges(),
  ])

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-8 py-10">
      <div className="mb-6">
        <h1 className="font-black text-[32px] text-brown-dark">Loja</h1>
        <p className="font-semibold text-brown-muted mt-1">
          Moda infantil masculina — atacado e varejo
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center mb-4">
        <Suspense>
          <ActiveFilters categories={categories} ageRanges={ageRanges} />
        </Suspense>

        <div className="flex items-center gap-3 shrink-0 ml-auto">
          <details className="lg:hidden">
            <summary className="flex items-center gap-2 font-bold text-sm text-brown-mid bg-bg-blush px-4 py-2.5 rounded-pill cursor-pointer list-none hover:bg-bg-nude transition-colors">
              <SlidersHorizontal size={14} /> Filtros
            </summary>
            <div className="absolute z-40 mt-2 bg-white rounded-card shadow-[0_8px_32px_rgba(61,43,31,0.12)] p-5 border border-bg-nude w-[280px]">
              <FilterSidebar categories={categories} ageRanges={ageRanges} />
            </div>
          </details>

          <Suspense>
            <SortSelect />
          </Suspense>
        </div>
      </div>

      <Suspense
        fallback={
          <div className="flex gap-8">
            <SidebarSkeleton />
            <div className="flex-1"><GridSkeleton /></div>
          </div>
        }
      >
        <CatalogContent searchParams={sp} />
      </Suspense>
    </div>
  )
}
