import { useMemo, useState } from 'react'
import Slider from '../../Slider.jsx'
import useExperiment from '../../useExperiment.js'
import { ORANGE_DARK, INK, SLATE, Pill, Eyebrow, Stat, fmt } from '../../network/ui.jsx'
import Chart, { Legend } from '../../network/charts.jsx'
import { STAG, DEFAULTS, RUN_SEED, qStar, riskDominant, clampPayoffs, tippingPoint, runOnce, scanJob } from './conventions.js'

// Panel B: which convention? A population plays the stag hunt of Figure F1.
// One player at a time looks at k others and hunts the stag only if enough of
// them do. "Run" shows the share of stag hunters sweep after sweep; "Scan the
// starting share" measures, for each starting share, how often the population
// ends with everyone hunting the stag.

const SKY = '#0369a1'

const T = {
  en: {
    n: 'Population N',
    k: 'Sample size k',
    x0: 'Starting share of stag hunters x₀',
    a: 'Both hunt the stag: a',
    c: 'Hare, the other hunts the stag: c',
    d: 'Both hunt hare: d',
    q: 'q* of the game',
    tip: 'Tipping point of the sampled rule',
    need: (s, k) => `Stag hunters needed in a sample of ${k}`,
    needMore: (s) => `${s} or more`,
    needTie: (s) => `more than ${s}; with exactly ${s} the player does not change`,
    risk: 'Risk dominant',
    riskNames: { stag: 'stag', hare: 'hare', neither: 'neither' },
    run: 'Run',
    runTitle: (n) => `Run ${n}: share of stag hunters, sweep after sweep`,
    ends: {
      stag: (s) => `After ${s} ${s === 1 ? 'sweep' : 'sweeps'} everyone hunts the stag.`,
      hare: (s) => `After ${s} ${s === 1 ? 'sweep' : 'sweeps'} everyone hunts hare.`,
      open: (s) => `After ${s} sweeps the population is still divided.`,
    },
    sweep: 'sweep',
    scan: 'Scan the starting share',
    stop: 'Stop',
    computing: 'Computing…',
    scanTitle: (runs) => `Chance of ending with everyone hunting the stag, ${runs} runs per starting share`,
    cols: ['x₀', 'Everyone hunts the stag', 'Sweeps, mean'],
    legendChance: 'chance that everyone ends up hunting the stag',
    legendQ: 'q*',
    legendTip: 'tipping point',
    share: 'share of stag hunters',
    runAria: 'Share of stag hunters after each sweep, with q* and the tipping point as horizontal lines',
    scanAria: 'Chance of ending with everyone hunting the stag against the starting share, with q* and the tipping point marked',
  },
  it: {
    n: 'Popolazione N',
    k: 'Ampiezza del campione k',
    x0: 'Quota iniziale di cacciatori di cervo x₀',
    a: 'Entrambi al cervo: a',
    c: "Lepre, l'altro va al cervo: c",
    d: 'Entrambi alla lepre: d',
    q: 'q* del gioco',
    tip: 'Punto di svolta della regola a campione',
    need: (s, k) => `Cacciatori di cervo necessari in un campione di ${k}`,
    needMore: (s) => `${s} o più`,
    needTie: (s) => `più di ${s}; con esattamente ${s} il giocatore non cambia`,
    risk: 'Dominante nel rischio',
    riskNames: { stag: 'cervo', hare: 'lepre', neither: 'nessuno' },
    run: 'Avvia',
    runTitle: (n) => `Prova ${n}: quota di cacciatori di cervo, passata dopo passata`,
    ends: {
      stag: (s) => `Dopo ${s} ${s === 1 ? 'passata' : 'passate'} tutti cacciano il cervo.`,
      hare: (s) => `Dopo ${s} ${s === 1 ? 'passata' : 'passate'} tutti cacciano la lepre.`,
      open: (s) => `Dopo ${s} passate la popolazione è ancora divisa.`,
    },
    sweep: 'passata',
    scan: 'Esplora la quota iniziale',
    stop: 'Ferma',
    computing: 'Calcolo in corso…',
    scanTitle: (runs) => `Probabilità di finire con tutti al cervo, ${runs} prove per quota iniziale`,
    cols: ['x₀', 'Tutti al cervo', 'Passate, media'],
    legendChance: 'probabilità che tutti finiscano al cervo',
    legendQ: 'q*',
    legendTip: 'punto di svolta',
    share: 'quota di cacciatori di cervo',
    runAria: 'Quota di cacciatori di cervo dopo ogni passata, con q* e il punto di svolta come rette orizzontali',
    scanAria: 'Probabilità di finire con tutti al cervo in funzione della quota iniziale, con q* e il punto di svolta',
  },
}

const show = (v) => (Number.isInteger(v) ? String(v) : v.toFixed(1))

export default function ConventionsPanel({ lang = 'en' }) {
  const t = T[lang] || T.en
  const [payoffs, setPayoffs] = useState(STAG)
  const [N, setN] = useState(DEFAULTS.N)
  const [k, setK] = useState(DEFAULTS.k)
  const [x0, setX0] = useState(DEFAULTS.x0)
  const [runIndex, setRunIndex] = useState(0)
  const [scanKey, setScanKey] = useState(null)
  const exp = useExperiment()

  const kk = Math.min(k, N - 1)
  const q = qStar(payoffs)
  const tip = tippingPoint(q, kk)
  const key = JSON.stringify([payoffs, N, k])
  const run = useMemo(() => runOnce({ payoffs, N, k, x0 }, RUN_SEED + runIndex), [payoffs, N, k, x0, runIndex])

  // A change of setting goes back to the first run of the page's seed.
  const change = (fn) => (v) => {
    fn(v)
    setRunIndex(0)
  }
  const setPay = (name) => change((v) => setPayoffs((old) => clampPayoffs(old, name, v)))

  const threshold = q * kk
  const tie = Math.abs(threshold - Math.round(threshold)) < 1e-9
  const need = tie ? t.needTie(Math.round(threshold)) : t.needMore(Math.floor(threshold) + 1)

  const last = run.series.length - 1
  const top = Math.max(10, last)
  const xTicks = top <= 12 ? Array.from({ length: Math.floor(top / 2) + 1 }, (_, i) => 2 * i) : [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(top * f))
  const showScan = exp.data && scanKey === key
  const dec = lang === 'it' ? (s) => s.replace('.', ',') : (s) => s

  return (
    <div>
      <div className="grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
        <Slider label={t.n} min={50} max={1000} step={50} value={N} onChange={change(setN)} format={(v) => v.toLocaleString('en-US')} />
        <Slider label={t.k} min={5} max={50} step={5} value={k} onChange={change(setK)} />
        <Slider label={t.x0} min={0} max={1} step={0.05} value={x0} onChange={change(setX0)} format={(v) => v.toFixed(2)} />
        <Slider label={t.a} min={3.5} max={8} step={0.5} value={payoffs.a} onChange={setPay('a')} format={show} />
        <Slider label={t.c} min={0.5} max={7.5} step={0.5} value={payoffs.c} onChange={setPay('c')} format={show} />
        <Slider label={t.d} min={0.5} max={7.5} step={0.5} value={payoffs.d} onChange={setPay('d')} format={show} />
      </div>

      <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-3" data-role="conv-readout">
        <Stat label={t.q}>{fmt(q, 3)}</Stat>
        <Stat label={t.tip}>{fmt(tip, 3)}</Stat>
        <Stat label={t.need(null, kk)}>
          <span className="font-sans">{need}</span>
        </Stat>
        <Stat label={t.risk}>
          <span className="font-sans">{t.riskNames[riskDominant(payoffs)]}</span>
        </Stat>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <Pill primary onClick={() => setRunIndex(runIndex + 1)}>
          {t.run}
        </Pill>
        {exp.running ? (
          <Pill onClick={exp.cancel}>{t.stop}</Pill>
        ) : (
          <Pill
            onClick={() => {
              setScanKey(key)
              exp.run(scanJob({ payoffs, N, k }))
            }}
          >
            {t.scan}
          </Pill>
        )}
        {exp.running && <span className="text-xs text-slate-500">{t.computing}</span>}
      </div>

      <div className="mt-4 grid gap-x-8 gap-y-6 lg:grid-cols-2 items-start">
        <div className="min-w-0" data-role="conv-run">
          <Eyebrow>{t.runTitle(runIndex + 1)}</Eyebrow>
          <Chart
            aria={t.runAria}
            height={190}
            x={{ min: 0, max: top, ticks: xTicks, label: t.sweep }}
            y={{ min: 0, max: 1, ticks: [0, 0.25, 0.5, 0.75, 1] }}
            series={[
              { points: [[0, q], [top, q]], color: INK, dashed: true, width: 1 },
              ...(tip != null ? [{ points: [[0, tip], [top, tip]], color: SKY, dashed: true, width: 1 }] : []),
              { points: run.series.map((v, i) => [i, v]), color: ORANGE_DARK, dots: 2 },
            ]}
          />
          <Legend items={[{ label: t.share, color: ORANGE_DARK }, { label: t.legendQ, color: INK, dashed: true }, { label: t.legendTip, color: SKY, dashed: true }]} />
          <p className="mt-1 text-sm text-slate-700">{t.ends[run.end](run.sweeps)}</p>
        </div>

        {showScan && exp.data.length > 0 && (
          <div className="min-w-0" data-role="conv-scan">
            <Eyebrow>{t.scanTitle(DEFAULTS.runs)}</Eyebrow>
            <Chart
              aria={t.scanAria}
              height={190}
              x={{ min: 0, max: 1, ticks: [0, 0.25, 0.5, 0.75, 1], label: 'x₀' }}
              y={{ min: 0, max: 1, ticks: [0, 0.25, 0.5, 0.75, 1] }}
              marks={[
                { x: q, color: INK, dashed: true },
                ...(tip != null ? [{ x: tip, color: SKY, dashed: true }] : []),
              ]}
              series={[{ points: exp.data.map((p) => [p.x0, p.stag]), color: ORANGE_DARK, dots: true }]}
            />
            <Legend items={[{ label: t.legendChance, color: ORANGE_DARK }, { label: `${t.legendQ} = ${dec(q.toFixed(3))}`, color: INK, dashed: true }, { label: `${t.legendTip} ${tip != null ? dec(tip.toFixed(3)) : '–'}`, color: SKY, dashed: true }]} />
            <div className="mt-3 max-h-56 overflow-y-auto overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr>
                    {t.cols.map((h) => (
                      <th key={h} className="sticky top-0 bg-slate-50 border-b border-slate-200 px-2 py-1.5 text-left align-bottom font-mono text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="font-mono tabular-nums text-slate-900">
                  {exp.data.map((p) => (
                    <tr key={p.x0} style={p.stag > 0 && p.stag < 1 ? { background: '#fff7ed' } : undefined}>
                      <td className="border-b border-slate-100 px-2 py-1">{p.x0.toFixed(2)}</td>
                      <td className="border-b border-slate-100 px-2 py-1">{fmt(p.stag, 3)}</td>
                      <td className="border-b border-slate-100 px-2 py-1">{fmt(p.sweeps, 1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      <p className="mt-3 text-xs" style={{ color: SLATE }}>
        {lang === 'it'
          ? 'Una passata sono N revisioni: un giocatore scelto a caso guarda k altri, scelti a caso, e conta i cacciatori di cervo. Una prova finisce quando tutti fanno la stessa cosa, o dopo 300 passate.'
          : 'A sweep is N revisions: a player chosen at random looks at k others, chosen at random, and counts the stag hunters. A run ends when everyone does the same, or after 300 sweeps.'}
      </p>
    </div>
  )
}
