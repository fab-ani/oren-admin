'use client'

import { useState } from 'react'

export function CopyTokenButton({ token }: { token: string }) {
  const [copied, setCopied] = useState(false)

  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(token)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      }}
      title="Copy token"
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: 12,
        color: copied ? 'var(--success)' : 'var(--accent)',
        padding: 0,
      }}
    >
      {copied ? '✓' : '⧉'}
    </button>
  )
}
