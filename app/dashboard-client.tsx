'use client'

import React, { useState, useEffect, useTransition, useActionState, useRef } from 'react'
import {
  Shop, Shipment, Rider, Seller, OrderChat,
  ShopRegistration, RiderRegistration, ConversionMetrics, BroadcastAudience,
  AdminVisitorStatsResponse
} from '@/lib/api'
import {
  logout, registerShop, registerRider, toggleRiderStatus,
  fetchShipmentTracking, removeShop, announceToAll, removeShipment,
  removeOrderChat, approveRegistrationAction, rejectRegistrationAction,
  removeRider, approveRiderRegistrationAction,
  rejectRiderRegistrationAction, triggerDailyVisitorNotificationsAction
} from './actions'

import { CopyTokenButton } from './copy-token-button'
import { DeleteShopButton } from './delete-shop-button'
import { EditShopButton } from './edit-shop-button'
import { EditShopDialog } from './edit-shop-dialog'
import { DeleteShipmentButton } from './delete-shipment-button'
import { DeleteChatButton } from './delete-chat-button'
import { RegistrationApprovedDialog } from './registration-approved-dialog'
import { RiderApprovedDialog } from './rider-approved-dialog'
import { FollowUpDialog } from './follow-up-dialog'
import { ResetRidersDialog } from './reset-riders-dialog'
import { ShipmentsChart } from './shipments-chart'

function formatWhatsAppPhone(phone: string): string {
  let digits = phone.replace(/[^0-9]/g, '')
  if (digits.startsWith('0') && digits.length === 10) {
    digits = '255' + digits.substring(1)
  }
  return digits
}

function StatusPill({ status }: { status: string }) {
  let bg = '#e5e2dc'
  let color = '#5b5b5b'
  let label = status

  switch (status) {
    case 'claimed':
      bg = '#e1f5ee'
      color = '#0f6e56'
      label = 'Claimed'
      break
    case 'pending':
    case 'pending_availability':
      bg = '#faeeda'
      color = '#854f0b'
      label = 'Pending'
      break
    case 'available':
      bg = '#e1f5ee'
      color = '#0f6e56'
      label = 'Available'
      break
    case 'in_transit':
      bg = '#faeeda'
      color = '#d85a30'
      label = 'In Transit'
      break
    case 'arrived':
      bg = '#e1f5ee'
      color = '#0f6e56'
      label = 'Arrived'
      break
    case 'delivered':
      bg = '#eef8f4'
      color = '#27ae60'
      label = 'Delivered'
      break
    case 'active':
      bg = '#e1f5ee'
      color = '#0f6e56'
      label = 'Active'
      break
    case 'disabled':
      bg = '#fdf0ee'
      color = '#c0392b'
      label = 'Disabled'
      break
    case 'approved':
      bg = '#e1f5ee'
      color = '#0f6e56'
      label = 'Approved'
      break
    case 'rejected':
      bg = '#fdf0ee'
      color = '#c0392b'
      label = 'Rejected'
      break
  }

  return (
    <span
      style={{
        background: bg,
        color: color,
        padding: '3px 9px',
        borderRadius: 8,
        fontSize: 11,
        fontWeight: 600,
        display: 'inline-block',
        textTransform: 'capitalize',
      }}
    >
      {label}
    </span>
  )
}

const AUDIENCE_OPTIONS: { id: BroadcastAudience; label: string; icon: string; swahili: string; hint: string }[] = [
  { id: 'all', label: 'All Users', icon: '👥', swahili: 'Wote', hint: 'Reaches every active device across Oren (buyers, sellers, and riders).' },
  { id: 'buyers', label: 'Buyers', icon: '🛍️', swahili: 'Wanunuzi', hint: 'Reaches customers who placed orders, sent inquiries, favorited shops, or browse.' },
  { id: 'sellers', label: 'Sellers', icon: '🏪', swahili: 'Wauzaji', hint: 'Reaches registered shop owners and verified merchant accounts.' },
  { id: 'riders', label: 'Riders', icon: '🛵', swahili: 'Madereva', hint: 'Reaches onboarded delivery couriers and active riders.' },
]

function AnnouncementForm() {
  const [state, formAction, pending] = useActionState(announceToAll, { error: null, sent: null })
  const [target, setTarget] = useState<BroadcastAudience>('all')
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state.sent !== null && !state.error) {
      formRef.current?.reset()
    }
  }, [state])

  const selectedAudience = AUDIENCE_OPTIONS.find((o) => o.id === target) || AUDIENCE_OPTIONS[0]

  return (
    <div className="bg-white border border-[#e5e2dc] rounded-2xl p-4 sm:p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-base font-bold text-[#1a1a1a]">Push Notification Broadcast</h3>
        <p className="text-xs text-[#5b5b5b]">
          Send targeted or system-wide instant push notifications to Oren mobile app users.
        </p>
      </div>
      <form ref={formRef} action={formAction} className="space-y-3.5">
        <input type="hidden" name="target" value={target} />

        {/* Audience Filter Pills */}
        <div>
          <label className="text-xs font-semibold text-[#444] block mb-1.5">
            Target Audience / Walengwa:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {AUDIENCE_OPTIONS.map((opt) => {
              const active = target === opt.id
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setTarget(opt.id)}
                  className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${
                    active
                      ? 'bg-[#1a1a1a] text-white border-[#1a1a1a] shadow-sm'
                      : 'bg-[#f7f6f3] text-[#555] border-[#e5e2dc] hover:bg-[#eae8e3]'
                  }`}
                >
                  <span>{opt.icon}</span>
                  <span>{opt.label}</span>
                </button>
              )
            })}
          </div>
          <p className="text-[11px] text-[#777] mt-1.5 flex items-center gap-1">
            <span className="font-medium text-[#1a1a1a]">{selectedAudience.label} ({selectedAudience.swahili}):</span>
            <span>{selectedAudience.hint}</span>
          </p>
        </div>

        <input
          name="title"
          type="text"
          placeholder="Title (optional, e.g. 'Huduma Mpya ya Usafirishaji')"
          maxLength={65}
          className="w-full text-xs sm:text-sm"
        />
        <textarea
          name="message"
          placeholder={
            target === 'all'
              ? 'Write announcement to broadcast to all Oren app users...'
              : target === 'buyers'
              ? 'Write offer, product update, or message for shoppers...'
              : target === 'sellers'
              ? 'Write operational update, policy note, or notice for shop owners...'
              : 'Write dispatch alert, bonus notice, or update for riders...'
          }
          required
          rows={3}
          className="w-full text-xs sm:text-sm resize-y"
        />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="text-xs">
            {state.error && <span className="text-[#c0392b] font-medium">✕ {state.error}</span>}
            {state.sent !== null && !state.error && (
              <span className="text-[#0f6e56] font-medium">
                ✓ Sent to {state.sent} device{state.sent === 1 ? '' : 's'}
                {state.target ? ` in ${AUDIENCE_OPTIONS.find((o) => o.id === state.target)?.label || state.target} audience` : ''}.
              </span>
            )}
          </div>
          <button
            type="submit"
            disabled={pending}
            className="w-full sm:w-auto px-5 py-2.5 bg-[#d85a30] text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-[#b8481f] disabled:opacity-50 transition-colors shadow-sm"
          >
            {pending ? 'Sending…' : `Send to ${selectedAudience.label}`}
          </button>
        </div>
      </form>
    </div>
  )
}

function DeliveryRouteMap({ shipment }: { shipment: Shipment }) {
  const [liveLocation, setLiveLocation] = useState<{ lat?: number; lon?: number; speed?: number | null } | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    let interval: NodeJS.Timeout

    async function updateTracking() {
      setIsLoading(true)
      const data = await fetchShipmentTracking(shipment.tracking_token)
      if (data && data.location) {
        setLiveLocation(data.location)
      }
      setIsLoading(false)
    }

    updateTracking()

    if (shipment.status === 'in_transit') {
      interval = setInterval(updateTracking, 12000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [shipment])

  const fromLat = shipment.from_lat
  const fromLon = shipment.from_lon
  const toLat = shipment.to_lat
  const toLon = shipment.to_lon

  const hasCoords = fromLat && fromLon && toLat && toLon

  if (!hasCoords) {
    return (
      <div className="bg-[#f7f7f5] border border-[#e5e2dc] rounded-xl p-4 text-center text-xs text-[#8a8a8a]">
        No GPS coordinates recorded for this shipment.
      </div>
    )
  }

  return (
    <div className="bg-[#f7f7f5] border border-[#e5e2dc] rounded-xl p-3.5">
      <div className="flex items-center justify-between text-xs font-semibold text-[#5b5b5b] mb-2">
        <span>Delivery Route Coordinates</span>
        {isLoading && <span className="text-[11px] text-[#d85a30]">Updating...</span>}
      </div>
      <div className="text-xs space-y-1 text-[#1a1a1a]">
        <div>From: <code className="text-[#5b5b5b]">{fromLat?.toFixed(4)}, {fromLon?.toFixed(4)}</code> ({shipment.cargo_from || 'Pickup'})</div>
        <div>To: <code className="text-[#5b5b5b]">{toLat?.toFixed(4)}, {toLon?.toFixed(4)}</code> ({shipment.cargo_destination || 'Drop-off'})</div>
        {liveLocation?.lat && (
          <div className="text-[#0f6e56] font-medium pt-1">
            Current Rider GPS: <code>{liveLocation.lat.toFixed(4)}, {liveLocation.lon?.toFixed(4)}</code>
            {liveLocation.speed != null && ` · ${Math.round(liveLocation.speed)} km/h`}
          </div>
        )}
      </div>
    </div>
  )
}

interface DashboardClientProps {
  initialShops: Shop[]
  initialShipments: Shipment[]
  initialRiders: Rider[]
  initialSellers: Seller[]
  initialOrderChats: OrderChat[]
  initialRegistrations?: ShopRegistration[]
  initialRiderRegistrations?: RiderRegistration[]
  initialConversionMetrics?: ConversionMetrics
  initialVisitorStats?: AdminVisitorStatsResponse
}

export function DashboardClient({
  initialShops,
  initialShipments,
  initialRiders,
  initialOrderChats,
  initialRegistrations = [],
  initialRiderRegistrations = [],
  initialVisitorStats,
}: DashboardClientProps) {
  const [currentTab, setCurrentTab] = useState<'overview' | 'requests' | 'shipments' | 'riders' | 'chats' | 'conversion' | 'shops' | 'broadcast'>('overview')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [requestsSubTab, setRequestsSubTab] = useState<'shops' | 'riders'>('shops')

  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null)
  const [editingShop, setEditingShop] = useState<Shop | null>(null)
  const [followUpOrder, setFollowUpOrder] = useState<OrderChat | null>(null)
  const [resetRidersOpen, setResetRidersOpen] = useState(false)

  // Visitor notifications & stats
  const [visitorStats] = useState<AdminVisitorStatsResponse | undefined>(initialVisitorStats)
  const [visitorPushPending, setVisitorPushPending] = useState(false)
  const [visitorPushResult, setVisitorPushResult] = useState<string | null>(null)

  const shopVisitorsMap = React.useMemo(() => {
    const map: Record<number, { today_visitors: number; yesterday_visitors: number }> = {}
    if (visitorStats?.shops) {
      for (const s of visitorStats.shops) {
        map[s.shop_id] = {
          today_visitors: s.today_visitors,
          yesterday_visitors: s.yesterday_visitors,
        }
      }
    }
    return map
  }, [visitorStats])

  const handleTriggerVisitorPush = async () => {
    if (!confirm('Tuma push notifications kwa wamiliki wa maduka yaliyotembelewa leo? (Maduka yenye wateja > 0 pekee ndio yatapokea taarifa)')) {
      return
    }
    setVisitorPushPending(true)
    setVisitorPushResult(null)
    try {
      const res = await triggerDailyVisitorNotificationsAction()
      if (res.ok && res.data) {
        const d = res.data
        const sentCount = d.sent?.length ?? d.notifications_sent ?? 0
        const zeroCount = d.skipped_zero?.length ?? 0
        const alreadyCount = (d.already_sent?.length ?? d.skipped_already_sent?.length ?? 0)
        const totalCount = d.shops_evaluated ?? (sentCount + zeroCount + alreadyCount + (d.no_fcm_token?.length ?? 0))

        const msg = `✓ Ilitumwa kwa maduka ${sentCount} kati ya ${totalCount} yaliyochunguzwa leo (${zeroCount} bila wateja, ${alreadyCount} tayari yalipokea).`
        setVisitorPushResult(msg)
      } else {
        const errMsg = res.error || 'Imeshindikana kutuma push notifications.'
        setVisitorPushResult(`✕ ${errMsg}`)
      }
    } catch (e) {
      setVisitorPushResult(e instanceof Error ? `✕ ${e.message}` : '✕ Hitilafu imetokea.')
    } finally {
      setVisitorPushPending(false)
    }
  }



  // Shop Registrations state
  const [registrations, setRegistrations] = useState<ShopRegistration[]>(initialRegistrations)
  const [approvedModalData, setApprovedModalData] = useState<{
    shopName: string
    phone: string
    cleanPhone: string
    token: string
  } | null>(null)

  // Rider Registrations state
  const [riderRegistrations, setRiderRegistrations] = useState<RiderRegistration[]>(initialRiderRegistrations)
  const [approvedRiderModalData, setApprovedRiderModalData] = useState<{
    riderName: string
    phone: string
    cleanPhone: string
    token: string
  } | null>(null)

  const [actionPendingId, setActionPendingId] = useState<number | null>(null)

  // Rider registration form state
  const [riderError, setRiderError] = useState<string | null>(null)
  const [riderPending, startRiderTransition] = useTransition()
  const riderFormRef = useRef<HTMLFormElement>(null)

  const handleCreateRiderSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    startRiderTransition(async () => {
      const res = await registerRider(null, formData)
      if (res?.error) {
        setRiderError(res.error)
      } else if (res?.token) {
        setRiderError(null)
        form.reset()
        setApprovedRiderModalData({
          riderName: res.riderName || 'Rider',
          phone: res.riderPhone || '',
          cleanPhone: formatWhatsAppPhone(res.riderPhone || ''),
          token: res.token,
        })
      }
    })
  }

  // Shop registration form state
  const [shopError, shopFormAction, shopPending] = useActionState(registerShop, null)
  const shopFormRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (!shopPending && !shopError) {
      shopFormRef.current?.reset()
    }
  }, [shopPending, shopError])

  // Searches
  const [shipmentSearch, setShipmentSearch] = useState('')
  const [shipmentStatusFilter, setShipmentStatusFilter] = useState<string>('all')
  const [riderSearch, setRiderSearch] = useState('')
  const [chatSearch, setChatSearch] = useState('')
  const [chatConsentFilter, setChatConsentFilter] = useState<'all' | 'consented' | 'unconsented'>('all')
  const [shopSearch, setShopSearch] = useState('')

  const [isPending, startTransition] = useTransition()

  // Handlers for Shop Registrations
  const handleApproveShopRegistration = async (reg: ShopRegistration) => {
    if (!confirm(`Approve "${reg.name}" and generate shop token?`)) return
    setActionPendingId(reg.id)
    try {
      const res = await approveRegistrationAction(reg.id)
      if (res.ok && res.token) {
        setRegistrations((prev) =>
          prev.map((r) => (r.id === reg.id ? { ...r, status: 'approved', token: res.token! } : r))
        )
        setApprovedModalData({
          shopName: reg.name,
          phone: reg.phone,
          cleanPhone: formatWhatsAppPhone(reg.clean_phone || reg.phone),
          token: res.token,
        })
      } else {
        alert(res.error || 'Failed to approve shop registration')
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error approving registration')
    } finally {
      setActionPendingId(null)
    }
  }

  const handleRejectShopRegistration = async (reg: ShopRegistration) => {
    if (!confirm(`Reject registration request for "${reg.name}"?`)) return
    setActionPendingId(reg.id)
    try {
      const res = await rejectRegistrationAction(reg.id)
      if (res.ok) {
        setRegistrations((prev) =>
          prev.map((r) => (r.id === reg.id ? { ...r, status: 'rejected' } : r))
        )
      } else {
        alert(res.error || 'Failed to reject registration')
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error rejecting registration')
    } finally {
      setActionPendingId(null)
    }
  }

  // Handlers for Rider Registrations
  const handleApproveRiderRegistration = async (reg: RiderRegistration) => {
    if (!confirm(`Approve rider "${reg.name}" and issue RD-XXXX claim token?`)) return
    setActionPendingId(reg.id)
    try {
      const res = await approveRiderRegistrationAction(reg.id)
      if (res.ok && res.token) {
        setRiderRegistrations((prev) =>
          prev.map((r) => (r.id === reg.id ? { ...r, status: 'approved', token: res.token! } : r))
        )
        setApprovedRiderModalData({
          riderName: reg.name,
          phone: reg.phone,
          cleanPhone: formatWhatsAppPhone(reg.clean_phone || reg.phone),
          token: res.token,
        })
      } else {
        alert(res.error || 'Failed to approve rider registration')
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error approving rider registration')
    } finally {
      setActionPendingId(null)
    }
  }

  const handleRejectRiderRegistration = async (reg: RiderRegistration) => {
    if (!confirm(`Reject rider request for "${reg.name}"?`)) return
    setActionPendingId(reg.id)
    try {
      const res = await rejectRiderRegistrationAction(reg.id)
      if (res.ok) {
        setRiderRegistrations((prev) =>
          prev.map((r) => (r.id === reg.id ? { ...r, status: 'rejected' } : r))
        )
      } else {
        alert(res.error || 'Failed to reject rider registration')
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error rejecting rider registration')
    } finally {
      setActionPendingId(null)
    }
  }

  const handleToggleRider = (riderId: number, currentStatus: 'active' | 'disabled') => {
    const nextStatus = currentStatus === 'active' ? 'disabled' : 'active'
    startTransition(async () => {
      await toggleRiderStatus(riderId, nextStatus)
    })
  }

  const handleRemoveRider = async (riderId: number) => {
    if (!confirm('Are you sure you want to remove this rider?')) return
    startTransition(async () => {
      await removeRider(riderId)
    })
  }

  // Filtered counts
  const pendingShopCount = registrations.filter(r => r.status === 'pending').length
  const pendingRiderCount = riderRegistrations.filter(r => r.status === 'pending').length
  const totalPendingRequests = pendingShopCount + pendingRiderCount

  const activeShipmentsCount = initialShipments.filter(s => s.status === 'in_transit' || s.status === 'arrived').length
  const activeRidersCount = initialRiders.filter(r => r.status === 'active').length
  const stalledInquiries = initialOrderChats.filter(c => c.status === 'pending_availability' || !c.reached_payment)

  // Filters
  const filteredShipments = initialShipments.filter((s) => {
    const q = shipmentSearch.toLowerCase()
    const matchesQ =
      (s.cargo_name || '').toLowerCase().includes(q) ||
      (s.customer_name || '').toLowerCase().includes(q) ||
      (s.customer_phone || '').includes(q) ||
      s.tracking_token.toLowerCase().includes(q)
    if (!matchesQ) return false
    if (shipmentStatusFilter !== 'all' && s.status !== shipmentStatusFilter) return false
    return true
  })

  const filteredRiders = initialRiders.filter((r) => {
    const q = riderSearch.toLowerCase()
    return (
      (r.name || '').toLowerCase().includes(q) ||
      r.phone.includes(q) ||
      (r.location || '').toLowerCase().includes(q) ||
      (r.token || '').toLowerCase().includes(q)
    )
  })

  const filteredChats = initialOrderChats.filter((c) => {
    const q = chatSearch.toLowerCase()
    const matchesQ =
      c.buyer_name.toLowerCase().includes(q) ||
      (c.buyer_phone || '').includes(q) ||
      (c.shop_name || '').toLowerCase().includes(q) ||
      (c.product_name || '').toLowerCase().includes(q)
    if (!matchesQ) return false
    if (chatConsentFilter === 'consented' && c.contact_consent !== true) return false
    if (chatConsentFilter === 'unconsented' && c.contact_consent === true) return false
    return true
  })

  const filteredShops = initialShops.filter((s) => {
    const q = shopSearch.toLowerCase()
    return (
      s.name.toLowerCase().includes(q) ||
      s.phone.includes(q) ||
      (s.location || '').toLowerCase().includes(q) ||
      s.token.toLowerCase().includes(q)
    )
  })

  // Navigation Items
  const navItems = [
    { key: 'overview', label: 'Overview', icon: '📊', badge: null },
    { key: 'requests', label: 'Requests', icon: '📥', badge: totalPendingRequests > 0 ? totalPendingRequests : null },
    { key: 'shipments', label: 'Shipments', icon: '🚚', badge: activeShipmentsCount > 0 ? activeShipmentsCount : null },
    { key: 'riders', label: 'Riders', icon: '🛵', badge: activeRidersCount },
    { key: 'chats', label: 'Chats & Calls', icon: '💬', badge: initialOrderChats.length },
    { key: 'conversion', label: 'Sales Recovery', icon: '🎯', badge: stalledInquiries.length > 0 ? stalledInquiries.length : null },
    { key: 'shops', label: 'Shops & Sellers', icon: '🏪', badge: initialShops.length },
    { key: 'broadcast', label: 'Broadcast', icon: '📢', badge: null },
  ] as const

  return (
    <div className="min-h-screen bg-[#f7f7f5] text-[#1a1a1a]">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 fixed inset-y-0 bg-white border-r border-[#e5e2dc] z-30">
        {/* Brand */}
        <div className="p-5 border-b border-[#e5e2dc] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#d85a30] text-white flex items-center justify-center font-extrabold text-lg shadow-sm">
              O
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-[#1a1a1a] block leading-tight">
                Oren Delivery
              </span>
              <span className="text-[11px] font-semibold text-[#8a8a8a] uppercase tracking-wider">
                Admin Console
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = currentTab === item.key
            return (
              <button
                key={item.key}
                onClick={() => setCurrentTab(item.key)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  active
                    ? 'bg-[#faeeda] text-[#d85a30] shadow-xs'
                    : 'text-[#5b5b5b] hover:bg-[#f7f7f5] hover:text-[#1a1a1a]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-base">{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.badge !== null && item.badge !== undefined && (
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      active
                        ? 'bg-[#d85a30] text-white'
                        : 'bg-[#e5e2dc] text-[#5b5b5b]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        {/* Footer session */}
        <div className="p-4 border-t border-[#e5e2dc] bg-[#fafaf8]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#0f6e56] animate-pulse" />
              <span className="text-xs font-semibold text-[#5b5b5b]">Founder Mode</span>
            </div>
            <form action={logout}>
              <button
                type="submit"
                className="text-xs font-semibold text-[#c0392b] hover:underline"
              >
                Log Out
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="lg:hidden sticky top-0 z-20 bg-white border-b border-[#e5e2dc] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-1.5 rounded-lg border border-[#e5e2dc] text-[#1a1a1a] hover:bg-[#f7f7f5]"
            aria-label="Open menu"
          >
            <span className="text-lg leading-none">☰</span>
          </button>
          <div className="w-7 h-7 rounded-lg bg-[#d85a30] text-white flex items-center justify-center font-bold text-sm">
            O
          </div>
          <span className="font-bold text-sm text-[#1a1a1a]">Oren Admin</span>
        </div>

        <div className="flex items-center gap-2">
          {totalPendingRequests > 0 && (
            <button
              onClick={() => setCurrentTab('requests')}
              className="text-xs bg-[#d85a30] text-white font-bold px-2 py-1 rounded-full"
            >
              {totalPendingRequests} requests
            </button>
          )}
          <form action={logout}>
            <button
              type="submit"
              className="text-xs text-[#5b5b5b] font-medium border border-[#e5e2dc] px-2.5 py-1 rounded-lg"
            >
              Logout
            </button>
          </form>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-72 max-w-[80%] bg-white h-full shadow-2xl flex flex-col z-50">
            <div className="p-4 border-b border-[#e5e2dc] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#d85a30] text-white flex items-center justify-center font-bold text-base">
                  O
                </div>
                <span className="font-bold text-sm text-[#1a1a1a]">Oren Dashboard</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-xl text-[#8a8a8a] p-1 leading-none"
              >
                &times;
              </button>
            </div>
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const active = currentTab === item.key
                return (
                  <button
                    key={item.key}
                    onClick={() => {
                      setCurrentTab(item.key)
                      setMobileMenuOpen(false)
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
                      active
                        ? 'bg-[#faeeda] text-[#d85a30]'
                        : 'text-[#5b5b5b] hover:bg-[#f7f7f5]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== null && item.badge !== undefined && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#e5e2dc]">
                        {item.badge}
                      </span>
                    )}
                  </button>
                )
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="lg:pl-64 flex-1">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {/* TAB: OVERVIEW */}
          {currentTab === 'overview' && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-[#1a1a1a]">
                    Operations Overview
                  </h1>
                  <p className="text-xs sm:text-sm text-[#5b5b5b]">
                    Real-time status of local deliveries, merchant shops, riders, and sales conversion.
                  </p>
                </div>
                {totalPendingRequests > 0 && (
                  <button
                    onClick={() => setCurrentTab('requests')}
                    className="self-start sm:self-auto bg-[#d85a30] text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs hover:bg-[#b8481f] transition-colors"
                  >
                    Review {totalPendingRequests} Pending Request{totalPendingRequests === 1 ? '' : 's'} →
                  </button>
                )}
              </div>

              {/* Stat Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
                <div className="bg-white border border-[#e5e2dc] rounded-2xl p-4 shadow-xs">
                  <div className="text-xs font-semibold text-[#5b5b5b]">Active Deliveries</div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-[#d85a30] mt-1">
                    {activeShipmentsCount}
                  </div>
                  <div className="text-[11px] text-[#8a8a8a] mt-1">
                    {initialShipments.length} total shipments
                  </div>
                </div>

                <div className="bg-white border border-[#e5e2dc] rounded-2xl p-4 shadow-xs">
                  <div className="text-xs font-semibold text-[#5b5b5b]">Partner Shops</div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-[#1a1a1a] mt-1">
                    {initialShops.length}
                  </div>
                  <div className="text-[11px] text-[#0f6e56] mt-1">
                    {initialShops.filter(s => s.status === 'claimed').length} claimed & active
                  </div>
                </div>

                <div className="bg-white border border-[#e5e2dc] rounded-2xl p-4 shadow-xs">
                  <div className="text-xs font-semibold text-[#5b5b5b]">Shop Visitors (Leo)</div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-[#0f6e56] mt-1">
                    {visitorStats?.total_today_visitors ?? 0}
                  </div>
                  <div className="text-[11px] text-[#8a8a8a] mt-1">
                    {visitorStats?.total_yesterday_visitors ?? 0} jana ({visitorStats?.date || 'Leo'})
                  </div>
                </div>

                <div className="bg-white border border-[#e5e2dc] rounded-2xl p-4 shadow-xs">
                  <div className="text-xs font-semibold text-[#5b5b5b]">Active Riders</div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-[#0f6e56] mt-1">
                    {activeRidersCount}
                  </div>
                  <div className="text-[11px] text-[#8a8a8a] mt-1">
                    {initialRiders.length} registered (RD-XXXX claim)
                  </div>
                </div>

                <div className="bg-white border border-[#e5e2dc] rounded-2xl p-4 shadow-xs col-span-2 sm:col-span-1">
                  <div className="text-xs font-semibold text-[#5b5b5b]">Stalled Inquiries</div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-[#854f0b] mt-1">
                    {stalledInquiries.length}
                  </div>
                  <div className="text-[11px] text-[#854f0b] mt-1">
                    {stalledInquiries.filter(c => c.contact_consent === true).length} consented to calls
                  </div>
                </div>
              </div>


              {/* Shipments Chart */}
              <ShipmentsChart shipments={initialShipments} />

              {/* Secondary Overview Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pending Requests Box */}
                <div className="bg-white border border-[#e5e2dc] rounded-2xl p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-[#1a1a1a]">Pending Onboarding Requests</h3>
                    <button
                      onClick={() => setCurrentTab('requests')}
                      className="text-xs font-semibold text-[#d85a30] hover:underline"
                    >
                      View All ({totalPendingRequests}) →
                    </button>
                  </div>
                  {totalPendingRequests === 0 ? (
                    <div className="text-center py-8 text-xs text-[#8a8a8a]">
                      ✓ No pending requests. All shop and rider applications have been processed.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {registrations.filter(r => r.status === 'pending').slice(0, 3).map(r => (
                        <div key={r.id} className="flex items-center justify-between p-3 rounded-xl bg-[#f7f7f5] border border-[#e5e2dc]/70">
                          <div>
                            <span className="text-xs font-bold text-[#1a1a1a] block">🏪 {r.name}</span>
                            <span className="text-[11px] text-[#5b5b5b]">{r.phone} · {r.location}</span>
                          </div>
                          <button
                            onClick={() => {
                              setCurrentTab('requests')
                              setRequestsSubTab('shops')
                            }}
                            className="text-xs font-semibold bg-white border border-[#e5e2dc] px-2.5 py-1 rounded-lg text-[#d85a30]"
                          >
                            Review
                          </button>
                        </div>
                      ))}
                      {riderRegistrations.filter(r => r.status === 'pending').slice(0, 3).map(r => (
                        <div key={r.id} className="flex items-center justify-between p-3 rounded-xl bg-[#f7f7f5] border border-[#e5e2dc]/70">
                          <div>
                            <span className="text-xs font-bold text-[#1a1a1a] block">🛵 {r.name}</span>
                            <span className="text-[11px] text-[#5b5b5b]">{r.phone} · {r.location}</span>
                          </div>
                          <button
                            onClick={() => {
                              setCurrentTab('requests')
                              setRequestsSubTab('riders')
                            }}
                            className="text-xs font-semibold bg-white border border-[#e5e2dc] px-2.5 py-1 rounded-lg text-[#d85a30]"
                          >
                            Review
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Announcement Broadcast Box */}
                <AnnouncementForm />
              </div>
            </div>
          )}

          {/* TAB: REQUESTS (Shop & Rider Applications) */}
          {currentTab === 'requests' && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-[#1a1a1a]">
                    Onboarding Requests
                  </h1>
                  <p className="text-xs sm:text-sm text-[#5b5b5b]">
                    Review merchant and rider applications, approve and issue tokens, or reject invalid requests.
                  </p>
                </div>

                <div className="flex items-center gap-1.5 bg-[#f7f7f5] p-1 rounded-xl border border-[#e5e2dc] self-start sm:self-auto">
                  <button
                    onClick={() => setRequestsSubTab('shops')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      requestsSubTab === 'shops'
                        ? 'bg-white text-[#d85a30] shadow-xs'
                        : 'text-[#5b5b5b] hover:text-[#1a1a1a]'
                    }`}
                  >
                    Shop Requests ({pendingShopCount})
                  </button>
                  <button
                    onClick={() => setRequestsSubTab('riders')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      requestsSubTab === 'riders'
                        ? 'bg-white text-[#d85a30] shadow-xs'
                        : 'text-[#5b5b5b] hover:text-[#1a1a1a]'
                    }`}
                  >
                    Rider Requests ({pendingRiderCount})
                  </button>
                </div>
              </div>

              {/* Sub-tab 1: Shop Requests */}
              {requestsSubTab === 'shops' && (
                <div className="bg-white border border-[#e5e2dc] rounded-2xl shadow-xs overflow-hidden">
                  <div className="p-4 border-b border-[#e5e2dc] flex items-center justify-between">
                    <span className="text-sm font-bold text-[#1a1a1a]">
                      Merchant Registrations ({registrations.length})
                    </span>
                  </div>
                  <div className="responsive-table-container">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead className="bg-[#fafaf8] border-b border-[#e5e2dc] text-[#5b5b5b] uppercase text-[11px] font-semibold">
                        <tr>
                          <th className="p-3.5">Shop Name</th>
                          <th className="p-3.5">Phone & Contact</th>
                          <th className="p-3.5">Location</th>
                          <th className="p-3.5">Goods Sold</th>
                          <th className="p-3.5">Status</th>
                          <th className="p-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#e5e2dc]">
                        {registrations.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="p-8 text-center text-[#8a8a8a]">
                              No shop registrations found.
                            </td>
                          </tr>
                        ) : (
                          registrations.map((r) => (
                            <tr key={r.id} className="hover:bg-[#fafaf8]/80">
                              <td className="p-3.5 font-bold text-[#1a1a1a]">{r.name}</td>
                              <td className="p-3.5 font-mono">
                                <div>{r.phone}</div>
                                {r.wa_link && (
                                  <a
                                    href={r.wa_link}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[11px] text-[#0f6e56] hover:underline"
                                  >
                                    WhatsApp →
                                  </a>
                                )}
                              </td>
                              <td className="p-3.5 text-[#5b5b5b]">{r.location || '—'}</td>
                              <td className="p-3.5 text-[#5b5b5b]">{r.goods_sold || '—'}</td>
                              <td className="p-3.5"><StatusPill status={r.status} /></td>
                              <td className="p-3.5 text-right">
                                {r.status === 'pending' ? (
                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      onClick={() => handleApproveShopRegistration(r)}
                                      disabled={actionPendingId === r.id}
                                      className="px-3 py-1 bg-[#0f6e56] text-white rounded-lg text-xs font-semibold hover:bg-[#0c5945] disabled:opacity-50"
                                    >
                                      Approve
                                    </button>
                                    <button
                                      onClick={() => handleRejectShopRegistration(r)}
                                      disabled={actionPendingId === r.id}
                                      className="px-3 py-1 bg-[#fdf0ee] text-[#c0392b] border border-[#c0392b]/30 rounded-lg text-xs font-semibold hover:bg-[#fbdcd7] disabled:opacity-50"
                                    >
                                      Reject
                                    </button>
                                  </div>
                                ) : r.token ? (
                                  <div className="flex items-center justify-end gap-1 font-mono text-xs text-[#d85a30]">
                                    <span>{r.token}</span>
                                    <CopyTokenButton token={r.token} />
                                  </div>
                                ) : (
                                  <span className="text-[#8a8a8a] text-xs">—</span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Sub-tab 2: Rider Requests */}
              {requestsSubTab === 'riders' && (
                <div className="bg-white border border-[#e5e2dc] rounded-2xl shadow-xs overflow-hidden">
                  <div className="p-4 border-b border-[#e5e2dc] flex items-center justify-between">
                    <span className="text-sm font-bold text-[#1a1a1a]">
                      Rider Onboarding Applications ({riderRegistrations.length})
                    </span>
                  </div>
                  <div className="responsive-table-container">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead className="bg-[#fafaf8] border-b border-[#e5e2dc] text-[#5b5b5b] uppercase text-[11px] font-semibold">
                        <tr>
                          <th className="p-3.5">Rider Name</th>
                          <th className="p-3.5">Phone Number</th>
                          <th className="p-3.5">Location</th>
                          <th className="p-3.5">Applied Date</th>
                          <th className="p-3.5">Status</th>
                          <th className="p-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#e5e2dc]">
                        {riderRegistrations.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="p-8 text-center text-[#8a8a8a]">
                              No rider applications submitted yet.
                            </td>
                          </tr>
                        ) : (
                          riderRegistrations.map((r) => (
                            <tr key={r.id} className="hover:bg-[#fafaf8]/80">
                              <td className="p-3.5 font-bold text-[#1a1a1a]">{r.name}</td>
                              <td className="p-3.5 font-mono">
                                <div>{r.phone}</div>
                                {r.wa_link && (
                                  <a
                                    href={r.wa_link}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[11px] text-[#0f6e56] hover:underline"
                                  >
                                    WhatsApp →
                                  </a>
                                )}
                              </td>
                              <td className="p-3.5 text-[#5b5b5b]">{r.location || '—'}</td>
                              <td className="p-3.5 text-[#8a8a8a] text-xs">
                                {r.created_at ? new Date(r.created_at).toLocaleDateString() : '—'}
                              </td>
                              <td className="p-3.5"><StatusPill status={r.status} /></td>
                              <td className="p-3.5 text-right">
                                {r.status === 'pending' ? (
                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      onClick={() => handleApproveRiderRegistration(r)}
                                      disabled={actionPendingId === r.id}
                                      className="px-3 py-1 bg-[#d85a30] text-white rounded-lg text-xs font-semibold hover:bg-[#b8481f] disabled:opacity-50"
                                    >
                                      Approve & Issue RD-XXXX
                                    </button>
                                    <button
                                      onClick={() => handleRejectRiderRegistration(r)}
                                      disabled={actionPendingId === r.id}
                                      className="px-3 py-1 bg-[#fdf0ee] text-[#c0392b] border border-[#c0392b]/30 rounded-lg text-xs font-semibold hover:bg-[#fbdcd7] disabled:opacity-50"
                                    >
                                      Reject
                                    </button>
                                  </div>
                                ) : r.token ? (
                                  <div className="flex items-center justify-end gap-1 font-mono text-xs font-bold text-[#d85a30]">
                                    <span>{r.token}</span>
                                    <CopyTokenButton token={r.token} />
                                  </div>
                                ) : (
                                  <span className="text-[#8a8a8a] text-xs">—</span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: SHIPMENTS */}
          {currentTab === 'shipments' && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-[#1a1a1a]">
                    Shipments & Deliveries
                  </h1>
                  <p className="text-xs sm:text-sm text-[#5b5b5b]">
                    Manage local courier deliveries, view GPS tracking data, and inspect package routes.
                  </p>
                </div>
              </div>

              {/* Analytics Graph */}
              <ShipmentsChart shipments={initialShipments} />

              {/* Shipments List & Route Viewer */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className={`bg-white border border-[#e5e2dc] rounded-2xl shadow-xs overflow-hidden ${selectedShipment ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
                  {/* Filters Header */}
                  <div className="p-4 border-b border-[#e5e2dc] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <span className="text-sm font-bold text-[#1a1a1a]">
                      All Shipments ({filteredShipments.length})
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        type="text"
                        placeholder="Search package, customer..."
                        value={shipmentSearch}
                        onChange={(e) => setShipmentSearch(e.target.value)}
                        className="text-xs py-1.5 px-3 max-w-[200px]"
                      />
                      <select
                        value={shipmentStatusFilter}
                        onChange={(e) => setShipmentStatusFilter(e.target.value)}
                        className="text-xs py-1.5 px-2.5"
                      >
                        <option value="all">All Statuses</option>
                        <option value="in_transit">In Transit</option>
                        <option value="delivered">Delivered</option>
                        <option value="arrived">Arrived</option>
                        <option value="pending">Pending</option>
                      </select>
                    </div>
                  </div>

                  {/* Responsive Table */}
                  <div className="responsive-table-container">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead className="bg-[#fafaf8] border-b border-[#e5e2dc] text-[#5b5b5b] uppercase text-[11px] font-semibold">
                        <tr>
                          <th className="p-3.5">Cargo & Token</th>
                          <th className="p-3.5">Customer</th>
                          <th className="p-3.5">Shop / Destination</th>
                          <th className="p-3.5">Status</th>
                          <th className="p-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#e5e2dc]">
                        {filteredShipments.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="p-8 text-center text-[#8a8a8a]">
                              No shipments match the current criteria.
                            </td>
                          </tr>
                        ) : (
                          filteredShipments.map((s) => (
                            <tr
                              key={s.shipment_id}
                              onClick={() => setSelectedShipment(s)}
                              className={`cursor-pointer transition-colors ${
                                selectedShipment?.shipment_id === s.shipment_id
                                  ? 'bg-[#faeeda]/50'
                                  : 'hover:bg-[#fafaf8]'
                              }`}
                            >
                              <td className="p-3.5">
                                <strong className="text-[#1a1a1a] block">{s.cargo_name || 'Parcel'}</strong>
                                <code className="text-[11px] font-bold text-[#d85a30]">{s.tracking_token}</code>
                              </td>
                              <td className="p-3.5">
                                <div className="font-semibold">{s.customer_name || '—'}</div>
                                <div className="text-[11px] text-[#5b5b5b]">{s.customer_phone || '—'}</div>
                              </td>
                              <td className="p-3.5 text-[#5b5b5b]">
                                <div>{s.cargo_destination || '—'}</div>
                                <div className="text-[11px] text-[#8a8a8a]">From: {s.cargo_from || '—'}</div>
                              </td>
                              <td className="p-3.5"><StatusPill status={s.status} /></td>
                              <td className="p-3.5 text-right">
                                <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                                  <button
                                    onClick={() => setSelectedShipment(s)}
                                    className="px-2.5 py-1 border border-[#e5e2dc] rounded-lg text-xs font-semibold hover:bg-white"
                                  >
                                    Route →
                                  </button>
                                  <form action={removeShipment.bind(null, s.shipment_id)}>
                                    <DeleteShipmentButton cargoName={s.cargo_name || 'Shipment'} />
                                  </form>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Selected Shipment Detail Side Panel */}
                {selectedShipment && (
                  <div className="bg-white border border-[#e5e2dc] rounded-2xl p-5 shadow-xs lg:col-span-1 h-fit sticky top-20">
                    <div className="flex items-start justify-between mb-4 border-b border-[#e5e2dc] pb-3">
                      <div>
                        <span className="text-[11px] font-semibold text-[#8a8a8a] uppercase block">
                          Package Details
                        </span>
                        <h3 className="text-base font-bold text-[#1a1a1a]">
                          {selectedShipment.cargo_name || 'Shipment'}
                        </h3>
                        <code className="text-xs font-mono font-bold text-[#d85a30]">
                          {selectedShipment.tracking_token}
                        </code>
                      </div>
                      <button
                        onClick={() => setSelectedShipment(null)}
                        className="text-lg text-[#8a8a8a] hover:text-[#1a1a1a] p-1 leading-none"
                      >
                        &times;
                      </button>
                    </div>

                    <div className="space-y-3 mb-4">
                      <DeliveryRouteMap shipment={selectedShipment} />
                    </div>

                    <div className="text-xs space-y-2 border-t border-[#e5e2dc] pt-3 text-[#5b5b5b]">
                      <div className="flex justify-between">
                        <span>Customer:</span>
                        <span className="font-semibold text-[#1a1a1a]">
                          {selectedShipment.customer_name} ({selectedShipment.customer_phone})
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Destination:</span>
                        <span className="font-semibold text-[#1a1a1a]">{selectedShipment.cargo_destination}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <StatusPill status={selectedShipment.status} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: RIDERS */}
          {currentTab === 'riders' && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-[#1a1a1a]">
                    Rider Management & Claim Tokens
                  </h1>
                  <p className="text-xs sm:text-sm text-[#5b5b5b]">
                    Onboard new riders using RD-XXXX tokens, manage active couriers, or reset test riders.
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    onClick={() => setResetRidersOpen(true)}
                    className="px-3.5 py-2 border border-[#c0392b]/40 bg-[#fdf0ee] text-[#c0392b] rounded-xl text-xs font-bold hover:bg-[#fadcd7] transition-colors"
                  >
                    Reset Riders ({initialRiders.length} → 0)
                  </button>
                </div>
              </div>

              {/* Rider Onboarding Info Banner */}
              <div className="bg-[#faeeda] border border-[#d85a30]/30 rounded-2xl p-4 sm:p-5 mb-6 text-xs sm:text-sm text-[#854f0b] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="font-bold text-[#d85a30] text-sm block mb-1">
                    🛵 Token-Based Rider Onboarding (Format: RD-XXXX)
                  </span>
                  Riders can register in the Oren app by entering their claim token. When an admin registers an applicant below, an <code className="font-bold font-mono text-[#d85a30]">RD-XXXX</code> token is generated and can be sent via WhatsApp with one click.
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* Active Riders List */}
                <div className="bg-white border border-[#e5e2dc] rounded-2xl shadow-xs overflow-hidden lg:col-span-2">
                  <div className="p-4 border-b border-[#e5e2dc] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <span className="text-sm font-bold text-[#1a1a1a]">
                      Active Riders ({filteredRiders.length})
                    </span>
                    <input
                      type="text"
                      placeholder="Search rider, phone, token..."
                      value={riderSearch}
                      onChange={(e) => setRiderSearch(e.target.value)}
                      className="text-xs py-1.5 px-3 max-w-[200px]"
                    />
                  </div>

                  <div className="responsive-table-container">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead className="bg-[#fafaf8] border-b border-[#e5e2dc] text-[#5b5b5b] uppercase text-[11px] font-semibold">
                        <tr>
                          <th className="p-3.5">Rider Name</th>
                          <th className="p-3.5">Phone Number</th>
                          <th className="p-3.5">Location</th>
                          <th className="p-3.5">Claim Token</th>
                          <th className="p-3.5">Status</th>
                          <th className="p-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#e5e2dc]">
                        {filteredRiders.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="p-8 text-center text-[#8a8a8a]">
                              No riders currently active. Register a rider or approve requests above.
                            </td>
                          </tr>
                        ) : (
                          filteredRiders.map((r) => (
                            <tr key={r.id} className="hover:bg-[#fafaf8]">
                              <td className="p-3.5 font-bold text-[#1a1a1a]">{r.name || 'Rider'}</td>
                              <td className="p-3.5 font-mono">
                                <div>{r.phone}</div>
                                {r.wa_link && (
                                  <a
                                    href={r.wa_link}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[11px] text-[#0f6e56] hover:underline"
                                  >
                                    WhatsApp →
                                  </a>
                                )}
                              </td>
                              <td className="p-3.5 text-[#5b5b5b]">{r.location || '—'}</td>
                              <td className="p-3.5">
                                {r.token ? (
                                  <div className="flex items-center gap-1 font-mono font-bold text-xs text-[#d85a30]">
                                    <span>{r.token}</span>
                                    <CopyTokenButton token={r.token} />
                                  </div>
                                ) : (
                                  <span className="text-[#8a8a8a] text-xs">—</span>
                                )}
                              </td>
                              <td className="p-3.5"><StatusPill status={r.status} /></td>
                              <td className="p-3.5 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => handleToggleRider(r.id, r.status)}
                                    disabled={isPending}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                                      r.status === 'active'
                                        ? 'bg-[#fdf0ee] text-[#c0392b]'
                                        : 'bg-[#e1f5ee] text-[#0f6e56]'
                                    }`}
                                  >
                                    {r.status === 'active' ? 'Disable' : 'Enable'}
                                  </button>
                                  <button
                                    onClick={() => handleRemoveRider(r.id)}
                                    disabled={isPending}
                                    className="p-1 text-[#8a8a8a] hover:text-[#c0392b] text-sm"
                                    title="Delete rider"
                                  >
                                    🗑️
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Register New Rider Form Card */}
                <div className="bg-white border border-[#e5e2dc] rounded-2xl p-5 shadow-xs lg:col-span-1">
                  <h3 className="text-base font-bold text-[#1a1a1a] mb-1">
                    Register New Rider
                  </h3>
                  <p className="text-xs text-[#5b5b5b] mb-4">
                    Creates rider record and generates an <code className="font-bold text-[#d85a30]">RD-XXXX</code> claim token.
                  </p>

                  <form ref={riderFormRef} onSubmit={handleCreateRiderSubmit} className="space-y-3.5">
                    <div>
                      <label className="text-xs font-semibold text-[#5b5b5b] block mb-1">
                        Rider Full Name
                      </label>
                      <input
                        name="name"
                        type="text"
                        placeholder="e.g. Juma Bakari"
                        required
                        className="w-full text-xs sm:text-sm"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-[#5b5b5b] block mb-1">
                        Phone Number
                      </label>
                      <input
                        name="phone"
                        type="tel"
                        placeholder="e.g. 0712345678"
                        required
                        className="w-full text-xs sm:text-sm"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-[#5b5b5b] block mb-1">
                        Operating Location / Base
                      </label>
                      <input
                        name="location"
                        type="text"
                        placeholder="e.g. Kinondoni, Dar es Salaam"
                        required
                        className="w-full text-xs sm:text-sm"
                      />
                    </div>

                    {riderError && (
                      <p className="text-xs text-[#c0392b] bg-[#fdf0ee] p-2.5 rounded-xl font-medium">
                        {riderError}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={riderPending}
                      className="w-full py-2.5 bg-[#d85a30] text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-[#b8481f] disabled:opacity-50 transition-colors"
                    >
                      {riderPending ? 'Generating RD-XXXX Token…' : 'Register Rider & Generate Token'}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* TAB: CHATS & CALLS */}
          {currentTab === 'chats' && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-[#1a1a1a]">
                    Customer Chats & Recovery Calls
                  </h1>
                  <p className="text-xs sm:text-sm text-[#5b5b5b]">
                    Direct access to buyer phone numbers, Swahili call consent status, and call logger to recover incomplete purchases.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                  <input
                    type="text"
                    placeholder="Search buyer, phone, shop..."
                    value={chatSearch}
                    onChange={(e) => setChatSearch(e.target.value)}
                    className="text-xs py-1.5 px-3 max-w-[200px]"
                  />
                  <select
                    value={chatConsentFilter}
                    onChange={(e) => setChatConsentFilter(e.target.value as 'all' | 'consented' | 'unconsented')}
                    className="text-xs py-1.5 px-2.5"
                  >
                    <option value="all">All Contacts</option>
                    <option value="consented">Consented Only (Ndiyo)</option>
                    <option value="unconsented">Declined / Unasked</option>
                  </select>
                </div>
              </div>

              {/* Chats Table */}
              <div className="bg-white border border-[#e5e2dc] rounded-2xl shadow-xs overflow-hidden">
                <div className="responsive-table-container">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-[#fafaf8] border-b border-[#e5e2dc] text-[#5b5b5b] uppercase text-[11px] font-semibold">
                      <tr>
                        <th className="p-3.5">Customer & Phone</th>
                        <th className="p-3.5">Call Consent</th>
                        <th className="p-3.5">Shop & Item</th>
                        <th className="p-3.5">Order Stage</th>
                        <th className="p-3.5">Follow-Up Status</th>
                        <th className="p-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e5e2dc]">
                      {filteredChats.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-[#8a8a8a]">
                            No chats or customer inquiries found.
                          </td>
                        </tr>
                      ) : (
                        filteredChats.map((c) => {
                          const phone = c.buyer_phone || ''
                          const waUrl = c.wa_link || (c.clean_buyer_phone ? `https://wa.me/${c.clean_buyer_phone}` : '')

                          return (
                            <tr key={c.order_id} className="hover:bg-[#fafaf8]">
                              <td className="p-3.5">
                                <strong className="text-[#1a1a1a] block text-sm">{c.buyer_name}</strong>
                                {phone ? (
                                  <a
                                    href={`tel:${phone}`}
                                    className="font-mono text-xs font-bold text-[#d85a30] hover:underline"
                                  >
                                    📞 {phone}
                                  </a>
                                ) : (
                                  <span className="text-[11px] text-[#8a8a8a]">No phone</span>
                                )}
                              </td>
                              <td className="p-3.5">
                                {c.contact_consent === true ? (
                                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#e1f5ee] text-[#0f6e56]">
                                    ✓ Ndiyo (Piga Simu)
                                  </span>
                                ) : c.contact_consent === false ? (
                                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#faeeda] text-[#854f0b]">
                                    ✕ Hapana (Hakupenda)
                                  </span>
                                ) : (
                                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#e5e2dc] text-[#5b5b5b]">
                                    Haijaulizwa
                                  </span>
                                )}
                              </td>
                              <td className="p-3.5 text-[#5b5b5b]">
                                <div className="font-semibold text-[#1a1a1a]">{c.shop_name || '—'}</div>
                                <div className="text-[11px]">{c.product_name || 'Inquiry'}</div>
                              </td>
                              <td className="p-3.5">
                                <StatusPill status={c.status} />
                                <div className="text-[10px] text-[#8a8a8a] mt-0.5">
                                  {c.reached_payment ? 'Payment screen visited' : 'Has not reached payment'}
                                </div>
                              </td>
                              <td className="p-3.5">
                                {c.follow_up_status ? (
                                  <span className="capitalize text-xs font-semibold px-2 py-0.5 rounded-lg bg-[#f7f7f5] border border-[#e5e2dc]">
                                    {c.follow_up_status}
                                  </span>
                                ) : (
                                  <span className="text-xs text-[#8a8a8a]">Not called</span>
                                )}
                                {c.reason_for_not_purchasing && (
                                  <div className="text-[11px] text-[#854f0b] mt-0.5 truncate max-w-[150px]">
                                    {c.reason_for_not_purchasing}
                                  </div>
                                )}
                              </td>
                              <td className="p-3.5 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  {phone && (
                                    <a
                                      href={`tel:${phone}`}
                                      className="p-1.5 bg-[#f7f7f5] hover:bg-white border border-[#e5e2dc] rounded-lg text-xs"
                                      title="Call buyer"
                                    >
                                      📞
                                    </a>
                                  )}
                                  {waUrl && (
                                    <a
                                      href={waUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="p-1.5 bg-[#e1f5ee] hover:bg-[#d0f0e4] border border-[#0f6e56]/30 rounded-lg text-xs"
                                      title="WhatsApp buyer"
                                    >
                                      💬
                                    </a>
                                  )}
                                  <button
                                    onClick={() => setFollowUpOrder(c)}
                                    className="px-2.5 py-1 bg-[#d85a30] text-white rounded-lg text-xs font-semibold hover:bg-[#b8481f]"
                                  >
                                    Log Call
                                  </button>
                                  <form action={removeOrderChat.bind(null, c.order_id)}>
                                    <DeleteChatButton buyerName={c.buyer_name} />
                                  </form>
                                </div>
                              </td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: SALES RECOVERY & CONVERSION */}
          {currentTab === 'conversion' && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-[#1a1a1a]">
                    Customer Sales Recovery & Conversion
                  </h1>
                  <p className="text-xs sm:text-sm text-[#5b5b5b]">
                    Follow up with customers who inquired or added items but did not complete checkout.
                  </p>
                </div>
              </div>

              {/* Recovery KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
                <div className="bg-white border border-[#e5e2dc] rounded-2xl p-4 shadow-xs">
                  <div className="text-xs font-semibold text-[#5b5b5b]">Stalled Inquiries</div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-[#d85a30] mt-1">
                    {stalledInquiries.length}
                  </div>
                  <div className="text-[11px] text-[#8a8a8a] mt-1">Awaiting checkout completion</div>
                </div>

                <div className="bg-white border border-[#e5e2dc] rounded-2xl p-4 shadow-xs">
                  <div className="text-xs font-semibold text-[#5b5b5b]">Ready to Call (Ndiyo)</div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-[#0f6e56] mt-1">
                    {stalledInquiries.filter(c => c.contact_consent === true && c.buyer_phone).length}
                  </div>
                  <div className="text-[11px] text-[#0f6e56] mt-1">Phone numbers consented</div>
                </div>

                <div className="bg-white border border-[#e5e2dc] rounded-2xl p-4 shadow-xs">
                  <div className="text-xs font-semibold text-[#5b5b5b]">Already Contacted</div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-[#1a1a1a] mt-1">
                    {initialOrderChats.filter(c => c.follow_up_status === 'contacted' || c.follow_up_status === 'resolved').length}
                  </div>
                  <div className="text-[11px] text-[#8a8a8a] mt-1">Followed up by founders</div>
                </div>

                <div className="bg-white border border-[#e5e2dc] rounded-2xl p-4 shadow-xs">
                  <div className="text-xs font-semibold text-[#5b5b5b]">Recovered Orders</div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-[#0f6e56] mt-1">
                    {initialOrderChats.filter(c => c.follow_up_status === 'resolved').length}
                  </div>
                  <div className="text-[11px] text-[#0f6e56] mt-1">Saved from dropping off</div>
                </div>
              </div>

              {/* Call Queue */}
              <div className="bg-white border border-[#e5e2dc] rounded-2xl shadow-xs overflow-hidden">
                <div className="p-4 border-b border-[#e5e2dc] flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-[#1a1a1a]">Priority Follow-Up Queue</h3>
                    <p className="text-xs text-[#5b5b5b]">Buyers who accepted assistance calls and haven&apos;t finalized purchasing</p>
                  </div>
                </div>

                <div className="responsive-table-container">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-[#fafaf8] border-b border-[#e5e2dc] text-[#5b5b5b] uppercase text-[11px] font-semibold">
                      <tr>
                        <th className="p-3.5">Customer Name</th>
                        <th className="p-3.5">Phone Number</th>
                        <th className="p-3.5">Shop & Item</th>
                        <th className="p-3.5">Stage</th>
                        <th className="p-3.5">Follow-Up Status</th>
                        <th className="p-3.5 text-right">Quick Call</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e5e2dc]">
                      {stalledInquiries.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-[#8a8a8a]">
                            ✓ No stalled customer orders right now.
                          </td>
                        </tr>
                      ) : (
                        stalledInquiries.map((c) => (
                          <tr key={c.order_id} className="hover:bg-[#fafaf8]">
                            <td className="p-3.5 font-bold text-[#1a1a1a]">{c.buyer_name}</td>
                            <td className="p-3.5 font-mono text-[#d85a30] font-bold">
                              {c.buyer_phone || '—'}
                            </td>
                            <td className="p-3.5 text-[#5b5b5b]">
                              <div>{c.shop_name}</div>
                              <div className="text-[11px]">{c.product_name}</div>
                            </td>
                            <td className="p-3.5"><StatusPill status={c.status} /></td>
                            <td className="p-3.5">
                              <span className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-[#f7f7f5] border border-[#e5e2dc]">
                                {c.follow_up_status || 'Pending Call'}
                              </span>
                            </td>
                            <td className="p-3.5 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {c.buyer_phone && (
                                  <a
                                    href={`tel:${c.buyer_phone}`}
                                    className="px-3 py-1 bg-[#1a1a1a] text-white rounded-lg text-xs font-semibold hover:bg-[#333]"
                                  >
                                    📞 Call Now
                                  </a>
                                )}
                                <button
                                  onClick={() => setFollowUpOrder(c)}
                                  className="px-3 py-1 bg-[#d85a30] text-white rounded-lg text-xs font-semibold hover:bg-[#b8481f]"
                                >
                                  Log Outcome
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: SHOPS & SELLERS */}
          {currentTab === 'shops' && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-[#1a1a1a]">
                    Merchant Shops & Sellers
                  </h1>
                  <p className="text-xs sm:text-sm text-[#5b5b5b]">
                    Manage merchant profiles, generate shop claim tokens, and configure storefronts.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleTriggerVisitorPush}
                    disabled={visitorPushPending}
                    className="px-3.5 py-2 bg-white border border-[#e5e2dc] hover:bg-[#f7f7f5] text-[#1a1a1a] rounded-xl text-xs font-semibold shadow-2xs flex items-center gap-2 transition-colors disabled:opacity-50"
                    title="Tuma taarifa ya wageni wa leo mara moja kwa wamiliki wa maduka yaliyotembelewa"
                  >
                    <span>👀</span>
                    <span>{visitorPushPending ? 'Inatuma Push…' : 'Tuma Push ya Wageni Leo'}</span>
                  </button>
                </div>
              </div>

              {visitorPushResult && (
                <div className="mb-4 p-3 rounded-xl text-xs font-medium bg-[#f0faf5] border border-[#0f6e56]/20 text-[#0f6e56] flex items-center justify-between">
                  <span>{visitorPushResult}</span>
                  <button
                    onClick={() => setVisitorPushResult(null)}
                    className="text-base text-[#5b5b5b] hover:text-[#1a1a1a] leading-none ml-2"
                  >
                    &times;
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* Shops Table */}
                <div className="bg-white border border-[#e5e2dc] rounded-2xl shadow-xs overflow-hidden lg:col-span-2">
                  <div className="p-4 border-b border-[#e5e2dc] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <span className="text-sm font-bold text-[#1a1a1a]">
                      Registered Shops ({filteredShops.length})
                    </span>
                    <input
                      type="text"
                      placeholder="Search shops..."
                      value={shopSearch}
                      onChange={(e) => setShopSearch(e.target.value)}
                      className="text-xs py-1.5 px-3 max-w-[200px]"
                    />
                  </div>

                  <div className="responsive-table-container">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead className="bg-[#fafaf8] border-b border-[#e5e2dc] text-[#5b5b5b] uppercase text-[11px] font-semibold">
                        <tr>
                          <th className="p-3.5">Shop Name</th>
                          <th className="p-3.5">Phone & Location</th>
                          <th className="p-3.5">Visitors Today</th>
                          <th className="p-3.5">Claim Token</th>
                          <th className="p-3.5">Status</th>
                          <th className="p-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#e5e2dc]">
                        {filteredShops.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="p-8 text-center text-[#8a8a8a]">
                              No shops registered.
                            </td>
                          </tr>
                        ) : (
                          filteredShops.map((shop) => (
                            <tr key={shop.shop_id} className="hover:bg-[#fafaf8]">
                              <td className="p-3.5">
                                <strong className="text-[#1a1a1a] block">{shop.name}</strong>
                                <span className="text-[11px] text-[#8a8a8a]">{shop.product_count} products</span>
                              </td>
                              <td className="p-3.5 text-[#5b5b5b]">
                                <div>{shop.phone}</div>
                                <div className="text-[11px]">{shop.location || '—'}</div>
                              </td>
                              <td className="p-3.5">
                                <div className="inline-flex items-center gap-1.5 font-bold text-xs text-[#0f6e56] bg-[#e1f5ee] px-2.5 py-1 rounded-lg">
                                  <span>👀</span>
                                  <span>{shopVisitorsMap[shop.shop_id]?.today_visitors ?? 0}</span>
                                </div>
                                <div className="text-[10px] text-[#8a8a8a] mt-0.5">
                                  Jana: {shopVisitorsMap[shop.shop_id]?.yesterday_visitors ?? 0}
                                </div>
                              </td>
                              <td className="p-3.5">
                                <div className="flex items-center gap-1 font-mono font-bold text-xs text-[#d85a30]">
                                  <span>{shop.token}</span>
                                  <CopyTokenButton token={shop.token} />
                                </div>
                              </td>
                              <td className="p-3.5"><StatusPill status={shop.status} /></td>
                              <td className="p-3.5 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <EditShopButton onClick={() => setEditingShop(shop)} />
                                  <form action={removeShop.bind(null, shop.shop_id)}>
                                    <DeleteShopButton shopName={shop.name} />
                                  </form>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>


                {/* Add Shop Form */}
                <div className="bg-white border border-[#e5e2dc] rounded-2xl p-5 shadow-xs lg:col-span-1">
                  <h3 className="text-base font-bold text-[#1a1a1a] mb-1">
                    Register New Shop
                  </h3>
                  <p className="text-xs text-[#5b5b5b] mb-4">
                    Create shop and generate token for seller onboarding.
                  </p>

                  <form ref={shopFormRef} action={shopFormAction} className="space-y-3.5">
                    <div>
                      <label className="text-xs font-semibold text-[#5b5b5b] block mb-1">
                        Shop Name
                      </label>
                      <input
                        name="name"
                        type="text"
                        placeholder="e.g. Oren Electronics"
                        required
                        className="w-full text-xs sm:text-sm"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-[#5b5b5b] block mb-1">
                        Phone Number
                      </label>
                      <input
                        name="phone"
                        type="tel"
                        placeholder="e.g. 0712345678"
                        required
                        className="w-full text-xs sm:text-sm"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-[#5b5b5b] block mb-1">
                        Shop Location
                      </label>
                      <input
                        name="location"
                        type="text"
                        placeholder="e.g. Kariakoo, Dar"
                        className="w-full text-xs sm:text-sm"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-[#5b5b5b] block mb-1">
                        Description
                      </label>
                      <input
                        name="description"
                        type="text"
                        placeholder="e.g. Vyakula na mboga"
                        className="w-full text-xs sm:text-sm"
                      />
                    </div>

                    {shopError && (
                      <p className="text-xs text-[#c0392b] bg-[#fdf0ee] p-2.5 rounded-xl font-medium">
                        {shopError}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={shopPending}
                      className="w-full py-2.5 bg-[#d85a30] text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-[#b8481f] disabled:opacity-50 transition-colors"
                    >
                      {shopPending ? 'Registering…' : 'Register & Generate Token'}
                    </button>
                  </form>
                </div>
              </div>

              {editingShop && (
                <EditShopDialog shop={editingShop} onClose={() => setEditingShop(null)} />
              )}
            </div>
          )}

          {/* TAB: BROADCAST */}
          {currentTab === 'broadcast' && (
            <div>
              <div className="mb-6">
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#1a1a1a]">
                  Push Broadcasts & Announcements
                </h1>
                <p className="text-xs sm:text-sm text-[#5b5b5b]">
                  Send notifications to all customer and rider devices connected to Oren Delivery.
                </p>
              </div>

              <div className="max-w-2xl">
                <AnnouncementForm />
              </div>
            </div>
          )}
        </div>
      </main>

      {/* DIALOG: Shop Approved */}
      {approvedModalData && (
        <RegistrationApprovedDialog
          shopName={approvedModalData.shopName}
          phone={approvedModalData.phone}
          cleanPhone={approvedModalData.cleanPhone}
          token={approvedModalData.token}
          onClose={() => setApprovedModalData(null)}
        />
      )}

      {/* DIALOG: Rider Approved */}
      {approvedRiderModalData && (
        <RiderApprovedDialog
          riderName={approvedRiderModalData.riderName}
          phone={approvedRiderModalData.phone}
          cleanPhone={approvedRiderModalData.cleanPhone}
          token={approvedRiderModalData.token}
          onClose={() => setApprovedRiderModalData(null)}
        />
      )}

      {/* DIALOG: Follow Up Logger */}
      {followUpOrder && (
        <FollowUpDialog
          order={followUpOrder}
          onClose={() => setFollowUpOrder(null)}
        />
      )}

      {/* DIALOG: Reset Riders Confirmation */}
      {resetRidersOpen && (
        <ResetRidersDialog
          currentCount={initialRiders.length}
          onClose={() => setResetRidersOpen(false)}
        />
      )}
    </div>
  )
}
