'use client'

import { useActionState, useEffect, useRef } from 'react'
import { editShop } from './actions'
import type { Shop } from '@/lib/api'

const inputStyle: React.CSSProperties = { width: '100%', boxSizing: 'border-box' }
const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 500,
  color: 'var(--text-2)',
  display: 'block',
  marginBottom: 5,
}

// Rendered once, at the tab level, for whichever shop is currently being
// edited — not one per row — so there's exactly one <dialog> in the DOM and
// it can never end up showing a different shop's data. See dashboard-client.
export function EditShopDialog({ shop, onClose }: { shop: Shop; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const boundEditShop = editShop.bind(null, shop.shop_id)
  const [error, formAction, pending] = useActionState(boundEditShop, null)
  const prevPending = useRef(pending)

  useEffect(() => {
    dialogRef.current?.showModal()
  }, [])

  useEffect(() => {
    if (prevPending.current && !pending && !error) {
      onClose()
    }
    prevPending.current = pending
  }, [pending, error, onClose])

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      style={{
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: '1.25rem',
        maxWidth: 420,
        width: '90%',
      }}
    >
      <span style={{ fontSize: 14, fontWeight: 500, display: 'block', marginBottom: '1rem' }}>
        Edit shop
      </span>

      <form action={formAction}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>Shop Name</label>
          <input name="name" type="text" defaultValue={shop.name} required style={inputStyle} />
        </div>

        <div
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: '1rem' }}
        >
          <div>
            <label style={labelStyle}>Phone</label>
            <input name="phone" type="tel" defaultValue={shop.phone} required style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Location</label>
            <input name="location" type="text" defaultValue={shop.location ?? ''} style={inputStyle} />
          </div>
        </div>

        {error && <p style={{ fontSize: 13, color: '#c0392b', marginBottom: '1rem' }}>{error}</p>}

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              flex: 1,
              background: 'none',
              border: '1px solid var(--border)',
              borderRadius: 10,
              padding: '9px 20px',
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={pending}
            style={{
              flex: 1,
              background: 'var(--accent)',
              color: 'white',
              border: 'none',
              padding: '9px 20px',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 500,
              cursor: pending ? 'default' : 'pointer',
              opacity: pending ? 0.7 : 1,
            }}
          >
            {pending ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    </dialog>
  )
}
