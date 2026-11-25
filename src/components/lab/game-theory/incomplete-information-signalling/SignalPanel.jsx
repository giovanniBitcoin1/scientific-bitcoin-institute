import { useState } from 'react'
import Slider from '../../Slider.jsx'
import { Pill, Eyebrow, fmt, INK, SLATE, ORANGE_DARK } from '../../network/ui.jsx'
import Chart, { Legend } from '../../network/charts.jsx'
import { separatingRange, poolingRange, candidate, cheapest, crossing, DEFAULTS, E_MAX } from './signalling.js'

// Panel B, "Separate or pool?": education as a signal. The levels that
// support a separating and a pooling equilibrium, a candidate to test (which
// type would deviate, the payoffs, the cost wasted, the test of Cho and
// Kreps), and each type's payoff against λ in the cheapest separation and in
// pooling at 0.

const SKY = '#0369a1'

const T = {
  en: {
    lambda: 'λ, share of high types',
    cL: 'c_L, cost per unit for a low type',
    cH: 'c_H, cost per unit for a high type',
    e: 'e, the education level',
    sepPill: 'Separating at e',
    poolPill: 'Pooling at e',
    levels: 'The levels that work (unchosen levels read as low)',
    sepRange: (lo, hi) => `Separation: the high type takes any e* from 1/c_L = ${lo} to 1/c_H = ${hi}, the low type none.`,
    sepSingle: (lo) => `Separation only at e* = 1/c_L = 1/c_H = ${lo}, and there both types are indifferent: the low type gains nothing by copying, the high type nothing by paying.`,
    sepNone: 'No separation: education costs the high type more than the low type, so whatever the high type can afford, the low type can too.',
    poolRange: (hi) => `Pooling: both take the same e, from 0 to λ/max(c_L, c_H) = ${hi}, and are paid 1 + λ.`,
    candidate: 'A candidate',
    asked: 'At e = 0 nobody signals: the two types cannot be told apart, so this is pooling at 0.',
    yes: 'It is an equilibrium.',
    no: 'It is not an equilibrium:',
    dev: (who, at, pay) => `the ${who} type would rather take ${at} (and get ${pay})`,
    low: 'low',
    high: 'high',
    payoffs: (h, l) => `Payoffs: high type ${h}, low type ${l}.`,
    wasted: (w) => `Cost wasted per worker: ${w} (education adds nothing to output).`,
    ckPass: 'It passes the Cho–Kreps test: no unchosen level is one that only a high type could gain from.',
    ckFail: (lo, hi) => `It fails the Cho–Kreps test: any level between ${lo} and ${hi} is one a low type would never choose even if paid 2, and a high type would choose if paid 2; read as high, it breaks the candidate.`,
    chart: 'Payoffs against λ',
    lAxis: 'λ →',
    hiSep: 'high type, cheapest separation',
    loSep: 'low type, cheapest separation',
    pool: 'both, pooling at 0',
    cross: (v) => `The high type prefers nobody signalled once λ is above 1 − c_H/c_L = ${v}.`,
    noCross: 'With c_H ≥ c_L there is no strict separation to compare.',
    aria: 'Each type’s payoff against the share of high types, in the cheapest separation and in pooling at 0',
  },
  it: {
    lambda: 'λ, quota di tipi alti',
    cL: 'c_L, costo per unità per un tipo basso',
    cH: 'c_H, costo per unità per un tipo alto',
    e: 'e, il livello di istruzione',
    sepPill: 'Separazione a e',
    poolPill: 'Pooling a e',
    levels: 'I livelli che funzionano (i livelli non scelti si leggono come bassi)',
    sepRange: (lo, hi) => `Separazione: il tipo alto prende un qualunque e* da 1/c_L = ${lo} a 1/c_H = ${hi}, il tipo basso niente.`,
    sepSingle: (lo) => `Separazione solo a e* = 1/c_L = 1/c_H = ${lo}, e lì entrambi i tipi sono indifferenti: il tipo basso non guadagna nulla a copiare, il tipo alto nulla a pagare.`,
    sepNone: 'Nessuna separazione: l’istruzione costa al tipo alto più che al tipo basso, quindi ciò che il tipo alto può permettersi se lo può permettere anche il basso.',
    poolRange: (hi) => `Pooling: entrambi prendono lo stesso e, da 0 a λ/max(c_L, c_H) = ${hi}, e sono pagati 1 + λ.`,
    candidate: 'Un candidato',
    asked: 'Con e = 0 nessuno segnala: i due tipi non si distinguono, quindi è un equilibrio pooling a 0.',
    yes: 'È un equilibrio.',
    no: 'Non è un equilibrio:',
    dev: (who, at, pay) => `il tipo ${who} preferirebbe prendere ${at} (e ottenere ${pay})`,
    low: 'basso',
    high: 'alto',
    payoffs: (h, l) => `Payoff: tipo alto ${h}, tipo basso ${l}.`,
    wasted: (w) => `Costo sprecato per lavoratore: ${w} (l’istruzione non aggiunge nulla alla produzione).`,
    ckPass: 'Supera il criterio intuitivo (di Cho e Kreps): nessun livello non scelto è tale che solo un tipo alto potrebbe guadagnarci.',
    ckFail: (lo, hi) => `Non supera il criterio intuitivo: qualunque livello tra ${lo} e ${hi} è uno che un tipo basso non sceglierebbe mai nemmeno pagato 2, e che un tipo alto sceglierebbe se pagato 2; letto come alto, rompe il candidato.`,
    chart: 'Payoff in funzione di λ',
    lAxis: 'λ →',
    hiSep: 'tipo alto, separazione più economica',
    loSep: 'tipo basso, separazione più economica',
    pool: 'entrambi, pooling a 0',
    cross: (v) => `Il tipo alto preferirebbe che nessuno segnalasse quando λ supera 1 − c_H/c_L = ${v}.`,
    noCross: 'Con c_H ≥ c_L non c’è una separazione stretta da confrontare.',
    aria: 'Il payoff di ogni tipo in funzione della quota di tipi alti, nella separazione più economica e nel pooling a 0',
  },
}

export default function SignalPanel({ lang = 'en' }) {
  const t = T[lang] || T.en
  const loc = (v, d = 3) => (lang === 'it' ? fmt(v, d).replace('.', ',') : fmt(v, d))
  const [lambda, setLambda] = useState(DEFAULTS.lambda)
  const [cL, setCL] = useState(DEFAULTS.cL)
  const [cH, setCH] = useState(DEFAULTS.cH)
  const [kind, setKind] = useState('separate')
  const [e, setE] = useState(1)
  const cfg = { lambda, cL, cH }
  const sr = separatingRange(cfg)
  const pr = poolingRange(cfg)
  const c = candidate(kind, e, cfg)
  const ch = cheapest(cfg)
  const strict = sr && !sr.single
  const lambdas = Array.from({ length: 91 }, (_, k) => 0.05 + k / 100)
  const x = crossing(cfg)

  const devs = ['high', 'low'].filter((ty) => c.deviation[ty]).map((ty) => t.dev(t[ty], loc(c.deviation[ty].at, 2), loc(c.deviation[ty].pay)))

  return (
    <div>
      <div className="grid gap-x-8 gap-y-3 sm:grid-cols-3 max-w-3xl">
        <Slider label={t.lambda} min={0.05} max={0.95} step={0.05} value={lambda} onChange={setLambda} format={(v) => loc(v, 2)} />
        <Slider label={t.cL} min={0.5} max={2} step={0.05} value={cL} onChange={setCL} format={(v) => loc(v, 2)} />
        <Slider label={t.cH} min={0.1} max={2} step={0.05} value={cH} onChange={setCH} format={(v) => loc(v, 2)} />
      </div>
      <div className="mt-4 text-sm text-slate-700 leading-snug max-w-3xl space-y-1" data-role="signal-levels">
        <Eyebrow>{t.levels}</Eyebrow>
        <p data-role="signal-sep">{!sr ? t.sepNone : sr.single ? t.sepSingle(loc(sr.lo)) : t.sepRange(loc(sr.lo), loc(sr.hi))}</p>
        <p data-role="signal-pool">{t.poolRange(loc(pr.hi))}</p>
      </div>

      <div className="mt-5 grid gap-6 md:grid-cols-2 items-start">
        <div className="min-w-0">
          <Eyebrow>{t.candidate}</Eyebrow>
          <div className="mt-2 flex flex-wrap gap-2">
            <Pill active={kind === 'separate'} onClick={() => setKind('separate')}>
              {t.sepPill}
            </Pill>
            <Pill active={kind === 'pool'} onClick={() => setKind('pool')}>
              {t.poolPill}
            </Pill>
          </div>
          <div className="mt-3">
            <Slider label={t.e} min={0} max={E_MAX} step={0.01} value={e} onChange={setE} format={(v) => loc(v, 2)} />
          </div>
          <div className="mt-3 text-sm text-slate-700 leading-snug space-y-1.5" data-role="signal-candidate">
            {c.asked && <p>{t.asked}</p>}
            <p className="font-medium text-slate-900" data-role="signal-verdict">
              {c.equilibrium ? t.yes : `${t.no} ${devs.join('; ')}.`}
            </p>
            <p>{t.payoffs(loc(c.payoff.high), loc(c.payoff.low))}</p>
            <p>{t.wasted(loc(c.wasted))}</p>
            {c.equilibrium && <p data-role="signal-ck">{c.ck ? t.ckFail(loc(c.ck.lo), loc(c.ck.hi)) : t.ckPass}</p>}
          </div>
        </div>
        <div className="min-w-0">
          <Eyebrow>{t.chart}</Eyebrow>
          <Chart
            x={{ min: 0.05, max: 0.95, ticks: [0.1, 0.3, 0.5, 0.7, 0.9], label: t.lAxis, format: (v) => loc(v, 1) }}
            y={{ min: 0.5, max: 2, ticks: [0.5, 1, 1.5, 2], format: (v) => loc(v, 1) }}
            series={[
              ...(strict ? [{ points: lambdas.map((l) => [l, ch.high]), color: ORANGE_DARK, width: 2 }, { points: lambdas.map((l) => [l, ch.low]), color: SKY, width: 2 }] : []),
              { points: lambdas.map((l) => [l, 1 + l]), color: INK, width: 2, dashed: true },
            ]}
            marks={[{ x: lambda, color: SLATE, label: 'λ' }, ...(strict && x > 0.05 && x < 0.95 ? [{ x, color: ORANGE_DARK, dashed: true, row: true }] : [])]}
            height={190}
            aria={t.aria}
          />
          <Legend
            items={[
              ...(strict ? [{ label: t.hiSep, color: ORANGE_DARK }, { label: t.loSep, color: SKY }] : []),
              { label: t.pool, color: INK, dashed: true },
            ]}
          />
          <p className="mt-2 text-sm text-slate-700 leading-snug" data-role="signal-cross">
            {strict ? t.cross(loc(x)) : t.noCross}
          </p>
        </div>
      </div>
    </div>
  )
}
