'use client'

export function EditShopButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      title="Edit shop"
      onClick={onClick}
      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-2)' }}
    >
      ✎
    </button>
  )
}
