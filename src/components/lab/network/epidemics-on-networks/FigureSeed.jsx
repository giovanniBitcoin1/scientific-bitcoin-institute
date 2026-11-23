import { useMemo, useState } from 'react'
import { ORANGE_DARK, INK, SLATE, MUTED, Pill } from '../ui.jsx'
import Chart from '../charts.jsx'
import { fitUnit } from '../NetCanvas.jsx'
import { forceLayout } from '../../graphUtils.js'
import { mulberry32 } from '../../rng.js'
import { seedNet, seedOutbreaks, F1_N, F1_T, F1_RUNS, F1_BINS } from './figures.js'

// Live figure F1, "One seed, many futures": a network of 80 nodes with a few
// hubs. Tap a node to make it the seed; the button runs 200 outbreaks from it
// and shows how large they were. Plain SVG; only clicks are listened to, so a
// swipe over the drawing scrolls the page.

const T = {
  en: {
    run: `Run ${F1_RUNS} outbreaks`,
    hub: 'Seed: the hub',
    leaf: 'Seed: a node with one link',
    hint: (v, k) => `Seed: node ${v}, with ${k} ${k === 1 ? 'link' : 'links'}. Tap any node to move it, then run. Each link passes the infection with probability ${F1_T}.`,
    line: (v, k, big, mean) => `From node ${v} (${k} ${k === 1 ? 'link' : 'links'}): ${big} of ${F1_RUNS} outbreaks reached more than a quarter of the nodes; mean size ${mean}.`,
    earlier: 'Earlier',
    row: (v, k, big) => `node ${v}, ${k} ${k === 1 ? 'link' : 'links'}: ${big}`,
    x: 'nodes reached',
    y: 'outbreaks',
    aria: 'A network of 80 nodes; the seed of the outbreaks is highlighted',
    ariaChart: 'Histogram of the sizes of 200 outbreaks from the chosen seed',
    locale: 'en-US',
  },
  it: {
    run: `Lancia ${F1_RUNS} focolai`,
    hub: "Seme: l'hub",
    leaf: 'Seme: un nodo con un collegamento',
    hint: (v, k) => `Seme: nodo ${v}, con ${k} ${k === 1 ? 'collegamento' : 'collegamenti'}. Tocca un nodo per spostarlo, poi lancia. Ogni collegamento trasmette l'infezione con probabilità ${String(F1_T).replace('.', ',')}.`,
    line: (v, k, big, mean) => `Dal nodo ${v} (${k} ${k === 1 ? 'collegamento' : 'collegamenti'}): ${big} focolai su ${F1_RUNS} hanno raggiunto più di un quarto dei nodi; dimensione media ${mean}.`,
    earlier: 'Prima',
    row: (v, k, big) => `nodo ${v}, ${k} ${k === 1 ? 'collegamento' : 'collegamenti'}: ${big}`,
    x: 'nodi raggiunti',
    y: 'focolai',
    aria: 'Una rete di 80 nodi; il seme dei focolai è evidenziato',
    ariaChart: 'Istogramma delle dimensioni di 200 focolai dal seme scelto',
    locale: 'it-IT',
  },
}

const W = 300
const H = 230
const PAD = 12

export default function FigureSeed({ lang = 'en' }) {
  const t = T[lang] || T.en
  const num = (v, d) => v.toLocaleString(t.locale, { minimumFractionDigits: d, maximumFractionDigits: d })
  const base = useMemo(() => {
    const net = seedNet()
    const random = mulberry32(12)
    const start = Float64Array.from({ length: 2 * net.n }, () => random())
    return { net, pos: fitUnit(forceLayout(net.n, net.A, net.B, net.A.length, start, 0.1, 300), net.n) }
  }, [])
  const { net, pos } = base
  const [seed, setSeed] = useState(net.leaf)
  const [batches, setBatches] = useState({})
  const [result, setResult] = useState(null)
  const [history, setHistory] = useState([])

  const run = () => {
    const batch = batches[seed] || 0
    const r = seedOutbreaks(net, seed, batch)
    setBatches((b) => ({ ...b, [seed]: batch + 1 }))
    if (result) setHistory((h) => [result, ...h].slice(0, 3))
    setResult(r)
  }
  const x = (v) => PAD + pos[2 * v] * (W - 2 * PAD)
  const y = (v) => PAD + pos[2 * v + 1] * (H - 2 * PAD)
  const shown = result && result.seed === seed ? result : null
  const top = shown ? Math.max(40, Math.ceil(Math.max(...shown.bins) / 40) * 40) : 120
  const width = F1_N / F1_BINS

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <Pill primary onClick={run} data-action="run">
          {t.run}
        </Pill>
        <Pill active={seed === net.hub} onClick={() => setSeed(net.hub)} data-action="hub">
          {t.hub}
        </Pill>
        <Pill active={seed === net.leaf} onClick={() => setSeed(net.leaf)} data-action="leaf">
          {t.leaf}
        </Pill>
      </div>
      <div className="mt-3 grid gap-4 sm:grid-cols-2 items-start">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto bg-white border border-slate-200 rounded" role="img" aria-label={t.aria}>
          {Array.from(net.A, (a, e) => (
            <line key={e} x1={x(a)} y1={y(a)} x2={x(net.B[e])} y2={y(net.B[e])} stroke={MUTED} strokeWidth="0.8" />
          ))}
          {Array.from({ length: net.n }, (_, v) => (
            <g key={v} onClick={() => setSeed(v)} style={{ cursor: 'pointer' }} data-node={v}>
              <circle cx={x(v)} cy={y(v)} r="7" fill="transparent" />
              <circle cx={x(v)} cy={y(v)} r={2.2 + 1.1 * Math.sqrt(net.k[v])} fill={v === seed ? ORANGE_DARK : SLATE} stroke={v === seed ? INK : '#ffffff'} strokeWidth={v === seed ? 1.4 : 0.8} />
            </g>
          ))}
        </svg>
        <div className="min-w-0">
          <Chart
            x={{ min: 0, max: F1_N, ticks: [0, 20, 40, 60, 80], label: t.x }}
            y={{ min: 0, max: top, ticks: [0, top / 2, top], label: t.y }}
            height={185}
            aria={t.ariaChart}
            series={[]}
          >
            {({ sx, sy }) =>
              shown &&
              shown.bins.map((b, i) =>
                b > 0 ? <rect key={i} x={sx(i * width) + 1} y={sy(b)} width={sx((i + 1) * width) - sx(i * width) - 2} height={sy(0) - sy(b)} fill={i * width >= F1_N / 4 ? ORANGE_DARK : SLATE} /> : null,
              )
            }
          </Chart>
        </div>
      </div>
      <p
        className="mt-2 text-sm text-slate-700 leading-snug"
        data-readout="seed"
        data-seed={seed}
        data-k={net.k[seed]}
        data-big={shown ? Math.round(shown.big * F1_RUNS) : ''}
        data-mean={shown ? shown.mean.toFixed(1) : ''}
        data-bins={shown ? shown.bins.join(' ') : ''}
      >
        {shown ? t.line(seed, net.k[seed], Math.round(shown.big * F1_RUNS), num(shown.mean, 1)) : t.hint(seed, net.k[seed])}
      </p>
      {history.length > 0 && (
        <p className="mt-1 text-xs text-slate-500 leading-snug">
          {`${t.earlier}: ${history.map((h) => t.row(h.seed, net.k[h.seed], Math.round(h.big * F1_RUNS))).join(' · ')}`}
        </p>
      )}
    </div>
  )
}
