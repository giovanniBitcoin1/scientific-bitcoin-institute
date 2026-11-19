import { useEffect, useMemo, useRef, useState } from 'react'
import DrawToggle, { drawCanvasClass } from '../../DrawToggle.jsx'
import useAnimationLoop from '../../useAnimationLoop.js'
import { mulberry32 } from '../../rng.js'
import { forceLayout } from '../../graphUtils.js'
import { ORANGE, ORANGE_DARK, INK, SLATE, MUTED, MONO, DIST_STOPS, distColor, useElementWidth, Stat, Pill, Eyebrow, fmt } from '../ui.jsx'
import {
  PRESETS,
  MAX_NODES,
  analyze,
  distancesFrom,
  orderByComponent,
  hasEdge,
  addNode,
  addEdge,
  removeEdge,
  removeNode,
  freshLabel,
} from './netstats.js'
import karateData from '../../../../data/lab/networks/karate-club.json'
import florentineData from '../../../../data/lab/networks/florentine-families.json'

// Panel B: the network microscope. An undirected network of up to 60 nodes
// that can be edited by hand, with every number of the lecture read off it
// live, a breadth-first wavefront from any node, and the adjacency matrix.
//
// Touch follows the DrawToggle rule. With Draw off the canvas never captures
// the pointer: a swipe scrolls the page and a tap runs the wavefront. With
// Draw on it takes touch-action: none and taps and drags edit the network.

const MATRIX_MAX = 40
const BFS_MS = 420
const HIT = 16 // px, touch-friendly radius around a node

const PRESET_IDS = ['path', 'ring', 'random', 'windmill', 'complete', 'groups', 'karate', 'florentine']

const T = {
  en: {
    preset: 'Network',
    presets: {
      path: 'Path, 10 nodes',
      ring: 'Ring lattice, N = 20',
      random: 'Random, N = 30, ⟨k⟩ = 3',
      windmill: 'Windmill, 10 triangles',
      complete: 'Complete, 8 nodes',
      groups: 'Two separate groups',
      karate: "Zachary's karate club",
      florentine: 'Florentine families',
      custom: 'Edited by hand',
    },
    draw: 'Draw',
    add: 'Add',
    del: 'Delete',
    tidy: 'Tidy layout',
    clear: 'Clear all',
    matrix: 'Matrix',
    group: 'Group by component',
    ungroup: 'Original order',
    matrixLimit: `The matrix is shown up to ${MATRIX_MAX} nodes.`,
    hintOff: 'Tap a node to send a breadth-first wavefront from it. Turn Draw on to edit the network.',
    hintAdd: `Tap empty space to add a node (up to ${MAX_NODES}); drag from one node to another to link them.`,
    hintDel: 'Tap a node or a link to delete it.',
    node: (label, k, c, far, unreached) =>
      `Node ${label}: degree ${k}, clustering ${c}, farthest node ${far} step${far === 1 ? '' : 's'} away${
        unreached ? `, ${unreached} node${unreached === 1 ? '' : 's'} out of reach` : ''
      }.`,
    distLegend: 'steps from the selected node',
    unreachable: 'out of reach',
    canvasAria:
      'Drawing of the network. With Draw off, tap a node to colour the network by distance from it. With Draw on, tap to add nodes, drag between nodes to add links, or delete them.',
    matrixAria: 'Adjacency matrix of the network: a dark cell marks a link.',
    stats: {
      n: 'Nodes N',
      l: 'Links L',
      k: 'Average degree ⟨k⟩',
      density: 'Density',
      components: 'Components',
      largest: (s) => `largest ${s}`,
      diameter: 'Diameter',
      distance: 'Average distance',
      inLargest: 'in the largest component',
      clustering: 'Average clustering ⟨C⟩',
      transitivity: 'Transitivity',
      triangles: 'Triangles',
    },
    hist: 'Degree histogram',
    histAria: 'Number of nodes for each degree',
    degree: 'degree k',
  },
  it: {
    preset: 'Rete',
    presets: {
      path: 'Catena, 10 nodi',
      ring: 'Reticolo ad anello, N = 20',
      random: 'Casuale, N = 30, ⟨k⟩ = 3',
      windmill: 'Girandola, 10 triangoli',
      complete: 'Completa, 8 nodi',
      groups: 'Due gruppi separati',
      karate: 'Club di karate di Zachary',
      florentine: 'Famiglie fiorentine',
      custom: 'Modificata a mano',
    },
    draw: 'Disegna',
    add: 'Aggiungi',
    del: 'Elimina',
    tidy: 'Riordina',
    clear: 'Svuota',
    matrix: 'Matrice',
    group: 'Raggruppa per componente',
    ungroup: 'Ordine originale',
    matrixLimit: `La matrice è mostrata fino a ${MATRIX_MAX} nodi.`,
    hintOff: 'Tocca un nodo per farne partire un fronte di ricerca in ampiezza. Attiva Disegna per modificare la rete.',
    hintAdd: `Tocca uno spazio vuoto per aggiungere un nodo (fino a ${MAX_NODES}); trascina da un nodo a un altro per collegarli.`,
    hintDel: 'Tocca un nodo o un collegamento per eliminarlo.',
    node: (label, k, c, far, unreached) =>
      `Nodo ${label}: grado ${k}, clustering ${c}, nodo più lontano a ${far} pass${far === 1 ? 'o' : 'i'}${
        unreached ? `, ${unreached} nod${unreached === 1 ? 'o irraggiungibile' : 'i irraggiungibili'}` : ''
      }.`,
    distLegend: 'passi dal nodo selezionato',
    unreachable: 'irraggiungibile',
    canvasAria:
      'Disegno della rete. Con Disegna disattivato, tocca un nodo per colorare la rete in base alla distanza da esso. Con Disegna attivo, tocca per aggiungere nodi, trascina tra due nodi per collegarli, oppure eliminali.',
    matrixAria: 'Matrice di adiacenza della rete: una cella scura indica un collegamento.',
    stats: {
      n: 'Nodi N',
      l: 'Collegamenti L',
      k: 'Grado medio ⟨k⟩',
      density: 'Densità',
      components: 'Componenti',
      largest: (s) => `la più grande ${s}`,
      diameter: 'Diametro',
      distance: 'Distanza media',
      inLargest: 'nella componente più grande',
      clustering: 'Clustering medio ⟨C⟩',
      transitivity: 'Transitività',
      triangles: 'Triangoli',
    },
    hist: 'Istogramma dei gradi',
    histAria: 'Numero di nodi per ciascun grado',
    degree: 'grado k',
  },
}

// ---------------------------------------------------------------- Layout
// Positions are [x, y] pairs in the unit square.

function fit(flat, n) {
  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity
  for (let i = 0; i < n; i++) {
    minX = Math.min(minX, flat[2 * i])
    maxX = Math.max(maxX, flat[2 * i])
    minY = Math.min(minY, flat[2 * i + 1])
    maxY = Math.max(maxY, flat[2 * i + 1])
  }
  const sx = Math.max(maxX - minX, 1e-6)
  const sy = Math.max(maxY - minY, 1e-6)
  return Array.from({ length: n }, (_, i) => [(flat[2 * i] - minX) / sx, (flat[2 * i + 1] - minY) / sy])
}

// The force layout of Complexity Lab module 02, from a seeded random start or
// warm-started from the current positions.
function forcePositions(net, start, t0) {
  const n = net.labels.length
  if (!n) return []
  const A = Int32Array.from(net.edges, (e) => e[0])
  const B = Int32Array.from(net.edges, (e) => e[1])
  let flat
  if (start) flat = Float64Array.from(start.flat())
  else {
    const random = mulberry32(0x5eed + n)
    flat = Float64Array.from({ length: 2 * n }, () => random())
  }
  return n === 1 ? [[0.5, 0.5]] : fit(forceLayout(n, A, B, A.length, flat, t0), n)
}

function layoutFor(net) {
  const n = net.labels.length
  if (net.layout === 'circle')
    return Array.from({ length: n }, (_, i) => {
      const a = -Math.PI / 2 + (2 * Math.PI * i) / n
      return [0.5 + 0.5 * Math.cos(a), 0.5 + 0.5 * Math.sin(a)]
    })
  if (net.layout === 'line') return Array.from({ length: n }, (_, i) => [i / (n - 1), 0.5 + (i % 2 ? 0.06 : -0.06)])
  return forcePositions(net, null, 0.1)
}

function loadPreset(id) {
  let net
  if (id === 'karate') net = PRESETS.fromData(karateData)
  else if (id === 'florentine') net = PRESETS.fromData(florentineData)
  else net = PRESETS[id]()
  return { net: { labels: net.labels, edges: net.edges }, pos: layoutFor(net) }
}

// Distance from point p to segment ab.
function segmentDistance(px, py, ax, ay, bx, by) {
  const dx = bx - ax
  const dy = by - ay
  const len2 = dx * dx + dy * dy
  const u = len2 ? Math.min(1, Math.max(0, ((px - ax) * dx + (py - ay) * dy) / len2)) : 0
  return Math.hypot(px - ax - u * dx, py - ay - u * dy)
}

export default function MicroscopePanel({ lang = 'en' }) {
  const t = T[lang] || T.en
  const [presetId, setPresetId] = useState('karate')
  const [model, setModel] = useState(() => loadPreset('karate'))
  const [drawOn, setDrawOn] = useState(false)
  const [tool, setTool] = useState('add')
  const [bfs, setBfs] = useState(null) // { source, dist, far, shown }
  const [hover, setHover] = useState(null) // { nodes: [i] or [i, j] }
  const [showMatrix, setShowMatrix] = useState(true)
  const [grouped, setGrouped] = useState(false)
  const [drag, setDrag] = useState(null) // { from, x, y, moved } while linking

  const wrapRef = useRef(null)
  const canvasRef = useRef(null)
  const matrixRef = useRef(null)
  const matrixWrapRef = useRef(null)
  const bfsAcc = useRef(0)
  const width = useElementWidth(wrapRef)
  const matrixWidth = useElementWidth(matrixWrapRef)
  const height = Math.round(Math.min(440, Math.max(260, width * 0.78)))

  const { net, pos } = model
  const n = net.labels.length
  const stats = useMemo(() => analyze(net), [net])
  const matrixOk = n > 0 && n <= MATRIX_MAX
  const order = useMemo(
    () => (grouped ? orderByComponent(stats) : Array.from({ length: n }, (_, i) => i)),
    [grouped, stats, n],
  )

  // Screen position of a node. The padding leaves room for the labels.
  const PAD_X = 30
  const PAD_Y = 22
  const sx = (i) => PAD_X + pos[i][0] * (width - 2 * PAD_X)
  const sy = (i) => PAD_Y + pos[i][1] * (height - 2 * PAD_Y)
  const radius = (i) => Math.min(13, 4.5 + 1.6 * Math.sqrt(stats.degree[i]))

  const change = (next) => {
    setModel(next)
    setPresetId('custom')
    setBfs(null)
    setHover(null)
  }
  const choose = (id) => {
    if (id === 'custom') return
    setPresetId(id)
    setModel(loadPreset(id))
    setBfs(null)
    setHover(null)
    setGrouped(false)
  }

  // Breadth-first wavefront: one more level every BFS_MS.
  useAnimationLoop(
    (dt) => {
      bfsAcc.current += dt
      if (bfsAcc.current < BFS_MS) return
      bfsAcc.current = 0
      setBfs((b) => (b && b.shown < b.far ? { ...b, shown: b.shown + 1 } : b))
    },
    !!bfs && bfs.shown < bfs.far,
  )

  const runBfs = (source) => {
    const { dist, far } = distancesFrom(stats, source)
    bfsAcc.current = 0
    setBfs({ source, dist, far, shown: 0 })
  }

  const hlNodes = hover ? hover.nodes : []
  const hlPair = hlNodes.length === 2 && hasEdge(net, hlNodes[0], hlNodes[1]) ? hlNodes : null

  // ---- Draw the network
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

    const done = bfs && bfs.shown >= bfs.far
    const reached = (i) => bfs && bfs.dist[i] >= 0 && bfs.dist[i] <= bfs.shown

    ctx.lineCap = 'round'
    for (const [a, b] of net.edges) {
      const lit = hlPair && ((hlPair[0] === a && hlPair[1] === b) || (hlPair[0] === b && hlPair[1] === a))
      const tree = bfs && reached(a) && reached(b) && Math.abs(bfs.dist[a] - bfs.dist[b]) === 1
      ctx.strokeStyle = lit ? ORANGE_DARK : tree ? '#0284c7' : 'rgba(100, 116, 139, 0.45)'
      ctx.lineWidth = lit ? 3.5 : tree ? 1.75 : 1.25
      ctx.beginPath()
      ctx.moveTo(sx(a), sy(a))
      ctx.lineTo(sx(b), sy(b))
      ctx.stroke()
    }

    if (drag && drag.moved) {
      ctx.strokeStyle = ORANGE
      ctx.lineWidth = 2
      ctx.setLineDash([5, 4])
      ctx.beginPath()
      ctx.moveTo(sx(drag.from), sy(drag.from))
      ctx.lineTo(drag.x, drag.y)
      ctx.stroke()
      ctx.setLineDash([])
    }

    const showLabels = n <= MATRIX_MAX
    ctx.font = `10px ${MONO}`
    ctx.textAlign = 'center'
    for (let i = 0; i < n; i++) {
      const r = radius(i)
      const x = sx(i)
      const y = sy(i)
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      if (bfs && !reached(i)) {
        ctx.fillStyle = '#ffffff'
        ctx.fill()
        ctx.strokeStyle = done ? SLATE : MUTED
        ctx.lineWidth = 1
        ctx.stroke()
      } else {
        ctx.fillStyle = bfs ? distColor(bfs.dist[i] / Math.max(1, bfs.far)) : SLATE
        ctx.fill()
      }
      if (hlNodes.includes(i)) {
        ctx.strokeStyle = ORANGE_DARK
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.arc(x, y, r + 2.5, 0, Math.PI * 2)
        ctx.stroke()
      }
      if (bfs && (i === bfs.source || (bfs.dist[i] === bfs.shown && !done))) {
        ctx.strokeStyle = INK
        ctx.lineWidth = i === bfs.source ? 2 : 1.5
        ctx.beginPath()
        ctx.arc(x, y, r + (i === bfs.source ? 4 : 2.5), 0, Math.PI * 2)
        ctx.stroke()
      }
      if (showLabels) {
        ctx.fillStyle = INK
        ctx.fillText(net.labels[i], x, y - r - 4)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, height, model, stats, bfs, hover, drag])

  // ---- Draw the matrix
  const cell = matrixOk && matrixWidth ? Math.max(4, Math.floor(Math.min(matrixWidth, 360) / n)) : 0
  const mSize = cell * n
  useEffect(() => {
    const canvas = matrixRef.current
    if (!canvas || !cell) return
    const dpr = window.devicePixelRatio || 1
    canvas.width = Math.round(mSize * dpr)
    canvas.height = Math.round(mSize * dpr)
    canvas.style.width = `${mSize}px`
    canvas.style.height = `${mSize}px`
    const ctx = canvas.getContext('2d')
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, mSize, mSize)
    const at = new Array(n)
    order.forEach((v, i) => (at[v] = i))
    // rows and columns of the highlighted nodes
    ctx.fillStyle = '#ffedd5'
    for (const v of hlNodes) {
      if (v >= n) continue
      ctx.fillRect(0, at[v] * cell, mSize, cell)
      ctx.fillRect(at[v] * cell, 0, cell, mSize)
    }
    ctx.fillStyle = '#e2e8f0'
    for (let i = 0; i < n; i++) ctx.fillRect(i * cell, i * cell, cell, cell)
    const gap = cell >= 7 ? 1 : 0
    for (const [a, b] of net.edges) {
      const lit = hlPair && ((hlPair[0] === a && hlPair[1] === b) || (hlPair[0] === b && hlPair[1] === a))
      ctx.fillStyle = lit ? ORANGE_DARK : INK
      ctx.fillRect(at[b] * cell, at[a] * cell, cell - gap, cell - gap)
      ctx.fillRect(at[a] * cell, at[b] * cell, cell - gap, cell - gap)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cell, mSize, model, order, hover, showMatrix])

  // ---- Pointer handling on the network
  const point = (e) => {
    const r = canvasRef.current.getBoundingClientRect()
    return [e.clientX - r.left, e.clientY - r.top]
  }
  const nodeAt = (x, y) => {
    let best = -1
    let bestD = HIT * HIT
    for (let i = 0; i < n; i++) {
      const d = (sx(i) - x) ** 2 + (sy(i) - y) ** 2
      if (d < bestD) {
        bestD = d
        best = i
      }
    }
    return best
  }
  const edgeAt = (x, y) => {
    let best = null
    let bestD = 9
    for (const [a, b] of net.edges) {
      const d = segmentDistance(x, y, sx(a), sy(a), sx(b), sy(b))
      if (d < bestD) {
        bestD = d
        best = [a, b]
      }
    }
    return best
  }

  // Draw off: a tap (click) runs the wavefront. Nothing is captured.
  const onClick = (e) => {
    if (drawOn) return
    const [x, y] = point(e)
    const v = nodeAt(x, y)
    if (v < 0 || (bfs && bfs.source === v)) setBfs(null)
    else runBfs(v)
  }

  const onPointerDown = (e) => {
    if (!drawOn) return
    const [x, y] = point(e)
    const v = nodeAt(x, y)
    if (tool === 'del') {
      if (v >= 0) change({ net: removeNode(net, v), pos: pos.filter((_, i) => i !== v) })
      else {
        const edge = edgeAt(x, y)
        if (edge) change({ net: removeEdge(net, edge[0], edge[1]), pos })
      }
      return
    }
    e.currentTarget.setPointerCapture(e.pointerId)
    setDrag({ from: v, x, y, x0: x, y0: y, moved: false })
  }
  const onPointerMove = (e) => {
    const [x, y] = point(e)
    if (drag) {
      if (drag.from >= 0) setDrag({ ...drag, x, y, moved: drag.moved || Math.hypot(x - drag.x0, y - drag.y0) > 6 })
      return
    }
    if (e.pointerType !== 'mouse') return
    const v = nodeAt(x, y)
    if (v >= 0) setHover({ nodes: [v] })
    else {
      const edge = edgeAt(x, y)
      setHover(edge ? { nodes: edge } : null)
    }
  }
  const onPointerUp = (e) => {
    if (!drag) return
    const [x, y] = point(e)
    const v = nodeAt(x, y)
    if (drag.from >= 0) {
      if (v >= 0 && v !== drag.from) change({ net: addEdge(net, drag.from, v), pos })
    } else if (v < 0 && Math.hypot(x - drag.x0, y - drag.y0) < 10 && n < MAX_NODES) {
      const nx = Math.min(1, Math.max(0, (x - PAD_X) / (width - 2 * PAD_X)))
      const ny = Math.min(1, Math.max(0, (y - PAD_Y) / (height - 2 * PAD_Y)))
      change({ net: addNode(net, freshLabel(net)), pos: [...pos, [nx, ny]] })
    }
    setDrag(null)
  }

  // ---- Pointer handling on the matrix (hover or tap a cell; never captured)
  const matrixCell = (e) => {
    const r = matrixRef.current.getBoundingClientRect()
    const i = Math.floor((e.clientY - r.top) / cell)
    const j = Math.floor((e.clientX - r.left) / cell)
    if (i < 0 || j < 0 || i >= n || j >= n) return null
    return i === j ? { nodes: [order[i]] } : { nodes: [order[i], order[j]] }
  }

  const bfsNode = bfs ? bfs.source : null
  const unreached = bfs ? bfs.dist.reduce((c, d) => c + (d < 0 ? 1 : 0), 0) : 0
  const maxCount = Math.max(1, ...stats.histogram)

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700 min-w-0">
          {t.preset}
          <select
            value={presetId}
            onChange={(e) => choose(e.target.value)}
            className="min-w-0 max-w-[15rem] rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 focus:outline-none focus:border-orange-500"
          >
            {PRESET_IDS.map((id) => (
              <option key={id} value={id}>
                {t.presets[id]}
              </option>
            ))}
            {presetId === 'custom' && <option value="custom">{t.presets.custom}</option>}
          </select>
        </label>
        <DrawToggle on={drawOn} onChange={(on) => { setDrawOn(on); setDrag(null) }} label={t.draw} />
        {drawOn && (
          <>
            <div className="inline-flex rounded-full border border-slate-200 p-0.5" role="group">
              {['add', 'del'].map((id) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={tool === id}
                  onClick={() => setTool(id)}
                  className={`px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider transition-colors ${
                    tool === id ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-orange-600'
                  }`}
                >
                  {t[id]}
                </button>
              ))}
            </div>
            <Pill onClick={() => change({ net: { labels: [], edges: [] }, pos: [] })}>{t.clear}</Pill>
          </>
        )}
        <Pill onClick={() => setModel({ net, pos: forcePositions(net, pos, 0.05) })} disabled={n < 2}>
          {t.tidy}
        </Pill>
        <Pill active={showMatrix} onClick={() => setShowMatrix(!showMatrix)}>
          {t.matrix}
        </Pill>
      </div>

      <p className="mt-3 text-sm text-slate-600 leading-snug">{!drawOn ? t.hintOff : tool === 'add' ? t.hintAdd : t.hintDel}</p>

      <div className={`mt-3 grid gap-4 items-start ${showMatrix ? 'lg:grid-cols-[3fr_2fr]' : ''}`}>
        <div className="min-w-0">
          <div ref={wrapRef}>
            <canvas
              ref={canvasRef}
              role="img"
              aria-label={t.canvasAria}
              onClick={onClick}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={() => setDrag(null)}
              onPointerLeave={() => !drag && setHover(null)}
              className={`block bg-white border border-slate-200 rounded ${drawOn ? 'cursor-crosshair' : 'cursor-pointer'} ${drawCanvasClass(drawOn)}`}
            />
          </div>
          <div className="mt-2 min-h-[2.75rem]">
            {bfs && (
              <>
                <p className="font-mono text-sm text-slate-800" aria-live="polite">
                  {t.node(net.labels[bfsNode], stats.degree[bfsNode], fmt(stats.local[bfsNode], 3), bfs.far, unreached)}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-slate-600">
                  <span className="tabular-nums">0</span>
                  <span
                    className="inline-block h-2.5 w-28 rounded-sm"
                    style={{ background: `linear-gradient(to right, ${DIST_STOPS.join(', ')})` }}
                    aria-hidden="true"
                  />
                  <span className="tabular-nums">{bfs.far}</span>
                  <span>{t.distLegend}</span>
                  {unreached > 0 && (
                    <span className="inline-flex items-center gap-1.5">
                      <span className="inline-block w-2.5 h-2.5 rounded-full border border-slate-500 bg-white" />
                      {t.unreachable}
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {showMatrix && (
          <div className="min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Eyebrow>{t.matrix}</Eyebrow>
              {matrixOk && (
                <Pill active={grouped} onClick={() => setGrouped(!grouped)} className="!py-1">
                  {grouped ? t.ungroup : t.group}
                </Pill>
              )}
            </div>
            <div ref={matrixWrapRef} className="mt-2">
              {matrixOk ? (
                <canvas
                  ref={matrixRef}
                  role="img"
                  aria-label={t.matrixAria}
                  onMouseMove={(e) => setHover(matrixCell(e))}
                  onMouseLeave={() => setHover(null)}
                  onClick={(e) => setHover(matrixCell(e))}
                  className="block border border-slate-200 cursor-crosshair"
                />
              ) : (
                <p className="text-sm text-slate-500">{t.matrixLimit}</p>
              )}
            </div>
            {matrixOk && hlNodes.length > 0 && hlNodes.every((v) => v < n) && (
              <p className="mt-2 font-mono text-xs text-slate-700">
                {hlNodes.length === 1
                  ? `${net.labels[hlNodes[0]]} · k = ${stats.degree[hlNodes[0]]}`
                  : `A(${net.labels[hlNodes[0]]}, ${net.labels[hlNodes[1]]}) = ${hlPair ? 1 : 0}`}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <Stat label={t.stats.n}>{stats.n}</Stat>
        <Stat label={t.stats.l}>{stats.L}</Stat>
        <Stat label={t.stats.k}>{fmt(stats.meanDegree, 2)}</Stat>
        <Stat label={t.stats.density}>{fmt(stats.density, 3)}</Stat>
        <Stat label={t.stats.components}>
          {stats.components} <span className="text-slate-500">· {t.stats.largest(stats.largest)}</span>
        </Stat>
        <Stat label={t.stats.diameter}>{stats.diameter}</Stat>
        <Stat label={t.stats.distance}>{fmt(stats.avgDistance, 3)}</Stat>
        <Stat label={t.stats.clustering}>{fmt(stats.avgClustering, 3)}</Stat>
        <Stat label={t.stats.transitivity}>{fmt(stats.transitivity, 3)}</Stat>
        <Stat label={t.stats.triangles}>{stats.triangles}</Stat>
      </div>
      {stats.components > 1 && (
        <p className="mt-2 text-xs text-slate-500">
          {t.stats.diameter}, {t.stats.distance.toLowerCase()}: {t.stats.inLargest}.
        </p>
      )}

      <div className="mt-5">
        <Eyebrow>{t.hist}</Eyebrow>
        <div className="mt-2 flex items-end gap-px h-24" role="img" aria-label={t.histAria}>
          {stats.histogram.map((count, k) => (
            <div key={k} className="flex-1 min-w-0 max-w-[2.5rem] h-full flex flex-col justify-end items-center">
              {count > 0 && <span className="font-mono text-[10px] leading-none text-slate-600 mb-0.5">{count}</span>}
              <div className="w-full bg-orange-500 rounded-t-sm" style={{ height: `${(count / maxCount) * 78}%` }} />
            </div>
          ))}
        </div>
        <div className="flex gap-px border-t border-slate-300">
          {stats.histogram.map((_, k) => (
            <span key={k} className="flex-1 min-w-0 max-w-[2.5rem] text-center font-mono text-[10px] text-slate-500 pt-0.5">
              {stats.histogram.length <= 12 || k % 2 === 0 ? k : ''}
            </span>
          ))}
        </div>
        <p className="mt-1 font-mono text-xs text-slate-500">{t.degree}</p>
      </div>
    </div>
  )
}
