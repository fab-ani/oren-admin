'use client'

import React, { useMemo, useState } from 'react'
import { Shipment } from '@/lib/api'

interface ShipmentsChartProps {
  shipments: Shipment[]
}

export function ShipmentsChart({ shipments }: ShipmentsChartProps) {
  const [range, setRange] = useState<'7d' | '30d' | 'all'>('7d')

  // Calculate metrics
  const total = shipments.length
  const delivered = shipments.filter(s => s.status === 'delivered').length
  const inTransit = shipments.filter(s => s.status === 'in_transit').length
  const pending = shipments.filter(s => s.status === 'pending').length
  const arrived = shipments.filter(s => s.status === 'arrived').length

  const completionRate = total > 0 ? Math.round((delivered / total) * 100) : 0

  // Group by day for the selected range
  const dailyData = useMemo(() => {
    const daysCount = range === '7d' ? 7 : range === '30d' ? 30 : 14
    const result: Array<{ dateStr: string; label: string; count: number; delivered: number }> = []
    const now = new Date()

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().slice(0, 10)
      const label = range === '7d'
        ? d.toLocaleDateString('en-US', { weekday: 'short' })
        : `${d.getDate()}/${d.getMonth() + 1}`

      result.push({
        dateStr,
        label,
        count: 0,
        delivered: 0,
      })
    }

    // Populate counts
    shipments.forEach(s => {
      if (!s.created_at) return
      const sDate = s.created_at.slice(0, 10)
      const item = result.find(r => r.dateStr === sDate)
      if (item) {
        item.count += 1
        if (s.status === 'delivered') item.delivered += 1
      }
    })

    return result
  }, [shipments, range])

  const maxVal = Math.max(...dailyData.map(d => d.count), 5)

  return (
    <div className="bg-white border border-[#e5e2dc] rounded-2xl p-4 sm:p-6 shadow-sm mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-[#1a1a1a]">Shipments Analytics & Trends</h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#faeeda] text-[#d85a30]">
              {total} Total
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#5b5b5b] mt-0.5">
            Volume tracking, completion rates, and real-time delivery progression
          </p>
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-[#f7f7f5] p-1 rounded-xl border border-[#e5e2dc]">
          {(['7d', '30d', 'all'] as const).map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                range === r
                  ? 'bg-white text-[#d85a30] shadow-sm'
                  : 'text-[#5b5b5b] hover:text-[#1a1a1a]'
              }`}
            >
              {r === '7d' ? 'Last 7 Days' : r === '30d' ? '30 Days' : 'Past 2 Weeks'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Mini-cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-[#f7f7f5] p-3 rounded-xl border border-[#e5e2dc]/60">
          <div className="text-xs font-medium text-[#5b5b5b]">In Transit</div>
          <div className="text-xl font-extrabold text-[#d85a30] mt-0.5">{inTransit}</div>
          <div className="text-[11px] text-[#8a8a8a] mt-0.5">Active on road</div>
        </div>
        <div className="bg-[#f7f7f5] p-3 rounded-xl border border-[#e5e2dc]/60">
          <div className="text-xs font-medium text-[#5b5b5b]">Delivered</div>
          <div className="text-xl font-extrabold text-[#0f6e56] mt-0.5">{delivered}</div>
          <div className="text-[11px] text-[#0f6e56] mt-0.5">{completionRate}% completed</div>
        </div>
        <div className="bg-[#f7f7f5] p-3 rounded-xl border border-[#e5e2dc]/60">
          <div className="text-xs font-medium text-[#5b5b5b]">Arrived / Ready</div>
          <div className="text-xl font-extrabold text-[#1a1a1a] mt-0.5">{arrived}</div>
          <div className="text-[11px] text-[#8a8a8a] mt-0.5">At drop-off point</div>
        </div>
        <div className="bg-[#f7f7f5] p-3 rounded-xl border border-[#e5e2dc]/60">
          <div className="text-xs font-medium text-[#5b5b5b]">Pending Pickup</div>
          <div className="text-xl font-extrabold text-[#854f0b] mt-0.5">{pending}</div>
          <div className="text-[11px] text-[#8a8a8a] mt-0.5">Awaiting rider</div>
        </div>
      </div>

      {/* Status Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center text-xs font-medium text-[#5b5b5b] mb-1.5">
          <span>Delivery Pipeline Distribution</span>
          <span>{completionRate}% success rate</span>
        </div>
        <div className="w-full h-3 bg-[#e5e2dc] rounded-full overflow-hidden flex">
          {delivered > 0 && (
            <div
              style={{ width: `${(delivered / total) * 100}%` }}
              className="bg-[#0f6e56] h-full transition-all"
              title={`Delivered: ${delivered}`}
            />
          )}
          {inTransit > 0 && (
            <div
              style={{ width: `${(inTransit / total) * 100}%` }}
              className="bg-[#d85a30] h-full transition-all"
              title={`In Transit: ${inTransit}`}
            />
          )}
          {arrived > 0 && (
            <div
              style={{ width: `${(arrived / total) * 100}%` }}
              className="bg-[#1a1a1a] h-full transition-all"
              title={`Arrived: ${arrived}`}
            />
          )}
          {pending > 0 && (
            <div
              style={{ width: `${(pending / total) * 100}%` }}
              className="bg-[#854f0b] h-full transition-all"
              title={`Pending: ${pending}`}
            />
          )}
        </div>
        <div className="flex flex-wrap items-center gap-4 mt-2 text-[11px] text-[#5b5b5b]">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0f6e56]" /> Delivered ({delivered})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#d85a30]" /> In Transit ({inTransit})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1a1a1a]" /> Arrived ({arrived})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#854f0b]" /> Pending ({pending})
          </span>
        </div>
      </div>

      {/* SVG Bar Chart */}
      <div className="mt-4">
        <div className="text-xs font-semibold text-[#5b5b5b] uppercase tracking-wider mb-3">
          Daily Shipment Volume
        </div>
        <div className="w-full overflow-x-auto">
          <div className="min-w-[320px] h-48 flex items-end gap-2 sm:gap-3 pt-6 pb-2 px-2 border-b border-[#e5e2dc]">
            {dailyData.map((d, idx) => {
              const heightPercent = maxVal > 0 ? (d.count / maxVal) * 100 : 0
              const deliveredPercent = d.count > 0 ? (d.delivered / d.count) * 100 : 0

              return (
                <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-[#1a1a1a] text-white text-[11px] font-semibold py-1 px-2 rounded pointer-events-none whitespace-nowrap z-10 shadow-lg">
                    {d.count} shipment{d.count === 1 ? '' : 's'} ({d.delivered} delivered)
                  </div>

                  <div className="w-full max-w-[36px] bg-[#f7f7f5] rounded-t-md h-full flex items-end overflow-hidden border border-[#e5e2dc]/80">
                    <div
                      style={{ height: `${Math.max(heightPercent, 4)}%` }}
                      className="w-full bg-[#d85a30] relative transition-all rounded-t-sm"
                    >
                      {d.delivered > 0 && (
                        <div
                          style={{ height: `${deliveredPercent}%` }}
                          className="w-full bg-[#0f6e56] absolute bottom-0 left-0 transition-all"
                        />
                      )}
                    </div>
                  </div>

                  <span className="text-[10px] sm:text-xs text-[#8a8a8a] mt-2 font-medium truncate max-w-full">
                    {d.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
