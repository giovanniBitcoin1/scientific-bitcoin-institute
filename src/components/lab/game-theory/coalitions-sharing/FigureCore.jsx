import { useRef, useState } from 'react'
import Slider from '../../Slider.jsx'
import DrawToggle, { canEdit, drawCanvasClass } from '../../DrawToggle.jsx'
import { Pill } from '../../network/ui.jsx'
import { frac, toNumber } from '../congestion-price-of-anarchy/frac.js'
import CoreTriangle, { W, H, fromXY } from './CoreTriangle.jsx'
import { partnersGame, shapley3, coreCorners3, objections, inCore, xOf } from './coalitions.js'
import { both, dec, fracText, num } from './fmt.js'

// Live figure F1, "The core of three": the divisions of v(N) = 100 among A,
// B and C as a triangle. Sliders for the three pairs' worths; the lines
// x_C = 100 − v(AB) and the others; the core shaded, or a line saying it is
// empty; the Shapley point. A division the reader moves (mouse, arrow keys by
// 1, touch with "Move" on: the DrawToggle rule) and the pairs that object to
// it, strictly: a pair objects only if it would get more on its own.

const PRESETS = {
  inside: [70, 60, 40],
  outside: [90, 60, 40],
  single: [80, 70, 50],
  empty: [100, 100, 100],
}
const PAIRS = [3, 5, 6] // AB, AC, BC

const T = {
  en: {
    pair: (p) => `v(${p})`,
    presets: { inside: 'Inside', outside: 'Outside', single: 'A single point', empty: 'Empty' },
    move: 'Move',
    shapley: 'Shapley value (A, B, C)',
    inCore: 'in the core',
    notInCore: 'outside the core',
    core: 'The core',
    corners: (k) => (k === 1 ? 'a single point' : k === 2 ? 'a segment' : `${k} corners`),
    empty: (ask) => `the core is empty: the pairs ask for (v(AB) + v(AC) + v(BC))/2 = ${ask} > 100`,
    division: 'Your division (A, B, C)',
    none: 'no pair objects: it is in the core',
    objects: (s, got, could, by) => `${s} object: they get ${got}, could make ${could} (+${by})`,
    hint: 'Drag the white point, or select the triangle and use the arrow keys: ← → move 1 between A and B, ↑ ↓ move 1 to and from C.',
    aria: 'The triangle of divisions of 100 among A, B and C, with the core shaded, the Shapley value and a division that can be moved',
  },
  it: {
    pair: (p) => `v(${p})`,
    presets: { inside: 'Dentro', outside: 'Fuori', single: 'Un solo punto', empty: 'Vuoto' },
    move: 'Sposta',
    shapley: 'Valore di Shapley (A, B, C)',
    inCore: 'nel nucleo',
    notInCore: 'fuori dal nucleo',
    core: 'Il nucleo',
    corners: (k) => (k === 1 ? 'un solo punto' : k === 2 ? 'un segmento' : `${k} vertici`),
    empty: (ask) => `il nucleo è vuoto: le coppie chiedono (v(AB) + v(AC) + v(BC))/2 = ${ask} > 100`,
    division: 'La tua divisione (A, B, C)',
    none: 'nessuna coppia obietta: è nel nucleo',
    objects: (s, got, could, by) => `${s} obiettano: ricevono ${got}, potrebbero fare ${could} (+${by})`,
    hint: 'Trascina il punto bianco, oppure seleziona il triangolo e usa i tasti freccia: ← → spostano 1 tra A e B, ↑ ↓ spostano 1 verso C e da C.',
    aria: 'Il triangolo delle divisioni di 100 tra A, B e C, con il nucleo ombreggiato, il valore di Shapley e una divisione che si può spostare',
  },
}

// A division of 100 in whole numbers from barycentric weights.
function snap(w) {
  const t = w.map((x) => Math.max(0, x))
  const s = t[0] + t[1] + t[2] || 1
  let a = Math.round((100 * t[0]) / s)
  let b = Math.round((100 * t[1]) / s)
  if (a + b > 100) {
    if (a >= b) a = 100 - b
    else b = 100 - a
  }
  return [a, b, 100 - a - b]
}

export function moveByKey(p, key) {
  const [a, b, c] = p
  if (key === 'ArrowRight' && a > 0) return [a - 1, b + 1, c]
  if (key === 'ArrowLeft' && b > 0) return [a + 1, b - 1, c]
  if (key === 'ArrowUp') {
    if (a >= b && a > 0) return [a - 1, b, c + 1]
    if (b > 0) return [a, b - 1, c + 1]
  }
  if (key === 'ArrowDown' && c > 0) return a <= b ? [a + 1, b, c - 1] : [a, b + 1, c - 1]
  return p
}

export default function FigureCore({ lang = 'en' }) {
  const L = T[lang] || T.en
  const [pairs, setPairs] = useState(PRESETS.inside)
  const [point, setPoint] = useState([34, 33, 33])
  const [moveOn, setMoveOn] = useState(false)
  const [dragging, setDragging] = useState(false)
  const svgRef = useRef(null)
  const [ab, ac, bc] = pairs
  const game = partnersGame(ab, ac, bc)
  const phi = shapley3(ab, ac, bc)
  const corners = coreCorners3(game)
  const x = point.map((v) => frac(v))
  const obj = objections(game, x).filter((o) => PAIRS.includes(o.mask))
  const phiIn = inCore(game, phi)
  const active = Object.entries(PRESETS).find(([, v]) => v.join() === pairs.join())?.[0]
  const names = (m) => ['A', 'B', 'C'].filter((_, i) => m & (1 << i)).join(lang === 'it' ? ' e ' : ' and ')
  const setPair = (k, v) => setPairs((p) => p.map((x0, i) => (i === k ? v : x0)))

  const toPoint = (e) => {
    const r = svgRef.current.getBoundingClientRect()
    return snap(fromXY(((e.clientX - r.left) / r.width) * W, ((e.clientY - r.top) / r.height) * H))
  }
  const svgProps = {
    tabIndex: 0,
    onKeyDown: (e) => {
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return
      e.preventDefault()
      setPoint((p) => moveByKey(p, e.key))
    },
    onPointerDown: (e) => {
      if (!canEdit(moveOn, e)) return
      e.currentTarget.setPointerCapture?.(e.pointerId)
      setDragging(true)
      setPoint(toPoint(e))
    },
    onPointerMove: (e) => {
      if (!dragging || !canEdit(moveOn, e)) return
      setPoint(toPoint(e))
    },
    onPointerUp: () => setDragging(false),
    onPointerCancel: () => setDragging(false),
    'data-draw-surface': true,
    'data-point': point.join(','),
  }
  const sumPairs = ab + ac + bc
  const coreText = corners.length
    ? `${L.corners(corners.length)}: ${corners.map((c) => `(${c.map((v) => fracText(v)).join(', ')})`).join(' ')}`
    : L.empty(num(sumPairs / 2, lang, sumPairs % 2 ? 1 : 0))

  return (
    <div>
      <div className="grid gap-x-6 gap-y-2 sm:grid-cols-3 max-w-3xl">
        {['AB', 'AC', 'BC'].map((p, k) => (
          <Slider key={p} label={L.pair(p)} min={0} max={100} step={5} value={pairs[k]} onChange={(v) => setPair(k, v)} />
        ))}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2" data-role="core-presets">
        {Object.keys(PRESETS).map((k) => (
          <Pill key={k} active={active === k} onClick={() => setPairs(PRESETS[k])} data-preset={k}>{L.presets[k]}</Pill>
        ))}
        <DrawToggle on={moveOn} onChange={(on) => { setMoveOn(on); setDragging(false) }} label={L.move} />
      </div>
      <div className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-[minmax(0,16rem)_minmax(0,1fr)] items-start max-w-3xl">
        <div className="max-w-[16rem] w-full mx-auto sm:mx-0">
          <CoreTriangle
            game={game}
            phi={phi}
            point={point}
            objecting={obj.map((o) => o.mask)}
            aria={L.aria}
            role="core-triangle"
            svgRef={svgRef}
            svgProps={svgProps}
            className={`outline-none focus-visible:ring-2 focus-visible:ring-orange-400 rounded ${drawCanvasClass(moveOn)}`}
          />
        </div>
        <dl className="min-w-0 grid gap-y-1.5 text-sm" data-role="core-readout">
          <div className="min-w-0">
            <dt className="text-xs text-slate-500">{L.shapley}</dt>
            <dd className="font-mono tabular-nums text-slate-900 break-words" data-value="shapley" data-in={phiIn ? 'yes' : 'no'}>
              {phi.map((f) => both(f, lang)).join(lang === 'it' ? '; ' : ', ')} · {phiIn ? L.inCore : L.notInCore}
            </dd>
          </div>
          <div className="min-w-0">
            <dt className="text-xs text-slate-500">{L.core}</dt>
            <dd className="font-mono tabular-nums text-slate-900 break-words" data-value="core" data-corners={corners.length}>{coreText}</dd>
          </div>
          <div className="min-w-0">
            <dt className="text-xs text-slate-500">{L.division}</dt>
            <dd className="font-mono tabular-nums text-slate-900" data-value="division">({point.join(', ')})</dd>
            <dd className="text-slate-800 leading-snug mt-0.5" data-value="objections" data-count={obj.length}>
              {obj.length ? (
                <ul className="list-none">
                  {obj.map((o) => (
                    <li key={o.mask} className="text-red-700">{L.objects(names(o.mask), dec(xOf(x, o.mask), lang, 0), toNumber(game.v[o.mask]), fracText(o.by))}</li>
                  ))}
                </ul>
              ) : (
                L.none
              )}
            </dd>
          </div>
          <p className="text-xs text-slate-500 leading-snug">{L.hint}</p>
        </dl>
      </div>
    </div>
  )
}
