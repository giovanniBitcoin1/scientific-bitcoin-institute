import { useMemo, useRef, useState } from 'react'
import Slider from '../../Slider.jsx'
import SimControls from '../../SimControls.jsx'
import DrawToggle, { canEdit, drawCanvasClass } from '../../DrawToggle.jsx'
import useAnimationLoop from '../../useAnimationLoop.js'
import { Pill, Stat, MONO, SLATE, INK, ORANGE_DARK, GRID } from '../../network/ui.jsx'
import Chart from '../../network/charts.jsx'
import { rps, repeatedMatrix, repeatedThresholds, trajectory, product, centreEigen, toXY, fromXY, inSimplex } from './replicator.js'
import { num } from './FigureFates.jsx'

// Panel A, "Rock, paper, scissors in a population": the replicator equation
// on the simplex of three strategies. A click (by touch only with "Start" on:
// the DrawToggle rule) starts a trajectory, RK4 with dt = 0.01 to t = 100,
// computed at once and drawn progressively with Play. Up to five
// trajectories. Readouts: the current point, the product x1·x2·x3 and its
// chart, the time average so far, the eigenvalues at the centre.

const SIDE = 280
const OX = 20
const OY = 22
const W = SIDE + 2 * OX
const H = (SIDE * Math.sqrt(3)) / 2 + OY + 26
const SHADES = ['#ea580c', '#0369a1', '#16a34a', '#9333ea', '#be123c']
const START = [0.5, 0.3, 0.2]
const PER_FRAME = 8 // kept points (0.1 time units each) revealed per frame

const T_ = {
  en: {
    a: 'a, what a win pays',
    b: 'b, what a loss costs',
    presets: { equal: 'a = b', win: 'Win more', lose: 'Lose more', repeated: 'Repeated dilemma' },
    start: 'Start',
    clear: 'Clear',
    names: ['R', 'P', 'S'],
    rnames: ['ALLC', 'ALLD', 'TFT'],
    point: (t) => `The point at t = ${t}`,
    V: 'x₁ x₂ x₃',
    avg: 'Time average so far',
    eig: 'Eigenvalues at the centre',
    eigMean: { in: 'the population spirals in', round: 'closed cycles', out: 'the population spirals out' },
    hint: 'Click the triangle to start a trajectory there (up to five).',
    matrix: 'Rows and columns: always cooperate, always defect, Tit for Tat; 10 rounds of the dilemma (3, 0, 5, 1).',
    marks: ['1/17: Tit for Tat beats always defect above this', '4/9: above this share of always cooperate, always defect invades'],
    chart: 'x₁ x₂ x₃ against t',
    aria: 'The simplex of the three strategies with the trajectories of the replicator equation',
  },
  it: {
    a: 'a, quanto paga una vittoria',
    b: 'b, quanto costa una sconfitta',
    presets: { equal: 'a = b', win: 'Vincere di più', lose: 'Perdere di più', repeated: 'Dilemma ripetuto' },
    start: 'Avvia',
    clear: 'Cancella',
    names: ['S', 'C', 'F'],
    rnames: ['ALLC', 'ALLD', 'TFT'],
    point: (t) => `Il punto a t = ${t}`,
    V: 'x₁ x₂ x₃',
    avg: 'Media nel tempo finora',
    eig: 'Autovalori nel centro',
    eigMean: { in: 'la popolazione spiraleggia verso il centro', round: 'cicli chiusi', out: 'la popolazione spiraleggia verso i bordi' },
    hint: 'Clicca sul triangolo per far partire lì una traiettoria (fino a cinque).',
    matrix: 'Righe e colonne: coopera sempre, defeziona sempre, Tit for Tat; 10 turni del dilemma (3, 0, 5, 1).',
    marks: ['1/17: sopra questa quota Tit for Tat batte chi defeziona sempre', '4/9: sopra questa quota di chi coopera sempre, chi defeziona sempre invade'],
    chart: 'x₁ x₂ x₃ in funzione di t',
    aria: 'Il simplesso delle tre strategie con le traiettorie dell’equazione del replicatore',
  },
}

const PRESETS = { equal: [1, 1], win: [1.5, 1], lose: [1, 1.5] }

export default function SimplexPanel({ lang = 'en' }) {
  const L = T_[lang] || T_.en
  const n = (v, d = 4) => num(v, lang, d)
  const [preset, setPreset] = useState('equal')
  const [a, setA] = useState(1)
  const [b, setB] = useState(1)
  const [starts, setStarts] = useState([START])
  const [cursor, setCursor] = useState(Infinity)
  const [playing, setPlaying] = useState(false)
  const [armed, setArmed] = useState(false)
  const svgRef = useRef(null)
  const repeated = preset === 'repeated'
  const A = useMemo(() => (repeated ? repeatedMatrix() : rps(a, b)), [repeated, a, b])
  const trajs = useMemo(() => starts.map((s) => trajectory(A, s, { keep: 10 })), [A, starts])
  const last = trajs[trajs.length - 1]
  const total = last.points.length - 1
  const k = Math.min(cursor, total)

  useAnimationLoop(() => {
    setCursor((c) => {
      const next = Math.min(total, (Number.isFinite(c) ? c : total) + PER_FRAME)
      if (next >= total) setPlaying(false)
      return next
    })
  }, playing)

  const choose = (key) => {
    setPreset(key)
    if (PRESETS[key]) {
      setA(PRESETS[key][0])
      setB(PRESETS[key][1])
    }
    // A preset starts again from the default point.
    setStarts([START])
    setCursor(Infinity)
    setPlaying(false)
  }
  const onPointerDown = (e) => {
    if (!canEdit(armed, e)) return
    const r = svgRef.current.getBoundingClientRect()
    const x = fromXY(((e.clientX - r.left) / r.width) * W, ((e.clientY - r.top) / r.height) * H, SIDE, OX, OY)
    if (!inSimplex(x, 0.02)) return
    const c = x.map((v) => Math.max(0.002, v))
    const s = c.reduce((p, q) => p + q, 0)
    setStarts((list) => [...list, c.map((v) => Math.round((v / s) * 1000) / 1000)].slice(-5))
    setCursor(0)
    setPlaying(true)
  }

  const pts = last.points.slice(0, k + 1)
  const cur = pts[pts.length - 1]
  const tNow = k * last.dt
  // Time average with the trapezoid rule over the kept points.
  const avg = [0, 0, 0]
  for (let i = 0; i < pts.length - 1; i++) for (let j = 0; j < 3; j++) avg[j] += (pts[i][j] + pts[i + 1][j]) / 2
  const shownAvg = pts.length > 1 ? avg.map((v) => v / (pts.length - 1)) : cur
  const Vs = pts.map((x, i) => [i * last.dt, product(x)])
  const eig = repeated ? null : centreEigen(a, b)
  const eigKind = !eig ? null : Math.abs(eig.re) < 1e-12 ? 'round' : eig.re < 0 ? 'in' : 'out'
  const names = repeated ? L.rnames : L.names
  const corners = [toXY([1, 0, 0], SIDE, OX, OY), toXY([0, 1, 0], SIDE, OX, OY), toXY([0, 0, 1], SIDE, OX, OY)]
  const path = (list) => list.map((x) => toXY(x, SIDE, OX, OY).map((v) => v.toFixed(1)).join(',')).join(' ')
  const th = repeatedThresholds()
  const vTop = Math.max(...Vs.map((p) => p[1]), 1e-6)

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2" data-role="rps-presets">
        {Object.keys(L.presets).map((key) => (
          <Pill key={key} active={preset === key} onClick={() => choose(key)}>
            {L.presets[key]}
          </Pill>
        ))}
      </div>
      {!repeated && (
        <div className="mt-3 grid gap-x-8 gap-y-3 sm:grid-cols-2 max-w-3xl">
          <Slider label={L.a} min={0.25} max={2} step={0.05} value={a} onChange={(v) => { setA(Math.round(v * 100) / 100); setPreset('custom'); setCursor(Infinity) }} format={(v) => n(v, 2)} />
          <Slider label={L.b} min={0.25} max={2} step={0.05} value={b} onChange={(v) => { setB(Math.round(v * 100) / 100); setPreset('custom'); setCursor(Infinity) }} format={(v) => n(v, 2)} />
        </div>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <SimControls
          playing={playing}
          onPlayPause={() => {
            if (!playing && k >= total) setCursor(0)
            setPlaying(!playing)
          }}
          labels={lang === 'it' ? { play: 'Avvia', pause: 'Pausa' } : {}}
        />
        <Pill onClick={() => { setStarts([START]); setCursor(Infinity); setPlaying(false) }} data-role="rps-clear">
          {L.clear}
        </Pill>
        <DrawToggle on={armed} onChange={setArmed} label={L.start} />
      </div>

      <div className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] items-start max-w-3xl">
        <div className="min-w-0">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${W} ${H}`}
            className={`w-full h-auto max-w-[20rem] cursor-crosshair ${drawCanvasClass(armed)}`}
            role="img"
            aria-label={L.aria}
            onPointerDown={onPointerDown}
            data-role="rps-simplex"
            data-draw-surface
          >
            <polygon points={corners.map((c) => c.join(',')).join(' ')} fill="#f8fafc" stroke={SLATE} />
            {[0.25, 0.5, 0.75].map((g) =>
              [0, 1, 2].map((i) => {
                const p = [0, 0, 0]
                const q = [0, 0, 0]
                p[i] = g
                q[i] = g
                p[(i + 1) % 3] = 1 - g
                q[(i + 2) % 3] = 1 - g
                const [x1, y1] = toXY(p, SIDE, OX, OY)
                const [x2, y2] = toXY(q, SIDE, OX, OY)
                return <line key={`${g}${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={GRID} />
              }),
            )}
            {names.map((nm, i) => (
              <text key={nm} x={corners[i][0] + [0, -4, 4][i]} y={corners[i][1] + [-7, 14, 14][i]} fontSize="10" fontFamily={MONO} fill={INK} textAnchor={['middle', 'start', 'end'][i]} fontWeight="700">
                {nm}
              </text>
            ))}
            {!repeated && <circle cx={toXY([1 / 3, 1 / 3, 1 / 3], SIDE, OX, OY)[0]} cy={toXY([1 / 3, 1 / 3, 1 / 3], SIDE, OX, OY)[1]} r="3" fill={INK} />}
            {repeated && (
              <g data-role="rps-marks">
                {[[0, 1 - th.tft, th.tft], [th.allc, 0, 1 - th.allc]].map((x, i) => {
                  const [cx, cy] = toXY(x, SIDE, OX, OY)
                  return <circle key={i} cx={cx} cy={cy} r="4" fill="white" stroke={INK} strokeWidth="2" data-mark={i ? '4/9' : '1/17'} />
                })}
              </g>
            )}
            {trajs.map((tr, i) => {
              const shown = i === trajs.length - 1 ? pts : tr.points
              return (
                <g key={i} data-traj={i}>
                  <polyline points={path(shown)} fill="none" stroke={SHADES[i]} strokeWidth="1.4" strokeLinejoin="round" opacity={i === trajs.length - 1 ? 1 : 0.6} />
                  <circle cx={toXY(tr.points[0], SIDE, OX, OY)[0]} cy={toXY(tr.points[0], SIDE, OX, OY)[1]} r="2.5" fill={SHADES[i]} />
                </g>
              )
            })}
            <circle cx={toXY(cur, SIDE, OX, OY)[0]} cy={toXY(cur, SIDE, OX, OY)[1]} r="4" fill={SHADES[trajs.length - 1]} stroke="white" strokeWidth="1.5" />
          </svg>
          <p className="text-xs text-slate-500 leading-snug">{L.hint}</p>
          {repeated && (
            <div className="mt-1 text-xs text-slate-600 leading-snug" data-role="rps-matrix">
              <p>{L.matrix}</p>
              <p className="font-mono mt-0.5">{A.map((r) => `[${r.join(', ')}]`).join(' ')}</p>
              <p className="mt-0.5">○ {L.marks[0]}; ○ {L.marks[1]}.</p>
            </div>
          )}
        </div>
        <div className="min-w-0">
          <div className="grid grid-cols-2 gap-2" data-role="rps-readout">
            <Stat label={L.point(n(tNow, 1))} wide>
              <span data-value="point">({cur.map((v) => n(Math.abs(v))).join(lang === 'it' ? '; ' : ', ')})</span>
            </Stat>
            <Stat label={L.V}>
              <span data-value="V">{product(cur) < 1e-4 ? product(cur).toExponential(2).replace('.', lang === 'it' ? ',' : '.') : n(product(cur), 5)}</span>
            </Stat>
            <Stat label={L.avg}>
              <span data-value="avg">({shownAvg.map((v) => n(v, 3)).join(lang === 'it' ? '; ' : ', ')})</span>
            </Stat>
            {eig && (
              <Stat label={L.eig} wide>
                <span data-value="eig">
                  {eig.re === 0 ? '' : `${eig.re > 0 ? '+' : ''}${n(eig.re, 5)} `}± {n(eig.im, 5)}i
                </span>
                <span className="ml-2 font-sans text-xs text-slate-500" data-value="eigKind">
                  {L.eigMean[eigKind]}
                </span>
              </Stat>
            )}
          </div>
          <div className="mt-2">
            <Chart
              height={130}
              x={{ min: 0, max: 100, ticks: [0, 25, 50, 75, 100], label: 't' }}
              y={{ min: 0, max: vTop * 1.05, ticks: [0, vTop / 2, vTop], format: (v) => (v === 0 ? '0' : n(v, vTop < 0.01 ? 4 : 3)) }}
              series={[{ points: Vs, color: SHADES[trajs.length - 1] }]}
              aria={L.chart}
            />
            <p className="text-xs text-slate-500 font-mono">{L.chart}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
