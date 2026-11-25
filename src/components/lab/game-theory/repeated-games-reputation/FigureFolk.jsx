import { useRef, useState } from 'react'
import Slider from '../../Slider.jsx'
import DrawToggle, { canEdit, drawCanvasClass } from '../../DrawToggle.jsx'
import { MONO, SLATE, INK, ORANGE_DARK, GRID } from '../../network/ui.jsx'
import { CELLS, FEASIBLE, rationalSet, sustainableSet, weights, deltaNeeded, sustainable } from './repeated.js'
import { num } from './FigurePatience.jsx'

// Live figure F2, "Almost anything": the plane of average payoffs (v1, v2)
// of module 01's prisoner's dilemma. The four cells, the feasible set (their
// hull), the minmax lines v1 = 1 and v2 = 1, the individually rational part,
// and the part sustainable at the current δ with the simplest scheme (a
// public lottery over the cells, D for ever after a deviation). A point the
// reader moves: with the mouse, with the arrow keys (0.05) when the plane has
// focus, and by touch only while "Move" is on (the DrawToggle rule).

const S = 260
const PAD = 22
const LO = -0.5
const HI = 5.5
const sx = (v) => PAD + ((v - LO) / (HI - LO)) * (S - PAD - 6)
const sy = (v) => S - PAD - ((v - LO) / (HI - LO)) * (S - PAD - 6)
const ux = (px) => LO + ((px - PAD) / (S - PAD - 6)) * (HI - LO)
const uy = (py) => LO + ((S - PAD - py) / (S - PAD - 6)) * (HI - LO)
const poly = (pts) => pts.map((p) => `${sx(p[0]).toFixed(1)},${sy(p[1]).toFixed(1)}`).join(' ')
const ACCENT = '#fb923c' // orange-400
const SKY = '#0369a1'
const round = (v) => Math.round(v * 100) / 100
const clampV = (v) => Math.min(HI, Math.max(LO, v))

const T = {
  en: {
    delta: 'δ, patience',
    move: 'Move',
    v: 'The point (v1, v2)',
    lottery: 'Lottery',
    need: 'δ it needs',
    here: 'At this δ',
    notFeasible: 'not feasible',
    notRational: 'never: below the minmax 1',
    limit: 'only as δ → 1',
    none: '0 (the stage equilibrium)',
    yes: 'sustainable',
    no: 'not sustainable',
    legend: ['feasible', 'individually rational', 'sustainable at this δ'],
    scheme: 'The shape belongs to this simple scheme (a public lottery, D for ever after a deviation); the folk theorem is about δ close to 1.',
    hint: 'Drag the point, or focus the plane and use the arrow keys.',
    aria: 'The plane of average payoffs with the four cells, the feasible set, the individually rational part and the part sustainable at the current δ; a movable point',
  },
  it: {
    delta: 'δ, la pazienza',
    move: 'Sposta',
    v: 'Il punto (v1, v2)',
    lottery: 'Lotteria',
    need: 'δ necessario',
    here: 'Con questo δ',
    notFeasible: 'non ammissibile',
    notRational: 'mai: sotto il minmax 1',
    limit: 'solo per δ → 1',
    none: '0 (l’equilibrio del gioco costituente)',
    yes: 'sostenibile',
    no: 'non sostenibile',
    legend: ['ammissibili', 'individualmente razionali', 'sostenibili con questo δ'],
    scheme: 'La forma è quella di questo schema semplice (una lotteria pubblica, D per sempre dopo una deviazione); il folk theorem riguarda δ vicino a 1.',
    hint: 'Trascina il punto, oppure seleziona il piano e usa i tasti freccia.',
    aria: 'Il piano dei payoff medi con le quattro celle, l’insieme ammissibile, la parte individualmente razionale e quella sostenibile con il δ attuale; un punto che si può spostare',
  },
}

export default function FigureFolk({ lang = 'en' }) {
  const L = T[lang] || T.en
  const [delta, setDelta] = useState(0.75)
  const [v, setV] = useState([2.5, 2.5])
  const [moveOn, setMoveOn] = useState(false)
  const [dragging, setDragging] = useState(false)
  const svgRef = useRef(null)
  const n = (x, d = 2) => num(x, lang, d)

  const toPlane = (e) => {
    const r = svgRef.current.getBoundingClientRect()
    const px = ((e.clientX - r.left) / r.width) * S
    const py = ((e.clientY - r.top) / r.height) * S
    return [round(clampV(ux(px))), round(clampV(uy(py)))]
  }
  const onPointerDown = (e) => {
    if (!canEdit(moveOn, e)) return
    e.currentTarget.setPointerCapture?.(e.pointerId)
    setDragging(true)
    setV(toPlane(e))
  }
  const onPointerMove = (e) => {
    if (!dragging || !canEdit(moveOn, e)) return
    setV(toPlane(e))
  }
  const stop = () => setDragging(false)
  const onKeyDown = (e) => {
    const d = { ArrowLeft: [-0.05, 0], ArrowRight: [0.05, 0], ArrowUp: [0, 0.05], ArrowDown: [0, -0.05] }[e.key]
    if (!d) return
    e.preventDefault()
    setV(([a, b]) => [round(clampV(a + d[0])), round(clampV(b + d[1]))])
  }

  const ir = rationalSet()
  const sus = sustainableSet(delta)
  const w = weights(v)
  const need = deltaNeeded(v)
  const ok = sustainable(v, delta)
  const needText = !need.feasible ? L.notFeasible : !need.rational ? L.notRational : need.delta === 0 ? L.none : need.delta >= 1 - 1e-12 ? L.limit : n(need.delta, 4)
  const lotteryText = w
    ? Object.entries(w)
        .filter(([, x]) => x > 1e-9)
        .map(([k, x]) => `${k} ${n(x, 2)}`)
        .join(lang === 'it' ? '; ' : ', ')
    : '–'
  const ticks = [0, 1, 2, 3, 4, 5]

  return (
    <div>
      <div className="grid gap-x-8 gap-y-3 sm:grid-cols-[minmax(0,1fr)_auto] items-end max-w-3xl">
        <Slider label={L.delta} min={0.3} max={0.99} step={0.01} value={delta} onChange={setDelta} format={(x) => n(x, 2)} />
        <DrawToggle on={moveOn} onChange={(on) => { setMoveOn(on); setDragging(false) }} label={L.move} />
      </div>
      <div className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-[minmax(0,17rem)_minmax(0,1fr)] items-start max-w-3xl">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${S} ${S}`}
          className={`w-full h-auto max-w-[17rem] outline-none focus-visible:ring-2 focus-visible:ring-orange-400 rounded ${drawCanvasClass(moveOn)}`}
          role="img"
          aria-label={L.aria}
          tabIndex={0}
          onKeyDown={onKeyDown}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={stop}
          onPointerCancel={stop}
          data-role="folk-plane"
          data-draw-surface
        >
          {ticks.map((t) => (
            <g key={t}>
              <line x1={sx(t)} x2={sx(t)} y1={sy(LO)} y2={sy(HI)} stroke={GRID} />
              <line x1={sx(LO)} x2={sx(HI)} y1={sy(t)} y2={sy(t)} stroke={GRID} />
              <text x={sx(t)} y={S - PAD + 11} fontSize="8" fontFamily={MONO} fill={SLATE} textAnchor="middle">
                {t}
              </text>
              <text x={PAD - 4} y={sy(t) + 3} fontSize="8" fontFamily={MONO} fill={SLATE} textAnchor="end">
                {t}
              </text>
            </g>
          ))}
          <polygon points={poly(FEASIBLE)} fill="#e2e8f0" stroke={SLATE} strokeWidth="0.8" data-region="feasible" />
          <polygon points={poly(ir)} fill="#cbd5e1" data-region="rational" />
          {sus.map((p, i) => (
            <polygon key={i} points={poly(p)} fill={ACCENT} opacity="0.85" data-region="sustainable" />
          ))}
          <circle cx={sx(1)} cy={sy(1)} r="3" fill={ACCENT} data-region="dd" />
          <line x1={sx(1)} x2={sx(1)} y1={sy(LO)} y2={sy(HI)} stroke={SLATE} strokeDasharray="3 2" />
          <line x1={sx(LO)} x2={sx(HI)} y1={sy(1)} y2={sy(1)} stroke={SLATE} strokeDasharray="3 2" />
          {Object.entries(CELLS).map(([k, [a, b]]) => (
            <g key={k}>
              <circle cx={sx(a)} cy={sy(b)} r="2.5" fill={INK} />
              <text x={sx(a) + (a >= 5 ? -4 : 4)} y={sy(b) + (b >= 5 ? 10 : -4)} fontSize="9" fontFamily={MONO} fill={INK} textAnchor={a >= 5 ? 'end' : 'start'}>
                {k}
              </text>
            </g>
          ))}
          <circle cx={sx(v[0])} cy={sy(v[1])} r="5.5" fill="white" stroke={ok ? ORANGE_DARK : SKY} strokeWidth="2.5" data-role="folk-point" style={{ cursor: 'grab' }} />
          <text x={S - 6} y={S - 2} fontSize="8" fontFamily={MONO} fill={SLATE} textAnchor="end">
            v1 →
          </text>
          <text x={PAD + 2} y={10} fontSize="8" fontFamily={MONO} fill={SLATE}>
            ↑ v2
          </text>
        </svg>
        <div className="min-w-0">
          <dl className="grid grid-cols-2 sm:grid-cols-1 gap-x-4 gap-y-1 text-sm" data-role="folk-readout">
            {[
              [L.v, `(${n(v[0])}, ${n(v[1])})`, 'v'],
              [L.lottery, lotteryText, 'lottery'],
              [L.need, needText, 'need'],
              [L.here, ok ? L.yes : L.no, 'here'],
            ].map(([label, x, key]) => (
              <div key={key} className="min-w-0">
                <dt className="text-xs text-slate-500">{label}</dt>
                <dd className="font-mono tabular-nums text-slate-900 break-words" data-value={key}>
                  {x}
                </dd>
              </div>
            ))}
          </dl>
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-600">
            {L.legend.map((label, i) => (
              <span key={label} className="inline-flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 rounded-sm" style={{ background: ['#e2e8f0', '#cbd5e1', ACCENT][i] }} />
                {label}
              </span>
            ))}
          </div>
          <p className="mt-2 text-xs text-slate-500 leading-snug">{L.hint}</p>
        </div>
      </div>
      <p className="mt-2 text-xs text-slate-600 leading-snug max-w-3xl">{L.scheme}</p>
    </div>
  )
}
