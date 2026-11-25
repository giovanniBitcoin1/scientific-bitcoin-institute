import { useMemo, useState } from 'react'
import Slider from '../../Slider.jsx'
import { Pill, MONO, SLATE, INK } from '../../network/ui.jsx'
import { cutoffs, toTheEnd, DEFAULT_SIGMA, SIGMA_MIN, SIGMA_MAX } from './globalgame.js'
import { num } from './FigureTypes.jsx'

// Live figure F2, "A little doubt": the stag hunt of the lecture with private
// signals. A line of signals from −0.25 to 1.25 in three bands: hare for sure
// (below l_n), still open, stag for sure (above k_n). "Next step" deletes one
// more round of choices nobody would make; "To the end" runs until both
// cutoffs are within 1e-6 of 1/2. Buttons, a slider and SVG: nothing
// captures a swipe.

const W = 320
const H = 92
const X0 = -0.25
const X1 = 1.25
const PAD = 14
const sx = (v) => PAD + ((v - X0) / (X1 - X0)) * (W - 2 * PAD)
const STAG = '#fdba74' // orange-300
const HARE = '#cbd5e1' // slate-300

const T = {
  en: {
    sigma: 'σ, the spread of each hunter’s error',
    next: 'Next step',
    end: 'To the end',
    reset: 'Reset',
    hare: 'hare for sure',
    stag: 'stag for sure',
    open: 'still open',
    axis: 'signal x →',
    step: 'Step',
    k: 'k (from above)',
    l: 'l (from below)',
    width: 'Open band',
    known: 'With θ known exactly, the open band would stay from 0 to 1 for ever: both equilibria of module 02 survive.',
    aria: 'A line of signals with the bands where a hunter hunts the stag for sure, the hare for sure, or is still open',
  },
  it: {
    sigma: 'σ, la dispersione dell’errore di ogni cacciatore',
    next: 'Passo successivo',
    end: 'Fino in fondo',
    reset: 'Ricomincia',
    hare: 'lepre di sicuro',
    stag: 'cervo di sicuro',
    open: 'ancora aperto',
    axis: 'segnale x →',
    step: 'Passo',
    k: 'k (dall’alto)',
    l: 'l (dal basso)',
    width: 'Fascia aperta',
    known: 'Con θ noto esattamente, la fascia aperta resterebbe da 0 a 1 per sempre: sopravvivono entrambi gli equilibri del modulo 02.',
    aria: 'Una retta dei segnali con le fasce in cui un cacciatore caccia di sicuro il cervo, di sicuro la lepre, o è ancora aperto',
  },
}

export default function FigureGlobal({ lang = 'en' }) {
  const L = T[lang] || T.en
  const [sigma, setSigma] = useState(DEFAULT_SIGMA)
  const [step, setStep] = useState(0)
  const c = useMemo(() => cutoffs(sigma, step), [sigma, step])
  const k = c.k[step]
  const l = c.l[step]
  const n = (v, d = 4) => (lang === 'it' ? v.toFixed(d).replace('.', ',') : v.toFixed(d))
  const changeSigma = (s) => {
    setSigma(s)
    setStep(0)
  }
  const ticks = [-0.25, 0, 0.25, 0.5, 0.75, 1, 1.25]
  const Y = 30
  const BAR = 22

  return (
    <div>
      <div className="grid gap-x-6 gap-y-3 sm:grid-cols-[minmax(0,1fr)_auto] items-end max-w-3xl">
        <Slider label={L.sigma} min={SIGMA_MIN} max={SIGMA_MAX} log value={sigma} onChange={changeSigma} format={(v) => n(v, 3)} />
        <div className="flex flex-wrap gap-2">
          <Pill primary onClick={() => setStep(step + 1)}>
            {L.next}
          </Pill>
          <Pill onClick={() => setStep(toTheEnd(sigma).steps)}>{L.end}</Pill>
          <Pill onClick={() => setStep(0)}>{L.reset}</Pill>
        </div>
      </div>
      <div className="mt-3 max-w-lg">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label={L.aria} data-role="global-line">
          <rect x={sx(X0)} y={Y} width={sx(l) - sx(X0)} height={BAR} fill={HARE} data-band="hare" />
          <rect x={sx(l)} y={Y} width={Math.max(0, sx(k) - sx(l))} height={BAR} fill="white" stroke={SLATE} strokeDasharray="3 2" data-band="open" />
          <rect x={sx(k)} y={Y} width={sx(X1) - sx(k)} height={BAR} fill={STAG} data-band="stag" />
          {c.k.slice(0, step).map((v, i) => (
            <line key={`k${i}`} x1={sx(v)} x2={sx(v)} y1={Y - 4} y2={Y} stroke={SLATE} strokeWidth="1" />
          ))}
          {c.l.slice(0, step).map((v, i) => (
            <line key={`l${i}`} x1={sx(v)} x2={sx(v)} y1={Y - 4} y2={Y} stroke={SLATE} strokeWidth="1" />
          ))}
          <line x1={sx(0.5)} x2={sx(0.5)} y1={Y - 8} y2={Y + BAR + 4} stroke={INK} strokeWidth="1" strokeDasharray="2 2" />
          <text x={sx(X0) + 2} y={Y - 8} fontSize="9" fontFamily={MONO} fill={SLATE}>
            {L.hare}
          </text>
          <text x={sx(X1) - 2} y={Y - 8} fontSize="9" fontFamily={MONO} fill="#c2410c" textAnchor="end">
            {L.stag}
          </text>
          {sx(k) - sx(l) > 50 && (
            <text x={(sx(k) + sx(l)) / 2} y={Y + BAR / 2 + 3} fontSize="9" fontFamily={MONO} fill={SLATE} textAnchor="middle">
              {L.open}
            </text>
          )}
          <line x1={sx(X0)} x2={sx(X1)} y1={Y + BAR} y2={Y + BAR} stroke={SLATE} />
          {ticks.map((v) => (
            <g key={v}>
              <line x1={sx(v)} x2={sx(v)} y1={Y + BAR} y2={Y + BAR + 3} stroke={SLATE} />
              <text x={sx(v)} y={Y + BAR + 13} fontSize="9" fontFamily={MONO} fill={SLATE} textAnchor="middle">
                {num(v, lang, v === 0.5 ? 1 : 2)}
              </text>
            </g>
          ))}
          <text x={sx(X1)} y={H - 2} fontSize="9" fontFamily={MONO} fill={SLATE} textAnchor="end">
            {L.axis}
          </text>
        </svg>
      </div>
      <dl className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 text-sm max-w-2xl" data-role="global-readout">
        {[
          [L.step, String(step), 'step'],
          [L.k, n(k), 'k'],
          [L.l, n(l), 'l'],
          [L.width, n(k - l), 'width'],
        ].map(([label, v, key]) => (
          <div key={key} className="min-w-0">
            <dt className="text-xs text-slate-500">{label}</dt>
            <dd className="font-mono tabular-nums text-slate-900" data-value={key}>
              {v}
            </dd>
          </div>
        ))}
      </dl>
      <p className="mt-2 text-xs text-slate-600 leading-snug">{L.known}</p>
    </div>
  )
}
