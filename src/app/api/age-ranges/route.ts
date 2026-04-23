import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { withCache } from "@/lib/cache"
import { TTL } from "@/lib/redis"

export async function GET() {
  const ageRanges = await withCache("age-ranges:all", TTL.product, () =>
    prisma.ageRange.findMany({ orderBy: { minAge: "asc" } })
  )

  return NextResponse.json({ data: ageRanges })
}
