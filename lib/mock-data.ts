// Dev-only stand-in data, used when the Flask backend rejects requests
// (e.g. FLASK_ADMIN_TOKEN is still a placeholder) so the dashboard UI can
// be exercised locally without real backend access. See app/page.tsx.
import { Shop, Shipment, Rider, Seller, OrderChat, RiderRegistration, ConversionMetrics, AdminVisitorStatsResponse } from './api'

export const mockSellers: Seller[] = [
  { id: 1, name: 'Amina Hassan', phone: '0712345678', created_at: '2026-07-01T09:00:00Z' },
  { id: 2, name: 'Juma Mwita', phone: '0765432109', created_at: '2026-07-10T09:00:00Z' },
]

export const mockShops: Shop[] = [
  {
    shop_id: 1,
    name: 'Oren Electronics',
    phone: '0712345678',
    location: 'Kariakoo, Dar',
    photo_url: null,
    description: 'Bidhaa za umeme',
    category: 'electronics',
    icon: null,
    is_open: true,
    token: 'TOK-ABC123',
    seller_id: 1,
    status: 'claimed',
    product_count: 12,
    created_at: '2026-07-01T09:00:00Z',
  },
  {
    shop_id: 2,
    name: 'Mama Fatuma Groceries',
    phone: '0765432109',
    location: 'Sinza, Dar',
    photo_url: null,
    description: 'Vyakula na mboga',
    category: 'grocery',
    icon: null,
    is_open: true,
    token: 'TOK-XYZ789',
    seller_id: 2,
    status: 'pending',
    product_count: 0,
    created_at: '2026-07-10T09:00:00Z',
  },
]

export const mockRiders: Rider[] = []

export const mockRiderRegistrations: RiderRegistration[] = []

export const mockConversionMetrics: ConversionMetrics = {
  total_inquiries: 0,
  stalled_orders: 0,
  contactable_buyers: 0,
  pending_follow_ups: 0,
  contacted_follow_ups: 0,
  resolved_conversions: 0,
  dropped_conversions: 0,
  conversion_rate_percent: 0,
  top_lost_reasons: [],
}

export const mockOrderChats: OrderChat[] = [
  {
    order_id: 1,
    buyer_name: 'Baraka Mushi',
    shop_name: 'Oren Electronics',
    product_name: 'Simu ya mkononi',
    status: 'pending_availability',
    reached_payment: false,
    message_count: 1,
    last_message_at: '2026-08-07T09:05:00Z',
    created_at: '2026-08-07T09:00:00Z',
  },
  {
    order_id: 2,
    buyer_name: 'Neema Kessy',
    shop_name: 'Mama Fatuma Groceries',
    product_name: 'Vyakula',
    status: 'available',
    reached_payment: true,
    message_count: 3,
    last_message_at: '2026-08-06T16:20:00Z',
    created_at: '2026-08-06T15:30:00Z',
  },
]

export const mockShipments: Shipment[] = [
  {
    shipment_id: 1,
    tracking_token: 'TRK-001',
    box_id: null,
    customer_name: 'Baraka Mushi',
    customer_phone: '0722223333',
    cargo_name: 'Simu ya mkononi',
    cargo_destination: 'Mikocheni, Dar',
    cargo_from: 'Kariakoo, Dar',
    from_lat: -6.8235,
    from_lon: 39.2695,
    to_lat: -6.7735,
    to_lon: 39.2295,
    expected_arrival: null,
    time_to_departure: null,
    cargo_type: 'parcel',
    status: 'in_transit',
    created_at: '2026-08-07T10:00:00Z',
    seller_id: 1,
    rider_id: 1,
    product_photo_url: null,
    gps_source: 'rider_phone',
    marked_delivered_by_rider_at: null,
    confirm_deadline: null,
    confirmed_by: null,
  },
  {
    shipment_id: 2,
    tracking_token: 'TRK-002',
    box_id: null,
    customer_name: 'Neema Kessy',
    customer_phone: '0733334444',
    cargo_name: 'Vyakula',
    cargo_destination: 'Sinza, Dar',
    cargo_from: 'Sinza, Dar',
    from_lat: -6.7735,
    from_lon: 39.2295,
    to_lat: -6.7801,
    to_lon: 39.2401,
    expected_arrival: null,
    time_to_departure: null,
    cargo_type: 'parcel',
    status: 'delivered',
    created_at: '2026-08-06T15:30:00Z',
    seller_id: 2,
    rider_id: 2,
    product_photo_url: null,
    gps_source: 'rider_phone',
    marked_delivered_by_rider_at: '2026-08-06T16:10:00Z',
    confirm_deadline: '2026-08-06T16:40:00Z',
    confirmed_by: 'customer',
  },
]

export const mockVisitorStats: AdminVisitorStatsResponse = {
  ok: true,
  date: '2026-10-09',
  total_today_visitors: 0,
  total_yesterday_visitors: 0,
  shops: [],
}

