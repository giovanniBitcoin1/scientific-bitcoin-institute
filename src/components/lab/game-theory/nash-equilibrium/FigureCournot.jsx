import { useEffect, useMemo, useState } from 'react'
import Slider from '../../Slider.jsx'
import { ORANGE_DARK, INK, SLATE, GRID, MONO, Pill } from '../../network/ui.jsx'
import { A, COST, equilibrium, cartel, describe, adjust } from './cournot.js'

// Live figure F2: Cournot's two firms on the plane of their quantities. The
// two best-response lines cross at the equilibrium. A click (not a drag: the
// plane never captures a swipe) sets a starting point, and "Adjust" lets the
// firms answer each other in turn, firm 1 first.

const SKY = '#0369a1'
const GREEN = '#16a34a'
export const START_POINT = [1, 8]
const STEP_MS = 380

const T = {
  en: {
    c1: 'Cost of firm 1: c₁',
    c2: 'Cost of firm 2: c₂',
    adjust: 'Adjust',
    reset: 'Reset',
    br1: 'best response of firm 1',
    br2: 'best response of firm 2',
    eq: 'equilibrium',
    cartel: 'cartel',
    here: (moves) => (moves === 0 ? 'Starting point' : `After ${moves} ${moves === 1 ? 'move' : 'moves'}`),
    quantities: 'quantities',
    price: 'price',
    profits: 'profits',
    and: 'and',
    eqLine: 'Equilibrium',
    hint: 'Click on the plane to choose where the firms start.',
    aria: 'The plane of the two quantities, from 0 to 10, with the best-response line of each firm, their crossing point and the path of the adjustment',
  },
  it: {
    c1: "Costo dell'impresa 1: c₁",
    c2: "Costo dell'impresa 2: c₂",
    adjust: 'Aggiusta',
    reset: 'Ricomincia',
    br1: "risposta migliore dell'impresa 1",
    br2: "risposta migliore dell'impresa 2",
    eq: 'equilibrio',
    cartel: 'cartello',
    here: (moves) => (moves === 0 ? 'Punto di partenza' : `Dopo ${moves} ${moves === 1 ? 'mossa' : 'mosse'}`),
    quantities: 'quantità',
    price: 'prezzo',
    profits: 'profitti',
    and: 'e',
    eqLine: 'Equilibrio',
    hint: 'Clicca sul piano per scegliere da dove partono le imprese.',
    aria: "Il piano delle due quantità, da 0 a 10, con la retta di risposta migliore di ciascuna impresa, il loro punto d'incrocio e il percorso dell'aggiustamento",
  },
}

// Plot area in viewBox units: both quantities from 0 to 10.
const W = 300
const H = 262
const X0 = 26
const X1 = 292
const Y0 = 8
const Y1 = 238
const px = (q) => X0 + (q / 10) * (X1 - X0)
const py = (q) => Y1 - (q / 10) * (Y1 - Y0)
const snap = (v) => Math.round(v * 10) / 10

export default function FigureCournot({ lang = 'en' }) {
  const t = T[lang] || T.en
  const [c1, setC1] = useState(COST)
  const [c2, setC2] = useState(COST)
  const [start, setStart] = useState(START_POINT)
  const [shown, setShown] = useState(0)
  const [running, setRunning] = useState(false)

  const eq = equilibrium(A, c1, c2)
  const path = useMemo(() => adjust(A, c1, c2, start[0], start[1]), [c1, c2, start])
  const moves = Math.min(shown, path.length - 1)
  const point = path[moves]
  const now = describe(A, c1, c2, point[0], point[1])
  const k = c1 === c2 ? cartel(A, c1) : null

  useEffect(() => {
    if (!running) return
    if (moves >= path.length - 1) {
      setRunning(false)
      return
    }
    const id = setTimeout(() => setShown((s) => s + 1), STEP_MS)
    return () => clearTimeout(id)
  }, [running, moves, path])

  const restart = (fn) => (v) => {
    fn(v)
    setShown(0)
    setRunning(false)
  }
  const onPlane = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - r.left) / r.width) * W
    const y = ((e.clientY - r.top) / r.height) * H
    const q1 = Math.min(10, Math.max(0, snap(((x - X0) / (X1 - X0)) * 10)))
    const q2 = Math.min(10, Math.max(0, snap(((Y1 - y) / (Y1 - Y0)) * 10)))
    restart(setStart)([q1, q2])
  }
  const n = (v) => (lang === 'it' ? v.toFixed(2).replace('.', ',') : v.toFixed(2))

  return (
    <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2 items-start">
      <div className="min-w-0">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto cursor-pointer" role="img" aria-label={t.aria} onClick={onPlane}>
          <rect x={X0} y={Y0} width={X1 - X0} height={Y1 - Y0} fill="#fff" stroke={GRID} strokeWidth="1" />
          {[0, 2, 4, 6, 8, 10].map((v) => (
            <g key={v}>
              <line x1={px(v)} x2={px(v)} y1={Y0} y2={Y1} stroke={GRID} strokeWidth="1" />
              <line x1={X0} x2={X1} y1={py(v)} y2={py(v)} stroke={GRID} strokeWidth="1" />
              <text x={px(v)} y={Y1 + 11} textAnchor="middle" fontSize="9" fontFamily={MONO} fill={SLATE}>
                {v}
              </text>
              <text x={X0 - 4} y={py(v) + 3} textAnchor="end" fontSize="9" fontFamily={MONO} fill={SLATE}>
                {v}
              </text>
            </g>
          ))}
          <text x={X1} y={H - 2} textAnchor="end" fontSize="9" fontFamily={MONO} fill={SLATE}>
            q₁
          </text>
          <text x={X0 + 4} y={Y0 + 10} fontSize="9" fontFamily={MONO} fill={SLATE}>
            q₂
          </text>
          {/* Firm 1 answers q2 with (a − c1 − q2)/2; firm 2 answers q1 with (a − c2 − q1)/2. */}
          <polyline points={`${px((A - c1) / 2)},${py(0)} ${px(0)},${py(A - c1)} ${px(0)},${py(10)}`} fill="none" stroke={ORANGE_DARK} strokeWidth="2" />
          <polyline points={`${px(0)},${py((A - c2) / 2)} ${px(A - c2)},${py(0)} ${px(10)},${py(0)}`} fill="none" stroke={SKY} strokeWidth="2" />
          {k && <circle cx={px(k.q1)} cy={py(k.q2)} r="4.5" fill="#fff" stroke={GREEN} strokeWidth="2" data-role="cartel-point" />}
          <circle cx={px(eq.q1)} cy={py(eq.q2)} r="4.5" fill={INK} />
          <polyline points={path.slice(0, moves + 1).map((p) => `${px(p[0]).toFixed(1)},${py(p[1]).toFixed(1)}`).join(' ')} fill="none" stroke={SLATE} strokeWidth="1.5" strokeDasharray="4 3" />
          <circle cx={px(start[0])} cy={py(start[1])} r="3" fill="#fff" stroke={SLATE} strokeWidth="1.5" />
          <circle cx={px(point[0])} cy={py(point[1])} r="5" fill={ORANGE_DARK} stroke="#fff" strokeWidth="2" />
        </svg>
        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
          {[
            [t.br1, ORANGE_DARK, 'line'],
            [t.br2, SKY, 'line'],
            [t.eq, INK, 'dot'],
            ...(k ? [[t.cartel, GREEN, 'ring']] : []),
          ].map(([label, color, kind]) => (
            <span key={label} className="inline-flex items-center gap-1.5">
              <svg width="14" height="8" aria-hidden="true">
                {kind === 'line' ? (
                  <line x1="0" x2="14" y1="4" y2="4" stroke={color} strokeWidth="2" />
                ) : (
                  <circle cx="7" cy="4" r="3" fill={kind === 'dot' ? color : '#fff'} stroke={color} strokeWidth="1.5" />
                )}
              </svg>
              {label}
            </span>
          ))}
        </div>
      </div>

      <div className="min-w-0 space-y-2">
        <Slider label={t.c1} min={0} max={4} step={0.5} value={c1} onChange={restart(setC1)} format={(v) => n(v)} />
        <Slider label={t.c2} min={0} max={4} step={0.5} value={c2} onChange={restart(setC2)} format={(v) => n(v)} />
        <div className="flex flex-wrap gap-2 pt-1">
          <Pill primary disabled={running || moves >= path.length - 1} onClick={() => setRunning(true)}>
            {t.adjust}
          </Pill>
          <Pill disabled={moves === 0 && !running} onClick={restart(() => {})}>
            {t.reset}
          </Pill>
        </div>
        <p className="text-sm text-slate-700 leading-snug" data-role="cournot-readout">
          <strong className="text-slate-900 font-semibold">{t.here(moves)}</strong>: {t.quantities}{' '}
          <span className="font-mono text-slate-900">
            {n(now.q1)} {t.and} {n(now.q2)}
          </span>
          , {t.price} <span className="font-mono text-slate-900">{n(now.price)}</span>, {t.profits}{' '}
          <span className="font-mono text-slate-900">
            {n(now.profit1)} {t.and} {n(now.profit2)}
          </span>
          .
          <br />
          <strong className="text-slate-900 font-semibold">{t.eqLine}</strong>: {t.quantities}{' '}
          <span className="font-mono text-slate-900">
            {n(eq.q1)} {t.and} {n(eq.q2)}
          </span>
          , {t.price} <span className="font-mono text-slate-900">{n(eq.price)}</span>, {t.profits}{' '}
          <span className="font-mono text-slate-900">
            {n(eq.profit1)} {t.and} {n(eq.profit2)}
          </span>
          .
        </p>
        <p className="text-xs text-slate-500 leading-snug">{t.hint}</p>
      </div>
    </div>
  )
}
