'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import {
  createShop, deleteShop, updateShop, updateRiderStatus,
  sendAnnouncement, deleteShipment, deleteOrderChat,
  approveShopRegistration, rejectShopRegistration,
  createRider, deleteRider, resetRiders,
  approveRiderRegistration, rejectRiderRegistration,
  updateFollowUp, BroadcastAudience,
  triggerDailyVisitorNotifications,
  getRecentAdminEvents
} from '@/lib/api'


import { destroySession } from '@/lib/session'

export async function registerShop(
  _prevState: string | null,
  formData: FormData,
): Promise<string | null> {
  const name = String(formData.get('name') || '').trim()
  const phone = String(formData.get('phone') || '').trim()
  const location = String(formData.get('location') || '').trim()
  const description = String(formData.get('description') || '').trim()

  if (!name || !phone) {
    return 'Shop name and phone number are required.'
  }

  try {
    await createShop({
      name,
      phone,
      location: location || undefined,
      description: description || undefined,
    })
  } catch (e) {
    return e instanceof Error ? e.message : 'Failed to register shop.'
  }

  revalidatePath('/')
  return null
}

// Bound via editShop.bind(null, shop.shop_id) so useActionState sees the
// (prevState, formData) signature it expects — same pattern as removeShop
// below, just wired through useActionState instead of a plain form action.
export async function editShop(
  shopId: number,
  _prevState: string | null,
  formData: FormData,
): Promise<string | null> {
  const name = String(formData.get('name') || '').trim()
  const phone = String(formData.get('phone') || '').trim()
  const location = String(formData.get('location') || '').trim()

  if (!name || !phone) {
    return 'Shop name and phone number are required.'
  }

  try {
    await updateShop(shopId, { name, phone, location })
  } catch (e) {
    return e instanceof Error ? e.message : 'Failed to update shop.'
  }

  revalidatePath('/')
  return null
}

// Bound via removeShop.bind(null, shop.shop_id) as a <form action>, which
// Next.js calls with FormData as the trailing argument — unused here, but
// required by the form-action signature.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function removeShop(shopId: number, _formData: FormData): Promise<void> {
  await deleteShop(shopId)
  revalidatePath('/')
}

// Bound via removeShipment.bind(null, shipment.shipment_id) as a <form
// action>, same shape as removeShop above.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function removeShipment(shipmentId: number, _formData: FormData): Promise<void> {
  await deleteShipment(shipmentId)
  revalidatePath('/')
}

// Bound via removeOrderChat.bind(null, chat.order_id) as a <form action>,
// same shape as removeShipment above. Clears the order's chat only — the
// order itself is untouched.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function removeOrderChat(orderId: number, _formData: FormData): Promise<void> {
  await deleteOrderChat(orderId)
  revalidatePath('/')
}

export async function logout(): Promise<void> {
  await destroySession()
  redirect('/login')
}

export type RegisterRiderResult = {
  error: string | null
  token?: string | null
  riderName?: string | null
  riderPhone?: string | null
  waLink?: string | null
}

export async function registerRider(
  _prevState: RegisterRiderResult | null,
  formData: FormData,
): Promise<RegisterRiderResult> {
  const name = String(formData.get('name') || '').trim()
  const phone = String(formData.get('phone') || '').trim()
  const location = String(formData.get('location') || '').trim()

  if (!name || !phone || !location) {
    return { error: 'Rider name, phone number, and location are required.' }
  }

  try {
    const res = await createRider({ name, phone, location })
    revalidatePath('/')
    return {
      error: null,
      token: res.token,
      riderName: res.rider.name || name,
      riderPhone: res.rider.phone,
      waLink: res.rider.wa_link,
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Failed to register rider.' }
  }
}

export async function resetRidersAction(): Promise<{ ok: boolean; reset_count?: number; error?: string }> {
  try {
    const res = await resetRiders()
    revalidatePath('/')
    return { ok: true, reset_count: res.reset_count }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Failed to reset riders.' }
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function removeRider(riderId: number, _formData?: FormData): Promise<void> {
  await deleteRider(riderId)
  revalidatePath('/')
}

export async function approveRiderRegistrationAction(regId: number) {
  try {
    const res = await approveRiderRegistration(regId)
    revalidatePath('/')
    return {
      ok: true,
      token: res.token,
      rider: res.rider,
      registration: res.registration,
    }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Failed to approve rider registration.' }
  }
}

export async function rejectRiderRegistrationAction(regId: number) {
  try {
    await rejectRiderRegistration(regId)
    revalidatePath('/')
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Failed to reject rider registration.' }
  }
}

export async function updateFollowUpAction(
  orderId: number,
  input: {
    follow_up_status: string
    reason_for_not_purchasing?: string
    notes?: string
  },
) {
  try {
    await updateFollowUp(orderId, input)
    revalidatePath('/')
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Failed to update follow-up.' }
  }
}

export async function toggleRiderStatus(
  riderId: number,
  status: 'active' | 'disabled',
): Promise<string | null> {
  try {
    await updateRiderStatus(riderId, status)
  } catch (e) {
    return e instanceof Error ? e.message : 'Failed to update rider status.'
  }
  revalidatePath('/')
  return null
}

export type AnnouncementResult = {
  error: string | null
  sent: number | null
  targeted?: number | null
  target?: BroadcastAudience | null
}

export async function announceToAll(
  _prevState: AnnouncementResult,
  formData: FormData,
): Promise<AnnouncementResult> {
  const title = String(formData.get('title') || '').trim()
  const message = String(formData.get('message') || '').trim()
  const rawTarget = String(formData.get('target') || 'all').trim().toLowerCase()
  const target: BroadcastAudience = (
    ['all', 'buyers', 'sellers', 'riders'].includes(rawTarget) ? rawTarget : 'all'
  ) as BroadcastAudience

  if (!message) {
    return { error: 'Write a message before sending.', sent: null }
  }

  try {
    const res = await sendAnnouncement(message, title || undefined, target)
    return { error: null, sent: res.sent, targeted: res.targeted, target: res.target || target }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Failed to send announcement.', sent: null }
  }
}

export async function fetchShipmentTracking(token: string) {
  try {
    const res = await fetch(`${process.env.FLASK_API_URL}/api/track/${token}`, {
      cache: 'no-store',
    })
    const body = await res.json()
    if (!res.ok || !body.ok) {
      return null
    }
    return body
  } catch {
    return null
  }
}

export async function approveRegistrationAction(regId: number) {
  try {
    const res = await approveShopRegistration(regId)
    revalidatePath('/')
    return { ok: true, token: res.token, registration: res.registration, shop: res.shop }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Failed to approve registration' }
  }
}

export async function rejectRegistrationAction(regId: number) {
  try {
    await rejectShopRegistration(regId)
    revalidatePath('/')
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Failed to reject registration' }
  }
}

export async function triggerDailyVisitorNotificationsAction(date?: string) {
  try {
    const res = await triggerDailyVisitorNotifications(date)
    revalidatePath('/')
    return { ok: true, data: res }
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : 'Failed to trigger visitor notifications.',
    }
  }
}

export async function fetchRecentAdminEventsAction() {
  try {
    const events = await getRecentAdminEvents()
    return { ok: true, events }
  } catch (e) {
    return { ok: false, events: [], error: e instanceof Error ? e.message : 'Failed to fetch events' }
  }
}


