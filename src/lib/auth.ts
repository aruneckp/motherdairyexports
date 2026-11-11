import { create } from 'zustand'

// Session state for the login gate. The server owns the credentials and the HttpOnly
// session cookie (see server/auth.ts); the browser only asks who is signed in.

type Status = 'checking' | 'signed-in' | 'signed-out'

interface AuthState {
  status: Status
  user: string | null
  check: () => Promise<void>
  /** Resolves to an error message, or null on success. */
  login: (username: string, password: string) => Promise<string | null>
  logout: () => Promise<void>
}

export const useAuth = create<AuthState>()((set) => ({
  status: 'checking',
  user: null,

  async check() {
    try {
      const res = await fetch('/api/auth/session', { credentials: 'same-origin' })
      const data = res.ok ? await res.json() : null
      set(data?.user ? { status: 'signed-in', user: data.user } : { status: 'signed-out', user: null })
    } catch {
      set({ status: 'signed-out', user: null })
    }
  },

  async login(username, password) {
    let res: Response
    try {
      res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ username, password }),
      })
    } catch {
      return 'Can’t reach the sign-in service. Check that the server is running.'
    }
    const data = await res.json().catch(() => ({}))
    if (res.ok && data.user) {
      set({ status: 'signed-in', user: data.user })
      return null
    }
    if (res.status === 429) return `Too many attempts. Try again in ${data.retryInMin ?? 15} min.`
    if (res.status === 503) return 'Sign-in isn’t set up yet. Ask your administrator to set APP_USERNAME and APP_PASSWORD in .env.'
    if (res.status === 401)
      return data.attemptsLeft > 0 && data.attemptsLeft <= 2
        ? `Incorrect username or password. ${data.attemptsLeft} attempt${data.attemptsLeft > 1 ? 's' : ''} left.`
        : 'Incorrect username or password.'
    return 'Sign-in failed. Please try again.'
  },

  async logout() {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' }).catch(() => {})
    set({ status: 'signed-out', user: null })
  },
}))

/** Only same-site paths, so a crafted ?next= link can't send people elsewhere after sign-in. */
export const safeNext = (next: string | null) => (next && next.startsWith('/') && !next.startsWith('//') && !next.startsWith('/login') ? next : '/')
