'use client'

export function DeleteShipmentButton({ cargoName }: { cargoName: string }) {
  return (
    <button
      type="submit"
      title="Delete shipment"
      onClick={(e) => {
        if (!confirm(`Delete shipment "${cargoName}"? This action cannot be undone.`)) {
          e.preventDefault()
        }
      }}
      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-2)' }}
    >
      🗑
    </button>
  )
}
