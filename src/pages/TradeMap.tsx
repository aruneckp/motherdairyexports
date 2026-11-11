import { AnimatePresence, motion } from 'motion/react'
import { Anchor, Clock, Factory, FileText, Handshake, Info, Landmark, MapPin, Minus, Plus, ShieldCheck, Ship, Users } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import GeoMap, { type MapArc, type MapMarker } from '../components/GeoMap'
import { PageHeader, Tabs } from '../components/ui'
import { COUNTRIES, REGIONS, ruleFor } from '../data/countries'
import { PLANTS, PORTS } from '../data/plants'
import { PRODUCTS, categoryName } from '../data/products'
import type { Country, Plant, Supplier } from '../data/types'
import { INDIA_FILL, REGION_COLOR, RULE_STYLE, usd } from '../lib/format'
import { computeOpportunities, scoreColor } from '../lib/opportunity'
import { useTopology } from '../lib/useTopology'
import { useStore } from '../store/useStore'


const PLANT_COLOR: Record<Plant['type'], string> = {
  dairy: '#0089C8',
  safal: '#1E9E80',
  dhara: '#D9700A',
  office: '#184A7C',
  port: '#3D6FB5',
}

const SUPPLIER_TARGET: Record<Supplier['type'], string> = {
  'Milk Pool / MPO': 'junagadh',
  'Fruit & Vegetable Cluster': 'bengaluru',
  Oilseeds: 'dhara-network',
  Spices: 'mangolpuri',
  Packaging: 'bengaluru',
  'Logistics / Cold Chain': 'jnpt',
}

const PLANT_PORT: Record<string, string> = {
  junagadh: 'mundra',
  patparganj: 'jnpt',
  mangolpuri: 'jnpt',
  bengaluru: 'chennai',
  ranchi: 'kolkata',
  mumbai: 'jnpt',
  'dhara-network': 'mundra',
}

// Short map labels where the full name would collide with a neighbour
const MAP_LABEL: Record<string, string> = {
  mangolpuri: 'Delhi NCR (3 sites)',
  'dhara-network': 'Dhara network',
  jnpt: 'Mumbai / JNPT',
  mundra: 'Mundra',
  kolkata: 'Kolkata',
  chennai: 'Chennai',
}

// Bengaluru, Kuppam and Chennai sit on one line; spread their labels apart
const LABEL_SIDE: Record<string, MapMarker['labelSide']> = {
  bengaluru: 'left',
  kuppam: 'below',
}

type View = 'world' | 'india'
type ColorBy = 'region' | 'access' | 'opportunity'

export default function TradeMap() {
  const [view, setView] = useState<View>('world')
  return (
    <>
      <PageHeader
        eyebrow="Map of information"
        title="Global Trade Map"
        subtitle="Destination markets, trade lanes and market-access status worldwide, plus the plant, port and sourcing network inside India."
        actions={
          <Tabs
            id="mapview"
            value={view}
            onChange={setView}
            tabs={[
              { id: 'world', label: 'World markets' },
              { id: 'india', label: 'India network' },
            ]}
          />
        }
      />
      <AnimatePresence mode="wait">
        <motion.div key={view} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
          {view === 'world' ? <WorldView /> : <IndiaView />}
        </motion.div>
      </AnimatePresence>
      <p className="mt-4 flex items-center gap-1.5 text-[11px] text-slate-400">
        <Info className="h-3.5 w-3.5" /> Map is illustrative and not to scale; boundaries shown are indicative only. Duties are planning figures — confirm against the destination tariff schedule.
      </p>
    </>
  )
}

function WorldView() {
  const topo = useTopology('110m')
  const { buyers, deals, shipments } = useStore()
  const [colorBy, setColorBy] = useState<ColorBy>('region')
  const [productId, setProductId] = useState(PRODUCTS[0].id)
  const [region, setRegion] = useState<string>('all')
  const [selected, setSelected] = useState<Country | null>(null)
  const [zoomK, setZoomK] = useState(1)

  const product = PRODUCTS.find((p) => p.id === productId)!
  const visible = COUNTRIES.filter((c) => region === 'all' || c.region === region)

  const oppScores = useMemo(() => {
    const m = new Map<string, number>()
    computeOpportunities(buyers)
      .filter((o) => o.product.id === productId)
      .forEach((o) => m.set(o.country.code, o.score))
    return m
  }, [buyers, productId])

  const colorFor = (c: Country) => {
    if (colorBy === 'region') return REGION_COLOR[c.region]
    if (colorBy === 'opportunity') return oppScores.has(c.code) ? scoreColor(oppScores.get(c.code)!) : '#cbd5e1'
    return RULE_STYLE[ruleFor(c, product.category).level].fill
  }

  const fills: Record<string, string> = { ...Object.fromEntries(visible.map((c) => [c.isoNum, colorFor(c)])), '356': INDIA_FILL }

  const jnpt = PORTS[0]
  const arcs: MapArc[] = visible.map((c) => ({ id: c.code, from: jnpt.coords, to: c.coords, color: colorFor(c), dashed: colorBy === 'access' && ruleFor(c, product.category).level === 'restricted' }))
  const markers: MapMarker[] = [
    ...visible.map((c) => {
      const accts = buyers.filter((b) => b.country === c.code).length
      return {
        id: c.code,
        coords: c.coords,
        color: colorFor(c),
        label: c.name,
        size: 4 + Math.min(accts, 3),
        pulse: accts > 0,
        tooltip: (
          <div>
            <div className="font-bold">
              {c.flag} {c.name}
            </div>
            <div className="text-sky-100">
              {c.port} · {c.transitDays} days
            </div>
            <div className="text-sky-100">{accts} buyer account(s)</div>
          </div>
        ),
      }
    }),
    { id: 'india', coords: jnpt.coords, color: '#184A7C', label: 'Nhava Sheva (JNPT)', size: 6, shape: 'diamond' as const },
  ]

  const select = (code: string) => {
    const c = COUNTRIES.find((x) => x.code === code || x.isoNum === code)
    if (!c) return
    setSelected(c)
    setZoomK(2.2)
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_380px]">
      <div className="card overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-3">
          <Tabs
            id="colorby"
            value={colorBy}
            onChange={setColorBy}
            tabs={[
              { id: 'region', label: 'By region' },
              { id: 'access', label: 'By market access' },
              { id: 'opportunity', label: 'By opportunity' },
            ]}
          />
          {colorBy !== 'region' && (
            <select value={productId} onChange={(e) => setProductId(e.target.value)} className="input w-auto! py-1.5" aria-label="Product">
              {PRODUCTS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          )}
          <select value={region} onChange={(e) => setRegion(e.target.value)} className="input w-auto! py-1.5" aria-label="Region">
            <option value="all">All regions</option>
            {REGIONS.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
          <div className="ml-auto flex items-center gap-1">
            <button className="btn-ghost px-2! py-1.5!" onClick={() => setZoomK((k) => Math.max(1, k - 0.6))} aria-label="Zoom out">
              <Minus className="h-4 w-4" />
            </button>
            <button className="btn-ghost px-2! py-1.5!" onClick={() => setZoomK((k) => Math.min(5, k + 0.6))} aria-label="Zoom in">
              <Plus className="h-4 w-4" />
            </button>
            <button
              className="btn-ghost py-1.5!"
              onClick={() => {
                setZoomK(1)
                setSelected(null)
              }}
            >
              Reset
            </button>
          </div>
        </div>
        <div className="relative bg-[#eaf7fd]">
          {topo ? (
            <GeoMap
              topo={topo}
              fills={fills}
              arcs={arcs}
              markers={markers}
              selectedIso={selected?.isoNum}
              selectedMarker={selected?.code}
              onCountryClick={(iso) => select(iso)}
              onMarkerClick={(id) => select(id)}
              zoom={zoomK > 1 ? { center: selected?.coords ?? [60, 25], k: zoomK } : null}
            />
          ) : (
            <div className="aspect-[960/500] animate-pulse bg-sky-50" />
          )}
          <div className="absolute bottom-3 left-3 rounded-xl bg-white/90 p-2.5 text-[11px] shadow-sm backdrop-blur">
            {colorBy === 'opportunity' ? (
              <div className="space-y-1">
                <div className="font-bold text-slate-700">{product.name}: opportunity score</div>
                <div className="flex items-center gap-1.5 font-semibold text-slate-500">
                  Low
                  <span className="flex">
                    {[10, 30, 45, 60, 75, 92].map((s) => (
                      <span key={s} className="h-2.5 w-4" style={{ background: scoreColor(s) }} />
                    ))}
                  </span>
                  High
                </div>
                <span className="flex items-center gap-1.5 font-semibold text-slate-500">
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-300" /> Restricted
                </span>
              </div>
            ) : colorBy === 'region' ? (
              <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                {REGIONS.map((r) => (
                  <span key={r} className="flex items-center gap-1.5 font-semibold text-slate-600">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: REGION_COLOR[r] }} /> {r}
                  </span>
                ))}
              </div>
            ) : (
              <div className="space-y-1">
                <div className="font-bold text-slate-700">{product.name}</div>
                {(['ok', 'conditional', 'restricted'] as const).map((l) => (
                  <span key={l} className="flex items-center gap-1.5 font-semibold text-slate-600">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: RULE_STYLE[l].fill }} /> {RULE_STYLE[l].label}
                    {l === 'restricted' && <span className="text-slate-400">(dashed lane)</span>}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {selected ? (
          <CountryPanel key={selected.code} country={selected} productCategory={product.category} buyers={buyers.filter((b) => b.country === selected.code)} dealsValue={deals.filter((d) => d.country === selected.code && d.stage !== 'Lost').reduce((s, d) => s + d.valueUsd, 0)} shipments={shipments.filter((s) => s.country === selected.code).length} />
        ) : (
          <motion.div key="list" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="card p-4">
            <h3 className="mb-3 font-bold text-md-navy-900">Destination markets ({visible.length})</h3>
            <ul className="scrollbar-thin max-h-[520px] space-y-1 overflow-y-auto pr-1">
              {visible.map((c) => {
                const accts = buyers.filter((b) => b.country === c.code).length
                return (
                  <li key={c.code}>
                    <button onClick={() => select(c.code)} className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left hover:bg-slate-50">
                      <span className="text-2xl">{c.flag}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-slate-800">{c.name}</span>
                        <span className="block text-xs text-slate-500">
                          {c.region} · {c.transitDays} d transit
                        </span>
                      </span>
                      {colorBy === 'opportunity' ? (
                        <span className="chip bg-md-sky-50 tabular-nums text-md-sky-ink">{oppScores.get(c.code) ?? '—'}</span>
                      ) : colorBy === 'access' ? (
                        <span className={`chip ${RULE_STYLE[ruleFor(c, product.category).level].cls}`}>{RULE_STYLE[ruleFor(c, product.category).level].label}</span>
                      ) : (
                        accts > 0 && <span className="chip bg-md-sky-50 text-md-sky-ink">{accts} buyers</span>
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function CountryPanel({ country: c, productCategory, buyers, dealsValue, shipments }: { country: Country; productCategory: Parameters<typeof ruleFor>[1]; buyers: { id: string; name: string; status: string }[]; dealsValue: number; shipments: number }) {
  const rule = ruleFor(c, productCategory)
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="card space-y-4 p-5">
      <div className="flex items-center gap-3">
        <span className="text-4xl">{c.flag}</span>
        <div>
          <h3 className="text-lg font-extrabold text-md-navy-900">{c.name}</h3>
          <div className="text-xs font-semibold text-slate-500">{c.region}</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <Info2 icon={<Anchor className="h-3.5 w-3.5" />} label="Port" value={c.port} />
        <Info2 icon={<Clock className="h-3.5 w-3.5" />} label="Sea transit" value={`~${c.transitDays} days`} />
        <Info2 icon={<Landmark className="h-3.5 w-3.5" />} label="Trade agreement" value={c.tradeAgreement ?? 'MFN'} />
        <Info2 icon={<ShieldCheck className="h-3.5 w-3.5" />} label="Halal" value={c.halalRequired ? 'Mandatory' : 'If claimed'} />
      </div>
      <div className={`rounded-xl p-3 text-xs ${RULE_STYLE[rule.level].cls}`}>
        <div className="mb-0.5 font-bold">
          {categoryName(productCategory)}: {RULE_STYLE[rule.level].label} · duty ~{c.duty[productCategory] ?? '—'}%
        </div>
        {rule.note}
      </div>
      <div className="text-xs">
        <div className="mb-1 font-bold text-slate-700">Import protocol</div>
        <p className="leading-relaxed text-slate-600">{c.protocols}</p>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-slate-50 p-2">
          <Users className="mx-auto h-4 w-4 text-md-sky" />
          <div className="text-lg font-extrabold text-md-navy-900">{buyers.length}</div>
          <div className="text-[10px] font-semibold uppercase text-slate-500">Buyers</div>
        </div>
        <div className="rounded-xl bg-slate-50 p-2">
          <Handshake className="mx-auto h-4 w-4 text-md-teal-ink" />
          <div className="text-lg font-extrabold text-md-navy-900">{usd(dealsValue, true)}</div>
          <div className="text-[10px] font-semibold uppercase text-slate-500">Pipeline</div>
        </div>
        <div className="rounded-xl bg-slate-50 p-2">
          <Ship className="mx-auto h-4 w-4 text-amber-600" />
          <div className="text-lg font-extrabold text-md-navy-900">{shipments}</div>
          <div className="text-[10px] font-semibold uppercase text-slate-500">Shipments</div>
        </div>
      </div>
      {buyers.length > 0 && (
        <ul className="space-y-1 text-sm">
          {buyers.map((b) => (
            <li key={b.id} className="flex justify-between gap-2 rounded-lg bg-white px-2 py-1 ring-1 ring-slate-100">
              <span className="truncate font-semibold text-slate-700">{b.name}</span>
              <span className="shrink-0 text-xs text-slate-500">{b.status}</span>
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-2">
        <Link to={`/compliance?country=${c.code}`} className="btn-primary flex-1">
          <FileText className="h-4 w-4" /> Full regulations
        </Link>
        <Link to={`/calculator?country=${c.code}`} className="btn-ghost flex-1">
          Landed cost
        </Link>
      </div>
    </motion.div>
  )
}

function Info2({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-2.5">
      <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">
        {icon} {label}
      </div>
      <div className="mt-0.5 font-semibold text-slate-800">{value}</div>
    </div>
  )
}

function IndiaView() {
  const topo = useTopology('50m')
  const suppliers = useStore((s) => s.suppliers)
  const [layers, setLayers] = useState({ plants: true, ports: true, suppliers: true, lanes: true })
  const [selected, setSelected] = useState<string | null>('junagadh')

  const all = [...PLANTS, ...PORTS]
  // drawn in order: suppliers first so plants and ports stay clickable over nearby clusters
  const markers: MapMarker[] = [
    ...(layers.suppliers ? suppliers.map((s) => ({ id: s.id, coords: s.coords, color: '#8A9A2E', label: s.name, hideLabel: true, size: 4, shape: 'square' as const })) : []),
    ...(layers.plants
      ? PLANTS.map((p) => ({
          id: p.id,
          coords: p.coords,
          color: PLANT_COLOR[p.type],
          label: MAP_LABEL[p.id] ?? p.city.split(',')[0],
          hideLabel: p.id === 'noida' || p.id === 'patparganj' || p.id === 'mumbai',
          labelSide: LABEL_SIDE[p.id],
          size: 6,
          pulse: p.status === 'operational' && p.type !== 'office',
          muted: p.status === 'planned',
          tooltip: <span className="font-semibold">{p.name}, {p.city}</span>,
        }))
      : []),
    ...(layers.ports ? PORTS.map((p) => ({ id: p.id, coords: p.coords, color: PLANT_COLOR.port, label: MAP_LABEL[p.id] ?? p.name, size: 5, shape: 'diamond' as const })) : []),
  ]
  const arcs: MapArc[] = layers.lanes
    ? [
        ...(layers.suppliers
          ? suppliers.map((s) => ({ id: 's' + s.id, from: s.coords, to: all.find((p) => p.id === SUPPLIER_TARGET[s.type])!.coords, color: '#8A9A2E', width: 1.2 }))
          : []),
        ...Object.entries(PLANT_PORT).map(([plant, port]) => ({
          id: plant + port,
          from: all.find((p) => p.id === plant)!.coords,
          to: all.find((p) => p.id === port)!.coords,
          color: '#184A7C',
          width: 1.4,
          dashed: true,
        })),
      ]
    : []

  const sel = all.find((p) => p.id === selected)
  const selSupplier = suppliers.find((s) => s.id === selected)

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_380px]">
      <div className="card overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 p-3">
          {(
            [
              ['plants', 'Plants & offices'],
              ['ports', 'Export ports'],
              ['suppliers', 'Supplier clusters'],
              ['lanes', 'Supply lanes'],
            ] as const
          ).map(([k, label]) => (
            <button key={k} onClick={() => setLayers((l) => ({ ...l, [k]: !l[k] }))} className={`chip px-3! py-1! text-xs! ring-1 transition ${layers[k] ? 'bg-md-sky text-white ring-md-sky' : 'bg-white text-slate-600 ring-slate-200'}`}>
              {label}
            </button>
          ))}
        </div>
        <div className="relative mx-auto max-w-3xl">
          {topo ? (
            <GeoMap topo={topo} width={700} height={760} bounds={[[67, 7], [97, 35]]} baseFill="#e9eef3" fills={{ '356': '#ffffff' }} markers={markers} arcs={arcs} onMarkerClick={setSelected} selectedMarker={selected} showLabels />
          ) : (
            <div className="aspect-[700/760] animate-pulse bg-sky-50" />
          )}
          <div className="absolute bottom-3 left-3 space-y-1 rounded-xl bg-white/90 p-2.5 text-[11px] font-semibold text-slate-600 shadow-sm backdrop-blur">
            {(
              [
                ['Mother Dairy plant', PLANT_COLOR.dairy, 'rounded-full'],
                ['Safal plant', PLANT_COLOR.safal, 'rounded-full'],
                ['Dhara network', PLANT_COLOR.dhara, 'rounded-full'],
                ['Export port', PLANT_COLOR.port, 'rotate-45'],
                ['Supplier cluster', '#8A9A2E', 'rounded-[2px]'],
              ] as const
            ).map(([l, c, shape]) => (
              <span key={l} className="flex items-center gap-1.5">
                <span className={`h-2.5 w-2.5 ${shape}`} style={{ background: c }} /> {l}
              </span>
            ))}
            <span className="block pt-0.5 text-slate-400">Faded = planned</span>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={selected ?? 'none'} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="card h-fit space-y-4 p-5">
          {sel ? (
            <>
              <div className="flex items-start gap-3">
                <div className="rounded-xl p-2.5 text-white" style={{ background: PLANT_COLOR[sel.type] }}>
                  {sel.type === 'port' ? <Anchor className="h-5 w-5" /> : <Factory className="h-5 w-5" />}
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-md-navy-900">{sel.name}</h3>
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <MapPin className="h-3.5 w-3.5" /> {sel.city}, {sel.state}
                  </div>
                </div>
              </div>
              <span className={`chip ${sel.status === 'operational' ? 'bg-emerald-50 text-emerald-700' : sel.status === 'commissioning' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>{sel.status}</span>
              <p className="text-sm text-slate-600">{sel.summary}</p>
              {sel.certifications.length > 0 && (
                <div>
                  <div className="label">Certifications</div>
                  <div className="flex flex-wrap gap-1">
                    {sel.certifications.map((c) => (
                      <span key={c} className="chip bg-md-sky-50 text-md-sky-ink">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {sel.products.length > 0 && (
                <div>
                  <div className="label">Products</div>
                  <div className="text-sm text-slate-700">{sel.products.join(' · ')}</div>
                </div>
              )}
              {sel.source && (
                <a href={sel.source} target="_blank" rel="noreferrer" className="text-xs font-semibold text-md-sky-ink hover:underline">
                  Source ↗
                </a>
              )}
            </>
          ) : selSupplier ? (
            <>
              <div>
                <span className="chip bg-lime-50 text-lime-800">{selSupplier.type}</span>
                <h3 className="mt-1 text-lg font-extrabold text-md-navy-900">{selSupplier.name}</h3>
                <div className="text-xs text-slate-500">{selSupplier.state}</div>
              </div>
              <div className="text-sm text-slate-700">{selSupplier.supplies.join(' · ')}</div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-xl bg-slate-50 p-2">
                  <div className="text-lg font-extrabold text-md-navy-900">{selSupplier.onTimePct}%</div>On time
                </div>
                <div className="rounded-xl bg-slate-50 p-2">
                  <div className="text-lg font-extrabold text-md-navy-900">{selSupplier.qualityPct}%</div>Quality
                </div>
                <div className="rounded-xl bg-slate-50 p-2">
                  <div className="text-lg font-extrabold text-md-navy-900">{selSupplier.leadTimeDays}d</div>Lead time
                </div>
              </div>
              <Link to="/partners?tab=suppliers" className="btn-ghost w-full">
                Open supplier record
              </Link>
            </>
          ) : (
            <p className="text-sm text-slate-500">Select a plant, port or supplier on the map.</p>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
