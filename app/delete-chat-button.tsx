'use client'

export function DeleteChatButton({ buyerName }: { buyerName: string }) {
  return (
    <button
      type="submit"
      title="Delete chat"
      onClick={(e) => {
        if (!confirm(`Delete the chat with ${buyerName}? This only clears the conversation — the order itself stays. This action cannot be undone.`)) {
          e.preventDefault()
        }
      }}
      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-2)' }}
    >
      🗑
    </button>
  )
}
