import { useRef, useState } from 'react'
import Slider from '../../Slider.jsx'
import DrawToggle, { canEdit, drawCanvasClass } from '../../DrawToggle.jsx'
import { INK, SLATE, GRID, MONO, ORANGE_DARK } from '../../network/ui.jsx'
import { thresholds, totals, region, efficientKind, pairwiseStable, starNet } from './connections.js'
import { num } from './fmt.js'

// Live figure F2, "Stable or efficient?": the (δ, c) plane of the
// connections model for n players, cut by the curves c = δ − δ², c = δ and
// c = δ + (n − 2)δ²/2 into four regions. A point the reader moves (mouse,
// arrow keys by 0.01, touch with "Move" on: the DrawToggle rule) reads the
// totals of the complete network, the star and the empty one, which is
// efficient, and whether the star is pairwise stable (checked pair by pair).

const W = 300
const H = 230
const PAD = { left: 30, right: 8, top: 8, bottom: 24 }
const C_MAX = 2
const sx = (d) => PAD.left + d * (W - PAD.left - PAD.right)
const sy = (c) => H - PAD.bottom - (c / C_MAX) * (H - PAD.top - PAD.bottom)
const ux = (px) => (px - PAD.left) / (W - PAD.left - PAD.right)
const uy = (py) => ((H - PAD.bottom - py) / (H - PAD.top - PAD.bottom)) * C_MAX
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))
const r2 = (v) => Math.round(v * 100) / 100

export const COLORS = { complete: '#bae6fd', 'star-stable': '#fed7aa', 'star-unstable': '#fb923c', empty: '#e2e8f0' }
const KINDS = ['complete', 'star-stable', 'star-unstable', 'empty']

const T = {
  en: {
    n: 'n, the players',
    move: 'Move',
    regions: {
      complete: 'complete network efficient, and the only pairwise stable one',
      'star-stable': 'star efficient and pairwise stable',
      'star-unstable': 'star efficient but not pairwise stable',
      empty: 'empty network efficient',
    },
    point: 'The point (δ, c)',
    region: 'Region',
    totals: 'Total utility: complete, star, empty',
    efficient: 'Efficient',
    kinds: { complete: 'the complete network', star: 'the star', empty: 'the empty network' },
    stable: 'Is the star pairwise stable?',
    yes: 'yes',
    no: (why) => `no: ${why}`,
    whyHub: 'the hub gains by cutting a link',
    whyLeaves: 'two leaves gain by linking',
    hint: 'Drag the point, or select the plane and use the arrow keys (0.01).',
    aria: 'The plane of δ and c, cut into four regions by three curves, with a point that can be moved',
  },
  it: {
    n: 'n, i giocatori',
    move: 'Sposta',
    regions: {
      complete: 'rete completa efficiente, e l’unica stabile a coppie',
      'star-stable': 'stella efficiente e stabile a coppie',
      'star-unstable': 'stella efficiente ma non stabile a coppie',
      empty: 'rete vuota efficiente',
    },
    point: 'Il punto (δ, c)',
    region: 'Regione',
    totals: 'Utilità totale: completa, stella, vuota',
    efficient: 'Efficiente',
    kinds: { complete: 'la rete completa', star: 'la stella', empty: 'la rete vuota' },
    stable: 'La stella è stabile a coppie?',
    yes: 'sì',
    no: (why) => `no: ${why}`,
    whyHub: 'l’hub guadagna tagliando un collegamento',
    whyLeaves: 'due foglie guadagnano collegandosi',
    hint: 'Trascina il punto, oppure seleziona il piano e usa i tasti freccia (0,01).',
    aria: 'Il piano di δ e c, diviso in quattro regioni da tre curve, con un punto che si può spostare',
  },
}

// The four regions as polygons, from the three curves sampled in δ.
function polygons(n) {
  const ds = Array.from({ length: 101 }, (_, i) => i / 100)
  const cap = (c) => Math.min(C_MAX, c)
  const curve = (f) => ds.map((d) => [d, cap(f(d))])
  const t = (d) => thresholds(n, d)
  const low = curve((d) => t(d).low)
  const mid = curve((d) => t(d).mid)
  const high = curve((d) => t(d).high)
  const top = ds.map((d) => [d, C_MAX])
  const base = ds.map((d) => [d, 0])
  const between = (a, b) => [...a, ...b.slice().reverse()]
  return { complete: between(base, low), 'star-stable': between(low, mid), 'star-unstable': between(mid, high), empty: between(high, top), curves: { low, mid, high } }
}
const pts = (p) => p.map(([d, c]) => `${sx(d).toFixed(1)},${sy(c).toFixed(1)}`).join(' ')

export default function FigureFormation({ lang = 'en' }) {
  const L = T[lang] || T.en
  const n2 = (v) => num(v, lang, 2)
  const [n, setN] = useState(6)
  const [p, setP] = useState([0.5, 0.4])
  const [moveOn, setMoveOn] = useState(false)
  const [dragging, setDragging] = useState(false)
  const svgRef = useRef(null)
  const [d, c] = p
  const poly = polygons(n)
  const tot = totals(n, d, c)
  const reg = region(n, d, c)
  const eff = efficientKind(n, d, c)
  const stable = pairwiseStable(starNet(n), d, c)
  const why = stable ? '' : c > d ? L.whyHub : L.whyLeaves

  const toPlane = (e) => {
    const r = svgRef.current.getBoundingClientRect()
    const px = ((e.clientX - r.left) / r.width) * W
    const py = ((e.clientY - r.top) / r.height) * H
    return [r2(clamp(ux(px), 0.01, 0.99)), r2(clamp(uy(py), 0.01, C_MAX))]
  }
  const onPointerDown = (e) => {
    if (!canEdit(moveOn, e)) return
    e.currentTarget.setPointerCapture?.(e.pointerId)
    setDragging(true)
    setP(toPlane(e))
  }
  const onPointerMove = (e) => {
    if (!dragging || !canEdit(moveOn, e)) return
    setP(toPlane(e))
  }
  const stop = () => setDragging(false)
  const onKeyDown = (e) => {
    const k = { ArrowLeft: [-0.01, 0], ArrowRight: [0.01, 0], ArrowUp: [0, 0.01], ArrowDown: [0, -0.01] }[e.key]
    if (!k) return
    e.preventDefault()
    setP(([a, b]) => [r2(clamp(a + k[0], 0.01, 0.99)), r2(clamp(b + k[1], 0.01, C_MAX))])
  }

  return (
    <div>
      <div className="grid gap-x-8 gap-y-3 sm:grid-cols-[minmax(0,1fr)_auto] items-end max-w-3xl">
        <Slider label={L.n} min={3} max={20} step={1} value={n} onChange={setN} />
        <DrawToggle on={moveOn} onChange={(on) => { setMoveOn(on); setDragging(false) }} label={L.move} />
      </div>
      <div className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-[minmax(0,19rem)_minmax(0,1fr)] items-start max-w-3xl">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className={`w-full h-auto max-w-[19rem] outline-none focus-visible:ring-2 focus-visible:ring-orange-400 rounded ${drawCanvasClass(moveOn)}`}
          role="img"
          aria-label={L.aria}
          tabIndex={0}
          onKeyDown={onKeyDown}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={stop}
          onPointerCancel={stop}
          data-role="formation-plane"
          data-draw-surface
        >
          {KINDS.map((k) => (
            <polygon key={k} points={pts(poly[k])} fill={COLORS[k]} data-region={k} />
          ))}
          {[0, 0.5, 1, 1.5, 2].map((v) => (
            <g key={`c${v}`}>
              <line x1={sx(0)} x2={sx(1)} y1={sy(v)} y2={sy(v)} stroke={GRID} strokeWidth="0.6" opacity="0.7" />
              <text x={PAD.left - 4} y={sy(v) + 3} fontSize="8" fontFamily={MONO} fill={SLATE} textAnchor="end">{num(v, lang, 1)}</text>
            </g>
          ))}
          {[0, 0.25, 0.5, 0.75, 1].map((v) => (
            <text key={`d${v}`} x={sx(v)} y={H - PAD.bottom + 11} fontSize="8" fontFamily={MONO} fill={SLATE} textAnchor={v === 1 ? 'end' : 'middle'}>{num(v, lang, 2)}</text>
          ))}
          {Object.entries(poly.curves).map(([k, cv]) => (
            <polyline key={k} points={pts(cv)} fill="none" stroke={INK} strokeWidth="1" strokeDasharray={k === 'mid' ? '4 3' : undefined} />
          ))}
          <text x={sx(0.97)} y={sy(Math.min(C_MAX, thresholds(n, 0.97).high)) + (thresholds(n, 0.97).high > 1.9 ? 12 : -4)} fontSize="8" fontFamily={MONO} fill={INK} textAnchor="end">δ + (n − 2)δ²/2</text>
          <text x={sx(0.97)} y={sy(0.97) + 11} fontSize="8" fontFamily={MONO} fill={INK} textAnchor="end">c = δ</text>
          <text x={sx(0.5)} y={sy(0.25) - 4} fontSize="8" fontFamily={MONO} fill={INK} textAnchor="middle">δ − δ²</text>
          <text x={W - PAD.right} y={H - 2} fontSize="8" fontFamily={MONO} fill={SLATE} textAnchor="end">δ →</text>
          <text x={PAD.left + 3} y={PAD.top + 8} fontSize="8" fontFamily={MONO} fill={SLATE}>↑ c</text>
          <circle cx={sx(d)} cy={sy(c)} r="5.5" fill="white" stroke={stable ? ORANGE_DARK : INK} strokeWidth="2.5" data-role="formation-point" style={{ cursor: 'grab' }} />
        </svg>
        <div className="min-w-0">
          <dl className="grid grid-cols-2 sm:grid-cols-1 gap-x-4 gap-y-1 text-sm" data-role="formation-readout">
            {[
              [L.point, `(${n2(d)}, ${n2(c)})`, 'point'],
              [L.region, L.regions[reg], 'region'],
              [L.totals, `${n2(tot.complete)}, ${n2(tot.star)}, ${n2(tot.empty)}`, 'totals'],
              [L.efficient, L.kinds[eff], 'efficient'],
              [L.stable, stable ? L.yes : L.no(why), 'stable'],
            ].map(([label, x, key]) => (
              <div key={key} className="min-w-0">
                <dt className="text-xs text-slate-500">{label}</dt>
                <dd className="font-mono tabular-nums text-slate-900 break-words" data-value={key} {...(key === 'region' ? { 'data-region': reg } : {})}>{x}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-2 flex flex-col gap-1 text-xs text-slate-600">
            {KINDS.map((k) => (
              <span key={k} className="inline-flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 rounded-sm shrink-0" style={{ background: COLORS[k] }} />
                {L.regions[k]}
              </span>
            ))}
          </div>
          <p className="mt-2 text-xs text-slate-500 leading-snug">{L.hint}</p>
        </div>
      </div>
    </div>
  )
}
