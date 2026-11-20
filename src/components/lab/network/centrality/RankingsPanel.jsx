import { useMemo, useRef, useState } from 'react'
import Slider from '../../Slider.jsx'
import { forceLayout } from '../../graphUtils.js'
import { ORANGE_DARK, INK, SLATE, MONO, useElementWidth, Pill, Eyebrow, fmt } from '../ui.jsx'
import { fitUnit } from '../NetCanvas.jsx'
import {
  MEASURE_IDS, KATZ_DEFAULT, DAMPING_DEFAULT, allMeasures, correlationMatrix, places, pieces, shortestPaths,
} from './centrality.js'
import { fromData, KITE, GROUPS, startLayout } from './networks.js'
import karateData from '../../../../data/lab/networks/karate-club.json'
import florentineData from '../../../../data/lab/networks/florentine-families.json'

// Panel A, "Rankings compared": one small network, seven measures of
// centrality. Node size and colour follow the chosen measure; the tables put
// the seven rankings side by side. Tapping inspects a node, picks the two
// ends of a path, or removes a node or a link, and everything is recomputed.
//
// The drawing is SVG and listens to clicks only: it never takes over a swipe.

const SKY = '#0284c7'

const NETS = {
  florence: { net: fromData(florentineData), seed: 12 },
  kite: { net: KITE },
  karate: { net: fromData(karateData), seed: 5 },
  groups: { net: GROUPS, seed: 8 },
}
const NET_IDS = ['florence', 'kite', 'karate', 'groups']

const T = {
  en: {
    network: 'Network',
    nets: {
      florence: 'Florentine families (marriages, 15 families)',
      kite: "Krackhardt's kite (10 people)",
      karate: 'Karate club (34 members)',
      groups: 'Two groups of ten and one bridge',
    },
    measure: 'Size and colour of the nodes',
    measures: {
      degree: 'Degree',
      closeness: 'Closeness',
      harmonic: 'Harmonic closeness',
      betweenness: 'Betweenness',
      eigenvector: 'Eigenvector',
      katz: 'Katz',
      pagerank: 'PageRank',
    },
    short: { degree: 'Deg', closeness: 'Clo', harmonic: 'Har', betweenness: 'Bet', eigenvector: 'Eig', katz: 'Katz', pagerank: 'PR' },
    katz: 'Katz: α as a fraction of its limit 1/λ',
    damping: 'PageRank: damping α',
    mode: 'A tap on the drawing',
    modes: { inspect: 'Inspects a node', paths: 'Picks the two ends of a path', remove: 'Removes a node or a link' },
    reset: 'Reset',
    nodes: 'Nodes',
    links: 'Links',
    pieces: 'Pieces',
    lambda: 'Leading eigenvalue λ',
    removed: (n, l) => `Removed: ${n} node${n === 1 ? '' : 's'}, ${l} link${l === 1 ? '' : 's'}.`,
    hint: {
      inspect: 'Tap a node to see where it stands under every measure.',
      paths: 'Tap two nodes: all the shortest paths between them are drawn.',
      remove: 'Tap a node or a link to remove it. Everything is recomputed.',
    },
    top: 'Top five under each measure',
    corr: 'Rank correlation between measures (Spearman)',
    corrNote: '1 means the two measures put the nodes in the same order.',
    node: (name) => `${name}: place under each measure`,
    of: (n) => `of ${n}`,
    tie: 'shared',
    value: 'Value',
    place: 'Place',
    nodeTitle: 'Place under each measure',
    none: 'No node selected.',
    pathNone: 'No path: the two nodes are in different pieces.',
    pathPick: (a) => `From ${a}: tap the other end.`,
    path: (a, b, count, len) => `${a} to ${b}: ${count} shortest path${count === 1 ? '' : 's'} of ${len} step${len === 1 ? '' : 's'}.`,
    through: (count, total, name) => `${count} of ${total} pass${count === 1 ? 'es' : ''} through ${name} (orange).`,
    throughHint: 'Choose a node with "Inspects a node" to see which paths pass through it.',
    aria: (net, measure) => `${net}: nodes sized and coloured by ${measure}`,
  },
  it: {
    network: 'Rete',
    nets: {
      florence: 'Famiglie fiorentine (matrimoni, 15 famiglie)',
      kite: "L'aquilone di Krackhardt (10 persone)",
      karate: 'Club di karate (34 membri)',
      groups: 'Due gruppi di dieci e un ponte',
    },
    measure: 'Dimensione e colore dei nodi',
    measures: {
      degree: 'Grado',
      closeness: 'Vicinanza',
      harmonic: 'Vicinanza armonica',
      betweenness: 'Intermediazione',
      eigenvector: 'Autovettore',
      katz: 'Katz',
      pagerank: 'PageRank',
    },
    short: { degree: 'Gra', closeness: 'Vic', harmonic: 'Arm', betweenness: 'Int', eigenvector: 'Aut', katz: 'Katz', pagerank: 'PR' },
    katz: 'Katz: α come frazione del suo limite 1/λ',
    damping: 'PageRank: smorzamento α',
    mode: 'Un tocco sul disegno',
    modes: { inspect: 'Esamina un nodo', paths: 'Sceglie i due estremi di un cammino', remove: 'Rimuove un nodo o un collegamento' },
    reset: 'Ripristina',
    nodes: 'Nodi',
    links: 'Collegamenti',
    pieces: 'Pezzi',
    lambda: 'Autovalore principale λ',
    removed: (n, l) => `Rimossi: ${n} nod${n === 1 ? 'o' : 'i'}, ${l} collegament${l === 1 ? 'o' : 'i'}.`,
    hint: {
      inspect: 'Tocca un nodo per vedere dove si colloca secondo ogni misura.',
      paths: 'Tocca due nodi: vengono disegnati tutti i cammini minimi tra loro.',
      remove: 'Tocca un nodo o un collegamento per rimuoverlo. Tutto viene ricalcolato.',
    },
    top: 'I primi cinque secondo ogni misura',
    corr: 'Correlazione di rango tra le misure (Spearman)',
    corrNote: '1 significa che le due misure mettono i nodi nello stesso ordine.',
    node: (name) => `${name}: posto secondo ogni misura`,
    of: (n) => `su ${n}`,
    tie: 'a pari merito',
    value: 'Valore',
    place: 'Posto',
    nodeTitle: 'Posto secondo ogni misura',
    none: 'Nessun nodo selezionato.',
    pathNone: 'Nessun cammino: i due nodi sono in pezzi diversi.',
    pathPick: (a) => `Da ${a}: tocca l'altro estremo.`,
    path: (a, b, count, len) => `Da ${a} a ${b}: ${count} cammin${count === 1 ? 'o minimo' : 'i minimi'} di ${len} pass${len === 1 ? 'o' : 'i'}.`,
    through: (count, total, name) => `${count} su ${total} pass${count === 1 ? 'a' : 'ano'} per ${name} (arancione).`,
    throughHint: 'Scegli un nodo con «Esamina un nodo» per vedere quali cammini lo attraversano.',
    aria: (net, measure) => `${net}: nodi dimensionati e colorati secondo ${measure}`,
  },
}

const DIGITS = { degree: 0, closeness: 3, harmonic: 3, betweenness: 3, eigenvector: 3, katz: 3, pagerank: 3 }

function positions(id) {
  const { net, seed } = NETS[id]
  if (net.pos) return net.pos
  return fitUnit(forceLayout(net.n, net.A, net.B, net.A.length, startLayout(net.n, seed), 0.1, 300), net.n)
}

// White to orange-600.
const shade = (t) => {
  const mix = (a, b) => Math.round(a + (b - a) * t)
  return `rgb(${mix(255, 234)}, ${mix(247, 88)}, ${mix(237, 12)})`
}

const corrShade = (v) => {
  if (!Number.isFinite(v)) return '#f1f5f9'
  const t = Math.max(0, Math.min(1, v))
  return `rgba(234, 88, 12, ${0.08 + 0.8 * t * t})`
}

export default function RankingsPanel({ lang = 'en' }) {
  const t = T[lang] || T.en
  const [netId, setNetId] = useState('florence')
  const [measureId, setMeasureId] = useState('betweenness')
  const [katzFrac, setKatzFrac] = useState(KATZ_DEFAULT)
  const [damping, setDamping] = useState(DAMPING_DEFAULT)
  const [mode, setMode] = useState('inspect')
  const [gone, setGone] = useState({ nodes: [], links: [] })
  const [selected, setSelected] = useState(null)
  const [ends, setEnds] = useState([])
  const wrapRef = useRef(null)
  const width = useElementWidth(wrapRef)

  const base = NETS[netId].net
  const pos = useMemo(() => positions(netId), [netId])

  // ---- The network as it stands after the removals, renumbered.
  const live = useMemo(() => {
    const toLive = new Int32Array(base.n).fill(-1)
    const toBase = []
    for (let v = 0; v < base.n; v++) {
      if (!gone.nodes.includes(v)) {
        toLive[v] = toBase.length
        toBase.push(v)
      }
    }
    const A = []
    const B = []
    const linkOf = []
    for (let e = 0; e < base.A.length; e++) {
      if (gone.links.includes(e) || toLive[base.A[e]] < 0 || toLive[base.B[e]] < 0) continue
      A.push(toLive[base.A[e]])
      B.push(toLive[base.B[e]])
      linkOf.push(e)
    }
    return { net: { n: toBase.length, A: Int32Array.from(A), B: Int32Array.from(B) }, toLive, toBase, linkOf }
  }, [base, gone])

  const m = useMemo(() => allMeasures(live.net, { katzFrac, damping }), [live, katzFrac, damping])
  const ranking = useMemo(() => Object.fromEntries(MEASURE_IDS.map((id) => [id, places(m[id])])), [m])
  const corr = useMemo(() => correlationMatrix(m), [m])
  const parts = useMemo(() => pieces(m.G), [m])

  const name = (v) => base.names[v]
  const sel = selected != null && live.toLive[selected] >= 0 ? selected : null
  const pair = ends.filter((v) => live.toLive[v] >= 0)

  // ---- Shortest paths between the two chosen ends.
  const route = useMemo(() => {
    if (pair.length < 2) return null
    const sp = shortestPaths(m.G, live.toLive[pair[0]], live.toLive[pair[1]])
    const paths = sp.paths.map((p) => p.map((v) => live.toBase[v]))
    const through = sel != null && !pair.includes(sel) ? paths.filter((p) => p.includes(sel)) : []
    const key = (a, b) => (a < b ? `${a}-${b}` : `${b}-${a}`)
    const on = new Set()
    const hot = new Set()
    for (const p of paths) for (let i = 1; i < p.length; i++) on.add(key(p[i - 1], p[i]))
    for (const p of through) for (let i = 1; i < p.length; i++) hot.add(key(p[i - 1], p[i]))
    return { ...sp, paths, through, on, hot, key }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [m, live, pair.join(), sel])

  const change = (id) => {
    setNetId(id)
    setGone({ nodes: [], links: [] })
    setSelected(null)
    setEnds([])
  }
  const reset = () => {
    setGone({ nodes: [], links: [] })
    setEnds([])
  }
  const tapNode = (v) => {
    if (mode === 'inspect') setSelected(sel === v ? null : v)
    else if (mode === 'paths') setEnds(pair.length === 1 && pair[0] !== v ? [pair[0], v] : [v])
    else {
      setGone((g) => ({ ...g, nodes: [...g.nodes, v] }))
      setEnds((e) => e.filter((x) => x !== v))
    }
  }
  const tapLink = (e) => {
    if (mode === 'remove') setGone((g) => ({ ...g, links: [...g.links, e] }))
  }

  // ---- Drawing.
  const W = Math.max(width, 280)
  const H = Math.round(Math.min(440, Math.max(330, W * 0.72)))
  const PAD = netId === 'florence' ? 38 : 22
  const X = (v) => PAD + pos[2 * v] * (W - 2 * PAD)
  const Y = (v) => PAD + pos[2 * v + 1] * (H - 2 * PAD - 8)
  const values = m[measureId]
  let max = 0
  for (const v of values) if (v > max) max = v
  const share = (v) => (max > 0 ? values[live.toLive[v]] / max : 0)
  const radius = (v) => (base.n > 20 ? 4 + 8 * Math.sqrt(share(v)) : 5 + 11 * Math.sqrt(share(v)))
  const fontSize = base.n > 20 ? 9 : 10.5

  const select = 'min-w-0 max-w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 focus:outline-none focus:border-orange-500'
  const lostLinks = base.A.length - live.net.A.length

  return (
    <div>
      <div className="grid gap-x-6 gap-y-3 md:grid-cols-2 items-end">
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700 min-w-0">
          {t.network}
          <select value={netId} onChange={(e) => change(e.target.value)} className={select}>
            {NET_IDS.map((id) => (
              <option key={id} value={id}>
                {t.nets[id]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700 min-w-0">
          {t.measure}
          <select value={measureId} onChange={(e) => setMeasureId(e.target.value)} className={select}>
            {MEASURE_IDS.map((id) => (
              <option key={id} value={id}>
                {t.measures[id]}
              </option>
            ))}
          </select>
        </label>
        <Slider label={t.katz} min={0.01} max={0.99} step={0.01} value={katzFrac} onChange={setKatzFrac} format={(v) => fmt(v, 2)} />
        <Slider label={t.damping} min={0} max={1} step={0.01} value={damping} onChange={setDamping} format={(v) => fmt(v, 2)} />
      </div>

      <div className="mt-4">
        <p className="text-sm font-medium text-slate-700">{t.mode}</p>
        <div className="mt-1.5 flex flex-wrap gap-2">
          {['inspect', 'paths', 'remove'].map((id) => (
            <Pill key={id} active={mode === id} onClick={() => setMode(id)}>
              {t.modes[id]}
            </Pill>
          ))}
          <Pill onClick={reset}>{t.reset}</Pill>
        </div>
        <p className="mt-2 text-sm text-slate-600 leading-snug">{t.hint[mode]}</p>
      </div>

      <div className="mt-3 grid gap-6 lg:grid-cols-[3fr_2fr] items-start">
        <div className="min-w-0">
          <div ref={wrapRef}>
            <svg
              width={W}
              height={H}
              viewBox={`0 0 ${W} ${H}`}
              className="block max-w-full bg-white border border-slate-200 rounded"
              role="img"
              aria-label={t.aria(t.nets[netId], t.measures[measureId])}
            >
              {live.linkOf.map((e) => {
                const a = base.A[e]
                const b = base.B[e]
                const k = route ? route.key(a, b) : ''
                const hot = route && route.hot.has(k)
                const on = route && route.on.has(k)
                return (
                  <g key={e} onClick={() => tapLink(e)} className={mode === 'remove' ? 'cursor-pointer' : ''} data-link={e}>
                    <line x1={X(a)} y1={Y(a)} x2={X(b)} y2={Y(b)} stroke="transparent" strokeWidth="14" />
                    <line
                      x1={X(a)}
                      y1={Y(a)}
                      x2={X(b)}
                      y2={Y(b)}
                      stroke={hot ? ORANGE_DARK : on ? SKY : SLATE}
                      strokeOpacity={hot || on ? 1 : 0.5}
                      strokeWidth={hot || on ? 3.2 : 1.2}
                      strokeLinecap="round"
                    />
                  </g>
                )
              })}
              {live.toBase.map((v) => {
                const r = radius(v)
                const isEnd = pair.includes(v)
                return (
                  <g key={v} onClick={() => tapNode(v)} className="cursor-pointer" data-node={name(v)}>
                    <circle cx={X(v)} cy={Y(v)} r={Math.max(r, 12)} fill="transparent" />
                    <circle cx={X(v)} cy={Y(v)} r={r} fill={shade(share(v))} stroke={INK} strokeWidth="1.2" />
                    {sel === v && <circle cx={X(v)} cy={Y(v)} r={r + 3.5} fill="none" stroke={INK} strokeWidth="2" />}
                    {isEnd && <circle cx={X(v)} cy={Y(v)} r={r + 3.5} fill="none" stroke={SKY} strokeWidth="2.5" />}
                    <text
                      x={X(v)}
                      y={Y(v) + r + fontSize + 1}
                      textAnchor="middle"
                      fontSize={fontSize}
                      fontFamily={MONO}
                      fontWeight={sel === v || isEnd ? 700 : 400}
                      fill={INK}
                      stroke="#fff"
                      strokeWidth="2.5"
                      paintOrder="stroke"
                    >
                      {name(v)}
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>
          <p className="mt-2 font-mono text-xs text-slate-700 tabular-nums" aria-live="polite" data-readout="state">
            {t.nodes}: {live.net.n} · {t.links}: {live.net.A.length} · {t.pieces}: {parts.count}
            {parts.count > 1 ? ` (${parts.sizes.join(', ')})` : ''} · {t.lambda}: {fmt(m.lambda, 3)}
          </p>
          {(gone.nodes.length > 0 || lostLinks > 0) && (
            <p className="mt-1 text-xs text-slate-500">{t.removed(gone.nodes.length, lostLinks)}</p>
          )}
          <div className="mt-2 min-h-[2.5rem] text-sm text-slate-700 leading-snug" aria-live="polite" data-readout="paths">
            {pair.length === 1 && <p>{t.pathPick(name(pair[0]))}</p>}
            {route && route.count === 0 && <p>{t.pathNone}</p>}
            {route && route.count > 0 && (
              <>
                <p>
                  {t.path(name(pair[0]), name(pair[1]), route.count, route.length)}{' '}
                  {sel != null && !pair.includes(sel) ? (
                    <span className="font-semibold text-orange-700">{t.through(route.through.length, route.paths.length, name(sel))}</span>
                  ) : (
                    <span className="text-slate-500">{t.throughHint}</span>
                  )}
                </p>
                <ul className="mt-1 font-mono text-xs">
                  {route.paths.slice(0, 6).map((p, i) => (
                    <li key={i} className={route.through.includes(p) ? 'text-orange-700 font-semibold' : 'text-slate-600'}>
                      {p.map(name).join(' – ')}
                    </li>
                  ))}
                  {route.paths.length > 6 && <li className="text-slate-500">…</li>}
                </ul>
              </>
            )}
          </div>
        </div>

        <div className="min-w-0">
          <Eyebrow>{sel != null ? t.node(name(sel)) : t.nodeTitle}</Eyebrow>
          {sel == null ? (
            <p className="mt-2 text-sm text-slate-500">{t.none}</p>
          ) : (
            <table className="mt-2 w-full text-sm" data-readout="node">
              <thead>
                <tr>
                  <th />
                  <th scope="col" className="pb-1 px-2 text-right font-mono text-xs uppercase tracking-wider text-slate-500 font-semibold">
                    {t.value}
                  </th>
                  <th scope="col" className="pb-1 pl-2 text-right font-mono text-xs uppercase tracking-wider text-orange-600 font-semibold">
                    {t.place}
                  </th>
                </tr>
              </thead>
              <tbody>
                {MEASURE_IDS.map((id) => {
                  const v = live.toLive[sel]
                  return (
                    <tr key={id} className="border-t border-slate-100">
                      <th scope="row" className="py-1.5 pr-2 text-left font-normal text-slate-600">
                        {t.measures[id]}
                      </th>
                      <td className="py-1.5 px-2 text-right font-mono tabular-nums text-slate-900">{fmt(m[id][v], DIGITS[id])}</td>
                      <td className="py-1.5 pl-2 text-right font-mono tabular-nums text-orange-700 whitespace-nowrap">
                        {ranking[id].place[v]}
                        {ranking[id].tied[v] ? '=' : ''} <span className="text-slate-400">{t.of(live.net.n)}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="mt-6">
        <Eyebrow>{t.top}</Eyebrow>
        <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3" data-readout="top">
          {MEASURE_IDS.map((id) => (
            <div key={id} className={`min-w-0 rounded-lg border px-3 py-2 bg-white ${id === measureId ? 'border-orange-400' : 'border-slate-200'}`}>
              <p className="text-xs font-semibold text-slate-900">{t.measures[id]}</p>
              <ol className="mt-1 space-y-0.5">
                {ranking[id].order.slice(0, 5).map((v) => (
                  <li key={v} className="flex items-baseline justify-between gap-2 text-xs">
                    <span className="min-w-0 truncate text-slate-700">
                      <span className="font-mono text-slate-400">
                        {ranking[id].place[v]}
                        {ranking[id].tied[v] ? '=' : ''}
                      </span>{' '}
                      {name(live.toBase[v])}
                    </span>
                    <span className="font-mono tabular-nums text-slate-900">{fmt(m[id][v], DIGITS[id])}</span>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <Eyebrow>{t.corr}</Eyebrow>
        <div className="mt-2 overflow-x-auto">
          <table className="text-[11px] font-mono tabular-nums border-separate" style={{ borderSpacing: 2 }} data-readout="corr">
            <thead>
              <tr>
                <th />
                {MEASURE_IDS.map((id) => (
                  <th key={id} scope="col" className="px-1 pb-0.5 font-semibold text-slate-600" title={t.measures[id]}>
                    {t.short[id]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MEASURE_IDS.map((a, i) => (
                <tr key={a}>
                  <th scope="row" className="pr-1 text-left font-semibold text-slate-600" title={t.measures[a]}>
                    {t.short[a]}
                  </th>
                  {MEASURE_IDS.map((b, j) => (
                    <td key={b} className="w-9 h-7 text-center text-slate-900 rounded-sm" style={{ background: corrShade(corr[i][j]) }}>
                      {i === j ? '1' : fmt(corr[i][j], 2)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-1 text-xs text-slate-500 leading-snug">{t.corrNote}</p>
      </div>
    </div>
  )
}
