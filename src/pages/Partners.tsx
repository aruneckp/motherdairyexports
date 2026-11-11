import { AnimatePresence, motion } from 'motion/react'
import { Building2, Download, Mail, MapPin, Pencil, Phone, Plus, Search, Trash2, Truck } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { DemoBadge, Drawer, fadeUp, Field, Modal, PageHeader, Progress, Stars, Tabs } from '../components/ui'
import { COUNTRIES, countryByCode } from '../data/countries'
import { PRODUCTS, productById } from '../data/products'
import type { Buyer, BuyerStatus, Supplier, SupplierStatus } from '../data/types'
import { BUYER_STATUS_COLOR, date, STAGE_COLOR, SUPPLIER_STATUS_COLOR, uid, usd } from '../lib/format'
import { useStore } from '../store/useStore'

type Tab = 'buyers' | 'suppliers'

function downloadCsv(name: string, rows: Record<string, unknown>[]) {
  if (!rows.length) return
  const keys = Object.keys(rows[0])
  const esc = (v: unknown) => `"${String(Array.isArray(v) ? v.join('; ') : v ?? '').replace(/"/g, '""')}"`
  const csv = [keys.join(','), ...rows.map((r) => keys.map((k) => esc(r[k])).join(','))].join('\n')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
  a.download = name
  a.click()
  URL.revokeObjectURL(a.href)
}

export default function Partners() {
  const [params, setParams] = useSearchParams()
  const tab = (params.get('tab') as Tab) ?? 'buyers'
  const { buyers, suppliers } = useStore()
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('all')
  const [openId, setOpenId] = useState<string | null>(null)
  const [editing, setEditing] = useState<Buyer | Supplier | 'new' | null>(null)

  const rows = useMemo(() => {
    const s = q.toLowerCase()
    if (tab === 'buyers')
      return buyers.filter(
        (b) =>
          (status === 'all' || b.status === status) &&
          (!s || [b.name, b.city, countryByCode(b.country)?.name ?? '', b.contactPerson, ...b.tags].some((x) => x.toLowerCase().includes(s))),
      )
    return suppliers.filter(
      (x) => (status === 'all' || x.status === status) && (!s || [x.name, x.state, x.type, ...x.supplies].some((y) => y.toLowerCase().includes(s))),
    )
  }, [tab, buyers, suppliers, q, status])

  const switchTab = (t: Tab) => {
    setParams({ tab: t })
    setStatus('all')
    setOpenId(null)
  }

  return (
    <>
      <PageHeader
        eyebrow="Partner management"
        title="Buyers & Suppliers"
        subtitle={
          <span className="inline-flex flex-wrap items-center gap-2">
            Overseas buyer accounts and the farmer, MPO, packaging and logistics partners behind every shipment. <DemoBadge />
          </span>
        }
        actions={
          <>
            <Tabs
              id="partners"
              value={tab}
              onChange={switchTab}
              tabs={[
                { id: 'buyers', label: `Buyers (${buyers.length})` },
                { id: 'suppliers', label: `Suppliers (${suppliers.length})` },
              ]}
            />
            <button className="btn-ghost" onClick={() => downloadCsv(`${tab}.csv`, rows as unknown as Record<string, unknown>[])}>
              <Download className="h-4 w-4" /> CSV
            </button>
            <button className="btn-primary" onClick={() => setEditing('new')}>
              <Plus className="h-4 w-4" /> Add {tab === 'buyers' ? 'buyer' : 'supplier'}
            </button>
          </>
        }
      />

      <motion.div variants={fadeUp} className="card mb-4 flex flex-wrap items-center gap-3 p-3">
        <div className="relative min-w-60 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input className="input pl-9" placeholder={tab === 'buyers' ? 'Search buyer, city, country, tag…' : 'Search supplier, state, material…'} value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <select className="input w-auto!" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status">
          <option value="all">All statuses</option>
          {Object.keys(tab === 'buyers' ? BUYER_STATUS_COLOR : SUPPLIER_STATUS_COLOR).map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </motion.div>

      <motion.div variants={fadeUp} className="card overflow-hidden">
        <div className="scrollbar-thin overflow-x-auto">
          {tab === 'buyers' ? (
            <table className="w-full min-w-[900px] text-sm">
              <thead className="bg-slate-50 text-left text-[11px] uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Buyer</th>
                  <th className="px-4 py-3">Market</th>
                  <th className="px-4 py-3">Segment</th>
                  <th className="px-4 py-3">Terms</th>
                  <th className="px-4 py-3 text-right">Annual value</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence initial={false}>
                  {(rows as Buyer[]).map((b) => {
                    const c = countryByCode(b.country)
                    return (
                      <motion.tr key={b.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpenId(b.id)} className="cursor-pointer border-t border-slate-100 hover:bg-sky-50/40">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-md-navy-900">{b.name}</div>
                          <div className="text-xs text-slate-500">{b.contactPerson}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {c?.flag} {b.city}
                        </td>
                        <td className="px-4 py-3 text-slate-600">{b.segment}</td>
                        <td className="px-4 py-3 text-xs text-slate-600">
                          {b.incoterm}
                          <br />
                          {b.paymentTerms}
                        </td>
                        <td className="px-4 py-3 text-right font-bold tabular-nums text-slate-800">{usd(b.annualValueUsd, true)}</td>
                        <td className="px-4 py-3">
                          <span className={`chip ${BUYER_STATUS_COLOR[b.status]}`}>{b.status}</span>
                        </td>
                      </motion.tr>
                    )
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          ) : (
            <table className="w-full min-w-[900px] text-sm">
              <thead className="bg-slate-50 text-left text-[11px] uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Supplier</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Supplies</th>
                  <th className="px-4 py-3">On-time</th>
                  <th className="px-4 py-3">Quality</th>
                  <th className="px-4 py-3">Rating</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence initial={false}>
                  {(rows as Supplier[]).map((s) => (
                    <motion.tr key={s.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpenId(s.id)} className="cursor-pointer border-t border-slate-100 hover:bg-sky-50/40">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-md-navy-900">{s.name}</div>
                        <div className="text-xs text-slate-500">{s.state}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{s.type}</td>
                      <td className="max-w-56 px-4 py-3 text-xs text-slate-600">{s.supplies.join(', ')}</td>
                      <td className="w-28 px-4 py-3">
                        <div className="mb-1 text-xs font-bold tabular-nums">{s.onTimePct}%</div>
                        <Progress value={s.onTimePct} color={s.onTimePct >= 92 ? 'bg-emerald-500' : 'bg-amber-500'} />
                      </td>
                      <td className="w-28 px-4 py-3">
                        <div className="mb-1 text-xs font-bold tabular-nums">{s.qualityPct}%</div>
                        <Progress value={s.qualityPct} color={s.qualityPct >= 92 ? 'bg-emerald-500' : 'bg-amber-500'} />
                      </td>
                      <td className="px-4 py-3">
                        <Stars value={s.rating} />
                      </td>
                      <td className="px-4 py-3">
                        <span className={`chip ${SUPPLIER_STATUS_COLOR[s.status]}`}>{s.status}</span>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          )}
        </div>
        {rows.length === 0 && <div className="p-10 text-center text-sm text-slate-500">No records match.</div>}
      </motion.div>

      <Drawer open={!!openId} onClose={() => setOpenId(null)} title={tab === 'buyers' ? 'Buyer account' : 'Supplier record'}>
        {openId && tab === 'buyers' && <BuyerDetail id={openId} onEdit={(b) => setEditing(b)} onDeleted={() => setOpenId(null)} />}
        {openId && tab === 'suppliers' && <SupplierDetail id={openId} onEdit={(s) => setEditing(s)} onDeleted={() => setOpenId(null)} />}
      </Drawer>

      {tab === 'buyers' ? (
        <BuyerForm key={editing === 'new' ? 'new' : (editing as Buyer | null)?.id} open={!!editing} initial={editing === 'new' ? null : (editing as Buyer | null)} onClose={() => setEditing(null)} />
      ) : (
        <SupplierForm key={editing === 'new' ? 'new' : (editing as Supplier | null)?.id} open={!!editing} initial={editing === 'new' ? null : (editing as Supplier | null)} onClose={() => setEditing(null)} />
      )}
    </>
  )
}

function ContactRow({ email, phone }: { email: string; phone: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      <a href={`mailto:${email}`} className="btn-ghost py-1.5! text-xs!">
        <Mail className="h-3.5 w-3.5" /> {email}
      </a>
      <a href={`tel:${phone.replace(/\s/g, '')}`} className="btn-ghost py-1.5! text-xs!">
        <Phone className="h-3.5 w-3.5" /> {phone}
      </a>
    </div>
  )
}

function BuyerDetail({ id, onEdit, onDeleted }: { id: string; onEdit: (b: Buyer) => void; onDeleted: () => void }) {
  const { buyers, deals, shipments, activities, removeBuyer, toast } = useStore()
  const b = buyers.find((x) => x.id === id)
  if (!b) return null
  const c = countryByCode(b.country)
  const bDeals = deals.filter((d) => d.buyerId === b.id)
  const bShip = shipments.filter((s) => s.buyerId === b.id)
  const bActs = activities.filter((a) => a.partnerId === b.id)
  const used = bDeals.filter((d) => d.stage === 'Contract' || d.stage === 'Won').reduce((s, d) => s + d.valueUsd, 0)
  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3">
        <div className="text-4xl">{c?.flag}</div>
        <div className="min-w-0">
          <h3 className="text-lg font-extrabold text-md-navy-900">{b.name}</h3>
          <div className="flex items-center gap-1 text-sm text-slate-500">
            <MapPin className="h-3.5 w-3.5" /> {b.city}, {c?.name}
          </div>
          <div className="mt-1 flex flex-wrap gap-1">
            <span className={`chip ${BUYER_STATUS_COLOR[b.status]}`}>{b.status}</span>
            {b.tags.map((t) => (
              <span key={t} className="chip bg-slate-100 text-slate-600">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div>
        <div className="label">{b.contactPerson}</div>
        <ContactRow email={b.email} phone={b.phone} />
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        {[
          ['Segment', b.segment],
          ['Customer since', date(b.since)],
          ['Incoterm', b.incoterm],
          ['Payment', b.paymentTerms],
          ['MOQ', b.moq],
          ['Rating', `★ ${b.rating.toFixed(1)}`],
        ].map(([k, v]) => (
          <div key={k} className="rounded-xl bg-slate-50 p-3">
            <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{k}</div>
            <div className="font-semibold text-slate-800">{v}</div>
          </div>
        ))}
      </div>
      <div className="rounded-xl p-3 ring-1 ring-slate-200">
        <div className="mb-1 flex justify-between text-xs font-semibold text-slate-600">
          <span>Credit exposure (contracted)</span>
          <span>
            {usd(used, true)} / {usd(b.creditLimitUsd, true)}
          </span>
        </div>
        <Progress value={b.creditLimitUsd ? (used / b.creditLimitUsd) * 100 : 0} color={used > b.creditLimitUsd ? 'bg-rose-500' : 'bg-md-sky'} />
        {used > b.creditLimitUsd && <div className="mt-1 text-xs font-semibold text-rose-600">Over credit limit — secure LC or raise limit before shipping.</div>}
      </div>
      <div>
        <div className="label">Products bought</div>
        <div className="flex flex-wrap gap-1.5">
          {b.products.map((p) => (
            <span key={p} className="chip bg-md-sky-50 text-md-sky-ink">
              {productById(p)?.name ?? p}
            </span>
          ))}
        </div>
      </div>
      <div>
        <div className="label">Deals ({bDeals.length})</div>
        <ul className="space-y-1.5">
          {bDeals.map((d) => (
            <li key={d.id} className="flex items-center justify-between gap-2 rounded-lg bg-white px-3 py-2 text-sm ring-1 ring-slate-200">
              <span className="truncate font-semibold text-slate-700">{d.title}</span>
              <span className={`chip shrink-0 ${STAGE_COLOR[d.stage]}`}>{d.stage}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="grid grid-cols-2 gap-2 text-center">
        <div className="rounded-xl bg-slate-50 p-3">
          <div className="text-xl font-extrabold text-md-navy-900">{bShip.length}</div>
          <div className="text-xs text-slate-500">Shipments</div>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <div className="text-xl font-extrabold text-md-navy-900">{bActs.length}</div>
          <div className="text-xs text-slate-500">Activities</div>
        </div>
      </div>
      <div className="flex gap-2">
        <button className="btn-primary flex-1" onClick={() => onEdit(b)}>
          <Pencil className="h-4 w-4" /> Edit
        </button>
        <button
          className="btn-ghost text-rose-600!"
          onClick={() => {
            if (!confirm(`Delete ${b.name}?`)) return
            removeBuyer(b.id)
            toast('Buyer deleted')
            onDeleted()
          }}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

function SupplierDetail({ id, onEdit, onDeleted }: { id: string; onEdit: (s: Supplier) => void; onDeleted: () => void }) {
  const { suppliers, activities, removeSupplier, toast } = useStore()
  const s = suppliers.find((x) => x.id === id)
  if (!s) return null
  const acts = activities.filter((a) => a.partnerId === s.id)
  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-lime-50 p-3 text-lime-700">{s.type.includes('Logistics') ? <Truck className="h-6 w-6" /> : <Building2 className="h-6 w-6" />}</div>
        <div>
          <h3 className="text-lg font-extrabold text-md-navy-900">{s.name}</h3>
          <div className="text-sm text-slate-500">
            {s.type} · {s.state}
          </div>
          <span className={`chip mt-1 ${SUPPLIER_STATUS_COLOR[s.status]}`}>{s.status}</span>
        </div>
      </div>
      <div>
        <div className="label">{s.contactPerson}</div>
        <ContactRow email={s.email} phone={s.phone} />
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          ['On-time', `${s.onTimePct}%`],
          ['Quality', `${s.qualityPct}%`],
          ['Lead time', `${s.leadTimeDays} d`],
        ].map(([k, v]) => (
          <div key={k} className="rounded-xl bg-slate-50 p-3">
            <div className="text-xl font-extrabold text-md-navy-900">{v}</div>
            <div className="text-xs text-slate-500">{k}</div>
          </div>
        ))}
      </div>
      <div>
        <div className="label">Supplies</div>
        <div className="text-sm text-slate-700">{s.supplies.join(' · ')}</div>
      </div>
      <div>
        <div className="label">Certifications</div>
        <div className="flex flex-wrap gap-1.5">
          {s.certifications.map((c) => (
            <span key={c} className="chip bg-emerald-50 text-emerald-700">
              {c}
            </span>
          ))}
        </div>
      </div>
      <div className="rounded-xl bg-slate-50 p-3 text-sm">
        Last audit: <b>{date(s.lastAudit)}</b>
        {new Date(s.lastAudit) < new Date(Date.now() - 365 * 864e5) && <span className="ml-2 chip bg-rose-50 text-rose-700">Overdue</span>}
      </div>
      {acts.length > 0 && (
        <div>
          <div className="label">Activities</div>
          <ul className="space-y-1.5 text-sm">
            {acts.map((a) => (
              <li key={a.id} className="rounded-lg bg-white px-3 py-2 ring-1 ring-slate-200">
                {a.subject} <span className="text-xs text-slate-500">· {date(a.date)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="flex gap-2">
        <button className="btn-primary flex-1" onClick={() => onEdit(s)}>
          <Pencil className="h-4 w-4" /> Edit
        </button>
        <button
          className="btn-ghost text-rose-600!"
          onClick={() => {
            if (!confirm(`Delete ${s.name}?`)) return
            removeSupplier(s.id)
            toast('Supplier deleted')
            onDeleted()
          }}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

const BUYER_SEGMENTS: Buyer['segment'][] = ['Retail Chain', 'Importer / Distributor', 'Food Service', 'Industrial / Beverage', 'Ethnic Grocery']
const SUPPLIER_TYPES: Supplier['type'][] = ['Milk Pool / MPO', 'Fruit & Vegetable Cluster', 'Oilseeds', 'Spices', 'Packaging', 'Logistics / Cold Chain']

function BuyerForm({ open, initial, onClose }: { open: boolean; initial: Buyer | null; onClose: () => void }) {
  const { upsertBuyer, toast } = useStore()
  const [f, setF] = useState<Buyer>(
    initial ?? {
      id: uid('b'),
      name: '',
      country: 'UAE',
      city: '',
      segment: 'Importer / Distributor',
      products: [],
      incoterm: 'FOB Nhava Sheva',
      paymentTerms: 'LC at sight',
      moq: '1 × 20ft',
      status: 'Prospect',
      contactPerson: '',
      email: '',
      phone: '',
      annualValueUsd: 0,
      creditLimitUsd: 50000,
      rating: 4,
      since: new Date().toISOString().slice(0, 10),
      tags: [],
    },
  )
  const set = <K extends keyof Buyer>(k: K, v: Buyer[K]) => setF((x) => ({ ...x, [k]: v }))
  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Edit buyer' : 'Add buyer'}>
      <form
        className="grid gap-3 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault()
          if (!f.name.trim()) return
          upsertBuyer(f)
          toast(initial ? 'Buyer updated' : 'Buyer added')
          onClose()
        }}
      >
        <div className="sm:col-span-2">
          <Field label="Company name *">
            <input required className="input" value={f.name} onChange={(e) => set('name', e.target.value)} />
          </Field>
        </div>
        <Field label="Country">
          <select className="input" value={f.country} onChange={(e) => set('country', e.target.value)}>
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.flag} {c.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="City">
          <input className="input" value={f.city} onChange={(e) => set('city', e.target.value)} />
        </Field>
        <Field label="Segment">
          <select className="input" value={f.segment} onChange={(e) => set('segment', e.target.value as Buyer['segment'])}>
            {BUYER_SEGMENTS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </Field>
        <Field label="Status">
          <select className="input" value={f.status} onChange={(e) => set('status', e.target.value as BuyerStatus)}>
            {Object.keys(BUYER_STATUS_COLOR).map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </Field>
        <Field label="Contact person">
          <input className="input" value={f.contactPerson} onChange={(e) => set('contactPerson', e.target.value)} />
        </Field>
        <Field label="Email">
          <input type="email" className="input" value={f.email} onChange={(e) => set('email', e.target.value)} />
        </Field>
        <Field label="Phone">
          <input className="input" value={f.phone} onChange={(e) => set('phone', e.target.value)} />
        </Field>
        <Field label="Incoterm">
          <input className="input" value={f.incoterm} onChange={(e) => set('incoterm', e.target.value)} />
        </Field>
        <Field label="Payment terms">
          <input className="input" value={f.paymentTerms} onChange={(e) => set('paymentTerms', e.target.value)} />
        </Field>
        <Field label="MOQ">
          <input className="input" value={f.moq} onChange={(e) => set('moq', e.target.value)} />
        </Field>
        <Field label="Annual value (USD)">
          <input type="number" min={0} className="input" value={f.annualValueUsd} onChange={(e) => set('annualValueUsd', Number(e.target.value))} />
        </Field>
        <Field label="Credit limit (USD)">
          <input type="number" min={0} className="input" value={f.creditLimitUsd} onChange={(e) => set('creditLimitUsd', Number(e.target.value))} />
        </Field>
        <div className="sm:col-span-2">
          <span className="label">Products</span>
          <div className="flex flex-wrap gap-1.5">
            {PRODUCTS.map((p) => {
              const on = f.products.includes(p.id)
              return (
                <button type="button" key={p.id} onClick={() => set('products', on ? f.products.filter((x) => x !== p.id) : [...f.products, p.id])} className={`chip px-2.5! py-1! ring-1 ${on ? 'bg-md-sky text-white ring-md-sky' : 'bg-white text-slate-600 ring-slate-200'}`}>
                  {p.name}
                </button>
              )
            })}
          </div>
        </div>
        <div className="sm:col-span-2">
          <Field label="Tags (comma separated)">
            <input className="input" value={f.tags.join(', ')} onChange={(e) => set('tags', e.target.value.split(',').map((t) => t.trim()).filter(Boolean))} />
          </Field>
        </div>
        <div className="flex justify-end gap-2 sm:col-span-2">
          <button type="button" className="btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary">{initial ? 'Save changes' : 'Add buyer'}</button>
        </div>
      </form>
    </Modal>
  )
}

function SupplierForm({ open, initial, onClose }: { open: boolean; initial: Supplier | null; onClose: () => void }) {
  const { upsertSupplier, toast } = useStore()
  const [f, setF] = useState<Supplier>(
    initial ?? {
      id: uid('s'),
      name: '',
      state: '',
      coords: [78.96, 22.0],
      type: 'Fruit & Vegetable Cluster',
      supplies: [],
      certifications: ['FSSAI'],
      contactPerson: '',
      email: '',
      phone: '',
      leadTimeDays: 5,
      rating: 4,
      onTimePct: 90,
      qualityPct: 90,
      status: 'Onboarding',
      lastAudit: new Date().toISOString().slice(0, 10),
    },
  )
  const set = <K extends keyof Supplier>(k: K, v: Supplier[K]) => setF((x) => ({ ...x, [k]: v }))
  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Edit supplier' : 'Add supplier'}>
      <form
        className="grid gap-3 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault()
          if (!f.name.trim()) return
          upsertSupplier(f)
          toast(initial ? 'Supplier updated' : 'Supplier added')
          onClose()
        }}
      >
        <div className="sm:col-span-2">
          <Field label="Supplier name *">
            <input required className="input" value={f.name} onChange={(e) => set('name', e.target.value)} />
          </Field>
        </div>
        <Field label="State">
          <input className="input" value={f.state} onChange={(e) => set('state', e.target.value)} />
        </Field>
        <Field label="Type">
          <select className="input" value={f.type} onChange={(e) => set('type', e.target.value as Supplier['type'])}>
            {SUPPLIER_TYPES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </Field>
        <Field label="Longitude">
          <input type="number" step="0.01" className="input" value={f.coords[0]} onChange={(e) => set('coords', [Number(e.target.value), f.coords[1]])} />
        </Field>
        <Field label="Latitude">
          <input type="number" step="0.01" className="input" value={f.coords[1]} onChange={(e) => set('coords', [f.coords[0], Number(e.target.value)])} />
        </Field>
        <Field label="Contact person">
          <input className="input" value={f.contactPerson} onChange={(e) => set('contactPerson', e.target.value)} />
        </Field>
        <Field label="Email">
          <input type="email" className="input" value={f.email} onChange={(e) => set('email', e.target.value)} />
        </Field>
        <Field label="Phone">
          <input className="input" value={f.phone} onChange={(e) => set('phone', e.target.value)} />
        </Field>
        <Field label="Status">
          <select className="input" value={f.status} onChange={(e) => set('status', e.target.value as SupplierStatus)}>
            {Object.keys(SUPPLIER_STATUS_COLOR).map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </Field>
        <Field label="Lead time (days)">
          <input type="number" min={0} className="input" value={f.leadTimeDays} onChange={(e) => set('leadTimeDays', Number(e.target.value))} />
        </Field>
        <Field label="Last audit">
          <input type="date" className="input" value={f.lastAudit} onChange={(e) => set('lastAudit', e.target.value)} />
        </Field>
        <Field label="On-time %">
          <input type="number" min={0} max={100} className="input" value={f.onTimePct} onChange={(e) => set('onTimePct', Number(e.target.value))} />
        </Field>
        <Field label="Quality %">
          <input type="number" min={0} max={100} className="input" value={f.qualityPct} onChange={(e) => set('qualityPct', Number(e.target.value))} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Supplies (comma separated)">
            <input className="input" value={f.supplies.join(', ')} onChange={(e) => set('supplies', e.target.value.split(',').map((t) => t.trim()).filter(Boolean))} />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Certifications (comma separated)">
            <input className="input" value={f.certifications.join(', ')} onChange={(e) => set('certifications', e.target.value.split(',').map((t) => t.trim()).filter(Boolean))} />
          </Field>
        </div>
        <div className="flex justify-end gap-2 sm:col-span-2">
          <button type="button" className="btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary">{initial ? 'Save changes' : 'Add supplier'}</button>
        </div>
      </form>
    </Modal>
  )
}
