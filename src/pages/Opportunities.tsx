import { AnimatePresence, motion } from 'motion/react'
import { AlertTriangle, CalendarRange, Lightbulb, Plus, Presentation, Radar, Sparkles, Target, TrendingUp } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatedNumber, fadeUp, PageHeader, StatTile, Tabs } from '../components/ui'
import { COUNTRIES, REGIONS } from '../data/countries'
import { CATEGORIES, MONTHS, PRODUCTS } from '../data/products'
import type { Brand, CategoryId } from '../data/types'
import { uid, usd } from '../lib/format'
import { computeOpportunities, OPP_TYPE_META, scoreColor, type Opportunity, type OppType } from '../lib/opportunity'
import { defaultQty } from '../lib/pricing'
import { useStore } from '../store/useStore'

const PAGE = 18

function ScoreRing({ score }: { score: number }) {
  const r = 20
  return (
    <div className="relative h-14 w-14 shrink-0">
      <svg viewBox="0 0 48 48" className="h-14 w-14 -rotate-90">
        <circle cx="24" cy="24" r={r} fill="none" stroke="#eef2f6" strokeWidth="5" />
        <motion.circle
          cx="24"
          cy="24"
          r={r}
          fill="none"
          stroke={scoreColor(Math.max(score, 55))}
          strokeWidth="5"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: score / 100 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm font-extrabold tabular-nums text-md-navy-900">{score}</span>
    </div>
  )
}

export default function Opportunities() {
  const { buyers, upsertDeal, addToBasket, setBasketTarget, toast } = useStore()
  const navigate = useNavigate()
  const all = useMemo(() => computeOpportunities(buyers), [buyers])

  const [type, setType] = useState<OppType | 'all'>('all')
  const [region, setRegion] = useState('all')
  const [brand, setBrand] = useState<Brand | 'all'>('all')
  const [category, setCategory] = useState<CategoryId | 'all'>('all')
  const [country, setCountry] = useState('all')
  const [seasonOnly, setSeasonOnly] = useState(false)
  const [minScore, setMinScore] = useState(60)
  const [shown, setShown] = useState(PAGE)

  const filtered = all.filter(
    (o) =>
      (type === 'all' || o.type === type) &&
      (region === 'all' || o.country.region === region) &&
      (brand === 'all' || o.product.brand === brand) &&
      (category === 'all' || o.product.category === category) &&
      (country === 'all' || o.country.code === country) &&
      (!seasonOnly || o.seasonSoon) &&
      o.score >= minScore,
  )

  const strong = all.filter((o) => o.score >= 70)
  const top30 = all.slice(0, 30).reduce((s, o) => s + o.potentialUsd, 0)

  // best score per category × market for the heatmap
  const heat = useMemo(() => {
    const m = new Map<string, Opportunity>()
    all.forEach((o) => {
      const k = `${o.product.category}:${o.country.code}`
      if (!m.has(k) || m.get(k)!.score < o.score) m.set(k, o)
    })
    return m
  }, [all])

  const pitch = (o: Opportunity) => {
    setBasketTarget(o.country.code, o.buyer && o.type !== 'whitespace' ? o.buyer.id : null)
    addToBasket(o.product.id, defaultQty(o.product))
    toast(`${o.product.name} added to pitch for ${o.country.name}`)
    navigate('/pitch')
  }

  const createLead = (o: Opportunity) => {
    upsertDeal({
      id: uid('d'),
      title: `${o.product.name} → ${o.country.name}`,
      buyerId: o.buyer?.id ?? '',
      country: o.country.code,
      productIds: [o.product.id],
      valueUsd: o.potentialUsd,
      stage: 'Lead',
      owner: 'Intl. Sales',
      expectedClose: new Date(Date.now() + 120 * 864e5).toISOString().slice(0, 10),
      createdAt: new Date().toISOString().slice(0, 10),
      nextStep: o.type === 'whitespace' ? 'Identify importers (trade fair / embassy list)' : `Pitch to ${o.buyer?.name}`,
    })
    toast('Lead added to CRM pipeline')
  }

  const seasonal = PRODUCTS.filter((p) => p.season)
  const nowMonth = new Date().getMonth() + 1

  return (
    <>
      <PageHeader
        eyebrow="Grow exports"
        title="Opportunity Spotter"
        subtitle="Every product × market pair is scored on demand, duty headroom, trade agreements, transit time, season timing and the buyers we already have. Act on the best ones: pitch them, or drop them into the CRM."
      />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Strong opportunities" icon={<Radar className="h-5 w-5" />} value={<AnimatedNumber value={strong.length} />} detail="Score 70+ across all markets" />
        <StatTile label="New markets" accent="navy" icon={<Target className="h-5 w-5" />} value={<AnimatedNumber value={strong.filter((o) => o.type === 'whitespace').length} />} detail="Eligible, no buyer yet" />
        <StatTile label="Cross-sell & upsell" accent="teal" icon={<TrendingUp className="h-5 w-5" />} value={<AnimatedNumber value={strong.filter((o) => o.type !== 'whitespace').length} />} detail="With buyers we already serve" />
        <StatTile label="Top-30 potential" accent="orange" icon={<Sparkles className="h-5 w-5" />} value={<AnimatedNumber value={top30} format={(n) => usd(n, true)} />} detail="Indicative annual value" />
      </div>

      {/* Heatmap */}
      <motion.section variants={fadeUp} className="card mb-6 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 p-4">
          <div>
            <h3 className="font-bold text-md-navy-900">Where to look: opportunity heatmap</h3>
            <p className="text-xs text-slate-500">Best score per category and market. Click a cell to list its opportunities.</p>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            Low
            <span className="flex">
              {[10, 30, 45, 60, 75, 92].map((s) => (
                <span key={s} className="h-3 w-5" style={{ background: scoreColor(s) }} />
              ))}
            </span>
            High
            <span className="ml-2 flex items-center gap-1">
              <span className="h-3 w-3 rounded-sm bg-[repeating-linear-gradient(45deg,#e2e8f0_0_2px,#fff_2px_5px)] ring-1 ring-slate-200" /> Restricted
            </span>
          </div>
        </div>
        <div className="scrollbar-thin overflow-x-auto">
          <table className="w-full min-w-[920px] border-separate border-spacing-[3px] p-2 text-xs">
            <thead>
              <tr>
                <th className="w-44" />
                {COUNTRIES.map((c) => (
                  <th key={c.code} className="pb-1 text-center font-semibold text-slate-500" title={c.name}>
                    <div className="text-base">{c.flag}</div>
                    {c.code}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CATEGORIES.filter((c) => c.id !== 'all').map((cat) => (
                <tr key={cat.id}>
                  <td className="pr-2 text-right font-semibold text-slate-600">{cat.name}</td>
                  {COUNTRIES.map((c) => {
                    const o = heat.get(`${cat.id}:${c.code}`)
                    const active = category === cat.id && country === c.code
                    return (
                      <td key={c.code} className="p-0">
                        <button
                          onClick={() => {
                            setCategory(cat.id as CategoryId)
                            setCountry(c.code)
                            setMinScore(0)
                            setShown(PAGE)
                          }}
                          disabled={!o}
                          title={o ? `${cat.name} → ${c.name}: ${o.score} (${o.product.name})` : `${cat.name} → ${c.name}: restricted`}
                          className={`h-8 w-full rounded-[4px] text-[11px] font-bold tabular-nums transition hover:scale-110 ${active ? 'ring-2 ring-md-navy-900' : ''} ${o && o.score >= 67 ? 'text-white' : 'text-slate-700'}`}
                          style={{ background: o ? scoreColor(o.score) : 'repeating-linear-gradient(45deg,#e2e8f0 0 2px,#fff 2px 5px)' }}
                        >
                          {o ? o.score : ''}
                        </button>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.section>

      <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
        <div>
          {/* Filters */}
          <motion.div variants={fadeUp} className="card mb-4 space-y-3 p-3">
            <div className="flex flex-wrap items-center gap-2">
              <Tabs
                id="opptype"
                value={type}
                onChange={(v) => {
                  setType(v)
                  setShown(PAGE)
                }}
                tabs={[
                  { id: 'all', label: 'All' },
                  { id: 'whitespace', label: 'New markets' },
                  { id: 'cross-sell', label: 'Cross-sell' },
                  { id: 'upsell', label: 'Volume upsell' },
                ]}
              />
              <label className="ml-auto flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-600">
                <input type="checkbox" className="h-4 w-4 accent-[#00A2E8]" checked={seasonOnly} onChange={(e) => setSeasonOnly(e.target.checked)} />
                Season in next 4 months
              </label>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select className="input w-auto! py-1.5" value={region} onChange={(e) => setRegion(e.target.value)} aria-label="Region">
                <option value="all">All regions</option>
                {REGIONS.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
              <select className="input w-auto! py-1.5" value={country} onChange={(e) => setCountry(e.target.value)} aria-label="Market">
                <option value="all">All markets</option>
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.name}
                  </option>
                ))}
              </select>
              <select className="input w-auto! py-1.5" value={category} onChange={(e) => setCategory(e.target.value as CategoryId | 'all')} aria-label="Category">
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <select className="input w-auto! py-1.5" value={brand} onChange={(e) => setBrand(e.target.value as Brand | 'all')} aria-label="Brand">
                <option value="all">All brands</option>
                <option>Mother Dairy</option>
                <option>Safal</option>
                <option>Dhara</option>
              </select>
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                Min score {minScore}
                <input type="range" min={0} max={90} step={5} value={minScore} onChange={(e) => setMinScore(Number(e.target.value))} className="accent-[#00A2E8]" />
              </label>
              {(category !== 'all' || country !== 'all' || region !== 'all' || brand !== 'all') && (
                <button
                  className="text-xs font-semibold text-md-sky-ink hover:underline"
                  onClick={() => {
                    setCategory('all')
                    setCountry('all')
                    setRegion('all')
                    setBrand('all')
                    setMinScore(60)
                  }}
                >
                  Clear filters
                </button>
              )}
            </div>
          </motion.div>

          <div className="mb-2 text-sm font-semibold text-slate-500">{filtered.length} opportunities</div>
          <motion.ul layout className="space-y-3">
            <AnimatePresence initial={false}>
              {filtered.slice(0, shown).map((o) => (
                <motion.li key={o.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }} className="card p-4">
                  <div className="flex flex-wrap items-start gap-4">
                    <ScoreRing score={o.score} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`chip ${OPP_TYPE_META[o.type].cls}`} title={OPP_TYPE_META[o.type].hint}>
                          {OPP_TYPE_META[o.type].label}
                        </span>
                        <span className="text-xs font-semibold text-slate-400">{o.product.brand}</span>
                      </div>
                      <h3 className="mt-1 font-bold leading-snug text-md-navy-900">
                        {o.product.emoji} {o.product.name} <span className="text-slate-400">→</span> {o.country.flag} {o.country.name}
                      </h3>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {o.reasons.map((r) => (
                          <span key={r} className="chip bg-slate-100 text-slate-700">
                            {r}
                          </span>
                        ))}
                      </div>
                      {o.caution && (
                        <div className="mt-2 flex items-start gap-1.5 text-xs text-amber-800">
                          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {o.caution}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="text-right">
                        <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Potential / yr</div>
                        <div className="text-lg font-extrabold tabular-nums text-md-navy-900">{usd(o.potentialUsd, true)}</div>
                      </div>
                      <div className="flex gap-1.5">
                        <button className="btn-ghost py-1.5! text-xs!" onClick={() => createLead(o)}>
                          <Plus className="h-3.5 w-3.5" /> Lead
                        </button>
                        <button className="btn-primary py-1.5! text-xs!" onClick={() => pitch(o)}>
                          <Presentation className="h-3.5 w-3.5" /> Pitch
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>
          {filtered.length > shown && (
            <button className="btn-ghost mt-4 w-full" onClick={() => setShown((s) => s + PAGE)}>
              Show more ({filtered.length - shown} left)
            </button>
          )}
          {filtered.length === 0 && <div className="card p-10 text-center text-sm text-slate-500">No opportunities match. Lower the minimum score or clear filters.</div>}
        </div>

        <div className="space-y-4">
          <motion.section variants={fadeUp} className="card p-5">
            <h3 className="mb-1 flex items-center gap-2 font-bold text-md-navy-900">
              <CalendarRange className="h-4 w-4 text-md-sky" /> Season calendar
            </h3>
            <p className="mb-3 text-xs text-slate-500">Contract seasonal lines before harvest. This month is highlighted.</p>
            <div className="grid grid-cols-[1fr_repeat(12,14px)] items-center gap-x-[2px] gap-y-1.5 text-[10px]">
              <span />
              {MONTHS.map((m, i) => (
                <span key={m} className={`text-center font-bold ${i + 1 === nowMonth ? 'text-md-sky-ink' : 'text-slate-400'}`}>
                  {m[0]}
                </span>
              ))}
              {seasonal.map((p) => (
                <div key={p.id} className="contents">
                  <span className="truncate pr-1 text-[11px] font-semibold text-slate-600" title={p.name}>
                    {p.emoji} {p.name.replace(/\(.*\)/, '')}
                  </span>
                  {MONTHS.map((m, i) => (
                    <span key={m} className={`h-3.5 rounded-[3px] ${p.season!.includes(i + 1) ? 'bg-md-teal' : 'bg-slate-100'} ${i + 1 === nowMonth ? 'ring-1 ring-md-sky' : ''}`} />
                  ))}
                </div>
              ))}
            </div>
          </motion.section>

          <motion.section variants={fadeUp} className="card p-5 text-sm">
            <h3 className="mb-2 flex items-center gap-2 font-bold text-md-navy-900">
              <Lightbulb className="h-4 w-4 text-amber-500" /> How the score works
            </h3>
            <ul className="space-y-1.5 text-slate-600">
              <li>
                <b>Demand</b> up to 45: market × category index
              </li>
              <li>
                <b>Duty headroom</b> up to 12 · <b>transit</b> up to 8
              </li>
              <li>
                <b>Trade agreement</b> +4 · <b>season soon</b> +5
              </li>
              <li>
                <b>Warm account</b> +6 cross-sell, +4 upsell
              </li>
              <li>
                <b>Diaspora pull</b> +3 · <b>Halal / FDA plant fit</b> +3
              </li>
              <li>
                <b>Regular export line</b> +4, on-request −4
              </li>
              <li>Conditional access × 0.75 · restricted markets excluded</li>
              <li>Potential = one container's value × demand-based containers per year</li>
            </ul>
            <p className="mt-3 text-xs text-slate-400">The demand index is an internal estimate in src/data/demand.ts. Tune it with ITC Trade Map or APEDA statistics.</p>
          </motion.section>
        </div>
      </div>
    </>
  )
}
