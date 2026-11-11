/// <reference types="vite/client" />

/** Login settings baked in at build time from APP_USERNAME / APP_PASSWORD (see vite.config.ts). */
declare const __AUTH_CONFIG__: {
  user: string
  salt: string
  iterations: number
  hash: string
  hours: number
} | null
