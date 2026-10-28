"use server"
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { SESSION_COOKIE_NAME } from '@/lib/session'

export async function changeBlock(form: FormData) {
  if (process.env.NODE_ENV === 'production' && (!process.env.SESSION_SECRET ||
    (await cookies()).get(SESSION_COOKIE_NAME)?.value !== process.env.SESSION_SECRET)) throw new Error('Unauthorized')
  const id = String(form.get('id') || '')
  if (id && !/^\d+$/.test(id)) throw new Error('Invalid block')
  const seller = String(form.get('seller_id') || '').trim()
  const payload = id ? { active: form.get('active') === 'true' } : {
    phone: String(form.get('phone') || '').trim() || undefined,
    installation_id: String(form.get('installation_id') || '').trim() || undefined,
    seller_id: seller ? Number(seller) : undefined,
    reason: String(form.get('reason') || '').trim(),
  }
  let error = ''
  try {
    if (!process.env.FLASK_API_URL || !process.env.FLASK_ADMIN_TOKEN) throw new Error('Backend connection is not configured')
    const response = await fetch(`${process.env.FLASK_API_URL}/api/admin/service-blocks${id ? '/'+id : ''}`, {
      method: id ? 'PATCH' : 'POST', headers: {'Content-Type':'application/json', 'X-Admin-Token':process.env.FLASK_ADMIN_TOKEN},
      body: JSON.stringify(payload), cache:'no-store',
    })
    const result = await response.json()
    if (!response.ok || !result.ok) error = result.error || 'Could not update restriction'
  } catch { error = 'Could not connect to the backend. Please retry.' }
  if (error) redirect('/blocks?error='+encodeURIComponent(error))
  revalidatePath('/blocks'); redirect('/blocks')
}
