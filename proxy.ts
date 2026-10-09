import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { SESSION_COOKIE_NAME } from '@/lib/session'

const PUBLIC_PATHS = ['/login']

export function proxy(request: NextRequest) {
  // TODO: remove once FLASK_ADMIN_TOKEN is set to a real value — login is
  // disabled locally so testing isn't blocked by the password too.
  if (process.env.NODE_ENV !== 'production') {
    return NextResponse.next()
  }

  const { pathname } = request.nextUrl
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  const secret = process.env.SESSION_SECRET
  const session = request.cookies.get(SESSION_COOKIE_NAME)?.value
  if (!secret || session !== secret) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
