import { useMemo, useState } from 'react'
import Slider from '../../Slider.jsx'
import { Pill, SLATE, ORANGE_DARK, MUTED } from '../../network/ui.jsx'
import Chart, { Legend } from '../../network/charts.jsx'
import { expected, adjustments, simulatePath } from './difficulty.js'
import { num, int } from '../auctions/fmt.js'

// Panel B, "The difficulty catches up": her expected cumulative reward (in
// blocks) under SM1 and that of honest mining with the same share, from the
// start of a difficulty period; the adjustments marked; one simulated path.

const T = {
  en: {
    alpha: 'α, her share of the hash rate',
    gamma: 'γ, the others who build on her block in a race',
    horizon: 'horizon, days',
    again: 'Another path',
    run: (s) => `Path no. ${s} (seed ${s})`,
    xl: 'days',
    yl: 'blocks earned',
    legend: ['selfish, expected', 'honest, expected', 'selfish, one simulated path', 'difficulty adjustment'],
    before: 'income before the first adjustment, against honest',
    after: 'income after it, against honest',
    first: 'first adjustment, day',
    even: 'she breaks even on day',
    never: 'never (R ≤ α)',
    beyond: (h) => ` (beyond ${h} days)`,
    end: (h, s, e, p) => `Day ${h}: selfish ${e} blocks expected, honest ${s}; this path ${p}.`,
    how: 'The attack starts at the beginning of a difficulty period. Until 2016 blocks have joined the chain, blocks are found at one per 10 minutes, but only G of every block found ends in the chain; then the difficulty falls, the chain grows at one block per 10 minutes again, and her income per 10 minutes is R. The simulated path finds blocks at random times and retargets every 2016 chain blocks from the time the period took.',
    aria: 'Her cumulative reward against honest mining, by day',
  },
  it: {
    alpha: 'α, la sua quota dell’hash rate',
    gamma: 'γ, gli altri che costruiscono sul suo blocco in una gara',
    horizon: 'orizzonte, giorni',
    again: 'Un altro percorso',
    run: (s) => `Percorso n. ${s} (seme ${s})`,
    xl: 'giorni',
    yl: 'blocchi guadagnati',
    legend: ['selfish, atteso', 'onesto, atteso', 'selfish, un percorso simulato', 'aggiustamento della difficoltà'],
    before: 'reddito prima del primo aggiustamento, rispetto all’onesto',
    after: 'reddito dopo, rispetto all’onesto',
    first: 'primo aggiustamento, giorno',
    even: 'va in pari il giorno',
    never: 'mai (R ≤ α)',
    beyond: (h) => ` (oltre i ${h} giorni)`,
    end: (h, s, e, p) => `Giorno ${h}: selfish ${e} blocchi attesi, onesto ${s}; questo percorso ${p}.`,
    how: 'L’attacco comincia all’inizio di un periodo di difficoltà. Finché 2016 blocchi non sono entrati nella catena, i blocchi si trovano al ritmo di uno ogni 10 minuti, ma di ogni blocco trovato solo G finisce nella catena; poi la difficoltà scende, la catena torna a crescere di un blocco ogni 10 minuti, e il suo reddito ogni 10 minuti è R. Il percorso simulato trova i blocchi in tempi casuali e ricalcola la difficoltà ogni 2016 blocchi della catena dal tempo che il periodo ha richiesto.',
    aria: 'La sua ricompensa cumulata rispetto al mining onesto, giorno per giorno',
  },
}

const niceTop = (v) => {
  const steps = [100, 200, 250, 500, 1000, 2000, 2500, 5000]
  for (const s of steps) if (v / s <= 5) return [Math.ceil(v / s) * s, s]
  return [Math.ceil(v / 10000) * 10000, 10000]
}

export default function DifficultyPanel({ lang = 'en' }) {
  const L = T[lang] || T.en
  const [a, setA] = useState(0.4)
  const [g, setG] = useState(0)
  const [H, setH] = useState(60)
  const [seed, setSeed] = useState(1)
  const d = (x, k = 2) => num(x, lang, k)
  const e = expected(a, g)
  const path = useMemo(() => simulatePath({ alpha: a, gamma: g, horizon: H, seed }), [a, g, H, seed])
  const adj = adjustments(e.T1, H)
  const grid = []
  for (let i = 0; i <= 120; i++) grid.push((H * i) / 120)
  for (const t of [...adj, e.breakEven]) if (t !== null && t < H) grid.push(t)
  grid.sort((x, y) => x - y)
  const top = Math.max(e.selfish(H), e.honest(H), ...path.pts.map((p) => p[1]), 1)
  const [ymax, ystep] = niceTop(top)
  const yt = []
  for (let v = 0; v <= ymax + 1e-9; v += ystep) yt.push(v)
  const xt = []
  for (let v = 0; v <= H + 1e-9; v += H > 50 ? 15 : 5) xt.push(v)
  const pct = (x) => `${d(100 * x)}%`
  return (
    <div>
      <div className="grid gap-x-8 gap-y-2 sm:grid-cols-3 max-w-3xl">
        <Slider label={L.alpha} min={0.01} max={0.49} step={0.01} value={a} onChange={(x) => setA(Math.round(x * 100) / 100)} format={(x) => d(x)} />
        <Slider label={L.gamma} min={0} max={1} step={0.05} value={g} onChange={(x) => setG(Math.round(x * 100) / 100)} format={(x) => d(x)} />
        <Slider label={L.horizon} min={10} max={90} step={1} value={H} onChange={setH} />
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <Pill primary onClick={() => setSeed(seed + 1)} data-role="df-again">{L.again}</Pill>
        <span className="font-mono" data-role="df-seed">{L.run(seed)}</span>
      </div>
      <p className="mt-2 text-xs text-slate-600 leading-snug max-w-3xl">{L.how}</p>
      <div className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] items-start max-w-3xl">
        <div className="min-w-0" data-role="df-chart">
          <Chart
            height={200}
            x={{ min: 0, max: H, ticks: xt, label: L.xl }}
            y={{ min: 0, max: ymax, ticks: yt, label: L.yl, labelSide: 'left', format: (v) => int(v, lang) }}
            series={[
              { points: path.pts, color: ORANGE_DARK, width: 1, opacity: 0.45 },
              { points: grid.map((t) => [t, e.honest(t)]), color: SLATE, width: 1.75 },
              { points: grid.map((t) => [t, e.selfish(t)]), color: ORANGE_DARK, width: 2 },
            ]}
            marks={adj.map((t) => ({ x: t, color: MUTED, dashed: true }))}
            aria={L.aria}
          />
          <Legend items={[{ label: L.legend[0], color: ORANGE_DARK }, { label: L.legend[1], color: SLATE }, { label: L.legend[2], color: ORANGE_DARK, opacity: 0.45 }, { label: L.legend[3], color: MUTED, dashed: true }]} />
        </div>
        <dl className="grid gap-1 text-sm content-start" data-role="df-readout">
          <div className="flex justify-between gap-3"><dt className="text-slate-600">{L.before}</dt><dd className="font-mono tabular-nums" data-value="before">{pct(e.before)}</dd></div>
          <div className="flex justify-between gap-3"><dt className="text-slate-600">{L.after}</dt><dd className="font-mono tabular-nums" data-value="after">{pct(e.after)}</dd></div>
          <div className="flex justify-between gap-3"><dt className="text-slate-600">{L.first}</dt><dd className="font-mono tabular-nums" data-value="first">{d(e.T1)}</dd></div>
          <div className="flex justify-between gap-3"><dt className="text-slate-600">{L.even}</dt><dd className="font-mono tabular-nums text-right" data-value="even">{e.breakEven === null ? L.never : `${d(e.breakEven)}${e.breakEven > H ? L.beyond(H) : ''}`}</dd></div>
          <p className="mt-1 text-xs text-slate-600 leading-snug" data-value="end">{L.end(H, int(e.honest(H), lang), int(e.selfish(H), lang), int(path.end, lang))}</p>
        </dl>
      </div>
    </div>
  )
}
