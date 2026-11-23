import { useMemo, useState } from 'react'
import { ORANGE_DARK, INK, SLATE, MUTED, GRID, Pill } from '../ui.jsx'
import Chart, { Legend } from '../charts.jsx'
import { fitUnit } from '../NetCanvas.jsx'
import { forceLayout } from '../../graphUtils.js'
import { mulberry32 } from '../../rng.js'
import { randomOrder } from '../who-connects-to-whom/mixing.js'
import { failNet, nextTarget, failState, F1_N, F1_ORDER_SEED } from './figures.js'

// Live figure F1, "Fail or target": a heavy-tailed network of 60 nodes. One
// button removes a node at random, the other the node with most links left.
// Each keeps its own sequence; the drawing shows the one pressed last, with
// the largest component in orange, and the chart both. Plain SVG; only the
// buttons listen, so a swipe over the drawing scrolls.

const T = {
  en: {
    random: 'Remove one at random',
    attack: 'Remove the biggest hub',
    reset: 'Start again',
    showing: { random: 'Random failures', attack: 'Attack on the hubs' },
    line: (what, removed, size) => `${what}: ${removed} removed, the largest component holds ${size} of ${F1_N} nodes.`,
    removed: 'removed',
    size: 'largest component',
    aria: 'A network of 60 nodes with the largest component highlighted',
    ariaChart: 'Size of the largest component against the number of nodes removed, at random and by highest degree',
  },
  it: {
    random: 'Togline uno a caso',
    attack: "Togli l'hub più grande",
    reset: 'Ricomincia',
    showing: { random: 'Guasti casuali', attack: 'Attacco agli hub' },
    line: (what, removed, size) => `${what}: ${removed} rimossi, la componente più grande ha ${size} nodi su ${F1_N}.`,
    removed: 'rimossi',
    size: 'componente più grande',
    aria: 'Una rete di 60 nodi con la componente più grande evidenziata',
    ariaChart: 'Dimensione della componente più grande al variare del numero di nodi rimossi, a caso e per grado più alto',
  },
}

const W = 300
const H = 230
const PAD = 12

export default function FigureFail({ lang = 'en' }) {
  const t = T[lang] || T.en
  const base = useMemo(() => {
    const net = failNet()
    const random = mulberry32(7)
    const start = Float64Array.from({ length: 2 * net.n }, () => random())
    const pos = fitUnit(forceLayout(net.n, net.A, net.B, net.A.length, start, 0.1, 300), net.n)
    const deg = Array.from({ length: net.n }, (_, v) => net.g.offsets[v + 1] - net.g.offsets[v])
    return { net, pos, deg, order: Array.from(randomOrder(net.n, mulberry32(F1_ORDER_SEED))) }
  }, [])
  const { net, pos, deg } = base
  const [lists, setLists] = useState({ random: [], attack: [] })
  const [view, setView] = useState('random')

  const sizes = useMemo(() => {
    const of = (list) => Array.from({ length: list.length + 1 }, (_, i) => failState(net, list.slice(0, i)).size)
    return { random: of(lists.random), attack: of(lists.attack) }
  }, [net, lists])
  const state = useMemo(() => failState(net, lists[view]), [net, lists, view])

  const press = (mode) => {
    setView(mode)
    setLists((l) => {
      const list = l[mode]
      if (list.length >= net.n) return l
      let v
      if (mode === 'random') v = base.order[list.length]
      else {
        const removed = new Uint8Array(net.n)
        for (const u of list) removed[u] = 1
        v = nextTarget(net, removed)
      }
      return { ...l, [mode]: [...list, v] }
    })
  }
  const x = (v) => PAD + pos[2 * v] * (W - 2 * PAD)
  const y = (v) => PAD + pos[2 * v + 1] * (H - 2 * PAD)
  const last = lists[view][lists[view].length - 1]

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <Pill active={view === 'random'} onClick={() => press('random')} data-action="random">
          {t.random}
        </Pill>
        <Pill active={view === 'attack'} onClick={() => press('attack')} data-action="attack">
          {t.attack}
        </Pill>
        <Pill
          onClick={() => {
            setLists({ random: [], attack: [] })
            setView('random')
          }}
          data-action="reset"
        >
          {t.reset}
        </Pill>
      </div>
      <div className="mt-3 grid gap-4 sm:grid-cols-2 items-start">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto bg-white border border-slate-200 rounded" role="img" aria-label={t.aria}>
          {Array.from(net.A, (a, e) => {
            const b = net.B[e]
            if (state.removed[a] || state.removed[b]) return null
            const hot = state.inGiant[a]
            return <line key={e} x1={x(a)} y1={y(a)} x2={x(b)} y2={y(b)} stroke={hot ? ORANGE_DARK : MUTED} strokeWidth={hot ? 1 : 0.8} opacity={hot ? 0.7 : 0.8} />
          })}
          {Array.from({ length: net.n }, (_, v) => {
            const r = 2.2 + 1.1 * Math.sqrt(deg[v])
            if (state.removed[v]) return <circle key={v} cx={x(v)} cy={y(v)} r={r} fill="#ffffff" stroke={v === last ? INK : GRID} strokeWidth={v === last ? 1.4 : 1} strokeDasharray="2 2" />
            return <circle key={v} cx={x(v)} cy={y(v)} r={r} fill={state.inGiant[v] ? ORANGE_DARK : SLATE} stroke="#ffffff" strokeWidth="0.8" />
          })}
        </svg>
        <div className="min-w-0">
          <Chart
            x={{ min: 0, max: F1_N, ticks: [0, 20, 40, 60], label: t.removed }}
            y={{ min: 0, max: F1_N, ticks: [0, 20, 40, 60], label: t.size }}
            height={185}
            aria={t.ariaChart}
            series={[
              { points: sizes.random.map((s, i) => [i, s]), color: INK, width: 1.6, dots: 1.6 },
              { points: sizes.attack.map((s, i) => [i, s]), color: ORANGE_DARK, width: 1.6, dots: 1.6 },
            ]}
          />
          <Legend items={[{ label: t.showing.random, color: INK }, { label: t.showing.attack, color: ORANGE_DARK }]} />
        </div>
      </div>
      <p
        className="mt-2 text-sm text-slate-700 leading-snug"
        data-readout="fail"
        data-view={view}
        data-removed={lists[view].length}
        data-size={state.size}
        data-random={sizes.random.join(' ')}
        data-attack={sizes.attack.join(' ')}
      >
        {t.line(t.showing[view], lists[view].length, state.size)}
      </p>
    </div>
  )
}
