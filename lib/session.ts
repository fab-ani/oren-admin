import { cookies } from 'next/headers'

export const SESSION_COOKIE_NAME = 'oren_admin_session'

// Single shared password, no per-user accounts (per spec: "no roles, no
// multi-user — just you") — the cookie just holds the same server-only
// secret back, so middleware can check equality without a database.
export async function createSession() {
  const secret = process.env.SESSION_SECRET
  if (!secret) throw new Error('SESSION_SECRET not set')
  const store = await cookies()
  store.set(SESSION_COOKIE_NAME, secret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  })
}

export async function destroySession() {
  const store = await cookies()
  store.delete(SESSION_COOKIE_NAME)
}
