import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { pathname, origin } = req.nextUrl
  const session = req.auth

  if (pathname.startsWith("/admin")) {
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.redirect(`${origin}/login`)
    }
  }

  if (pathname.startsWith("/minha-conta") || pathname.startsWith("/checkout")) {
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
