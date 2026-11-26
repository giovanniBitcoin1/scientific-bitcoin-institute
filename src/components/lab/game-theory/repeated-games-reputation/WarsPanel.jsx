import { useMemo, useState } from 'react'
import Slider from '../../Slider.jsx'
import { Pill, Stat, INK, SLATE, ORANGE_DARK } from '../../network/ui.jsx'
import Chart, { Legend } from '../../network/charts.jsx'
import { evaluate, bestRule, leastDeltaCurve, sample, NOISELESS, DEFAULTS, GRID, MEAN_QUIET, MEAN_WAR } from './greenporter.js'
import { num } from './FigurePatience.jsx'

// Panel B, "Price wars without cheating", after Green and Porter (1984),
// simplified: the price is 10 − Q plus normal noise of spread σ; a quiet
// round whose price falls below the trigger p̄ starts a war (Cournot) of L
// rounds. Nobody cheats in the sample, and still wars break out. The small
// chart (least δ against σ) does not depend on the sliders: it is computed
// once, and only its σ marker moves. Sliders, pills and SVG only.

const ROUNDS = 200
const SKY = '#0369a1'
const WAR = '#fed7aa' // orange-200
const LD = leastDeltaCurve(30) // about 10 ms, once per page

const T = {
  en: {
    sigma: 'σ, the noise in the price',
    trigger: 'p̄, the trigger price',
    L: 'L, the length of a war',
    delta: 'δ, patience',
    newSample: 'New sample',
    best: 'Best rule',
    p0: 'False alarm p0',
    p1: 'Cheat caught p1',
    margin: 'Margin',
    verdict: { yes: 'cheating does not pay', no: 'cheating pays' },
    value: 'Value per round',
    peace: 'Long-run share of peace',
    longRun: 'Long-run profit per round',
    sampleWars: (w, q) => `In this sample: ${w} war${w === 1 ? '' : 's'}, quiet share ${q}.`,
    seed: (s) => `Sample no. ${s} (seed ${s})`,
    chart: '200 rounds of the price, nobody cheating',
    axis: 'round →',
    legend: ['price', 'trigger p̄', 'means 5.5 (quiet) and 4 (war)', 'war'],
    how: 'How it is computed: p0 = Φ((p̄ − 5.5)/σ), p1 = Φ((p̄ − 4.375)/σ); x = (10.125 − 9)/((1 − δ) + δ p0 (1 − δ^L)); margin = δ (p1 − p0)(1 − δ^L) x − (11.390625 − 10.125), and cheating does not pay when it is ≥ 0 (one cheat, then the rule: the one-shot deviation principle); value = 10.125 − δ p0 (1 − δ^L) x; long-run share of peace = 1/(1 + p0 L).',
    chart2: 'The least δ for which some trigger works (L = 30)',
    axis2: 'σ →',
    noiseless: '9/17 without noise',
    found: (r, f) => `Best rule on the slider grid: p̄ = ${f(r.trigger, 2)}, L = ${r.L}; value ${f(r.value)} per round, peace ${f(r.peace)} of the time.`,
    noneFound: 'No rule on the slider grid stops cheating at this σ and δ.',
    aria: 'The price over 200 rounds, war rounds shaded, with the trigger and the two mean prices',
    aria2: 'The least patience for which some trigger stops cheating, against the noise σ',
  },
  it: {
    sigma: 'σ, il rumore nel prezzo',
    trigger: 'p̄, il prezzo soglia',
    L: 'L, la durata di una guerra',
    delta: 'δ, la pazienza',
    newSample: 'Nuovo campione',
    best: 'Regola migliore',
    p0: 'Falso allarme p0',
    p1: 'Imbroglio scoperto p1',
    margin: 'Margine',
    verdict: { yes: 'imbrogliare non conviene', no: 'imbrogliare conviene' },
    value: 'Valore per turno',
    peace: 'Quota di pace nel lungo periodo',
    longRun: 'Profitto per turno nel lungo periodo',
    sampleWars: (w, q) => `In questo campione: ${w} ${w === 1 ? 'guerra' : 'guerre'}, quota di turni tranquilli ${q}.`,
    seed: (s) => `Campione n. ${s} (seme ${s})`,
    chart: '200 turni del prezzo, senza imbrogli',
    axis: 'turno →',
    legend: ['prezzo', 'soglia p̄', 'medie 5,5 (pace) e 4 (guerra)', 'guerra'],
    how: 'Come si calcola: p0 = Φ((p̄ − 5,5)/σ), p1 = Φ((p̄ − 4,375)/σ); x = (10,125 − 9)/((1 − δ) + δ p0 (1 − δ^L)); margine = δ (p1 − p0)(1 − δ^L) x − (11,390625 − 10,125), e imbrogliare non conviene quando è ≥ 0 (un imbroglio, poi la regola: il one-shot deviation principle); valore = 10,125 − δ p0 (1 − δ^L) x; quota di pace nel lungo periodo = 1/(1 + p0 L).',
    chart2: 'Il δ più piccolo per cui qualche soglia funziona (L = 30)',
    axis2: 'σ →',
    noiseless: '9/17 senza rumore',
    found: (r, f) => `Regola migliore sulla griglia dei cursori: p̄ = ${f(r.trigger, 2)}, L = ${r.L}; valore ${f(r.value)} per turno, pace per una quota ${f(r.peace)} del tempo.`,
    noneFound: 'Nessuna regola sulla griglia dei cursori ferma gli imbrogli con questi σ e δ.',
    aria: 'Il prezzo su 200 turni, con i turni di guerra ombreggiati, la soglia e i due prezzi medi',
    aria2: 'La pazienza minima per cui qualche soglia ferma gli imbrogli, in funzione del rumore σ',
  },
}

export default function WarsPanel({ lang = 'en' }) {
  const t = T[lang] || T.en
  const f = (v, d = 4) => num(v, lang, d)
  const [sigma, setSigma] = useState(DEFAULTS.sigma)
  const [trigger, setTrigger] = useState(DEFAULTS.trigger)
  const [L, setL] = useState(DEFAULTS.L)
  const [delta, setDelta] = useState(DEFAULTS.delta)
  const [seed, setSeed] = useState(1)
  const [found, setFound] = useState(null)
  const e = evaluate({ sigma, trigger, L, delta })
  const s = useMemo(() => sample({ sigma, trigger, L }, ROUNDS, seed), [sigma, trigger, L, seed])
  const prices = Array.from(s.prices, (p, i) => [i, p])
  const runBest = () => {
    const r = bestRule(sigma, delta)
    if (r) {
      setTrigger(r.trigger)
      setL(r.L)
    }
    setFound({ r, sigma, delta })
  }
  const foundShown = found && found.sigma === sigma && found.delta === delta ? found : null

  return (
    <div>
      <div className="grid gap-x-8 gap-y-3 sm:grid-cols-2 max-w-3xl">
        <Slider label={t.sigma} min={GRID.sigma.min} max={GRID.sigma.max} step={GRID.sigma.step} value={sigma} onChange={setSigma} format={(v) => f(v, 2)} />
        <Slider label={t.trigger} min={GRID.trigger.min} max={GRID.trigger.max} step={GRID.trigger.step} value={trigger} onChange={setTrigger} format={(v) => f(v, 2)} />
        <Slider label={t.L} min={GRID.L.min} max={GRID.L.max} step={1} value={L} onChange={setL} />
        <Slider label={t.delta} min={GRID.delta.min} max={GRID.delta.max} step={GRID.delta.step} value={delta} onChange={setDelta} format={(v) => f(v, 2)} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Pill primary onClick={() => setSeed(seed + 1)} data-role="wars-new">
          {t.newSample}
        </Pill>
        <Pill onClick={runBest} data-role="wars-best">
          {t.best}
        </Pill>
        <span className="text-xs text-slate-500 font-mono" data-role="wars-seed">
          {t.seed(seed)}
        </span>
      </div>
      {foundShown && (
        <p className="mt-2 text-sm text-slate-700 leading-snug max-w-3xl" data-role="wars-found">
          {foundShown.r ? t.found(foundShown.r, f) : t.noneFound}
        </p>
      )}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 max-w-3xl" data-role="wars-readout">
        <Stat label={t.p0}>
          <span data-value="p0">{f(e.p0)}</span>
        </Stat>
        <Stat label={t.p1}>
          <span data-value="p1">{f(e.p1)}</span>
        </Stat>
        <Stat label={t.margin} wide>
          <span data-value="margin">{f(e.margin)}</span>
          <span className={`ml-2 font-sans text-xs ${e.works ? 'text-slate-600' : 'text-orange-700'}`} data-value="verdict">
            {e.works ? t.verdict.yes : t.verdict.no}
          </span>
        </Stat>
        <Stat label={t.value}>
          <span data-value="value">{f(e.value)}</span>
        </Stat>
        <Stat label={t.peace}>
          <span data-value="peace">{f(e.peace)}</span>
        </Stat>
        <Stat label={t.longRun} wide>
          <span data-value="longRun">{f(e.longRun)}</span>
        </Stat>
      </div>
      <p className="mt-2 text-xs text-slate-600 leading-snug max-w-3xl">{t.how}</p>

      <div className="mt-4 max-w-xl" data-role="wars-chart">
        <p className="text-sm font-medium text-slate-700">{t.chart}</p>
        <Chart
          x={{ min: 0, max: ROUNDS - 1, ticks: [0, 50, 100, 150, 199], label: t.axis }}
          y={{ min: 1.5, max: 8, ticks: [2, 3, 4, 5, 6, 7, 8], format: (v) => String(v) }}
          series={[
            { points: [[0, MEAN_QUIET], [ROUNDS - 1, MEAN_QUIET]], color: SLATE, width: 1, dashed: true, opacity: 0.5 },
            { points: [[0, MEAN_WAR], [ROUNDS - 1, MEAN_WAR]], color: SLATE, width: 1, dashed: true, opacity: 0.5 },
            { points: [[0, trigger], [ROUNDS - 1, trigger]], color: ORANGE_DARK, width: 1.25 },
            { points: prices, color: INK, width: 0.9 },
          ]}
          height={170}
          aria={t.aria}
        >
          {({ sx, PAD, H }) => (
            <g>
              {Array.from(s.war, (w, i) =>
                w ? <rect key={i} x={sx(i - 0.5)} y={PAD.top} width={Math.max(0.6, sx(1) - sx(0))} height={H - PAD.top - PAD.bottom} fill={WAR} opacity="0.7" data-war={i} /> : null,
              )}
            </g>
          )}
        </Chart>
        <Legend
          items={[
            { label: t.legend[0], color: INK },
            { label: t.legend[1], color: ORANGE_DARK },
            { label: t.legend[2], color: SLATE, dashed: true },
            { label: t.legend[3], color: WAR, bar: true },
          ]}
        />
        <p className="mt-1 text-sm text-slate-700" data-role="wars-sample">
          {t.sampleWars(s.wars, f(s.quiet, 3))}
        </p>
      </div>

      <div className="mt-4 max-w-sm" data-role="wars-least">
        <p className="text-sm font-medium text-slate-700">{t.chart2}</p>
        <Chart
          x={{ min: 0, max: 1.5, ticks: [0, 0.5, 1, 1.5], label: t.axis2, format: (v) => f(v, 1) }}
          y={{ min: 0.5, max: 1, ticks: [0.5, 0.6, 0.7, 0.8, 0.9, 1], format: (v) => f(v, 1) }}
          series={[
            { points: [[0, NOISELESS], [1.5, NOISELESS]], color: SLATE, width: 1, dashed: true, opacity: 0.6 },
            { points: LD, color: INK, width: 1.75, dots: 1.4 },
          ]}
          marks={[{ x: sigma, color: SKY, label: 'σ' }]}
          height={150}
          aria={t.aria2}
        />
        <Legend items={[{ label: t.noiseless, color: SLATE, dashed: true }]} />
      </div>
    </div>
  )
}
