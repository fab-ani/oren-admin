'use server'

import { redirect } from 'next/navigation'
import { createSession } from '@/lib/session'

export async function login(
  _prevState: string | null,
  formData: FormData,
): Promise<string | null> {
  const password = String(formData.get('password') || '')
  const expected = process.env.ADMIN_PASSWORD
  if (!expected) return 'Server haijasanidiwa (ADMIN_PASSWORD haijawekwa).'
  if (password !== expected) return 'Password si sahihi.'
  await createSession()
  redirect('/')
}
