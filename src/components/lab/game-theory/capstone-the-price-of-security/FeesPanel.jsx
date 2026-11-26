import { useMemo, useState } from 'react'
import Slider from '../../Slider.jsx'
import { Pill, SLATE, ORANGE_DARK, MUTED, GRID, MONO } from '../../network/ui.jsx'
import { exact, simulate } from './fees.js'
import { num, int } from '../auctions/fmt.js'

// Panel B, "When only fees pay": block rewards S + f·gap with exponential
// gaps; bars of the last 100 rewards; the coefficient of variation and the
// shares of blocks worth more than twice and three times the average, exact
// against simulated.

export const COUNTS = [1000, 100000]
export const PRESETS = [['today', 3.125, 0.02], ['y2028', 1.5625, 0.5], ['feesOnly', 0, 0.02]]

const T = {
  en: {
    S: 'S, subsidy per block (BTC)',
    f: 'f, average fees per block (BTC)',
    blocks: 'Blocks:',
    again: 'Run again',
    presets: { today: 'Today', y2028: '2028: S 1.5625, f 0.5', feesOnly: 'Fees only' },
    run: (s) => `Run no. ${s} (seed ${s})`,
    how: 'Blocks are found with exponential gaps, ten minutes on average; fees arrive at a steady rate and the next block takes every pending fee, as in Carlsten et al.’s simplification. With a backlog of waiting transactions the rewards would be smoother.',
    bars: 'Rewards of the last 100 blocks (dashed: the average; dotted: twice the average)',
    head: ['', 'exact', 'simulated'],
    rows: { mean: 'average reward, BTC', cv: 'coefficient of variation f/(S + f)', over2: 'blocks worth more than 2× the average', over3: 'blocks worth more than 3× the average' },
    aria: 'Rewards of the last 100 blocks',
  },
  it: {
    S: 'S, sussidio per blocco (BTC)',
    f: 'f, commissioni medie per blocco (BTC)',
    blocks: 'Blocchi:',
    again: 'Nuova prova',
    presets: { today: 'Oggi', y2028: '2028: S 1,5625; f 0,5', feesOnly: 'Solo commissioni' },
    run: (s) => `Prova n. ${s} (seme ${s})`,
    how: 'I blocchi si trovano a intervalli esponenziali, in media dieci minuti; le commissioni arrivano a ritmo costante e il blocco successivo prende tutte quelle in attesa, come nella semplificazione di Carlsten e coautori. Con una coda di transazioni in attesa le ricompense sarebbero più regolari.',
    bars: 'Ricompense degli ultimi 100 blocchi (tratteggiata: la media; punteggiata: il doppio della media)',
    head: ['', 'esatto', 'simulato'],
    rows: { mean: 'ricompensa media, BTC', cv: 'coefficiente di variazione f/(S + f)', over2: 'blocchi che valgono più di 2 volte la media', over3: 'blocchi che valgono più di 3 volte la media' },
    aria: 'Ricompense degli ultimi 100 blocchi',
  },
}

const share = (p, lang) => (p === 0 ? '0' : p < 1e-4 ? p.toExponential(1).replace('e', ' × 10^').replace('.', lang === 'it' ? ',' : '.') : `${num(100 * p, lang, 2)}%`)

export default function FeesPanel({ lang = 'en' }) {
  const L = T[lang] || T.en
  const [S, setS] = useState(3.125)
  const [f, setF] = useState(0.02)
  const [blocks, setBlocks] = useState(100000)
  const [seed, setSeed] = useState(1)
  const sim = useMemo(() => simulate({ S, f, blocks, seed }), [S, f, blocks, seed])
  const ex = exact(S, f)
  const d = (x, k = 4) => num(x, lang, k)
  const se = (p, s) => `${share(p, lang)} ± ${share(s, lang)}`
  const rows = [
    ['mean', d(ex.mean), d(sim.mean)],
    ['cv', d(ex.cv, 5), d(sim.cv, 5)],
    ['over2', share(ex.over2, lang), se(sim.over2, sim.over2Se)],
    ['over3', share(ex.over3, lang), se(sim.over3, sim.over3Se)],
  ]
  const W = 320
  const H = 120
  const top = Math.max(3 * ex.mean, ...sim.last) * 1.05
  const y = (v) => H - 12 - (v / top) * (H - 20)
  const bw = (W - 30) / sim.last.length
  return (
    <div>
      <div className="grid gap-x-8 gap-y-2 sm:grid-cols-2 max-w-3xl">
        <Slider label={L.S} min={0} max={3.125} step={0.0625} value={S} onChange={setS} format={(x) => d(x)} />
        <Slider label={L.f} min={0.01} max={5} log value={f} onChange={(x) => setF(Number(x.toPrecision(3)))} format={(x) => d(x, x < 0.1 ? 3 : 2)} />
      </div>
      <div className="mt-2 flex flex-wrap gap-2" data-role="fb-presets">
        {PRESETS.map(([k, s0, f0]) => <Pill key={k} active={S === s0 && f === f0} onClick={() => { setS(s0); setF(f0) }} data-preset={k}>{L.presets[k]}</Pill>)}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <span>{L.blocks}</span>
        <span className="flex gap-2" data-role="fb-counts">
          {COUNTS.map((c) => <Pill key={c} active={blocks === c} onClick={() => setBlocks(c)} data-count={c}>{int(c, lang)}</Pill>)}
        </span>
        <Pill primary onClick={() => setSeed(seed + 1)} data-role="fb-again">{L.again}</Pill>
        <span className="font-mono" data-role="fb-seed">{L.run(seed)}</span>
      </div>
      <p className="mt-2 text-xs text-slate-600 leading-snug max-w-3xl">{L.how}</p>
      <div className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] items-start max-w-3xl">
        <div className="min-w-0">
          <p className="text-xs text-slate-600">{L.bars}</p>
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label={L.aria} data-role="fb-bars">
            <line x1="26" x2={W} y1={H - 12} y2={H - 12} stroke={SLATE} />
            {[0, ex.mean, 2 * ex.mean].map((v, i) => (
              <text key={i} x="22" y={y(v) + 3} textAnchor="end" fontSize="8" fontFamily={MONO} fill={SLATE}>{num(v, lang, v < 1 ? 2 : 1)}</text>
            ))}
            {sim.last.map((v, i) => (
              <rect key={i} x={28 + i * bw} y={y(v)} width={Math.max(0.5, bw - 0.6)} height={Math.max(0, H - 12 - y(v))} fill={v > 2 * ex.mean ? ORANGE_DARK : MUTED} data-bar={i} />
            ))}
            <line x1="26" x2={W} y1={y(ex.mean)} y2={y(ex.mean)} stroke={SLATE} strokeDasharray="4 3" />
            <line x1="26" x2={W} y1={y(2 * ex.mean)} y2={y(2 * ex.mean)} stroke={ORANGE_DARK} strokeDasharray="1 2" />
            <line x1="26" x2="26" y1="4" y2={H - 12} stroke={GRID} />
          </svg>
        </div>
        <table className="w-full text-sm tabular-nums" data-role="fb-table">
          <thead>
            <tr className="text-xs text-slate-500 text-left">{L.head.map((h, i) => <th key={i} className={`font-normal pb-1 ${i ? 'text-right' : ''}`}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map(([k, a, b]) => (
              <tr key={k} className="border-t border-slate-100" data-row={k}>
                <td className="py-1 pr-2 text-slate-600 text-xs">{L.rows[k]}</td>
                <td className="py-1 text-right font-mono text-xs" data-value="exact">{a}</td>
                <td className="py-1 pl-2 text-right font-mono text-xs" data-value="sim">{b}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
