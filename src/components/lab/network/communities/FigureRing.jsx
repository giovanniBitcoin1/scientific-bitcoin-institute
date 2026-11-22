import { useMemo, useState } from 'react'
import Slider from '../../Slider.jsx'
import { ORANGE_DARK, INK, MUTED, Pill } from '../ui.jsx'
import NetCanvas from '../NetCanvas.jsx'
import Chart, { Legend } from '../charts.jsx'
import { ringOfCliques, cliquePartition, pairPartition, modularity } from './community.js'
import { ringCurve, ringPositions, F2_S, F2_MIN, F2_MAX } from './figures.js'
import { groupColor } from './palette.js'

// Live figure F2, "Ring of cliques": n cliques of 5 nodes in a ring, each
// joined to the next by one link, coloured with each clique a group or with
// neighbouring cliques in pairs; both Q values, and their curves against n
// with the line n = 22 where the pairs start to win.

const T = {
  en: {
    n: 'Number of cliques n',
    one: 'Each clique a group',
    pairs: 'Pairs of cliques',
    qOne: 'Q, each clique a group',
    qPairs: 'Q, pairs',
    aria: (n) => `A ring of ${n} cliques of ${F2_S} nodes`,
    ariaChart: 'Modularity of the two partitions against the number of cliques',
    locale: 'en-US',
  },
  it: {
    n: 'Numero di cricche n',
    one: 'Ogni cricca un gruppo',
    pairs: 'Cricche a coppie',
    qOne: 'Q, ogni cricca un gruppo',
    qPairs: 'Q, a coppie',
    aria: (n) => `Un anello di ${n} cricche di ${F2_S} nodi`,
    ariaChart: 'Modularità delle due partizioni al variare del numero di cricche',
    locale: 'it-IT',
  },
}

const THRESHOLD = F2_S * (F2_S - 1) + 2

export default function FigureRing({ lang = 'en' }) {
  const t = T[lang] || T.en
  const [n, setN] = useState(16)
  const [view, setView] = useState('one')
  const num = (v) => v.toLocaleString(t.locale, { minimumFractionDigits: 4, maximumFractionDigits: 4 })
  const curve = useMemo(() => ringCurve(), [])
  const pic = useMemo(() => {
    const g = ringOfCliques(n, F2_S)
    const one = cliquePartition(n, F2_S)
    const pairs = pairPartition(n, F2_S)
    return { g, one, pairs, pos: ringPositions(n, F2_S), qOne: modularity(g, one), qPairs: modularity(g, pairs) }
  }, [n])
  const part = view === 'one' ? pic.one : pic.pairs
  const nodes = Array.from({ length: pic.g.n }, (_, v) => ({ i: v, r: n > 28 ? 2.2 : 3, fill: groupColor(part[v]), stroke: '#ffffff', lineWidth: 0.5 }))
  const links = Array.from(pic.g.A, (a, e) => ({ a, b: pic.g.B[e], color: 'rgba(100, 116, 139, 0.5)', width: 0.8 }))
  const lo = 0.6
  const hi = 0.92

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 items-start">
        <div className="min-w-0">
          <Slider label={t.n} min={F2_MIN} max={F2_MAX} step={2} value={n} onChange={(v) => setN(Math.round(v / 2) * 2)} format={(v) => String(v)} />
          <div className="mt-2 flex flex-wrap gap-2">
            {['one', 'pairs'].map((id) => (
              <Pill key={id} active={view === id} onClick={() => setView(id)} data-view={id}>
                {t[id]}
              </Pill>
            ))}
          </div>
          <div className="mt-2">
            <NetCanvas pos={pic.pos} nodes={nodes} links={links} aria={t.aria(n)} maxHeight={190} ratio={0.75} />
          </div>
        </div>
        <div className="min-w-0">
          <div className="grid grid-cols-2 gap-2 font-mono text-sm tabular-nums" data-readout="ring" data-one={pic.qOne.toFixed(4)} data-pairs={pic.qPairs.toFixed(4)}>
            <p className="min-w-0">
              <span className="block text-xs font-sans text-slate-500">{t.qOne}</span>
              <span style={{ color: INK, fontWeight: pic.qOne >= pic.qPairs ? 600 : 400 }}>{num(pic.qOne)}</span>
            </p>
            <p className="min-w-0">
              <span className="block text-xs font-sans text-slate-500">{t.qPairs}</span>
              <span style={{ color: ORANGE_DARK, fontWeight: pic.qPairs > pic.qOne ? 600 : 400 }}>{num(pic.qPairs)}</span>
            </p>
          </div>
          <Chart
            x={{ min: F2_MIN, max: F2_MAX, ticks: [6, 10, 20, 30, 40], label: 'n' }}
            y={{ min: lo, max: hi, ticks: [0.6, 0.7, 0.8, 0.9], format: (v) => v.toLocaleString(t.locale, { minimumFractionDigits: 2 }), label: 'Q', labelSide: 'left' }}
            height={140}
            aria={t.ariaChart}
            marks={[
              { x: THRESHOLD, color: MUTED, dashed: true, label: `n = ${THRESHOLD}` },
              { x: n, color: ORANGE_DARK, label: '' },
            ]}
            series={[
              { points: curve.map((p) => [p.n, p.one]), color: INK, width: 1.8 },
              { points: curve.map((p) => [p.n, p.pairs]), color: ORANGE_DARK, width: 1.8, dashed: true },
            ]}
          />
          <Legend items={[{ label: t.one, color: INK }, { label: t.pairs, color: ORANGE_DARK, dashed: true }]} />
        </div>
      </div>
    </div>
  )
}
