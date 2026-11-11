import { AnimatePresence, motion } from 'motion/react'
import { Box, Calculator, Factory, Package, Presentation, Search, ShieldCheck, Snowflake, Sun, Thermometer } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Drawer, fadeUp, PageHeader } from '../components/ui'
import { BRAND_STYLES, EXPORT_RANGE } from '../data/company'
import { COUNTRIES, ruleFor } from '../data/countries'
import { plantById } from '../data/plants'
import { CATEGORIES, categoryName, PRODUCTS } from '../data/products'
import type { Brand, Product, TempType } from '../data/types'
import { num, RULE_STYLE } from '../lib/format'
import { seasonLabel } from '../lib/opportunity'
import { defaultQty, unitLabel } from '../lib/pricing'
import { useStore } from '../store/useStore'

const TEMP_ICON: Record<TempType, typeof Sun> = { ambient: Sun, chilled: Thermometer, frozen: Snowflake }
const TEMP_CLS: Record<TempType, string> = { ambient: 'text-amber-600', chilled: 'text-teal-600', frozen: 'text-sky-600' }

export default function Catalog() {
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''
  const [category, setCategory] = useState<string>('all')
  const [brand, setBrand] = useState<Brand | 'all'>('all')
  const [temp, setTemp] = useState<TempType | 'all'>('all')
  const [open, setOpen] = useState<Product | null>(null)

  const filtered = useMemo(() => {
    const s = q.toLowerCase()
    return PRODUCTS.filter(
      (p) =>
        (category === 'all' || p.category === category) &&
        (brand === 'all' || p.brand === brand) &&
        (temp === 'all' || p.tempType === temp) &&
        (!s || p.name.toLowerCase().includes(s) || p.hsCode.includes(s) || p.brand.toLowerCase().includes(s) || categoryName(p.category).toLowerCase().includes(s)),
    )
  }, [q, category, brand, temp])

  return (
    <>
      <PageHeader
        eyebrow="Export range"
        title="Export Catalog"
        subtitle={<>Official export range: {EXPORT_RANGE.join(' · ')}, plus Dhara edible oils. Stock and prices are indicative working figures.</>}
      />

      <motion.div variants={fadeUp} className="card mb-5 space-y-3 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-60 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setParams(e.target.value ? { q: e.target.value } : {}, { replace: true })}
              placeholder="Search by product, brand or HS code"
              className="input pl-9"
            />
          </div>
          <select value={brand} onChange={(e) => setBrand(e.target.value as Brand | 'all')} className="input w-auto!" aria-label="Brand">
            <option value="all">All brands</option>
            <option>Mother Dairy</option>
            <option>Safal</option>
            <option>Dhara</option>
          </select>
          <select value={temp} onChange={(e) => setTemp(e.target.value as TempType | 'all')} className="input w-auto!" aria-label="Temperature">
            <option value="all">Any temperature</option>
            <option value="ambient">Ambient</option>
            <option value="chilled">Chilled</option>
            <option value="frozen">Frozen</option>
          </select>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((c) => (
            <button key={c.id} onClick={() => setCategory(c.id)} className={`relative rounded-full px-3 py-1.5 text-xs font-semibold transition ${category === c.id ? 'text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {category === c.id && <motion.span layoutId="cat-pill" className="absolute inset-0 rounded-full bg-md-sky" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />}
              <span className="relative">{c.name}</span>
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div layout className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((p) => {
            const TIcon = TEMP_ICON[p.tempType]
            const style = BRAND_STYLES[p.brand]
            const eligible = COUNTRIES.filter((c) => ruleFor(c, p.category).level !== 'restricted').length
            return (
              <motion.article
                key={p.id}
                layout
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                whileHover={{ y: -4 }}
                className="card group flex cursor-pointer flex-col overflow-hidden"
                onClick={() => setOpen(p)}
              >
                <div className={`flex items-center justify-between px-5 pt-4`}>
                  <span className="flex items-center gap-1.5">
                    <span className="text-2xl leading-none">{p.emoji}</span>
                    <span className={`chip ${style.bg} ${style.text}`}>{p.brand}</span>
                    {p.exportStatus === 'on-request' && <span className="chip bg-slate-100 text-slate-500">On request</span>}
                  </span>
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-600">HS {p.hsCode}</span>
                </div>
                <div className="flex-1 px-5 pb-4 pt-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{categoryName(p.category)}</div>
                  <h3 className="text-lg font-bold leading-snug text-md-navy-900 group-hover:text-md-sky-ink">{p.name}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-500">{p.description}</p>
                  <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <TIcon className={`h-4 w-4 ${TEMP_CLS[p.tempType]}`} /> {p.tempReq}
                    </div>
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-md-sky" /> <span className="line-clamp-1">{p.packs}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/60 px-5 py-3 text-xs">
                  <span className="font-semibold text-slate-600">
                    {p.stock > 0 ? (
                      <>
                        <span className="font-bold text-emerald-700">{num(p.stock)}</span> {p.stockUnit}
                      </>
                    ) : (
                      <span className="text-amber-700">Seasonal · {seasonLabel(p.season)}</span>
                    )}
                  </span>
                  <span className="font-semibold text-slate-500">
                    {eligible}/{COUNTRIES.length} markets open
                  </span>
                </div>
              </motion.article>
            )
          })}
        </AnimatePresence>
      </motion.div>
      {filtered.length === 0 && <div className="card p-10 text-center text-sm text-slate-500">No products match these filters.</div>}

      <Drawer open={!!open} onClose={() => setOpen(null)} title={open?.name} width="max-w-2xl">
        {open && <ProductDetail p={open} />}
      </Drawer>
    </>
  )
}

function ProductDetail({ p }: { p: Product }) {
  const style = BRAND_STYLES[p.brand]
  const { addToBasket, toast } = useStore()
  const navigate = useNavigate()
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <span className={`chip ${style.bg} ${style.text}`}>{p.brand}</span>
        <span className="chip bg-slate-100 text-slate-700">{categoryName(p.category)}</span>
        <span className="chip bg-slate-100 font-mono text-slate-700">HS {p.hsCode}</span>
      </div>
      <p className="text-sm leading-relaxed text-slate-600">{p.description}</p>

      <div className="grid grid-cols-2 gap-2 text-sm">
        {[
          ['Storage', p.tempReq],
          ['Shelf life', p.shelfLife],
          ['Export packs', p.packs],
          ['Indicative FOB', `US$ ${p.fobUsd} / ${unitLabel(p)}`],
          ['MOQ', p.moq],
          ['Season', seasonLabel(p.season)],
        ].map(([k, v]) => (
          <div key={k} className="rounded-xl bg-slate-50 p-3">
            <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{k}</div>
            <div className="font-semibold text-slate-800">{v}</div>
          </div>
        ))}
      </div>

      {p.specs && (
        <section>
          <h4 className="label flex items-center gap-1">
            <Box className="h-3.5 w-3.5" /> Technical specification
          </h4>
          <table className="w-full overflow-hidden rounded-xl text-sm ring-1 ring-slate-200">
            <tbody>
              {Object.entries(p.specs).map(([k, v], i) => (
                <tr key={k} className={i % 2 ? 'bg-slate-50' : 'bg-white'}>
                  <td className="px-3 py-1.5 font-semibold text-slate-600">{k}</td>
                  <td className="px-3 py-1.5 text-slate-800">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <section>
        <h4 className="label flex items-center gap-1">
          <ShieldCheck className="h-3.5 w-3.5" /> Mandatory export documents
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {p.certsRequired.map((c) => (
            <span key={c} className="chip bg-md-sky-50 text-md-sky-ink">
              {c}
            </span>
          ))}
        </div>
      </section>

      <section>
        <h4 className="label flex items-center gap-1">
          <Factory className="h-3.5 w-3.5" /> Manufactured at
        </h4>
        <ul className="space-y-1 text-sm">
          {p.plantIds.map((id) => {
            const pl = plantById(id)
            return (
              <li key={id} className="flex justify-between rounded-lg bg-slate-50 px-3 py-2">
                <span className="font-semibold text-slate-700">{pl?.name}</span>
                <span className="text-slate-500">{pl?.city}</span>
              </li>
            )
          })}
        </ul>
      </section>

      <section>
        <h4 className="label">Market access by destination</h4>
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
          {COUNTRIES.map((c, i) => {
            const r = ruleFor(c, p.category)
            return (
              <motion.div key={c.code} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }} title={r.note} className={`flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs ${RULE_STYLE[r.level].cls}`}>
                <span>{c.flag}</span>
                <span className="truncate font-semibold">{c.name.split(' (')[0]}</span>
              </motion.div>
            )
          })}
        </div>
        <div className="mt-2 flex gap-3 text-[11px] text-slate-500">
          {(['ok', 'conditional', 'restricted'] as const).map((l) => (
            <span key={l} className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full" style={{ background: RULE_STYLE[l].fill }} />
              {RULE_STYLE[l].label}
            </span>
          ))}
        </div>
      </section>

      <div className="flex flex-wrap gap-2">
        <button
          className="btn-primary"
          onClick={() => {
            addToBasket(p.id, defaultQty(p))
            toast(`${p.name} added to proposal`)
            navigate('/pitch')
          }}
        >
          <Presentation className="h-4 w-4" /> Add to proposal
        </button>
        <Link to={`/compliance?product=${p.id}`} className="btn-ghost">
          <ShieldCheck className="h-4 w-4" /> Run compliance audit
        </Link>
        <Link to={`/calculator?product=${p.id}`} className="btn-ghost">
          <Calculator className="h-4 w-4" /> Landed cost
        </Link>
      </div>
    </div>
  )
}
