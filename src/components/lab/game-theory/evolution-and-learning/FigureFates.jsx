import { useRef, useState } from 'react'
import DrawToggle, { canEdit, drawCanvasClass } from '../../DrawToggle.jsx'
import { Pill, MONO, SLATE, INK, ORANGE_DARK, GRID } from '../../network/ui.jsx'
import { fate, xdot, F1_PRESETS } from './replicator.js'

// Live figure F1, "Four fates": module 01's (T, S) map, same axes and region
// colours as module 01's figure, with a point the reader moves (mouse; arrow
// keys by 0.05 when the map has focus; touch only while "Move" is on, the
// DrawToggle rule). Beside it the phase line of x, the share of C: the curve
// ẋ(x), arrows, rest points filled when stable and empty when not.

// The colours of module 01's FigureAtlas.
const REGION_FILL = { pd: '#fee2e2', stag: '#e0f2fe', chicken: '#fef3c7', harmony: '#dcfce7' }
const SKY = '#0369a1'

const T_ = {
  en: {
    move: 'Move',
    presets: { pd: 'Dilemma', stag: 'Stag hunt', chicken: 'Chicken', harmony: 'Harmony' },
    short: { pd: ["Prisoner's", 'Dilemma'], stag: ['Stag', 'hunt'], chicken: ['Chicken'], harmony: ['Harmony'] },
    names: { pd: "Prisoner's Dilemma", stag: 'Stag hunt', chicken: 'Chicken', harmony: 'Harmony' },
    region: 'Region',
    fateL: 'Fate',
    xs: 'x*',
    border: 'on a border',
    fates: {
      C: 'C takes over',
      D: 'D takes over',
      coexist: 'C and D coexist at x*',
      bistable: 'C or D, depending on the side of x*',
      border: 'on a border of the map',
    },
    none: 'none inside',
    stable: 'stable',
    unstable: 'unstable',
    semi: 'stable from one side',
    phase: 'ẋ against x, the share of C',
    hint: 'Drag the point, or focus the map and use the arrow keys.',
    aria: 'Map of the symmetric two-by-two games, temptation T across, sucker’s payoff S up, with a movable point',
    ariaPhase: 'The phase line: the rate of change of the share of C against the share itself, with arrows and rest points',
  },
  it: {
    move: 'Sposta',
    presets: { pd: 'Dilemma', stag: 'Caccia al cervo', chicken: 'Gioco del pollo', harmony: 'Armonia' },
    short: { pd: ['Dilemma del', 'prigioniero'], stag: ['Caccia', 'al cervo'], chicken: ['Gioco', 'del pollo'], harmony: ['Armonia'] },
    names: { pd: 'Dilemma del prigioniero', stag: 'Caccia al cervo', chicken: 'Gioco del pollo', harmony: 'Armonia' },
    region: 'Regione',
    fateL: 'Destino',
    xs: 'x*',
    border: 'su un confine',
    fates: {
      C: 'C prende il sopravvento',
      D: 'D prende il sopravvento',
      coexist: 'C e D coesistono in x*',
      bistable: 'C o D, secondo il lato di x*',
      border: 'su un confine della mappa',
    },
    none: 'nessuno all’interno',
    stable: 'stabile',
    unstable: 'instabile',
    semi: 'stabile da un lato',
    phase: 'ẋ in funzione di x, la quota di C',
    hint: 'Trascina il punto, oppure seleziona la mappa e usa i tasti freccia.',
    aria: 'Mappa dei giochi due per due simmetrici, tentazione T in orizzontale, payoff del babbeo S in verticale, con un punto che si può spostare',
    ariaPhase: 'La retta delle fasi: la velocità di variazione della quota di C in funzione della quota stessa, con frecce e punti di equilibrio',
  },
}

export const num = (v, lang, d = 2) => {
  const s = (Object.is(v, -0) ? 0 : v).toFixed(d).replace('-', '−')
  return lang === 'it' ? s.replace('.', ',') : s
}

// The map: T from 0 to 2, S from −1 to 1.
const W = 250
const H = 214
const X0 = 26
const X1 = 244
const Y0 = 6
const Y1 = 196
const px = (t) => X0 + (t / 2) * (X1 - X0)
const py = (s) => Y0 + ((1 - s) / 2) * (Y1 - Y0)
const snap = (v) => Math.round(v * 100) / 100
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))
const REGIONS = [
  { id: 'harmony', x: 0, y: 1, cx: 0.5, cy: 0.5 },
  { id: 'chicken', x: 1, y: 1, cx: 1.5, cy: 0.5 },
  { id: 'stag', x: 0, y: 0, cx: 0.5, cy: -0.5 },
  { id: 'pd', x: 1, y: 0, cx: 1.5, cy: -0.5 },
]

// The phase line.
const PW = 250
const PH = 150
const PX0 = 14
const PX1 = 240
const PMID = 78

function PhaseLine({ T, S, f, L, lang }) {
  const N = 120
  const xs = Array.from({ length: N + 1 }, (_, i) => i / N)
  const vs = xs.map((x) => xdot(x, T, S))
  const top = Math.max(0.02, ...vs.map(Math.abs))
  const qx = (x) => PX0 + x * (PX1 - PX0)
  const qy = (v) => PMID - (v / top) * 52
  // Arrows between rest points, pointing the way ẋ goes.
  const rest = f.rest.map((r) => r.x)
  const arrows = []
  for (let k = 0; k < rest.length - 1; k++) {
    const mid = (rest[k] + rest[k + 1]) / 2
    const v = xdot(mid, T, S)
    if (Math.abs(v) < 1e-12) continue
    arrows.push({ x: mid, dir: v > 0 ? 1 : -1 })
  }
  return (
    <svg viewBox={`0 0 ${PW} ${PH}`} className="w-full h-auto max-w-[17rem]" role="img" aria-label={L.ariaPhase} data-role="fates-phase">
      <text x={PX0} y={10} fontSize="8.5" fontFamily={MONO} fill={SLATE}>
        {L.phase}
      </text>
      <line x1={PX0} x2={PX1} y1={PMID} y2={PMID} stroke={SLATE} />
      <polyline points={xs.map((x, i) => `${qx(x).toFixed(1)},${qy(vs[i]).toFixed(1)}`).join(' ')} fill="none" stroke={SKY} strokeWidth="1.75" />
      {arrows.map((a, i) => (
        <path
          key={i}
          d={`M${qx(a.x) - 7 * a.dir},${PMID - 4} L${qx(a.x) + 5 * a.dir},${PMID} L${qx(a.x) - 7 * a.dir},${PMID + 4} Z`}
          fill={INK}
          data-arrow={a.dir}
        />
      ))}
      {f.rest.map((r) => (
        <circle
          key={r.x}
          cx={qx(r.x)}
          cy={PMID}
          r="4.5"
          fill={r.stable === true ? ORANGE_DARK : 'white'}
          stroke={ORANGE_DARK}
          strokeWidth="2"
          data-rest={r.stable === true ? 'stable' : r.stable === 'semi' ? 'semi' : 'unstable'}
        />
      ))}
      {[0, 0.25, 0.5, 0.75, 1].map((x) => (
        <text key={x} x={qx(x)} y={PH - 30} fontSize="8.5" fontFamily={MONO} fill={SLATE} textAnchor="middle">
          {num(x, lang, x === 0 || x === 1 ? 0 : 2)}
        </text>
      ))}
      {f.xStar != null && (
        <text x={qx(f.xStar)} y={PH - 16} fontSize="9" fontFamily={MONO} fill={ORANGE_DARK} textAnchor="middle">
          x* = {num(f.xStar, lang, 3)}
        </text>
      )}
      <text x={PX0} y={PH - 4} fontSize="8.5" fontFamily={MONO} fill={SLATE}>
        {lang === 'it' ? 'tutti D' : 'all D'}
      </text>
      <text x={PX1} y={PH - 4} fontSize="8.5" fontFamily={MONO} fill={SLATE} textAnchor="end">
        {lang === 'it' ? 'tutti C' : 'all C'}
      </text>
    </svg>
  )
}

export default function FigureFates({ lang = 'en' }) {
  const L = T_[lang] || T_.en
  const [pt, setPt] = useState({ ...F1_PRESETS.chicken })
  const [moveOn, setMoveOn] = useState(false)
  const [dragging, setDragging] = useState(false)
  const svgRef = useRef(null)
  const f = fate(pt.T, pt.S)

  const toMap = (e) => {
    const r = svgRef.current.getBoundingClientRect()
    const x = ((e.clientX - r.left) / r.width) * W
    const y = ((e.clientY - r.top) / r.height) * H
    return { T: snap(clamp(((x - X0) / (X1 - X0)) * 2, 0, 2)), S: snap(clamp(1 - ((y - Y0) / (Y1 - Y0)) * 2, -1, 1)) }
  }
  const onPointerDown = (e) => {
    if (!canEdit(moveOn, e)) return
    e.currentTarget.setPointerCapture?.(e.pointerId)
    setDragging(true)
    setPt(toMap(e))
  }
  const onPointerMove = (e) => {
    if (!dragging || !canEdit(moveOn, e)) return
    setPt(toMap(e))
  }
  const stop = () => setDragging(false)
  const onKeyDown = (e) => {
    const d = { ArrowLeft: [-0.05, 0], ArrowRight: [0.05, 0], ArrowUp: [0, 0.05], ArrowDown: [0, -0.05] }[e.key]
    if (!d) return
    e.preventDefault()
    setPt((p) => ({ T: snap(clamp(p.T + d[0], 0, 2)), S: snap(clamp(p.S + d[1], -1, 1)) }))
  }
  const active = Object.entries(F1_PRESETS).find(([, v]) => Math.abs(v.T - pt.T) < 1e-9 && Math.abs(v.S - pt.S) < 1e-9)?.[0]
  const mid = f.rest.find((r) => r.x > 0 && r.x < 1)
  const stab = (s) => (s === true ? L.stable : s === 'semi' ? L.semi : L.unstable)

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2" data-role="fates-presets">
        {Object.keys(F1_PRESETS).map((k) => (
          <Pill key={k} active={active === k} onClick={() => setPt({ ...F1_PRESETS[k] })}>
            {L.presets[k]}
          </Pill>
        ))}
        <DrawToggle on={moveOn} onChange={(on) => { setMoveOn(on); setDragging(false) }} label={L.move} />
      </div>
      <div className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-2 items-start max-w-3xl">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className={`w-full h-auto max-w-[17rem] outline-none focus-visible:ring-2 focus-visible:ring-orange-400 rounded ${drawCanvasClass(moveOn)}`}
          role="img"
          aria-label={L.aria}
          tabIndex={0}
          onKeyDown={onKeyDown}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={stop}
          onPointerCancel={stop}
          data-role="fates-map"
          data-draw-surface
        >
          {REGIONS.map((r) => (
            <g key={r.id}>
              <rect x={px(r.x)} y={py(r.y)} width={px(1) - px(0)} height={py(0) - py(1)} fill={REGION_FILL[r.id]} />
              {L.short[r.id].map((word, k, all) => (
                <text key={word} x={px(r.cx)} y={py(r.cy + 0.22) + 4 + (k - (all.length - 1) / 2) * 11} textAnchor="middle" fontSize="9" fontFamily={MONO} fill={INK}
                  opacity={f.region === r.id ? 1 : 0.55} fontWeight={f.region === r.id ? 700 : 400}>
                  {word}
                </text>
              ))}
            </g>
          ))}
          <rect x={X0} y={Y0} width={X1 - X0} height={Y1 - Y0} fill="none" stroke={SLATE} />
          <line x1={px(1)} x2={px(1)} y1={Y0} y2={Y1} stroke={SLATE} />
          <line x1={X0} x2={X1} y1={py(0)} y2={py(0)} stroke={SLATE} />
          <line x1={px(0)} x2={px(2)} y1={py(1)} y2={py(-1)} stroke={GRID} strokeDasharray="2 3" />
          {[0, 0.5, 1, 1.5, 2].map((v) => (
            <text key={v} x={px(v)} y={Y1 + 11} textAnchor="middle" fontSize="8.5" fontFamily={MONO} fill={SLATE}>
              {num(v, lang, v % 1 ? 1 : 0)}
            </text>
          ))}
          {[-1, -0.5, 0, 0.5, 1].map((v) => (
            <text key={v} x={X0 - 3} y={py(v) + 3} textAnchor="end" fontSize="8.5" fontFamily={MONO} fill={SLATE}>
              {num(v, lang, v % 1 ? 1 : 0)}
            </text>
          ))}
          <text x={X1} y={H - 1} textAnchor="end" fontSize="8.5" fontFamily={MONO} fill={SLATE}>T</text>
          <text x={X0 + 3} y={Y0 + 9} fontSize="8.5" fontFamily={MONO} fill={SLATE}>S</text>
          <circle cx={px(pt.T)} cy={py(pt.S)} r="5.5" fill={ORANGE_DARK} stroke="#fff" strokeWidth="2" data-role="fates-point" style={{ cursor: 'grab' }} />
        </svg>
        <div className="min-w-0">
          <PhaseLine T={pt.T} S={pt.S} f={f} L={L} lang={lang} />
          <dl className="mt-1 grid grid-cols-2 gap-x-4 gap-y-1 text-sm" data-role="fates-readout">
            {[
              ['(T, S)', `(${num(pt.T, lang)}, ${num(pt.S, lang)})`, 'ts'],
              [L.region, f.border ? L.border : L.names[f.region], 'region'],
              [L.fateL, L.fates[f.kind], 'fate'],
              [L.xs, mid ? `${num(mid.x, lang, 3)}, ${stab(mid.stable)}` : L.none, 'xstar'],
            ].map(([label, v, key]) => (
              <div key={key} className={`min-w-0 ${key === 'fate' ? 'col-span-2' : ''}`}>
                <dt className="text-xs text-slate-500">{label}</dt>
                <dd className="font-mono tabular-nums text-slate-900 break-words" data-value={key}>
                  {v}
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-2 text-xs text-slate-500 leading-snug">{L.hint}</p>
        </div>
      </div>
    </div>
  )
}
