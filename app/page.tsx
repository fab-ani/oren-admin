import {
  listShops, listShipments, listRiders, listSellers, listOrderChats,
  listShopRegistrations, listRiderRegistrations, getConversionMetrics,
  getAdminVisitorStats, getRecentAdminEvents,
  Shop, Shipment, Rider, Seller, OrderChat,
  ShopRegistration, RiderRegistration, ConversionMetrics, AdminVisitorStatsResponse,
  AdminEvent
} from '@/lib/api'
import {
  mockShops, mockShipments, mockRiders, mockSellers, mockOrderChats,
  mockRiderRegistrations, mockConversionMetrics, mockVisitorStats
} from '@/lib/mock-data'
import { DashboardClient } from './dashboard-client'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  let shops: Shop[] = []
  let shipments: Shipment[] = []
  let riders: Rider[] = []
  let sellers: Seller[] = []
  let orderChats: OrderChat[] = []
  let shopRegistrations: ShopRegistration[] = []
  let riderRegistrations: RiderRegistration[] = []
  let conversionMetrics: ConversionMetrics = mockConversionMetrics
  let visitorStats: AdminVisitorStatsResponse = mockVisitorStats
  let recentEvents: AdminEvent[] = []
  let loadError: string | null = null

  try {
    const data = await Promise.all([
      listShops(),
      listShipments(),
      listRiders(),
      listSellers(),
    ])
    shops = data[0]
    shipments = data[1]
    riders = data[2]
    sellers = data[3]
  } catch (e) {
    if (process.env.NODE_ENV !== 'production') {
      shops = mockShops
      shipments = mockShipments
      riders = mockRiders
      sellers = mockSellers
    } else {
      loadError = e instanceof Error ? e.message : 'Failed to load data from the server.'
    }
  }

  try {
    orderChats = await listOrderChats()
  } catch {
    orderChats = process.env.NODE_ENV !== 'production' ? mockOrderChats : []
  }

  try {
    shopRegistrations = await listShopRegistrations()
  } catch {
    shopRegistrations = []
  }

  try {
    riderRegistrations = await listRiderRegistrations()
  } catch {
    riderRegistrations = process.env.NODE_ENV !== 'production' ? mockRiderRegistrations : []
  }

  try {
    conversionMetrics = await getConversionMetrics()
  } catch {
    conversionMetrics = mockConversionMetrics
  }

  try {
    visitorStats = await getAdminVisitorStats()
  } catch {
    visitorStats = mockVisitorStats
  }

  try {
    recentEvents = await getRecentAdminEvents()
  } catch {
    recentEvents = []
  }

  if (loadError) {
    return (
      <main style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px' }}>
        <p
          style={{
            fontSize: 14,
            color: '#c0392b',
            background: '#fdf0ee',
            padding: '12px 16px',
            borderRadius: 10,
          }}
        >
          <strong>Connection Error:</strong> {loadError}
        </p>
      </main>
    )
  }

  return (
    <DashboardClient
      initialShops={shops}
      initialShipments={shipments}
      initialRiders={riders}
      initialSellers={sellers}
      initialOrderChats={orderChats}
      initialRegistrations={shopRegistrations}
      initialRiderRegistrations={riderRegistrations}
      initialConversionMetrics={conversionMetrics}
      initialVisitorStats={visitorStats}
      initialRecentEvents={recentEvents}
    />
  )
}


