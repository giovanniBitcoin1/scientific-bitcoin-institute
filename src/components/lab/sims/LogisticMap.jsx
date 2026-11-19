import { useEffect, useMemo, useRef, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import Slider from '../Slider.jsx'
import SimControls from '../SimControls.jsx'
import useAnimationLoop from '../useAnimationLoop.js'

// The logistic map x(n+1) = r·x(n)·(1 − x(n)), shown in three linked panels:
// time series, cobweb diagram and bifurcation diagram. r and x₀ are shared.

const ORANGE = '#ea580c' // orange-600
const TWIN = '#0284c7' // sky-600, contrasts with orange
const INK = '#0f172a' // slate-900
const MUTED = '#94a3b8' // slate-400
const GRID = '#e2e8f0' // slate-200

const DEFAULT_VIEW = { rMin: 2.5, rMax: 4.0 }
const COBWEB_MS = 160 // one cobweb iteration per this many ms while playing

const T = {
  en: {
    params: 'Shared parameters',
    r: 'Growth rate r',
    x0: 'Initial value x₀',
    steps: 'Steps',
    timeSeries: 'Time series',
    twin: 'Twin trajectory',
    eps: 'Offset ε',
    diverge: (n) => `The twins differ by more than 0.1 from step ${n}.`,
    noDiverge: (n) => `The twins stay within 0.1 of each other for all ${n} steps.`,
    cobweb: 'Cobweb diagram',
    iteration: 'Iteration',
    fixed: 'x*',
    fixedUnstable: 'x* (unstable)',
    bifurcation: 'Bifurcation diagram',
    rMin: 'r min',
    rMax: 'r max',
    resetView: 'Reset view',
    bifHint: 'Click to set r · drag sideways to zoom',
    bifAria: 'Bifurcation diagram of the logistic map. Click to choose r, drag to zoom.',
    cobwebAria: 'Cobweb diagram: the parabola y = r·x(1 − x), the diagonal y = x and the iteration staircase.',
    period: 'Period',
    chaotic: 'chaotic',
    unsettled: '> 64 (not settled)',
    lyap: 'Lyapunov λ',
    lyapNote: 'λ > 0: chaos',
    controls: { play: 'Play', pause: 'Pause', step: 'Step', reset: 'Reset' },
  },
  it: {
    params: 'Parametri condivisi',
    r: 'Tasso di crescita r',
    x0: 'Valore iniziale x₀',
    steps: 'Passi',
    timeSeries: 'Serie temporale',
    twin: 'Traiettoria gemella',
    eps: 'Scarto ε',
    diverge: (n) => `Le gemelle differiscono di più di 0,1 dal passo ${n}.`,
    noDiverge: (n) => `Le gemelle restano entro 0,1 l'una dall'altra per tutti i ${n} passi.`,
    cobweb: 'Diagramma a ragnatela',
    iteration: 'Iterazione',
    fixed: 'x*',
    fixedUnstable: 'x* (instabile)',
    bifurcation: 'Diagramma di biforcazione',
    rMin: 'r min',
    rMax: 'r max',
    resetView: 'Ripristina vista',
    bifHint: 'Clicca per scegliere r · trascina in orizzontale per ingrandire',
    bifAria: 'Diagramma di biforcazione della mappa logistica. Clicca per scegliere r, trascina per ingrandire.',
    cobwebAria: 'Diagramma a ragnatela: la parabola y = r·x(1 − x), la diagonale y = x e la scala delle iterazioni.',
    period: 'Periodo',
    chaotic: 'caotico',
    unsettled: '> 64 (non assestato)',
    lyap: 'Lyapunov λ',
    lyapNote: 'λ > 0: caos',
    controls: { play: 'Avvia', pause: 'Pausa', step: 'Passo', reset: 'Azzera' },
  },
}

const f = (r, x) => r * x * (1 - x)
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))

const SUPERSCRIPT = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' }
function formatSci(v) {
  const exp = Math.floor(Math.log10(v))
  const mant = v / 10 ** exp
  const sup = String(exp).split('').map((c) => SUPERSCRIPT[c]).join('')
  return `${mant.toFixed(1)} × 10${sup}`
}

// Period of the attractor (up to 64, tolerance 1e-6) and Lyapunov exponent.
function analyse(r, x0) {
  let x = x0
  for (let i = 0; i < 10000; i++) x = f(r, x)
  const seq = new Float64Array(129)
  seq[0] = x
  for (let i = 1; i < seq.length; i++) seq[i] = f(r, seq[i - 1])
  let period = null
  for (let p = 1; p <= 64 && period === null; p++) {
    let ok = true
    for (let i = 0; i < 64; i++) {
      if (Math.abs(seq[i + p] - seq[i]) > 1e-6) {
        ok = false
        break
      }
    }
    if (ok) period = p
  }

  x = x0
  for (let i = 0; i < 1000; i++) x = f(r, x)
  let sum = 0
  for (let i = 0; i < 2000; i++) {
    sum += Math.log(Math.max(Math.abs(r * (1 - 2 * x)), 1e-12))
    x = f(r, x)
  }
  return { period, lyapunov: sum / 2000 }
}

function useElementWidth(ref) {
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => setWidth(Math.floor(entry.contentRect.width)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [ref])
  return width
}

function PanelTitle({ children }) {
  return (
    <p className="text-xs uppercase tracking-wider text-orange-600 font-semibold font-mono">
      {children}
    </p>
  )
}

const panel = 'bg-white rounded-xl border border-slate-200 shadow-sm p-4 md:p-6 min-w-0'

// ---------------------------------------------------------------- Panel A

function TimeSeries({ t, r, x0, steps, setSteps }) {
  const [twin, setTwin] = useState(false)
  const [eps, setEps] = useState(1e-6)

  const { data, divergeAt } = useMemo(() => {
    const rows = []
    let x = x0
    let y = Math.min(x0 + eps, 1)
    let divergeAt = null
    for (let n = 0; n <= steps; n++) {
      rows.push(twin ? { n, x, y } : { n, x })
      if (twin && divergeAt === null && Math.abs(x - y) > 0.1) divergeAt = n
      x = f(r, x)
      y = f(r, y)
    }
    return { data: rows, divergeAt }
  }, [r, x0, steps, twin, eps])

  return (
    <div className={panel}>
      <PanelTitle>A · {t.timeSeries}</PanelTitle>
      <div className="mt-4 h-60 -ml-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, bottom: 4, left: 0 }}>
            <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
            <XAxis
              dataKey="n"
              type="number"
              domain={[0, steps]}
              tick={{ fontSize: 11, fontFamily: 'IBM Plex Mono, monospace' }}
              stroke={MUTED}
            />
            <YAxis
              domain={[0, 1]}
              ticks={[0, 0.25, 0.5, 0.75, 1]}
              width={40}
              tick={{ fontSize: 11, fontFamily: 'IBM Plex Mono, monospace' }}
              stroke={MUTED}
            />
            <Tooltip
              formatter={(v) => v.toFixed(6)}
              labelFormatter={(n) => `n = ${n}`}
              contentStyle={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 12 }}
            />
            <Line
              type="linear"
              dataKey="x"
              name="x(n)"
              stroke={ORANGE}
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
            />
            {twin && (
              <Line
                type="linear"
                dataKey="y"
                name="x₀ + ε"
                stroke={TWIN}
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Slider label={t.steps} min={20} max={300} step={10} value={steps} onChange={setSteps} />
        <div className="flex items-center">
          <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={twin}
              onChange={(e) => setTwin(e.target.checked)}
              className="h-4 w-4 accent-orange-600"
            />
            {t.twin}
            <span className="inline-block w-4 h-0.5" style={{ background: TWIN }} aria-hidden="true" />
          </label>
        </div>
      </div>
      {twin && (
        <div className="mt-4">
          <Slider
            label={t.eps}
            min={1e-10}
            max={1e-2}
            log
            value={eps}
            onChange={setEps}
            format={formatSci}
          />
          <p className="mt-3 font-mono text-sm text-slate-700">
            {divergeAt !== null ? t.diverge(divergeAt) : t.noDiverge(steps)}
          </p>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------- Panel B

function Cobweb({ t, r, x0, steps }) {
  const wrapRef = useRef(null)
  const canvasRef = useRef(null)
  const width = useElementWidth(wrapRef)
  const [count, setCount] = useState(30)
  const [playing, setPlaying] = useState(false)
  const acc = useRef(0)

  const shown = Math.min(count, steps)

  useAnimationLoop((dt) => {
    acc.current += dt
    let add = 0
    while (acc.current >= COBWEB_MS) {
      acc.current -= COBWEB_MS
      add++
    }
    if (add) setCount((c) => Math.min(c + add, steps))
  }, playing)

  useEffect(() => {
    if (playing && count >= steps) setPlaying(false)
  }, [playing, count, steps])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !width) return
    const side = Math.min(width, 420)
    const dpr = window.devicePixelRatio || 1
    canvas.width = Math.round(side * dpr)
    canvas.height = Math.round(side * dpr)
    canvas.style.width = `${side}px`
    canvas.style.height = `${side}px`
    const ctx = canvas.getContext('2d')
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    const padL = 30
    const padB = 24
    const padT = 8
    const padR = 8
    const plot = side - padL - padR
    const plotH = side - padT - padB
    const X = (x) => padL + x * plot
    const Y = (y) => padT + (1 - y) * plotH

    ctx.clearRect(0, 0, side, side)

    // Frame and ticks
    ctx.strokeStyle = GRID
    ctx.lineWidth = 1
    ctx.strokeRect(X(0), Y(1), plot, plotH)
    ctx.fillStyle = '#64748b'
    ctx.font = '10px "IBM Plex Mono", monospace'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    for (const v of [0, 0.5, 1]) ctx.fillText(String(v), X(v), Y(0) + 6)
    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'
    for (const v of [0, 0.5, 1]) ctx.fillText(String(v), X(0) - 5, Y(v))

    // Diagonal y = x
    ctx.setLineDash([4, 4])
    ctx.strokeStyle = MUTED
    ctx.beginPath()
    ctx.moveTo(X(0), Y(0))
    ctx.lineTo(X(1), Y(1))
    ctx.stroke()
    ctx.setLineDash([])

    // Parabola y = r·x(1 − x)
    ctx.strokeStyle = INK
    ctx.lineWidth = 1.5
    ctx.beginPath()
    for (let i = 0; i <= 200; i++) {
      const x = i / 200
      const px = X(x)
      const py = Y(f(r, x))
      if (i === 0) ctx.moveTo(px, py)
      else ctx.lineTo(px, py)
    }
    ctx.stroke()

    // Cobweb staircase: up to the curve, across to the diagonal, repeat.
    let x = x0
    ctx.strokeStyle = ORANGE
    ctx.globalAlpha = 0.85
    ctx.lineWidth = 1.25
    ctx.beginPath()
    ctx.moveTo(X(x), Y(0))
    for (let i = 0; i < shown; i++) {
      const y = f(r, x)
      ctx.lineTo(X(x), Y(y))
      ctx.lineTo(X(y), Y(y))
      x = y
    }
    ctx.stroke()
    ctx.globalAlpha = 1

    // Current point
    ctx.fillStyle = ORANGE
    ctx.beginPath()
    ctx.arc(X(x), shown ? Y(x) : Y(0), 3.5, 0, Math.PI * 2)
    ctx.fill()

    // Fixed point x* = 1 − 1/r (filled when stable, hollow when unstable)
    if (r > 1) {
      const xs = 1 - 1 / r
      const stable = r < 3
      ctx.beginPath()
      ctx.arc(X(xs), Y(xs), 4.5, 0, Math.PI * 2)
      ctx.fillStyle = stable ? INK : '#ffffff'
      ctx.fill()
      ctx.strokeStyle = INK
      ctx.lineWidth = 1.5
      ctx.stroke()
      ctx.fillStyle = INK
      ctx.font = '11px "IBM Plex Mono", monospace'
      ctx.textAlign = xs > 0.6 ? 'right' : 'left'
      ctx.textBaseline = 'bottom'
      ctx.fillText(
        stable ? t.fixed : t.fixedUnstable,
        X(xs) + (xs > 0.6 ? -8 : 8),
        Y(xs) - 4,
      )
    }
  }, [width, r, x0, shown, t])

  const onPlayPause = () => {
    if (playing) return setPlaying(false)
    if (count >= steps) setCount(0)
    acc.current = 0
    setPlaying(true)
  }

  return (
    <div className={panel}>
      <PanelTitle>B · {t.cobweb}</PanelTitle>
      <div ref={wrapRef} className="mt-4 flex justify-center">
        <canvas ref={canvasRef} role="img" aria-label={t.cobwebAria} className="max-w-full" />
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <SimControls
          playing={playing}
          onPlayPause={onPlayPause}
          onStep={() => setCount((c) => Math.min(c + 1, steps))}
          onReset={() => {
            setPlaying(false)
            setCount(0)
          }}
          labels={t.controls}
        />
        <span className="font-mono text-sm text-slate-600 tabular-nums">
          {t.iteration} {shown} / {steps}
        </span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------- Panel C

function Bifurcation({ t, r, setR }) {
  const wrapRef = useRef(null)
  const canvasRef = useRef(null)
  const width = useElementWidth(wrapRef)
  const height = Math.round(clamp(width * 0.5, 220, 340))
  const [view, setView] = useState(DEFAULT_VIEW)
  const imgRef = useRef(null)
  const dragRef = useRef(null)
  const paintRef = useRef(() => {})

  // Re-assigned every render so it always sees the current r and view.
  paintRef.current = () => {
    const canvas = canvasRef.current
    const img = imgRef.current
    if (!canvas || !img) return
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.putImageData(img, 0, 0)
    const W = canvas.width
    const H = canvas.height

    if (r >= view.rMin && r <= view.rMax) {
      const px = ((r - view.rMin) / (view.rMax - view.rMin)) * W
      ctx.strokeStyle = INK
      ctx.lineWidth = Math.max(1, dpr)
      ctx.beginPath()
      ctx.moveTo(px, 0)
      ctx.lineTo(px, H)
      ctx.stroke()
    }

    const drag = dragRef.current
    if (drag && Math.abs(drag.curX - drag.startX) > 2) {
      const rect = canvas.getBoundingClientRect()
      const a = ((Math.min(drag.startX, drag.curX) - rect.left) / rect.width) * W
      const b = ((Math.max(drag.startX, drag.curX) - rect.left) / rect.width) * W
      ctx.fillStyle = 'rgba(249, 115, 22, 0.15)'
      ctx.fillRect(a, 0, b - a, H)
      ctx.strokeStyle = 'rgba(234, 88, 12, 0.8)'
      ctx.lineWidth = Math.max(1, dpr)
      ctx.strokeRect(a, 0, b - a, H)
    }
  }

  // Progressive computation: a few columns per frame, ~10 ms budget each,
  // so the page stays responsive. Restarts whenever the range or size changes.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !width) return
    const dpr = window.devicePixelRatio || 1
    const W = Math.round(width * dpr)
    const H = Math.round(height * dpr)
    canvas.width = W
    canvas.height = H
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    const img = canvas.getContext('2d').createImageData(W, H)
    imgRef.current = img
    const data = img.data
    const { rMin, rMax } = view
    let col = 0
    let frame

    const work = () => {
      const start = performance.now()
      while (col < W && performance.now() - start < 10) {
        for (let k = 0; k < 4 && col < W; k++, col++) {
          const rc = rMin + ((col + 0.5) / W) * (rMax - rMin)
          let x = 0.5
          for (let i = 0; i < 500; i++) x = rc * x * (1 - x)
          for (let i = 0; i < 200; i++) {
            x = rc * x * (1 - x)
            const row = Math.round((1 - x) * (H - 1))
            if (row < 0 || row >= H) continue
            const idx = (row * W + col) * 4
            data[idx] = 234
            data[idx + 1] = 88
            data[idx + 2] = 12
            data[idx + 3] = Math.min(255, data[idx + 3] + 50)
          }
        }
      }
      paintRef.current()
      if (col < W) frame = requestAnimationFrame(work)
    }
    frame = requestAnimationFrame(work)
    return () => cancelAnimationFrame(frame)
  }, [width, height, view])

  useEffect(() => {
    paintRef.current()
  }, [r])

  const toR = (clientX) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const frac = clamp((clientX - rect.left) / rect.width, 0, 1)
    return view.rMin + frac * (view.rMax - view.rMin)
  }

  const onPointerDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    dragRef.current = { startX: e.clientX, curX: e.clientX }
  }
  const onPointerMove = (e) => {
    if (!dragRef.current) return
    dragRef.current.curX = e.clientX
    paintRef.current()
  }
  const onPointerUp = (e) => {
    const drag = dragRef.current
    if (!drag) return
    dragRef.current = null
    if (Math.abs(drag.curX - drag.startX) > 6) {
      const a = toR(Math.min(drag.startX, drag.curX))
      const b = toR(Math.max(drag.startX, drag.curX))
      if (b - a >= 0.002) setView({ rMin: a, rMax: b })
      else paintRef.current()
    } else {
      setR(Math.round(toR(e.clientX) * 1000) / 1000)
    }
  }
  const onPointerCancel = () => {
    dragRef.current = null
    paintRef.current()
  }

  return (
    <div className={panel}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <PanelTitle>C · {t.bifurcation}</PanelTitle>
        <span className="text-xs text-slate-500">{t.bifHint}</span>
      </div>
      <div ref={wrapRef} className="mt-4">
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={t.bifAria}
          className="block w-full bg-white border border-slate-200 rounded cursor-crosshair"
          style={{ touchAction: 'pan-y' }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerCancel}
        />
        <div className="mt-1 flex justify-between font-mono text-xs text-slate-500 tabular-nums">
          <span>r = {view.rMin.toFixed(3)}</span>
          <span>r = {view.rMax.toFixed(3)}</span>
        </div>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <Slider
          label={t.rMin}
          min={0}
          max={4}
          step={0.001}
          value={view.rMin}
          onChange={(v) => setView((s) => ({ ...s, rMin: Math.min(v, s.rMax - 0.01) }))}
          format={(v) => v.toFixed(3)}
        />
        <Slider
          label={t.rMax}
          min={0}
          max={4}
          step={0.001}
          value={view.rMax}
          onChange={(v) => setView((s) => ({ ...s, rMax: Math.max(v, s.rMin + 0.01) }))}
          format={(v) => v.toFixed(3)}
        />
        <SimControls onReset={() => setView(DEFAULT_VIEW)} labels={{ reset: t.resetView }} />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------- Root

export default function LogisticMap({ lang = 'en' }) {
  const t = T[lang] || T.en
  const [r, setR] = useState(2.8)
  const [x0, setX0] = useState(0.2)
  const [steps, setSteps] = useState(100)

  const { period, lyapunov } = useMemo(() => analyse(r, x0), [r, x0])
  const periodText = period !== null ? String(period) : lyapunov > 0 ? t.chaotic : t.unsettled
  const lyapText = lyapunov < -20 ? '−∞' : lyapunov.toFixed(3).replace('-', '−')

  return (
    <div className="space-y-6">
      <div className={panel}>
        <PanelTitle>{t.params}</PanelTitle>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Slider
            label={t.r}
            min={0}
            max={4}
            step={0.001}
            value={r}
            onChange={setR}
            format={(v) => v.toFixed(3)}
          />
          <Slider
            label={t.x0}
            min={0.01}
            max={0.99}
            step={0.01}
            value={x0}
            onChange={setX0}
            format={(v) => v.toFixed(2)}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <TimeSeries t={t} r={r} x0={x0} steps={steps} setSteps={setSteps} />
        <Cobweb t={t} r={r} x0={x0} steps={steps} />
      </div>

      <Bifurcation t={t} r={r} setR={setR} />

      <div className="grid gap-3 sm:grid-cols-3 font-mono text-sm">
        <div className="bg-white rounded-lg border border-slate-200 px-4 py-3">
          <span className="text-slate-500">r = </span>
          <span className="text-slate-900 tabular-nums">{r.toFixed(3)}</span>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 px-4 py-3">
          <span className="text-slate-500">{t.period}: </span>
          <span className="text-slate-900">{periodText}</span>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 px-4 py-3">
          <span className="text-slate-500">{t.lyap} = </span>
          <span className={lyapunov > 0 ? 'text-orange-600 font-semibold' : 'text-slate-900'}>
            {lyapText}
          </span>
          <span className="block text-xs text-slate-500 mt-0.5">{t.lyapNote}</span>
        </div>
      </div>
    </div>
  )
}
