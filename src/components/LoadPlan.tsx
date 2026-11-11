import { motion } from 'motion/react'
import { Container, Gift, Snowflake } from 'lucide-react'
import { CONTAINERS, TIERS, type planBasket } from '../lib/pricing'

type Plan = ReturnType<typeof planBasket>

/** Container fill meters plus the volume-tier ladder, nudging buyers toward full loads. */
export default function LoadPlan({ plan, compact = false }: { plan: Plan; compact?: boolean }) {
  if (!plan.groups.length) return null
  return (
    <div className="space-y-3">
      {plan.groups.map((g) => {
        const Icon = g.kind === 'reefer' ? Snowflake : Container
        return (
          <div key={g.kind}>
            <div className="mb-1 flex items-center justify-between text-xs font-semibold text-slate-600">
              <span className="flex items-center gap-1.5">
                <Icon className={`h-3.5 w-3.5 ${g.kind === 'reefer' ? 'text-sky-600' : 'text-slate-500'}`} />
                {g.containers} × {CONTAINERS[g.kind].label}
              </span>
              <span className="tabular-nums">
                {Math.round(g.kg).toLocaleString()} kg · {(g.equiv * 100).toFixed(0)}%
              </span>
            </div>
            <div className="flex gap-1">
              {Array.from({ length: Math.max(1, g.containers) }).map((_, i) => {
                const fill = i < g.containers - 1 ? 1 : g.fill || 1
                return (
                  <div key={i} className="h-3 flex-1 overflow-hidden rounded-[4px] bg-slate-100 ring-1 ring-slate-200">
                    <motion.div
                      className={`h-full ${g.kind === 'reefer' ? 'bg-sky-500' : 'bg-md-orange'}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${fill * 100}%` }}
                      transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                    />
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

      {!compact && (
        <div className="flex gap-1">
          {TIERS.map((t) => {
            const active = t.label === plan.tier.label
            return (
              <div key={t.label} className={`flex-1 rounded-lg px-2 py-1.5 text-center text-[10px] font-semibold ring-1 transition ${active ? 'bg-md-teal/15 text-md-teal-ink ring-md-teal' : 'bg-white text-slate-400 ring-slate-200'}`}>
                <div className="text-xs font-extrabold">{t.discount ? `−${t.discount * 100}%` : 'List'}</div>
                {t.label}
              </div>
            )
          })}
        </div>
      )}

      {plan.next && (
        <motion.div key={plan.next.label} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800 ring-1 ring-amber-200">
          <Gift className="h-4 w-4 shrink-0" />
          Add ~{plan.kgToNext.toLocaleString()} kg to unlock {plan.next.discount * 100}% off ({plan.next.label})
        </motion.div>
      )}
    </div>
  )
}
