import { create } from 'zustand'

// Login gate for static hosting. vite.config.ts bakes a salted PBKDF2 hash of APP_PASSWORD into the
// bundle; the password typed here is hashed the same way and compared. There is no server, so this
// keeps casual visitors out but cannot stop someone editing the page in their browser's dev tools.

type Status = 'checking' | 'signed-in' | 'signed-out'

interface AuthState {
  status: Status
  user: string | null
  check: () => Promise<void>
  /** Resolves to an error message, or null on success. */
  login: (username: string, password: string) => Promise<string | null>
  logout: () => Promise<void>
}

const CONFIG = __AUTH_CONFIG__
const SESSION_KEY = 'md-session'
const FAILURES_KEY = 'md-login-failures'
const MAX_ATTEMPTS = 5
const LOCK_MS = 15 * 60_000

interface Session {
  u: string
  exp: number
  /** Ties the session to the current password, so changing it signs everyone out */
  v: string
}

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function write(key: string, value: unknown) {
  try {
    if (value === null) localStorage.removeItem(key)
    else localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // storage blocked (private mode): the session lasts for this page view only
  }
}

function currentUser() {
  const s = read<Session>(SESSION_KEY)
  return CONFIG && s && s.v === CONFIG.hash.slice(0, 16) && s.exp > Date.now() ? s.u : null
}

async function pbkdf2(password: string, salt: string, iterations: number) {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: enc.encode(salt), iterations }, key, 256)
  return Array.from(new Uint8Array(bits), (b) => b.toString(16).padStart(2, '0')).join('')
}

export const useAuth = create<AuthState>()((set) => ({
  status: 'checking',
  user: null,

  async check() {
    const user = currentUser()
    set(user ? { status: 'signed-in', user } : { status: 'signed-out', user: null })
  },

  async login(username, password) {
    if (!CONFIG) return 'Sign-in isn’t set up yet. Set APP_USERNAME and APP_PASSWORD, then rebuild the app.'
    if (!crypto.subtle) return 'Sign-in needs a secure connection. Open the portal over https:// (or localhost).'

    const f = read<{ count: number; until: number }>(FAILURES_KEY)
    if (f && f.count >= MAX_ATTEMPTS && f.until > Date.now()) return `Too many attempts. Try again in ${Math.ceil((f.until - Date.now()) / 60_000)} min.`

    const hash = await pbkdf2(password, CONFIG.salt, CONFIG.iterations)
    if (username.trim().toLowerCase() !== CONFIG.user.toLowerCase() || hash !== CONFIG.hash) {
      const count = f && f.until > Date.now() ? f.count + 1 : 1
      write(FAILURES_KEY, { count, until: Date.now() + LOCK_MS })
      const left = MAX_ATTEMPTS - count
      return left > 0 && left <= 2 ? `Incorrect username or password. ${left} attempt${left > 1 ? 's' : ''} left.` : 'Incorrect username or password.'
    }

    write(FAILURES_KEY, null)
    write(SESSION_KEY, { u: CONFIG.user, exp: Date.now() + CONFIG.hours * 3_600_000, v: CONFIG.hash.slice(0, 16) } satisfies Session)
    set({ status: 'signed-in', user: CONFIG.user })
    return null
  },

  async logout() {
    write(SESSION_KEY, null)
    set({ status: 'signed-out', user: null })
  },
}))

/** Only same-site paths, so a crafted ?next= link can't send people elsewhere after sign-in. */
export const safeNext = (next: string | null) => (next && next.startsWith('/') && !next.startsWith('//') && !next.startsWith('/login') ? next : '/')
