// Shared helpers for the headless Insights checks. See README.md.
// Same approach as the lab checks on the network-lab branch: puppeteer-core
// driving the Chrome already installed, and a tiny static server.
import puppeteer from 'puppeteer-core'
import http from 'node:http'
import { existsSync, readFileSync, statSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const HERE = path.dirname(fileURLToPath(import.meta.url))
export const REPO = path.resolve(HERE, '../../..')
export const SHOTS = path.join(HERE, 'screenshots')

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

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

// Serves a built site the way GitHub Pages does:
//   - a file is served as it is;
//   - a directory with an index.html answers 200 on "/dir/" and 301 to "/dir/"
//     on "/dir";
//   - anything else answers 404 with the body of 404.html (which, on this
//     site, redirects the browser to the single-page app).
// There is NO fallback to index.html: a route without a static file must go
// through 404.html here exactly as it does in production.
// Resolves to { url, close, log } where log lists [status, path] pairs.
export function servePages(dir) {
  const root = path.resolve(dir)
  if (!existsSync(path.join(root, 'index.html')))
    throw new Error(`No index.html in ${root}. Build the site first (npm run build).`)
  const log = []
  const server = http.createServer((req, res) => {
    let rel
    try {
      rel = decodeURIComponent(new URL(req.url, 'http://x').pathname)
    } catch {
      rel = '/'
    }
    const query = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : ''
    const send = (status, file, headers = {}) => {
      log.push([status, rel])
      res.writeHead(status, {
        'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream',
        ...headers,
      })
      res.end(readFileSync(file))
    }
    let file = path.join(root, rel)
    if (!file.startsWith(root)) file = root
    const isDir = existsSync(file) && statSync(file).isDirectory()
    if (isDir && existsSync(path.join(file, 'index.html'))) {
      if (!rel.endsWith('/')) {
        log.push([301, rel])
        res.writeHead(301, { Location: `${rel}/${query}` })
        res.end()
        return
      }
      send(200, path.join(file, 'index.html'))
      return
    }
    if (!isDir && existsSync(file)) {
      send(200, file)
      return
    }
    const notFound = path.join(root, '404.html')
    if (existsSync(notFound)) send(404, notFound)
    else {
      log.push([404, rel])
      res.writeHead(404)
      res.end('Not found')
    }
  })
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address()
      resolve({ url: `http://127.0.0.1:${port}`, log, close: () => new Promise((r) => server.close(r)) })
    })
  })
}

// --base <url> (a server you started yourself), or --dist <dir> (default: the
// repo's dist/), served by servePages.
export async function siteFromArgs(opt) {
  if (typeof opt.base === 'string') return { url: opt.base.replace(/\/$/, ''), log: [], close: async () => {} }
  return servePages(typeof opt.dist === 'string' ? path.resolve(opt.dist) : path.join(REPO, 'dist'))
}

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

export const launch = (opt = {}) =>
  puppeteer.launch({ executablePath: chromePath(opt), headless: true, args: ['--no-sandbox'] })

// Console errors that exist only on localhost and say nothing about the site:
// an embedded third-party frame whose policy allows only the production
// domain, and the 404 status of the page that carries the SPA redirect.
const NOISE = [
  /violates the following Content Security Policy directive: "frame-ancestors/,
]

// A page that records console errors, page errors and failed requests.
export async function newPage(ctx, { width = 1280, height = 900 } = {}) {
  const page = await ctx.newPage()
  await page.setViewport({ width, height })
  page.errors = []
  page.on('console', (m) => {
    if (m.type() !== 'error') return
    const text = m.text()
    if (NOISE.some((re) => re.test(text))) return
    page.errors.push(text)
  })
  page.on('pageerror', (e) => page.errors.push(String(e)))
  return page
}

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
