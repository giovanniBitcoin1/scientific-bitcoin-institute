// Shared helpers for the headless lab checks. See README.md.
//
// Admin mode is entered by storing the public adminHash from
// src/data/lab/config.json in localStorage. The passphrase is never needed,
// and the hash is never printed: nothing here logs it.
import puppeteer from 'puppeteer-core'
import http from 'node:http'
import { existsSync, readFileSync, statSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const HERE = path.dirname(fileURLToPath(import.meta.url))
export const REPO = path.resolve(HERE, '../../..')
export const SHOTS = path.join(HERE, 'screenshots')
export const WIDTHS = [1280, 375]
export const LANGS = ['en', 'it']

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// ---------------------------------------------------------------- Arguments
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

// ---------------------------------------------------------------- Lab data
// Where each lab keeps its module list and its lecture markdown. Add a line
// here when a lab is added to src/data/lab/registry.js.
const LAB_FILES = {
  complexity: { modules: 'src/data/lab/modules.json', content: 'src/content/lab' },
  network: { modules: 'src/data/lab/network-modules.json', content: 'src/content/network-lab' },
}

const readJson = (rel) => JSON.parse(readFileSync(path.join(REPO, rel), 'utf8'))

export async function loadLab(id) {
  const files = LAB_FILES[id]
  if (!files) throw new Error(`Unknown lab "${id}". Known: ${Object.keys(LAB_FILES).join(', ')}`)
  const { LAB_PATHS } = await import(new URL('../../../src/data/lab/paths.js', import.meta.url))
  // The lab's name, read from the registry source (the registry imports JSON
  // the Vite way, so Node cannot import it directly).
  const registry = readFileSync(path.join(REPO, 'src/data/lab/registry.js'), 'utf8')
  const block = registry.slice(registry.indexOf(`id: '${id}'`))
  const name = block.match(/name: '([^']+)'/)[1]
  const modules = readJson(files.modules)
  return {
    id,
    name,
    basePath: LAB_PATHS[id],
    paths: LAB_PATHS,
    modules,
    ready: modules.filter((m) => m.status === 'ready'),
    partIds: [...new Set(modules.map((m) => m.part).filter(Boolean))],
    // First "## " heading of the lecture: proof that the lecture is on the page.
    lectureHeading(slug, lang) {
      const file = path.join(REPO, files.content, `${slug}.${lang}.md`)
      if (!existsSync(file)) return null
      const m = readFileSync(file, 'utf8').match(/^##\s+(.+)$/m)
      return m ? m[1].trim() : null
    },
  }
}

export const allLabIds = () => Object.keys(LAB_FILES)

const config = () => readJson('src/data/lab/config.json')
export const labsLocked = () => !!config().locked
// Used only to set localStorage; never returned to callers that print.
const adminHash = () => config().adminHash

// Site copy the checks look for.
export const COPY = {
  lock: { en: 'Content reserved for subscribers', it: 'Contenuto riservato agli abbonati' },
  lockText: {
    en: (name) => `Unlock the lectures and interactive simulations of the ${name}.`,
    it: (name) => `Sblocca le lezioni e le simulazioni interattive del ${name}.`,
  },
  bar: { en: 'Admin preview — visitors see the locked Lab', it: 'Anteprima admin — i visitatori vedono il Lab bloccato' },
  lockAgain: { en: 'Lock again', it: 'Blocca di nuovo' },
  wrong: { en: 'Not recognised.', it: 'Non riconosciuta.' },
  notAvailable: { en: 'Module not available', it: 'Modulo non disponibile' },
  showSolution: 'Show solution|Mostra soluzione',
  hideSolution: 'Hide solution|Nascondi soluzione',
  computing: 'Computing…|Calcolo in corso…',
}

// ---------------------------------------------------------------- Static server
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml',
}

// Serves a built site (a `dist` folder) on a free local port, with the
// single-page fallback to index.html. Resolves to { url, close }.
export function serveDist(dir) {
  const root = path.resolve(dir)
  if (!existsSync(path.join(root, 'index.html')))
    throw new Error(`No index.html in ${root}. Build the site first (npx vite build).`)
  const server = http.createServer((req, res) => {
    let rel
    try {
      rel = decodeURIComponent(new URL(req.url, 'http://x').pathname)
    } catch {
      rel = '/'
    }
    let file = path.join(root, rel)
    if (!file.startsWith(root)) file = root
    if (existsSync(file) && statSync(file).isDirectory()) file = path.join(file, 'index.html')
    if (!existsSync(file) || !statSync(file).isFile()) {
      // A missing asset is a real 404; anything else is a client-side route.
      if (path.extname(rel)) {
        res.writeHead(404)
        res.end('Not found')
        return
      }
      file = path.join(root, 'index.html')
    }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream' })
    res.end(readFileSync(file))
  })
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address()
      resolve({ url: `http://127.0.0.1:${port}`, close: () => new Promise((r) => server.close(r)) })
    })
  })
}

// The site under test: --base <url> (a server you started yourself), or
// --dist <dir> (default: the repo's dist/), served by serveDist.
export async function siteFromArgs(opt) {
  if (typeof opt.base === 'string') return { url: opt.base.replace(/\/$/, ''), close: async () => {} }
  return serveDist(typeof opt.dist === 'string' ? path.resolve(opt.dist) : path.join(REPO, 'dist'))
}

// ---------------------------------------------------------------- Browser
const CHROME_CANDIDATES = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
]

// --chrome <path>, then the CHROME_PATH environment variable, then the usual places.
export function chromePath(opt = {}) {
  const chosen = (typeof opt.chrome === 'string' && opt.chrome) || process.env.CHROME_PATH
  if (chosen) {
    if (!existsSync(chosen)) throw new Error(`Chrome not found at ${chosen}`)
    return chosen
  }
  const found = CHROME_CANDIDATES.find((p) => existsSync(p))
  if (!found) throw new Error('Chrome not found. Pass --chrome <path> or set CHROME_PATH.')
  return found
}

export const launch = (opt = {}) => puppeteer.launch({ executablePath: chromePath(opt), headless: true })

// Console errors that only exist on localhost and say nothing about the site:
// an embedded third-party app whose frame-ancestors policy allows only the
// production domain.
const NOISE = /violates the following Content Security Policy directive: "frame-ancestors/

// A page that records console errors and requests, with the lab language set
// and, when `admin`, the admin preview switched on.
export async function newPage(ctx, { width, lang = 'en', admin = false, touch = false }) {
  const page = await ctx.newPage()
  await page.setViewport({ width, height: 900, hasTouch: touch, isMobile: touch })
  page.errors = []
  page.reqs = []
  page.on('console', (m) => m.type() === 'error' && !NOISE.test(m.text()) && page.errors.push(m.text()))
  page.on('pageerror', (e) => page.errors.push(String(e)))
  page.on('request', (r) => page.reqs.push(r.url()))
  await page.evaluateOnNewDocument(
    (l, h) => {
      localStorage.setItem('sbi_lab_lang', l)
      if (h) localStorage.setItem('sbi_lab_admin', h)
    },
    lang,
    admin ? adminHash() : null,
  )
  return page
}

// Sets the admin flag once (not on every load), so "Lock again" can be tested.
// The page must already be on the site's origin.
export async function setAdminOnce(page, lang) {
  await page.evaluate(
    (l, h) => {
      localStorage.setItem('sbi_lab_lang', l)
      localStorage.setItem('sbi_lab_admin', h)
    },
    lang,
    adminHash(),
  )
}

export async function go(page, url, wait = 1200) {
  await page.goto(url, { waitUntil: 'networkidle0' })
  await sleep(wait)
}

export const bodyText = (page) => page.evaluate(() => document.body.innerText)
// Case-insensitive "contains": some labels are upper-cased by CSS.
export const has = (text, needle) => text.toLowerCase().includes(needle.toLowerCase())
export const occurrences = (text, needle) => text.toLowerCase().split(needle.toLowerCase()).length - 1
export const noHScroll = (page) => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
export const count = (page, sel) => page.$$eval(sel, (a) => a.length)
export const jsRequests = (page) => [
  ...new Set(page.reqs.filter((u) => /\.js(\?|$)/.test(u)).map((u) => u.split('/').pop())),
]

// Elements of <main> sticking out of the viewport (outside scrollable boxes).
export const overflowing = (page) =>
  page.evaluate(() =>
    [...document.querySelectorAll('main *')]
      .filter((e) => e.getBoundingClientRect().right > window.innerWidth + 1 && !e.closest('.overflow-x-auto'))
      .slice(0, 5)
      .map((e) => e.tagName + '.' + String(e.className).slice(0, 50)),
  )

// Waits until running experiments are done and the layout has stopped moving.
export async function settle(page, rounds = 40) {
  let last = -1
  for (let i = 0; i < rounds; i++) {
    await sleep(700)
    const s = await page.evaluate(
      (re) => ({ h: document.documentElement.scrollHeight, busy: new RegExp(re).test(document.body.innerText) }),
      COPY.computing,
    )
    if (!s.busy && s.h === last) return
    last = s.h
  }
}

// Returns swipe(x, y): a finger dragged upwards from (x, y + 60); resolves to
// how far the page scrolled. Needs a page created with touch: true.
export async function makeSwipe(page) {
  await page.bringToFront()
  const client = await page.createCDPSession()
  return async (x, y) => {
    const y0 = await page.evaluate(() => window.scrollY)
    await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y: y + 60 }] })
    for (let i = 1; i <= 10; i++) {
      await client.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y + 60 - 15 * i }] })
      await sleep(16)
    }
    await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    await sleep(400)
    return (await page.evaluate(() => window.scrollY)) - y0
  }
}

// ---------------------------------------------------------------- Reporting
export function reporter() {
  const lines = []
  return {
    ok(name, cond, extra = '') {
      lines.push(`${cond ? 'PASS' : 'FAIL'}  ${name}${!cond && extra ? '  ' + extra : ''}`)
      return !!cond
    },
    info(text) {
      lines.push(`INFO  ${text}`)
    },
    // Prints the lines (with --quiet only failures and notes) and returns the
    // number of failures, to be used as the exit code.
    finish({ quiet = false } = {}) {
      const fails = lines.filter((l) => l.startsWith('FAIL'))
      const checks = lines.filter((l) => !l.startsWith('INFO'))
      console.log((quiet ? lines.filter((l) => !l.startsWith('PASS')) : lines).join('\n'))
      console.log(`\n${fails.length} failures of ${checks.length} checks`)
      return fails.length
    },
  }
}

export function shotPath(name) {
  mkdirSync(SHOTS, { recursive: true })
  return path.join(SHOTS, name)
}
