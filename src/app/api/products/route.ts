import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { productQuerySchema, getProductsList, maskWholesale } from "@/lib/data/products"

export async function GET(req: NextRequest) {
  const parsed = productQuerySchema.safeParse(
    Object.fromEntries(req.nextUrl.searchParams)
  )

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    )
  }

  const session = await auth()
  const isWholesale =
    session?.user.role === "WHOLESALE" && session.user.wholesaleApproved === true

  const rawData = await getProductsList(parsed.data)

  return NextResponse.json({
    data: rawData.products.map((p) => maskWholesale(p, isWholesale)),
    meta: {
      total: rawData.total,
      page: parsed.data.page,
      limit: parsed.data.limit,
      pages: rawData.pages,
    },
  })
}
