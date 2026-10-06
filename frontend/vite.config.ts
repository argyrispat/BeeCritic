import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = path.dirname(fileURLToPath(import.meta.url))

/** Baseline headers for the Vite SPA. Production hosts should set equivalent (stricter) headers. */
const securityHeaders: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  // Dev CSP allows Vite HMR + Google Fonts + TMDB images. Tighten for production static hosting.
  'Content-Security-Policy':
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com data:; " +
    "img-src 'self' data: blob: https://image.tmdb.org; " +
    "connect-src 'self' http://localhost:* http://127.0.0.1:* ws://localhost:* ws://127.0.0.1:*; " +
    "frame-ancestors 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self'",
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(rootDir, './src'),
    },
  },
  server: {
    host: true,
    port: 5173,
    headers: securityHeaders,
    watch: {
      usePolling: true,
      interval: 300,
    },
    proxy: {
      '/api': {
        target: process.env.VITE_API_PROXY_TARGET || 'http://localhost:5080',
        changeOrigin: true,
      },
    },
  },
  preview: {
    headers: securityHeaders,
  },
})
