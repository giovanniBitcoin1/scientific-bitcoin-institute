import { createHash } from 'node:crypto'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
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

// Insights content. Two guarantees, both needed so that nothing unpublished
// reaches dist/:
//
// 1. Dispatch issues and Lens pieces are not imported with import.meta.glob
//    (whose keys would put every file name, drafts included, in the bundle).
//    The site imports "virtual:newsroom-content" instead, which this plugin
//    builds from the files that say "status: published" — and only those.
// 2. Explainers (src/content/insights) are still globbed by
//    src/lib/insights.js; a template (_name.md) or a file marked
//    "status: draft" is replaced by an empty string before it is bundled.
//
// A production build never includes drafts. The dev server shows them only
// when started with "npm run dev:drafts", which sets NEWSROOM_DRAFTS=1.
const VIRTUAL_ID = 'virtual:newsroom-content'
const RESOLVED_ID = '\0' + VIRTUAL_ID
const EXPLAINER_FILE = /\/src\/content\/insights\/[^/]+\.md\?/
const NEWSROOM_FILE = /\/src\/content\/(dispatch|lens)\/[^/]+\.md$/

function readSeries(series, showDrafts) {
  const dir = path.resolve('src/content', series)
  const out = {}
  if (!existsSync(dir)) return out
  for (const name of readdirSync(dir).sort()) {
    if (!name.endsWith('.md') || name.startsWith('_')) continue
    const raw = readFileSync(path.join(dir, name), 'utf8')
    if (showDrafts || isPublishedSource(series, raw)) out[name] = raw
  }
  return out
}

function newsroomContent(showDrafts) {
  return {
    name: 'newsroom-content',
    enforce: 'pre',
    resolveId(id) {
      return id === VIRTUAL_ID ? RESOLVED_ID : null
    },
    load(id) {
      if (id === RESOLVED_ID) {
        return (
          'export const dispatch = ' + JSON.stringify(readSeries('dispatch', showDrafts)) + '\n' +
          'export const lens = ' + JSON.stringify(readSeries('lens', showDrafts)) + '\n'
        )
      }
      if (!EXPLAINER_FILE.test(id.split('\\').join('/'))) return null
      const file = id.split('?')[0]
      if (path.basename(file).startsWith('_')) return 'export default ""'
      return showDrafts || isPublishedSource('explainer', readFileSync(file, 'utf8')) ? null : 'export default ""'
    },
    // Dev server: an edited, added or removed issue or piece reloads the page.
    configureServer(server) {
      const refresh = (file) => {
        if (!NEWSROOM_FILE.test(file.split('\\').join('/'))) return
        const mod = server.moduleGraph.getModuleById(RESOLVED_ID)
        if (mod) server.moduleGraph.invalidateModule(mod)
        server.ws.send({ type: 'full-reload' })
      }
      server.watcher.on('add', refresh)
      server.watcher.on('unlink', refresh)
      server.watcher.on('change', refresh)
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  const showDrafts = command === 'serve' && process.env.NEWSROOM_DRAFTS === '1'
  return {
    plugins: [newsroomContent(showDrafts), react()],
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
