// Reads the Insights content from disk for the Node scripts. The parsing is
// the site's own (src/lib/newsroom-core.js).
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  DISPATCH, LENS, EXPLAINER, BUILDERS, byNumberDesc, byDateDesc, isIgnoredFile, modifiedOf,
} from '../../../src/lib/newsroom-core.js'
import { originFromCname } from '../../../src/lib/site.js'

export const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')

// Folder of each series under <root>/src/content.
export const CONTENT_DIR = { [DISPATCH]: 'dispatch', [LENS]: 'lens', [EXPLAINER]: 'insights' }

export const posix = (p) => p.split(path.sep).join('/')

// Every markdown file of the three series: { series, file (path relative to
// root, forward slashes), abs, raw }. Templates ("_name.md") are left out.
export function readContentFiles(root = REPO) {
  const out = []
  for (const series of [DISPATCH, LENS, EXPLAINER]) {
    const dir = path.join(root, 'src', 'content', CONTENT_DIR[series])
    if (!existsSync(dir)) continue
    for (const name of readdirSync(dir).sort()) {
      if (!name.endsWith('.md') || isIgnoredFile(name)) continue
      const abs = path.join(dir, name)
      out.push({ series, file: posix(path.relative(root, abs)), abs, raw: readFileSync(abs, 'utf8') })
    }
  }
  return out
}

// The pieces as the site sees them. Drafts are left out unless asked for.
export function loadPieces(root = REPO, { includeDrafts = false } = {}) {
  const pieces = readContentFiles(root)
    .map((f) => ({ ...BUILDERS[f.series](f.file, f.raw), file: f.file }))
    .filter((p) => includeDrafts || p.status === 'published')
    .map((p) => ({ ...p, modified: modifiedOf(p), isDraft: p.status !== 'published' }))
  const dispatches = pieces.filter((p) => p.series === DISPATCH).sort(byNumberDesc)
  const lens = pieces.filter((p) => p.series === LENS).sort(byDateDesc)
  const explainers = pieces.filter((p) => p.series === EXPLAINER).sort(byDateDesc)
  return { dispatches, lens, explainers, all: [...dispatches, ...lens, ...explainers] }
}

export const siteOrigin = (root = REPO) => originFromCname(readFileSync(path.join(root, 'public', 'CNAME'), 'utf8'))

// Where the media of a Dispatch issue or Lens piece live on disk.
export const mediaDir = (root, series, slug) => path.join(root, 'public', 'insights-media', series, slug)

// Where the images of an Explainer live on disk.
export const explainerDir = (root, slug) => path.join(root, 'src', 'content', 'insights', slug)

// node script.mjs <positional…> [--name value] [--flag]
export function parseArgs(argv = process.argv.slice(2)) {
  const pos = []
  const opt = {}
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a.startsWith('--')) {
      const next = argv[i + 1]
      if (next === undefined || next.startsWith('--')) opt[a.slice(2)] = true
      else opt[a.slice(2)] = argv[++i]
    } else pos.push(a)
  }
  return { pos, opt }
}
