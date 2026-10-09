'use client'

import React, { useRef, useEffect, useState, useTransition } from 'react'
import { OrderChat } from '@/lib/api'
import { updateFollowUpAction } from './actions'

interface FollowUpDialogProps {
  order: OrderChat
  onClose: () => void
  onSuccess?: () => void
}

const LOST_SALE_REASONS = [
  { value: 'high_delivery_fee', label: 'Gharama kubwa ya usafirishaji (High delivery fee)' },
  { value: 'delivery_too_slow', label: 'Muda wa kuletewa ni mrefu (Delivery too slow)' },
  { value: 'item_out_of_stock', label: 'Bidhaa iliisha / haipatikani (Item out of stock)' },
  { value: 'found_cheaper_elsewhere', label: 'Alipata bei nafuu kwingine (Found cheaper elsewhere)' },
  { value: 'payment_channel_issue', label: 'Changamoto ya malipo (Payment / network issue)' },
  { value: 'change_of_mind', label: 'Amebadili mawazo (Change of mind)' },
  { value: 'seller_slow_response', label: 'Muuzaji alichelewa kujibu (Seller slow response)' },
  { value: 'mistaken_inquiry', label: 'Aliuliza kimakosa / alijaribu tu (Mistaken inquiry)' },
  { value: 'destination_not_covered', label: 'Eneo halifikiwi kirahisi (Destination not covered)' },
  { value: 'item_variant_unavailable', label: 'Saizi / rangi aliyotaka haipo (Variant unavailable)' },
  { value: 'budget_constraint', label: 'Hana bajeti kwa sasa / atarudi (Budget constraint)' },
  { value: 'trust_hesitation', label: 'Wasiwasi wa kulipia kabla (Trust / prepayment hesitation)' },
  { value: 'unreachable_phone', label: 'Simu haipatikani / haipokelewi (Unreachable phone)' },
  { value: 'wrong_phone_number', label: 'Namba sio sahihi (Wrong phone number)' },
  { value: 'other', label: 'Sababu nyingine (Other reason)' },
]

export function FollowUpDialog({ order, onClose, onSuccess }: FollowUpDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [status, setStatus] = useState<string>(order.follow_up_status || 'contacted')
  const [reason, setReason] = useState<string>(order.reason_for_not_purchasing || '')
  const [notes, setNotes] = useState<string>(order.follow_up_notes || '')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    dialogRef.current?.showModal()
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const res = await updateFollowUpAction(order.order_id, {
        follow_up_status: status,
        reason_for_not_purchasing: reason || undefined,
        notes: notes || undefined,
      })
      if (res.ok) {
        onSuccess?.()
        onClose()
      } else {
        setError(res.error || 'Failed to save follow-up record')
      }
    })
  }

  const phone = order.buyer_phone || ''
  const waUrl = order.wa_link || (order.clean_buyer_phone ? `https://wa.me/${order.clean_buyer_phone}` : '')

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="p-6 max-w-lg w-[94%] rounded-2xl border border-[#e5e2dc] bg-white shadow-2xl backdrop:bg-black/40"
    >
      <div className="flex items-start justify-between gap-3 mb-4 border-b border-[#e5e2dc] pb-3">
        <div>
          <span className="text-[11px] font-semibold text-[#8a8a8a] uppercase tracking-wider block">
            Customer Call & Sales Recovery
          </span>
          <h3 className="text-base sm:text-lg font-bold text-[#1a1a1a]">
            {order.buyer_name}
          </h3>
          <p className="text-xs text-[#5b5b5b]">
            Shop: {order.shop_name || '—'} · Item: {order.product_name || 'Inquiry'}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-[#8a8a8a] hover:text-[#1a1a1a] text-xl font-bold p-1 leading-none"
        >
          &times;
        </button>
      </div>

      {/* Contact & Consent Badge */}
      <div className="bg-[#f7f7f5] border border-[#e5e2dc] rounded-xl p-3 mb-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#1a1a1a]">Phone:</span>
            <span className="text-sm font-mono font-bold text-[#d85a30]">{phone || 'Not provided'}</span>
          </div>
          {order.contact_consent === true ? (
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#e1f5ee] text-[#0f6e56]">
              ✓ Ndiyo (Anakubali Kupigiwa)
            </span>
          ) : order.contact_consent === false ? (
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#faeeda] text-[#854f0b]">
              ✕ Hapana (Hakupendelea Simu)
            </span>
          ) : (
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#e5e2dc] text-[#5b5b5b]">
              Haijaulizwa
            </span>
          )}
        </div>

        {phone && (
          <div className="flex items-center gap-2 pt-2 border-t border-[#e5e2dc]/70">
            <a
              href={`tel:${phone}`}
              className="flex-1 bg-[#1a1a1a] text-white py-1.5 px-3 rounded-lg text-xs font-semibold text-center hover:bg-[#333] transition-colors flex items-center justify-center gap-1.5"
            >
              <span>📞 Piga Simu</span>
            </a>
            {waUrl && (
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-[#25D366] text-white py-1.5 px-3 rounded-lg text-xs font-semibold text-center hover:bg-[#20ba59] transition-colors flex items-center justify-center gap-1.5"
              >
                <span>💬 WhatsApp</span>
              </a>
            )}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label className="text-xs font-semibold text-[#5b5b5b] block mb-1">
            Follow-Up Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full text-xs sm:text-sm bg-[#f7f7f5] border border-[#e5e2dc] rounded-xl p-2.5 text-[#1a1a1a] focus:outline-none focus:border-[#d85a30]"
          >
            <option value="pending">Pending (Awaiting Call)</option>
            <option value="contacted">Contacted (Customer Spoke to Us)</option>
            <option value="resolved">Resolved (Recovered / Order Completed)</option>
            <option value="dropped">Dropped (Lost Sale / Decided Not to Buy)</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-[#5b5b5b] block mb-1">
            Lost Sale Reason (Sababu ya Kutokununua)
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full text-xs sm:text-sm bg-[#f7f7f5] border border-[#e5e2dc] rounded-xl p-2.5 text-[#1a1a1a] focus:outline-none focus:border-[#d85a30]"
          >
            <option value="">-- Chagua Sababu (Optional ikiwa bado) --</option>
            {LOST_SALE_REASONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-[#5b5b5b] block mb-1">
            Call Notes (Maelezo ya Ziada)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="e.g. Mteja alisema atalipia jioni baada ya kazi; tumempa namba ya Lipa Namba..."
            className="w-full text-xs sm:text-sm bg-[#f7f7f5] border border-[#e5e2dc] rounded-xl p-2.5 resize-none text-[#1a1a1a] focus:outline-none focus:border-[#d85a30]"
          />
        </div>

        {error && (
          <p className="text-xs text-[#c0392b] bg-[#fdf0ee] p-2 rounded-lg">{error}</p>
        )}

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-[#e5e2dc] rounded-xl text-xs sm:text-sm font-semibold text-[#5b5b5b] hover:bg-[#f7f7f5]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="px-5 py-2 bg-[#d85a30] text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-[#b8481f] disabled:opacity-50"
          >
            {isPending ? 'Saving…' : 'Save Follow-Up'}
          </button>
        </div>
      </form>
    </dialog>
  )
}
