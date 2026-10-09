'use client'

import React, { useEffect, useRef, useState } from 'react'
import { CopyTokenButton } from './copy-token-button'

interface RiderApprovedDialogProps {
  riderName: string
  phone: string
  cleanPhone: string
  token: string
  onClose: () => void
}

function formatWhatsAppPhone(phone: string): string {
  let digits = phone.replace(/[^0-9]/g, '')
  if (digits.startsWith('0') && digits.length === 10) {
    digits = '255' + digits.substring(1)
  }
  return digits
}

export function RiderApprovedDialog({
  riderName,
  phone,
  cleanPhone,
  token,
  onClose,
}: RiderApprovedDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [customMsg, setCustomMsg] = useState(
    `Habari ${riderName}! Usajili wako kama dereva wa Oren Delivery umekamilika. Huu hapa ni Token yako: ${token}\n\nFungua Oren App kwenye menyu ya "Become a Rider" kisha weka token hii kuunganisha akaunti yako na kuanza kupokea oda za kusafirisha.`
  )

  useEffect(() => {
    dialogRef.current?.showModal()
  }, [])

  const waPhone = formatWhatsAppPhone(cleanPhone || phone)
  const waUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(customMsg)}`

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="p-6 max-w-lg w-[92%] rounded-2xl border border-[#e5e2dc] bg-white shadow-2xl backdrop:bg-black/40"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-[#e1f5ee] text-[#0f6e56] flex items-center justify-center text-xl font-bold">
          ✓
        </div>
        <div>
          <h3 className="text-base sm:text-lg font-bold text-[#1a1a1a]">Rider Approved & Registered!</h3>
          <p className="text-xs text-[#5b5b5b]">
            {riderName} ({phone})
          </p>
        </div>
      </div>

      <p className="text-xs sm:text-sm text-[#5b5b5b] mb-4">
        A rider account has been created and claim token <code className="font-bold text-[#d85a30]">{token}</code> has been generated. Share this token with the rider so they can activate their rider dashboard in the mobile app.
      </p>

      {/* Token Box */}
      <div className="bg-[#f7f7f5] border border-dashed border-[#e5e2dc] rounded-xl p-3.5 flex items-center justify-between mb-4">
        <div>
          <span className="text-[11px] font-semibold text-[#8a8a8a] uppercase tracking-wider block">
            Rider Claim Token
          </span>
          <span className="text-xl font-mono font-extrabold text-[#d85a30] tracking-wider">
            {token}
          </span>
        </div>
        <CopyTokenButton token={token} />
      </div>

      {/* WhatsApp Message Composer */}
      <div className="mb-5">
        <label className="text-xs font-semibold text-[#5b5b5b] block mb-1.5">
          WhatsApp Message Preview
        </label>
        <textarea
          value={customMsg}
          onChange={(e) => setCustomMsg(e.target.value)}
          rows={4}
          className="w-full text-xs sm:text-sm bg-[#f7f7f5] border border-[#e5e2dc] rounded-xl p-2.5 resize-none text-[#1a1a1a] focus:outline-none focus:border-[#d85a30]"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-2.5">
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:flex-1 bg-[#25D366] text-white py-2.5 px-4 rounded-xl text-center text-xs sm:text-sm font-semibold hover:bg-[#20ba59] transition-colors flex items-center justify-center gap-2"
        >
          <span>Share via WhatsApp</span>
          <span>→</span>
        </a>
        <button
          onClick={onClose}
          className="w-full sm:w-auto px-5 py-2.5 border border-[#e5e2dc] rounded-xl text-xs sm:text-sm font-semibold text-[#5b5b5b] hover:bg-[#f7f7f5] transition-colors"
        >
          Done
        </button>
      </div>
    </dialog>
  )
}
