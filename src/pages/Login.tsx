import { motion, useAnimate } from 'motion/react'
import { ArrowRight, Eye, EyeOff, Loader2, Lock, ShieldCheck, User } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { Navigate, useSearchParams } from 'react-router-dom'
import { Wordmark } from '../components/Layout'
import { COMPANY, FACTS } from '../data/company'
import { num } from '../lib/format'
import { safeNext, useAuth } from '../lib/auth'

// Decorative trade lanes from India (origin) to a few destination regions
const ORIGIN = { x: 250, y: 190 }
const LANES = [
  { x: 120, y: 92 }, // Europe
  { x: 200, y: 150 }, // Gulf
  { x: 40, y: 120 }, // Americas
  { x: 330, y: 230 }, // SE Asia
  { x: 370, y: 300 }, // Australia
  { x: 175, y: 290 }, // Africa
]
const lanePath = (to: { x: number; y: number }) => {
  const mx = (ORIGIN.x + to.x) / 2
  const my = Math.min(ORIGIN.y, to.y) - Math.abs(ORIGIN.x - to.x) * 0.35 - 20
  return `M${ORIGIN.x},${ORIGIN.y} Q${mx},${my} ${to.x},${to.y}`
}

export default function Login() {
  const { status, check, login } = useAuth()
  const [params] = useSearchParams()
  const next = safeNext(params.get('next'))
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [scope, animate] = useAnimate()

  useEffect(() => {
    if (status === 'checking') check()
  }, [status, check])

  if (status === 'signed-in') return <Navigate to={next} replace />

  const fail = (msg: string) => {
    setError(msg)
    animate(scope.current, { x: [0, -10, 10, -6, 6, 0] }, { duration: 0.4 })
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!username.trim() || !password) return fail('Enter your username and password.')
    setBusy(true)
    setError(null)
    const err = await login(username, password)
    setBusy(false)
    if (err) {
      setPassword('')
      fail(err)
    }
  }

  return (
    <div className="grid min-h-screen bg-md-cream lg:grid-cols-[1.1fr_1fr]">
      {/* Brand panel */}
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-md-sky via-[#0592d2] to-md-navy p-10 text-white lg:flex lg:flex-col">
        <Wordmark />
        <svg viewBox="0 0 420 340" className="pointer-events-none absolute inset-x-0 top-24 mx-auto w-[85%] opacity-90" aria-hidden>
          {LANES.map((to, i) => (
            <g key={i}>
              <motion.path
                d={lanePath(to)}
                fill="none"
                stroke="white"
                strokeOpacity={0.55}
                strokeWidth={1.4}
                strokeDasharray="3 4"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.4, delay: 0.3 + i * 0.15, ease: 'easeOut' }}
              />
              <motion.circle cx={to.x} cy={to.y} r={4} fill="#33CCAA" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.3 + i * 0.15 }} />
              <circle r={2.5} fill="white">
                <animateMotion dur={`${3 + i * 0.4}s`} begin={`${1.6 + i * 0.2}s`} repeatCount="indefinite" path={lanePath(to)} />
              </circle>
            </g>
          ))}
          <circle cx={ORIGIN.x} cy={ORIGIN.y} r={7} fill="#F66753" stroke="white" strokeWidth={2} />
          <motion.circle cx={ORIGIN.x} cy={ORIGIN.y} r={7} fill="none" stroke="white" initial={{ scale: 1, opacity: 0.8 }} animate={{ scale: 3, opacity: 0 }} transition={{ duration: 2, repeat: Infinity }} />
        </svg>

        <div className="relative mt-auto">
          <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-md text-4xl font-black leading-tight">
            India’s dairy and Safal produce, shipped to the world.
          </motion.h1>
          <p className="mt-3 max-w-md text-sky-100">Opportunities, proposals, compliance, CRM and shipments for the export team in one place.</p>
          <div className="mt-8 grid max-w-lg grid-cols-3 gap-3">
            {FACTS.filter((f) => f.label !== 'Milk procured daily').map((f, i) => (
              <motion.div key={f.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.1 }} className="rounded-2xl bg-white/10 p-3 ring-1 ring-white/15">
                <div className="text-xl font-black">
                  {f.prefix}
                  {num(f.value)}
                  {f.suffix}
                </div>
                <div className="text-xs text-sky-100">{f.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </aside>

      {/* Sign-in form */}
      <main className="flex flex-col">
        <div className="bg-gradient-to-r from-md-sky to-md-navy px-5 py-4 lg:hidden">
          <Wordmark />
        </div>
        <div className="flex flex-1 items-center justify-center px-5 py-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 26 }} className="w-full max-w-sm">
            <div className="mb-6">
              <div className="text-xs font-bold uppercase tracking-widest text-md-sky-ink">Export portal</div>
              <h2 className="mt-1 text-3xl font-black text-md-navy-900">Sign in</h2>
              <p className="mt-1 text-sm text-slate-500">Use the account your administrator gave you.</p>
            </div>

            <form ref={scope} onSubmit={submit} className="card space-y-4 p-6" noValidate>
              <div>
                <label htmlFor="username" className="label">
                  Username
                </label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input id="username" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" autoFocus className="input pl-9" />
                </div>
              </div>
              <div>
                <label htmlFor="password" className="label">
                  Password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="password"
                    type={show ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    className="input px-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShow((s) => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:text-slate-600"
                    aria-label={show ? 'Hide password' : 'Show password'}
                  >
                    {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-700 ring-1 ring-red-200">
                  {error}
                </motion.p>
              )}

              <button type="submit" disabled={busy} className="btn-primary w-full justify-center disabled:opacity-70">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                {busy ? 'Signing in…' : 'Sign in'}
              </button>
            </form>

            <p className="mt-5 flex items-start gap-2 text-xs text-slate-500">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-md-teal-ink" />
              <span>
                Need access? Contact the export desk at{' '}
                <a href={`mailto:${COMPANY.exportOffice.email}`} className="font-semibold text-md-sky-ink hover:underline">
                  {COMPANY.exportOffice.email}
                </a>
                .
              </span>
            </p>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
