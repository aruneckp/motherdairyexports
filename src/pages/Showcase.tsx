import { AnimatePresence, motion } from 'motion/react'
import { Anchor, BadgeCheck, CalendarRange, Clock, Minus, Plus, Presentation, Search, Send, ShoppingBasket, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import LoadPlan from '../components/LoadPlan'
import { Drawer, fadeUp, Field } from '../components/ui'
import { COMPANY } from '../data/company'
import { COUNTRIES, countryByCode, ruleFor } from '../data/countries'
import { CATEGORIES, PRODUCTS } from '../data/products'
import type { Brand, CategoryId, Product } from '../data/types'
import { RULE_STYLE, uid, usd } from '../lib/format'
import { seasonLabel } from '../lib/opportunity'
import { defaultQty, planBasket, unitLabel, unitPlural } from '../lib/pricing'
import { useStore } from '../store/useStore'

const BRAND_TILE: Record<Brand, string> = {
  'Mother Dairy': 'from-sky-100 via-sky-50 to-white',
  Safal: 'from-emerald-100 via-emerald-50 to-white',
  Dhara: 'from-amber-100 via-amber-50 to-white',
}

export default function Showcase() {
  const { basket, basketCountry, setBasketTarget, basketBuyerId, addToBasket } = useStore()
  const navigate = useNavigate()
  const country = countryByCode(basketCountry) ?? COUNTRIES[0]
  const [brand, setBrand] = useState<Brand | 'all'>('all')
  const [category, setCategory] = useState<CategoryId | 'all'>('all')
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)

  const available = PRODUCTS.filter((p) => ruleFor(country, p.category).level !== 'restricted')
  const unavailable = PRODUCTS.length - available.length
  const list = available.filter(
    (p) =>
      (brand === 'all' || p.brand === brand) &&
      (category === 'all' || p.category === category) &&
      (!q || (p.name + p.description + p.hsCode).toLowerCase().includes(q.toLowerCase())),
  )
  const plan = useMemo(() => planBasket(basket, country), [basket, country])
  const zeroDuty = available.filter((p) => (country.duty[p.category] ?? 1) === 0).length

  return (
    <>
      {/* Client-facing hero */}
      <motion.section variants={fadeUp} className="relative mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-md-teal via-md-sky to-md-navy p-6 text-white shadow-xl sm:p-8">
        <div className="absolute -right-10 -top-16 text-[180px] opacity-15 select-none" aria-hidden>
          🥭
        </div>
        <div className="relative max-w-2xl">
          <div className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-white/80">Buyer Showcase</div>
          <h1 className="text-3xl font-black leading-tight sm:text-4xl">Explore India's goodness, ready to ship.</h1>
          <p className="mt-2 text-sm text-white/85">
            {PRODUCTS.length} products across Mother Dairy, Safal and Dhara. Pick your market, build a mixed container and request a quote in minutes.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 rounded-2xl bg-white/15 px-3 py-2 ring-1 ring-white/30 backdrop-blur">
              <span className="text-xs font-bold uppercase tracking-wide text-white/80">Shipping to</span>
              <select value={country.code} onChange={(e) => setBasketTarget(e.target.value, basketBuyerId)} className="rounded-lg bg-white px-2 py-1 text-sm font-bold text-md-navy-900 outline-none">
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
        <div className="relative mt-6 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
          {[
            { icon: BadgeCheck, label: 'Available here', value: `${available.length} products` },
            { icon: Anchor, label: 'Discharge port', value: country.port },
            { icon: Clock, label: 'Sea transit', value: `~${country.transitDays} days` },
            { icon: CalendarRange, label: country.tradeAgreement ? 'Trade agreement' : 'Zero-duty lines', value: country.tradeAgreement ?? `${zeroDuty} products` },
          ].map((x) => (
            <div key={x.label} className="rounded-2xl bg-white/12 p-3 ring-1 ring-white/20 backdrop-blur">
              <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-white/70">
                <x.icon className="h-3.5 w-3.5" /> {x.label}
              </div>
              <div className="mt-0.5 font-bold">{x.value}</div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Filters */}
      <motion.div variants={fadeUp} className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative min-w-56 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} className="input pl-9" placeholder="Search the range" />
        </div>
        {(['all', 'Mother Dairy', 'Safal', 'Dhara'] as const).map((b) => (
          <button key={b} onClick={() => setBrand(b)} className={`relative rounded-full px-3.5 py-2 text-sm font-semibold ${brand === b ? 'text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200'}`}>
            {brand === b && <motion.span layoutId="brand-pill" className="absolute inset-0 rounded-full bg-md-navy" />}
            <span className="relative">{b === 'all' ? 'All brands' : b}</span>
          </button>
        ))}
      </motion.div>
      <motion.div variants={fadeUp} className="scrollbar-thin mb-5 flex gap-1.5 overflow-x-auto pb-1">
        {CATEGORIES.map((c) => (
          <button key={c.id} onClick={() => setCategory(c.id)} className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition ${category === c.id ? 'bg-md-sky text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
            {c.name}
          </button>
        ))}
      </motion.div>

      <motion.div layout className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        <AnimatePresence mode="popLayout">
          {list.map((p) => (
            <ShowcaseCard key={p.id} p={p} countryCode={country.code} inBasket={basket.find((b) => b.productId === p.id)?.qty ?? 0} onAdd={(qty) => addToBasket(p.id, qty)} />
          ))}
        </AnimatePresence>
      </motion.div>
      {unavailable > 0 && (
        <p className="mt-4 text-center text-xs text-slate-400">
          {unavailable} products are not offered to {country.name} because of import restrictions.
        </p>
      )}
      <div className="h-24" />

      {/* Sticky basket bar */}
      <AnimatePresence>
        {basket.length > 0 && (
          <motion.div initial={{ y: 120 }} animate={{ y: 0 }} exit={{ y: 120 }} transition={{ type: 'spring', stiffness: 260, damping: 28 }} className="fixed inset-x-0 bottom-0 z-30 px-4 pb-4 lg:pl-76">
            <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-4 rounded-2xl bg-md-navy-900 p-3 pl-4 text-white shadow-2xl">
              <div className="flex items-center gap-2">
                <ShoppingBasket className="h-5 w-5 text-md-teal" />
                <span className="font-bold">{basket.length} products</span>
              </div>
              <div className="min-w-40 flex-1">
                <div className="flex justify-between text-[11px] text-sky-100">
                  <span>{plan.tier.label}{plan.tier.discount ? ` · −${plan.tier.discount * 100}%` : ''}</span>
                  <span>{plan.equiv >= 1 ? `${plan.equiv.toFixed(1)} containers` : `${(plan.equiv * 100).toFixed(0)}% of a container`}</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/15">
                  <motion.div className="h-full rounded-full bg-gradient-to-r from-md-teal to-md-sky" animate={{ width: `${Math.min(100, (plan.equiv % 1 || (plan.equiv ? 1 : 0)) * 100)}%` }} />
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-wide text-sky-100">Est. FOB</div>
                <div className="font-extrabold tabular-nums">{usd(plan.fobTotal)}</div>
              </div>
              <button className="btn bg-white/10 text-white ring-1 ring-white/25 hover:bg-white/20" onClick={() => setOpen(true)}>
                Review enquiry
              </button>
              <button className="btn bg-md-teal text-md-navy-900 hover:bg-white" onClick={() => navigate('/pitch')}>
                <Presentation className="h-4 w-4" /> Make proposal
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Drawer open={open} onClose={() => setOpen(false)} title={`Enquiry for ${country.flag} ${country.name}`}>
        <EnquiryReview onDone={() => setOpen(false)} />
      </Drawer>
    </>
  )
}

function ShowcaseCard({ p, countryCode, inBasket, onAdd }: { p: Product; countryCode: string; inBasket: number; onAdd: (qty: number) => void }) {
  const country = countryByCode(countryCode)!
  const rule = ruleFor(country, p.category)
  const [qty, setQty] = useState(defaultQty(p))
  const step = Math.max(1, Math.round(defaultQty(p) / 10))
  const duty = country.duty[p.category]
  return (
    <motion.article layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} whileHover={{ y: -4 }} className="card flex flex-col overflow-hidden">
      <div className={`relative flex h-32 items-center justify-center bg-gradient-to-br ${BRAND_TILE[p.brand]}`}>
        <motion.span className="text-6xl drop-shadow-sm" whileHover={{ scale: 1.15, rotate: -6 }} transition={{ type: 'spring', stiffness: 300 }}>
          {p.emoji}
        </motion.span>
        <span className="absolute left-3 top-3 chip bg-white/90 text-slate-700 shadow-sm">{p.brand}</span>
        {inBasket > 0 && (
          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute right-3 top-3 chip bg-md-navy text-white">
            ✓ {inBasket.toLocaleString()} {unitLabel(p)}
          </motion.span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-bold leading-snug text-md-navy-900">{p.name}</h3>
        <p className="mt-1 line-clamp-2 text-xs text-slate-500">{p.description}</p>
        <div className="mt-2 flex flex-wrap gap-1">
          {rule.level === 'conditional' && (
            <span className={`chip ${RULE_STYLE.conditional.cls}`} title={rule.note}>
              Conditions apply
            </span>
          )}
          {duty === 0 && <span className="chip bg-emerald-50 text-emerald-700">0% duty</span>}
          {p.season && <span className="chip bg-teal-50 text-teal-700">Season: {seasonLabel(p.season)}</span>}
          {p.exportStatus === 'on-request' && <span className="chip bg-slate-100 text-slate-600">On request</span>}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-slate-500">
          <div>
            <div className="font-bold uppercase tracking-wide text-slate-400">Shelf life</div>
            {p.shelfLife}
          </div>
          <div>
            <div className="font-bold uppercase tracking-wide text-slate-400">MOQ</div>
            {p.moq}
          </div>
        </div>
        <div className="mt-auto pt-4">
          <div className="mb-2 flex items-baseline justify-between">
            <span className="text-xs text-slate-500">Indicative FOB</span>
            <span className="text-lg font-extrabold tabular-nums text-md-navy-900">
              ${p.fobUsd < 10 ? p.fobUsd.toFixed(2) : p.fobUsd}
              <span className="text-xs font-semibold text-slate-400"> / {unitLabel(p)}</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="flex items-center rounded-xl ring-1 ring-slate-200">
              <button className="p-2 text-slate-500 hover:text-md-navy" onClick={() => setQty((x) => Math.max(step, x - step))} aria-label="Less">
                <Minus className="h-3.5 w-3.5" />
              </button>
              <input value={qty} onChange={(e) => setQty(Math.max(0, Number(e.target.value) || 0))} className="w-16 bg-transparent text-center text-sm font-bold tabular-nums outline-none" aria-label="Quantity" />
              <button className="p-2 text-slate-500 hover:text-md-navy" onClick={() => setQty((x) => x + step)} aria-label="More">
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
            <button className="btn-primary flex-1 py-2!" onClick={() => onAdd(qty)}>
              <ShoppingBasket className="h-4 w-4" /> Add
            </button>
          </div>
          <div className="mt-1 text-center text-[10px] text-slate-400">{unitPlural(p)} · default = one full container</div>
        </div>
      </div>
    </motion.article>
  )
}

function EnquiryReview({ onDone }: { onDone: () => void }) {
  const { basket, basketCountry, basketBuyerId, buyers, setBasketQty, removeFromBasket, upsertBuyer, upsertDeal, addActivity, setBasketTarget, toast } = useStore()
  const navigate = useNavigate()
  const country = countryByCode(basketCountry)!
  const plan = planBasket(basket, country)
  const existing = buyers.find((b) => b.id === basketBuyerId)
  const [form, setForm] = useState({ company: existing?.name ?? '', contact: existing?.contactPerson ?? '', email: existing?.email ?? '', phone: existing?.phone ?? '', message: '' })

  const submit = () => {
    let buyerId = existing?.id
    if (!buyerId) {
      buyerId = uid('b')
      upsertBuyer({
        id: buyerId,
        name: form.company || 'New prospect',
        country: country.code,
        city: '',
        segment: 'Importer / Distributor',
        products: basket.map((b) => b.productId),
        incoterm: `CIF ${country.port.split(',')[0]}`,
        paymentTerms: 'To be agreed',
        moq: '1 × container',
        status: 'Prospect',
        contactPerson: form.contact,
        email: form.email,
        phone: form.phone,
        annualValueUsd: 0,
        creditLimitUsd: 0,
        rating: 4,
        since: new Date().toISOString().slice(0, 10),
        tags: ['Showcase enquiry'],
      })
    }
    upsertDeal({
      id: uid('d'),
      title: `RFQ: ${basket.length} products → ${country.name}`,
      buyerId,
      country: country.code,
      productIds: basket.map((b) => b.productId),
      valueUsd: Math.round(plan.fobTotal),
      stage: 'Lead',
      owner: 'Intl. Sales',
      expectedClose: new Date(Date.now() + 60 * 864e5).toISOString().slice(0, 10),
      createdAt: new Date().toISOString().slice(0, 10),
      nextStep: 'Send formal proposal from Pitch Studio',
    })
    addActivity({
      id: uid('a'),
      type: 'email',
      partnerId: buyerId,
      partnerKind: 'buyer',
      subject: 'Quote request received via Buyer Showcase',
      note: form.message || `${plan.groups.map((g) => `${g.containers}× ${g.kind}`).join(', ')} · est. FOB ${usd(plan.fobTotal)}`,
      date: new Date().toISOString().slice(0, 10),
      owner: 'Intl. Sales',
      done: false,
    })
    setBasketTarget(country.code, buyerId)
    toast('Enquiry logged: lead + follow-up created in CRM')
    onDone()
  }

  if (!basket.length) return <p className="text-sm text-slate-500">Your enquiry basket is empty.</p>

  return (
    <div className="space-y-5">
      <ul className="space-y-2">
        {plan.lines.map((l) => (
          <li key={l.productId} className="flex items-center gap-3 rounded-xl p-2.5 ring-1 ring-slate-200">
            <span className="text-2xl">{l.product.emoji}</span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-slate-800">{l.product.name}</div>
              <div className="text-xs text-slate-500">
                ${l.unit.toFixed(2)} / {unitLabel(l.product)} · {Math.round(l.kg).toLocaleString()} kg
              </div>
            </div>
            <input type="number" min={0} className="input w-24! py-1! text-right" value={l.qty} onChange={(e) => setBasketQty(l.productId, Number(e.target.value))} aria-label="Quantity" />
            <button onClick={() => removeFromBasket(l.productId)} className="p-1.5 text-slate-400 hover:text-rose-600" aria-label="Remove">
              <Trash2 className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>

      <div className="rounded-2xl bg-slate-50 p-4">
        <div className="label">Load plan & volume pricing</div>
        <LoadPlan plan={plan} />
      </div>

      <table className="w-full text-sm">
        <tbody>
          <tr>
            <td className="py-1 text-slate-500">List value (FOB)</td>
            <td className="text-right tabular-nums">{usd(plan.listTotal)}</td>
          </tr>
          {plan.savings > 0 && (
            <tr className="text-emerald-700">
              <td className="py-1">Volume discount ({plan.tier.label})</td>
              <td className="text-right tabular-nums">−{usd(plan.savings)}</td>
            </tr>
          )}
          <tr className="font-bold text-md-navy-900">
            <td className="py-1">Est. FOB total</td>
            <td className="text-right tabular-nums">{usd(plan.fobTotal)}</td>
          </tr>
          <tr>
            <td className="py-1 text-slate-500">Est. CIF {country.port.split(',')[0]}</td>
            <td className="text-right tabular-nums text-slate-700">{usd(plan.cifTotal)}</td>
          </tr>
        </tbody>
      </table>

      <div className="space-y-3 rounded-2xl p-4 ring-1 ring-slate-200">
        <div className="font-bold text-md-navy-900">{existing ? `Request quote for ${existing.name}` : 'Your details'}</div>
        {!existing && (
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Company">
              <input className="input" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
            </Field>
            <Field label="Contact person">
              <input className="input" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
            </Field>
            <Field label="Email">
              <input type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </Field>
            <Field label="Phone">
              <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </Field>
          </div>
        )}
        <Field label="Message (optional)">
          <textarea rows={2} className="input" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Private label, delivery window, pack sizes…" />
        </Field>
        <div className="flex flex-wrap gap-2">
          <button className="btn-primary flex-1" onClick={submit}>
            <Send className="h-4 w-4" /> Log enquiry in CRM
          </button>
          <button
            className="btn-ghost flex-1"
            onClick={() => {
              onDone()
              navigate('/pitch')
            }}
          >
            <Presentation className="h-4 w-4" /> Build proposal
          </button>
        </div>
        <p className="text-[11px] text-slate-400">Prices are indicative and confirmed by {COMPANY.exportOffice.email} on a formal quote.</p>
      </div>
    </div>
  )
}

