import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getProductBySlug } from "@/lib/data/products"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  const session = await auth()
  const isWholesale =
    session?.user.role === "WHOLESALE" && session.user.wholesaleApproved === true

  const product = await getProductBySlug(slug)

  if (!product) {
    return NextResponse.json({ error: "Produto não encontrado." }, { status: 404 })
  }

  return NextResponse.json({
    data: {
      ...product,
      wholesalePrice: isWholesale ? product.wholesalePrice : null,
      wholesaleMinQty: isWholesale ? product.wholesaleMinQty : null,
    },
  })
}
