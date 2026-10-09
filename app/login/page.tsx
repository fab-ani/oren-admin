'use client'

import { useActionState } from 'react'
import { login } from './actions'

export default function LoginPage() {
  const [error, formAction, pending] = useActionState(login, null)

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <form
        action={formAction}
        style={{
          width: 340,
          background: 'var(--card)',
          padding: 32,
          borderRadius: 16,
          border: '1px solid var(--border)',
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            background: 'var(--accent)',
            borderRadius: 8,
            marginBottom: 16,
          }}
        />
        <h1 style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>Oren Admin</h1>
        <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 20 }}>
          Enter the password to continue.
        </p>
        <input
          type="password"
          name="password"
          placeholder="Password"
          required
          autoFocus
          style={{ width: '100%', marginBottom: 12, boxSizing: 'border-box' }}
        />
        {error && (
          <p style={{ fontSize: 13, color: '#c0392b', marginBottom: 12 }}>{error}</p>
        )}
        <button
          type="submit"
          disabled={pending}
          style={{
            width: '100%',
            background: 'var(--accent)',
            color: '#fff',
            border: 'none',
            padding: '10px 0',
            borderRadius: 10,
            fontWeight: 600,
            fontSize: 14,
            cursor: pending ? 'default' : 'pointer',
            opacity: pending ? 0.7 : 1,
          }}
        >
          {pending ? 'Signing in…' : 'Sign In'}
        </button>
      </form>
    </main>
  )
}
