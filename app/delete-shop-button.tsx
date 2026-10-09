'use client'

export function DeleteShopButton({ shopName }: { shopName: string }) {
  return (
    <button
      type="submit"
      title="Delete shop"
      onClick={(e) => {
        if (!confirm(`Delete shop "${shopName}"? This action cannot be undone.`)) {
          e.preventDefault()
        }
      }}
      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-2)' }}
    >
      🗑
    </button>
  )
}
