import { useMemo, useState } from 'react'
import Slider from '../../Slider.jsx'
import { ORANGE_DARK, INK, SLATE, MONO, Pill } from '../ui.jsx'
import { wrongCascade, majorityRight, wrongShareOf, majorityOf } from './contagion.js'
import { sequenceAt, batchAt, F2_N, F2_RUNS, F2_DEFAULT_Q, F2_QS } from './figures.js'

// Live figure F2, "Wrong together": thirty people decide in turn between two
// options. Each has a private signal, right with probability q, and sees the
// choices made before.

const BLUE = '#0284c7'

const T = {
  en: {
    q: 'Each signal is right with probability q',
    next: 'New sequence',
    batch: `Run ${F2_RUNS.toLocaleString('en-US')} times`,
    signal: 'signal',
    choice: 'choice',
    right: 'right option',
    wrong: 'wrong option',
    cascade: 'cascade',
    none: 'No cascade in this sequence: the choices never differed by two, so everyone followed their own signal.',
    line: (start, ok, against, after) => `The cascade starts with person ${start} and is ${ok ? 'right' : 'wrong'}. Of the ${after} people from there on, ${against} had a signal against it and followed all the same.`,
    stats: (c, w, share, formula, maj, bin) => `${F2_RUNS.toLocaleString('en-US')} sequences: ${c.toLocaleString('en-US')} ended in a cascade and ${w} of those were wrong, a share of ${share} (the formula gives ${formula}). The majority of the same thirty signals, each person deciding alone, was right ${maj} of the time (${bin} expected).`,
    aria: 'Thirty people in a row, each with a private signal above and a choice below; a line marks where the cascade starts',
    locale: 'en-US',
  },
  it: {
    q: 'Ogni segnale è giusto con probabilità q',
    next: 'Nuova sequenza',
    batch: `Ripeti ${F2_RUNS.toLocaleString('it-IT')} volte`,
    signal: 'segnale',
    choice: 'scelta',
    right: 'opzione giusta',
    wrong: 'opzione sbagliata',
    cascade: 'cascata',
    none: 'Nessuna cascata in questa sequenza: le scelte non sono mai state diverse per due, quindi ognuno ha seguito il proprio segnale.',
    line: (start, ok, against, after) => `La cascata comincia con la persona ${start} ed è ${ok ? 'giusta' : 'sbagliata'}. Delle ${after} persone da lì in poi, ${against} avevano un segnale contrario e hanno seguito lo stesso.`,
    stats: (c, w, share, formula, maj, bin) => `${F2_RUNS.toLocaleString('it-IT')} sequenze: ${c.toLocaleString('it-IT')} sono finite in una cascata e ${w} di queste erano sbagliate, una quota di ${share} (la formula dà ${formula}). La maggioranza degli stessi trenta segnali, con ognuno che decide da solo, era giusta ${maj} delle volte (${bin} attesi).`,
    aria: 'Trenta persone in fila, ciascuna con un segnale privato sopra e una scelta sotto; una linea segna dove comincia la cascata',
    locale: 'it-IT',
  },
}

const W = 330
const H = 84
const LEFT = 26
const STEP = (W - LEFT - 4) / F2_N

export default function FigureCascade({ lang = 'en' }) {
  const t = T[lang] || T.en
  const num = (v, d) => v.toLocaleString(t.locale, { minimumFractionDigits: d, maximumFractionDigits: d })
  const [q, setQ] = useState(F2_DEFAULT_Q)
  const [index, setIndex] = useState(0)
  const [batch, setBatch] = useState(null)
  const [batches, setBatches] = useState(0)
  const s = useMemo(() => sequenceAt(q, index), [q, index])
  const colour = (v) => (v ? BLUE : ORANGE_DARK)
  const after = s.start >= 0 ? F2_N - s.start : 0
  let against = 0
  for (let i = Math.max(0, s.start); s.start >= 0 && i < F2_N; i++) if (s.signals[i] !== s.choices[i]) against++
  const shown = batch && batch.q === q ? batch : null
  const x = (i) => LEFT + (i + 0.5) * STEP

  const runBatch = () => {
    setBatch({ q, ...batchAt(q, batches) })
    setBatches((b) => b + 1)
  }

  return (
    <div>
      <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2 max-w-2xl items-end">
        <Slider
          label={t.q}
          min={F2_QS.min}
          max={F2_QS.max}
          step={F2_QS.step}
          value={q}
          onChange={(v) => {
            setQ(Math.round(v * 100) / 100)
            setIndex(0)
          }}
          format={(v) => num(v, 2)}
        />
        <div className="flex flex-wrap gap-2">
          <Pill onClick={() => setIndex((i) => i + 1)} data-action="next">
            {t.next}
          </Pill>
          <Pill primary onClick={runBatch} data-action="batch">
            {t.batch}
          </Pill>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-3 w-full h-auto max-w-2xl bg-white border border-slate-200 rounded" role="img" aria-label={t.aria}>
        <text x="2" y="27" fontSize="6.5" fontFamily={MONO} fill={SLATE}>
          {t.signal}
        </text>
        <text x="2" y="52" fontSize="6.5" fontFamily={MONO} fill={SLATE}>
          {t.choice}
        </text>
        {s.start >= 0 && (
          <g>
            <rect x={LEFT + s.start * STEP} y="12" width={(F2_N - s.start) * STEP} height="52" fill="#f1f5f9" />
            <line x1={LEFT + s.start * STEP} x2={LEFT + s.start * STEP} y1="6" y2="66" stroke={INK} strokeWidth="1" strokeDasharray="3 2" />
            <text x={LEFT + s.start * STEP + 2} y="10" fontSize="6.5" fontFamily={MONO} fill={INK}>
              {t.cascade}
            </text>
          </g>
        )}
        {Array.from({ length: F2_N }, (_, i) => (
          <g key={i} data-person={i}>
            <circle cx={x(i)} cy="25" r="3.2" fill={colour(s.signals[i])} />
            <rect x={x(i) - 3.8} y="40" width="7.6" height="16" rx="1.5" fill={colour(s.choices[i])} />
            {(i === 0 || (i + 1) % 5 === 0) && (
              <text x={x(i)} y="74" textAnchor="middle" fontSize="6.5" fontFamily={MONO} fill={SLATE}>
                {i + 1}
              </text>
            )}
          </g>
        ))}
      </svg>
      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: BLUE }} />
          {t.right}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: ORANGE_DARK }} />
          {t.wrong}
        </span>
      </div>
      <p
        className="mt-2 text-sm text-slate-700 leading-snug"
        data-readout="sequence"
        data-q={q}
        data-index={index}
        data-start={s.start}
        data-right={s.start >= 0 ? (s.right ? '1' : '0') : ''}
        data-against={against}
        data-signals={Array.from(s.signals).join('')}
        data-choices={Array.from(s.choices).join('')}
      >
        {s.start >= 0 ? t.line(s.start + 1, s.right, against, after) : t.none}
      </p>
      {shown && (
        <p className="mt-1 text-sm text-slate-700 leading-snug" data-readout="batch" data-q={shown.q} data-cascades={shown.cascades} data-wrong={shown.wrong} data-share={wrongShareOf(shown).toFixed(3)} data-majority={majorityOf(shown).toFixed(3)}>
          {t.stats(shown.cascades, shown.wrong, num(wrongShareOf(shown), 3), num(wrongCascade(shown.q), 3), num(majorityOf(shown), 3), num(majorityRight(F2_N, shown.q), 3))}
        </p>
      )}
    </div>
  )
}
