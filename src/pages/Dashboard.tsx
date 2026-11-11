import { motion } from 'motion/react'
import { ArrowRight, CalendarClock, CheckCircle2, Circle, FileWarning, Handshake, Radar, Ship, TrendingUp, Users } from 'lucide-react'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import GeoMap from '../components/GeoMap'
import { AnimatedNumber, DemoBadge, fadeUp, SourceLink, StatTile } from '../components/ui'
import { COMPANY, FACTS } from '../data/company'
import { COUNTRIES, countryByCode } from '../data/countries'
import { MONTHLY_EXPORTS } from '../data/crm'
import { PORTS } from '../data/plants'
import { CHART_COLORS, date, DEAL_STAGES, INDIA_FILL, REGION_COLOR, STAGE_PROBABILITY, usd } from '../lib/format'
import { computeOpportunities, OPP_TYPE_META, scoreColor } from '../lib/opportunity'
import { useTopology } from '../lib/useTopology'
import { useStore } from '../store/useStore'

const REGION_SERIES = [
  { key: 'gcc', label: 'GCC & Middle East' },
  { key: 'southAsia', label: 'South Asia' },
  { key: 'europe', label: 'Europe' },
  { key: 'apac', label: 'Asia Pacific' },
  { key: 'americas', label: 'Americas' },
] as const


function portFor(region: string) {
  if (region === 'South Asia') return PORTS.find((p) => p.id === 'kolkata')!
  if (region === 'Asia Pacific') return PORTS.find((p) => p.id === 'chennai')!
  if (region === 'GCC & Middle East') return PORTS.find((p) => p.id === 'mundra')!
  return PORTS.find((p) => p.id === 'jnpt')!
}

export default function Dashboard() {
  const topo = useTopology('110m')
  const { deals, buyers, shipments, activities } = useStore()

  const openDeals = deals.filter((d) => d.stage !== 'Won' && d.stage !== 'Lost')
  const weighted = openDeals.reduce((s, d) => s + d.valueUsd * STAGE_PROBABILITY[d.stage], 0)
  const activeBuyers = buyers.filter((b) => b.status.startsWith('Active')).length
  const moving = shipments.filter((s) => ['Sailed', 'In Transit', 'Stuffing', 'Arrived'].includes(s.status)).length
  const docsPending = shipments.reduce((s, x) => s + x.docs.filter((d) => !d.done).length, 0)

  const stageData = DEAL_STAGES.filter((s) => s !== 'Lost').map((stage) => ({
    stage,
    value: deals.filter((d) => d.stage === stage).reduce((s, d) => s + d.valueUsd, 0) / 1000,
    count: deals.filter((d) => d.stage === stage).length,
  }))

  const marketTotals = useMemo(() => {
    const m = new Map<string, number>()
    buyers.forEach((b) => m.set(b.country, (m.get(b.country) ?? 0) + b.annualValueUsd))
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6)
  }, [buyers])
  const maxMarket = marketTotals[0]?.[1] ?? 1

  const topOpps = useMemo(() => {
    // one opportunity per product so the strip shows variety
    const seen = new Set<string>()
    return computeOpportunities(buyers).filter((o) => !seen.has(o.product.id) && seen.add(o.product.id)).slice(0, 6)
  }, [buyers])

  const upcoming = [...activities].filter((a) => !a.done).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5)

  const arcs = COUNTRIES.map((c) => ({
    id: c.code,
    from: portFor(c.region).coords,
    to: c.coords,
    color: REGION_COLOR[c.region],
  }))
  const markers = COUNTRIES.map((c) => ({
    id: c.code,
    coords: c.coords,
    color: REGION_COLOR[c.region],
    label: c.name,
    size: 3.5,
  }))
  const fills = Object.fromEntries(COUNTRIES.map((c) => [c.isoNum, REGION_COLOR[c.region]]))
  fills['356'] = INDIA_FILL

  return (
    <>
      {/* Hero */}
      <motion.section variants={fadeUp} className="relative mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-md-sky via-[#0a8fd0] to-md-navy text-white shadow-xl shadow-md-sky/20">
        <div className="grid gap-4 p-6 sm:p-8 lg:grid-cols-[1fr_1.35fr] lg:items-center">
          <div className="relative z-10">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-widest ring-1 ring-white/25">
              Since {COMPANY.founded} · NDDB
            </div>
            <h1 className="text-3xl font-black leading-tight tracking-tight sm:text-4xl">
              Taking India's goodness
              <br />
              <span className="text-md-teal">to 40 countries.</span>
            </h1>
            <p className="mt-3 max-w-md text-sm text-sky-50/90">
              One workspace for Mother Dairy, Safal and Dhara exports: catalogue, market access rules, buyer and supplier CRM, and shipments.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link to="/map" className="btn bg-white text-md-sky-ink hover:bg-sky-50">
                Open trade map <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/opportunities" className="btn bg-white/15 text-white ring-1 ring-white/30 hover:bg-white/25">
                <Radar className="h-4 w-4" /> Spot opportunities
              </Link>
            </div>
          </div>
          <div className="relative -mx-4 sm:mx-0">{topo && <GeoMap topo={topo} fills={fills} arcs={arcs} markers={markers} className="drop-shadow-xl [&_svg]:rounded-2xl" />}</div>
        </div>
      </motion.section>

      {/* Verified company facts */}
      <motion.div variants={fadeUp} className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">Company at a glance</h2>
        <span className="text-[11px] text-slate-400">Sourced figures</span>
      </motion.div>
      <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {FACTS.map((f, i) => (
          <StatTile
            key={f.label}
            label={f.label}
            accent={(['sky', 'teal', 'orange', 'navy'] as const)[i]}
            value={<AnimatedNumber value={f.value} prefix={f.prefix} suffix={f.suffix} />}
            detail={
              <span className="flex flex-col gap-1">
                <span>{f.detail}</span>
                <SourceLink href={f.sourceUrl}>{f.source}</SourceLink>
              </span>
            }
          />
        ))}
      </div>

      {/* CRM KPIs */}
      <motion.div variants={fadeUp} className="mb-2 flex items-center gap-2">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">Export desk today</h2>
        <DemoBadge />
      </motion.div>
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Weighted pipeline" accent="sky" icon={<TrendingUp className="h-5 w-5" />} value={<AnimatedNumber value={weighted} format={(n) => usd(n, true)} />} detail={`${openDeals.length} open deals`} />
        <StatTile label="Active buyers" accent="teal" icon={<Users className="h-5 w-5" />} value={<AnimatedNumber value={activeBuyers} />} detail={`${buyers.length} accounts in CRM`} />
        <StatTile label="Shipments moving" accent="orange" icon={<Ship className="h-5 w-5" />} value={<AnimatedNumber value={moving} />} detail={`${shipments.length} on the board`} />
        <StatTile label="Documents pending" accent="coral" icon={<FileWarning className="h-5 w-5" />} value={<AnimatedNumber value={docsPending} />} detail="Across open shipments" />
      </div>

      <motion.section variants={fadeUp} className="card mb-6 p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="flex items-center gap-2 font-bold text-md-navy-900">
              <Radar className="h-4 w-4 text-md-sky" /> Opportunities to act on
            </h3>
            <p className="text-xs text-slate-500">Highest-scoring product × market pairs right now</p>
          </div>
          <Link to="/opportunities" className="text-xs font-semibold text-md-sky-ink hover:underline">
            Open Opportunity Spotter →
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {topOpps.map((o, i) => (
            <motion.div key={o.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }} className="flex items-center gap-3 rounded-xl p-3 ring-1 ring-slate-200">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold text-white" style={{ background: scoreColor(Math.max(o.score, 55)) }}>
                {o.score}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-slate-800">
                  {o.product.emoji} {o.product.name}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  {o.country.flag} {o.country.name}
                  <span className={`chip ${OPP_TYPE_META[o.type].cls}`}>{OPP_TYPE_META[o.type].label}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <div className="grid gap-4 xl:grid-cols-3">
        <motion.section variants={fadeUp} className="card p-5 xl:col-span-2">
          <div className="mb-1 flex items-center justify-between">
            <h3 className="font-bold text-md-navy-900">Monthly export value by region</h3>
            <span className="text-xs text-slate-400">USD thousands · last 12 months</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MONTHLY_EXPORTS} margin={{ top: 10, right: 8, left: -12, bottom: 0 }}>
                <CartesianGrid stroke="#eef2f6" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 8px 24px -12px rgba(15,47,80,.25)', fontSize: 12 }}
                  itemStyle={{ color: '#334155', padding: 0 }}
                  formatter={(v, name) => [`$${v}k`, name]}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 8 }} formatter={(value) => <span className="text-slate-600">{value}</span>} />
                {REGION_SERIES.map((r, i) => (
                  <Area key={r.key} type="monotone" dataKey={r.key} name={r.label} stackId="1" stroke={CHART_COLORS[i]} strokeWidth={1.5} fill={CHART_COLORS[i]} fillOpacity={0.85} animationDuration={1200} />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.section>

        <motion.section variants={fadeUp} className="card p-5">
          <div className="mb-1 flex items-center justify-between">
            <h3 className="font-bold text-md-navy-900">Pipeline by stage</h3>
            <Link to="/crm" className="text-xs font-semibold text-md-sky-ink hover:underline">
              Open CRM
            </Link>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stageData} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 0 }} barCategoryGap={6}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="stage" width={88} tickLine={false} axisLine={false} tick={{ fill: '#475569', fontSize: 12 }} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: 12, fontSize: 12 }} formatter={(v, _n, p) => [`$${Math.round(Number(v))}k · ${p.payload.count} deals`, 'Value']} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} animationDuration={1000}>
                  {stageData.map((s) => (
                    <Cell key={s.stage} fill={s.stage === 'Won' ? CHART_COLORS[2] : CHART_COLORS[0]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.section>

        <motion.section variants={fadeUp} className="card p-5">
          <h3 className="mb-3 font-bold text-md-navy-900">Top markets by account value</h3>
          <ul className="space-y-3">
            {marketTotals.map(([code, value]) => {
              const c = countryByCode(code)
              return (
                <li key={code}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-semibold text-slate-700">
                      {c?.flag} {c?.name}
                    </span>
                    <span className="font-bold tabular-nums text-md-navy-900">{usd(value, true)}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <motion.div className="h-full rounded-full bg-md-sky" initial={{ width: 0 }} whileInView={{ width: `${(value / maxMarket) * 100}%` }} viewport={{ once: true }} transition={{ duration: 0.9 }} />
                  </div>
                </li>
              )
            })}
          </ul>
        </motion.section>

        <motion.section variants={fadeUp} className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-bold text-md-navy-900">Upcoming follow-ups</h3>
            <CalendarClock className="h-4 w-4 text-slate-400" />
          </div>
          <ul className="divide-y divide-slate-100">
            {upcoming.map((a) => {
              const b = buyers.find((x) => x.id === a.partnerId)
              return (
                <li key={a.id} className="flex items-start gap-3 py-2.5">
                  <Circle className="mt-0.5 h-4 w-4 shrink-0 text-md-sky" />
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-slate-800">{a.subject}</div>
                    <div className="text-xs text-slate-500">
                      {date(a.date)} · {b?.name ?? a.owner}
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        </motion.section>

        <motion.section variants={fadeUp} className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-bold text-md-navy-900">Shipments</h3>
            <Link to="/shipments" className="text-xs font-semibold text-md-sky-ink hover:underline">
              View all
            </Link>
          </div>
          <ul className="space-y-2.5">
            {shipments.slice(0, 5).map((s) => {
              const c = countryByCode(s.country)
              const done = s.docs.filter((d) => d.done).length
              return (
                <li key={s.id} className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2">
                  <span className="text-xl">{c?.flag}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <span className="font-bold text-slate-800">{s.id}</span>
                      <span className="text-xs font-semibold text-md-sky-ink">{s.status}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      {s.pol} → {s.pod}
                      {done === s.docs.length ? <CheckCircle2 className="ml-auto h-3.5 w-3.5 text-emerald-600" /> : <span className="ml-auto">{done}/{s.docs.length} docs</span>}
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        </motion.section>
      </div>

      <motion.section variants={fadeUp} className="card mt-6 flex flex-col items-start justify-between gap-4 p-5 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-md-sky-50 p-2.5 text-md-sky-ink">
            <Handshake className="h-6 w-6" />
          </div>
          <div>
            <div className="font-bold text-md-navy-900">Export enquiries</div>
            <div className="text-sm text-slate-500">
              {COMPANY.exportOffice.address} · {COMPANY.exportOffice.phone}
            </div>
          </div>
        </div>
        <a href={`mailto:${COMPANY.exportOffice.email}`} className="btn-primary">
          {COMPANY.exportOffice.email}
        </a>
      </motion.section>
    </>
  )
}
