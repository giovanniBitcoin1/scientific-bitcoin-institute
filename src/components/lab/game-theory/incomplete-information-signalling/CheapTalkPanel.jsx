import { useMemo, useState } from 'react'
import Slider from '../../Slider.jsx'
import { Pill, Eyebrow, fmt, INK, SLATE, ORANGE_DARK, MONO } from '../../network/ui.jsx'
import Chart, { Legend } from '../../network/charts.jsx'
import { maxIntervals, partition, actions, losses, delegationLoss, simulate, survey, NO_TALK, DEFAULT_B, SIM_CASES } from './cheaptalk.js'

// Panel C, "Words that cost nothing": cheap talk in the uniform–quadratic
// example. Choose the bias b and the number of intervals N; the partition of
// 0–1, the decision maker's action in each interval, both players' expected
// losses, against no talk and against letting the expert decide. "Simulate"
// draws 10,000 cases; "Survey" plots the best equilibrium against b.

const SKY = '#0369a1'
const W = 320

const T = {
  en: {
    b: 'b, the expert’s bias',
    N: 'Intervals N',
    zero: 'With b = 0 the interests agree and the expert can tell everything: any number of intervals works, and in the limit the loss is 0 (the page stops at 12).',
    bounds: (a) => `Boundaries: ${a}.`,
    none: 'No boundary: one interval, the message says nothing.',
    dm: (v) => `Decision maker’s expected loss: ${v} (the sum of the cubes of the lengths over 12).`,
    ex: (v) => `Expert’s expected loss: ${v} (that plus b²).`,
    noTalk: (v) => `No talk: ${v}.`,
    deleg: (v, better) => `Let the expert decide: the decision maker loses b² = ${v}, ${better ? 'less than with this advice' : 'more than with this advice'}.`,
    simulate: 'Simulate 10,000 cases',
    simLine: (n, d, e) => `${n} cases: θ drawn, the expert names its interval, the decision maker acts at the midpoint. Average losses: decision maker ${d}, expert ${e}.`,
    survey: 'Survey',
    surveyTitle: 'The most informative equilibrium against b',
    lossAxis: 'b →',
    lossLine: 'decision maker’s loss',
    delegLine: 'b² (letting the expert decide)',
    noTalkLine: '1/12 (no talk)',
    nDrops: (s) => `The largest N falls as b grows (first b of the survey with the new N): ${s}. b is the blue line.`,
    theta: 'θ →',
    aria: 'The partition of 0–1 into intervals, with the decision maker’s action in each',
    aria2: 'The decision maker’s loss in the most informative equilibrium, b² and 1/12, against b',
  },
  it: {
    b: 'b, la distorsione dell’esperto',
    N: 'Intervalli N',
    zero: 'Con b = 0 gli interessi coincidono e l’esperto può dire tutto: funziona qualunque numero di intervalli, e al limite la perdita è 0 (la pagina si ferma a 12).',
    bounds: (a) => `Confini: ${a}.`,
    none: 'Nessun confine: un solo intervallo, il messaggio non dice nulla.',
    dm: (v) => `Perdita attesa di chi decide: ${v} (la somma dei cubi delle lunghezze diviso 12).`,
    ex: (v) => `Perdita attesa dell’esperto: ${v} (quella più b²).`,
    noTalk: (v) => `Senza parole: ${v}.`,
    deleg: (v, better) => `Lasciar decidere l’esperto: chi decide perde b² = ${v}, ${better ? 'meno che con questo consiglio' : 'più che con questo consiglio'}.`,
    simulate: 'Simula 10.000 casi',
    simLine: (n, d, e) => `${n} casi: si estrae θ, l’esperto nomina il suo intervallo, chi decide agisce nel punto medio. Perdite medie: chi decide ${d}, esperto ${e}.`,
    survey: 'Rassegna',
    surveyTitle: 'L’equilibrio più informativo in funzione di b',
    lossAxis: 'b →',
    lossLine: 'perdita di chi decide',
    delegLine: 'b² (lasciar decidere l’esperto)',
    noTalkLine: '1/12 (senza parole)',
    nDrops: (s) => `L’N più grande scende al crescere di b (primo b della rassegna con il nuovo N): ${s}. b è la linea blu.`,
    theta: 'θ →',
    aria: 'La partizione di 0–1 in intervalli, con l’azione di chi decide in ciascuno',
    aria2: 'La perdita di chi decide nell’equilibrio più informativo, b² e 1/12, in funzione di b',
  },
}

export default function CheapTalkPanel({ lang = 'en' }) {
  const t = T[lang] || T.en
  const loc = (v, d = 4) => (lang === 'it' ? fmt(v, d).replace('.', ',') : fmt(v, d))
  const [b, setB] = useState(DEFAULT_B)
  const max = maxIntervals(b)
  const [chosen, setChosen] = useState(null) // null: the largest N
  const N = chosen == null || chosen > max ? max : chosen
  const [sim, setSim] = useState(null)
  const [surveyed, setSurveyed] = useState(null)
  const a = partition(b, N)
  const y = actions(a)
  const l = losses(a, b)
  const simShown = sim && sim.b === b && sim.N === N ? sim : null
  const sv = useMemo(() => (surveyed ? survey() : null), [surveyed])
  const sx = (v) => 10 + v * (W - 20)
  const sep = lang === 'it' ? '; ' : ', '

  return (
    <div>
      <div className="grid gap-x-8 gap-y-3 sm:grid-cols-2 max-w-3xl items-end">
        <Slider
          label={t.b}
          min={0}
          max={0.3}
          step={0.005}
          value={b}
          onChange={(v) => {
            setB(v)
            setChosen(null)
          }}
          format={(v) => loc(v, 3)}
        />
        <div>
          <p className="text-sm font-medium text-slate-700">{t.N}</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5" data-role="talk-n">
            {Array.from({ length: max }, (_, k) => k + 1).map((k) => (
              <Pill key={k} active={k === N} onClick={() => setChosen(k)}>
                {k}
              </Pill>
            ))}
          </div>
        </div>
      </div>
      {b === 0 && <p className="mt-2 text-xs text-slate-600 leading-snug max-w-3xl">{t.zero}</p>}

      <div className="mt-4 max-w-2xl">
        <svg viewBox={`0 0 ${W} 64`} className="w-full h-auto" role="img" aria-label={t.aria} data-role="talk-partition">
          {a.slice(1).map((x, i) => (
            <rect key={i} x={sx(a[i])} y={18} width={sx(x) - sx(a[i])} height={16} fill={i % 2 ? '#e0f2fe' : '#fff7ed'} stroke={SLATE} strokeWidth="1" data-interval={i} />
          ))}
          {y.map((v, i) => (
            <g key={`y${i}`}>
              <line x1={sx(v)} x2={sx(v)} y1={12} y2={40} stroke={ORANGE_DARK} strokeWidth="2" />
              <circle cx={sx(v)} cy={12} r="2.5" fill={ORANGE_DARK} />
            </g>
          ))}
          {[0, 0.25, 0.5, 0.75, 1].map((v) => (
            <text key={v} x={sx(v)} y={50} fontSize="9" fontFamily={MONO} fill={SLATE} textAnchor="middle">
              {loc(v, 2).replace(/0$/, '').replace(/[.,]0$/, '').replace(/[.,]$/, '')}
            </text>
          ))}
          <text x={W - 10} y={62} fontSize="9" fontFamily={MONO} fill={SLATE} textAnchor="end">
            {t.theta}
          </text>
        </svg>
      </div>
      <div className="mt-2 text-sm text-slate-700 leading-snug max-w-3xl space-y-1" data-role="talk-readout">
        <p data-role="talk-bounds">{N === 1 ? t.none : t.bounds(a.slice(1, -1).map((v) => loc(v)).join(sep))}</p>
        <p data-role="talk-dm">{t.dm(loc(l.dm, 5))}</p>
        <p>{t.ex(loc(l.expert, 5))}</p>
        <p>{t.noTalk(loc(NO_TALK, 5))}</p>
        <p data-role="talk-deleg">{t.deleg(loc(delegationLoss(b), 5), delegationLoss(b) < l.dm)}</p>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Pill primary onClick={() => setSim({ b, N, ...simulate(b, N) })}>
          {t.simulate}
        </Pill>
        <Pill onClick={() => setSurveyed(true)}>{t.survey}</Pill>
      </div>
      {simShown && (
        <p className="mt-2 text-sm text-slate-700 leading-snug max-w-3xl" data-role="talk-sim">
          {t.simLine(SIM_CASES.toLocaleString(lang === 'it' ? 'it-IT' : 'en-US'), loc(simShown.dm, 5), loc(simShown.expert, 5))}
        </p>
      )}
      {sv && (
        <div className="mt-4 max-w-xl" data-role="talk-survey">
          <Eyebrow>{t.surveyTitle}</Eyebrow>
          <Chart
            x={{ min: 0, max: 0.3, ticks: [0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3], label: t.lossAxis, format: (v) => loc(v, 2) }}
            y={{ min: 0, max: 0.1, ticks: [0, 0.025, 0.05, 0.075, 0.1], format: (v) => loc(v, 3) }}
            series={[
              { points: sv.map((x) => [x.b, x.loss]), color: INK, width: 2, dots: 1.6 },
              { points: sv.map((x) => [x.b, x.delegation]), color: ORANGE_DARK, width: 1.5 },
              { points: [[0, NO_TALK], [0.3, NO_TALK]], color: SLATE, width: 1, dashed: true },
            ]}
            marks={[{ x: b, color: SKY, label: 'b' }]}
            height={190}
            aria={t.aria2}
          />
          <Legend
            items={[
              { label: t.lossLine, color: INK },
              { label: t.delegLine, color: ORANGE_DARK },
              { label: t.noTalkLine, color: SLATE, dashed: true },
            ]}
          />
          <p className="mt-2 text-xs text-slate-600 leading-snug" data-role="talk-survey-n">
            {t.nDrops(
              sv
                .filter((x, i) => i > 0 && x.N !== sv[i - 1].N)
                .map((x) => `${sv[sv.indexOf(x) - 1].N} → ${x.N} (b = ${loc(x.b, 3)})`)
                .join(sep),
            )}
          </p>
        </div>
      )}
    </div>
  )
}
