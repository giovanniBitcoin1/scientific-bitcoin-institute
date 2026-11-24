// Network Lab module 14, "Capstone: a real network": builds the data file and
// the precomputed results.
//
//   node scripts/lab/build-network-14.mjs            data file + precomputed file
//   node scripts/lab/build-network-14.mjs data       data file only
//   node scripts/lab/build-network-14.mjs precompute precomputed file only
//
// It downloads airports.dat and routes.dat of the OpenFlights databases
// (https://openflights.org/data, Open Database License 1.0) into the
// git-ignored cache scripts/lab/network-14-cache.local/ (the raw files are
// never committed; a file already in the cache is not downloaded again) and
// writes
//
//   src/data/lab/networks/airports-2014.json               the network
//   src/data/lab/precomputed/network-14-airports.json      what is too slow for a page load
//
// Rules of the build (also in networks.meta.json): a route row is kept only
// if both airport ids are numbers found in airports.dat; rows from an airport
// to itself are dropped; one undirected link per pair of airports with at
// least one row in either direction, its weight the number of different
// airline codes (first field) on the pair, both directions together; a node
// per airport with at least one link. Nothing in the data is corrected.
//
// scripts/lab/check-network-14.mjs runs the same functions again and compares,
// so neither file can go stale.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'

export const BASE_URL = 'https://raw.githubusercontent.com/jpatokal/openflights/master/data/'
export const RAW_FILES = ['airports.dat', 'routes.dat']
export const CACHE = new URL('./network-14-cache.local/', import.meta.url)
export const DATA_FILE = new URL('../../src/data/lab/networks/airports-2014.json', import.meta.url)
export const PRE_FILE = new URL('../../src/data/lab/precomputed/network-14-airports.json', import.meta.url)

// One line of airports.dat: fields separated by commas, text in double
// quotes (a quote inside is doubled), \N for a missing value, \' for an
// apostrophe.
export function parseLine(line) {
  const out = []
  let i = 0
  while (i <= line.length) {
    if (line[i] === '"') {
      let s = ''
      i++
      while (i < line.length) {
        if (line[i] === '"' && line[i + 1] === '"') {
          s += '"'
          i += 2
        } else if (line[i] === '"') break
        else s += line[i++]
      }
      i++ // closing quote
      out.push(s.replace(/\\'/g, "'"))
    } else {
      let j = line.indexOf(',', i)
      if (j < 0) j = line.length
      const raw = line.slice(i, j)
      out.push(raw === '\\N' ? null : raw)
      i = j
    }
    i++ // comma
  }
  return out
}

const lines = (text) => text.split(/\r?\n/).filter((l) => l.length)
const round2 = (x) => Math.round(x * 100) / 100

// The network from the text of the two files.
export function buildData(airportsText, routesText) {
  const airports = new Map()
  for (const line of lines(airportsText)) {
    const f = parseLine(line)
    airports.set(Number(f[0]), { id: Number(f[0]), name: f[1], city: f[2], country: f[3], iata: f[4], icao: f[5], lat: Number(f[6]), lng: Number(f[7]), tz: f[11] })
  }
  const rows = lines(routesText)
  const isId = (s) => /^\d+$/.test(s) && airports.has(Number(s))
  let dropped = 0
  let selfRows = 0
  const pairs = new Map() // "a b" (a < b) → { airlines, ab, ba }
  for (const row of rows) {
    const f = row.split(',')
    if (!isId(f[3]) || !isId(f[5])) {
      dropped++
      continue
    }
    const s = Number(f[3])
    const d = Number(f[5])
    if (s === d) {
      selfRows++
      continue
    }
    const key = s < d ? `${s} ${d}` : `${d} ${s}`
    let p = pairs.get(key)
    if (!p) pairs.set(key, (p = { a: Math.min(s, d), b: Math.max(s, d), airlines: new Set(), ab: false, ba: false }))
    p.airlines.add(f[0])
    if (s < d) p.ab = true
    else p.ba = true
  }
  const used = new Set()
  for (const p of pairs.values()) {
    used.add(p.a)
    used.add(p.b)
  }
  const ids = [...used].sort((x, y) => x - y)
  const index = new Map(ids.map((id, i) => [id, i]))
  const regions = []
  const countries = []
  const indexIn = (list, v) => {
    let i = list.indexOf(v)
    if (i < 0) i = list.push(v) - 1
    return i
  }
  const nodes = { id: [], code: [], name: [], city: [], country: [], lat: [], lng: [], region: [] }
  let icaoCodes = 0
  let noRegion = 0
  for (const id of ids) {
    const a = airports.get(id)
    if (!a.iata) icaoCodes++
    const region = a.tz ? a.tz.split('/')[0] : null
    if (!region) noRegion++
    nodes.id.push(id)
    nodes.code.push(a.iata || a.icao)
    nodes.name.push(a.name)
    nodes.city.push(a.city)
    nodes.country.push(indexIn(countries, a.country))
    nodes.lat.push(round2(a.lat))
    nodes.lng.push(round2(a.lng))
    nodes.region.push(region ? indexIn(regions, region) : -1)
  }
  const list = [...pairs.values()].sort((x, y) => x.a - y.a || x.b - y.b)
  const links = []
  let oneWay = 0
  for (const p of list) {
    links.push(index.get(p.a), index.get(p.b), p.airlines.size)
    if (!(p.ab && p.ba)) oneWay++
  }
  return {
    data: { regions, countries, nodes, links },
    counts: { airportRows: airports.size, routeRows: rows.length, droppedRows: dropped, selfRows, airports: ids.length, links: list.length, oneWay, icaoCodes, noRegion },
  }
}

export const sha256 = (buffer) => createHash('sha256').update(buffer).digest('hex')

export async function rawFiles({ download = true } = {}) {
  mkdirSync(CACHE, { recursive: true })
  const out = {}
  for (const name of RAW_FILES) {
    const file = new URL(name, CACHE)
    if (!existsSync(file)) {
      if (!download) return null
      const res = await fetch(BASE_URL + name)
      if (!res.ok) throw new Error(`cannot download ${name}: ${res.status}`)
      writeFileSync(file, Buffer.from(await res.arrayBuffer()))
    }
    const buffer = readFileSync(file)
    out[name] = { text: buffer.toString('utf8'), sha256: sha256(buffer), lines: lines(buffer.toString('utf8')).length }
  }
  return out
}

// The data file as text: compact, one array per line.
export function serialise(built, raw) {
  const { regions, countries, nodes, links } = built.data
  const row = (k, v, last = false) => `    ${JSON.stringify(k)}: ${JSON.stringify(v)}${last ? '' : ','}`
  return [
    '{',
    `  "notice": "Contains information from the OpenFlights Airports and Routes Databases, which are made available under the Open Database License (ODbL) v1.0 (https://opendatacommons.org/licenses/odbl/1-0/). This derived file is made available under the same licence.",`,
    `  "source": "https://openflights.org/data",`,
    `  "routes_as_of": "2014-06",`,
    `  "sha256": ${JSON.stringify({ 'airports.dat': raw['airports.dat'].sha256, 'routes.dat': raw['routes.dat'].sha256 })},`,
    `  "counts": ${JSON.stringify(built.counts)},`,
    `  "regions": ${JSON.stringify(regions)},`,
    `  "countries": ${JSON.stringify(countries)},`,
    '  "nodes": {',
    row('id', nodes.id),
    row('code', nodes.code),
    row('name', nodes.name),
    row('city', nodes.city),
    row('country', nodes.country),
    row('lat', nodes.lat),
    row('lng', nodes.lng),
    row('region', nodes.region, true),
    '  },',
    `  "links": ${JSON.stringify(links)}`,
    '}',
    '',
  ].join('\n')
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const what = process.argv[2] || 'all'
  if (what === 'all' || what === 'data') {
    const raw = await rawFiles()
    for (const name of RAW_FILES) console.log(`${name}  sha256 ${raw[name].sha256}  ${raw[name].lines} lines`)
    const built = buildData(raw['airports.dat'].text, raw['routes.dat'].text)
    console.log(JSON.stringify(built.counts))
    const text = serialise(built, raw)
    writeFileSync(DATA_FILE, text)
    console.log(`wrote ${fileURLToPath(DATA_FILE)} (${(Buffer.byteLength(text) / 1024).toFixed(0)} kB)`)
  }
  if (what === 'all' || what === 'precompute') {
    const { precompute, serialisePre } = await import('../../src/components/lab/network/capstone-a-real-network/precompute.js')
    const data = JSON.parse(readFileSync(DATA_FILE, 'utf8'))
    const t0 = performance.now()
    const pre = precompute(data, (label) => console.log(`  ${((performance.now() - t0) / 1000).toFixed(1)} s  ${label}`))
    const text = serialisePre(pre)
    writeFileSync(PRE_FILE, text)
    console.log(`wrote ${fileURLToPath(PRE_FILE)} (${(Buffer.byteLength(text) / 1024).toFixed(0)} kB)`)
  }
}
