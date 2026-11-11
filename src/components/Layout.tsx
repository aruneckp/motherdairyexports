import { AnimatePresence, motion } from 'motion/react'
import {
  BadgeCheck,
  Calculator,
  Contact,
  Factory,
  Globe2,
  LogOut,
  LayoutDashboard,
  Mail,
  Menu,
  Package,
  Presentation,
  Radar,
  RotateCcw,
  Search,
  Ship,
  ShieldCheck,
  ShoppingBasket,
  Store,
  UserCircle2,
  Users,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { NavLink, useLocation, useNavigate, useOutlet } from 'react-router-dom'
import { COMPANY } from '../data/company'
import { useAuth } from '../lib/auth'
import { useStore } from '../store/useStore'

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { section: 'Grow exports' },
  { to: '/opportunities', label: 'Opportunity Spotter', icon: Radar },
  { to: '/showcase', label: 'Buyer Showcase', icon: Store },
  { to: '/pitch', label: 'Pitch Studio', icon: Presentation },
  { section: 'Markets' },
  { to: '/map', label: 'Global Trade Map', icon: Globe2 },
  { to: '/catalog', label: 'Export Catalog', icon: Package },
  { to: '/compliance', label: 'Compliance & Access', icon: ShieldCheck },
  { to: '/calculator', label: 'Landed Cost Estimator', icon: Calculator },
  { section: 'Manage' },
  { to: '/crm', label: 'CRM Pipeline', icon: Contact },
  { to: '/partners', label: 'Buyers & Suppliers', icon: Users },
  { to: '/shipments', label: 'Shipments', icon: Ship },
  { to: '/network', label: 'Plants & Certifications', icon: Factory },
] as const

export function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex flex-col items-center justify-center rounded-xl bg-white px-2.5 py-1.5 shadow-sm ring-1 ring-white/60">
        <span className="text-[15px] font-black leading-none tracking-tight text-md-sky">MOTHER</span>
        <span className="mt-0.5 w-full border-t border-md-sky/40 pt-0.5 text-center text-[9px] font-extrabold leading-none tracking-[0.3em] text-md-sky">DAIRY</span>
      </div>
      {!compact && (
        <div className="leading-tight">
          <div className="text-sm font-extrabold text-white">Global Exports</div>
          <div className="text-[11px] font-medium text-sky-100">Trade · Compliance · CRM</div>
        </div>
      )}
    </div>
  )
}

function SideNav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-0.5">
      {NAV.map((item) => {
        if ('section' in item)
          return (
            <div key={item.section} className="mt-4 px-3 pb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-sky-100/70">
              {item.section}
            </div>
          )
        const { to, label, icon: Icon } = item
        return (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          onClick={onNavigate}
          className={({ isActive }) =>
            `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
              isActive ? 'text-md-navy-900' : 'text-sky-50/90 hover:bg-white/10 hover:text-white'
            }`
          }
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <motion.span layoutId="nav-active" className="absolute inset-0 rounded-xl bg-white shadow-md" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />
              )}
              <Icon className={`relative h-[18px] w-[18px] shrink-0 ${isActive ? 'text-md-sky' : 'text-sky-100'}`} />
              <span className="relative">{label}</span>
              {to === '/pitch' && <BasketCount active={isActive} />}
            </>
          )}
        </NavLink>
        )
      })}
    </nav>
  )
}

function BasketCount({ active }: { active: boolean }) {
  const n = useStore((s) => s.basket.length)
  if (!n) return null
  return (
    <motion.span key={n} initial={{ scale: 0.5 }} animate={{ scale: 1 }} className={`relative ml-auto flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${active ? 'bg-md-sky text-white' : 'bg-white text-md-sky-ink'}`}>
      <ShoppingBasket className="h-3 w-3" /> {n}
    </motion.span>
  )
}

function SidebarFooter() {
  const resetDemo = useStore((s) => s.resetDemo)
  const toast = useStore((s) => s.toast)
  const { user, logout } = useAuth()
  return (
    <div className="mt-auto space-y-3 pt-6">
      <div className="flex items-center gap-2 rounded-2xl bg-white/10 p-2 pl-3 ring-1 ring-white/15">
        <UserCircle2 className="h-5 w-5 shrink-0 text-sky-100" />
        <div className="min-w-0 flex-1 leading-tight">
          <div className="text-[10px] font-bold uppercase tracking-wide text-sky-100/80">Signed in as</div>
          <div className="truncate text-sm font-bold text-white">{user}</div>
        </div>
        <button onClick={logout} className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-white hover:bg-white/15" title="Sign out">
          <LogOut className="h-3.5 w-3.5" /> Sign out
        </button>
      </div>
      <div className="rounded-2xl bg-white/10 p-3 text-xs text-sky-50 ring-1 ring-white/15">
        <div className="mb-1 flex items-center gap-1.5 font-bold text-white">
          <BadgeCheck className="h-4 w-4 text-md-teal" /> Export desk
        </div>
        <a href={`mailto:${COMPANY.exportOffice.email}`} className="flex items-center gap-1.5 hover:underline">
          <Mail className="h-3.5 w-3.5" /> {COMPANY.exportOffice.email}
        </a>
        <div className="mt-1 text-sky-100/80">A-3, Sector-1, Noida</div>
      </div>
      <button
        onClick={() => {
          resetDemo()
          toast('Demo CRM data restored')
        }}
        className="flex w-full items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-sky-100 hover:bg-white/10"
      >
        <RotateCcw className="h-3.5 w-3.5" /> Reset demo data
      </button>
    </div>
  )
}

function GlobalSearch() {
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        navigate(`/catalog?q=${encodeURIComponent(q)}`)
      }}
      className="relative w-full max-w-md"
    >
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products, HS codes…" className="input rounded-full! pl-9" aria-label="Search catalogue" />
    </form>
  )
}

/** Freezes the outlet so the exiting page keeps rendering its own content during the exit animation. */
function FrozenOutlet() {
  const outlet = useOutlet()
  const [frozen] = useState(outlet)
  return frozen
}

function Toasts() {
  const toasts = useStore((s) => s.toasts)
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex flex-col items-end gap-2">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40 }}
            className="flex items-center gap-2 rounded-xl bg-md-navy-900 px-4 py-2.5 text-sm font-semibold text-white shadow-xl"
          >
            <BadgeCheck className="h-4 w-4 text-md-teal" /> {t.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

export default function Layout() {
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [location.pathname])

  return (
    <div className="print-reset min-h-screen lg:pl-72">
      {/* Desktop sidebar */}
      <aside className="no-print fixed inset-y-0 left-0 z-40 hidden w-72 flex-col overflow-y-auto bg-gradient-to-b from-md-sky via-[#0592d2] to-md-navy px-4 py-5 lg:flex">
        <div className="mb-6 px-1">
          <Wordmark />
        </div>
        <SideNav />
        <SidebarFooter />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div className="fixed inset-0 z-40 bg-black/30 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileOpen(false)} />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col overflow-y-auto bg-gradient-to-b from-md-sky to-md-navy px-4 py-5 lg:hidden"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 340, damping: 34 }}
            >
              <div className="mb-6 flex items-center justify-between px-1">
                <Wordmark />
                <button onClick={() => setMobileOpen(false)} className="rounded-lg p-1 text-white hover:bg-white/10" aria-label="Close menu">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <SideNav onNavigate={() => setMobileOpen(false)} />
              <SidebarFooter />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <header className="no-print sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1400px] items-center gap-3 px-4 py-3 sm:px-6">
          <button onClick={() => setMobileOpen(true)} className="rounded-lg p-2 text-md-navy hover:bg-slate-100 lg:hidden" aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
          <GlobalSearch />
          <div className="ml-auto hidden items-center gap-2 sm:flex">
            <span className="chip bg-md-sky-50 text-md-sky-ink">Mother Dairy</span>
            <span className="chip bg-emerald-50 text-emerald-700">Safal</span>
            <span className="chip bg-amber-50 text-amber-700">Dhara</span>
          </div>
        </div>
      </header>

      <main className="print-reset mx-auto max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8">
        <AnimatePresence mode="wait">
          <motion.div key={location.pathname} initial="hidden" animate="show" exit={{ opacity: 0, y: -8, transition: { duration: 0.15 } }} variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}>
            <FrozenOutlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="no-print border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-2 px-4 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span>
            © {new Date().getFullYear()} {COMPANY.legalName} · {COMPANY.parent}
          </span>
          <span>
            Export office: {COMPANY.exportOffice.phone} · {COMPANY.exportOffice.email}
          </span>
        </div>
      </footer>
      <Toasts />
    </div>
  )
}
