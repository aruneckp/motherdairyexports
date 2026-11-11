import { animate, AnimatePresence, motion, useInView, useMotionValue, useTransform } from 'motion/react'
import { ExternalLink, FlaskConical, X } from 'lucide-react'
import { useEffect, useRef, type ReactNode } from 'react'

export const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 260, damping: 26 } },
}

export const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
}: {
  eyebrow?: string
  title: string
  subtitle?: ReactNode
  actions?: ReactNode
}) {
  return (
    <motion.div variants={fadeUp} className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {eyebrow && <div className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-md-sky-ink">{eyebrow}</div>}
        <h1 className="text-2xl font-extrabold tracking-tight text-md-navy-900 sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 max-w-3xl text-sm text-slate-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </motion.div>
  )
}

export function AnimatedNumber({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  format,
}: {
  value: number
  prefix?: string
  suffix?: string
  decimals?: number
  format?: (n: number) => string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const mv = useMotionValue(0)
  const text = useTransform(mv, (v) =>
    format ? format(v) : prefix + v.toLocaleString('en-IN', { maximumFractionDigits: decimals, minimumFractionDigits: decimals }) + suffix,
  )
  useEffect(() => {
    if (!inView) return
    const controls = animate(mv, value, { duration: 1.2, ease: [0.16, 1, 0.3, 1] })
    return () => controls.stop()
  }, [inView, value, mv])
  return <motion.span ref={ref}>{text}</motion.span>
}

export function StatTile({
  label,
  value,
  detail,
  icon,
  accent = 'sky',
}: {
  label: string
  value: ReactNode
  detail?: ReactNode
  icon?: ReactNode
  accent?: 'sky' | 'teal' | 'orange' | 'coral' | 'navy'
}) {
  const accents = {
    sky: 'from-md-sky/15 text-md-sky-ink',
    teal: 'from-md-teal/20 text-md-teal-ink',
    orange: 'from-md-orange/20 text-amber-700',
    coral: 'from-md-coral/20 text-rose-600',
    navy: 'from-md-navy/15 text-md-navy',
  }
  return (
    <motion.div variants={fadeUp} whileHover={{ y: -3 }} className="card relative overflow-hidden p-4">
      <div className={`pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br to-transparent ${accents[accent]}`} />
      <div className="flex items-start justify-between gap-2">
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div>
        {icon && <div className={accents[accent].split(' ')[1]}>{icon}</div>}
      </div>
      <div className="mt-2 text-2xl font-extrabold tracking-tight text-md-navy-900 tabular-nums sm:text-3xl">{value}</div>
      {detail && <div className="mt-1 text-xs text-slate-500">{detail}</div>}
    </motion.div>
  )
}

export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
  id,
}: {
  tabs: { id: T; label: ReactNode }[]
  value: T
  onChange: (v: T) => void
  id: string
}) {
  return (
    <div className="scrollbar-thin inline-flex max-w-full gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`relative whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
            value === t.id ? 'text-md-navy-900' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          {value === t.id && (
            <motion.span layoutId={`tab-${id}`} className="absolute inset-0 rounded-lg bg-white shadow-sm" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />
          )}
          <span className="relative">{t.label}</span>
        </button>
      ))}
    </div>
  )
}

export function Drawer({ open, onClose, title, children, width = 'max-w-xl' }: { open: boolean; onClose: () => void; title: ReactNode; children: ReactNode; width?: string }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="fixed inset-0 z-50 bg-md-navy-900/30 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.aside
            role="dialog"
            aria-modal="true"
            className={`fixed inset-y-0 right-0 z-50 flex w-full ${width} flex-col bg-white shadow-2xl`}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
          >
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
              <div className="min-w-0 text-lg font-bold text-md-navy-900">{title}</div>
              <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="scrollbar-thin flex-1 overflow-y-auto p-5">{children}</div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: ReactNode; children: ReactNode }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-md-navy-900/40 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            className="scrollbar-thin max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div className="text-lg font-bold text-md-navy-900">{title}</div>
              <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function SourceLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[11px] font-semibold text-md-sky-ink hover:underline">
      {children} <ExternalLink className="h-3 w-3" />
    </a>
  )
}

export function DemoBadge() {
  return (
    <span className="chip bg-violet-50 text-violet-700 ring-1 ring-violet-200" title="Sample records: replace with your live buyer/supplier master data">
      <FlaskConical className="h-3 w-3" /> Demo data
    </span>
  )
}

export function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-xs font-bold text-amber-600" aria-label={`Rating ${value} of 5`}>
      ★ {value.toFixed(1)}
    </span>
  )
}

export function Progress({ value, color = 'bg-md-sky' }: { value: number; color?: string }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
      <motion.div className={`h-full rounded-full ${color}`} initial={{ width: 0 }} animate={{ width: `${Math.min(100, value)}%` }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }} />
    </div>
  )
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      {children}
    </label>
  )
}
