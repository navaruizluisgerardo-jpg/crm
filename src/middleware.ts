import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth

  const isAuthRoute =
    pathname.startsWith('/login') || pathname.startsWith('/register')
  const isProtectedRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/contacts') ||
    pathname.startsWith('/companies') ||
    pathname.startsWith('/deals') ||
    pathname.startsWith('/activities') ||
    pathname.startsWith('/reports') ||
    pathname.startsWith('/settings')

  // Si está en ruta protegida sin sesión → al login
  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Si ya tiene sesión e intenta ir al login → al dashboard
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
