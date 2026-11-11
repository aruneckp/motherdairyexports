import { motion } from 'motion/react'
import { AlertTriangle, CheckCircle2, ClipboardCheck, Globe2, Languages, Printer, ShieldAlert, ShieldCheck, Tags } from 'lucide-react'
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { fadeUp, PageHeader, Tabs } from '../components/ui'
import { COUNTRIES, countryByCode, ruleFor } from '../data/countries'
import { CATEGORIES, categoryName, PRODUCTS } from '../data/products'
import type { CategoryId } from '../data/types'
import { RULE_STYLE } from '../lib/format'

type Tab = 'audit' | 'matrix' | 'country'

export default function Compliance() {
  const [params] = useSearchParams()
  const [tab, setTab] = useState<Tab>(params.get('country') ? 'country' : 'audit')
  const [productId, setProductId] = useState(params.get('product') ?? PRODUCTS[0].id)
  const [countryCode, setCountryCode] = useState(params.get('country') ?? 'UAE')

  return (
    <>
      <PageHeader
        eyebrow="Trade compliance"
        title="Compliance & Market Access"
        subtitle="Check each product against the destination's import rules, documents and labelling before you quote."
        actions={
          <Tabs
            id="comp"
            value={tab}
            onChange={setTab}
            tabs={[
              { id: 'audit', label: 'Shipment audit' },
              { id: 'matrix', label: 'Access matrix' },
              { id: 'country', label: 'Country rules' },
            ]}
          />
        }
      />
      <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        {tab === 'audit' && <Audit productId={productId} setProductId={setProductId} countryCode={countryCode} setCountryCode={setCountryCode} />}
        {tab === 'matrix' && <Matrix onPick={(c) => { setCountryCode(c); setTab('country') }} />}
        {tab === 'country' && <CountryRules code={countryCode} setCode={setCountryCode} />}
      </motion.div>
    </>
  )
}

function Audit({ productId, setProductId, countryCode, setCountryCode }: { productId: string; setProductId: (v: string) => void; countryCode: string; setCountryCode: (v: string) => void }) {
  const product = PRODUCTS.find((p) => p.id === productId) ?? PRODUCTS[0]
  const country = countryByCode(countryCode) ?? COUNTRIES[0]
  const rule = ruleFor(country, product.category)
  const [checked, setChecked] = useState<Record<string, boolean>>({})

  const docs = [
    'Commercial invoice & packing list',
    'Shipping bill (ICEGATE) & IEC',
    country.tradeAgreement ? `Preferential certificate of origin (${country.tradeAgreement})` : 'Non-preferential certificate of origin',
    ...product.certsRequired,
    ...(country.halalRequired && !product.certsRequired.some((c) => c.includes('Halal')) ? ['Halal certificate'] : []),
    ...(product.tempType !== 'ambient' ? ['Reefer pre-trip inspection & temperature data logger'] : []),
    `Labels per ${country.name} rules`,
  ]
  const done = docs.filter((d) => checked[d]).length
  const pct = Math.round((done / docs.length) * 100)
  const Icon = rule.level === 'ok' ? CheckCircle2 : rule.level === 'conditional' ? AlertTriangle : ShieldAlert

  return (
    <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
      <motion.div variants={fadeUp} className="card h-fit space-y-4 p-5">
        <label className="block">
          <span className="label">Product</span>
          <select className="input" value={productId} onChange={(e) => { setProductId(e.target.value); setChecked({}) }}>
            {CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
              <optgroup key={c.id} label={c.name}>
                {PRODUCTS.filter((p) => p.category === c.id).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="label">Destination</span>
          <select className="input" value={countryCode} onChange={(e) => { setCountryCode(e.target.value); setChecked({}) }}>
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.flag} {c.name}
              </option>
            ))}
          </select>
        </label>
        <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
          <div>
            <b>HS code:</b> {product.hsCode}
          </div>
          <div>
            <b>Indicative duty:</b> {country.duty[product.category] ?? '—'}% {country.tradeAgreement && <span className="text-emerald-700">({country.tradeAgreement})</span>}
          </div>
          <div>
            <b>Port / transit:</b> {country.port}, ~{country.transitDays} days
          </div>
        </div>
      </motion.div>

      <div className="space-y-4">
        <motion.div key={product.id + country.code} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className={`flex items-start gap-3 rounded-2xl p-5 ${RULE_STYLE[rule.level].cls}`}>
          <Icon className="mt-0.5 h-6 w-6 shrink-0" />
          <div>
            <div className="text-lg font-extrabold">
              {rule.level === 'ok' ? 'Eligible for export' : rule.level === 'conditional' ? 'Eligible with conditions' : 'Market access restricted'} — {product.name} → {country.flag} {country.name}
            </div>
            <p className="mt-1 text-sm">{rule.note}</p>
          </div>
        </motion.div>

        <motion.div variants={fadeUp} className="card p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h3 className="flex items-center gap-2 font-bold text-md-navy-900">
              <ClipboardCheck className="h-5 w-5 text-md-sky" /> Pre-shipment document checklist
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold tabular-nums text-md-navy-900">{pct}%</span>
              <button className="btn-ghost py-1.5!" onClick={() => window.print()}>
                <Printer className="h-4 w-4" /> Print
              </button>
            </div>
          </div>
          <div className="mb-4 h-2 overflow-hidden rounded-full bg-slate-100">
            <motion.div className="h-full rounded-full bg-gradient-to-r from-md-sky to-md-teal" animate={{ width: `${pct}%` }} transition={{ type: 'spring', stiffness: 120, damping: 20 }} />
          </div>
          <ul className="grid gap-2 sm:grid-cols-2">
            {docs.map((d) => (
              <li key={d}>
                <label className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm ring-1 transition ${checked[d] ? 'bg-emerald-50 ring-emerald-200' : 'bg-white ring-slate-200 hover:bg-slate-50'}`}>
                  <input type="checkbox" className="h-4 w-4 accent-[#1E9E80]" checked={!!checked[d]} onChange={() => setChecked((c) => ({ ...c, [d]: !c[d] }))} />
                  <span className={checked[d] ? 'text-emerald-800 line-through decoration-emerald-400' : 'text-slate-700'}>{d}</span>
                </label>
              </li>
            ))}
          </ul>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-2">
          <motion.div variants={fadeUp} className="card p-5 text-sm">
            <h4 className="mb-2 flex items-center gap-2 font-bold text-md-navy-900">
              <Tags className="h-4 w-4 text-md-sky" /> Labelling
            </h4>
            <p className="text-slate-600">{country.labeling}</p>
          </motion.div>
          <motion.div variants={fadeUp} className="card p-5 text-sm">
            <h4 className="mb-2 flex items-center gap-2 font-bold text-md-navy-900">
              <Globe2 className="h-4 w-4 text-md-sky" /> Import protocol
            </h4>
            <p className="text-slate-600">{country.protocols}</p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

function Matrix({ onPick }: { onPick: (code: string) => void }) {
  const cats = CATEGORIES.filter((c) => c.id !== 'all') as { id: CategoryId; name: string }[]
  return (
    <motion.div variants={fadeUp} className="card overflow-hidden">
      <div className="scrollbar-thin overflow-x-auto">
        <table className="w-full min-w-[860px] text-sm">
          <thead>
            <tr className="bg-slate-50 text-left text-[11px] uppercase tracking-wide text-slate-500">
              <th className="sticky left-0 bg-slate-50 px-4 py-3">Market</th>
              {cats.map((c) => (
                <th key={c.id} className="px-2 py-3 text-center">
                  {c.name.replace('Dhara ', '')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COUNTRIES.map((c, i) => (
              <motion.tr key={c.code} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.025 }} className="border-t border-slate-100 hover:bg-sky-50/40">
                <td className="sticky left-0 bg-white px-4 py-2">
                  <button onClick={() => onPick(c.code)} className="flex items-center gap-2 text-left font-semibold text-slate-800 hover:text-md-sky-ink">
                    <span className="text-lg">{c.flag}</span> {c.name}
                  </button>
                </td>
                {cats.map((cat) => {
                  const r = ruleFor(c, cat.id)
                  return (
                    <td key={cat.id} className="px-2 py-2 text-center" title={r.note}>
                      <span className={`chip ${RULE_STYLE[r.level].cls}`}>
                        {r.level === 'ok' ? '✓' : r.level === 'conditional' ? '!' : '✕'} {c.duty[cat.id] ?? '—'}%
                      </span>
                    </td>
                  )
                })}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap gap-4 border-t border-slate-100 p-3 text-xs text-slate-500">
        <span>✓ Eligible · ! Conditional · ✕ Restricted · figures = indicative duty %</span>
        <span>Hover a cell for the rule; click a market for full requirements.</span>
      </div>
    </motion.div>
  )
}

function CountryRules({ code, setCode }: { code: string; setCode: (c: string) => void }) {
  const c = countryByCode(code) ?? COUNTRIES[0]
  return (
    <div className="space-y-4">
      <motion.div variants={fadeUp} className="scrollbar-thin flex gap-2 overflow-x-auto pb-1">
        {COUNTRIES.map((x) => (
          <button key={x.code} onClick={() => setCode(x.code)} className={`relative shrink-0 rounded-xl px-3 py-2 text-sm font-semibold transition ${x.code === c.code ? 'text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'}`}>
            {x.code === c.code && <motion.span layoutId="country-pill" className="absolute inset-0 rounded-xl bg-md-navy" />}
            <span className="relative">
              {x.flag} {x.code}
            </span>
          </button>
        ))}
      </motion.div>
      <motion.div key={c.code} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid gap-4 lg:grid-cols-3">
        <div className="card bg-gradient-to-br from-md-sky-50 to-white p-5">
          <div className="text-5xl">{c.flag}</div>
          <h3 className="mt-2 text-xl font-extrabold text-md-navy-900">{c.name}</h3>
          <div className="text-sm text-slate-500">{c.region}</div>
          <dl className="mt-4 space-y-2 text-sm">
            {[
              ['Discharge port', c.port],
              ['Transit (sea)', `~${c.transitDays} days`],
              ['Trade agreement', c.tradeAgreement ?? 'None (MFN)'],
              ['Halal', c.halalRequired ? 'Mandatory' : 'Only if claimed'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3 border-b border-slate-100 pb-1.5">
                <dt className="text-slate-500">{k}</dt>
                <dd className="text-right font-semibold text-slate-800">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-4">
            <div className="label">Authorities</div>
            <div className="flex flex-wrap gap-1">
              {c.authorities.map((a) => (
                <span key={a} className="chip bg-white text-md-navy ring-1 ring-slate-200">
                  {a}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="card space-y-4 p-5 lg:col-span-2">
          <section>
            <h4 className="mb-1 flex items-center gap-2 font-bold text-md-navy-900">
              <ShieldCheck className="h-4 w-4 text-md-sky" /> Import protocol
            </h4>
            <p className="text-sm text-slate-600">{c.protocols}</p>
          </section>
          <section>
            <h4 className="mb-1 flex items-center gap-2 font-bold text-md-navy-900">
              <Languages className="h-4 w-4 text-md-sky" /> Labelling
            </h4>
            <p className="text-sm text-slate-600">{c.labeling}</p>
          </section>
          <section>
            <h4 className="mb-2 font-bold text-md-navy-900">Category access & indicative duty</h4>
            <div className="grid gap-2 sm:grid-cols-2">
              {(CATEGORIES.filter((x) => x.id !== 'all') as { id: CategoryId; name: string }[]).map((cat) => {
                const r = ruleFor(c, cat.id)
                return (
                  <div key={cat.id} className={`rounded-xl p-3 text-xs ${RULE_STYLE[r.level].cls}`}>
                    <div className="flex justify-between font-bold">
                      <span>{categoryName(cat.id)}</span>
                      <span>{c.duty[cat.id] ?? '—'}%</span>
                    </div>
                    {r.level !== 'ok' && <div className="mt-1">{r.note}</div>}
                  </div>
                )
              })}
            </div>
          </section>
        </div>
      </motion.div>
    </div>
  )
}
