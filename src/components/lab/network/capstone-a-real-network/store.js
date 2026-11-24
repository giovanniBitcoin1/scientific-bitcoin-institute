import { useSyncExternalStore } from 'react'
import airportsData from '../../../../data/lab/networks/airports-2014.json'
import pre from '../../../../data/lab/precomputed/network-14-airports.json'
import karateData from '../../../../data/lab/networks/karate-club.json'
import florentineData from '../../../../data/lab/networks/florentine-families.json'
import { forceLayout } from '../../graphUtils.js'
import { mulberry32 } from '../../rng.js'
import { fitUnit } from '../NetCanvas.jsx'
import { airportsNet, storedNet, giantOf, sourcesFor, linkLengths, longestLinks } from './capstone.js'

// The networks of module 14 and the choice shared by its three panels: the
// airports, the karate club, the Florentine families, or a network of the
// reader's own. The analyses use the largest component (`giant`).

export const NET_IDS = ['airports', 'karate', 'florentine', 'own']
export const DRAW_LIMIT = 1500 // a network without a map is drawn up to this many nodes

export const AIRPORTS = airportsNet(airportsData)
export const PRE = pre
export const COUNTS = airportsData.counts
export const LICENCE_URL = 'https://opendatacommons.org/licenses/odbl/1-0/'
export const SOURCE_URL = 'https://openflights.org/data'

const karateLabels = { of: Int32Array.from(karateData.nodes, (_, i) => (karateData.mrHi.includes(i) ? 0 : 1)), names: ['Mr. Hi', 'Officer'] }

const entry = (id, net, extra = {}) => {
  const giant = giantOf(net)
  return { id, key: id, net, giant, pre: null, sources: sourcesFor(giant.n), ...extra }
}

const ENTRIES = {
  airports: entry('airports', AIRPORTS, { pre }),
  karate: entry('karate', storedNet('karate', karateData, karateLabels)),
  florentine: entry('florentine', storedNet('florentine', florentineData)),
}

// Map positions in the unit square: longitude across, latitude 85° N to
// 60° S down (no airport of the file lies outside).
export const LAT_TOP = 85
export const LAT_SPAN = 145
export function geoPositions(geo) {
  const n = geo.lat.length
  const pos = new Float64Array(2 * n)
  for (let v = 0; v < n; v++) {
    pos[2 * v] = (geo.lng[v] + 180) / 360
    pos[2 * v + 1] = Math.min(1, Math.max(0, (LAT_TOP - geo.lat[v]) / LAT_SPAN))
  }
  return pos
}

// Where to draw the nodes of a network: its map, or the force layout used
// in the rest of the course (null above DRAW_LIMIT nodes).
const layouts = new Map()
export function positionsOf(e) {
  if (!e.giant) return null
  if (!layouts.has(e.key)) {
    const g = e.giant
    let pos = null
    if (g.geo) pos = geoPositions(g.geo)
    else if (g.n <= DRAW_LIMIT) {
      const random = mulberry32(14)
      const start = Float64Array.from({ length: 2 * g.n }, () => random())
      pos = fitUnit(forceLayout(g.n, g.A, g.B, g.A.length, start, 0.1, g.n > 300 ? 60 : 300), g.n)
    }
    layouts.set(e.key, pos)
  }
  return layouts.get(e.key)
}

// The airports' link lengths and the ten longest, computed once.
let geography = null
export function airportGeography() {
  if (!geography) {
    const km = linkLengths(AIRPORTS)
    geography = { km, longest: longestLinks(AIRPORTS, 10, km) }
  }
  return geography
}

// What to call a node of an entry's largest component.
export function describe(e, v) {
  if (e.id !== 'airports') return String(e.giant.names[v])
  return describeAirport(e.giant.orig[v])
}
export function describeAirport(o) {
  const nd = AIRPORTS.nodes
  return `${nd.code[o]} · ${nd.name[o]} · ${nd.city[o]}, ${AIRPORTS.countries[nd.country[o]]}`
}
export const shortName = (e, v) => (e.id === 'airports' ? `${e.giant.names[v]} ${AIRPORTS.nodes.city[e.giant.orig[v]]}` : String(e.giant.names[v]))

// Find an airport (index in the whole network) by code, or by the start of
// its city or name; −1 when nothing matches.
export function findAirport(query) {
  const q = query.trim().toLowerCase()
  if (!q) return -1
  const nd = AIRPORTS.nodes
  let i = nd.code.findIndex((c) => c.toLowerCase() === q)
  if (i < 0) i = nd.city.findIndex((c) => c.toLowerCase() === q)
  if (i < 0) i = nd.city.findIndex((c) => c.toLowerCase().startsWith(q))
  if (i < 0) i = nd.name.findIndex((c) => c.toLowerCase().includes(q))
  return i
}

// ---------------------------------------------------------------- the shared choice

let state = { id: 'airports', own: null, version: 0 }
const listeners = new Set()
const emit = () => listeners.forEach((f) => f())
const subscribe = (f) => {
  listeners.add(f)
  return () => listeners.delete(f)
}

export function selectNetwork(id) {
  state = { ...state, id }
  emit()
}

// `result` is what loader.js returns for a network that was read.
export function setOwnNetwork(result) {
  const version = state.version + 1
  const own = { ...entry('own', result.net), key: `own${version}`, report: result.report }
  state = { id: 'own', own, version }
  emit()
}

const EMPTY_OWN = { id: 'own', key: 'own0', net: null, giant: null, pre: null, sources: null }

export function useActive() {
  const s = useSyncExternalStore(subscribe, () => state, () => state)
  return s.id === 'own' ? s.own || EMPTY_OWN : ENTRIES[s.id]
}
