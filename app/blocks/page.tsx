import { listShops, type Shop } from '@/lib/api'
import Link from 'next/link'
import { changeBlock } from './actions'
export const dynamic = 'force-dynamic'
type Block = {id:number;phone:string|null;installation_id:string|null;seller_id:number|null;reason:string;active:boolean;created_at:string}
export default async function BlocksPage({searchParams}:{searchParams:Promise<{error?:string}>}) {
  const params = await searchParams
  let shops:Shop[] = []
  let identities:{phone:string;installation_id:string;last_seen:string}[] = []
  let blocks:Block[] = []; let error = params.error || ''
  try {
    if (!process.env.FLASK_API_URL || !process.env.FLASK_ADMIN_TOKEN) throw new Error()
    const response = await fetch(`${process.env.FLASK_API_URL}/api/admin/service-blocks`, {headers:{'X-Admin-Token':process.env.FLASK_ADMIN_TOKEN},cache:'no-store'})
    const data = await response.json(); if (!response.ok || !data.ok) throw new Error()
    blocks=data.blocks
    shops=await listShops()
    const identityResponse = await fetch(`${process.env.FLASK_API_URL}/api/admin/service-identities`, {headers:{'X-Admin-Token':process.env.FLASK_ADMIN_TOKEN},cache:'no-store'})
    const identityData = await identityResponse.json()
    if (identityResponse.ok && identityData.ok) identities=identityData.identities
  } catch { error=error || 'Could not load restrictions. Reload to retry.' }
  return <main className="max-w-5xl mx-auto p-6 space-y-5">
    <Link href="/" className="text-orange-700">← Dashboard</Link>
    <h1 className="text-2xl font-bold">Service restrictions</h1>
    <p>Customers can browse. Restricted actions show a contact message. Blocking an owner account hides all linked shops and products.</p>
    {error && <p role="alert" className="text-red-700">{error}</p>}
    <form action={changeBlock} className="bg-white rounded-2xl border p-5 grid gap-3">
      <h2 className="font-semibold">Add restriction</h2>
      <label>Phone number<input className="border rounded p-2 w-full" name="phone" placeholder="07XXXXXXXX" /></label>
      <label>Installation ID (optional)<input className="border rounded p-2 w-full" name="installation_id" maxLength={64} /></label>
      <label>Shop owner (optional)<select className="border rounded p-2 w-full" name="seller_id" defaultValue="">
        <option value="">Choose an owner to hide all their shops</option>
        {shops.filter(shop=>shop.seller_id!==null).map(shop=><option key={shop.shop_id} value={shop.seller_id!}>{shop.name} — {shop.phone} (owner {shop.seller_id})</option>)}
      </select></label>
      <label>Internal reason<textarea className="border rounded p-2 w-full" name="reason" required maxLength={2000} /></label>
      <p className="text-sm text-gray-600">Provide at least one identity. Phone numbers are currently self-reported; an installation ID may change after reinstalling.</p>
      <button className="bg-orange-700 text-white rounded p-2">Add restriction</button>
    </form>
    <a href="/blocks" className="text-orange-700">Reload restrictions</a>
    <h2 className="font-semibold">Recent customer identities</h2>
    <p className="text-sm">Associations are self-reported. Confirm the request before restricting a shared phone or device. Older app versions do not supply device identifiers.</p>
    {identities.map(item=><form key={item.phone+item.installation_id} action={changeBlock} className="bg-white border rounded p-3 space-y-2">
      <p>{item.phone}</p><p className="text-xs break-all">Device/installation: {item.installation_id}</p>
      <input type="hidden" name="phone" value={item.phone}/><input type="hidden" name="installation_id" value={item.installation_id}/>
      <input className="border p-2 rounded" name="reason" placeholder="Reason for restriction" required maxLength={2000}/>
      <button className="border p-2 rounded">Block this phone and device</button>
    </form>)}
    {blocks.map(block=><article key={block.id} className="bg-white border rounded-2xl p-4 space-y-2">
      <p className="font-semibold">{block.active?'Restricted':'Unblocked'} · {block.phone || `Owner ${block.seller_id ?? '—'}`}</p>
      {block.installation_id && <p className="break-all text-sm">Installation: {block.installation_id}</p>}
      {block.seller_id && <p>Owner account: {block.seller_id}</p>}
      <p>{block.reason}</p><p className="text-sm">Created: {block.created_at}</p>
      <form action={changeBlock}><input type="hidden" name="id" value={block.id}/><input type="hidden" name="active" value={String(!block.active)}/>
        <button className="border rounded px-3 py-2">{block.active?'Unblock':'Block again'}</button>
      </form>
    </article>)}
    {!error && blocks.length===0 && <p>No restrictions added.</p>}
  </main>
}
