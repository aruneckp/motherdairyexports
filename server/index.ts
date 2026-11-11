import { createReadStream, existsSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, join, normalize, resolve, sep } from 'node:path'
import { createAuthHandler } from './auth.ts'

// Production server: serves the built app from dist/ plus the login API.
// Reads .env if present; otherwise uses the host's environment variables.
try {
  process.loadEnvFile()
} catch {
  // no .env file
}

const dist = resolve(import.meta.dirname, '../dist')
const port = Number(process.env.PORT ?? 4173)
const auth = createAuthHandler(() => process.env)

const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
}

if (!existsSync(join(dist, 'index.html'))) {
  console.error('dist/ not found. Run `npm run build` first.')
  process.exit(1)
}
if (!process.env.APP_USERNAME || !process.env.APP_PASSWORD) {
  console.warn('APP_USERNAME / APP_PASSWORD are not set, so nobody can sign in. See .env.example.')
}

createServer((req, res) => {
  auth(req, res, () => {
    let path = '/'
    try {
      path = decodeURIComponent((req.url ?? '/').split('?')[0])
    } catch {
      // malformed URL: fall through to the app shell
    }
    let file = normalize(join(dist, path))
    // unknown paths and anything outside dist/ get the app shell (client-side routing)
    if (!file.startsWith(dist + sep) || !existsSync(file) || statSync(file).isDirectory()) file = join(dist, 'index.html')
    res.setHeader('Content-Type', TYPES[extname(file)] ?? 'application/octet-stream')
    res.setHeader('Cache-Control', file.includes(`${sep}assets${sep}`) ? 'public, max-age=31536000, immutable' : 'no-cache')
    createReadStream(file).pipe(res)
  })
}).listen(port, () => console.log(`Mother Dairy Global Exports on http://localhost:${port}`))
