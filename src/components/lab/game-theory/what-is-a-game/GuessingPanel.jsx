import { useMemo, useState } from 'react'
import Slider from '../../Slider.jsx'
import useExperiment from '../../useExperiment.js'
import { ORANGE_DARK, INK, SLATE, GRID, MONO, Pill, Eyebrow, Stat, fmt } from '../../network/ui.jsx'
import Chart, { Legend } from '../../network/charts.jsx'
import {
  KINDS,
  SHARE_PRESETS,
  DEFAULTS,
  ROUND_SEED,
  P_VALUES,
  countsOf,
  expected,
  playSequence,
  histogram,
  rankOf,
  manyJob,
} from './guessing.js'

// Panel B: guess p times the average. A crowd of five kinds of player (levels
// 0 to 3 of reasoning and an "equilibrium" kind that always says 0) plays one
// round, a thousand independent rounds, or the same game again and again.

const KIND_COLOR = { l0: '#94a3b8', l1: '#7dd3fc', l2: ORANGE_DARK, l3: '#0369a1', eq: INK }
const PRESET_IDS = ['default', 'random', 'deep', 'half']
const BINS = 50

const T = {
  en: {
    presets: { default: 'Default', random: 'Everyone random', deep: 'Deep thinkers', half: 'Half at equilibrium' },
    kinds: { l0: 'Level 0', l1: 'Level 1', l2: 'Level 2', l3: 'Level 3', eq: 'Equilibrium' },
    shareOf: (kind) => `Share: ${kind}`,
    n: 'Players N',
    p: 'Multiplier p',
    sigma: 'Noise σ',
    crowd: 'The crowd',
    players: 'players',
    own: 'Your guess',
    rank: (r, n) => `Your guess would have come ${r.toLocaleString('en-US')} of ${n.toLocaleString('en-US')} (1 = the closest).`,
    noRank: 'Enter a number from 0 to 100 to see where it would have come.',
    one: 'Play one round',
    again: 'Play again',
    ten: '10 more rounds',
    many: (r) => `Play ${r.toLocaleString('en-US')} times`,
    stop: 'Stop',
    round: (k) => `Round ${k}`,
    mean: 'Mean',
    target: (p) => `Target (${p} × mean)`,
    winning: 'Winning guess',
    winner: 'Winner',
    theory: 'Expected mean, target',
    hist: 'The guesses of this round',
    histX: 'guess',
    rounds: 'Mean and target, round after round',
    below: (k) => `The mean falls below 1 in round ${k}.`,
    notBelow: (k) => `After ${k} ${k === 1 ? 'round' : 'rounds'} the mean is still 1 or more.`,
    shrink: 'From the second round the noise shrinks with the mean: its standard deviation is σ × (previous mean) / 50.',
    manyTitle: (done, runs) => `${done.toLocaleString('en-US')} of ${runs.toLocaleString('en-US')} independent first rounds`,
    cols: ['Kind', 'Players', 'Wins', 'Mean distance from the target'],
    avg: (m, tg) => `Mean of the means ${m}, of the targets ${tg}.`,
    computing: 'Computing…',
    histAria: 'Histogram of the guesses from 0 to 100, coloured by kind of player, with the mean and the target marked',
    roundsAria: 'Mean and target of each round on a logarithmic axis',
    targetMark: 'target',
    meanMark: 'mean',
  },
  it: {
    presets: { default: 'Predefinito', random: 'Tutti a caso', deep: 'Pensatori profondi', half: "Metà all'equilibrio" },
    kinds: { l0: 'Livello 0', l1: 'Livello 1', l2: 'Livello 2', l3: 'Livello 3', eq: 'Equilibrio' },
    shareOf: (kind) => `Quota: ${kind}`,
    n: 'Giocatori N',
    p: 'Moltiplicatore p',
    sigma: 'Rumore σ',
    crowd: 'La folla',
    players: 'giocatori',
    own: 'Il tuo numero',
    rank: (r, n) => `Il tuo numero sarebbe arrivato ${r.toLocaleString('it-IT')}º su ${n.toLocaleString('it-IT')} (1 = il più vicino).`,
    noRank: 'Scrivi un numero da 0 a 100 per vedere dove sarebbe arrivato.',
    one: 'Gioca un turno',
    again: 'Gioca di nuovo',
    ten: 'Altri 10 turni',
    many: (r) => `Gioca ${r.toLocaleString('it-IT')} volte`,
    stop: 'Ferma',
    round: (k) => `Turno ${k}`,
    mean: 'Media',
    target: (p) => `Bersaglio (${p} × media)`,
    winning: 'Numero vincente',
    winner: 'Vincitore',
    theory: 'Media e bersaglio attesi',
    hist: 'I numeri di questo turno',
    histX: 'numero',
    rounds: 'Media e bersaglio, turno dopo turno',
    below: (k) => `La media scende sotto 1 al turno ${k}.`,
    notBelow: (k) => `Dopo ${k} ${k === 1 ? 'turno' : 'turni'} la media è ancora 1 o più.`,
    shrink: 'Dal secondo turno il rumore si riduce con la media: la sua deviazione standard è σ × (media precedente) / 50.',
    manyTitle: (done, runs) => `${done.toLocaleString('it-IT')} di ${runs.toLocaleString('it-IT')} primi turni indipendenti`,
    cols: ['Tipo', 'Giocatori', 'Vittorie', 'Distanza media dal bersaglio'],
    avg: (m, tg) => `Media delle medie ${m}, dei bersagli ${tg}.`,
    computing: 'Calcolo in corso…',
    histAria: 'Istogramma dei numeri da 0 a 100, colorato per tipo di giocatore, con la media e il bersaglio',
    roundsAria: 'Media e bersaglio di ogni turno su un asse logaritmico',
    targetMark: 'bersaglio',
    meanMark: 'media',
  },
}

export const showP = (p) => (Math.abs(p - 2 / 3) < 1e-9 ? '2/3' : Math.abs(p - 0.5) < 1e-9 ? '1/2' : p.toFixed(2))

// Histogram of one round: stacked bars, one colour per kind.
function Histogram({ round, t }) {
  const h = useMemo(() => histogram(round, BINS), [round])
  const totals = Array.from({ length: BINS }, (_, b) => KINDS.reduce((s, _k, k) => s + h[k][b], 0))
  const top = Math.max(1, ...totals)
  const W = 320
  const H = 150
  const X0 = 8
  const X1 = 312
  const Y0 = 16
  const Y1 = 124
  const bw = (X1 - X0) / BINS
  const sx = (v) => X0 + (v / 100) * (X1 - X0)
  const bars = []
  for (let b = 0; b < BINS; b++) {
    let y = Y1
    KINDS.forEach((kind, k) => {
      if (!h[k][b]) return
      const hh = (h[k][b] / top) * (Y1 - Y0)
      y -= hh
      bars.push(<rect key={`${b}-${kind}`} x={X0 + b * bw + 0.4} y={y} width={bw - 0.8} height={hh} fill={KIND_COLOR[kind]} />)
    })
  }
  const mark = (v, label, color, row) => (
    <g>
      <line x1={sx(v)} x2={sx(v)} y1={Y0 - 6} y2={Y1} stroke={color} strokeWidth="1.5" strokeDasharray="3 3" />
      <text x={sx(v) + (sx(v) > W * 0.7 ? -3 : 3)} y={Y0 - 8 + row * 9} textAnchor={sx(v) > W * 0.7 ? 'end' : 'start'} fontSize="9" fontFamily={MONO} fill={color}>
        {label}
      </text>
    </g>
  )
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label={t.histAria}>
      <line x1={X0} x2={X1} y1={Y1} y2={Y1} stroke={SLATE} strokeWidth="1" />
      {[0, 25, 50, 75, 100].map((v) => (
        <g key={v}>
          <line x1={sx(v)} x2={sx(v)} y1={Y1} y2={Y1 + 3} stroke={SLATE} strokeWidth="1" />
          <text x={sx(v)} y={Y1 + 12} textAnchor="middle" fontSize="9" fontFamily={MONO} fill={SLATE}>
            {v}
          </text>
        </g>
      ))}
      <line x1={X0} x2={X1} y1={Y0} y2={Y0} stroke={GRID} strokeWidth="1" />
      <text x={X1} y={H - 2} textAnchor="end" fontSize="9" fontFamily={MONO} fill={SLATE}>
        {t.histX}
      </text>
      {bars}
      {mark(round.mean, t.meanMark, SLATE, 1)}
      {mark(round.target, t.targetMark, '#16a34a', 0)}
    </svg>
  )
}

export default function GuessingPanel({ lang = 'en' }) {
  const t = T[lang] || T.en
  const [shares, setShares] = useState(SHARE_PRESETS.default)
  const [N, setN] = useState(DEFAULTS.N)
  const [pIndex, setPIndex] = useState(P_VALUES.indexOf(2 / 3))
  const [sigma, setSigma] = useState(DEFAULTS.sigma)
  const [own, setOwn] = useState('')
  const [play, setPlay] = useState({ seed: ROUND_SEED, rounds: 1 })
  const [manyKey, setManyKey] = useState(null)
  const many = useExperiment()

  const p = P_VALUES[pIndex]
  const key = JSON.stringify([shares, N, p, sigma])
  const cfg = useMemo(() => ({ N, shares, p, sigma }), [key]) // eslint-disable-line react-hooks/exhaustive-deps
  const counts = useMemo(() => countsOf(N, shares), [cfg]) // eslint-disable-line react-hooks/exhaustive-deps
  const seq = useMemo(() => playSequence({ ...cfg, rounds: play.rounds, seed: play.seed }), [cfg, play])
  const round = seq[seq.length - 1]
  const theory = expected(counts, p)
  const firstBelow = seq.findIndex((r) => r.mean < 1)

  // A change of settings starts again from the first round of the page's seed.
  const change = (fn) => (v) => {
    fn(v)
    setPlay({ seed: ROUND_SEED, rounds: 1 })
  }
  const setShare = (k) => change((v) => setShares((s) => s.map((x, i) => (i === k ? v : x))))
  const activePreset = PRESET_IDS.find((id) => SHARE_PRESETS[id].every((v, i) => Math.abs(v - shares[i]) < 1e-9))

  const guess = own.trim() === '' ? NaN : Number(own.replace(',', '.'))
  const validGuess = Number.isFinite(guess) && guess >= 0 && guess <= 100
  const showMany = many.data && manyKey === key

  const pText = showP(p)
  const top = Math.max(10, seq.length)
  const xTicks = top <= 12 ? Array.from({ length: top }, (_, i) => i + 1).filter((v) => v === 1 || v % 2 === 0) : [1, ...[0.25, 0.5, 0.75, 1].map((f) => Math.round(top * f))]

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {PRESET_IDS.map((id) => (
          <Pill key={id} active={activePreset === id} onClick={() => change(setShares)(SHARE_PRESETS[id])}>
            {t.presets[id]}
          </Pill>
        ))}
      </div>

      <div className="mt-5 grid gap-x-8 gap-y-6 lg:grid-cols-2 items-start">
        <div className="min-w-0 space-y-3">
          <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
            <Slider label={t.n} min={100} max={5000} step={100} value={N} onChange={change(setN)} format={(v) => v.toLocaleString('en-US')} />
            <Slider label={t.p} min={0} max={P_VALUES.length - 1} step={1} value={pIndex} onChange={change(setPIndex)} format={(i) => showP(P_VALUES[i])} />
            <Slider label={t.sigma} min={0} max={5} step={0.5} value={sigma} onChange={change(setSigma)} format={(v) => v.toFixed(1)} />
          </div>
          <Eyebrow>{t.crowd}</Eyebrow>
          <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
            {KINDS.map((kind, k) => (
              <Slider key={kind} label={t.shareOf(t.kinds[kind])} min={0} max={1} step={0.05} value={shares[k]} onChange={setShare(k)} format={(v) => v.toFixed(2)} />
            ))}
          </div>
          <p className="text-xs text-slate-600 leading-relaxed" data-role="crowd">
            {KINDS.map((kind, k) => (
              <span key={kind} className="inline-flex items-center gap-1 mr-3 whitespace-nowrap">
                <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: KIND_COLOR[kind] }} />
                {t.kinds[kind]} <span className="font-mono text-slate-900 tabular-nums">{counts[k].toLocaleString('en-US')}</span>
              </span>
            ))}
            {t.players}
          </p>
        </div>

        <div className="min-w-0">
          <Eyebrow>
            {t.hist} · {t.round(seq.length)}
          </Eyebrow>
          <Histogram round={round} t={t} />
          <div className="mt-2 grid grid-cols-2 gap-3" data-role="round">
            <Stat label={t.mean}>{fmt(round.mean)}</Stat>
            <Stat label={t.target(pText)}>{fmt(round.target)}</Stat>
            <Stat label={t.winning}>{fmt(round.winnerGuess)}</Stat>
            <Stat label={t.winner}>{t.kinds[KINDS[round.winnerKind]]}</Stat>
            {seq.length === 1 && (
              <Stat label={t.theory} wide>
                {fmt(theory.mean)}, {fmt(theory.target)}
              </Stat>
            )}
          </div>
          <label className="mt-3 flex flex-wrap items-center gap-2 text-sm font-medium text-slate-700">
            {t.own}
            <input
              type="text"
              inputMode="decimal"
              value={own}
              onChange={(e) => setOwn(e.target.value)}
              className="w-20 rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm font-mono text-slate-900 focus:outline-none focus:border-orange-500"
            />
          </label>
          <p className="mt-1 text-xs text-slate-600 leading-snug" data-role="rank">
            {validGuess ? t.rank(rankOf(round, guess), N + 1) : t.noRank}
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <Pill primary onClick={() => setPlay({ seed: play.seed + 1, rounds: 1 })}>
          {t.one}
        </Pill>
        <Pill onClick={() => setPlay({ ...play, rounds: play.rounds + 1 })}>{t.again}</Pill>
        <Pill onClick={() => setPlay({ ...play, rounds: play.rounds + 10 })}>{t.ten}</Pill>
        {many.running ? (
          <Pill onClick={many.cancel}>{t.stop}</Pill>
        ) : (
          <Pill
            onClick={() => {
              setManyKey(key)
              many.run(manyJob({ ...cfg, runs: DEFAULTS.runs }))
            }}
          >
            {t.many(DEFAULTS.runs)}
          </Pill>
        )}
        {many.running && <span className="self-center text-xs text-slate-500">{t.computing}</span>}
      </div>

      <div className="mt-5 grid gap-x-8 gap-y-6 lg:grid-cols-2 items-start">
        {seq.length > 1 && (
          <div className="min-w-0" data-role="rounds">
            <Eyebrow>{t.rounds}</Eyebrow>
            <Chart
              aria={t.roundsAria}
              x={{ min: 1, max: top, ticks: xTicks }}
              y={{ min: 0.1, max: 100, log: true, ticks: [0.1, 1, 10, 100], format: (v) => String(v) }}
              series={[
                { points: seq.map((r, i) => [i + 1, r.mean]), color: SLATE, dots: 2 },
                { points: seq.map((r, i) => [i + 1, r.target]), color: '#16a34a', dots: 2 },
                { points: [[1, 1], [top, 1]], color: GRID, dashed: true, width: 1 },
              ]}
            />
            <Legend items={[{ label: t.mean, color: SLATE }, { label: t.target(pText), color: '#16a34a' }]} />
            <p className="mt-1 text-sm text-slate-700">{firstBelow >= 0 ? t.below(firstBelow + 1) : t.notBelow(seq.length)}</p>
            <p className="mt-1 text-xs text-slate-500 leading-snug">{t.shrink}</p>
          </div>
        )}

        {showMany && (
          <div className="min-w-0" data-role="many">
            <Eyebrow>{t.manyTitle(many.data.done, many.data.runs)}</Eyebrow>
            <div className="mt-2 overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full border-collapse text-xs sm:text-sm">
                <thead>
                  <tr>
                    {t.cols.map((h) => (
                      <th key={h} className="bg-slate-50 border-b border-slate-200 px-2 sm:px-3 py-2 text-left align-bottom font-mono text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="font-mono tabular-nums text-slate-900">
                  {KINDS.map((kind, k) => (
                    <tr key={kind}>
                      <td className="border-b border-slate-100 px-2 sm:px-3 py-2 font-sans text-slate-700">
                        <span className="inline-block w-2.5 h-2.5 rounded-sm mr-1.5" style={{ background: KIND_COLOR[kind] }} />
                        {t.kinds[kind]}
                      </td>
                      <td className="border-b border-slate-100 px-2 sm:px-3 py-2">{many.data.counts[k].toLocaleString('en-US')}</td>
                      <td className="border-b border-slate-100 px-2 sm:px-3 py-2">{many.data.wins[k].toLocaleString('en-US')}</td>
                      <td className="border-b border-slate-100 px-2 sm:px-3 py-2">{many.data.counts[k] ? fmt(many.data.dist[k], 1) : '–'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-sm text-slate-700">{t.avg(fmt(many.data.mean), fmt(many.data.target))}</p>
          </div>
        )}
      </div>
    </div>
  )
}
