import { Suspense } from "react"
import { Hero } from "@/components/home/Hero"
import { CategorySection } from "@/components/home/CategorySection"
import { FeaturedProducts } from "@/components/home/FeaturedProducts"
import { Skeleton } from "@/components/ui/skeleton"

export const revalidate = 600 // 10 min ISR

function FeaturedSkeleton() {
  return (
    <section className="mx-auto max-w-7xl px-4 md:px-8 py-14">
      <Skeleton className="h-8 w-48 mb-8" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-card overflow-hidden">
            <Skeleton className="h-[200px] w-full" />
            <div className="p-4 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-8 w-full mt-2" />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <CategorySection />
      <Suspense fallback={<FeaturedSkeleton />}>
        <FeaturedProducts />
      </Suspense>
    </>
  )
}
