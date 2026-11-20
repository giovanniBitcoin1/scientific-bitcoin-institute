import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { isPublishedSource } from './src/lib/newsroom-core.js'
import { originFromCname } from './src/lib/site.js'

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

// Insights content (src/content/dispatch, lens, insights): a file that is not
// "status: published" is replaced by an empty string before it is bundled, so
// no draft text can reach dist/. A production build never includes drafts. The
// dev server shows them only when started with "npm run dev:drafts", which
// sets NEWSROOM_DRAFTS=1.
const CONTENT_FILE = /\/src\/content\/(dispatch|lens|insights)\/[^/]+\.md\?/
const SERIES_OF_FOLDER = { dispatch: 'dispatch', lens: 'lens', insights: 'explainer' }

function newsroomDrafts(showDrafts) {
  return {
    name: 'newsroom-drafts',
    enforce: 'pre',
    load(id) {
      const match = id.replace(/\\/g, '/').match(CONTENT_FILE)
      if (!match) return null
      const file = id.split('?')[0]
      // Templates (_name.md) are never content.
      if (file.split(/[\\/]/).pop().startsWith('_')) return 'export default ""'
      const raw = readFileSync(file, 'utf8')
      return showDrafts || isPublishedSource(SERIES_OF_FOLDER[match[1]], raw) ? null : 'export default ""'
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  const showDrafts = command === 'serve' && process.env.NEWSROOM_DRAFTS === '1'
  return {
    plugins: [newsroomDrafts(showDrafts), react()],
    // base: '/' is correct for a custom domain (scientificbitcoininstitute.org).
    // If you ever deploy to username.github.io/repo-name instead, change to '/repo-name/'.
    base: '/',
    define: {
      __SBIG_JS_HASH__: JSON.stringify(assetHash('public/sbi-event-globe/sbi-event-globe.js')),
      __SBIG_CSS_HASH__: JSON.stringify(assetHash('public/sbi-event-globe/sbi-event-globe.css')),
      // The site origin, from public/CNAME: used for canonical and share URLs.
      __SITE_ORIGIN__: JSON.stringify(originFromCname(readFileSync('public/CNAME', 'utf8'))),
      __NEWSROOM_DRAFTS__: JSON.stringify(showDrafts),
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
    },
  }
})
