import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import type { IncomingMessage, ServerResponse } from 'node:http'

/**
 * Login API shared by the Vite dev/preview server and the production server.
 * Credentials live in server-side env vars (no VITE_ prefix), so they never reach the browser bundle.
 *
 *   POST /api/auth/login    { username, password } -> sets an HttpOnly session cookie
 *   GET  /api/auth/session  -> { user }, with user null when signed out
 *   POST /api/auth/logout   -> clears the cookie
 */

export interface AuthEnv {
  APP_USERNAME?: string
  APP_PASSWORD?: string
  SESSION_SECRET?: string
  SESSION_HOURS?: string
}

type Next = (err?: unknown) => void

const COOKIE = 'md_session'
const MAX_ATTEMPTS = 5
const LOCK_MS = 15 * 60_000
// Without SESSION_SECRET, sessions are signed with a per-process key and end when the server restarts
const fallbackSecret = randomBytes(32).toString('hex')
const failures = new Map<string, { count: number; until: number }>()

const digest = (s: string) => createHash('sha256').update(s).digest()
const same = (a: string, b: string) => timingSafeEqual(digest(a), digest(b))

// The key includes the credentials, so changing the password in .env signs everyone out
const signingKey = (env: AuthEnv) => `${env.SESSION_SECRET || fallbackSecret}:${env.APP_USERNAME}:${env.APP_PASSWORD}`
const sign = (data: string, env: AuthEnv) => createHmac('sha256', signingKey(env)).update(data).digest('base64url')

function issueToken(user: string, env: AuthEnv) {
  const hours = Number(env.SESSION_HOURS) > 0 ? Number(env.SESSION_HOURS) : 12
  const payload = Buffer.from(JSON.stringify({ u: user, exp: Date.now() + hours * 3_600_000 })).toString('base64url')
  return { token: `${payload}.${sign(payload, env)}`, maxAge: Math.round(hours * 3600) }
}

function verifyToken(token: string | undefined, env: AuthEnv): string | null {
  if (!token) return null
  const [payload, sig] = token.split('.')
  if (!payload || !sig || !same(sig, sign(payload, env))) return null
  try {
    const { u, exp } = JSON.parse(Buffer.from(payload, 'base64url').toString())
    return typeof u === 'string' && typeof exp === 'number' && exp > Date.now() ? u : null
  } catch {
    return null
  }
}

function readCookie(req: IncomingMessage, name: string) {
  for (const part of (req.headers.cookie ?? '').split(';')) {
    const [k, ...v] = part.trim().split('=')
    if (k === name) return v.join('=')
  }
  return undefined
}

function cookie(req: IncomingMessage, value: string, maxAge: number) {
  const secure = req.headers['x-forwarded-proto'] === 'https' || ('encrypted' in req.socket && req.socket.encrypted)
  return `${COOKIE}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure ? '; Secure' : ''}`
}

function send(res: ServerResponse, status: number, body: object, setCookie?: string) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Cache-Control', 'no-store')
  if (setCookie) res.setHeader('Set-Cookie', setCookie)
  res.end(JSON.stringify(body))
}

function readJson(req: IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve) => {
    let raw = ''
    req.on('data', (chunk) => {
      raw += chunk
      if (raw.length > 10_000) req.destroy()
    })
    req.on('end', () => {
      try {
        resolve(JSON.parse(raw || '{}'))
      } catch {
        resolve({})
      }
    })
    req.on('error', () => resolve({}))
  })
}

export function createAuthHandler(getEnv: () => AuthEnv) {
  return async (req: IncomingMessage, res: ServerResponse, next: Next) => {
    const path = (req.url ?? '').split('?')[0]
    if (!path.startsWith('/api/auth/')) return next()
    try {
      const env = getEnv()
      const configured = !!env.APP_USERNAME && !!env.APP_PASSWORD

      if (path === '/api/auth/session' && req.method === 'GET') {
        const user = configured ? verifyToken(readCookie(req, COOKIE), env) : null
        // 200 either way, so a signed-out check doesn't log a console error
        return send(res, 200, { user, configured })
      }

      if (path === '/api/auth/logout' && req.method === 'POST') {
        return send(res, 200, { ok: true }, cookie(req, '', 0))
      }

      if (path === '/api/auth/login' && req.method === 'POST') {
        if (!configured) return send(res, 503, { error: 'not-configured' })

        const ip = req.socket.remoteAddress ?? 'unknown'
        const f = failures.get(ip)
        if (f && f.count >= MAX_ATTEMPTS && f.until > Date.now()) {
          return send(res, 429, { error: 'locked', retryInMin: Math.ceil((f.until - Date.now()) / 60_000) })
        }

        const body = await readJson(req)
        const username = typeof body.username === 'string' ? body.username.trim() : ''
        const password = typeof body.password === 'string' ? body.password : ''
        // compare both so a wrong username takes as long as a wrong password
        const userOk = same(username.toLowerCase(), env.APP_USERNAME!.trim().toLowerCase())
        const passOk = same(password, env.APP_PASSWORD!)
        if (!userOk || !passOk) {
          const count = f && f.until > Date.now() ? f.count + 1 : 1
          failures.set(ip, { count, until: Date.now() + LOCK_MS })
          return send(res, 401, { error: 'invalid', attemptsLeft: Math.max(0, MAX_ATTEMPTS - count) })
        }

        failures.delete(ip)
        const user = env.APP_USERNAME!.trim()
        const { token, maxAge } = issueToken(user, env)
        return send(res, 200, { user }, cookie(req, token, maxAge))
      }

      send(res, 404, { error: 'not-found' })
    } catch (err) {
      next(err)
    }
  }
}
