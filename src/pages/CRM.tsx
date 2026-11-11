import { AnimatePresence, motion } from 'motion/react'
import { CalendarDays, CheckCircle2, ClipboardList, FlaskConical, GripVertical, Mail, Phone, Plus, ShieldCheck, Trash2, Users } from 'lucide-react'
import { useState } from 'react'
import { AnimatedNumber, DemoBadge, Drawer, fadeUp, Field, Modal, PageHeader, StatTile, Tabs } from '../components/ui'
import { countryByCode } from '../data/countries'
import { PRODUCTS, productById } from '../data/products'
import type { Activity, ActivityType, Deal, DealStage } from '../data/types'
import { date, DEAL_STAGES, STAGE_COLOR, STAGE_PROBABILITY, uid, usd } from '../lib/format'
import { useStore } from '../store/useStore'

const ACT_ICON: Record<ActivityType, typeof Phone> = { call: Phone, email: Mail, meeting: Users, sample: FlaskConical, document: ClipboardList, audit: ShieldCheck }

export default function CRM() {
  const [tab, setTab] = useState<'pipeline' | 'activities'>('pipeline')
  const { deals } = useStore()
  const [newDeal, setNewDeal] = useState(false)

  const open = deals.filter((d) => !['Won', 'Lost'].includes(d.stage))
  const won = deals.filter((d) => d.stage === 'Won')
  const closed = deals.filter((d) => ['Won', 'Lost'].includes(d.stage))
  const weighted = open.reduce((s, d) => s + d.valueUsd * STAGE_PROBABILITY[d.stage], 0)

  return (
    <>
      <PageHeader
        eyebrow="Customer relationship management"
        title="CRM Pipeline"
        subtitle={
          <span className="inline-flex flex-wrap items-center gap-2">
            Track export enquiries from first lead to signed contract, and every call, sample and document along the way. <DemoBadge />
          </span>
        }
        actions={
          <>
            <Tabs
              id="crm"
              value={tab}
              onChange={setTab}
              tabs={[
                { id: 'pipeline', label: 'Pipeline' },
                { id: 'activities', label: 'Activities' },
              ]}
            />
            <button className="btn-primary" onClick={() => setNewDeal(true)}>
              <Plus className="h-4 w-4" /> New deal
            </button>
          </>
        }
      />
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Open pipeline" value={<AnimatedNumber value={open.reduce((s, d) => s + d.valueUsd, 0)} format={(n) => usd(n, true)} />} detail={`${open.length} deals`} />
        <StatTile label="Weighted forecast" accent="teal" value={<AnimatedNumber value={weighted} format={(n) => usd(n, true)} />} detail="Value × stage probability" />
        <StatTile label="Won this year" accent="orange" value={<AnimatedNumber value={won.reduce((s, d) => s + d.valueUsd, 0)} format={(n) => usd(n, true)} />} detail={`${won.length} deals`} />
        <StatTile label="Win rate" accent="navy" value={<AnimatedNumber value={closed.length ? (won.length / closed.length) * 100 : 0} suffix="%" />} detail={`${closed.length} closed deals`} />
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
          {tab === 'pipeline' ? <Pipeline /> : <Activities />}
        </motion.div>
      </AnimatePresence>
      <DealModal open={newDeal} onClose={() => setNewDeal(false)} />
    </>
  )
}

function Pipeline() {
  const { deals, buyers, moveDeal, toast } = useStore()
  const [dragId, setDragId] = useState<string | null>(null)
  const [over, setOver] = useState<DealStage | null>(null)
  const [openDeal, setOpenDeal] = useState<Deal | null>(null)

  return (
    <>
      <div className="scrollbar-thin -mx-4 overflow-x-auto px-4 pb-3 sm:mx-0 sm:px-0">
        <div className="flex min-w-max gap-3">
          {DEAL_STAGES.map((stage) => {
            const items = deals.filter((d) => d.stage === stage)
            const total = items.reduce((s, d) => s + d.valueUsd, 0)
            return (
              <div
                key={stage}
                onDragOver={(e) => {
                  e.preventDefault()
                  setOver(stage)
                }}
                onDragLeave={() => setOver((o) => (o === stage ? null : o))}
                onDrop={() => {
                  if (dragId) {
                    moveDeal(dragId, stage)
                    toast(`Deal moved to ${stage}`)
                  }
                  setDragId(null)
                  setOver(null)
                }}
                className={`flex w-72 flex-col rounded-2xl p-2 transition ${over === stage ? 'bg-md-sky-50 ring-2 ring-md-sky/40' : 'bg-slate-100/70'}`}
              >
                <div className="flex items-center justify-between px-2 py-2">
                  <span className={`chip ${STAGE_COLOR[stage]}`}>{stage}</span>
                  <span className="text-xs font-bold text-slate-500">
                    {items.length} · {usd(total, true)}
                  </span>
                </div>
                <div className="flex min-h-24 flex-col gap-2">
                  <AnimatePresence>
                    {items.map((d) => {
                      const b = buyers.find((x) => x.id === d.buyerId)
                      const c = countryByCode(d.country)
                      return (
                        <div
                          key={d.id}
                          draggable
                          onDragStart={() => setDragId(d.id)}
                          onDragEnd={() => {
                            setDragId(null)
                            setOver(null)
                          }}
                        >
                          <motion.div
                            layout
                            layoutId={d.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: dragId === d.id ? 0.5 : 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            whileHover={{ y: -2 }}
                            onClick={() => setOpenDeal(d)}
                            className="cursor-grab rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-200 active:cursor-grabbing"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="text-sm font-bold leading-snug text-md-navy-900">{d.title}</div>
                              <GripVertical className="h-4 w-4 shrink-0 text-slate-300" />
                            </div>
                            <div className="mt-1 truncate text-xs text-slate-500">
                              {c?.flag} {b?.name ?? 'Unknown buyer'}
                            </div>
                            <div className="mt-2 flex items-center justify-between">
                              <span className="text-sm font-extrabold tabular-nums text-slate-800">{usd(d.valueUsd, true)}</span>
                              <span className="flex items-center gap-1 text-[11px] text-slate-500">
                                <CalendarDays className="h-3 w-3" /> {date(d.expectedClose)}
                              </span>
                            </div>
                            <div className="mt-2 rounded-lg bg-slate-50 px-2 py-1 text-[11px] text-slate-600">→ {d.nextStep}</div>
                          </motion.div>
                        </div>
                      )
                    })}
                  </AnimatePresence>
                </div>
              </div>
            )
          })}
        </div>
      </div>
      <p className="mt-1 text-xs text-slate-400">Drag cards between stages, or open a card to change its stage.</p>
      <Drawer open={!!openDeal} onClose={() => setOpenDeal(null)} title={openDeal?.title}>
        {openDeal && <DealDetail id={openDeal.id} onClose={() => setOpenDeal(null)} />}
      </Drawer>
    </>
  )
}

function DealDetail({ id, onClose }: { id: string; onClose: () => void }) {
  const { deals, buyers, activities, moveDeal, removeDeal, toast } = useStore()
  const d = deals.find((x) => x.id === id)
  if (!d) return null
  const b = buyers.find((x) => x.id === d.buyerId)
  const c = countryByCode(d.country)
  const acts = activities.filter((a) => a.partnerId === d.buyerId)
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-1.5">
        {DEAL_STAGES.map((s) => (
          <button key={s} onClick={() => { moveDeal(d.id, s); toast(`Stage set to ${s}`) }} className={`chip px-2.5! py-1! ring-1 ${d.stage === s ? STAGE_COLOR[s] + ' ring-current' : 'bg-white text-slate-500 ring-slate-200'}`}>
            {s}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        {[
          ['Value', usd(d.valueUsd)],
          ['Probability', `${STAGE_PROBABILITY[d.stage] * 100}%`],
          ['Expected close', date(d.expectedClose)],
          ['Owner', d.owner],
          ['Buyer', b?.name ?? '—'],
          ['Market', `${c?.flag} ${c?.name}`],
        ].map(([k, v]) => (
          <div key={k} className="rounded-xl bg-slate-50 p-3">
            <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{k}</div>
            <div className="font-semibold text-slate-800">{v}</div>
          </div>
        ))}
      </div>
      <div>
        <div className="label">Products</div>
        <div className="flex flex-wrap gap-1.5">
          {d.productIds.map((p) => (
            <span key={p} className="chip bg-md-sky-50 text-md-sky-ink">
              {productById(p)?.name}
            </span>
          ))}
        </div>
      </div>
      <div className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900 ring-1 ring-amber-200">
        <b>Next step:</b> {d.nextStep}
      </div>
      <div>
        <div className="label">Activity with this buyer</div>
        <ul className="space-y-2">
          {acts.length === 0 && <li className="text-sm text-slate-400">No activities yet.</li>}
          {acts.map((a) => (
            <li key={a.id} className="rounded-xl bg-white p-3 text-sm ring-1 ring-slate-200">
              <div className="font-semibold text-slate-800">{a.subject}</div>
              <div className="text-xs text-slate-500">
                {date(a.date)} · {a.note}
              </div>
            </li>
          ))}
        </ul>
      </div>
      <button
        className="btn-ghost text-rose-600!"
        onClick={() => {
          removeDeal(d.id)
          toast('Deal deleted')
          onClose()
        }}
      >
        <Trash2 className="h-4 w-4" /> Delete deal
      </button>
    </div>
  )
}

function DealModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { buyers, upsertDeal, toast } = useStore()
  const [form, setForm] = useState({ title: '', buyerId: buyers[0]?.id ?? '', productId: PRODUCTS[0].id, valueUsd: 100000, stage: 'Lead' as DealStage, expectedClose: '2027-03-31', owner: 'Intl. Sales', nextStep: 'Intro call' })
  const set = (k: keyof typeof form, v: string | number) => setForm((f) => ({ ...f, [k]: v }))
  return (
    <Modal open={open} onClose={onClose} title="New export deal">
      <form
        className="grid gap-3 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault()
          const buyer = buyers.find((b) => b.id === form.buyerId)
          upsertDeal({
            id: uid('d'),
            title: form.title || `${productById(form.productId)?.name} – ${buyer?.name}`,
            buyerId: form.buyerId,
            country: buyer?.country ?? 'UAE',
            productIds: [form.productId],
            valueUsd: Number(form.valueUsd),
            stage: form.stage,
            owner: form.owner,
            expectedClose: form.expectedClose,
            createdAt: new Date().toISOString().slice(0, 10),
            nextStep: form.nextStep,
          })
          toast('Deal created')
          onClose()
        }}
      >
        <div className="sm:col-span-2">
          <Field label="Deal title">
            <input className="input" value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. Ghee annual contract 2027" />
          </Field>
        </div>
        <Field label="Buyer">
          <select className="input" value={form.buyerId} onChange={(e) => set('buyerId', e.target.value)}>
            {buyers.map((b) => (
              <option key={b.id} value={b.id}>
                {countryByCode(b.country)?.flag} {b.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Product">
          <select className="input" value={form.productId} onChange={(e) => set('productId', e.target.value)}>
            {PRODUCTS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Value (USD)">
          <input type="number" min={0} className="input" value={form.valueUsd} onChange={(e) => set('valueUsd', e.target.value)} />
        </Field>
        <Field label="Stage">
          <select className="input" value={form.stage} onChange={(e) => set('stage', e.target.value)}>
            {DEAL_STAGES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </Field>
        <Field label="Expected close">
          <input type="date" className="input" value={form.expectedClose} onChange={(e) => set('expectedClose', e.target.value)} />
        </Field>
        <Field label="Owner">
          <input className="input" value={form.owner} onChange={(e) => set('owner', e.target.value)} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Next step">
            <input className="input" value={form.nextStep} onChange={(e) => set('nextStep', e.target.value)} />
          </Field>
        </div>
        <div className="flex justify-end gap-2 sm:col-span-2">
          <button type="button" className="btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary">Create deal</button>
        </div>
      </form>
    </Modal>
  )
}

function Activities() {
  const { activities, buyers, suppliers, toggleActivity, addActivity, toast } = useStore()
  const [filter, setFilter] = useState<'open' | 'all'>('open')
  const [form, setForm] = useState({ type: 'call' as ActivityType, partnerId: buyers[0]?.id ?? '', subject: '', date: new Date().toISOString().slice(0, 10) })
  const partners = [...buyers.map((b) => ({ id: b.id, name: b.name, kind: 'buyer' as const })), ...suppliers.map((s) => ({ id: s.id, name: s.name, kind: 'supplier' as const }))]
  const list = [...activities].filter((a) => filter === 'all' || !a.done).sort((a, b) => a.date.localeCompare(b.date))

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
      <motion.div variants={fadeUp} className="card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-bold text-md-navy-900">Timeline</h3>
          <Tabs id="actf" value={filter} onChange={setFilter} tabs={[{ id: 'open', label: 'Open' }, { id: 'all', label: 'All' }]} />
        </div>
        <ol className="relative space-y-3 border-l-2 border-slate-100 pl-6">
          <AnimatePresence initial={false}>
            {list.map((a) => {
              const Icon = ACT_ICON[a.type]
              const p = partners.find((x) => x.id === a.partnerId)
              return (
                <motion.li key={a.id} layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, height: 0 }} className="relative">
                  <span className={`absolute -left-[37px] top-1 flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-white ${a.done ? 'bg-emerald-500 text-white' : 'bg-md-sky text-white'}`}>
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <div className={`rounded-xl p-3 ring-1 ${a.done ? 'bg-slate-50 ring-slate-100' : 'bg-white ring-slate-200'}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className={`font-semibold ${a.done ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{a.subject}</div>
                        <div className="text-xs text-slate-500">
                          {date(a.date)} · {p?.name} · {a.owner}
                        </div>
                        {a.note && <div className="mt-1 text-sm text-slate-600">{a.note}</div>}
                      </div>
                      <button onClick={() => toggleActivity(a.id)} className={`shrink-0 rounded-lg p-1.5 ${a.done ? 'text-emerald-600' : 'text-slate-300 hover:text-emerald-600'}`} aria-label="Toggle done">
                        <CheckCircle2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </motion.li>
              )
            })}
          </AnimatePresence>
        </ol>
      </motion.div>

      <motion.form
        variants={fadeUp}
        className="card h-fit space-y-3 p-5"
        onSubmit={(e) => {
          e.preventDefault()
          if (!form.subject) return
          const p = partners.find((x) => x.id === form.partnerId)
          const a: Activity = { id: uid('a'), type: form.type, partnerId: form.partnerId, partnerKind: p?.kind ?? 'buyer', subject: form.subject, note: '', date: form.date, owner: 'You', done: false }
          addActivity(a)
          setForm((f) => ({ ...f, subject: '' }))
          toast('Activity logged')
        }}
      >
        <h3 className="font-bold text-md-navy-900">Log activity</h3>
        <div className="grid grid-cols-3 gap-1.5">
          {(Object.keys(ACT_ICON) as ActivityType[]).map((t) => {
            const Icon = ACT_ICON[t]
            return (
              <button type="button" key={t} onClick={() => setForm((f) => ({ ...f, type: t }))} className={`flex flex-col items-center gap-1 rounded-xl py-2 text-[11px] font-semibold capitalize ring-1 transition ${form.type === t ? 'bg-md-sky text-white ring-md-sky' : 'bg-white text-slate-600 ring-slate-200'}`}>
                <Icon className="h-4 w-4" /> {t}
              </button>
            )
          })}
        </div>
        <Field label="Partner">
          <select className="input" value={form.partnerId} onChange={(e) => setForm((f) => ({ ...f, partnerId: e.target.value }))}>
            <optgroup label="Buyers">
              {partners.filter((p) => p.kind === 'buyer').map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </optgroup>
            <optgroup label="Suppliers">
              {partners.filter((p) => p.kind === 'supplier').map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </optgroup>
          </select>
        </Field>
        <Field label="Subject">
          <input className="input" value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} placeholder="e.g. Send revised price list" />
        </Field>
        <Field label="Due date">
          <input type="date" className="input" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
        </Field>
        <button className="btn-primary w-full">
          <Plus className="h-4 w-4" /> Add to timeline
        </button>
      </motion.form>
    </div>
  )
}
