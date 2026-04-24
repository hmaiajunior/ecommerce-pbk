import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth
  const baseUrl = process.env.AUTH_URL ?? req.nextUrl.origin

  if (pathname.startsWith("/admin")) {
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.redirect(`${baseUrl}/login`)
    }
  }

  if (pathname.startsWith("/minha-conta") || pathname.startsWith("/checkout")) {
    if (!session) {
      return NextResponse.redirect(
        `${baseUrl}/login?callbackUrl=${encodeURIComponent(pathname)}`
      )
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/admin/:path*", "/minha-conta/:path*", "/checkout/:path*"],
}
