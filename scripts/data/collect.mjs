// Public data collector. Keeps a few public series as JSON files, for other
// tools to read from the `data` branch:
//   https://raw.githubusercontent.com/<owner>/<repo>/data/<file>
// Nothing here is used by the site pages. Run hourly by
// .github/workflows/data-collector.yml.
//
//   node scripts/data/collect.mjs --out <dir> [--only <series>] [--self-test]
//
// Node 20 built-in fetch, no dependencies. Each series is independent: when a
// source is down its previous file is kept, the error is recorded in
// status.json and the others go on. Output is deterministic (rows sorted, one
// per line) and incremental: a row older than three days is never rewritten.
//
// Sources were checked live on 2026-11-20. Coin Metrics community data is NOT
// used (non-commercial licence, and its public file stopped on 2026-05-23).
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
export const USER_AGENT = 'sbi-data-collector/1.0 (https://scientificbitcoininstitute.org; public data series, hourly)'
export const DAY = 86400
export const KEEP_DAYS = 3 // rows older than this are never rewritten
export const CROSS_CHECK_PCT = 1.5
const HOURLY_WINDOW_DAYS = 60
const SNAPSHOT_WINDOW_DAYS = 60

// ------------------------------------------------------------ Sources

export const SOURCES = {
  bitstamp: {
    name: 'Bitstamp public market-data API',
    url: 'https://www.bitstamp.net/api/',
    licence: 'No open licence is stated by the source. Public, keyless endpoint; use is subject to the Bitstamp terms of use.',
    attribution: 'Price data: Bitstamp (bitstamp.net).',
  },
  kraken: {
    name: 'Kraken public market-data API',
    url: 'https://docs.kraken.com/api/',
    licence: 'No open licence is stated by the source. Public, keyless endpoint; use is subject to the Kraken terms of service.',
    attribution: 'Cross-check price data: Kraken (kraken.com).',
  },
  alternative: {
    name: 'alternative.me Crypto Fear & Greed Index API',
    url: 'https://alternative.me/crypto/fear-and-greed-index/',
    licence:
      'API rules of the source: "You may not use our data to impersonate us or to create a service that could be confused with our offering. You must properly acknowledge the source of the data and prominently reference it accordingly. Commercial use is allowed as long as the attribution is given right next to the display of the data."',
    attribution: 'Crypto Fear & Greed Index: alternative.me.',
  },
  wikimedia: {
    name: 'Wikimedia REST API, pageviews per article',
    url: 'https://wikimedia.org/api/rest_v1/',
    licence: 'Wikimedia pageview statistics are published by the Wikimedia Foundation as CC0 1.0 (public domain dedication).',
    attribution: 'Pageviews: Wikimedia Foundation, Pageviews API.',
  },
  gdelt: {
    name: 'GDELT DOC 2.0 API',
    url: 'https://www.gdeltproject.org/',
    licence:
      'GDELT terms of use: datasets "are available for unlimited and unrestricted use for any academic, commercial, or governmental use of any kind without fee"; "any use or redistribution of the data must include a citation to the GDELT Project and a link to this website (https://www.gdeltproject.org/)".',
    attribution: 'News coverage volume: The GDELT Project, https://www.gdeltproject.org/.',
  },
  mempool: {
    name: 'mempool.space public API',
    url: 'https://mempool.space/docs/api/rest',
    licence: 'No licence for the data is stated by the source. Public, keyless API of the open-source mempool project.',
    attribution: 'Mining and mempool data: mempool.space.',
  },
  blockchain: {
    name: 'Blockchain.com charts API',
    url: 'https://www.blockchain.com/explorer/api/charts_api',
    licence: 'No open licence is stated by the source. Public, keyless endpoint; use is subject to the Blockchain.com terms of service.',
    attribution: 'Daily transaction count: Blockchain.com.',
  },
}

// ------------------------------------------------------------ Time helpers

export const isoDay = (sec) => new Date(sec * 1000).toISOString().slice(0, 10)
export const isoHour = (sec) => `${new Date(sec * 1000).toISOString().slice(0, 13)}:00:00Z`
export const isoSecond = (sec) => `${new Date(sec * 1000).toISOString().slice(0, 19)}Z`
const dayToSec = (day) => Date.parse(`${day}T00:00:00Z`) / 1000
const num = (v) => {
  const n = Number(v)
  if (!Number.isFinite(n)) throw new Error(`not a number: ${JSON.stringify(v)}`)
  return n
}
const need = (cond, message) => {
  if (!cond) throw new Error(message)
}

// ------------------------------------------------------------ Parsers (pure)

// Bitstamp /ohlc: { data: { ohlc: [{ timestamp, open, high, low, close }] } }
export function parseBitstampOhlc(json) {
  need(json && json.data && Array.isArray(json.data.ohlc), 'Bitstamp: unexpected answer (no data.ohlc)')
  return json.data.ohlc.map((c) => ({ t: num(c.timestamp), open: num(c.open), high: num(c.high), low: num(c.low), close: num(c.close) }))
}

// Kraken /OHLC: { error: [], result: { <pair>: [[time, open, high, low, close, vwap, volume, count]], last } }
export function parseKrakenOhlc(json) {
  need(json && Array.isArray(json.error) && json.error.length === 0, `Kraken: ${JSON.stringify(json && json.error)}`)
  const key = Object.keys(json.result || {}).find((k) => k !== 'last')
  need(key && Array.isArray(json.result[key]), 'Kraken: unexpected answer (no candle list)')
  return json.result[key].map((c) => ({ t: num(c[0]), open: num(c[1]), high: num(c[2]), low: num(c[3]), close: num(c[4]) }))
}

// alternative.me /fng: { data: [{ value, value_classification, timestamp }] }
export function parseFearGreed(json) {
  need(json && Array.isArray(json.data), 'alternative.me: unexpected answer (no data)')
  return json.data.map((d) => ({ date: isoDay(num(d.timestamp)), value: num(d.value), classification: String(d.value_classification) }))
}

// Wikimedia pageviews: { items: [{ timestamp: "2015070100", views }] }
export function parseWikiPageviews(json) {
  need(json && Array.isArray(json.items), 'Wikimedia: unexpected answer (no items)')
  return json.items.map((i) => {
    const s = String(i.timestamp)
    need(/^\d{10}$/.test(s), `Wikimedia: unexpected timestamp ${s}`)
    return { date: `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`, views: num(i.views) }
  })
}

// GDELT timelinevol: { query_details: { date_resolution }, timeline: [{ data: [{ date: "20251126T000000Z", value }] }] }
export function parseGdeltTimeline(json) {
  need(json && Array.isArray(json.timeline) && json.timeline[0] && Array.isArray(json.timeline[0].data), 'GDELT: unexpected answer (no timeline)')
  need(json.query_details && json.query_details.date_resolution === 'day', `GDELT: expected daily resolution, got ${json.query_details && json.query_details.date_resolution}`)
  return json.timeline[0].data.map((d) => {
    const s = String(d.date)
    need(/^\d{8}T/.test(s), `GDELT: unexpected date ${s}`)
    return { date: `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`, intensity: num(d.value) }
  })
}

// mempool.space /v1/mining/difficulty-adjustments: [[time, height, difficulty, changeRatio]]
export function parseDifficultyAdjustments(json) {
  need(Array.isArray(json), 'mempool.space: unexpected answer (difficulty adjustments)')
  return json.map((a) => ({ time: isoSecond(num(a[0])), height: num(a[1]), difficulty: num(a[2]), change: num(a[3]) }))
}

// mempool.space /v1/mining/hashrate/all: { hashrates: [{ timestamp, avgHashrate }] }
export function parseHashrate(json) {
  need(json && Array.isArray(json.hashrates), 'mempool.space: unexpected answer (hashrates)')
  return json.hashrates.map((h) => ({ date: isoDay(num(h.timestamp)), hashrate_hs: num(h.avgHashrate) }))
}

// Blockchain.com charts: { values: [{ x: seconds, y }] }
export function parseBlockchainChart(json) {
  need(json && json.status === 'ok' && Array.isArray(json.values), 'Blockchain.com: unexpected answer (no values)')
  return json.values.map((v) => ({ date: isoDay(num(v.x)), value: num(v.y) }))
}

// mempool.space /mempool and /v1/fees/mempool-blocks, at collection time.
export function parseMempoolSnapshot(mempool, blocks, nowSec) {
  need(mempool && Number.isFinite(mempool.count) && Number.isFinite(mempool.vsize), 'mempool.space: unexpected answer (mempool)')
  need(Array.isArray(blocks), 'mempool.space: unexpected answer (mempool blocks)')
  return {
    at: isoSecond(nowSec),
    mempool_tx: mempool.count,
    mempool_vbytes: mempool.vsize,
    // Median fee rate of the next projected block, sat/vB (null: empty mempool).
    median_fee_sat_vb: blocks.length ? Math.round(num(blocks[0].medianFee) * 1000) / 1000 : null,
  }
}

// ------------------------------------------------------------ Merging

/**
 * Merges fresh rows into the previous ones, keyed by `key` (a sortable text).
 * A previous row whose key is older than `cutoff` is kept exactly as it was;
 * fresh rows replace the recent ones and fill any gap. Sorted ascending.
 */
export function mergeRows(prev, fresh, { key, cutoff }) {
  const map = new Map()
  for (const row of fresh) map.set(row[key], row)
  for (const row of prev) if (row[key] < cutoff || !map.has(row[key])) map.set(row[key], row)
  return [...map.values()].sort((a, b) => (a[key] < b[key] ? -1 : a[key] > b[key] ? 1 : 0))
}

/**
 * Adds the second source's close to each day it covers. When the two closes
 * differ by more than CROSS_CHECK_PCT both stay in the row and the day is
 * flagged: the collector never chooses between them.
 */
export function crossCheck(rows, checks, checkSource) {
  const byDate = new Map(checks.map((c) => [c.date, c.close]))
  return rows.map((row) => {
    if (!byDate.has(row.date)) return row
    const other = byDate.get(row.date)
    const diff = Math.round((Math.abs(row.close - other) / row.close) * 100000) / 1000
    return { ...row, check_source: checkSource, check_close: other, check_diff_pct: diff, ...(diff > CROSS_CHECK_PCT ? { flag: 'close-differs' } : {}) }
  })
}

// ------------------------------------------------------------ Output

// Stable text: header fields one per line, then one row per line.
export function formatFile(file) {
  const { tables, ...head } = file
  const lines = Object.entries(head).map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v, null, 2).replace(/\n/g, '\n  ')}`)
  for (const [name, rows] of Object.entries(tables)) {
    lines.push(rows.length ? `  ${JSON.stringify(name)}: [\n${rows.map((r) => `    ${JSON.stringify(r)}`).join(',\n')}\n  ]` : `  ${JSON.stringify(name)}: []`)
  }
  return `{\n${lines.join(',\n')}\n}\n`
}

function readPrev(out, fileName) {
  const file = path.join(out, fileName)
  if (!existsSync(file)) return null
  try {
    return JSON.parse(readFileSync(file, 'utf8'))
  } catch {
    return null
  }
}

// ------------------------------------------------------------ Series

const bitstamp = (step, start, limit = 1000) => `https://www.bitstamp.net/api/v2/ohlc/btcusd/?step=${step}&limit=${limit}&start=${start}`
const BITSTAMP_FIRST_DAY = 1313625600 // 2011-08-18, the first daily candle Bitstamp serves

// Pages forward through Bitstamp candles from `start` until the present.
async function bitstampCandles(get, step, start, nowSec) {
  const all = []
  let from = start
  for (let page = 0; page < 40; page++) {
    const batch = parseBitstampOhlc(await get(bitstamp(step, from)))
    if (!batch.length) break
    all.push(...batch)
    const last = batch[batch.length - 1].t
    if (batch.length < 1000 || last + step > nowSec) break
    from = last + step
  }
  return all
}

export const SERIES = {
  'btc-daily': {
    file: 'btc-daily.json',
    description: 'Bitcoin daily candles in US dollars, UTC days: open, high, low, close. Complete days only.',
    notes: `Each row names its source. Where a second source covers the day its close is given as check_close; a difference above ${CROSS_CHECK_PCT}% is flagged ("flag": "close-differs") and both values are kept. The second source covers about the last 720 days at the first run and every day from then on.`,
    sources: ['bitstamp', 'kraken'],
    async collect({ get, prev, nowSec }) {
      const today = isoDay(nowSec)
      const before = prev ? prev.rows : []
      const start = before.length ? dayToSec(before[before.length - 1].date) - KEEP_DAYS * DAY : BITSTAMP_FIRST_DAY
      const candles = await bitstampCandles(get, DAY, start, nowSec)
      const fresh = candles
        .map((c) => ({ date: isoDay(c.t), open: c.open, high: c.high, low: c.low, close: c.close, source: 'bitstamp' }))
        .filter((r) => r.date < today)
      // The cross-check is best effort: without it the rows are simply not annotated.
      let checked = fresh
      let warning = ''
      try {
        const kraken = parseKrakenOhlc(await get('https://api.kraken.com/0/public/OHLC?pair=XBTUSD&interval=1440'))
        checked = crossCheck(fresh, kraken.map((c) => ({ date: isoDay(c.t), close: c.close })).filter((c) => c.date < today), 'kraken')
      } catch (e) {
        warning = `cross-check source unavailable (${e.message})`
      }
      const cutoff = isoDay(nowSec - KEEP_DAYS * DAY)
      return { tables: { rows: mergeRows(before, checked, { key: 'date', cutoff }) }, warning }
    },
  },

  'btc-hourly': {
    file: 'btc-hourly.json',
    description: `Bitcoin hourly closes in US dollars for the last ${HOURLY_WINDOW_DAYS} days, UTC. Complete hours only.`,
    sources: ['bitstamp'],
    async collect({ get, prev, nowSec }) {
      const thisHour = isoHour(nowSec)
      const windowStart = isoHour(nowSec - HOURLY_WINDOW_DAYS * DAY)
      const before = (prev ? prev.rows : []).filter((r) => r.time >= windowStart)
      const start = before.length ? Date.parse(before[before.length - 1].time) / 1000 - KEEP_DAYS * DAY : nowSec - HOURLY_WINDOW_DAYS * DAY
      const candles = await bitstampCandles(get, 3600, Math.floor(start / 3600) * 3600, nowSec)
      const fresh = candles.map((c) => ({ time: isoHour(c.t), close: c.close })).filter((r) => r.time < thisHour && r.time >= windowStart)
      return { tables: { rows: mergeRows(before, fresh, { key: 'time', cutoff: isoHour(nowSec - KEEP_DAYS * DAY) }) } }
    },
  },

  'fear-greed': {
    file: 'fear-greed.json',
    description: 'Crypto Fear & Greed Index, daily, full history (0 = extreme fear, 100 = extreme greed).',
    sources: ['alternative'],
    async collect({ get, prev, nowSec }) {
      const fresh = parseFearGreed(await get('https://api.alternative.me/fng/?limit=0&format=json'))
      return { tables: { rows: mergeRows(prev ? prev.rows : [], fresh, { key: 'date', cutoff: isoDay(nowSec - KEEP_DAYS * DAY) }) } }
    },
  },

  'wiki-pageviews': {
    file: 'wiki-pageviews.json',
    description: 'Daily views of the English Wikipedia article "Bitcoin" (all access methods, human readers), from 2015-07-01.',
    sources: ['wikimedia'],
    async collect({ get, prev, nowSec }) {
      const before = prev ? prev.rows : []
      const from = before.length ? isoDay(dayToSec(before[before.length - 1].date) - KEEP_DAYS * DAY) : '2015-07-01'
      const ymd = (day) => day.replace(/-/g, '')
      const url = `https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia/all-access/user/Bitcoin/daily/${ymd(from)}00/${ymd(isoDay(nowSec))}00`
      const fresh = parseWikiPageviews(await get(url))
      return { tables: { rows: mergeRows(before, fresh, { key: 'date', cutoff: isoDay(nowSec - KEEP_DAYS * DAY) }) } }
    },
  },

  'news-volume': {
    file: 'news-volume.json',
    description: 'Daily volume of worldwide online news coverage mentioning "bitcoin": the percentage of all articles monitored by GDELT that day. Complete days only.',
    notes: 'The source serves about the last twelve months; earlier days stay in this file once collected. The source allows one request every five seconds and often refuses shared addresses: when it does, the previous file is kept.',
    sources: ['gdelt'],
    async collect({ get, prev, nowSec }) {
      const today = isoDay(nowSec)
      const fresh = parseGdeltTimeline(await get('https://api.gdeltproject.org/api/v2/doc/doc?query=bitcoin&mode=timelinevol&format=json&timespan=12m')).filter((r) => r.date < today)
      return { tables: { rows: mergeRows(prev ? prev.rows : [], fresh, { key: 'date', cutoff: isoDay(nowSec - KEEP_DAYS * DAY) }) } }
    },
  },

  mining: {
    file: 'mining.json',
    description: 'Bitcoin mining: every difficulty adjustment (time, block height, difficulty, change ratio against the previous one) and the daily average network hash rate in hashes per second. Complete days only.',
    sources: ['mempool'],
    async collect({ get, prev, nowSec }) {
      const today = isoDay(nowSec)
      const adjustments = parseDifficultyAdjustments(await get('https://mempool.space/api/v1/mining/difficulty-adjustments'))
      const hashrate = parseHashrate(await get('https://mempool.space/api/v1/mining/hashrate/all')).filter((r) => r.date < today)
      const cutoff = isoDay(nowSec - KEEP_DAYS * DAY)
      return {
        tables: {
          adjustments: mergeRows(prev ? prev.adjustments : [], adjustments, { key: 'time', cutoff: `${cutoff}T00:00:00Z` }),
          hashrate: mergeRows(prev ? prev.hashrate : [], hashrate, { key: 'date', cutoff }),
        },
      }
    },
  },

  'network-activity': {
    file: 'network-activity.json',
    description: `Bitcoin network activity: confirmed transactions per UTC day (complete days only), and one snapshot per collection of the mempool (transactions waiting, their virtual size) with the median fee rate of the next projected block, kept for ${SNAPSHOT_WINDOW_DAYS} days.`,
    sources: ['blockchain', 'mempool'],
    async collect({ get, prev, nowSec }) {
      const today = isoDay(nowSec)
      const daily = parseBlockchainChart(await get('https://api.blockchain.info/charts/n-transactions?timespan=all&format=json&sampled=false'))
        .map((r) => ({ date: r.date, tx_count: r.value }))
        .filter((r) => r.date < today)
      const snapshot = parseMempoolSnapshot(await get('https://mempool.space/api/mempool'), await get('https://mempool.space/api/v1/fees/mempool-blocks'), nowSec)
      const oldest = isoSecond(nowSec - SNAPSHOT_WINDOW_DAYS * DAY)
      const snapshots = [...(prev ? prev.snapshots : []).filter((s) => s.at >= oldest && s.at !== snapshot.at), snapshot].sort((a, b) => (a.at < b.at ? -1 : 1))
      return {
        tables: {
          daily: mergeRows(prev ? prev.daily : [], daily, { key: 'date', cutoff: isoDay(nowSec - KEEP_DAYS * DAY) }),
          snapshots,
        },
      }
    },
  },
}

// ------------------------------------------------------------ Network

export async function fetchJson(url, { fetchImpl = fetch, retries = 2, timeoutMs = 45000 } = {}) {
  let lastError
  for (let attempt = 0; attempt <= retries; attempt++) {
    if (attempt) await new Promise((r) => setTimeout(r, 6000 * attempt))
    try {
      const res = await fetchImpl(url, { headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' }, signal: AbortSignal.timeout(timeoutMs) })
      const text = await res.text()
      if (!res.ok) throw new Error(`HTTP ${res.status} from ${new URL(url).hostname}: ${text.slice(0, 120).replace(/\s+/g, ' ')}`)
      try {
        return JSON.parse(text)
      } catch {
        throw new Error(`${new URL(url).hostname} did not answer with JSON: ${text.slice(0, 120).replace(/\s+/g, ' ')}`)
      }
    } catch (e) {
      // "fetch failed" alone says nothing: add the host and the network cause.
      const cause = e.cause && (e.cause.code || e.cause.message)
      lastError = /^HTTP |did not answer/.test(e.message) ? e : new Error(`${new URL(url).hostname}: ${e.message}${cause ? ` (${cause})` : ''}`)
    }
  }
  throw lastError
}

// ------------------------------------------------------------ Run

/**
 * Collects the series into `out`. Returns the status object also written to
 * status.json. Never throws for a source that is down.
 */
export async function collect({ out, only = '', get = fetchJson, now = Date.now(), log = console.log }) {
  mkdirSync(out, { recursive: true })
  const nowSec = Math.floor(now / 1000)
  const generatedAt = isoSecond(nowSec)
  const names = Object.keys(SERIES).filter((n) => !only || n === only)
  if (!names.length) throw new Error(`Unknown series "${only}". Known: ${Object.keys(SERIES).join(', ')}`)
  const prevStatus = readPrev(out, 'status.json')
  const status = { generated_at: generatedAt, series: { ...(prevStatus && prevStatus.series) } }

  for (const name of names) {
    const def = SERIES[name]
    const prev = readPrev(out, def.file)
    const entry = { file: def.file, ok: true, checked_at: generatedAt }
    try {
      const { tables, warning } = await def.collect({ get, prev, nowSec })
      const counts = Object.fromEntries(Object.entries(tables).map(([k, rows]) => [k, rows.length]))
      need(Object.values(counts).some((n) => n > 0), 'the source returned no rows')
      const file = {
        series: name,
        description: def.description,
        ...(def.notes ? { notes: def.notes } : {}),
        generated_at: generatedAt,
        sources: def.sources.map((s) => SOURCES[s]),
        tables,
      }
      writeFileSync(path.join(out, def.file), formatFile(file))
      entry.updated_at = generatedAt
      entry.rows = counts
      if (warning) entry.warning = warning
      log(`ok    ${name}: ${Object.entries(counts).map(([k, n]) => `${n} ${k}`).join(', ')}${warning ? `  (warning: ${warning})` : ''}`)
    } catch (e) {
      // The previous file, if any, stays exactly as it is.
      entry.ok = false
      entry.error = String(e.message || e).slice(0, 300)
      const before = prevStatus && prevStatus.series && prevStatus.series[name]
      if (before && before.updated_at) entry.updated_at = before.updated_at
      if (before && before.rows) entry.rows = before.rows
      log(`FAIL  ${name}: ${entry.error}${prev ? '  (previous file kept)' : '  (no previous file)'}`)
    }
    status.series[name] = entry
  }
  const ordered = { generated_at: status.generated_at, series: Object.fromEntries(Object.keys(status.series).sort().map((k) => [k, status.series[k]])) }
  writeFileSync(path.join(out, 'status.json'), `${JSON.stringify(ordered, null, 2)}\n`)
  return ordered
}

// The command line. Not awaited at the top level: self-test.mjs imports this
// module back, which needs it to have finished loading.
async function main() {
  const argv = process.argv.slice(2)
  const value = (flag) => (argv.includes(flag) ? argv[argv.indexOf(flag) + 1] : '')
  if (argv.includes('--self-test')) {
    const { selfTest } = await import('./self-test.mjs')
    process.exit((await selfTest()) ? 1 : 0)
  }
  const out = value('--out')
  if (!out) {
    console.error('Usage: node scripts/data/collect.mjs --out <dir> [--only <series>] [--self-test]')
    process.exit(2)
  }
  const status = await collect({ out: path.resolve(out), only: value('--only') })
  const failed = Object.values(status.series).filter((s) => !s.ok).length
  console.log(`
${Object.keys(status.series).length - failed} series up to date, ${failed} failed. Files in ${path.resolve(out)}`)
  // A source being down is not a failure of the job: the previous data stay.
  // Only "nothing at all could be collected" is.
  process.exit(failed === Object.keys(status.series).length ? 1 : 0)
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  main().catch((e) => {
    console.error(`ERROR: ${e.message}`)
    process.exit(1)
  })
}

export { HERE }
