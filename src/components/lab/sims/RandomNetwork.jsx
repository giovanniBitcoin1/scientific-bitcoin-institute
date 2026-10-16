import { useEffect, useMemo, useRef, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts'
import Slider from '../Slider.jsx'
import SimControls from '../SimControls.jsx'
import useAnimationLoop from '../useAnimationLoop.js'
import { mulberry32, randNormal } from '../rng.js'

// Erdős–Rényi random graphs G(n, p), in two panels: one network to explore
// (layout, gradual growth, BFS) and two computed experiments showing the
// giant-component and connectivity phase transitions.

const ORANGE = '#f7931a' // largest component
const BFS = '#0284c7' // sky-600, contrasts with orange
const INK = '#0f172a' // slate-900
const SLATE = '#64748b' // slate-500
const MUTED = '#94a3b8' // slate-400
const GRID = '#e2e8f0' // slate-200
const SERIES = ['#fb923c', '#ea580c', '#7c2d12'] // orange-400/600/900, small → large n
const MONO = 'IBM Plex Mono, monospace'

const K_MAX = 20 // top of the ⟨k⟩ slider
const FORCE_MAX_N = 300 // above this the layout falls back to a circle
const LAYOUT_ITERS = 200
const BFS_MS = 380 // one BFS level per this many ms

const S_SIZES = [100, 1000, 10000]
const S_GRID = Array.from({ length: 51 }, (_, i) => i / 10) // ⟨k⟩ = 0 … 5
const C_SIZES = [20, 100, 500]
const C_MIN = 0.5
const C_MAX = 15
const C_GRID = Array.from({ length: 30 }, (_, i) => C_MIN * (C_MAX / C_MIN) ** (i / 29))

const T = {
  en: {
    explore: 'Explore one network',
    n: 'Nodes n',
    k: 'Mean degree ⟨k⟩',
    p: 'p = ⟨k⟩ / (n − 1)',
    seed: 'Seed',
    newNetwork: 'New network',
    whole: 'Whole network',
    gradual: 'Add edges gradually',
    speed: 'Speed (edges per frame)',
    canvasAria:
      'Drawing of the random network: nodes are dots, edges are lines, the largest connected component is orange. Click a node to run a breadth-first search from it.',
    canvasHint: 'Click a node to start BFS from it',
    legend: {
      giant: 'largest component',
      other: 'other components',
      isolated: 'isolated',
      visited: 'reached by BFS',
      frontier: 'BFS frontier',
    },
    edges: 'Edges',
    kActual: '⟨k⟩ actual',
    components: 'Components',
    largest: 'Largest component',
    isolated: 'Isolated nodes',
    connected: 'Connected',
    yes: 'YES',
    no: 'no',
    thresholds: 'Thresholds',
    regime: [
      '⟨k⟩ < 1: only small fragments',
      '1 < ⟨k⟩ < ln n: giant component, not yet connected',
      '⟨k⟩ > ln n: connectivity expected',
    ],
    bfs: 'Animate BFS',
    clear: 'Clear',
    source: (s) => `Start: node ${s}`,
    bfsRunning: (level, reached) => `Level ${level} · ${reached} nodes reached`,
    bfsDone: (s, reached, n, levels) =>
      `BFS from node ${s} reached ${reached} of ${n} nodes (${Math.round(
        (100 * reached) / n,
      )}%) in ${levels} level${levels === 1 ? '' : 's'}: exactly its connected component.`,
    controls: { play: 'Play', pause: 'Pause', step: 'Step', reset: 'Reset' },
    transitions: 'Two phase transitions',
    giantTitle: 'Largest-component fraction S',
    connTitle: 'Probability that the network is connected',
    trials: 'Trials per size T',
    run: { play: 'Run', pause: 'Cancel' },
    theory: 'theory',
    lnN: 'ln n',
    running: 'Computing…',
    done: (t) => `Average of ${t} trials per size.`,
    cancelled: (p) => `Cancelled at ${Math.round(p * 100)}%: partial averages.`,
    tooltipK: (k) => `⟨k⟩ = ${k.toFixed(2)}`,
  },
  it: {
    explore: 'Esplora una rete',
    n: 'Nodi n',
    k: 'Grado medio ⟨k⟩',
    p: 'p = ⟨k⟩ / (n − 1)',
    seed: 'Seme',
    newNetwork: 'Nuova rete',
    whole: 'Rete intera',
    gradual: 'Aggiungi archi gradualmente',
    speed: 'Velocità (archi per fotogramma)',
    canvasAria:
      'Disegno della rete casuale: i nodi sono punti, gli archi linee, la componente connessa più grande è arancione. Clicca un nodo per avviare da lì una ricerca in ampiezza.',
    canvasHint: 'Clicca un nodo per avviare la BFS da lì',
    legend: {
      giant: 'componente più grande',
      other: 'altre componenti',
      isolated: 'isolati',
      visited: 'raggiunti dalla BFS',
      frontier: 'frontiera della BFS',
    },
    edges: 'Archi',
    kActual: '⟨k⟩ effettivo',
    components: 'Componenti',
    largest: 'Componente più grande',
    isolated: 'Nodi isolati',
    connected: 'Connessa',
    yes: 'SÌ',
    no: 'no',
    thresholds: 'Soglie',
    regime: [
      '⟨k⟩ < 1: solo piccoli frammenti',
      '1 < ⟨k⟩ < ln n: componente gigante, non ancora connessa',
      '⟨k⟩ > ln n: connessione attesa',
    ],
    bfs: 'Anima la BFS',
    clear: 'Cancella',
    source: (s) => `Partenza: nodo ${s}`,
    bfsRunning: (level, reached) => `Livello ${level} · ${reached} nodi raggiunti`,
    bfsDone: (s, reached, n, levels) =>
      `La BFS dal nodo ${s} ha raggiunto ${reached} nodi su ${n} (${Math.round(
        (100 * reached) / n,
      )}%) in ${levels} livell${levels === 1 ? 'o' : 'i'}: esattamente la sua componente connessa.`,
    controls: { play: 'Avvia', pause: 'Pausa', step: 'Passo', reset: 'Azzera' },
    transitions: 'Due transizioni di fase',
    giantTitle: 'Frazione S nella componente più grande',
    connTitle: 'Probabilità che la rete sia connessa',
    trials: 'Prove per dimensione T',
    run: { play: 'Calcola', pause: 'Annulla' },
    theory: 'teoria',
    lnN: 'ln n',
    running: 'Calcolo in corso…',
    done: (t) => `Media di ${t} prove per dimensione.`,
    cancelled: (p) => `Annullato al ${Math.round(p * 100)}%: medie parziali.`,
    tooltipK: (k) => `⟨k⟩ = ${k.toFixed(2)}`,
  },
}

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))

function formatP(p) {
  if (p >= 0.01) return p.toFixed(4)
  return p.toPrecision(3)
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

// ---------------------------------------------------------------- Graph maths

// Union-find with path halving and union by size. `parent` and `size` are
// typed arrays owned by the caller; union returns true when two components merged.
function find(parent, x) {
  while (parent[x] !== x) {
    parent[x] = parent[parent[x]]
    x = parent[x]
  }
  return x
}

function union(parent, size, a, b) {
  let ra = find(parent, a)
  let rb = find(parent, b)
  if (ra === rb) return false
  if (size[ra] < size[rb]) [ra, rb] = [rb, ra]
  parent[rb] = ra
  size[ra] += size[rb]
  return true
}

// Every pair (i, j) gets a uniform random number u and is an edge of G(n, p)
// exactly when u < p. Sorting the pairs by u gives the order in which edges
// appear as p grows, so one draw serves every ⟨k⟩ and the gradual mode. Pairs
// with u above the largest p the slider can reach are never needed.
function buildPairs(n, seed) {
  const random = mulberry32(seed)
  const pMax = Math.min(1, K_MAX / (n - 1))
  const list = []
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const u = random()
      if (u < pMax) list.push([u, i, j])
    }
  }
  list.sort((x, y) => x[0] - y[0])
  const A = new Uint16Array(list.length)
  const B = new Uint16Array(list.length)
  const U = new Float64Array(list.length)
  list.forEach(([u, i, j], e) => {
    A[e] = i
    B[e] = j
    U[e] = u
  })
  return { A, B, U }
}

// Number of pairs with u < p, i.e. the edge count of G(n, p) for this draw.
function edgeCount(U, p) {
  let lo = 0
  let hi = U.length
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (U[mid] < p) lo = mid + 1
    else hi = mid
  }
  return lo
}

function analyseGraph(n, A, B, m) {
  const parent = new Int32Array(n)
  const size = new Int32Array(n).fill(1)
  const degree = new Int32Array(n)
  for (let i = 0; i < n; i++) parent[i] = i
  let components = n
  for (let e = 0; e < m; e++) {
    degree[A[e]]++
    degree[B[e]]++
    if (union(parent, size, A[e], B[e])) components--
  }
  const root = new Int32Array(n)
  let largest = 0
  let largestRoot = -1
  let isolated = 0
  for (let i = 0; i < n; i++) {
    const r = find(parent, i)
    root[i] = r
    if (size[r] > largest) {
      largest = size[r]
      largestRoot = r
    }
    if (degree[i] === 0) isolated++
  }
  return { root, degree, components, largest, largestRoot, isolated }
}

// ---------------------------------------------------------------- Layout

function randomPositions(n, seed) {
  const random = mulberry32(seed ^ 0x9e3779b9)
  const pos = new Float64Array(2 * n)
  for (let i = 0; i < 2 * n; i++) pos[i] = random()
  return pos
}

function circleLayout(n) {
  const pos = new Float64Array(2 * n)
  for (let i = 0; i < n; i++) {
    const a = (2 * Math.PI * i) / n
    pos[2 * i] = 0.5 + 0.5 * Math.cos(a)
    pos[2 * i + 1] = 0.5 + 0.5 * Math.sin(a)
  }
  return pos
}

// Fruchterman–Reingold: every pair repels with force K²/d, every edge attracts
// with d²/K, and a weak pull towards the centre keeps separate components on
// screen. Moves are capped by a temperature that cools linearly to zero.
function forceLayout(n, A, B, m, start, t0) {
  const pos = Float64Array.from(start)
  const disp = new Float64Array(2 * n)
  const K = 0.9 / Math.sqrt(n)
  const K2 = K * K
  const GRAVITY = 3
  for (let it = 0; it < LAYOUT_ITERS; it++) {
    disp.fill(0)
    for (let i = 0; i < n; i++) {
      const xi = pos[2 * i]
      const yi = pos[2 * i + 1]
      for (let j = i + 1; j < n; j++) {
        const dx = xi - pos[2 * j]
        const dy = yi - pos[2 * j + 1]
        const f = K2 / Math.max(dx * dx + dy * dy, 1e-8)
        disp[2 * i] += dx * f
        disp[2 * i + 1] += dy * f
        disp[2 * j] -= dx * f
        disp[2 * j + 1] -= dy * f
      }
    }
    for (let e = 0; e < m; e++) {
      const a = A[e]
      const b = B[e]
      const dx = pos[2 * a] - pos[2 * b]
      const dy = pos[2 * a + 1] - pos[2 * b + 1]
      const f = Math.sqrt(dx * dx + dy * dy) / K
      disp[2 * a] -= dx * f
      disp[2 * a + 1] -= dy * f
      disp[2 * b] += dx * f
      disp[2 * b + 1] += dy * f
    }
    const temp = t0 * (1 - it / LAYOUT_ITERS)
    for (let i = 0; i < n; i++) {
      const dx = disp[2 * i] - GRAVITY * (pos[2 * i] - 0.5)
      const dy = disp[2 * i + 1] - GRAVITY * (pos[2 * i + 1] - 0.5)
      const d = Math.sqrt(dx * dx + dy * dy)
      if (d > 0) {
        const s = Math.min(d, temp) / d
        pos[2 * i] += dx * s
        pos[2 * i + 1] += dy * s
      }
    }
  }
  return pos
}

// ---------------------------------------------------------------- BFS

function startBfs(n, source) {
  const dist = new Int16Array(n).fill(-1)
  dist[source] = 0
  return { source, dist, frontier: [source], level: 0, reached: 1, done: false }
}

// Expands one whole level: every unvisited neighbour of the frontier.
function advanceBfs(state, adj) {
  const dist = Int16Array.from(state.dist)
  const next = []
  for (const u of state.frontier) {
    for (const v of adj[u]) {
      if (dist[v] < 0) {
        dist[v] = state.level + 1
        next.push(v)
      }
    }
  }
  if (!next.length) return { ...state, frontier: [], done: true }
  return {
    ...state,
    dist,
    frontier: next,
    level: state.level + 1,
    reached: state.reached + next.length,
  }
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

function Swatch({ kind, color }) {
  const base = 'inline-block w-2.5 h-2.5 rounded-full shrink-0'
  if (kind === 'hollow') return <span className={`${base} border border-slate-500 bg-white`} />
  if (kind === 'ring')
    return (
      <span className={base} style={{ background: color, boxShadow: `0 0 0 1.5px #fff, 0 0 0 3px ${INK}` }} />
    )
  return <span className={base} style={{ background: color }} />
}

function NetworkExplorer({ t }) {
  const [n, setN] = useState(100)
  const [k, setK] = useState(1)
  const [seed, setSeed] = useState(1)
  const [gradual, setGradual] = useState(false)
  const [added, setAdded] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(0.25)
  const [source, setSource] = useState(0)
  const [bfs, setBfs] = useState(null)

  const wrapRef = useRef(null)
  const canvasRef = useRef(null)
  const screenRef = useRef(null) // node positions in CSS pixels, for hit-testing
  const layoutRef = useRef(null)
  const adjRef = useRef(null)
  const addAcc = useRef(0)
  const bfsAcc = useRef(0)
  const width = useElementWidth(wrapRef)
  const height = Math.round(clamp(width * 0.7, 280, 460))

  const p = Math.min(k / (n - 1), 1)
  const pairs = useMemo(() => buildPairs(n, seed), [n, seed])
  const M = useMemo(() => edgeCount(pairs.U, p), [pairs, p])
  const visible = gradual ? Math.min(added, M) : M

  // Laid out once per graph (with all M edges, so nodes stay put while edges
  // are added gradually). When only ⟨k⟩ changes, it warm-starts from the
  // previous layout so the picture moves smoothly instead of jumping.
  const layout = useMemo(() => {
    if (n > FORCE_MAX_N) return circleLayout(n)
    const prev = layoutRef.current
    const warm = prev && prev.n === n && prev.seed === seed
    const start = warm ? prev.pos : randomPositions(n, seed)
    return forceLayout(n, pairs.A, pairs.B, M, start, warm ? 0.02 : 0.1)
  }, [pairs, M, n, seed])

  useEffect(() => {
    layoutRef.current = { n, seed, pos: layout }
  }, [layout, n, seed])

  const graph = useMemo(() => analyseGraph(n, pairs.A, pairs.B, visible), [n, pairs, visible])

  // A new graph restarts the gradual growth; any change of edges ends a BFS.
  useEffect(() => {
    setAdded(0)
    setPlaying(false)
    setSource((s) => (s < n ? s : 0))
  }, [pairs, n])
  useEffect(() => setBfs(null), [pairs, visible])

  useAnimationLoop(() => {
    addAcc.current += speed
    const add = Math.floor(addAcc.current)
    if (add) {
      addAcc.current -= add
      setAdded((a) => Math.min(a + add, M))
    }
  }, playing)

  useEffect(() => {
    if (playing && added >= M) setPlaying(false)
  }, [playing, added, M])

  useAnimationLoop(
    (dt) => {
      bfsAcc.current += dt
      if (bfsAcc.current < BFS_MS) return
      bfsAcc.current = 0
      setBfs((s) => (s && !s.done ? advanceBfs(s, adjRef.current) : s))
    },
    !!bfs && !bfs.done,
  )

  const runBfs = (from) => {
    const adj = Array.from({ length: n }, () => [])
    for (let e = 0; e < visible; e++) {
      adj[pairs.A[e]].push(pairs.B[e])
      adj[pairs.B[e]].push(pairs.A[e])
    }
    adjRef.current = adj
    bfsAcc.current = 0
    setPlaying(false)
    setSource(from)
    setBfs(startBfs(n, from))
  }

  // Draw
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !width) return
    const dpr = window.devicePixelRatio || 1
    canvas.width = Math.round(width * dpr)
    canvas.height = Math.round(height * dpr)
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    const ctx = canvas.getContext('2d')
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, width, height)

    // Fit the layout into the canvas with a uniform scale.
    let minX = Infinity
    let maxX = -Infinity
    let minY = Infinity
    let maxY = -Infinity
    for (let i = 0; i < n; i++) {
      minX = Math.min(minX, layout[2 * i])
      maxX = Math.max(maxX, layout[2 * i])
      minY = Math.min(minY, layout[2 * i + 1])
      maxY = Math.max(maxY, layout[2 * i + 1])
    }
    const pad = 14
    const scale = Math.min(
      (width - 2 * pad) / Math.max(maxX - minX, 1e-6),
      (height - 2 * pad) / Math.max(maxY - minY, 1e-6),
    )
    const offX = (width - (maxX - minX) * scale) / 2
    const offY = (height - (maxY - minY) * scale) / 2
    const sx = new Float64Array(n)
    const sy = new Float64Array(n)
    for (let i = 0; i < n; i++) {
      sx[i] = offX + (layout[2 * i] - minX) * scale
      sy[i] = offY + (layout[2 * i + 1] - minY) * scale
    }
    screenRef.current = { sx, sy }

    const radius = n <= 40 ? 5 : n <= 120 ? 4 : 3
    const dist = bfs ? bfs.dist : null

    // Edges
    ctx.strokeStyle = 'rgba(100, 116, 139, 0.35)'
    ctx.lineWidth = n <= 120 ? 1 : 0.75
    ctx.beginPath()
    for (let e = 0; e < visible; e++) {
      const a = pairs.A[e]
      const b = pairs.B[e]
      ctx.moveTo(sx[a], sy[a])
      ctx.lineTo(sx[b], sy[b])
    }
    ctx.stroke()

    // BFS tree edges: links between consecutive levels
    if (dist) {
      ctx.strokeStyle = BFS
      ctx.lineWidth = 1.5
      ctx.beginPath()
      for (let e = 0; e < visible; e++) {
        const a = pairs.A[e]
        const b = pairs.B[e]
        if (dist[a] >= 0 && dist[b] >= 0 && Math.abs(dist[a] - dist[b]) === 1) {
          ctx.moveTo(sx[a], sy[a])
          ctx.lineTo(sx[b], sy[b])
        }
      }
      ctx.stroke()
    }

    // Nodes (faded while a BFS is shown, except the ones it reached)
    const giant = graph.largest > 1 ? graph.largestRoot : -1
    for (let i = 0; i < n; i++) {
      ctx.globalAlpha = dist && dist[i] < 0 ? 0.3 : 1
      ctx.beginPath()
      ctx.arc(sx[i], sy[i], radius, 0, Math.PI * 2)
      if (dist && dist[i] >= 0) {
        ctx.fillStyle = BFS
        ctx.fill()
      } else if (graph.degree[i] === 0) {
        ctx.fillStyle = '#ffffff'
        ctx.fill()
        ctx.strokeStyle = SLATE
        ctx.lineWidth = 1
        ctx.stroke()
      } else {
        ctx.fillStyle = graph.root[i] === giant ? ORANGE : SLATE
        ctx.fill()
      }
    }
    ctx.globalAlpha = 1

    if (bfs) {
      ctx.strokeStyle = INK
      ctx.lineWidth = 1.5
      for (const v of bfs.frontier) {
        ctx.beginPath()
        ctx.arc(sx[v], sy[v], radius + 2.5, 0, Math.PI * 2)
        ctx.stroke()
      }
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(sx[bfs.source], sy[bfs.source], radius + 4.5, 0, Math.PI * 2)
      ctx.stroke()
    }
  }, [width, height, layout, n, pairs, visible, graph, bfs])

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
    if (best >= 0) runBfs(best)
  }

  const onPlayPause = () => {
    if (playing) return setPlaying(false)
    if (added >= M) setAdded(0)
    addAcc.current = 0
    setPlaying(true)
  }

  const setMode = (g) => {
    setGradual(g)
    setPlaying(false)
    setAdded(0)
  }

  const kActual = (2 * visible) / n
  const lnN = Math.log(n)
  const regime = kActual < 1 ? 0 : kActual < lnN ? 1 : 2
  const isConnected = graph.components === 1
  const tab = (active) =>
    `px-3 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider transition-colors ${
      active ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-orange-600'
    }`

  return (
    <div className={panel}>
      <PanelTitle>A · {t.explore}</PanelTitle>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Slider label={t.n} min={10} max={300} step={1} value={n} onChange={setN} />
        <div>
          <Slider
            label={t.k}
            min={0.1}
            max={K_MAX}
            log
            value={k}
            onChange={setK}
            format={(v) => v.toFixed(2)}
          />
          <p className="mt-1 font-mono text-xs text-slate-500 tabular-nums">
            {t.p} = {formatP(p)}
          </p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <span className="font-mono text-sm text-slate-600 tabular-nums">
          {t.seed} {seed}
        </span>
        <SimControls
          onReset={() => setSeed((s) => s + 1)}
          labels={{ reset: t.newNetwork }}
        />
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex flex-wrap rounded-full border border-slate-200 p-0.5" role="group">
          <button type="button" className={tab(!gradual)} aria-pressed={!gradual} onClick={() => setMode(false)}>
            {t.whole}
          </button>
          <button type="button" className={tab(gradual)} aria-pressed={gradual} onClick={() => setMode(true)}>
            {t.gradual}
          </button>
        </div>
        <span className="text-xs text-slate-500">{t.canvasHint}</span>
      </div>

      {gradual && (
        <div className="mt-4 grid gap-4 sm:grid-cols-[auto_1fr] sm:items-end">
          <SimControls
            playing={playing}
            onPlayPause={onPlayPause}
            onStep={() => setAdded((a) => Math.min(a + 1, M))}
            onReset={() => {
              setPlaying(false)
              setAdded(0)
            }}
            labels={t.controls}
          />
          <Slider
            label={t.speed}
            min={0.05}
            max={50}
            log
            value={speed}
            onChange={setSpeed}
            format={(v) => (v < 1 ? v.toFixed(2) : v.toFixed(v < 10 ? 1 : 0))}
          />
        </div>
      )}

      <div ref={wrapRef} className="mt-4">
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={t.canvasAria}
          className="block w-full bg-white border border-slate-200 rounded cursor-pointer"
          onClick={onCanvasClick}
        />
      </div>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-slate-600">
        <span className="inline-flex items-center gap-1.5">
          <Swatch color={ORANGE} /> {t.legend.giant}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Swatch color={SLATE} /> {t.legend.other}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Swatch kind="hollow" /> {t.legend.isolated}
        </span>
        {bfs && (
          <>
            <span className="inline-flex items-center gap-1.5">
              <Swatch color={BFS} /> {t.legend.visited}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Swatch kind="ring" color={BFS} /> {t.legend.frontier}
            </span>
          </>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <SimControls
          onPlayPause={() => runBfs(source)}
          onReset={bfs ? () => setBfs(null) : undefined}
          labels={{ play: t.bfs, reset: t.clear }}
        />
        <span className="font-mono text-sm text-slate-600">{t.source(source)}</span>
      </div>
      {bfs && (
        <p className="mt-3 font-mono text-sm text-slate-700" aria-live="polite">
          {bfs.done
            ? t.bfsDone(bfs.source, bfs.reached, n, bfs.level)
            : t.bfsRunning(bfs.level, bfs.reached)}
        </p>
      )}

      <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-sm">
        <Stat label={t.edges}>{visible}</Stat>
        <Stat label={t.kActual}>{kActual.toFixed(2)}</Stat>
        <Stat label={t.components}>{graph.components}</Stat>
        <Stat label={t.largest}>
          {graph.largest} · S = {(graph.largest / n).toFixed(2)}
        </Stat>
        <Stat label={t.isolated}>{graph.isolated}</Stat>
        <Stat label={t.connected}>
          <span className={isConnected ? 'text-orange-600 font-semibold' : ''}>
            {isConnected ? t.yes : t.no}
          </span>
        </Stat>
        <Stat label={t.thresholds} wide>
          ⟨k⟩ / 1 = {kActual.toFixed(2)} · ⟨k⟩ / ln n = {(kActual / lnN).toFixed(2)}{' '}
          <span className="text-slate-500">(ln {n} = {lnN.toFixed(2)})</span>
          <span className="block text-xs text-slate-600 mt-0.5 font-sans">{t.regime[regime]}</span>
        </Stat>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------- Panel B

function poisson(random, lambda) {
  const L = Math.exp(-lambda)
  let k = 0
  let prod = random()
  while (prod > L) {
    k++
    prod *= random()
  }
  return k
}

// Binomial(N, q): exact for small N, Poisson in either tail, normal otherwise.
function binomial(random, N, q) {
  if (q <= 0 || N <= 0) return 0
  if (q >= 1) return N
  if (N <= 64) {
    let c = 0
    for (let i = 0; i < N; i++) if (random() < q) c++
    return c
  }
  const mean = N * q
  if (mean < 30) return Math.min(N, poisson(random, mean))
  if (N - mean < 30) return N - Math.min(N, poisson(random, N - mean))
  const x = Math.round(mean + Math.sqrt(mean * (1 - q)) * randNormal(random))
  return clamp(x, 0, N)
}

// One realisation of the G(n, p) process: distinct random pairs are added in
// random order (a lazy Fisher–Yates shuffle over the n(n−1)/2 pair indices,
// so nothing of size n² is ever allocated) and union-find tracks the
// components. At each grid value of ⟨k⟩ the edge count has grown by a
// binomial increment, so every snapshot is a proper G(n, p).
// record(g, largest, components) is called once per grid point.
function* graphProcess(random, n, kGrid, record) {
  const N = (n * (n - 1)) / 2
  const c = 2 * n - 1
  const rowStart = (r) => (r * (c - r)) / 2 // index of pair (r, r + 1)
  const parent = new Int32Array(n)
  const size = new Int32Array(n).fill(1)
  for (let i = 0; i < n; i++) parent[i] = i
  const swapped = new Map()
  let largest = 1
  let components = n
  let m = 0
  let target = 0
  let prevP = 0
  for (let g = 0; g < kGrid.length; g++) {
    const p = Math.min(kGrid[g] / (n - 1), 1)
    if (p > prevP) {
      target += binomial(random, N - target, (p - prevP) / (1 - prevP))
      prevP = p
    }
    while (m < target) {
      const r = m + Math.floor(random() * (N - m))
      const pick = swapped.has(r) ? swapped.get(r) : r
      swapped.set(r, swapped.has(m) ? swapped.get(m) : m)
      m++
      // Pair index → (a, b) with a < b, row by row.
      let a = Math.floor((c - Math.sqrt(c * c - 8 * pick)) / 2)
      while (a > 0 && rowStart(a) > pick) a--
      while (rowStart(a + 1) <= pick) a++
      const b = pick - rowStart(a) + a + 1
      if (union(parent, size, a, b)) {
        components--
        const s = size[find(parent, a)]
        if (s > largest) largest = s
      }
      if ((m & 4095) === 0) yield
    }
    record(g, largest, components)
  }
}

// Runs every size `trials` times, interleaved so all curves fill in together.
// value(largest, components, n) is what gets averaged at each grid point.
function makeJob(sizes, grid, trials, seed, value) {
  const random = mulberry32(seed)
  const sums = sizes.map(() => new Float64Array(grid.length))
  const done = sizes.map(() => 0)
  const total = trials * sizes.length
  function* iter() {
    let units = 0
    for (let tr = 0; tr < trials; tr++) {
      for (let s = 0; s < sizes.length; s++) {
        const n = sizes[s]
        const out = new Float64Array(grid.length)
        yield* graphProcess(random, n, grid, (g, largest, components) => {
          out[g] = value(largest, components, n)
        })
        for (let g = 0; g < grid.length; g++) sums[s][g] += out[g]
        done[s]++
        units++
        yield units / total
      }
    }
  }
  const snapshot = () =>
    grid.map((k, g) => {
      const row = { k }
      sizes.forEach((n, s) => {
        row[`n${n}`] = done[s] ? sums[s][g] / done[s] : null
      })
      return row
    })
  return { iter: iter(), snapshot }
}

// Pumps a job's generator for ~12 ms per animation frame, repainting the
// chart a few times per second, so long experiments never block the page.
function useExperiment() {
  const [state, setState] = useState({ running: false, progress: 0, data: null, cancelled: false })
  const frameRef = useRef(0)
  const jobRef = useRef(null)

  const run = (job) => {
    cancelAnimationFrame(frameRef.current)
    jobRef.current = job
    let progress = 0
    let lastPaint = 0
    setState({ running: true, progress: 0, data: job.snapshot(), cancelled: false })
    const work = () => {
      const start = performance.now()
      let r
      do {
        r = job.iter.next()
        if (typeof r.value === 'number') progress = r.value
      } while (!r.done && performance.now() - start < 12)
      if (r.done) {
        setState({ running: false, progress: 1, data: job.snapshot(), cancelled: false })
        return
      }
      if (start - lastPaint > 150) {
        lastPaint = start
        setState({ running: true, progress, data: job.snapshot(), cancelled: false })
      }
      frameRef.current = requestAnimationFrame(work)
    }
    frameRef.current = requestAnimationFrame(work)
  }

  const cancel = () => {
    cancelAnimationFrame(frameRef.current)
    const job = jobRef.current
    setState((s) => ({ ...s, running: false, cancelled: true, data: job ? job.snapshot() : s.data }))
  }

  useEffect(() => () => cancelAnimationFrame(frameRef.current), [])
  return { ...state, run, cancel }
}

function theoryS(k) {
  if (k <= 1) return 0
  let s = 1
  for (let i = 0; i < 2000; i++) s = 1 - Math.exp(-k * s)
  return s
}
const THEORY_S = S_GRID.map(theoryS)

function SeriesLegend({ sizes, extra }) {
  return (
    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-slate-600">
      {sizes.map((n, i) => (
        <span key={n} className="inline-flex items-center gap-1.5">
          <span className="inline-block w-4 h-0.5" style={{ background: SERIES[i] }} aria-hidden="true" />
          n = {n.toLocaleString('en-US')}
        </span>
      ))}
      {extra}
    </div>
  )
}

function ExperimentFooter({ t, exp, trials, ranTrials, setTrials, min, max, step, onRun }) {
  return (
    <>
      <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
        <Slider label={t.trials} min={min} max={max} step={step} value={trials} onChange={setTrials} />
        <SimControls
          playing={exp.running}
          onPlayPause={exp.running ? exp.cancel : onRun}
          labels={t.run}
        />
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
    </>
  )
}

const axisTick = { fontSize: 11, fontFamily: MONO }

function GiantComponentChart({ t }) {
  const [trials, setTrials] = useState(10)
  const [ranTrials, setRanTrials] = useState(10)
  const seedRef = useRef(0)
  const exp = useExperiment()

  const onRun = () => {
    seedRef.current++
    setRanTrials(trials)
    exp.run(makeJob(S_SIZES, S_GRID, trials, 1000 + seedRef.current, (largest, _c, n) => largest / n))
  }
  // Run once with the defaults on first display.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(onRun, [])

  const data = useMemo(
    () => (exp.data || S_GRID.map((k) => ({ k }))).map((row, g) => ({ ...row, theory: THEORY_S[g] })),
    [exp.data],
  )

  return (
    <div className={panel}>
      <PanelTitle>{t.giantTitle}</PanelTitle>
      <div className="mt-4 h-64 -ml-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, bottom: 4, left: 0 }}>
            <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
            <XAxis dataKey="k" type="number" domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} tick={axisTick} stroke={MUTED} />
            <YAxis domain={[0, 1]} ticks={[0, 0.25, 0.5, 0.75, 1]} width={40} tick={axisTick} stroke={MUTED} />
            <ReferenceLine x={1} stroke={MUTED} strokeDasharray="4 4" />
            <Tooltip
              formatter={(v) => (v == null ? '–' : v.toFixed(3))}
              labelFormatter={t.tooltipK}
              contentStyle={{ fontFamily: MONO, fontSize: 12 }}
            />
            <Line type="linear" dataKey="theory" name={t.theory} stroke={INK} strokeWidth={1.5} dot={false} isAnimationActive={false} />
            {S_SIZES.map((n, i) => (
              <Line
                key={n}
                type="linear"
                dataKey={`n${n}`}
                name={`n = ${n}`}
                stroke={SERIES[i]}
                strokeWidth={1.75}
                dot={false}
                connectNulls={false}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <SeriesLegend
        sizes={S_SIZES}
        extra={
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block w-4 h-0.5" style={{ background: INK }} aria-hidden="true" />
            {t.theory}: S = 1 − e^(−⟨k⟩S)
          </span>
        }
      />
      <ExperimentFooter
        t={t}
        exp={exp}
        trials={trials}
        ranTrials={ranTrials}
        setTrials={setTrials}
        min={5}
        max={50}
        step={1}
        onRun={onRun}
      />
    </div>
  )
}

function ConnectivityChart({ t }) {
  const [trials, setTrials] = useState(100)
  const [ranTrials, setRanTrials] = useState(100)
  const seedRef = useRef(0)
  const exp = useExperiment()

  const onRun = () => {
    seedRef.current++
    setRanTrials(trials)
    exp.run(makeJob(C_SIZES, C_GRID, trials, 2000 + seedRef.current, (_l, components) => (components === 1 ? 1 : 0)))
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(onRun, [])

  return (
    <div className={panel}>
      <PanelTitle>{t.connTitle}</PanelTitle>
      <div className="mt-4 h-64 -ml-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={exp.data || []} margin={{ top: 8, right: 8, bottom: 4, left: 0 }}>
            <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
            <XAxis
              dataKey="k"
              type="number"
              scale="log"
              domain={[C_MIN, C_MAX]}
              ticks={[0.5, 1, 2, 5, 10]}
              allowDataOverflow
              tick={axisTick}
              stroke={MUTED}
            />
            <YAxis domain={[0, 1]} ticks={[0, 0.25, 0.5, 0.75, 1]} width={40} tick={axisTick} stroke={MUTED} />
            {C_SIZES.map((n, i) => (
              <ReferenceLine key={n} x={Math.log(n)} stroke={SERIES[i]} strokeDasharray="4 4" />
            ))}
            <Tooltip
              formatter={(v) => (v == null ? '–' : v.toFixed(3))}
              labelFormatter={t.tooltipK}
              contentStyle={{ fontFamily: MONO, fontSize: 12 }}
            />
            {C_SIZES.map((n, i) => (
              <Line
                key={n}
                type="linear"
                dataKey={`n${n}`}
                name={`n = ${n}`}
                stroke={SERIES[i]}
                strokeWidth={1.75}
                dot={false}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <SeriesLegend
        sizes={C_SIZES}
        extra={
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block w-4 border-t border-dashed border-slate-500" aria-hidden="true" />
            ⟨k⟩ = {t.lnN}
          </span>
        }
      />
      <ExperimentFooter
        t={t}
        exp={exp}
        trials={trials}
        ranTrials={ranTrials}
        setTrials={setTrials}
        min={20}
        max={300}
        step={10}
        onRun={onRun}
      />
    </div>
  )
}

// ---------------------------------------------------------------- Root

export default function RandomNetwork({ lang = 'en' }) {
  const t = T[lang] || T.en
  return (
    <div className="space-y-6">
      <NetworkExplorer t={t} />
      <div>
        <PanelTitle>B · {t.transitions}</PanelTitle>
        <div className="mt-4 grid gap-6 lg:grid-cols-2">
          <GiantComponentChart t={t} />
          <ConnectivityChart t={t} />
        </div>
      </div>
    </div>
  )
}
