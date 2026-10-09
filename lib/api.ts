// Server-only: talks to the existing Flask backend's admin routes, reusing
// the same X-Admin-Token auth those routes already use for the dashboard.
// FLASK_ADMIN_TOKEN never reaches the browser — every call here runs in a
// Server Component or Server Action.

const BASE_URL = process.env.FLASK_API_URL
const ADMIN_TOKEN = process.env.FLASK_ADMIN_TOKEN

export type Shop = {
  shop_id: number
  name: string
  phone: string
  location: string | null
  photo_url: string | null
  description: string | null
  category: string | null
  icon: string | null
  is_open: boolean
  token: string
  seller_id: number | null
  status: 'claimed' | 'pending'
  product_count: number
  created_at: string | null
}

export type ShopRegistration = {
  id: number
  name: string
  phone: string
  clean_phone: string
  wa_link: string
  location: string
  goods_sold: string
  status: 'pending' | 'approved' | 'rejected'
  token: string | null
  shop_id: number | null
  created_at: string | null
  reviewed_at: string | null
}

export type Shipment = {
  shipment_id: number
  tracking_token: string
  box_id: string | null
  customer_name: string | null
  customer_phone: string | null
  cargo_name: string | null
  cargo_destination: string | null
  cargo_from: string | null
  from_lat: number | null
  from_lon: number | null
  to_lat: number | null
  to_lon: number | null
  expected_arrival: string | null
  time_to_departure: string | null
  cargo_type: string | null
  status: 'pending' | 'in_transit' | 'arrived' | 'delivered'
  created_at: string | null
  seller_id: number | null
  rider_id: number | null
  product_photo_url: string | null
  gps_source: 'box' | 'rider_phone'
  marked_delivered_by_rider_at: string | null
  confirm_deadline: string | null
  confirmed_by: 'customer' | 'auto' | null
  location?: {
    lat: number
    lon: number
    speed: number | null
    satellites: number | null
    time: string | null
  } | null
}

export type Rider = {
  id: number
  name?: string | null
  phone: string
  location?: string | null
  token?: string | null
  seller_id?: number | null
  status: 'active' | 'disabled'
  created_at: string
  claimed_at?: string | null
  wa_link?: string
}

export type RiderRegistration = {
  id: number
  name: string
  phone: string
  clean_phone: string
  wa_link: string
  location: string
  status: 'pending' | 'approved' | 'rejected'
  token: string | null
  rider_id: number | null
  created_at: string | null
  reviewed_at: string | null
}

export type Seller = {
  id: number
  name: string | null
  phone: string
  created_at: string
}

export type OrderChat = {
  order_id: number
  buyer_name: string
  buyer_phone?: string | null
  clean_buyer_phone?: string | null
  wa_link?: string | null
  contact_consent?: boolean | null
  journey_stage?: string | null
  follow_up_status?: 'pending' | 'contacted' | 'resolved' | 'dropped' | null
  reason_for_not_purchasing?: string | null
  follow_up_notes?: string | null
  last_contacted_at?: string | null
  shop_name: string | null
  product_name: string | null
  status: string
  reached_payment: boolean
  message_count: number
  last_message_at: string | null
  created_at: string | null
}

export type ConversionMetrics = {
  total_inquiries: number
  stalled_orders: number
  contactable_buyers: number
  pending_follow_ups: number
  contacted_follow_ups: number
  resolved_conversions: number
  dropped_conversions: number
  conversion_rate_percent: number
  top_lost_reasons: Array<{ reason: string; count: number }>
}


function requireConfig() {
  if (!BASE_URL || !ADMIN_TOKEN) {
    throw new Error(
      'FLASK_API_URL / FLASK_ADMIN_TOKEN not configured — see .env.local.example',
    )
  }
}

export async function listShops(): Promise<Shop[]> {
  requireConfig()
  const res = await fetch(`${BASE_URL}/api/admin/shops`, {
    headers: { 'X-Admin-Token': ADMIN_TOKEN! },
    cache: 'no-store',
  })
  const body = await res.json()
  if (!res.ok || !body.ok) {
    throw new Error(body.error || `Failed to load shops (${res.status})`)
  }
  return body.shops as Shop[]
}

export async function createShop(input: {
  name: string
  phone: string
  location?: string
  description?: string
}): Promise<Shop> {
  requireConfig()
  const res = await fetch(`${BASE_URL}/api/admin/shops`, {
    method: 'POST',
    headers: {
      'X-Admin-Token': ADMIN_TOKEN!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  })
  const body = await res.json()
  if (!res.ok || !body.ok) {
    throw new Error(body.error || `Failed to register shop (${res.status})`)
  }
  return body.shop as Shop
}

export async function updateShop(
  shopId: number,
  input: { name: string; phone: string; location: string },
): Promise<Shop> {
  requireConfig()
  const res = await fetch(`${BASE_URL}/api/admin/shops/${shopId}`, {
    method: 'PATCH',
    headers: {
      'X-Admin-Token': ADMIN_TOKEN!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  })
  const body = await res.json()
  if (!res.ok || !body.ok) {
    throw new Error(body.error || `Failed to update shop (${res.status})`)
  }
  return body.shop as Shop
}

export async function deleteShop(shopId: number): Promise<void> {
  requireConfig()
  const res = await fetch(`${BASE_URL}/api/admin/shops/${shopId}`, {
    method: 'DELETE',
    headers: { 'X-Admin-Token': ADMIN_TOKEN! },
  })
  const body = await res.json()
  if (!res.ok || !body.ok) {
    throw new Error(body.error || `Failed to delete shop (${res.status})`)
  }
}

export async function listShipments(): Promise<Shipment[]> {
  requireConfig()
  const res = await fetch(`${BASE_URL}/api/admin/shipments`, {
    headers: { 'X-Admin-Token': ADMIN_TOKEN! },
    cache: 'no-store',
  })
  const body = await res.json()
  if (!res.ok) {
    throw new Error(`Failed to load shipments (${res.status})`)
  }
  return body as Shipment[]
}

export async function deleteShipment(shipmentId: number): Promise<void> {
  requireConfig()
  const res = await fetch(`${BASE_URL}/api/admin/shipments/${shipmentId}`, {
    method: 'DELETE',
    headers: { 'X-Admin-Token': ADMIN_TOKEN! },
  })
  const body = await res.json()
  if (!res.ok || !body.ok) {
    throw new Error(body.error || `Failed to delete shipment (${res.status})`)
  }
}

export async function listRiders(): Promise<Rider[]> {
  requireConfig()
  const res = await fetch(`${BASE_URL}/api/admin/riders`, {
    headers: { 'X-Admin-Token': ADMIN_TOKEN! },
    cache: 'no-store',
  })
  const body = await res.json()
  if (!res.ok) {
    throw new Error(`Failed to load riders (${res.status})`)
  }
  return body as Rider[]
}

export async function listSellers(): Promise<Seller[]> {
  requireConfig()
  const res = await fetch(`${BASE_URL}/api/admin/sellers`, {
    headers: { 'X-Admin-Token': ADMIN_TOKEN! },
    cache: 'no-store',
  })
  const body = await res.json()
  if (!res.ok) {
    throw new Error(`Failed to load sellers (${res.status})`)
  }
  return body as Seller[]
}

export async function updateRiderStatus(
  riderId: number,
  status: 'active' | 'disabled',
): Promise<void> {
  requireConfig()
  const res = await fetch(`${BASE_URL}/api/admin/riders/${riderId}/status`, {
    method: 'PATCH',
    headers: {
      'X-Admin-Token': ADMIN_TOKEN!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  })
  const body = await res.json()
  if (!res.ok || !body.ok) {
    throw new Error(body.error || `Failed to update rider status (${res.status})`)
  }
}

// Orders with any surviving chat activity — see the backend route's own
// docstring: an order's messages get wiped once it's delivered, cancelled,
// or marked unavailable, so this only ever shows active (or
// confirmed-but-not-yet-delivered) conversations, not a full history.
export async function listOrderChats(): Promise<OrderChat[]> {
  requireConfig()
  const res = await fetch(`${BASE_URL}/api/admin/chats`, {
    headers: { 'X-Admin-Token': ADMIN_TOKEN! },
    cache: 'no-store',
  })
  const body = await res.json()
  if (!res.ok || !body.ok) {
    throw new Error(body.error || `Failed to load chats (${res.status})`)
  }
  return body.chats as OrderChat[]
}

// Admin-triggered version of what Order.clear_chat() already does
// automatically on delivery/cancel/reject — lets the admin clear a chat
// directly from the dashboard instead of relying on the buyer/seller's own
// devices. Leaves the order itself untouched.
export async function deleteOrderChat(orderId: number): Promise<void> {
  requireConfig()
  const res = await fetch(`${BASE_URL}/api/admin/orders/${orderId}/chat`, {
    method: 'DELETE',
    headers: { 'X-Admin-Token': ADMIN_TOKEN! },
  })
  const body = await res.json()
  if (!res.ok || !body.ok) {
    throw new Error(body.error || `Failed to delete chat (${res.status})`)
  }
}

export type BroadcastAudience = 'all' | 'buyers' | 'sellers' | 'riders'

export async function sendAnnouncement(
  message: string,
  title?: string,
  target: BroadcastAudience = 'all',
): Promise<{ sent: number; targeted?: number; target?: BroadcastAudience }> {
  requireConfig()
  const res = await fetch(`${BASE_URL}/api/admin/announcements`, {
    method: 'POST',
    headers: {
      'X-Admin-Token': ADMIN_TOKEN!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message, title, target }),
  })
  const body = await res.json()
  if (!res.ok || !body.ok) {
    throw new Error(body.error || `Failed to send announcement (${res.status})`)
  }
  return { sent: body.sent, targeted: body.targeted, target: body.target }
}

export async function listShopRegistrations(status?: string): Promise<ShopRegistration[]> {
  requireConfig()
  const qs = status ? `?status=${encodeURIComponent(status)}` : ''
  const res = await fetch(`${BASE_URL}/api/admin/registrations${qs}`, {
    headers: { 'X-Admin-Token': ADMIN_TOKEN! },
    cache: 'no-store',
  })
  const body = await res.json()
  if (!res.ok || !body.ok) {
    throw new Error(body.error || `Failed to load registrations (${res.status})`)
  }
  return body.registrations as ShopRegistration[]
}

export async function approveShopRegistration(regId: number): Promise<{ token: string; shop: Shop; registration: ShopRegistration }> {
  requireConfig()
  const res = await fetch(`${BASE_URL}/api/admin/registrations/${regId}/approve`, {
    method: 'POST',
    headers: { 'X-Admin-Token': ADMIN_TOKEN! },
  })
  const body = await res.json()
  if (!res.ok || !body.ok) {
    throw new Error(body.error || `Failed to approve registration (${res.status})`)
  }
  return { token: body.token, shop: body.shop, registration: body.registration }
}

export async function rejectShopRegistration(regId: number): Promise<void> {
  requireConfig()
  const res = await fetch(`${BASE_URL}/api/admin/registrations/${regId}/reject`, {
    method: 'POST',
    headers: { 'X-Admin-Token': ADMIN_TOKEN! },
  })
  const body = await res.json()
  if (!res.ok || !body.ok) {
    throw new Error(body.error || `Failed to reject registration (${res.status})`)
  }
}

export async function createRider(input: {
  name: string
  phone: string
  location: string
}): Promise<{ token: string; rider: Rider }> {
  requireConfig()
  const res = await fetch(`${BASE_URL}/api/admin/riders`, {
    method: 'POST',
    headers: {
      'X-Admin-Token': ADMIN_TOKEN!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  })
  const body = await res.json()
  if (!res.ok || !body.ok) {
    throw new Error(body.error || `Failed to register rider (${res.status})`)
  }
  return { token: body.token, rider: body.rider }
}

export async function deleteRider(riderId: number): Promise<void> {
  requireConfig()
  const res = await fetch(`${BASE_URL}/api/admin/riders/${riderId}`, {
    method: 'DELETE',
    headers: { 'X-Admin-Token': ADMIN_TOKEN! },
  })
  const body = await res.json()
  if (!res.ok || !body.ok) {
    throw new Error(body.error || `Failed to delete rider (${res.status})`)
  }
}

export async function resetRiders(): Promise<{ reset_count: number }> {
  requireConfig()
  const res = await fetch(`${BASE_URL}/api/admin/riders/reset`, {
    method: 'POST',
    headers: { 'X-Admin-Token': ADMIN_TOKEN! },
  })
  const body = await res.json()
  if (!res.ok || !body.ok) {
    throw new Error(body.error || `Failed to reset riders (${res.status})`)
  }
  return { reset_count: body.reset_count }
}

export async function listRiderRegistrations(status?: string): Promise<RiderRegistration[]> {
  requireConfig()
  const qs = status ? `?status=${encodeURIComponent(status)}` : ''
  const res = await fetch(`${BASE_URL}/api/admin/rider-registrations${qs}`, {
    headers: { 'X-Admin-Token': ADMIN_TOKEN! },
    cache: 'no-store',
  })
  const body = await res.json()
  if (!res.ok || !body.ok) {
    throw new Error(body.error || `Failed to load rider registrations (${res.status})`)
  }
  return body.registrations as RiderRegistration[]
}

export async function approveRiderRegistration(
  regId: number,
): Promise<{ token: string; rider: Rider; registration: RiderRegistration }> {
  requireConfig()
  const res = await fetch(`${BASE_URL}/api/admin/rider-registrations/${regId}/approve`, {
    method: 'POST',
    headers: { 'X-Admin-Token': ADMIN_TOKEN! },
  })
  const body = await res.json()
  if (!res.ok || !body.ok) {
    throw new Error(body.error || `Failed to approve rider registration (${res.status})`)
  }
  return { token: body.token, rider: body.rider, registration: body.registration }
}

export async function rejectRiderRegistration(regId: number): Promise<void> {
  requireConfig()
  const res = await fetch(`${BASE_URL}/api/admin/rider-registrations/${regId}/reject`, {
    method: 'POST',
    headers: { 'X-Admin-Token': ADMIN_TOKEN! },
  })
  const body = await res.json()
  if (!res.ok || !body.ok) {
    throw new Error(body.error || `Failed to reject rider registration (${res.status})`)
  }
}

export async function getConversionMetrics(): Promise<ConversionMetrics> {
  requireConfig()
  const res = await fetch(`${BASE_URL}/api/admin/conversion/metrics`, {
    headers: { 'X-Admin-Token': ADMIN_TOKEN! },
    cache: 'no-store',
  })
  const body = await res.json()
  if (!res.ok || !body.ok) {
    throw new Error(body.error || `Failed to load conversion metrics (${res.status})`)
  }
  return body.metrics as ConversionMetrics
}

export async function updateFollowUp(
  orderId: number,
  input: {
    follow_up_status: string
    reason_for_not_purchasing?: string
    notes?: string
  },
): Promise<void> {
  requireConfig()
  const res = await fetch(`${BASE_URL}/api/admin/follow-ups/${orderId}`, {
    method: 'POST',
    headers: {
      'X-Admin-Token': ADMIN_TOKEN!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  })
  const body = await res.json()
  if (!res.ok || !body.ok) {
    throw new Error(body.error || `Failed to update follow-up (${res.status})`)
  }
}

export type ShopVisitorStat = {
  shop_id: number
  name: string
  phone: string
  seller_id: number | null
  today_visitors: number
  yesterday_visitors: number
}

export type AdminVisitorStatsResponse = {
  ok: boolean
  date: string
  total_today_visitors: number
  total_yesterday_visitors: number
  shops: ShopVisitorStat[]
}

export async function getAdminVisitorStats(): Promise<AdminVisitorStatsResponse> {
  requireConfig()
  const res = await fetch(`${BASE_URL}/api/admin/visitors/stats`, {
    headers: { 'X-Admin-Token': ADMIN_TOKEN! },
    cache: 'no-store',
  })
  const body = await res.json()
  if (!res.ok || !body.ok) {
    throw new Error(body.error || `Failed to load visitor stats (${res.status})`)
  }
  return body as AdminVisitorStatsResponse
}

export type VisitorNotificationTriggerResult = {
  ok: boolean
  date: string
  shops_evaluated: number
  notifications_sent: number
  sent: Array<{ shop_id: number; name: string; seller_id: number; count: number }>
  skipped_zero: Array<{ shop_id: number; name: string; count: number }>
  skipped_already_sent: Array<{ shop_id: number; name: string; count: number }>
  no_seller: Array<{ shop_id: number; name: string; count: number }>
  no_fcm_token: Array<{ shop_id: number; name: string; seller_id: number | null; count: number }>
}

export async function triggerDailyVisitorNotifications(
  date?: string,
): Promise<VisitorNotificationTriggerResult> {
  requireConfig()
  const res = await fetch(`${BASE_URL}/api/admin/jobs/send-daily-visitor-notifications`, {
    method: 'POST',
    headers: {
      'X-Admin-Token': ADMIN_TOKEN!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(date ? { date } : {}),
  })
  const body = await res.json()
  if (!res.ok || !body.ok) {
    throw new Error(body.error || `Failed to trigger visitor notifications (${res.status})`)
  }
  return body as VisitorNotificationTriggerResult
}


