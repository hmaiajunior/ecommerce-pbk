import { NextResponse } from "next/server"
import { getAgeRanges } from "@/lib/data/catalog"

export async function GET() {
  const ageRanges = await getAgeRanges()
  return NextResponse.json({ data: ageRanges })
}
