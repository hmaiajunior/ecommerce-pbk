import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  // Usa o host real da requisição, ignorando AUTH_URL
  const proto = req.headers.get("x-forwarded-proto") ?? "https"
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? req.nextUrl.host
  const origin = `${proto}://${host}`

  if (pathname.startsWith("/admin")) {
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.redirect(`${origin}/login`)
    }
  }

  if (pathname.startsWith("/minha-conta")) {
    if (!session) {
      return NextResponse.redirect(
        `${origin}/login?callbackUrl=${encodeURIComponent(pathname)}`
      )
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/admin/:path*", "/minha-conta/:path*", "/checkout/:path*"],
}
