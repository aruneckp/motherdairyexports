import { createHash, pbkdf2Sync } from 'node:crypto'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

const ITERATIONS = 210_000

// The app is hosted as static files, so the login is checked in the browser. Only a salted
// PBKDF2 hash of APP_PASSWORD is baked into the bundle, never the password itself.
function authConfig(env: Record<string, string>) {
  const user = env.APP_USERNAME?.trim()
  const password = env.APP_PASSWORD
  if (!user || !password) return null
  const salt = createHash('sha256').update(`md-exports:${user.toLowerCase()}`).digest('hex').slice(0, 32)
  return {
    user,
    salt,
    iterations: ITERATIONS,
    hash: pbkdf2Sync(password, salt, ITERATIONS, 32, 'sha256').toString('hex'),
    hours: Number(env.SESSION_HOURS) > 0 ? Number(env.SESSION_HOURS) : 12,
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // '' prefix: also reads APP_* from the host's environment (e.g. Render build env vars)
  const auth = authConfig(loadEnv(mode, process.cwd(), ''))
  if (!auth) console.warn('\nAPP_USERNAME / APP_PASSWORD are not set, so nobody can sign in. See .env.example.\n')
  return {
    plugins: [react(), tailwindcss()],
    define: { __AUTH_CONFIG__: JSON.stringify(auth) },
  }
})
