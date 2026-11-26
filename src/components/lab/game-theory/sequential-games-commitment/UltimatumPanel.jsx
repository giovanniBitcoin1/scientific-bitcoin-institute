import { useMemo, useState } from 'react'
import Slider from '../../Slider.jsx'
import useExperiment from '../../useExperiment.js'
import { Pill, Eyebrow, fmt, INK, SLATE, ORANGE_DARK } from '../../network/ui.jsx'
import Chart, { Legend } from '../../network/charts.jsx'
import { population, acceptShare, expectedMoney, closedMoney, closedBest, bestOffer, playJob, OFFERS, DEFAULT_N, DEFAULT_M, PROPOSERS, TRIES } from './ultimatum.js'

// Panel C: the ultimatum game against a population of N responders, each
// refusing any offer below its own threshold, the thresholds uniform between
// 0 and m. The proposer's expected money against the offer, with the best
// offer marked; "Play" lets 1,000 proposers try offers at random and shows
// the mean payoff of each offer, in steps of 0.05.

const T = {
  en: {
    N: 'N, responders',
    m: 'm, the largest threshold',
    x: 'An offer x',
    chartX: 'offer x, share of the pie →',
    curve: 'against this population',
    closed: '(1 − x) x/m, thresholds exactly uniform',
    bars: '“Play”: mean payoff of each offer',
    bestMark: 'best',
    closedLine: (m, best, money) =>
      `Against thresholds uniform on 0–m the offer x is accepted with chance x/m, so the proposer expects (1 − x) x/m. When m is at most 1/2 the best offer is m itself: here ${m}, worth ${money}${best}.`,
    popLine: (o, v) => `Against these responders the best offer is ${o}, worth ${v} on average.`,
    offerLine: (x, acc, v, c) => `An offer of ${x} is accepted by ${acc} of this population and earns ${v} on average (${c} with thresholds exactly uniform).`,
    play: 'Play',
    stop: 'Stop',
    computing: 'Computing…',
    playLine: (best, v, own, n) =>
      `${PROPOSERS.toLocaleString('en-US')} proposers, ${TRIES} offers each at random: the offer with the highest mean payoff is ${best} (${v}). Only ${own} of the ${n} proposers found it from their own tries alone.`,
    aria: 'The proposer’s expected money against the offer',
  },
  it: {
    N: 'N, rispondenti',
    m: 'm, la soglia più alta',
    x: 'Un’offerta x',
    chartX: 'offerta x, quota della torta →',
    curve: 'contro questa popolazione',
    closed: '(1 − x) x/m, soglie esattamente uniformi',
    bars: '«Gioca»: payoff medio di ogni offerta',
    bestMark: 'migliore',
    closedLine: (m, best, money) =>
      `Contro soglie uniformi tra 0 e m l’offerta x viene accettata con probabilità x/m, e il proponente si aspetta (1 − x) x/m. Quando m non supera 1/2 l’offerta migliore è m stesso: qui ${m}, che vale ${money}${best}.`,
    popLine: (o, v) => `Contro questi rispondenti l’offerta migliore è ${o}, che vale in media ${v}.`,
    offerLine: (x, acc, v, c) => `Un’offerta di ${x} viene accettata dal ${acc} di questa popolazione e rende in media ${v} (${c} con soglie esattamente uniformi).`,
    play: 'Gioca',
    stop: 'Ferma',
    computing: 'Calcolo in corso…',
    playLine: (best, v, own, n) =>
      `${PROPOSERS.toLocaleString('it-IT')} proponenti, ${TRIES} offerte a caso ciascuno: l’offerta con il payoff medio più alto è ${best} (${v}). Solo ${own} dei ${n} proponenti l’hanno trovata basandosi solo sui propri tentativi.`,
    aria: 'Il denaro atteso del proponente in funzione dell’offerta',
  },
}

export default function UltimatumPanel({ lang = 'en' }) {
  const t = T[lang] || T.en
  const [N, setN] = useState(DEFAULT_N)
  const [m, setM] = useState(DEFAULT_M)
  const [x, setX] = useState(0.1)
  const [playKey, setPlayKey] = useState(null)
  const exp = useExperiment()
  const loc = (v, d = 3) => (lang === 'it' ? fmt(v, d).replace('.', ',') : fmt(v, d))
  const pc = (v) => `${loc(100 * v, 1)}%`

  const pop = useMemo(() => population(N, m), [N, m])
  const best = useMemo(() => bestOffer(pop), [pop])
  const cb = closedBest(m)
  const curve = useMemo(() => {
    const pts = []
    for (let k = 0; k <= 400; k++) pts.push([k / 400, expectedMoney(pop, k / 400)])
    return pts
  }, [pop])
  const closed = Array.from({ length: 401 }, (_, k) => [k / 400, closedMoney(k / 400, m)])
  const key = `${N}|${m}`
  const shown = exp.data && playKey === key ? exp.data : null

  return (
    <div>
      <div className="grid gap-x-8 gap-y-3 sm:grid-cols-3 max-w-3xl">
        <Slider label={t.N} min={100} max={5000} step={100} value={N} onChange={setN} format={(v) => v.toLocaleString('en-US')} />
        <Slider label={t.m} min={0} max={0.5} step={0.01} value={m} onChange={setM} format={(v) => loc(v, 2)} />
        <Slider label={t.x} min={0} max={1} step={0.05} value={x} onChange={setX} format={(v) => loc(v, 2)} />
      </div>
      <div className="mt-5 grid gap-6 md:grid-cols-2 items-start">
        <div className="min-w-0">
          <Chart
            x={{ min: 0, max: 1, ticks: [0, 0.2, 0.4, 0.6, 0.8, 1], label: t.chartX, format: (v) => loc(v, 1) }}
            y={{ min: 0, max: 1, ticks: [0, 0.25, 0.5, 0.75, 1], format: (v) => loc(v, 2) }}
            series={[
              { points: closed, color: SLATE, width: 1.5, dashed: true },
              { points: curve, color: INK, width: 2 },
            ]}
            marks={[{ x: best.offer, color: ORANGE_DARK, label: t.bestMark }]}
            height={190}
            aria={t.aria}
          >
            {({ sx, sy }) =>
              shown && (
                <g data-role="ultimatum-bars">
                  {OFFERS.map((o, i) => (
                    <rect key={o} x={sx(o) - 3} y={sy(shown.mean[i])} width="6" height={Math.max(0, sy(0) - sy(shown.mean[i]))} fill={ORANGE_DARK} opacity="0.45" />
                  ))}
                </g>
              )
            }
          </Chart>
          <Legend
            items={[
              { label: t.curve, color: INK },
              { label: t.closed, color: SLATE, dashed: true },
              ...(shown ? [{ label: t.bars, color: ORANGE_DARK, bar: true, opacity: 0.45 }] : []),
            ]}
          />
        </div>
        <div className="min-w-0 space-y-2 text-sm text-slate-700 leading-snug">
          <p data-role="ultimatum-closed">{t.closedLine(loc(m, 2), '', loc(cb.money, 2))}</p>
          <p data-role="ultimatum-pop">{t.popLine(loc(best.offer), loc(best.money))}</p>
          <p data-role="ultimatum-offer">{t.offerLine(loc(x, 2), pc(acceptShare(pop, x)), loc(expectedMoney(pop, x)), loc(closedMoney(x, m)))}</p>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {exp.running ? (
              <Pill onClick={exp.cancel}>{t.stop}</Pill>
            ) : (
              <Pill
                primary
                onClick={() => {
                  setPlayKey(key)
                  exp.run(playJob({ pop }))
                }}
              >
                {t.play}
              </Pill>
            )}
            {exp.running && <span className="text-xs text-slate-500">{t.computing}</span>}
          </div>
          {shown && !exp.running && (
            <div data-role="ultimatum-play">
              <Eyebrow>{t.bars}</Eyebrow>
              <p className="mt-1">{t.playLine(loc(shown.best, 2), loc(shown.bestMoney), shown.own[OFFERS.indexOf(shown.best)], shown.done.toLocaleString(lang === 'it' ? 'it-IT' : 'en-US'))}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
