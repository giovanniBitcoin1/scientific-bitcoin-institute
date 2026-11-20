import { useMemo, useRef, useState } from 'react'
import Slider from '../../Slider.jsx'
import SimControls from '../../SimControls.jsx'
import useAnimationLoop from '../../useAnimationLoop.js'
import { ORANGE_DARK, INK, SLATE, Eyebrow, Pill, Stat } from '../ui.jsx'
import Chart, { Legend } from '../charts.jsx'
import { FAMILIES, FAMILY_IDS, giant, iterate, POWER_THRESHOLD } from './genfun.js'
import GIANT from '../../../../data/lab/precomputed/network-05-giant.json'

// Panel B, "The giant component, by bookkeeping". Left: the curve y = G1(u),
// the diagonal, and the iteration u → G1(u) from u = 0, one step at a time.
// Right: S against the parameter of the family: the curve from the generating
// functions and dots from configuration-model networks of 20,000 nodes
// (precomputed by scripts/lab/precompute-network-05.mjs).

const MAX_STEPS = 400
const STEP_MS = 350

const T = {
  en: {
    family: 'Degree distribution',
    names: { poisson: 'Poisson', power: 'Pure power law from k = 1', onesFours: 'Ones and fours' },
    slider: { poisson: 'Mean degree ⟨k⟩', power: 'Degree exponent γ', onesFours: 'Share of nodes with four links' },
    axis: { poisson: '⟨k⟩', power: 'γ', onesFours: 'share of fours' },
    play: 'Play',
    pause: 'Pause',
    step: 'Step',
    reset: 'Reset',
    left: 'A link that does not lead to the giant component: u = G1(u)',
    right: 'Share of the nodes in the giant component, S',
    steps: 'Steps',
    uNow: 'u after these steps',
    sNow: 'S = 1 − G0(u) after these steps',
    uEnd: 'u at the fixed point',
    sEnd: 'S at the fixed point',
    slope: 'G1′(1) = (⟨k²⟩ − ⟨k⟩) / ⟨k⟩',
    excess: '⟨k²⟩ − 2⟨k⟩',
    unbounded: 'grows without bound',
    curve: 'y = G1(u)',
    diagonal: 'y = u',
    path: 'the iteration',
    theory: 'generating functions',
    dots: (n, r) => `networks of ${n} nodes (mean of ${r})`,
    threshold: { poisson: '⟨k⟩ = 1', power: `γ = ${POWER_THRESHOLD.toFixed(4)}`, onesFours: '1/9' },
    note: 'In the networks, self-links are removed and repeated links merged, and no degree exceeds N − 1.',
    ariaLeft: 'The curve G1 of u, the diagonal, and the steps of the iteration from u equal to 0',
    ariaRight: 'Share of the giant component against the parameter: theory curve and dots from networks',
    locale: 'en-US',
  },
  it: {
    family: 'Distribuzione dei gradi',
    names: { poisson: 'Poisson', power: 'Legge di potenza pura da k = 1', onesFours: 'Uno e quattro' },
    slider: { poisson: 'Grado medio ⟨k⟩', power: 'Esponente dei gradi γ', onesFours: 'Quota di nodi con quattro collegamenti' },
    axis: { poisson: '⟨k⟩', power: 'γ', onesFours: 'quota di quattro' },
    play: 'Avvia',
    pause: 'Pausa',
    step: 'Passo',
    reset: 'Azzera',
    left: 'Un collegamento che non porta alla componente gigante: u = G1(u)',
    right: 'Quota dei nodi nella componente gigante, S',
    steps: 'Passi',
    uNow: 'u dopo questi passi',
    sNow: 'S = 1 − G0(u) dopo questi passi',
    uEnd: 'u al punto fisso',
    sEnd: 'S al punto fisso',
    slope: 'G1′(1) = (⟨k²⟩ − ⟨k⟩) / ⟨k⟩',
    excess: '⟨k²⟩ − 2⟨k⟩',
    unbounded: 'cresce senza limite',
    curve: 'y = G1(u)',
    diagonal: 'y = u',
    path: "l'iterazione",
    theory: 'funzioni generatrici',
    dots: (n, r) => `reti di ${n} nodi (media di ${r})`,
    threshold: { poisson: '⟨k⟩ = 1', power: `γ = ${POWER_THRESHOLD.toFixed(4).replace('.', ',')}`, onesFours: '1/9' },
    note: 'Nelle reti i cappi sono rimossi e i collegamenti ripetuti fusi, e nessun grado supera N − 1.',
    ariaLeft: "La curva G1 di u, la diagonale e i passi dell'iterazione a partire da u uguale a 0",
    ariaRight: 'Quota della componente gigante al variare del parametro: curva teorica e punti dalle reti',
    locale: 'it-IT',
  },
}

const INITIAL = Object.fromEntries(FAMILY_IDS.map((id) => [id, FAMILIES[id].initial]))
const TICKS = {
  poisson: [0, 1, 2, 3, 4],
  power: [2, 2.5, 3, 3.5, 4],
  onesFours: [0, 0.25, 0.5, 0.75, 1],
}
const UNIT = [0, 0.25, 0.5, 0.75, 1]

export default function GiantPanel({ lang = 'en' }) {
  const t = T[lang] || T.en
  const [id, setId] = useState('poisson')
  const [values, setValues] = useState(INITIAL)
  const [steps, setSteps] = useState(0)
  const [playing, setPlaying] = useState(false)
  const clock = useRef(0)
  const F = FAMILIES[id]
  const value = values[id]
  const dec = (v, d = 4) => (Number.isFinite(v) ? v.toLocaleString(t.locale, { minimumFractionDigits: d, maximumFractionDigits: d }) : t.unbounded)

  const fam = useMemo(() => F.make(value), [F, value])
  const end = useMemo(() => giant(fam), [fam])
  const path = useMemo(() => iterate(fam, MAX_STEPS), [fam])
  const curve = useMemo(() => Array.from({ length: 101 }, (_, i) => [i / 100, fam.G1(i / 100)]), [fam])
  const converged = (k) => k >= MAX_STEPS || (k > 0 && Math.abs(path[k] - path[k - 1]) < 1e-6)

  const restart = () => {
    setPlaying(false)
    setSteps(0)
  }
  const advance = () => {
    if (converged(steps)) setPlaying(false)
    else setSteps(steps + 1)
  }
  useAnimationLoop((dt) => {
    clock.current += dt
    if (clock.current >= STEP_MS) {
      clock.current = 0
      advance()
    }
  }, playing)

  // The staircase: up to the curve, across to the diagonal, and again.
  const stairs = [[0, 0]]
  for (let k = 0; k < steps; k++) {
    stairs.push([path[k], path[k + 1]])
    stairs.push([path[k + 1], path[k + 1]])
  }
  const u = path[steps]
  const x = { min: F.min, max: F.max, ticks: TICKS[id], label: t.axis[id], format: (v) => v.toLocaleString(t.locale) }
  const unit = (label) => ({ min: 0, max: 1, ticks: UNIT, label, format: (v) => v.toLocaleString(t.locale) })
  const file = GIANT[id]

  return (
    <div>
      <div className="flex flex-wrap gap-2" role="group" aria-label={t.family}>
        {FAMILY_IDS.map((k) => (
          <Pill
            key={k}
            active={k === id}
            data-family={k}
            onClick={() => {
              setId(k)
              restart()
            }}
          >
            {t.names[k]}
          </Pill>
        ))}
      </div>
      <div className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2 items-end">
        <Slider
          label={t.slider[id]}
          min={F.min}
          max={F.max}
          step={F.step}
          value={value}
          onChange={(v) => {
            setValues((old) => ({ ...old, [id]: v }))
            restart()
          }}
          format={(v) => dec(v, 2)}
        />
        <SimControls
          playing={playing}
          onPlayPause={() => {
            if (converged(steps)) setSteps(0)
            setPlaying((v) => !v)
          }}
          onStep={advance}
          onReset={restart}
          labels={{ play: t.play, pause: t.pause, step: t.step, reset: t.reset }}
        />
      </div>

      <div className="mt-4 grid gap-6 md:grid-cols-2 items-start">
        <div className="min-w-0">
          <Eyebrow>{t.left}</Eyebrow>
          <Chart
            x={unit('u')}
            y={unit('')}
            height={250}
            aria={t.ariaLeft}
            series={[
              { points: [[0, 0], [1, 1]], color: SLATE, dashed: true, width: 1.2 },
              { points: curve, color: INK, width: 1.8 },
              { points: stairs, color: ORANGE_DARK, width: 1.6 },
              { points: [[u, u]], color: ORANGE_DARK, line: false, dots: 3 },
            ]}
          />
          <Legend
            items={[
              { label: t.curve, color: INK },
              { label: t.diagonal, color: SLATE, dashed: true },
              { label: t.path, color: ORANGE_DARK },
            ]}
          />
        </div>
        <div className="min-w-0">
          <Eyebrow>{t.right}</Eyebrow>
          <Chart
            x={x}
            y={unit('')}
            height={250}
            aria={t.ariaRight}
            marks={[
              { x: F.mark, color: SLATE, dashed: true, label: t.threshold[id] },
              { x: value, color: ORANGE_DARK },
            ]}
            series={[
              { points: file.theory, color: INK, width: 1.8 },
              { points: file.dots.map((p) => [p[0], p[1]]), color: ORANGE_DARK, line: false, dots: 2.4 },
            ]}
          />
          <Legend
            items={[
              { label: t.theory, color: INK },
              { label: t.dots(GIANT.n.toLocaleString(t.locale), GIANT.runs), color: ORANGE_DARK },
            ]}
          />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-2" data-readout="giant" data-converged={converged(steps) ? '1' : '0'}>
        <Stat label={t.steps}>{steps}</Stat>
        <Stat label={t.uNow}>{dec(u)}</Stat>
        <Stat label={t.sNow} wide>
          {dec(Math.max(0, 1 - fam.G0(u)))}
        </Stat>
        <Stat label={t.uEnd}>{dec(end.u)}</Stat>
        <Stat label={t.sEnd}>{dec(end.S)}</Stat>
        <Stat label={t.slope}>{dec(fam.slope, 3)}</Stat>
        <Stat label={t.excess}>{dec(fam.excess, 3)}</Stat>
      </div>
      <p className="mt-2 text-xs text-slate-500 leading-snug">{t.note}</p>
    </div>
  )
}
