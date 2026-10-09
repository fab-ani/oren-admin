'use client'

import React, { useEffect, useRef, useState } from 'react'
import { CopyTokenButton } from './copy-token-button'

interface RegistrationApprovedDialogProps {
  shopName: string
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

export function RegistrationApprovedDialog({
  shopName,
  phone,
  cleanPhone,
  token,
  onClose,
}: RegistrationApprovedDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [customMsg, setCustomMsg] = useState(
    `Habari ${shopName}! Ombi lako la kujiunga na Oren limekubaliwa. Huu hapa ni Token yako ya Duka: ${token}\n\nFungua Oren App kisha weka token hii kuingia na kuweka bidhaa zako.`
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
      style={{
        border: '1px solid var(--border)',
        borderRadius: 14,
        padding: '1.5rem',
        maxWidth: 480,
        width: '92%',
        boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
        background: '#fff',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'var(--success-tint)',
            color: 'var(--success)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
            fontWeight: 'bold',
          }}
        >
          ✓
        </div>
        <div>
          <span style={{ fontSize: 16, fontWeight: 600, display: 'block', color: 'var(--text)' }}>
            Shop Approved!
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-3)' }}>
            {shopName} ({phone})
          </span>
        </div>
      </div>

      <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: '1rem' }}>
        A shop has been created and a token has been generated. Send this token to the shop owner so they can claim their shop in the Oren app.
      </p>

      {/* Token Box */}
      <div
        style={{
          background: '#f7f7f6',
          border: '1px dashed var(--border)',
          borderRadius: 10,
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.25rem',
        }}
      >
        <div>
          <span style={{ fontSize: 11, color: 'var(--text-3)', display: 'block', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Generated Shop Token
          </span>
          <code style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent)', letterSpacing: 1 }}>
            {token}
          </code>
        </div>
        <CopyTokenButton token={token} />
      </div>

      {/* WhatsApp Message Preview */}
      <div style={{ marginBottom: '1.25rem' }}>
        <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-2)', display: 'block', marginBottom: 6 }}>
          WhatsApp Message (editable)
        </label>
        <textarea
          rows={4}
          value={customMsg}
          onChange={(e) => setCustomMsg(e.target.value)}
          style={{
            width: '100%',
            boxSizing: 'border-box',
            border: '1px solid var(--border)',
            borderRadius: 10,
            padding: '10px 12px',
            fontSize: 13,
            fontFamily: 'inherit',
            resize: 'vertical',
            background: '#fff',
            color: 'var(--text)',
          }}
        />
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={onClose}
          style={{
            background: 'none',
            border: '1px solid var(--border)',
            padding: '9px 16px',
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
            color: 'var(--text-2)',
          }}
        >
          Close
        </button>

        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            background: '#25D366',
            color: 'white',
            border: 'none',
            padding: '9px 20px',
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span>💬</span> Send via WhatsApp
        </a>
      </div>
    </dialog>
  )
}
