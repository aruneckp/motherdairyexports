import { motion } from 'motion/react'
import { Anchor, CheckCircle2, ChevronRight, Container, Snowflake } from 'lucide-react'
import { useState } from 'react'
import { DemoBadge, fadeUp, PageHeader, Tabs } from '../components/ui'
import { countryByCode } from '../data/countries'
import { productById } from '../data/products'
import { date, SHIPMENT_FLOW, usd } from '../lib/format'
import { useStore } from '../store/useStore'

type Filter = 'active' | 'all' | 'delivered'

export default function Shipments() {
  const { shipments, buyers, setShipmentStatus, toggleShipmentDoc, toast } = useStore()
  const [filter, setFilter] = useState<Filter>('active')
  const list = shipments.filter((s) => (filter === 'all' ? true : filter === 'delivered' ? s.status === 'Delivered' : s.status !== 'Delivered'))

  return (
    <>
      <PageHeader
        eyebrow="Logistics"
        title="Shipments"
        subtitle={
          <span className="inline-flex flex-wrap items-center gap-2">
            Every container from booking to delivery, with its document checklist and reefer set-point. <DemoBadge />
          </span>
        }
        actions={
          <Tabs
            id="shipf"
            value={filter}
            onChange={setFilter}
            tabs={[
              { id: 'active', label: 'Active' },
              { id: 'delivered', label: 'Delivered' },
              { id: 'all', label: 'All' },
            ]}
          />
        }
      />
      <div className="space-y-4">
        {list.map((s) => {
          const b = buyers.find((x) => x.id === s.buyerId)
          const c = countryByCode(s.country)
          const p = productById(s.productId)
          const idx = SHIPMENT_FLOW.indexOf(s.status)
          const next = SHIPMENT_FLOW[idx + 1]
          const docsDone = s.docs.filter((d) => d.done).length
          return (
            <motion.article key={s.id} variants={fadeUp} layout className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="text-3xl">{c?.flag}</div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-extrabold text-md-navy-900">{s.id}</h3>
                      <span className="chip bg-md-sky-50 text-md-sky-ink">{s.status}</span>
                      {s.tempSetC !== undefined && (
                        <span className="chip bg-sky-100 text-sky-800">
                          <Snowflake className="h-3 w-3" /> {s.tempSetC} °C
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-slate-600">
                      {p?.name} · {s.quantity} · {b?.name}
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Anchor className="h-3 w-3" /> {s.pol} → {s.pod}
                      </span>
                      <span className="flex items-center gap-1">
                        <Container className="h-3 w-3" /> {s.container}
                      </span>
                      <span>
                        ETD {date(s.etd)} · ETA {date(s.eta)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-extrabold tabular-nums text-md-navy-900">{usd(s.valueUsd)}</div>
                  {next && (
                    <button
                      className="btn-primary mt-1 py-1.5!"
                      onClick={() => {
                        setShipmentStatus(s.id, next)
                        toast(`${s.id} → ${next}`)
                      }}
                    >
                      Mark {next} <ChevronRight className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Stepper */}
              <div className="scrollbar-thin mt-5 overflow-x-auto pb-1">
                <div className="relative flex min-w-[640px] justify-between">
                  <div className="absolute left-3 right-3 top-3 h-1 rounded-full bg-slate-100" />
                  <motion.div
                    className="absolute left-3 top-3 h-1 rounded-full bg-gradient-to-r from-md-sky to-md-teal"
                    initial={{ width: 0 }}
                    animate={{ width: `calc(${(idx / (SHIPMENT_FLOW.length - 1)) * 100}% - ${(idx / (SHIPMENT_FLOW.length - 1)) * 24}px)` }}
                    transition={{ type: 'spring', stiffness: 80, damping: 18 }}
                  />
                  {SHIPMENT_FLOW.map((st, i) => (
                    <div key={st} className="relative flex w-20 flex-col items-center text-center">
                      <motion.div
                        animate={{ scale: i === idx ? 1.15 : 1, backgroundColor: i <= idx ? '#00A2E8' : '#ffffff' }}
                        className={`flex h-7 w-7 items-center justify-center rounded-full ring-2 ${i <= idx ? 'text-white ring-md-sky' : 'text-slate-300 ring-slate-200'}`}
                      >
                        {i < idx ? <CheckCircle2 className="h-4 w-4" /> : <span className="text-[11px] font-bold">{i + 1}</span>}
                      </motion.div>
                      <span className={`mt-1 text-[11px] font-semibold ${i <= idx ? 'text-md-navy-900' : 'text-slate-400'}`}>{st}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Docs */}
              <div className="mt-4 rounded-xl bg-slate-50 p-3">
                <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-wide text-slate-500">
                  <span>Documents</span>
                  <span className={docsDone === s.docs.length ? 'text-emerald-700' : 'text-amber-700'}>
                    {docsDone}/{s.docs.length} ready
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {s.docs.map((d) => (
                    <button key={d.name} onClick={() => toggleShipmentDoc(s.id, d.name)} className={`chip px-2.5! py-1! ring-1 transition ${d.done ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : 'bg-white text-slate-600 ring-slate-200 hover:ring-amber-300'}`}>
                      {d.done ? '✓' : '○'} {d.name}
                    </button>
                  ))}
                </div>
              </div>
            </motion.article>
          )
        })}
        {list.length === 0 && <div className="card p-10 text-center text-sm text-slate-500">No shipments in this view.</div>}
      </div>
    </>
  )
}
