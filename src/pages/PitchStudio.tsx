import { motion } from 'motion/react'
import { BadgeCheck, Copy, FileCheck2, Mail, Plus, Printer, Save, Sparkles, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import LoadPlan from '../components/LoadPlan'
import { fadeUp, Field, PageHeader } from '../components/ui'
import { COMPANY, FACTS } from '../data/company'
import { COUNTRIES, countryByCode, ruleFor } from '../data/countries'
import { PLANTS } from '../data/plants'
import { PRODUCTS, productById } from '../data/products'
import { RULE_STYLE, uid, usd } from '../lib/format'
import { computeOpportunities } from '../lib/opportunity'
import { defaultQty, planBasket, unitPlural } from '../lib/pricing'
import { useStore } from '../store/useStore'

type Incoterm = 'FOB' | 'CIF'

export default function PitchStudio() {
  const { basket, basketCountry, basketBuyerId, buyers, setBasketTarget, addToBasket, setBasketQty, removeFromBasket, upsertDeal, toast } = useStore()
  const buyer = buyers.find((b) => b.id === basketBuyerId)
  const country = countryByCode(basketCountry) ?? COUNTRIES[0]
  const [prospect, setProspect] = useState({ name: '', contact: '', email: '' })
  const [incoterm, setIncoterm] = useState<Incoterm>('CIF')
  const [payment, setPayment] = useState(buyer?.paymentTerms ?? '30% advance, 70% against documents')
  const [validity, setValidity] = useState(30)
  const [note, setNote] = useState('')
  const [addId, setAddId] = useState('')

  const plan = useMemo(() => planBasket(basket, country), [basket, country])
  const clientName = buyer?.name ?? (prospect.name || 'Valued Partner')
  const contactName = buyer?.contactPerson ?? prospect.contact
  const clientEmail = buyer?.email ?? prospect.email
  const ref = useMemo(() => `MD-EXP-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`, [])
  const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })

  const eligible = PRODUCTS.filter((p) => ruleFor(country, p.category).level !== 'restricted' && !basket.some((b) => b.productId === p.id))
  // best opportunity per category in this market, so suggestions broaden the range
  const suggestions = useMemo(() => {
    const seen = new Set(basket.map((b) => productById(b.productId)?.category))
    return computeOpportunities(buyers)
      .filter((o) => o.country.code === country.code && !basket.some((b) => b.productId === o.product.id))
      .filter((o) => !seen.has(o.product.category) && seen.add(o.product.category))
      .slice(0, 4)
  }, [buyers, country.code, basket])

  const docs = useMemo(() => {
    const set = new Set<string>(['Commercial invoice & packing list', country.tradeAgreement ? `Preferential certificate of origin (${country.tradeAgreement.split(' (')[0]})` : 'Certificate of origin'])
    plan.lines.forEach((l) => l.product.certsRequired.forEach((c) => set.add(c)))
    if (country.halalRequired) set.add('Halal certificate')
    if (plan.groups.some((g) => g.kind === 'reefer')) set.add('Reefer temperature log')
    return [...set]
  }, [plan.lines, plan.groups, country])

  const plantCerts = useMemo(() => {
    const ids = new Set(plan.lines.flatMap((l) => l.product.plantIds))
    return [...new Set(PLANTS.filter((p) => ids.has(p.id)).flatMap((p) => p.certifications))]
  }, [plan.lines])

  const total = incoterm === 'CIF' ? plan.cifTotal : plan.fobTotal
  const portName = country.port.split(',')[0]

  const emailText = () =>
    [
      `Dear ${contactName || clientName},`,
      '',
      `Thank you for your interest in Mother Dairy, Safal and Dhara products. Please find our indicative ${incoterm} ${incoterm === 'CIF' ? portName : 'Nhava Sheva'} offer (ref ${ref}):`,
      '',
      ...plan.lines.map((l) => `• ${l.product.name}: ${l.qty.toLocaleString()} ${unitPlural(l.product)} @ US$ ${(incoterm === 'CIF' ? l.cifUnit : l.unit).toFixed(2)} = ${usd(incoterm === 'CIF' ? l.cifTotal : l.fobTotal)}`),
      '',
      `Total: ${usd(total)} (${plan.tier.label}${plan.tier.discount ? `, ${plan.tier.discount * 100}% volume discount applied` : ''})`,
      `Load: ${plan.groups.map((g) => `${g.containers} × ${g.kind === 'reefer' ? "40' reefer" : "20' dry"}`).join(' + ')}`,
      plan.next ? `Tip: adding ~${plan.kgToNext.toLocaleString()} kg unlocks ${plan.next.discount * 100}% off.` : '',
      `Transit to ${portName}: ~${country.transitDays} days${country.tradeAgreement ? ` · preferential duty under ${country.tradeAgreement}` : ''}.`,
      `Payment: ${payment}. Validity: ${validity} days.`,
      '',
      note,
      '',
      'Warm regards,',
      'International Business, Mother Dairy Fruit & Vegetable Pvt. Ltd.',
      `${COMPANY.exportOffice.email} · ${COMPANY.exportOffice.phone}`,
    ]
      .filter((l, i, a) => !(l === '' && a[i - 1] === ''))
      .join('\n')

  const saveDeal = () => {
    upsertDeal({
      id: uid('d'),
      title: `Proposal ${ref} – ${clientName}`,
      buyerId: buyer?.id ?? '',
      country: country.code,
      productIds: basket.map((b) => b.productId),
      valueUsd: Math.round(total),
      stage: 'Qualified',
      owner: 'Intl. Sales',
      expectedClose: new Date(Date.now() + validity * 864e5).toISOString().slice(0, 10),
      createdAt: new Date().toISOString().slice(0, 10),
      nextStep: `Follow up on proposal ${ref}`,
    })
    toast('Proposal saved to CRM pipeline')
  }

  return (
    <>
      <div className="no-print">
        <PageHeader
          eyebrow="Pitch to clients"
          title="Pitch Studio"
          subtitle="Build a client-ready export proposal: products, volume pricing, a container plan, market readiness and terms. Print it to PDF, email it, or save it to the CRM."
          actions={
            <>
              <button className="btn-ghost" onClick={() => window.print()} disabled={!basket.length}>
                <Printer className="h-4 w-4" /> Print / PDF
              </button>
              <button
                className="btn-ghost"
                disabled={!basket.length}
                onClick={() => {
                  navigator.clipboard?.writeText(emailText())
                  toast('Proposal email copied')
                }}
              >
                <Copy className="h-4 w-4" /> Copy email
              </button>
              <a
                className={`btn-ghost ${!basket.length ? 'pointer-events-none opacity-50' : ''}`}
                href={`mailto:${clientEmail}?subject=${encodeURIComponent(`Mother Dairy export offer ${ref}`)}&body=${encodeURIComponent(emailText())}`}
              >
                <Mail className="h-4 w-4" /> Email draft
              </a>
              <button className="btn-primary" onClick={saveDeal} disabled={!basket.length}>
                <Save className="h-4 w-4" /> Save to CRM
              </button>
            </>
          }
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
        {/* Builder */}
        <motion.aside variants={fadeUp} className="no-print space-y-4">
          <div className="card space-y-3 p-4">
            <div className="font-bold text-md-navy-900">1 · Client</div>
            <Field label="Buyer">
              <select
                className="input"
                value={basketBuyerId ?? ''}
                onChange={(e) => {
                  const b = buyers.find((x) => x.id === e.target.value)
                  setBasketTarget(b?.country ?? basketCountry, b?.id ?? null)
                  if (b) setPayment(b.paymentTerms)
                }}
              >
                <option value="">New prospect…</option>
                {buyers.map((b) => (
                  <option key={b.id} value={b.id}>
                    {countryByCode(b.country)?.flag} {b.name}
                  </option>
                ))}
              </select>
            </Field>
            {!buyer && (
              <div className="grid gap-2">
                <input className="input" placeholder="Company name" value={prospect.name} onChange={(e) => setProspect({ ...prospect, name: e.target.value })} />
                <div className="grid grid-cols-2 gap-2">
                  <input className="input" placeholder="Contact" value={prospect.contact} onChange={(e) => setProspect({ ...prospect, contact: e.target.value })} />
                  <input className="input" placeholder="Email" value={prospect.email} onChange={(e) => setProspect({ ...prospect, email: e.target.value })} />
                </div>
              </div>
            )}
            <Field label="Destination">
              <select className="input" value={country.code} onChange={(e) => setBasketTarget(e.target.value, basketBuyerId)}>
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="card space-y-3 p-4">
            <div className="flex items-center justify-between">
              <div className="font-bold text-md-navy-900">2 · Products</div>
              <Link to="/showcase" className="text-xs font-semibold text-md-sky-ink hover:underline">
                Browse showcase
              </Link>
            </div>
            {basket.length === 0 && <p className="text-sm text-slate-500">No products yet. Add one below, from the Showcase, or from an opportunity.</p>}
            <ul className="space-y-2">
              {plan.lines.map((l) => {
                const r = ruleFor(country, l.product.category)
                return (
                  <li key={l.productId} className="flex items-center gap-2 rounded-xl p-2 ring-1 ring-slate-200">
                    <span className="text-xl">{l.product.emoji}</span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-xs font-semibold text-slate-800">{l.product.name}</div>
                      {r.level === 'restricted' && <div className="text-[10px] font-semibold text-rose-600">Restricted in {country.name}</div>}
                    </div>
                    <input type="number" min={0} className="input w-20! px-2! py-1! text-right text-xs!" value={l.qty} onChange={(e) => setBasketQty(l.productId, Number(e.target.value))} aria-label="Quantity" />
                    <button onClick={() => removeFromBasket(l.productId)} className="p-1 text-slate-400 hover:text-rose-600" aria-label="Remove">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                )
              })}
            </ul>
            <div className="flex gap-2">
              <select className="input py-1.5" value={addId} onChange={(e) => setAddId(e.target.value)} aria-label="Add product">
                <option value="">Add a product…</option>
                {eligible.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.emoji} {p.name}
                  </option>
                ))}
              </select>
              <button
                className="btn-primary px-3!"
                disabled={!addId}
                onClick={() => {
                  const p = PRODUCTS.find((x) => x.id === addId)!
                  addToBasket(p.id, defaultQty(p))
                  setAddId('')
                }}
                aria-label="Add"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            {suggestions.length > 0 && (
              <div className="rounded-xl bg-amber-50/70 p-3 ring-1 ring-amber-200">
                <div className="mb-2 flex items-center gap-1.5 text-xs font-bold text-amber-800">
                  <Sparkles className="h-3.5 w-3.5" /> Pitch more: top picks for {country.name}
                </div>
                <div className="space-y-1.5">
                  {suggestions.map((o) => (
                    <button key={o.id} onClick={() => addToBasket(o.product.id, defaultQty(o.product))} className="flex w-full items-center gap-2 rounded-lg bg-white px-2 py-1.5 text-left text-xs ring-1 ring-amber-100 hover:ring-amber-300">
                      <span>{o.product.emoji}</span>
                      <span className="min-w-0 flex-1 truncate font-semibold text-slate-700">{o.product.name}</span>
                      <span className="font-bold tabular-nums text-md-sky-ink">{o.score}</span>
                      <Plus className="h-3.5 w-3.5 text-slate-400" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="card space-y-3 p-4">
            <div className="font-bold text-md-navy-900">3 · Terms</div>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Incoterm">
                <select className="input" value={incoterm} onChange={(e) => setIncoterm(e.target.value as Incoterm)}>
                  <option value="CIF">CIF {portName}</option>
                  <option value="FOB">FOB Nhava Sheva</option>
                </select>
              </Field>
              <Field label="Validity (days)">
                <input type="number" min={7} className="input" value={validity} onChange={(e) => setValidity(Number(e.target.value))} />
              </Field>
            </div>
            <Field label="Payment terms">
              <input className="input" value={payment} onChange={(e) => setPayment(e.target.value)} />
            </Field>
            <Field label="Personal note">
              <textarea rows={3} className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Great meeting you at Gulfood — here is the range we discussed." />
            </Field>
          </div>
        </motion.aside>

        {/* Proposal document */}
        <motion.article variants={fadeUp} className="print-area card overflow-hidden">
          <div className="relative overflow-hidden bg-gradient-to-br from-md-sky via-[#0a8fd0] to-md-navy p-6 text-white sm:p-8">
            <div className="absolute -right-8 -top-10 text-[140px] opacity-10 select-none" aria-hidden>
              🥛
            </div>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex flex-col items-center rounded-xl bg-white px-3 py-2">
                <span className="text-lg font-black leading-none tracking-tight text-md-sky">MOTHER</span>
                <span className="mt-0.5 w-full border-t border-md-sky/40 pt-0.5 text-center text-[10px] font-extrabold tracking-[0.3em] text-md-sky">DAIRY</span>
              </div>
              <div className="text-right text-xs text-sky-100">
                <div className="font-mono">{ref}</div>
                <div>{today}</div>
                <div>Valid {validity} days</div>
              </div>
            </div>
            <div className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-sky-100">Export proposal</div>
            <h2 className="mt-1 text-2xl font-black sm:text-3xl">
              Prepared for {clientName}
            </h2>
            <div className="mt-1 text-sm text-sky-50">
              {country.flag} {buyer?.city ? `${buyer.city}, ` : ''}
              {country.name} · {incoterm} {incoterm === 'CIF' ? portName : 'Nhava Sheva'}
            </div>
          </div>

          <div className="space-y-7 p-6 sm:p-8">
            <section className="text-sm leading-relaxed text-slate-700">
              <p>
                Dear {contactName || clientName}, thank you for considering Mother Dairy. Since {COMPANY.founded}, as a wholly owned subsidiary of India's National Dairy Development Board, we have brought trusted dairy, fruit, vegetable and edible-oil products to millions of homes, and now to around 40 countries.
              </p>
              {note && <p className="mt-2 italic text-slate-600">“{note}”</p>}
            </section>

            <section className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {FACTS.map((f) => (
                <div key={f.label} className="rounded-xl bg-md-sky-50 p-3">
                  <div className="text-lg font-extrabold text-md-navy-900">
                    {f.prefix}
                    {f.value.toLocaleString('en-IN')}
                    {f.suffix}
                  </div>
                  <div className="text-[11px] font-semibold text-slate-600">{f.label}</div>
                </div>
              ))}
            </section>

            <section>
              <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-md-sky-ink">Our offer</h3>
              {plan.lines.length === 0 ? (
                <div className="rounded-xl border-2 border-dashed border-slate-200 p-8 text-center text-sm text-slate-400">Add products on the left to build the offer.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[560px] text-sm">
                    <thead>
                      <tr className="border-b-2 border-md-navy text-left text-[11px] uppercase tracking-wide text-slate-500">
                        <th className="py-2">Product</th>
                        <th className="py-2 text-right">Quantity</th>
                        <th className="py-2 text-right">Unit {incoterm}</th>
                        <th className="py-2 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {plan.lines.map((l) => (
                        <tr key={l.productId} className="border-b border-slate-100 align-top">
                          <td className="py-2.5 pr-2">
                            <div className="font-semibold text-md-navy-900">
                              {l.product.emoji} {l.product.name}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              HS {l.product.hsCode} · {l.product.packs} · shelf life {l.product.shelfLife}
                            </div>
                          </td>
                          <td className="py-2.5 text-right tabular-nums">
                            {l.qty.toLocaleString()} <span className="text-xs text-slate-400">{unitPlural(l.product)}</span>
                          </td>
                          <td className="py-2.5 text-right tabular-nums">
                            {plan.tier.discount > 0 && <div className="text-[11px] text-slate-400 line-through">${l.listUnit.toFixed(2)}</div>}${(incoterm === 'CIF' ? l.cifUnit : l.unit).toFixed(2)}
                          </td>
                          <td className="py-2.5 text-right font-semibold tabular-nums">{usd(incoterm === 'CIF' ? l.cifTotal : l.fobTotal)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      {plan.savings > 0 && (
                        <tr className="text-emerald-700">
                          <td colSpan={3} className="pt-2 text-right text-xs font-semibold">
                            Volume discount included ({plan.tier.label}, {plan.tier.discount * 100}%)
                          </td>
                          <td className="pt-2 text-right text-xs font-semibold tabular-nums">−{usd(plan.savings)}</td>
                        </tr>
                      )}
                      <tr>
                        <td colSpan={3} className="pt-2 text-right font-bold text-md-navy-900">
                          Total {incoterm} {incoterm === 'CIF' ? portName : 'Nhava Sheva'}
                        </td>
                        <td className="pt-2 text-right text-lg font-black tabular-nums text-md-navy-900">{usd(total)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </section>

            {plan.lines.length > 0 && (
              <div className="grid gap-6 md:grid-cols-2">
                <section>
                  <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-md-sky-ink">Load plan</h3>
                  <LoadPlan plan={plan} />
                </section>
                <section>
                  <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-md-sky-ink">Ready for {country.name}</h3>
                  <ul className="space-y-1.5 text-sm">
                    {plan.lines.map((l) => {
                      const r = ruleFor(country, l.product.category)
                      return (
                        <li key={l.productId} className="flex items-start justify-between gap-2">
                          <span className="text-slate-700">{l.product.name}</span>
                          <span className={`chip shrink-0 ${RULE_STYLE[r.level].cls}`} title={r.note}>
                            {RULE_STYLE[r.level].label}
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                  <div className="mt-3 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
                    {country.tradeAgreement && (
                      <div>
                        <b>Trade agreement:</b> {country.tradeAgreement} — we issue the preferential certificate of origin.
                      </div>
                    )}
                    <div>
                      <b>Transit:</b> ~{country.transitDays} days to {country.port}
                    </div>
                    <div>
                      <b>Labelling:</b> {country.labeling}
                    </div>
                  </div>
                </section>
              </div>
            )}

            {plan.lines.length > 0 && (
              <section>
                <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-md-sky-ink">Documents & certifications we provide</h3>
                <div className="flex flex-wrap gap-1.5">
                  {docs.map((d) => (
                    <span key={d} className="chip bg-white text-slate-700 ring-1 ring-slate-200">
                      <FileCheck2 className="h-3 w-3 text-md-teal-ink" /> {d}
                    </span>
                  ))}
                  {plantCerts.map((c) => (
                    <span key={c} className="chip bg-md-sky-50 text-md-sky-ink">
                      <BadgeCheck className="h-3 w-3" /> {c}
                    </span>
                  ))}
                </div>
              </section>
            )}

            <section className="grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-md-sky-ink">Commercial terms</h3>
                <dl className="space-y-1 text-slate-700">
                  {[
                    ['Incoterm', `${incoterm} ${incoterm === 'CIF' ? portName : 'Nhava Sheva (JNPT)'}`],
                    ['Payment', payment],
                    ['Lead time', '3–4 weeks from confirmed PO'],
                    ['Shelf life', 'Minimum two-thirds remaining at dispatch'],
                    ['Validity', `${validity} days from ${today}`],
                  ].map(([k, v]) => (
                    <div key={k} className="flex gap-2">
                      <dt className="w-24 shrink-0 text-slate-400">{k}</dt>
                      <dd className="font-medium">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <div className="rounded-2xl bg-md-navy p-4 text-white">
                <div className="text-xs font-bold uppercase tracking-wider text-sky-200">Next steps</div>
                <ol className="mt-1 list-inside list-decimal space-y-0.5 text-sm text-sky-50">
                  <li>Confirm products, packs and quantities</li>
                  <li>We send the proforma invoice and samples if needed</li>
                  <li>PO + payment security → production & booking</li>
                </ol>
                <div className="mt-3 border-t border-white/15 pt-2 text-xs text-sky-100">
                  {COMPANY.exportOffice.email} · {COMPANY.exportOffice.phone}
                  <br />
                  {COMPANY.exportOffice.address}
                </div>
              </div>
            </section>

            <p className="border-t border-slate-100 pt-3 text-[10px] text-slate-400">
              Indicative offer for discussion. Prices are subject to confirmation on the proforma invoice, availability, and freight at the time of booking. CIF prices include estimated sea freight and insurance (0.3% on 110% of value). Import duties and destination charges are for the buyer's account unless agreed otherwise.
            </p>
          </div>
        </motion.article>
      </div>
    </>
  )
}
