// Self-test of the data collector: `node scripts/data/collect.mjs --self-test`.
// No network: the parsers run on answers recorded from each source
// (scripts/data/fixtures/), and whole runs use a fake fetch that serves them.
import { mkdtempSync, readFileSync, existsSync, rmSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  SERIES, collect, crossCheck, fetchJson, formatFile, mergeRows, parseBitstampOhlc, parseBlockchainChart,
  parseDifficultyAdjustments, parseFearGreed, parseGdeltTimeline, parseHashrate, parseKrakenOhlc,
  parseMempoolSnapshot, parseWikiPageviews,
} from './collect.mjs'

const FIX = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures')
const fx = (name) => JSON.parse(readFileSync(path.join(FIX, `${name}.json`), 'utf8'))
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b)

// The recorded answers end on 2026-11-20 (UTC); the test clock is that morning.
const NOW = (1795132800 + 5 * 3600) * 1000

// A fake `get` that answers each source with its recorded fixture.
function fakeGet(overrides = {}) {
  const calls = []
  const table = [
    [/bitstamp\.net.*step=86400/, 'bitstamp-ohlc-daily-recent'],
    [/bitstamp\.net.*step=3600/, 'bitstamp-ohlc-hourly'],
    [/api\.kraken\.com/, 'kraken-ohlc-daily'],
    [/alternative\.me/, 'alternative-fng'],
    [/wikimedia\.org/, 'wikimedia-pageviews'],
    [/gdeltproject\.org/, 'gdelt-timelinevol-daily'],
    [/difficulty-adjustments/, 'mempool-difficulty-adjustments'],
    [/mining\/hashrate/, 'mempool-hashrate'],
    [/mempool\.space\/api\/mempool$/, 'mempool-mempool'],
    [/fees\/mempool-blocks/, 'mempool-fee-blocks'],
    [/blockchain\.info/, 'blockchain-n-transactions'],
  ]
  const get = async (url) => {
    calls.push(url)
    for (const [re, value] of Object.entries(overrides)) if (new RegExp(re).test(url)) return typeof value === 'function' ? value(url) : value
    const hit = table.find(([re]) => re.test(url))
    if (!hit) throw new Error(`self-test: no fixture for ${url}`)
    return fx(hit[1])
  }
  return { get, calls }
}

export async function selfTest() {
  let failures = 0
  let count = 0
  const ok = (name, cond, detail = '') => {
    count++
    if (!cond) failures++
    console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${!cond && detail ? `  ${detail}` : ''}`)
  }
  const throws = (fn) => {
    try {
      fn()
      return false
    } catch {
      return true
    }
  }

  // ---- Parsers on recorded answers
  let rows = parseBitstampOhlc(fx('bitstamp-ohlc-daily'))
  ok('parser: Bitstamp daily candles', rows.length === 5 && same(rows[1], { t: 1313712000, open: 11.85, high: 11.85, low: 11.15, close: 11.69 }), JSON.stringify(rows[1]))
  rows = parseBitstampOhlc(fx('bitstamp-ohlc-hourly'))
  ok('parser: Bitstamp hourly candles', rows.length === 3 && rows[0].t === 1795129200 && rows[0].close === 61914.05)
  rows = parseKrakenOhlc(fx('kraken-ohlc-daily'))
  ok('parser: Kraken daily candles', rows.length === 5 && same(rows[2], { t: 1794960000, open: 64876.9, high: 64928.1, low: 62000, close: 62984.6 }), JSON.stringify(rows[2]))
  ok('parser: Kraken error answer is refused', throws(() => parseKrakenOhlc({ error: ['EGeneral:Too many requests'], result: {} })))
  rows = parseFearGreed(fx('alternative-fng'))
  ok('parser: Fear & Greed', rows.length === 6 && same(rows[0], { date: '2026-11-20', value: 12, classification: 'Extreme Fear' }) && rows[5].date === '2018-02-01', JSON.stringify(rows[0]))
  rows = parseWikiPageviews(fx('wikimedia-pageviews'))
  ok('parser: Wikipedia pageviews', rows.length === 6 && same(rows[0], { date: '2015-07-01', views: 12957 }) && rows[5].date === '2026-11-18')
  rows = parseGdeltTimeline(fx('gdelt-timelinevol-daily'))
  ok('parser: GDELT daily news volume', rows.length === 6 && same(rows[0], { date: '2025-11-26', intensity: 0.1483 }))
  ok('parser: GDELT answer that is not daily is refused', throws(() => parseGdeltTimeline(fx('gdelt-timelinevolraw-15m'))))
  rows = parseDifficultyAdjustments(fx('mempool-difficulty-adjustments'))
  ok('parser: difficulty adjustments', rows.length === 6 && same(rows[0], { time: '2026-11-14T05:02:50Z', height: 975744, difficulty: 134823837323272.7, change: 0.908733 }), JSON.stringify(rows[0]))
  rows = parseHashrate(fx('mempool-hashrate'))
  ok('parser: daily hash rate', rows.length === 6 && same(rows[3], { date: '2026-11-18', hashrate_hs: 1.009829456101236e21 }))
  rows = parseBlockchainChart(fx('blockchain-n-transactions'))
  ok('parser: daily transaction count', rows.length === 6 && same(rows[5], { date: '2026-11-18', value: 674354 }))
  ok('parser: Blockchain.com error answer is refused', throws(() => parseBlockchainChart({ status: 'not-found' })))
  const snap = parseMempoolSnapshot(fx('mempool-mempool'), fx('mempool-fee-blocks'), 1795150800)
  ok('parser: mempool snapshot', same(snap, { at: '2026-11-20T05:00:00Z', mempool_tx: 61969, mempool_vbytes: 25541907, median_fee_sat_vb: 1.011 }), JSON.stringify(snap))
  ok('parser: a malformed answer is refused, not guessed', throws(() => parseBitstampOhlc({ data: {} })) && throws(() => parseWikiPageviews({})) && throws(() => parseFearGreed({ data: [{ value: 'n/a', timestamp: '1' }] })))

  // ---- Merge: history older than three days is never rewritten
  const prev = [{ date: '2026-11-01', v: 1 }, { date: '2026-11-10', v: 2 }, { date: '2026-11-17', v: 3 }]
  const fresh = [{ date: '2026-11-18', v: 40 }, { date: '2026-11-10', v: 999 }, { date: '2026-11-17', v: 30 }, { date: '2026-11-05', v: 5 }]
  const merged = mergeRows(prev, fresh, { key: 'date', cutoff: '2026-11-16' })
  ok('merge: old rows kept, recent rows refreshed, gaps filled, sorted', same(merged, [{ date: '2026-11-01', v: 1 }, { date: '2026-11-05', v: 5 }, { date: '2026-11-10', v: 2 }, { date: '2026-11-17', v: 30 }, { date: '2026-11-18', v: 40 }]), JSON.stringify(merged))

  // ---- Cross-check: both values kept, the day flagged, nothing chosen
  const checked = crossCheck(
    [{ date: 'a', close: 100 }, { date: 'b', close: 100 }, { date: 'c', close: 100 }, { date: 'd', close: 100 }],
    [{ date: 'a', close: 101.5 }, { date: 'b', close: 101.6 }, { date: 'c', close: 98 }],
    'kraken',
  )
  ok('cross-check: 1.5% is not flagged', checked[0].check_close === 101.5 && checked[0].check_diff_pct === 1.5 && checked[0].flag === undefined)
  ok('cross-check: above 1.5% is flagged and both closes stay', checked[1].flag === 'close-differs' && checked[1].close === 100 && checked[1].check_close === 101.6 && checked[2].flag === 'close-differs')
  ok('cross-check: a day the second source lacks is left as it is', same(checked[3], { date: 'd', close: 100 }))

  // ---- Whole runs with a fake fetch
  const tmp = mkdtempSync(path.join(os.tmpdir(), 'sbi-data-'))
  const quiet = () => {}
  const read = (dir, file) => readFileSync(path.join(dir, file), 'utf8')
  try {
    const a = path.join(tmp, 'a')
    const b = path.join(tmp, 'b')
    const status = await collect({ out: a, get: fakeGet().get, now: NOW, log: quiet })
    ok('run: all seven series written, status ok', Object.keys(status.series).length === 7 && Object.values(status.series).every((s) => s.ok) && Object.values(SERIES).every((s) => existsSync(path.join(a, s.file))))
    const daily = JSON.parse(read(a, 'btc-daily.json'))
    ok('run: every file names its sources, licence text and generated_at', Object.values(SERIES).every((s) => { const f = JSON.parse(read(a, s.file)); return f.generated_at === '2026-11-20T05:00:00Z' && f.sources.length > 0 && f.sources.every((x) => x.name && x.url && x.licence && x.attribution) }))
    ok('run: the day in progress is left out (complete days only)', same(daily.rows.map((r) => r.date), ['2026-11-18', '2026-11-19']) && !JSON.parse(read(a, 'mining.json')).hashrate.some((r) => r.date === '2026-11-20') && !JSON.parse(read(a, 'news-volume.json')).rows.some((r) => r.date >= '2026-11-20'))
    ok('run: each price row names its source and carries the cross-check', daily.rows.every((r) => r.source === 'bitstamp' && r.check_source === 'kraken' && typeof r.check_close === 'number' && r.flag === undefined))
    const hourly = JSON.parse(read(a, 'btc-hourly.json'))
    ok('run: hourly closes, complete hours only', same(hourly.rows.map((r) => r.time), ['2026-11-19T23:00:00Z', '2026-11-20T00:00:00Z', '2026-11-20T01:00:00Z']), JSON.stringify(hourly.rows.map((r) => r.time)))
    const activity = JSON.parse(read(a, 'network-activity.json'))
    ok('run: transaction counts and one mempool snapshot', activity.daily.length === 6 && activity.snapshots.length === 1 && activity.snapshots[0].median_fee_sat_vb === 1.011)

    await collect({ out: b, get: fakeGet().get, now: NOW, log: quiet })
    ok('run: deterministic — same input, same bytes', [...Object.values(SERIES).map((s) => s.file), 'status.json'].every((f) => read(a, f) === read(b, f)))
    ok('run: stable formatting — one row per line, parses back', read(a, 'btc-daily.json').split('\n').filter((l) => l.startsWith('    {"date"')).length === 2 && formatFile({ a: 1, tables: { rows: [] } }) === '{\n  "a": 1,\n  "rows": []\n}\n')

    // Five days later the price source "restates" an old close and Kraken disagrees on a new one.
    const later = NOW + 5 * 86400 * 1000
    const restated = fx('bitstamp-ohlc-daily-recent')
    restated.data.ohlc[0].close = '1.00' // 2026-11-18, by then older than three days
    restated.data.ohlc.push({ timestamp: String(1795132800 + 4 * 86400), open: '60000', high: '61000', low: '59000', close: '60000' }) // 2026-11-24
    const kraken = fx('kraken-ohlc-daily')
    kraken.result.XXBTZUSD.push([1795132800 + 4 * 86400, '60000', '63000', '59000', '62000', '0', '0', 0])
    await collect({ out: a, get: fakeGet({ 'bitstamp\\.net.*step=86400': restated, 'api\\.kraken\\.com': kraken }).get, now: later, log: quiet })
    const after = JSON.parse(read(a, 'btc-daily.json'))
    const old = after.rows.find((r) => r.date === '2026-11-18')
    const flagged = after.rows.find((r) => r.date === '2026-11-24')
    ok('incremental: a close older than three days is not rewritten', old && old.close === 62976.18, JSON.stringify(old))
    ok('incremental: new days are added', flagged && after.rows.length === 4, JSON.stringify(after.rows.map((r) => r.date)))
    ok('cross-check in a run: 3.3% apart — flagged, both closes kept', flagged && flagged.flag === 'close-differs' && flagged.close === 60000 && flagged.check_close === 62000 && flagged.check_diff_pct === 3.333, JSON.stringify(flagged))
    ok('incremental: the mempool log grows by one snapshot per run', JSON.parse(read(a, 'network-activity.json')).snapshots.length === 2)
    const incr = fakeGet()
    await collect({ out: a, only: 'wiki-pageviews', get: incr.get, now: later, log: quiet })
    ok('incremental: only the recent days are asked for again', incr.calls.length === 1 && incr.calls[0].endsWith('/daily/2026111500/2026112500'), incr.calls[0])

    // One source down: its file stays byte for byte, the error is recorded, the rest goes on.
    const before = read(b, 'news-volume.json')
    const down = await collect({ out: b, get: fakeGet({ gdeltproject: () => { throw new Error('HTTP 429 from api.gdeltproject.org') } }).get, now: later, log: quiet })
    ok('failure: the previous file is kept unchanged', read(b, 'news-volume.json') === before)
    ok('failure: status.json records the error and the last good update', down.series['news-volume'].ok === false && /429/.test(down.series['news-volume'].error) && down.series['news-volume'].updated_at === '2026-11-20T05:00:00Z')
    ok('failure: the other series are still updated', Object.entries(down.series).filter(([n]) => n !== 'news-volume').every(([, s]) => s.ok && s.updated_at === '2026-11-25T05:00:00Z'))
    const c = path.join(tmp, 'c')
    const first = await collect({ out: c, only: 'news-volume', get: fakeGet({ gdeltproject: () => { throw new Error('down') } }).get, now: NOW, log: quiet })
    ok('failure on a first run: no file is invented', !existsSync(path.join(c, 'news-volume.json')) && first.series['news-volume'].ok === false)
    const d = path.join(tmp, 'd')
    const noCheck = await collect({ out: d, only: 'btc-daily', get: fakeGet({ 'api\\.kraken\\.com': () => { throw new Error('down') } }).get, now: NOW, log: quiet })
    ok('failure of the cross-check source only: prices still written, with a warning', noCheck.series['btc-daily'].ok && /cross-check/.test(noCheck.series['btc-daily'].warning) && JSON.parse(read(d, 'btc-daily.json')).rows.every((r) => r.check_close === undefined))
    let unknown = false
    try {
      await collect({ out: d, only: 'no-such-series', get: fakeGet().get, now: NOW, log: quiet })
    } catch {
      unknown = true
    }
    ok('--only with an unknown series is an error', unknown)

    // fetchJson: an HTTP error or a non-JSON body is an error, never data.
    const http = (status, body) => async () => ({ ok: status < 400, status, text: async () => body })
    let refused = 0
    for (const impl of [http(429, 'Please limit requests'), http(200, '<html>maintenance</html>')]) {
      try {
        await fetchJson('https://example.org/x', { fetchImpl: impl, retries: 0 })
      } catch {
        refused++
      }
    }
    ok('fetch: HTTP 429 and a non-JSON body are both refused', refused === 2)
    ok('fetch: sends a descriptive User-Agent', await (async () => { let ua = ''; await fetchJson('https://example.org/x', { fetchImpl: async (u, init) => { ua = init.headers['User-Agent']; return { ok: true, status: 200, text: async () => '{}' } }, retries: 0 }); return /sbi-data-collector/.test(ua) && /https:\/\//.test(ua) })())
  } finally {
    rmSync(tmp, { recursive: true, force: true })
  }

  console.log(`\n${failures} failures of ${count} checks`)
  return failures
}
