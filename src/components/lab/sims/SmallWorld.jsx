import { useEffect, useMemo, useRef, useState } from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceArea,
  ResponsiveContainer,
} from 'recharts'
import Slider from '../Slider.jsx'
import SimControls from '../SimControls.jsx'
import useAnimationLoop from '../useAnimationLoop.js'
import useExperiment from '../useExperiment.js'
import { mulberry32 } from '../rng.js'
import {
  buildCSR,
  bfsDistances,
  shortestPath,
  clustering,
  averagePathLength,
  sampleNodes,
  ringLattice,
  wattsStrogatz,
  rewireSequence,
} from '../graphUtils.js'

// Watts–Strogatz small worlds, in two panels: one network on a ring to build
// and explore (rewiring, distances, shortest paths, live C and L) and the
// classic experiment plotting C(p)/C(0) and L(p)/L(0) for n = 1000, k = 10.

const ORANGE = '#f7931a' // shortcuts
const INK = '#0f172a' // slate-900
const SLATE = '#64748b' // slate-500
const MUTED = '#94a3b8' // slate-400
const GRID = '#e2e8f0' // slate-200
const C_LINE = '#ea580c' // orange-600
const L_LINE = '#0f172a' // slate-900
const DIST_STOPS = ['#0c4a6e', '#0284c7', '#7dd3fc'] // sky-900/600/300, near → far
const MONO = 'IBM Plex Mono, monospace'

const P_MIN = 0.0001
const EXP_N = 1000
const EXP_K = 10
const EXP_SOURCES = 200
const P_GRID = Array.from({ length: 20 }, (_, i) => P_MIN * (1 / P_MIN) ** (i / 19))

const T = {
  en: {
    build: 'Build a small world',
    n: 'Nodes n',
    k: 'Neighbours per node k',
    p: 'Rewiring probability p',
    pZero: 'p = 0 (pure lattice)',
    expected: (x) => `≈ p · nk/2 = ${x} shortcuts expected`,
    seed: 'Seed',
    newNetwork: 'New network',
    setP: 'Set p',
    oneByOne: 'Rewire one by one',
    speed: 'Speed (rewires per second)',
    controls: { play: 'Play', pause: 'Pause', step: 'Step', reset: 'Reset' },
    canvasAria:
      'Drawing of the network: nodes on a circle, lattice links as thin grey lines, rewired shortcuts as orange chords. Click a node to colour the network by distance from it, then a second node to show a shortest path.',
    legend: { lattice: 'lattice link', shortcut: 'shortcut', path: 'shortest path', unreachable: 'unreachable' },
    distLegend: 'steps from the selected node',
    hint: 'Click a node to colour the network by its distance from it.',
    fromNode: (s, far) => `Node ${s}: the farthest node is ${far} step${far === 1 ? '' : 's'} away. Click a second node.`,
    pathTo: (a, b, len, nodes) =>
      `Shortest path ${a} → ${b}: ${len} step${len === 1 ? '' : 's'}${nodes ? ` (${nodes})` : ''}.`,
    noPath: (a, b) => `Nodes ${a} and ${b} are not connected.`,
    clear: 'Clear',
    clustering: 'Clustering C',
    pathLength: 'Path length L',
    lattice: 'Lattice C₀ · L₀',
    ratios: 'C/C₀ · L/L₀',
    shortcuts: 'Shortcuts',
    randomRef: 'Random-graph reference',
    disconnected: (pct) => `over connected pairs only (${pct}% of pairs disconnected)`,
    histTitle: 'Degrees of separation',
    histAria: 'Bar chart of the share of node pairs at each shortest-path distance.',
    histX: (d) => `${d} step${d === 1 ? '' : 's'}`,
    share: 'share of pairs',
    historyTitle: 'C/C₀ and L/L₀ as shortcuts are added',
    historyX: 'shortcuts',
    experiment: 'The Watts–Strogatz experiment',
    expTitle: `C(p)/C(0) and L(p)/L(0), n = ${EXP_N}, k = ${EXP_K}`,
    regime: 'small-world regime',
    trials: 'Realisations per p, T',
    run: { play: 'Run', pause: 'Cancel' },
    running: 'Computing…',
    done: (t) => `Average of ${t} realisation${t === 1 ? '' : 's'} per value of p.`,
    cancelled: (p) => `Cancelled at ${Math.round(p * 100)}%: partial averages.`,
    note: (c0, l0) =>
      `C is exact. L is estimated from breadth-first searches started at ${EXP_SOURCES} randomly chosen nodes per graph. Both are divided by the values of the unrewired lattice, C(0) = ${c0} and L(0) = ${l0} (exact). The shaded band marks where C/C₀ > 0.8 while L/L₀ < 0.3.`,
    tooltipP: (p) => `p = ${p.toPrecision(2)}`,
  },
  it: {
    build: 'Costruisci una rete small-world',
    n: 'Nodi n',
    k: 'Vicini per nodo k',
    p: 'Probabilità di ricollegamento p',
    pZero: 'p = 0 (reticolo puro)',
    expected: (x) => `≈ p · nk/2 = ${x} scorciatoie attese`,
    seed: 'Seme',
    newNetwork: 'Nuova rete',
    setP: 'Imposta p',
    oneByOne: 'Ricollega uno alla volta',
    speed: 'Velocità (ricollegamenti al secondo)',
    controls: { play: 'Avvia', pause: 'Pausa', step: 'Passo', reset: 'Azzera' },
    canvasAria:
      'Disegno della rete: nodi su un cerchio, collegamenti del reticolo come sottili linee grigie, scorciatoie ricollegate come corde arancioni. Clicca un nodo per colorare la rete in base alla distanza da esso, poi un secondo nodo per mostrare un cammino minimo.',
    legend: {
      lattice: 'collegamento del reticolo',
      shortcut: 'scorciatoia',
      path: 'cammino minimo',
      unreachable: 'irraggiungibile',
    },
    distLegend: 'passi dal nodo selezionato',
    hint: 'Clicca un nodo per colorare la rete in base alla distanza da esso.',
    fromNode: (s, far) =>
      `Nodo ${s}: il nodo più lontano dista ${far} pass${far === 1 ? 'o' : 'i'}. Clicca un secondo nodo.`,
    pathTo: (a, b, len, nodes) =>
      `Cammino minimo ${a} → ${b}: ${len} pass${len === 1 ? 'o' : 'i'}${nodes ? ` (${nodes})` : ''}.`,
    noPath: (a, b) => `I nodi ${a} e ${b} non sono connessi.`,
    clear: 'Cancella',
    clustering: 'Clustering C',
    pathLength: 'Lunghezza dei cammini L',
    lattice: 'Reticolo C₀ · L₀',
    ratios: 'C/C₀ · L/L₀',
    shortcuts: 'Scorciatoie',
    randomRef: 'Riferimento del grafo casuale',
    disconnected: (pct) => `solo sulle coppie connesse (${pct}% delle coppie non connesse)`,
    histTitle: 'Gradi di separazione',
    histAria: 'Grafico a barre della frazione di coppie di nodi a ciascuna distanza minima.',
    histX: (d) => `${d} pass${d === 1 ? 'o' : 'i'}`,
    share: 'frazione di coppie',
    historyTitle: 'C/C₀ e L/L₀ man mano che si aggiungono scorciatoie',
    historyX: 'scorciatoie',
    experiment: "L'esperimento di Watts e Strogatz",
    expTitle: `C(p)/C(0) e L(p)/L(0), n = ${EXP_N}, k = ${EXP_K}`,
    regime: 'regime small-world',
    trials: 'Realizzazioni per p, T',
    run: { play: 'Calcola', pause: 'Annulla' },
    running: 'Calcolo in corso…',
    done: (t) => `Media di ${t} realizzazion${t === 1 ? 'e' : 'i'} per ogni valore di p.`,
    cancelled: (p) => `Annullato al ${Math.round(p * 100)}%: medie parziali.`,
    note: (c0, l0) =>
      `C è esatto. L è stimato con ricerche in ampiezza avviate da ${EXP_SOURCES} nodi scelti a caso in ogni grafo. Entrambi sono divisi per i valori del reticolo non ricollegato, C(0) = ${c0} e L(0) = ${l0} (esatti). La fascia ombreggiata indica dove C/C₀ > 0,8 mentre L/L₀ < 0,3.`,
    tooltipP: (p) => `p = ${p.toPrecision(2)}`,
  },
}

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))

function formatP(p) {
  if (p >= 0.1) return p.toFixed(2)
  if (p >= 0.001) return p.toPrecision(2)
  return p.toExponential(1)
}

const ratio = (x, x0) => (x0 > 0 && Number.isFinite(x) ? x / x0 : null)
const fmt = (v, d) => (v == null || !Number.isFinite(v) ? '–' : v.toFixed(d))

const SUPERSCRIPT = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴' }
const pTick = (v) => {
  const e = Math.round(Math.log10(v))
  return e === 0 ? '1' : `10${String(e).replace(/./g, (c) => SUPERSCRIPT[c])}`
}

function hexToRgb(hex) {
  const v = parseInt(hex.slice(1), 16)
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255]
}
const DIST_RGB = DIST_STOPS.map(hexToRgb)

// Sequential palette for BFS distance: t = 0 (the source) dark, t = 1 light.
function distColor(t) {
  const x = clamp(t, 0, 1) * (DIST_RGB.length - 1)
  const i = Math.min(Math.floor(x), DIST_RGB.length - 2)
  const f = x - i
  const c = DIST_RGB[i].map((a, j) => Math.round(a + (DIST_RGB[i + 1][j] - a) * f))
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`
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
const axisTick = { fontSize: 11, fontFamily: MONO }

// C₀ and L₀ of the ring lattice. The lattice looks the same from every node,
// so one BFS gives the exact L₀.
function latticeBaseline(n, k) {
  const { A, B } = ringLattice(n, k)
  const g = buildCSR(n, A, B)
  return { C0: clustering(g).average, L0: averagePathLength(g, [0]).mean }
}

// ---------------------------------------------------------------- Panel A

function Stat({ label, children, wide = false }) {
  return (
    <div
      className={`bg-white rounded-lg border border-slate-200 px-3 py-2.5 min-w-0 ${
        wide ? 'col-span-2 sm:col-span-3' : ''
      }`}
    >
      <span className="block text-xs text-slate-500 font-sans">{label}</span>
      <span className="block mt-0.5 text-slate-900 tabular-nums">{children}</span>
    </div>
  )
}

function LineSwatch({ color, width = 2 }) {
  return (
    <span
      className="inline-block w-4 shrink-0"
      style={{ height: width, background: color }}
      aria-hidden="true"
    />
  )
}

function SmallWorldBuilder({ t }) {
  const [n, setN] = useState(100)
  const [k, setK] = useState(6)
  const [p, setP] = useState(0.01)
  const [pZero, setPZero] = useState(false)
  const [seed, setSeed] = useState(1)
  const [stepMode, setStepMode] = useState(false)
  const [steps, setSteps] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(3)
  const [source, setSource] = useState(null)
  const [target, setTarget] = useState(null)
  const [history, setHistory] = useState({ key: '', points: [] })

  const wrapRef = useRef(null)
  const canvasRef = useRef(null)
  const screenRef = useRef(null) // node positions in CSS pixels, for hit-testing
  const stepAcc = useRef(0)
  const width = useElementWidth(wrapRef)
  const size = Math.min(width, 480)

  // k is even and below n − 1, so a lattice node never links to everyone.
  const kMax = Math.min(20, (n - 2) & ~1)
  const kk = Math.min(k, kMax)
  const m = (n * kk) / 2
  const pEff = pZero ? 0 : p
  const runKey = `${n}-${kk}-${seed}`

  const net = useMemo(
    () => (stepMode ? rewireSequence(n, kk, steps, seed) : wattsStrogatz(n, kk, pEff, seed)),
    [stepMode, n, kk, steps, pEff, seed],
  )
  const g = useMemo(() => buildCSR(n, net.A, net.B), [n, net])
  const stats = useMemo(() => ({ C: clustering(g).average, path: averagePathLength(g) }), [g])
  const base = useMemo(() => latticeBaseline(n, kk), [n, kk])

  const dist = useMemo(() => (source != null ? bfsDistances(g, source) : null), [g, source])
  const path = useMemo(
    () => (source != null && target != null ? shortestPath(g, source, target) : null),
    [g, source, target],
  )
  const maxDist = useMemo(() => (dist ? Math.max(1, ...dist) : 1), [dist])

  const C = stats.C
  const L = stats.path.mean
  const cRatio = ratio(C, base.C0)
  const lRatio = ratio(L, base.L0)

  // A new network restarts the one-by-one rewiring; a smaller n may drop the selection.
  useEffect(() => {
    setSteps(0)
    setPlaying(false)
  }, [n, kk, seed])
  useEffect(() => {
    if (source != null && source >= n) setSource(null)
    if (target != null && target >= n) setTarget(null)
  }, [n, source, target])

  // In one-by-one mode, every new step adds a point to the C/C₀, L/L₀ history.
  // Going back to fewer steps (Reset) or to another network starts it afresh.
  useEffect(() => {
    if (!stepMode) return
    setHistory((h) => {
      const last = h.points[h.points.length - 1]
      if (h.key === runKey && last && last.steps === steps) return h
      const keep = h.key === runKey && last && steps > last.steps
      const point = { steps, s: net.shortcuts, c: cRatio, l: lRatio }
      return { key: runKey, points: keep ? [...h.points, point] : [point] }
    })
  }, [stepMode, runKey, steps, net, cRatio, lRatio])

  useAnimationLoop((dt) => {
    stepAcc.current += (speed * dt) / 1000
    const add = Math.floor(stepAcc.current)
    if (add) {
      stepAcc.current -= add
      setSteps((s) => Math.min(s + add, m))
    }
  }, playing)

  useEffect(() => {
    if (playing && steps >= m) setPlaying(false)
  }, [playing, steps, m])

  // Draw
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !size) return
    const dpr = window.devicePixelRatio || 1
    canvas.width = Math.round(size * dpr)
    canvas.height = Math.round(size * dpr)
    canvas.style.width = `${size}px`
    canvas.style.height = `${size}px`
    const ctx = canvas.getContext('2d')
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, size, size)

    const R = size / 2 - 14
    const sx = new Float64Array(n)
    const sy = new Float64Array(n)
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + (2 * Math.PI * i) / n
      sx[i] = size / 2 + R * Math.cos(a)
      sy[i] = size / 2 + R * Math.sin(a)
    }
    screenRef.current = { sx, sy }

    const { A, B, rewired } = net
    const edges = A.length

    // Lattice links
    ctx.strokeStyle = 'rgba(100, 116, 139, 0.4)'
    ctx.lineWidth = n <= 150 ? 1 : 0.6
    ctx.beginPath()
    for (let e = 0; e < edges; e++) {
      if (rewired[e]) continue
      ctx.moveTo(sx[A[e]], sy[A[e]])
      ctx.lineTo(sx[B[e]], sy[B[e]])
    }
    ctx.stroke()

    // Shortcuts
    ctx.strokeStyle = ORANGE
    ctx.lineWidth = n <= 150 ? 1.5 : 1
    ctx.beginPath()
    for (let e = 0; e < edges; e++) {
      if (!rewired[e]) continue
      ctx.moveTo(sx[A[e]], sy[A[e]])
      ctx.lineTo(sx[B[e]], sy[B[e]])
    }
    ctx.stroke()

    // Shortest path
    if (path && path.length > 1) {
      ctx.strokeStyle = INK
      ctx.lineWidth = 2.5
      ctx.lineJoin = 'round'
      ctx.beginPath()
      ctx.moveTo(sx[path[0]], sy[path[0]])
      for (let i = 1; i < path.length; i++) ctx.lineTo(sx[path[i]], sy[path[i]])
      ctx.stroke()
    }

    // Nodes
    const radius = n <= 50 ? 4.5 : n <= 150 ? 3.5 : 2.5
    for (let i = 0; i < n; i++) {
      ctx.beginPath()
      ctx.arc(sx[i], sy[i], radius, 0, Math.PI * 2)
      if (dist && dist[i] < 0) {
        ctx.fillStyle = '#ffffff'
        ctx.fill()
        ctx.strokeStyle = SLATE
        ctx.lineWidth = 1
        ctx.stroke()
      } else {
        ctx.fillStyle = dist ? distColor(dist[i] / maxDist) : SLATE
        ctx.fill()
      }
    }

    ctx.strokeStyle = INK
    ctx.lineWidth = 2
    for (const v of [source, target]) {
      if (v == null) continue
      ctx.beginPath()
      ctx.arc(sx[v], sy[v], radius + 3.5, 0, Math.PI * 2)
      ctx.stroke()
    }
  }, [size, n, net, dist, maxDist, path, source, target])

  const clearSelection = () => {
    setSource(null)
    setTarget(null)
  }

  const onCanvasClick = (e) => {
    const scr = screenRef.current
    if (!scr) return
    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    let best = -1
    let bestD = 14 * 14 // touch-friendly hit radius
    for (let i = 0; i < n; i++) {
      const d = (scr.sx[i] - x) ** 2 + (scr.sy[i] - y) ** 2
      if (d < bestD) {
        bestD = d
        best = i
      }
    }
    if (best < 0 || best === source) return clearSelection()
    if (source == null || target != null) {
      setSource(best)
      setTarget(null)
    } else {
      setTarget(best)
    }
  }

  const onPlayPause = () => {
    if (playing) return setPlaying(false)
    if (steps >= m) setSteps(0)
    stepAcc.current = 0
    setPlaying(true)
  }

  const setMode = (s) => {
    setStepMode(s)
    setPlaying(false)
    setSteps(0)
  }

  const histData = useMemo(() => {
    const h = stats.path.histogram
    const out = []
    for (let d = 1; d < h.length; d++) out.push({ d, f: h[d] / stats.path.pairs })
    return out
  }, [stats])

  const unreachablePct =
    stats.path.unreachable > 0
      ? ((100 * stats.path.unreachable) / (stats.path.unreachable + stats.path.pairs)).toFixed(1)
      : null

  let info = t.hint
  if (source != null && target == null) info = t.fromNode(source, maxDist)
  if (source != null && target != null) {
    info = path
      ? t.pathTo(source, target, path.length - 1, path.length <= 12 ? path.join(' → ') : '')
      : t.noPath(source, target)
  }

  const tab = (active) =>
    `px-3 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider transition-colors ${
      active ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-orange-600'
    }`

  return (
    <div className={panel}>
      <PanelTitle>A · {t.build}</PanelTitle>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Slider label={t.n} min={20} max={400} step={1} value={n} onChange={setN} />
        <Slider label={t.k} min={2} max={kMax} step={2} value={kk} onChange={setK} />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <span className="font-mono text-sm text-slate-600 tabular-nums">
          {t.seed} {seed}
        </span>
        <SimControls onReset={() => setSeed((s) => s + 1)} labels={{ reset: t.newNetwork }} />
      </div>

      <div className="mt-5 inline-flex flex-wrap rounded-full border border-slate-200 p-0.5" role="group">
        <button type="button" className={tab(!stepMode)} aria-pressed={!stepMode} onClick={() => setMode(false)}>
          {t.setP}
        </button>
        <button type="button" className={tab(stepMode)} aria-pressed={stepMode} onClick={() => setMode(true)}>
          {t.oneByOne}
        </button>
      </div>

      {stepMode ? (
        <div className="mt-4 grid gap-4 sm:grid-cols-[auto_1fr] sm:items-end">
          <SimControls
            playing={playing}
            onPlayPause={onPlayPause}
            onStep={() => setSteps((s) => Math.min(s + 1, m))}
            onReset={() => {
              setPlaying(false)
              setSteps(0)
            }}
            labels={t.controls}
          />
          <Slider
            label={t.speed}
            min={0.5}
            max={30}
            log
            value={speed}
            onChange={setSpeed}
            format={(v) => v.toFixed(v < 10 ? 1 : 0)}
          />
        </div>
      ) : (
        <div className="mt-4">
          <div className={pZero ? 'opacity-50' : ''}>
            <Slider
              label={t.p}
              min={P_MIN}
              max={1}
              log
              value={p}
              onChange={(v) => {
                setP(v)
                setPZero(false)
              }}
              format={(v) => (pZero ? '0' : formatP(v))}
            />
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
            <label className="inline-flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                className="accent-orange-600"
                checked={pZero}
                onChange={(e) => setPZero(e.target.checked)}
              />
              {t.pZero}
            </label>
            <span className="font-mono text-xs text-slate-500 tabular-nums">
              {t.expected(fmt(pEff * m, pEff * m < 10 ? 1 : 0))}
            </span>
          </div>
        </div>
      )}

      <div ref={wrapRef} className="mt-4">
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={t.canvasAria}
          className="block mx-auto bg-white border border-slate-200 rounded cursor-pointer"
          onClick={onCanvasClick}
        />
      </div>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-slate-600">
        <span className="inline-flex items-center gap-1.5">
          <LineSwatch color={MUTED} width={1} /> {t.legend.lattice}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <LineSwatch color={ORANGE} /> {t.legend.shortcut}
        </span>
        {path && (
          <span className="inline-flex items-center gap-1.5">
            <LineSwatch color={INK} width={3} /> {t.legend.path}
          </span>
        )}
      </div>
      {dist && (
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-slate-600">
          <span className="tabular-nums">0</span>
          <span
            className="inline-block h-2.5 w-28 rounded-sm"
            style={{ background: `linear-gradient(to right, ${DIST_STOPS.join(', ')})` }}
            aria-hidden="true"
          />
          <span className="tabular-nums">{maxDist}</span>
          <span>{t.distLegend}</span>
          {stats.path.unreachable > 0 && (
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block w-2.5 h-2.5 rounded-full border border-slate-500 bg-white" />
              {t.legend.unreachable}
            </span>
          )}
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <p className="font-mono text-sm text-slate-700 min-w-0" aria-live="polite">
          {info}
        </p>
        {source != null && <SimControls onReset={clearSelection} labels={{ reset: t.clear }} />}
      </div>

      <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-sm">
        <Stat label={t.clustering}>{fmt(C, 3)}</Stat>
        <Stat label={t.pathLength}>
          {fmt(L, 2)}
          {unreachablePct && (
            <span className="block text-xs text-slate-600 mt-0.5 font-sans">{t.disconnected(unreachablePct)}</span>
          )}
        </Stat>
        <Stat label={t.lattice}>
          {fmt(base.C0, 3)} · {fmt(base.L0, 2)}
        </Stat>
        <Stat label={t.ratios}>
          {fmt(cRatio, 2)} · {fmt(lRatio, 2)}
        </Stat>
        <Stat label={t.shortcuts}>
          {net.shortcuts}{' '}
          <span className="text-slate-500">/ {m}</span>
        </Stat>
        <Stat label={t.randomRef} wide>
          L ≈ ln n / ln k = {fmt(Math.log(n) / Math.log(kk), 2)} · C ≈ k/n = {fmt(kk / n, 3)}
        </Stat>
      </div>

      <div className={`mt-6 grid gap-6 ${stepMode ? 'lg:grid-cols-2' : ''}`}>
        <div className="min-w-0">
          <PanelTitle>{t.histTitle}</PanelTitle>
          <div className="mt-3 h-48 -ml-4" role="img" aria-label={t.histAria}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={histData} margin={{ top: 8, right: 8, bottom: 4, left: 0 }} barCategoryGap={1}>
                <CartesianGrid stroke={GRID} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="d" tick={axisTick} stroke={MUTED} minTickGap={8} />
                <YAxis width={40} tick={axisTick} stroke={MUTED} tickFormatter={(v) => v.toFixed(2)} />
                <Tooltip
                  formatter={(v) => [v.toFixed(3), t.share]}
                  labelFormatter={t.histX}
                  contentStyle={{ fontFamily: MONO, fontSize: 12 }}
                />
                <Bar dataKey="f" fill={ORANGE} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        {stepMode && (
          <div className="min-w-0">
            <PanelTitle>{t.historyTitle}</PanelTitle>
            <div className="mt-3 h-48 -ml-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history.points} margin={{ top: 8, right: 8, bottom: 4, left: 0 }}>
                  <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="s"
                    type="number"
                    domain={[0, (max) => Math.max(10, max)]}
                    allowDecimals={false}
                    tick={axisTick}
                    stroke={MUTED}
                  />
                  <YAxis domain={[0, 1]} ticks={[0, 0.25, 0.5, 0.75, 1]} width={40} tick={axisTick} stroke={MUTED} />
                  <Tooltip
                    formatter={(v) => (v == null ? '–' : v.toFixed(3))}
                    labelFormatter={(s) => `${t.historyX}: ${s}`}
                    contentStyle={{ fontFamily: MONO, fontSize: 12 }}
                  />
                  <Line type="linear" dataKey="c" name="C/C₀" stroke={C_LINE} strokeWidth={1.75} dot={false} isAnimationActive={false} />
                  <Line type="linear" dataKey="l" name="L/L₀" stroke={L_LINE} strokeWidth={1.75} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <RatioLegend />
          </div>
        )}
      </div>
    </div>
  )
}

function RatioLegend({ extra }) {
  return (
    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-slate-600">
      <span className="inline-flex items-center gap-1.5">
        <LineSwatch color={C_LINE} /> C/C₀
      </span>
      <span className="inline-flex items-center gap-1.5">
        <LineSwatch color={L_LINE} /> L/L₀
      </span>
      {extra}
    </div>
  )
}

// ---------------------------------------------------------------- Panel B

const EXP_BASE = latticeBaseline(EXP_N, EXP_K)

// T realisations of the Watts–Strogatz model at every p of the grid,
// interleaved so that both curves fill in together. One graph per yield.
function makeJob(trials, seed) {
  const random = mulberry32(seed)
  const sumC = new Float64Array(P_GRID.length)
  const sumL = new Float64Array(P_GRID.length)
  const done = new Int32Array(P_GRID.length)
  const total = trials * P_GRID.length
  function* iter() {
    let units = 0
    for (let tr = 0; tr < trials; tr++) {
      for (let i = 0; i < P_GRID.length; i++) {
        const w = wattsStrogatz(EXP_N, EXP_K, P_GRID[i], Math.floor(random() * 2 ** 32))
        const g = buildCSR(EXP_N, w.A, w.B)
        sumC[i] += clustering(g).average / EXP_BASE.C0
        sumL[i] += averagePathLength(g, sampleNodes(EXP_N, EXP_SOURCES, random)).mean / EXP_BASE.L0
        done[i]++
        units++
        yield units / total
      }
    }
  }
  const snapshot = () =>
    P_GRID.map((p, i) => ({
      p,
      c: done[i] ? sumC[i] / done[i] : null,
      l: done[i] ? sumL[i] / done[i] : null,
    }))
  return { iter: iter(), snapshot }
}

function WattsStrogatzExperiment({ t }) {
  const [trials, setTrials] = useState(5)
  const [ranTrials, setRanTrials] = useState(5)
  const seedRef = useRef(0)
  const exp = useExperiment()

  const onRun = () => {
    seedRef.current++
    setRanTrials(trials)
    exp.run(makeJob(trials, 3000 + seedRef.current))
  }
  // Run once with the defaults on first display.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(onRun, [])

  const data = exp.data || P_GRID.map((p) => ({ p }))

  // The p values whose averages already show the small-world signature.
  const regime = useMemo(() => {
    const inside = data.filter((r) => r.c != null && r.c > 0.8 && r.l < 0.3).map((r) => r.p)
    return inside.length ? [inside[0], inside[inside.length - 1]] : null
  }, [data])

  return (
    <div className={panel}>
      <PanelTitle>{t.expTitle}</PanelTitle>
      <div className="mt-4 h-72 -ml-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 12, bottom: 4, left: 0 }}>
            <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
            <XAxis
              dataKey="p"
              type="number"
              scale="log"
              domain={[P_MIN, 1]}
              ticks={[1e-4, 1e-3, 1e-2, 1e-1, 1]}
              tickFormatter={pTick}
              allowDataOverflow
              tick={axisTick}
              stroke={MUTED}
            />
            <YAxis domain={[0, 1]} ticks={[0, 0.25, 0.5, 0.75, 1]} width={40} tick={axisTick} stroke={MUTED} />
            {regime && (
              <ReferenceArea
                x1={regime[0]}
                x2={regime[1]}
                fill="#fed7aa"
                fillOpacity={0.45}
                stroke="none"
                ifOverflow="hidden"
              />
            )}
            <Tooltip
              formatter={(v) => (v == null ? '–' : v.toFixed(3))}
              labelFormatter={t.tooltipP}
              contentStyle={{ fontFamily: MONO, fontSize: 12 }}
            />
            <Line type="linear" dataKey="c" name="C(p)/C(0)" stroke={C_LINE} strokeWidth={1.75} dot={{ r: 2.5 }} isAnimationActive={false} />
            <Line type="linear" dataKey="l" name="L(p)/L(0)" stroke={L_LINE} strokeWidth={1.75} dot={{ r: 2.5 }} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <RatioLegend
        extra={
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block w-4 h-2.5 rounded-sm" style={{ background: '#fed7aa' }} aria-hidden="true" />
            {t.regime}
          </span>
        }
      />
      <p className="mt-3 text-xs text-slate-500 leading-relaxed">
        {t.note(EXP_BASE.C0.toFixed(3), EXP_BASE.L0.toFixed(2))}
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
        <Slider label={t.trials} min={1} max={20} step={1} value={trials} onChange={setTrials} />
        <SimControls playing={exp.running} onPlayPause={exp.running ? exp.cancel : onRun} labels={t.run} />
      </div>
      <div className="mt-3 h-1.5 rounded-full bg-slate-100 overflow-hidden" aria-hidden="true">
        <div
          className="h-full bg-orange-500 transition-[width] duration-150"
          style={{ width: `${Math.round(exp.progress * 100)}%` }}
        />
      </div>
      <p className="mt-2 font-mono text-xs text-slate-500" aria-live="polite">
        {exp.running ? t.running : exp.cancelled ? t.cancelled(exp.progress) : t.done(ranTrials)}
      </p>
    </div>
  )
}

// ---------------------------------------------------------------- Root

export default function SmallWorld({ lang = 'en' }) {
  const t = T[lang] || T.en
  return (
    <div className="space-y-6">
      <SmallWorldBuilder t={t} />
      <div>
        <PanelTitle>B · {t.experiment}</PanelTitle>
        <div className="mt-4">
          <WattsStrogatzExperiment t={t} />
        </div>
      </div>
    </div>
  )
}
