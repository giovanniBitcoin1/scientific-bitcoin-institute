import { useEffect, useMemo, useState } from 'react'
import { ORANGE, ORANGE_DARK, INK, SLATE, MUTED, MONO, Pill } from '../ui.jsx'
import { LANDS, SLOTS, SLOT_BY_ID, preset, otherEnd, verdict, eulerRoute, longestWalk, walkState } from './bridges.js'

// Panel A: the bridges of Königsberg. A schematic map of our own (a river,
// two banks, two islands, bridge slots) beside the same thing as a graph of
// four nodes. Walk mode crosses bridges one at a time; Edit mode switches
// slots on and off. Everything is tapped, nothing is dragged, so the panel
// never captures a swipe.

const T = {
  en: {
    presets: { y1736: '1736', today: 'Today' },
    walk: 'Walk',
    edit: 'Edit',
    undo: 'Undo',
    reset: 'Reset',
    route: 'Show a route',
    best: 'Best possible',
    lands: { N: 'North bank', S: 'South bank', K: 'Kneiphof', L: 'Lomse' },
    mapAria: 'Schematic map: a river, its two banks, the islands Kneiphof and Lomse, and the bridges between them.',
    graphAria: 'The same layout as a graph: four nodes, one link per bridge, the degree written in each node.',
    map: 'Map',
    graph: 'Graph',
    degreeNote: 'Number in each node: its bridges. Orange: odd.',
    bridges: (n) => `${n} bridge${n === 1 ? '' : 's'}`,
    v: {
      empty: 'No bridges: nothing to cross.',
      split: 'The bridges are not all connected to one another, so no single walk can cross them all.',
      circuit: 'No land mass has an odd number of bridges: a closed tour exists, and it can start anywhere.',
      trail: (a, b) =>
        `Two land masses have an odd number of bridges (${a} and ${b}): a walk over every bridge exists, but it must start on one of them and end on the other.`,
      none: (n) => `${n} land masses have an odd number of bridges: no walk can cross every bridge exactly once.`,
    },
    editHint: 'Tap a bridge, or a dashed slot, to switch it on or off.',
    start: 'Tap a land mass to start the walk.',
    status: (land, done, left) => `You are on ${land}. Crossed ${done}, left ${left}. Tap a bridge that touches it.`,
    stuck: (land, left) => `Stuck on ${land}: ${left} bridge${left === 1 ? '' : 's'} left, none of them here.`,
    doneTour: (land) => `Every bridge crossed once, and you are back on ${land}: a closed tour.`,
    doneWalk: (a, b) => `Every bridge crossed once, from ${a} to ${b}.`,
    bestIs: (n, total) => `Longest walk that repeats no bridge: ${n} of ${total}.`,
  },
  it: {
    presets: { y1736: '1736', today: 'Oggi' },
    walk: 'Cammina',
    edit: 'Modifica',
    undo: 'Annulla',
    reset: 'Azzera',
    route: 'Mostra un percorso',
    best: 'Il meglio possibile',
    lands: { N: 'Riva nord', S: 'Riva sud', K: 'Kneiphof', L: 'Lomse' },
    mapAria: 'Mappa schematica: un fiume, le sue due rive, le isole Kneiphof e Lomse e i ponti che le uniscono.',
    graphAria: 'La stessa disposizione come grafo: quattro nodi, un collegamento per ponte, il grado scritto in ogni nodo.',
    map: 'Mappa',
    graph: 'Grafo',
    degreeNote: 'Numero in ogni nodo: i suoi ponti. Arancione: dispari.',
    bridges: (n) => `${n} pont${n === 1 ? 'e' : 'i'}`,
    v: {
      empty: 'Nessun ponte: niente da attraversare.',
      split: 'I ponti non sono tutti collegati tra loro, quindi nessuna passeggiata può attraversarli tutti.',
      circuit: 'Nessuna zona ha un numero dispari di ponti: esiste un giro chiuso, e può partire da qualsiasi punto.',
      trail: (a, b) =>
        `Due zone hanno un numero dispari di ponti (${a} e ${b}): una passeggiata su tutti i ponti esiste, ma deve partire da una e finire sull'altra.`,
      none: (n) => `${n} zone hanno un numero dispari di ponti: nessuna passeggiata può attraversare ogni ponte esattamente una volta.`,
    },
    editHint: 'Tocca un ponte, o una sede tratteggiata, per attivarlo o disattivarlo.',
    start: 'Tocca una zona per iniziare la passeggiata.',
    status: (land, done, left) => `Sei su ${land}. Attraversati ${done}, rimasti ${left}. Tocca un ponte che la tocca.`,
    stuck: (land, left) => `Bloccato su ${land}: ${left === 1 ? 'resta 1 ponte, ma non è qui' : `restano ${left} ponti, ma nessuno è qui`}.`,
    doneTour: (land) => `Ogni ponte attraversato una volta, e sei di nuovo su ${land}: un giro chiuso.`,
    doneWalk: (a, b) => `Ogni ponte attraversato una volta, da ${a} a ${b}.`,
    bestIs: (n, total) => `La passeggiata più lunga che non ripete alcun ponte: ${n} su ${total}.`,
  },
}

// ---------------------------------------------------------------- Map geometry
// viewBox 0 0 400 250. The river runs left to right between the two banks;
// Lomse continues beyond the right edge.

const BANK_N = 62 // lower edge of the north bank
const BANK_S = 188 // upper edge of the south bank
const KNEIPHOF = { x: 96, y: 98, w: 120, h: 54 }
const LOMSE = { x: 262, y: 92, w: 170, h: 66 }

// Each slot as a segment (x1, y1) → (x2, y2) across the water.
const SPAN = {
  NK1: [120, BANK_N, 120, KNEIPHOF.y],
  NK2: [156, BANK_N, 156, KNEIPHOF.y],
  NK3: [192, BANK_N, 192, KNEIPHOF.y],
  SK1: [120, KNEIPHOF.y + KNEIPHOF.h, 120, BANK_S],
  SK2: [156, KNEIPHOF.y + KNEIPHOF.h, 156, BANK_S],
  SK3: [192, KNEIPHOF.y + KNEIPHOF.h, 192, BANK_S],
  KL1: [KNEIPHOF.x + KNEIPHOF.w, 114, LOMSE.x, 114],
  KL2: [KNEIPHOF.x + KNEIPHOF.w, 138, LOMSE.x, 138],
  NL1: [300, BANK_N, 300, LOMSE.y],
  NL2: [348, BANK_N, 348, LOMSE.y],
  SL1: [300, LOMSE.y + LOMSE.h, 300, BANK_S],
  SL2: [348, LOMSE.y + LOMSE.h, 348, BANK_S],
  NS1: [46, BANK_N, 46, BANK_S],
}

const LAND_LABEL = { N: [200, 30], S: [200, 226], K: [156, 129], L: [330, 129] }

// ---------------------------------------------------------------- Graph geometry
// viewBox 0 0 290 250.

const NODE = { N: [152, 34], S: [152, 216], K: [94, 125], L: [216, 125] }

// A link of the graph as an SVG path. Parallel links fan out; the direct
// north–south link swings round the left of Kneiphof.
function linkPath(slot, index, count) {
  const [x1, y1] = NODE[slot.a]
  const [x2, y2] = NODE[slot.b]
  if (slot.a === 'N' && slot.b === 'S') return `M${x1},${y1} Q-40,125 ${x2},${y2}`
  const mx = (x1 + x2) / 2
  const my = (y1 + y2) / 2
  const len = Math.hypot(x2 - x1, y2 - y1)
  const off = (index - (count - 1) / 2) * 26
  const cx = mx + (-(y2 - y1) / len) * off
  const cy = my + ((x2 - x1) / len) * off
  return `M${x1},${y1} Q${cx},${cy} ${x2},${y2}`
}

const STEP_MS = 650

export default function BridgesPanel({ lang = 'en' }) {
  const t = T[lang] || T.en
  const [active, setActive] = useState(() => preset('y1736'))
  const [mode, setMode] = useState('walk')
  const [start, setStart] = useState(null)
  const [steps, setSteps] = useState([])
  const [queue, setQueue] = useState(null) // bridges still to be crossed by an animated route
  const [bestShown, setBestShown] = useState(null)

  const v = useMemo(() => verdict(active), [active])
  const walk = start ? walkState(active, start, steps) : null
  const crossedAt = Object.fromEntries(steps.map((id, i) => [id, i + 1]))

  // An animated route crosses one bridge every STEP_MS.
  useEffect(() => {
    if (!queue || !queue.length) return
    const id = setTimeout(() => {
      setSteps((s) => [...s, queue[0]])
      setQueue(queue.slice(1))
    }, STEP_MS)
    return () => clearTimeout(id)
  }, [queue])

  const resetWalk = () => {
    setStart(null)
    setSteps([])
    setQueue(null)
    setBestShown(null)
  }
  const load = (ids) => {
    setActive(ids)
    resetWalk()
  }
  const play = (route) => {
    setMode('walk')
    setStart(route.start)
    setSteps([])
    setQueue(route.steps)
    setBestShown(null)
  }

  const onLand = (land) => {
    if (mode !== 'walk' || queue?.length) return
    if (!start || steps.length === 0) {
      setStart(land)
      setBestShown(null)
    }
  }
  const onSlot = (id) => {
    if (mode === 'edit') {
      load(active.includes(id) ? active.filter((x) => x !== id) : SLOTS.filter((s) => s.id === id || active.includes(s.id)).map((s) => s.id))
      return
    }
    if (queue?.length || !walk || !walk.moves.includes(id)) return
    setSteps([...steps, id])
  }
  const undo = () => {
    setQueue(null)
    if (steps.length) setSteps(steps.slice(0, -1))
    else setStart(null)
  }

  const isPreset = (name) => {
    const ids = preset(name)
    return ids.length === active.length && ids.every((id) => active.includes(id))
  }

  let status = t.start
  if (mode === 'edit') status = t.editHint
  else if (walk) {
    if (walk.done) status = walk.land === start ? t.doneTour(t.lands[start]) : t.doneWalk(t.lands[start], t.lands[walk.land])
    else if (walk.stuck) status = t.stuck(t.lands[walk.land], walk.left.length)
    else status = t.status(t.lands[walk.land], steps.length, walk.left.length)
  }

  let verdictText = t.v[v.kind]
  if (v.kind === 'trail') verdictText = t.v.trail(t.lands[v.odd[0]], t.lands[v.odd[1]])
  if (v.kind === 'none') verdictText = t.v.none(v.odd.length)
  const good = v.kind === 'circuit' || v.kind === 'trail'

  const landFill = (land) => (walk && walk.land === land ? '#ffedd5' : '#f8fafc')
  const landStroke = (land) => (walk && walk.land === land ? ORANGE_DARK : '#cbd5e1')
  const landProps = (land) => ({
    onClick: () => onLand(land),
    className: mode === 'walk' && (!start || steps.length === 0) ? 'cursor-pointer' : '',
    fill: landFill(land),
    stroke: landStroke(land),
    strokeWidth: walk && walk.land === land ? 2.5 : 1.5,
  })

  // Parallel links of the graph: position of each active slot among its pair.
  const groups = {}
  for (const id of active) {
    const s = SLOT_BY_ID[id]
    ;(groups[s.a + s.b] ||= []).push(id)
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        {['y1736', 'today'].map((name) => (
          <Pill key={name} active={isPreset(name)} onClick={() => load(preset(name))}>
            {t.presets[name]}
          </Pill>
        ))}
        <span className="mx-1 h-5 w-px bg-slate-200" aria-hidden="true" />
        <div className="inline-flex rounded-full border border-slate-200 p-0.5" role="group">
          {['walk', 'edit'].map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={mode === m}
              onClick={() => {
                setMode(m)
                setQueue(null)
              }}
              className={`px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider transition-colors ${
                mode === m ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-orange-600'
              }`}
            >
              {t[m]}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-[3fr_2fr] items-start">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-wider text-slate-500 font-mono">
            {t.map} · {t.bridges(active.length)}
          </p>
          <svg viewBox="0 0 400 250" className="mt-1 w-full h-auto rounded-lg border border-slate-200 select-none" role="img" aria-label={t.mapAria}>
            <rect x="0" y="0" width="400" height="250" fill="#dbeafe" />
            <rect x="-2" y="-2" width="404" height={BANK_N + 2} {...landProps('N')} />
            <rect x="-2" y={BANK_S} width="404" height={250 - BANK_S + 2} {...landProps('S')} />
            <rect x={KNEIPHOF.x} y={KNEIPHOF.y} width={KNEIPHOF.w} height={KNEIPHOF.h} rx="22" {...landProps('K')} />
            <rect x={LOMSE.x} y={LOMSE.y} width={LOMSE.w} height={LOMSE.h} rx="26" {...landProps('L')} />
            {LANDS.map((land) => (
              <text
                key={land}
                x={LAND_LABEL[land][0]}
                y={LAND_LABEL[land][1]}
                textAnchor="middle"
                fontSize="12"
                fontFamily={MONO}
                fill={SLATE}
                pointerEvents="none"
              >
                {t.lands[land]}
              </text>
            ))}
            {SLOTS.map((s) => {
              const [x1, y1, x2, y2] = SPAN[s.id]
              const on = active.includes(s.id)
              if (!on && mode !== 'edit') return null
              const order = crossedAt[s.id]
              const canCross = mode === 'walk' && walk && walk.moves.includes(s.id) && !queue?.length
              const vertical = x1 === x2
              const color = order ? ORANGE : INK
              return (
                <g key={s.id} onClick={() => onSlot(s.id)} className={mode === 'edit' || canCross ? 'cursor-pointer' : ''}>
                  {/* generous hit area */}
                  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="transparent" strokeWidth="30" />
                  {on ? (
                    <>
                      <line x1={x1} y1={y1 - (vertical ? 3 : 0)} x2={x2} y2={y2 + (vertical ? 3 : 0)} stroke={color} strokeWidth="13" />
                      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={order ? '#fff7ed' : '#e2e8f0'} strokeWidth="7" />
                      {canCross && <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={ORANGE} strokeWidth="7" strokeDasharray="4 4" />}
                    </>
                  ) : (
                    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={MUTED} strokeWidth="11" strokeDasharray="3 4" opacity="0.7" />
                  )}
                  {order && (
                    <g pointerEvents="none">
                      <circle cx={(x1 + x2) / 2} cy={(y1 + y2) / 2} r="9" fill={ORANGE_DARK} />
                      <text x={(x1 + x2) / 2} y={(y1 + y2) / 2 + 3.5} textAnchor="middle" fontSize="10" fontFamily={MONO} fill="#fff">
                        {order}
                      </text>
                    </g>
                  )}
                </g>
              )
            })}
          </svg>
        </div>

        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-wider text-slate-500 font-mono">{t.graph}</p>
          <svg viewBox="0 0 290 250" className="mt-1 w-full max-w-[320px] mx-auto h-auto" role="img" aria-label={t.graphAria}>
            {active.map((id) => {
              const s = SLOT_BY_ID[id]
              const g = groups[s.a + s.b]
              const order = crossedAt[id]
              return (
                <path
                  key={id}
                  d={linkPath(s, g.indexOf(id), g.length)}
                  fill="none"
                  stroke={order ? ORANGE : SLATE}
                  strokeWidth={order ? 3 : 1.75}
                />
              )
            })}
            {LANDS.map((land) => {
              const [x, y] = NODE[land]
              const k = v.degrees[land]
              const odd = k % 2 === 1
              const here = walk && walk.land === land
              const labelY = land === 'N' ? y - 22 : y + 32
              const labelX = land === 'K' ? x - 4 : land === 'L' ? x + 4 : x
              const anchor = land === 'K' ? 'end' : land === 'L' ? 'start' : 'middle'
              return (
                <g key={land} onClick={() => onLand(land)} className={mode === 'walk' && (!start || steps.length === 0) ? 'cursor-pointer' : ''}>
                  {here && <circle cx={x} cy={y} r="21" fill="none" stroke={INK} strokeWidth="2" />}
                  <circle cx={x} cy={y} r="16" fill={odd ? ORANGE_DARK : '#fff'} stroke={odd ? ORANGE_DARK : INK} strokeWidth="1.5" />
                  <text x={x} y={y + 5} textAnchor="middle" fontSize="14" fontFamily={MONO} fontWeight="600" fill={odd ? '#fff' : INK}>
                    {k}
                  </text>
                  <text x={labelX} y={labelY} textAnchor={anchor} fontSize="11" fontFamily={MONO} fill={SLATE}>
                    {t.lands[land]}
                  </text>
                </g>
              )
            })}
          </svg>
          <p className="mt-1 text-xs text-slate-500 text-center">{t.degreeNote}</p>
        </div>
      </div>

      <p
        className={`mt-4 rounded-lg border px-3 py-2 text-sm leading-snug ${
          good ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-slate-200 bg-slate-50 text-slate-800'
        }`}
        aria-live="polite"
      >
        {verdictText}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Pill onClick={undo} disabled={mode !== 'walk' || !start}>
          {t.undo}
        </Pill>
        <Pill onClick={resetWalk} disabled={mode !== 'walk' || !start}>
          {t.reset}
        </Pill>
        <Pill primary onClick={() => play(eulerRoute(active))} disabled={!good}>
          {t.route}
        </Pill>
        <Pill
          onClick={() => {
            const best = longestWalk(active)
            play(best)
            setBestShown(best.steps.length)
          }}
          disabled={!active.length}
        >
          {t.best}
        </Pill>
      </div>
      <p className="mt-3 font-mono text-sm text-slate-700 min-h-[2.5rem]" aria-live="polite">
        {status}
        {bestShown != null && <span className="block text-slate-900">{t.bestIs(bestShown, active.length)}</span>}
      </p>
    </div>
  )
}
