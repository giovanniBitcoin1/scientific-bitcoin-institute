import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Files under public/ are copied verbatim, so Vite never fingerprints them and
// a deployed browser keeps serving the cached copy after we ship a change. The
// event globe's engine and stylesheet are loaded by URL at runtime, so we stamp
// each one with a short hash of its own contents and append it as ?v=. The hash
// moves only when the file really changes, so caches stay warm between deploys
// — and unlike a hand-bumped version number it cannot be forgotten.
// Read once when the config loads: restart the dev server after editing them.
function assetHash(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex').slice(0, 8)
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // base: '/' is correct for a custom domain (scientificbitcoininstitute.org).
  // If you ever deploy to username.github.io/repo-name instead, change to '/repo-name/'.
  base: '/',
  define: {
    __SBIG_JS_HASH__: JSON.stringify(assetHash('public/sbi-event-globe/sbi-event-globe.js')),
    __SBIG_CSS_HASH__: JSON.stringify(assetHash('public/sbi-event-globe/sbi-event-globe.css')),
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
})
