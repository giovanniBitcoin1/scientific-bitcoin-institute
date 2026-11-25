import { useEffect, useMemo, useState } from 'react'
import Slider from '../../Slider.jsx'
import useExperiment from '../../useExperiment.js'
import { Pill, Eyebrow, fmt, INK, SLATE, ORANGE_DARK } from '../../network/ui.jsx'
import Chart, { Legend } from '../../network/charts.jsx'
import { market, pricePath, endPoint, exactCurves, surveyJob, SURVEY_QMIN, DEFAULTS } from './lemons.js'

// Panel A, "The market that empties": N cars with qualities uniform on
// q_min–1; buyers pay b × the average quality on offer; owners of better cars
// withdraw. "Run" shows the rounds of one sample against the exact path of the
// continuous model; "Survey" the share of cars traded and of gains realised
// against b, exact curves and one sample of 10,000 cars per dot.

const SKY = '#0369a1'
const STEP_MS = 70 // "Run" replays one round every 70 ms
const COLORS = [INK, ORANGE_DARK, SKY, SLATE] // q_min = 0, 0.1, 0.2, 0.4

const T = {
  en: {
    qmin: 'q_min, the worst quality',
    b: 'b, what a buyer values over an owner',
    N: 'N cars',
    sample: (k) => `Sample no. ${k}`,
    newSample: 'New sample',
    run: 'Run',
    survey: 'Survey',
    stop: 'Stop',
    computing: 'Computing…',
    priceChart: 'price by round',
    offerChart: 'share of cars still on offer',
    round: 'round →',
    sampleLine: 'this sample',
    exactLine: 'continuous model, exact',
    endLine: 'its end point',
    result: (r, end) =>
      `${r.rounds === 1 ? '1 round' : `${r.rounds} rounds`} (prices computed, round 0 included). The price ends at ${end.price}; ${end.cars} of the cars are traded and ${end.gains} of the possible gains are made.`,
    exact: (e) => (e.whole ? `Exact model: the whole market trades, at ${e.price}.` : `Exact model: the price ends at ${e.price}, with ${e.cars} of the cars and ${e.gains} of the gains.`),
    closed: 'Nobody would sell at this price: the market closes.',
    replay: (k, p) => `Round ${k - 1}: price ${p}…`,
    surveyTitle: 'Against b: exact curves, and one sample of 10,000 cars per dot',
    cars: 'share of cars traded',
    gains: 'share of gains realised',
    bAxis: 'b →',
    q: (v) => `q_min = ${v}`,
    aria1: 'The price of each round for this sample, with the exact path',
    aria2: 'The share of cars still on offer in each round',
    aria3: 'Share of cars traded against b',
    aria4: 'Share of gains realised against b',
  },
  it: {
    qmin: 'q_min, la qualità peggiore',
    b: 'b, quanto un compratore valuta più di un proprietario',
    N: 'N auto',
    sample: (k) => `Campione n. ${k}`,
    newSample: 'Nuovo campione',
    run: 'Avvia',
    survey: 'Rassegna',
    stop: 'Ferma',
    computing: 'Calcolo in corso…',
    priceChart: 'prezzo per turno',
    offerChart: 'quota di auto ancora in vendita',
    round: 'turno →',
    sampleLine: 'questo campione',
    exactLine: 'modello continuo, esatto',
    endLine: 'il suo punto d’arrivo',
    result: (r, end) =>
      `${r.rounds === 1 ? '1 turno' : `${r.rounds} turni`} (prezzi calcolati, compreso il turno 0). Il prezzo finisce a ${end.price}; passa di mano ${end.cars} delle auto e si realizza ${end.gains} dei guadagni possibili.`,
    exact: (e) => (e.whole ? `Modello esatto: passa di mano tutto il mercato, a ${e.price}.` : `Modello esatto: il prezzo finisce a ${e.price}, con ${e.cars} delle auto e ${e.gains} dei guadagni.`),
    closed: 'A questo prezzo nessuno venderebbe: il mercato chiude.',
    replay: (k, p) => `Turno ${k - 1}: prezzo ${p}…`,
    surveyTitle: 'In funzione di b: curve esatte, e un campione di 10.000 auto per punto',
    cars: 'quota di auto vendute',
    gains: 'quota di guadagni realizzati',
    bAxis: 'b →',
    q: (v) => `q_min = ${v}`,
    aria1: 'Il prezzo di ogni turno per questo campione, con il cammino esatto',
    aria2: 'La quota di auto ancora in vendita in ogni turno',
    aria3: 'Quota di auto vendute in funzione di b',
    aria4: 'Quota di guadagni realizzati in funzione di b',
  },
}

export default function LemonsPanel({ lang = 'en' }) {
  const t = T[lang] || T.en
  const loc = (v, d = 3) => (lang === 'it' ? fmt(v, d).replace('.', ',') : fmt(v, d))
  const [qmin, setQmin] = useState(DEFAULTS.qmin)
  const [b, setB] = useState(DEFAULTS.b)
  const [N, setN] = useState(DEFAULTS.N)
  const [seed, setSeed] = useState(1)
  const [step, setStep] = useState(null) // rounds shown while "Run" replays; null: all
  const exp = useExperiment()

  const r = useMemo(() => market({ qmin, b, N, seed }), [qmin, b, N, seed])
  useEffect(() => setStep(null), [qmin, b, N, seed])
  useEffect(() => {
    if (step == null) return
    if (step >= r.rounds) {
      setStep(null)
      return
    }
    const id = setTimeout(() => setStep(step + 1), STEP_MS)
    return () => clearTimeout(id)
  }, [step, r])
  const shown = step == null ? r.rounds : step
  const e = endPoint(qmin, b)
  const exactPath = useMemo(() => (r ? pricePath(qmin, b, r.rounds) : []), [r, qmin, b])
  const curves = useMemo(() => SURVEY_QMIN.map((q) => exactCurves(q)), [])
  const d = exp.data

  const R = r ? r.rounds : 1
  const yMax = Math.max(1, Math.ceil(((b * (qmin + 1)) / 2) * 5) / 5)
  const xTicks = (() => {
    const s = R <= 12 ? 2 : R <= 30 ? 5 : 10
    const out = []
    for (let k = 0; k < R; k += s) out.push(k)
    return out
  })()
  const exactOffer = exactPath.map((p, k) => [k, k === 0 ? 1 : Math.max(0, Math.min(1, (Math.min(exactPath[k - 1], 1) - qmin) / (1 - qmin)))])

  return (
    <div>
      <div className="grid gap-x-8 gap-y-3 sm:grid-cols-3 max-w-3xl">
        <Slider label={t.qmin} min={0} max={0.6} step={0.05} value={qmin} onChange={setQmin} format={(v) => loc(v, 2)} />
        <Slider label={t.b} min={1.05} max={2} step={0.05} value={b} onChange={setB} format={(v) => loc(v, 2)} />
        <Slider label={t.N} min={100} max={10000} step={100} value={N} onChange={setN} format={(v) => v.toLocaleString(lang === 'it' ? 'it-IT' : 'en-US')} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Pill primary onClick={() => setStep(1)} disabled={step != null}>
          {t.run}
        </Pill>
        <Pill onClick={() => setSeed(seed + 1)}>{t.newSample}</Pill>
        <span className="text-xs text-slate-500 font-mono">{t.sample(seed)}</span>
      </div>

      {r && (
        <div className="mt-5" data-role="lemons-run" data-done={step == null || undefined}>
          <div className="grid gap-6 md:grid-cols-2 items-start">
            <div className="min-w-0">
              <Eyebrow>{t.priceChart}</Eyebrow>
              <Chart
                x={{ min: 0, max: Math.max(1, R - 1), ticks: xTicks, label: t.round }}
                y={{ min: 0, max: yMax, ticks: [0, yMax / 4, yMax / 2, (3 * yMax) / 4, yMax], format: (v) => loc(v, 2) }}
                series={[
                  { points: exactPath.map((p, k) => [k, p]), color: SLATE, width: 1.5, dashed: true },
                  ...(e.whole ? [] : [{ points: [[0, e.price], [Math.max(1, R - 1), e.price]], color: ORANGE_DARK, width: 1, dashed: true }]),
                  { points: r.prices.slice(0, shown).map((p, k) => [k, p]), color: INK, width: 1.5, dots: R <= 40 ? 2 : false },
                ]}
                height={180}
                aria={t.aria1}
              />
            </div>
            <div className="min-w-0">
              <Eyebrow>{t.offerChart}</Eyebrow>
              <Chart
                x={{ min: 0, max: Math.max(1, R - 1), ticks: xTicks, label: t.round }}
                y={{ min: 0, max: 1, ticks: [0, 0.25, 0.5, 0.75, 1], format: (v) => loc(v, 2) }}
                series={[
                  { points: exactOffer, color: SLATE, width: 1.5, dashed: true },
                  { points: r.counts.slice(0, shown).map((c, k) => [k, c / N]), color: INK, width: 1.5, dots: R <= 40 ? 2 : false },
                ]}
                height={180}
                aria={t.aria2}
              />
            </div>
          </div>
          <Legend
            items={[
              { label: t.sampleLine, color: INK },
              { label: t.exactLine, color: SLATE, dashed: true },
              ...(e.whole ? [] : [{ label: t.endLine, color: ORANGE_DARK, dashed: true }]),
            ]}
          />
          <p className="mt-3 text-sm text-slate-700 leading-snug max-w-3xl" data-role="lemons-result">
            {step != null ? t.replay(step, loc(r.prices[step - 1])) : r.traded === 0 ? t.closed : t.result(r, { price: loc(r.price), cars: loc(r.cars), gains: loc(r.gains) })}
          </p>
          <p className="mt-1 text-sm text-slate-700 leading-snug max-w-3xl" data-role="lemons-exact">
            {t.exact({ whole: e.whole, price: loc(e.price), cars: loc(e.cars), gains: loc(e.gains) })}
          </p>
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {exp.running ? (
          <Pill onClick={exp.cancel}>{t.stop}</Pill>
        ) : (
          <Pill primary onClick={() => exp.run(surveyJob())}>
            {t.survey}
          </Pill>
        )}
        {exp.running && <span className="text-xs text-slate-500">{t.computing}</span>}
      </div>
      {d && (
        <div className="mt-4" data-role="lemons-survey" data-done={!exp.running || undefined}>
          <Eyebrow>{t.surveyTitle}</Eyebrow>
          <div className="mt-2 grid gap-6 md:grid-cols-2 items-start">
            {['cars', 'gains'].map((key) => (
              <div key={key} className="min-w-0">
                <p className="text-xs text-slate-600">{t[key]}</p>
                <Chart
                  x={{ min: 1.05, max: 2, ticks: [1.2, 1.4, 1.6, 1.8, 2], label: t.bAxis, format: (v) => loc(v, 1) }}
                  y={{ min: 0, max: 1, ticks: [0, 0.25, 0.5, 0.75, 1], format: (v) => loc(v, 2) }}
                  series={[
                    ...curves.map((c, i) => ({ points: c[key], color: COLORS[i], width: 1.5 })),
                    ...d.dots.map((dots, i) => ({ points: dots.map((x) => [x.b, x[key]]), color: COLORS[i], line: false, dots: 2.6 })),
                  ]}
                  height={180}
                  aria={key === 'cars' ? t.aria3 : t.aria4}
                />
              </div>
            ))}
          </div>
          <Legend items={SURVEY_QMIN.map((q, i) => ({ label: t.q(loc(q, 1)), color: COLORS[i] }))} />
        </div>
      )}
    </div>
  )
}
