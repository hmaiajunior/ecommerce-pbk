import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { withCache } from "@/lib/cache"
import { TTL } from "@/lib/redis"

export async function GET() {
  const categories = await withCache("categories:all", TTL.product, () =>
    prisma.category.findMany({ orderBy: { name: "asc" } })
  )

  return NextResponse.json({ data: categories })
}
