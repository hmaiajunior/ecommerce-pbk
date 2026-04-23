import { prisma } from "@/lib/prisma"
import { withCache } from "@/lib/cache"
import { TTL } from "@/lib/redis"

export function getCategories() {
  return withCache("categories:all", TTL.product, () =>
    prisma.category.findMany({ orderBy: { name: "asc" } })
  )
}

export function getAgeRanges() {
  return withCache("age-ranges:all", TTL.product, () =>
    prisma.ageRange.findMany({ orderBy: { minAge: "asc" } })
  )
}
