import { useMemo, useState } from 'react'
import { Pill, INK } from '../ui.jsx'
import { groupColor } from '../communities/palette.js'
import MapCanvas from './MapCanvas.jsx'
import { degreesOf } from '../who-connects-to-whom/mixing.js'
import { giantOf } from './capstone.js'
import { AIRPORTS, PRE, LICENCE_URL, geoPositions, airportGeography, describeAirport, findAirport } from './store.js'

// Figure F1, "3,214 airports": every airport of the file as a dot at its
// longitude and latitude, sized by its number of routes. No base map: the
// dots draw the continents.

export const TOP_LINKS = 300
export const WRONG_CODE = 'KSLI' // the record with the coordinates of Los Alamitos (lecture, step 1)
export const REGION_COLORS = ['#0d9488', '#ea580c', '#64748b', '#ca8a04', '#0284c7', '#7c2d12', '#db2777', '#16a34a', '#a855f7']
const GREY = '#cbd5e1'
const SHOWN_GROUPS = 10

const GIANT = giantOf(AIRPORTS)
const DEGREE = degreesOf(AIRPORTS)
const POS = geoPositions(AIRPORTS.geo)
const RADII = Float64Array.from(DEGREE, (k) => 0.7 + 3.3 * Math.sqrt(k / 248))

const T = {
  en: {
    colour: { community: 'Colour: community', region: 'Colour: region' },
    top: `The ${TOP_LINKS} links with most airlines`,
    longest: 'The ten longest links',
    find: 'Code or city',
    go: 'Find',
    hint: 'Tap an airport, or type its code or city.',
    routes: (k) => `${k} route${k === 1 ? '' : 's'}`,
    outside: 'not in the largest component',
    none: 'No airport there.',
    notFound: 'No airport with that code or city.',
    longestNote: (a, b) => `Longest links, in km: ${a}. In red: ${b}.`,
    groupNote: `The ${SHOWN_GROUPS} largest groups of the best of ten runs of Louvain are coloured; the others, and the airports outside the largest component, are grey.`,
    credit: 'Contains information from the OpenFlights Airports and Routes Databases, which are made available under the',
    licence: 'Open Database License (ODbL) v1.0',
    aria: 'The airports of the world as dots at their longitude and latitude, sized by their number of routes',
    locale: 'en-US',
  },
  it: {
    colour: { community: 'Colore: comunità', region: 'Colore: regione' },
    top: `I ${TOP_LINKS} collegamenti con più compagnie`,
    longest: 'I dieci collegamenti più lunghi',
    find: 'Codice o città',
    go: 'Trova',
    hint: 'Tocca un aeroporto, oppure scrivi il suo codice o la città.',
    routes: (k) => `${k} rott${k === 1 ? 'a' : 'e'}`,
    outside: 'fuori dalla componente più grande',
    none: 'Nessun aeroporto in quel punto.',
    notFound: 'Nessun aeroporto con quel codice o quella città.',
    longestNote: (a, b) => `Collegamenti più lunghi, in km: ${a}. In rosso: ${b}.`,
    groupNote: `Sono colorati i ${SHOWN_GROUPS} gruppi più grandi della migliore di dieci esecuzioni di Louvain; gli altri, e gli aeroporti fuori dalla componente più grande, sono grigi.`,
    credit: 'Contiene informazioni tratte dagli OpenFlights Airports and Routes Databases, resi disponibili con la',
    licence: 'Open Database License (ODbL) v1.0',
    aria: 'Gli aeroporti del mondo come punti alla loro longitudine e latitudine, con dimensione proporzionale al numero di rotte',
    locale: 'it-IT',
  },
}

function colours(by) {
  if (by === 'region') return Array.from(AIRPORTS.labels.of, (r) => (r >= 0 ? REGION_COLORS[r] : GREY))
  const rank = new Map(PRE.community.groups.map((g, i) => [g.id, i]))
  return Array.from({ length: AIRPORTS.n }, (_, o) => {
    const v = GIANT.map[o]
    if (v < 0) return GREY
    const r = rank.get(PRE.community.partition[v])
    return r < SHOWN_GROUPS ? groupColor(r) : GREY
  })
}

export default function FigureMap({ lang = 'en' }) {
  const t = T[lang] || T.en
  const [by, setBy] = useState('community')
  const [top, setTop] = useState(false)
  const [longest, setLongest] = useState(false)
  const [sel, setSel] = useState(-1)
  const [query, setQuery] = useState('')
  const [message, setMessage] = useState(null)
  const colors = useMemo(() => colours(by), [by])
  const geo = longest ? airportGeography() : null
  const links = useMemo(() => {
    const out = []
    if (top) {
      const order = Array.from(AIRPORTS.w, (_, e) => e).sort((x, y) => AIRPORTS.w[y] - AIRPORTS.w[x] || x - y)
      for (const e of order.slice(0, TOP_LINKS)) out.push({ a: AIRPORTS.A[e], b: AIRPORTS.B[e], color: 'rgba(15, 23, 42, 0.22)', width: 0.8 })
    }
    if (sel >= 0) for (let e = 0; e < AIRPORTS.A.length; e++) if (AIRPORTS.A[e] === sel || AIRPORTS.B[e] === sel) out.push({ a: AIRPORTS.A[e], b: AIRPORTS.B[e], color: 'rgba(15, 23, 42, 0.45)', width: 0.7 })
    if (geo)
      for (const l of [...geo.longest].reverse()) {
        const a = AIRPORTS.A[l.e]
        const b = AIRPORTS.B[l.e]
        const wrong = AIRPORTS.names[a] === WRONG_CODE || AIRPORTS.names[b] === WRONG_CODE
        out.push({ a, b, color: wrong ? '#dc2626' : INK, width: wrong ? 2 : 1.2 })
      }
    return out
  }, [top, sel, geo])
  const rings = useMemo(() => (sel >= 0 ? [{ v: sel, color: INK }] : []), [sel])
  const pick = (v) => {
    setSel(v)
    setMessage(v < 0 ? t.none : null)
  }
  const find = (e) => {
    e.preventDefault()
    const v = findAirport(query)
    setSel(v)
    setMessage(v < 0 ? t.notFound : null)
  }
  const pair = (l) => `${AIRPORTS.names[AIRPORTS.A[l.e]]}–${AIRPORTS.names[AIRPORTS.B[l.e]]} ${Math.round(l.km).toLocaleString(t.locale)}`
  const isWrong = (l) => AIRPORTS.names[AIRPORTS.A[l.e]] === WRONG_CODE || AIRPORTS.names[AIRPORTS.B[l.e]] === WRONG_CODE

  return (
    <div data-figure="map" data-nodes={AIRPORTS.n} data-links={AIRPORTS.A.length} data-colour={by} data-selected={sel >= 0 ? AIRPORTS.names[sel] : ''} data-routes={sel >= 0 ? DEGREE[sel] : ''} data-drawn={links.length}>
      <div className="flex flex-wrap gap-2">
        {['community', 'region'].map((id) => (
          <Pill key={id} active={by === id} onClick={() => setBy(id)} data-colour={id}>
            {t.colour[id]}
          </Pill>
        ))}
        <Pill active={top} onClick={() => setTop(!top)} data-show="top">
          {t.top}
        </Pill>
        <Pill active={longest} onClick={() => setLongest(!longest)} data-show="longest">
          {t.longest}
        </Pill>
      </div>
      <div className="mt-2">
        <MapCanvas pos={POS} radii={RADII} colors={colors} links={links} rings={rings} wrap onTap={pick} ratio={0.42} maxHeight={250} aria={t.aria} />
      </div>
      <form onSubmit={find} className="mt-2 flex flex-wrap items-center gap-2">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t.find} aria-label={t.find} data-find="text" className="w-36 rounded border border-slate-200 bg-white px-2 py-1 font-mono text-xs text-slate-800" />
        <Pill type="submit" data-find="go">
          {t.go}
        </Pill>
        <span className="text-xs text-slate-600 min-w-0" data-find="result">
          {sel >= 0 ? `${describeAirport(sel)} · ${t.routes(DEGREE[sel])}${GIANT.map[sel] < 0 ? ` · ${t.outside}` : ''}` : message || t.hint}
        </span>
      </form>
      {by === 'region' && (
        <p className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-slate-600">
          {AIRPORTS.labels.names.map((name, i) => (
            <span key={name} className="inline-flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full" style={{ background: REGION_COLORS[i] }} />
              {name}
            </span>
          ))}
        </p>
      )}
      {by === 'community' && <p className="mt-1 text-xs text-slate-500 leading-snug">{t.groupNote}</p>}
      {geo && (
        <p className="mt-1 text-xs text-slate-600 leading-snug" data-longest={geo.longest.map((l) => Math.round(l.km)).join(' ')}>
          {t.longestNote(geo.longest.map(pair).join(', '), geo.longest.filter(isWrong).map(pair).join(', '))}
        </p>
      )}
      <p className="mt-1 text-xs text-slate-500 leading-snug" data-credit="openflights">
        {t.credit}{' '}
        <a href={LICENCE_URL} target="_blank" rel="noopener noreferrer" className="underline hover:text-orange-600">
          {t.licence}
        </a>
        .
      </p>
    </div>
  )
}
