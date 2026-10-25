'use client'

import { useCallback, useEffect, useState } from 'react'
import type { ProductRequest } from '@/lib/api'
import { loadProductRequestsAction, setProductRequestStatusAction } from './actions'

export function ProductRequestsPanel() {
  const [items, setItems] = useState<ProductRequest[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [pending, setPending] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [status, setStatus] = useState('all')
  const reload = useCallback(async () => {
    setLoading(true)
    try {
      const result = await loadProductRequestsAction()
      if (result.error) setError(result.error)
      else { setItems(result.requests ?? []); setError(null) }
    } catch { setError('Could not load product requests. Please retry.') }
    finally { setLoading(false) }
  }, [])
  useEffect(() => {
    void reload()
    const timer = setInterval(() => void reload(), 4 * 60 * 60 * 1000)
    return () => clearInterval(timer)
  }, [reload])
  const categories = Array.from(new Set(items.map(i => i.category_label))).sort()
  const filtered = items.filter(i => (category === 'all' || i.category_label === category)
    && (status === 'all' || i.status === status)
    && `${i.name} ${i.phone} ${i.details} ${i.category_label}`.toLowerCase().includes(search.toLowerCase()))
  return <section className="space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><h1 className="text-2xl font-bold">Product Requests / Maombi ya Bidhaa</h1>
        <p className="text-sm text-gray-600">{items.length} requests · {items.filter(i => i.status === 'new').length} new. “Others” requests go only to Oren.</p></div>
      <button className="rounded-lg border px-4 py-2 disabled:opacity-50" disabled={loading || pending !== null} onClick={() => void reload()}>{loading ? 'Loading…' : 'Reload'}</button>
    </div>
    {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-red-700">{error} Previously loaded data may be outdated.</p>}
    <div className="flex flex-wrap gap-3">
      <input className="min-w-48 flex-1 rounded-lg border p-2" aria-label="Search requests" placeholder="Search name, phone or requested product…" value={search} onChange={e => setSearch(e.target.value)} />
      <select className="rounded-lg border p-2" aria-label="Category" value={category} onChange={e => setCategory(e.target.value)}><option value="all">All categories</option>{categories.map(c => <option key={c}>{c}</option>)}</select>
      <select className="rounded-lg border p-2" aria-label="Status" value={status} onChange={e => setStatus(e.target.value)}><option value="all">All statuses</option>{['new', 'in_progress', 'fulfilled', 'closed'].map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}</select>
    </div>
    {!loading && !error && filtered.length === 0 && <p>No matching product requests.</p>}
    <div className="grid gap-4 xl:grid-cols-2">{filtered.map(item => {
      const digits = item.phone.replace(/\D/g, '')
      const wa = digits.startsWith('0') ? `255${digits.slice(1)}` : digits
      return <article key={item.id} className="space-y-3 rounded-xl border bg-white p-5">
        <div className="flex justify-between gap-3"><strong>#{item.id} · {item.category_label}</strong><span className="text-sm text-gray-500">{new Date(item.created_at).toLocaleString()}</span></div>
        <p className="whitespace-pre-wrap break-words">{item.details}</p>
        {item.photo_url && <a href={item.photo_url} target="_blank" rel="noreferrer"><img src={item.photo_url} alt="Customer product reference" className="max-h-64 max-w-full rounded-lg object-contain" /></a>}
        <p>{item.name} · <a className="underline" href={`tel:${item.phone}`}>{item.phone}</a></p>
        <p className="text-sm text-gray-600">Matched shops: {item.matched_shops}{item.matched_shops === 0 ? ' · Needs Oren follow-up' : ''}</p>
        <div className="flex flex-wrap items-center gap-3">
          <a className="rounded-lg border px-3 py-2" target="_blank" rel="noreferrer" href={`https://wa.me/${wa}?text=${encodeURIComponent(`Habari ${item.name}, tunakujibu kuhusu ombi lako la bidhaa #${item.id} kwenye Oren.`)}`}>WhatsApp reply</a>
          <select aria-label={`Status for request ${item.id}`} className="rounded-lg border p-2" value={item.status} disabled={pending !== null || loading} onChange={async e => {
            const next = e.target.value as ProductRequest['status']; setPending(item.id)
            try {
              const result = await setProductRequestStatusAction(item.id, next)
              if (result.error) setError(result.error)
              else { setItems(current => current.map(i => i.id === item.id ? { ...i, status: next } : i)); setError(null) }
            } catch { setError('Could not update request status. Please retry.') }
            finally { setPending(null) }
          }}>{['new', 'in_progress', 'fulfilled', 'closed'].map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}</select>
        </div>
      </article>
    })}</div>
  </section>
}
