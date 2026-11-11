import { motion } from 'motion/react'
import { AlertTriangle, Info, Plane, Ship, Snowflake } from 'lucide-react'
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AnimatedNumber, fadeUp, Field, PageHeader } from '../components/ui'
import { COUNTRIES, countryByCode, ruleFor } from '../data/countries'
import { PRODUCTS } from '../data/products'
import { CHART_COLORS, RULE_STYLE, usd } from '../lib/format'
import { kgPerUnit, seaFreightPerKg, unitLabel as unitLabelOf } from '../lib/pricing'

type Mode = 'dry' | 'reefer' | 'air'

const MODES: { id: Mode; label: string; icon: typeof Ship }[] = [
  { id: 'dry', label: 'Sea – dry', icon: Ship },
  { id: 'reefer', label: 'Sea – reefer', icon: Snowflake },
  { id: 'air', label: 'Air freight', icon: Plane },
]

export default function Calculator() {
  const [params] = useSearchParams()
  const [productId, setProductId] = useState(params.get('product') ?? 'p-ghee')
  const [countryCode, setCountryCode] = useState(params.get('country') ?? 'UAE')
  const product = PRODUCTS.find((p) => p.id === productId) ?? PRODUCTS[0]
  const country = countryByCode(countryCode) ?? COUNTRIES[0]
  const [qty, setQty] = useState(1000)
  const [price, setPrice] = useState<number | null>(null)
  const [mode, setMode] = useState<Mode>(product.tempType === 'ambient' ? 'dry' : 'reefer')
  const [fx, setFx] = useState(88)

  const unitPrice = price ?? product.fobUsd
  const unitLabel = unitLabelOf(product)
  const weightKg = qty * kgPerUnit(product)
  const dutyPct = country.duty[product.category] ?? 5
  const rule = ruleFor(country, product.category)

  const fob = qty * unitPrice
  const freightPerKg = mode === 'air' ? 2.4 : seaFreightPerKg(country.transitDays, mode)
  const freight = weightKg * freightPerKg
  const insurance = (fob + freight) * 1.1 * 0.003
  const cif = fob + freight + insurance
  const duty = (cif * dutyPct) / 100
  const handling = cif * 0.02
  const landed = cif + duty + handling
  const containerKg = mode === 'reefer' ? 24000 : 18000
  const containers = mode === 'air' ? 0 : Math.max(1, Math.ceil(weightKg / containerKg))

  const parts = [
    { label: 'FOB value', value: fob, color: CHART_COLORS[0] },
    { label: 'Freight', value: freight, color: CHART_COLORS[1] },
    { label: 'Insurance', value: insurance, color: CHART_COLORS[4] },
    { label: `Import duty (${dutyPct}%)`, value: duty, color: CHART_COLORS[3] },
    { label: 'Port & clearance', value: handling, color: CHART_COLORS[5] },
  ]

  return (
    <>
      <PageHeader
        eyebrow="Pricing"
        title="Landed Cost Estimator"
        subtitle="Build a FOB → CIF → landed price for any product and market. Freight, duty and handling are planning estimates — confirm with your forwarder and the destination tariff before quoting."
      />
      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <motion.div variants={fadeUp} className="card h-fit space-y-4 p-5">
          <Field label="Product">
            <select
              className="input"
              value={productId}
              onChange={(e) => {
                const p = PRODUCTS.find((x) => x.id === e.target.value)!
                setProductId(p.id)
                setPrice(null)
                setMode(p.tempType === 'ambient' ? 'dry' : 'reefer')
              }}
            >
              {PRODUCTS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Destination">
            <select className="input" value={countryCode} onChange={(e) => setCountryCode(e.target.value)}>
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.name}
                </option>
              ))}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label={`Quantity (${unitLabel})`}>
              <input type="number" min={1} className="input" value={qty} onChange={(e) => setQty(Math.max(0, Number(e.target.value)))} />
            </Field>
            <Field label={`FOB US$ / ${unitLabel}`}>
              <input type="number" min={0} step="0.01" className="input" value={unitPrice} onChange={(e) => setPrice(Number(e.target.value))} />
            </Field>
          </div>
          <div>
            <span className="label">Shipping mode</span>
            <div className="grid grid-cols-3 gap-1.5">
              {MODES.map((m) => (
                <button key={m.id} onClick={() => setMode(m.id)} className={`flex flex-col items-center gap-1 rounded-xl py-2.5 text-xs font-semibold ring-1 transition ${mode === m.id ? 'bg-md-sky text-white ring-md-sky' : 'bg-white text-slate-600 ring-slate-200'}`}>
                  <m.icon className="h-4 w-4" /> {m.label}
                </button>
              ))}
            </div>
          </div>
          <Field label="Exchange rate (₹ per US$)">
            <input type="number" min={1} step="0.1" className="input" value={fx} onChange={(e) => setFx(Number(e.target.value))} />
          </Field>
        </motion.div>

        <div className="space-y-4">
          {rule.level !== 'ok' && (
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-2 rounded-xl p-3 text-sm ${RULE_STYLE[rule.level].cls}`}>
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                <b>{RULE_STYLE[rule.level].label}:</b> {rule.note}
              </span>
            </motion.div>
          )}
          {product.tempType !== 'ambient' && mode === 'dry' && (
            <div className="flex gap-2 rounded-xl bg-rose-50 p-3 text-sm text-rose-800 ring-1 ring-rose-200">
              <Snowflake className="mt-0.5 h-4 w-4 shrink-0" /> {product.name} needs {product.tempReq.toLowerCase()} — a dry container will not hold temperature.
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-3">
            <motion.div variants={fadeUp} className="card p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">FOB value</div>
              <div className="mt-1 text-2xl font-extrabold tabular-nums text-md-navy-900">
                <AnimatedNumber key={'f' + fob} value={fob} format={(n) => usd(n)} />
              </div>
              <div className="text-xs text-slate-500">≈ ₹{((fob * fx) / 1e5).toFixed(2)} lakh</div>
            </motion.div>
            <motion.div variants={fadeUp} className="card p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">CIF {country.port.split(',')[0]}</div>
              <div className="mt-1 text-2xl font-extrabold tabular-nums text-md-navy-900">
                <AnimatedNumber key={'c' + cif} value={cif} format={(n) => usd(n)} />
              </div>
              <div className="text-xs text-slate-500">{mode === 'air' ? 'Air consignment' : `${containers} × ${mode === 'reefer' ? '40ft reefer' : '20ft dry'}`}</div>
            </motion.div>
            <motion.div variants={fadeUp} className="card bg-gradient-to-br from-md-sky to-md-navy p-4 text-white">
              <div className="text-xs font-semibold uppercase tracking-wide text-sky-100">Landed cost</div>
              <div className="mt-1 text-2xl font-extrabold tabular-nums">
                <AnimatedNumber key={'l' + landed} value={landed} format={(n) => usd(n)} />
              </div>
              <div className="text-xs text-sky-100">
                US$ {(landed / Math.max(qty, 1)).toFixed(2)} per {unitLabel}
              </div>
            </motion.div>
          </div>

          <motion.div variants={fadeUp} className="card p-5">
            <h3 className="mb-3 font-bold text-md-navy-900">Cost build-up</h3>
            <div className="flex h-4 w-full gap-[2px] overflow-hidden rounded-full bg-slate-100">
              {parts.map((p) => (
                <motion.div key={p.label} className="h-full first:rounded-l-full last:rounded-r-full" style={{ background: p.color }} animate={{ width: `${(p.value / landed) * 100}%` }} transition={{ type: 'spring', stiffness: 120, damping: 22 }} title={`${p.label}: ${usd(p.value)}`} />
              ))}
            </div>
            <table className="mt-4 w-full text-sm">
              <tbody>
                {parts.map((p) => (
                  <tr key={p.label} className="border-b border-slate-100">
                    <td className="py-2">
                      <span className="flex items-center gap-2 text-slate-700">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ background: p.color }} /> {p.label}
                      </span>
                    </td>
                    <td className="py-2 text-right font-semibold tabular-nums text-slate-800">{usd(p.value)}</td>
                    <td className="w-16 py-2 text-right text-xs tabular-nums text-slate-500">{((p.value / landed) * 100).toFixed(1)}%</td>
                  </tr>
                ))}
                <tr>
                  <td className="py-2 font-bold text-md-navy-900">Landed total</td>
                  <td className="py-2 text-right font-extrabold tabular-nums text-md-navy-900">{usd(landed)}</td>
                  <td />
                </tr>
              </tbody>
            </table>
            <div className="mt-3 flex items-start gap-1.5 text-[11px] text-slate-400">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Freight ≈ US$ {freightPerKg.toFixed(3)}/kg on {Math.round(weightKg).toLocaleString()} kg gross; insurance 0.3% on 110% of CFR; port & clearance 2% of CIF.
              {country.tradeAgreement && ` Duty assumes preferential rate under ${country.tradeAgreement} with a valid certificate of origin.`}
            </div>
          </motion.div>
        </div>
      </div>
    </>
  )
}
