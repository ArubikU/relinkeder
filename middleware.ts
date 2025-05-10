import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get("session_token")?.value
  const isLoggedIn = !!sessionToken
  const isAuthPage = request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/register"
  const isProtectedRoute =
    request.nextUrl.pathname === "/dashboard" ||
    request.nextUrl.pathname === "/profile"
  //if path contains api, return next response
  if (request.nextUrl.pathname.startsWith("/api")) {
    return NextResponse.next()
  }

  // If the user is logged in and trying to access auth pages, redirect to dashboard
  if (isLoggedIn && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // If the user is not logged in and trying to access protected routes, redirect to login
  if (!isLoggedIn && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // If the user is logged in and on the home page, redirect to dashboard
  if (isLoggedIn && request.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - colors (color palette page)
     */
    "/((?!_next/static|_next/image|favicon.ico|colors).*)",
  ],
}
