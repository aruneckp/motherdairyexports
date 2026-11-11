import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import { createAuthHandler } from './server/auth.ts'

// Serves the login API on `npm run dev` and `npm run preview`.
// .env is re-read on every request, so credential changes apply without a restart.
function auth(): Plugin {
  let envDir = process.cwd()
  let mode = 'development'
  const handler = createAuthHandler(() => loadEnv(mode, envDir, ''))
  return {
    name: 'md-auth',
    configResolved(config) {
      envDir = typeof config.envDir === 'string' ? config.envDir : config.root
      mode = config.mode
    },
    configureServer(server) {
      server.middlewares.use(handler)
    },
    configurePreviewServer(server) {
      server.middlewares.use(handler)
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), auth()],
})
