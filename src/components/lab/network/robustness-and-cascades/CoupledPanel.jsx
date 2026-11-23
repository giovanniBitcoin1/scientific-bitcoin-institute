import { useEffect, useMemo, useState } from 'react'
import Slider from '../../Slider.jsx'
import useExperiment from '../../useExperiment.js'
import { ORANGE_DARK, INK, SLATE, MUTED, Eyebrow, Pill, Stat } from '../ui.jsx'
import Chart, { Legend } from '../charts.jsx'
import { coupledPair, coupledSweepJob, C_DEFAULT, C_SIZES, C_GAMMA, C_KMIN, C_STEP } from './experiments.js'
import { mutualTheory, singleTheory, coupledConstant } from './robust.js'

// Panel C, "Coupled networks": two networks whose nodes depend on each other
// one to one. A fraction p of the nodes of A is kept; the failures then go
// back and forth until what is left is connected in both.

const CONSTANT = coupledConstant().value

const T = {
  en: {
    kinds: { random: 'Two random networks', power: 'Two power-law networks' },
    N: 'Nodes in each network, N',
    meanK: 'Mean degree',
    p: 'Fraction of nodes kept, p',
    note: 'Node i of network A works only if node i of network B does, and the other way round; the two networks are wired independently. Keep a fraction p of the nodes of A. Then, in turn: A keeps only its largest component; B loses the partners of the nodes A has lost and keeps only its largest component; and so on until a step removes nothing. What is left is the mutual giant component. "Single network" is the largest component of A alone after the same removal.',
    powerNote: (k) => `Configuration model with p(k) ∝ k^(−${C_GAMMA}) from k = ${C_KMIN}: mean degree ${k}. The theory curves are those of two random networks with this mean degree, for comparison.`,
    mutual: 'Mutual giant component',
    single: 'Single network',
    rounds: 'Steps of the cascade',
    theory: (v) => `theory ${v}`,
    pc: 'Mutual giant above 1% of N from p =',
    pcSingle: 'Single network above 1% of N from p =',
    peak: 'Most steps',
    peakAt: (r, p) => `${r}, at p = ${p}`,
    against: (v) => `formula ${v}`,
    running: 'Computing…',
    chart: 'Share of the nodes left against p',
    chartRounds: 'Steps of the cascade against p',
    legend: { mutual: 'coupled, measured', single: 'single, measured', tm: 'coupled, theory', ts: 'single, theory' },
    kept: 'p',
    ariaChart: 'Mutual giant component and largest component of a single network against the fraction of nodes kept, measured and from the theory',
    ariaRounds: 'Number of steps of the cascade against the fraction of nodes kept',
    locale: 'en-US',
  },
  it: {
    kinds: { random: 'Due reti casuali', power: 'Due reti a legge di potenza' },
    N: 'Nodi in ciascuna rete, N',
    meanK: 'Grado medio',
    p: 'Frazione di nodi tenuta, p',
    note: "Il nodo i della rete A funziona solo se funziona il nodo i della rete B, e viceversa; le due reti sono cablate in modo indipendente. Tieni una frazione p dei nodi di A. Poi, a turno: A tiene solo la sua componente più grande; B perde i partner dei nodi che A ha perso e tiene solo la sua componente più grande; e così via finché un passo non toglie nulla. Ciò che resta è la componente gigante mutua. «Rete singola» è la componente più grande della sola A dopo la stessa rimozione.",
    powerNote: (k) => `Modello di configurazione con p(k) ∝ k^(−${String(C_GAMMA).replace('.', ',')}) da k = ${C_KMIN}: grado medio ${k}. Le curve teoriche sono quelle di due reti casuali con questo grado medio, per confronto.`,
    mutual: 'Componente gigante mutua',
    single: 'Rete singola',
    rounds: 'Passi della cascata',
    theory: (v) => `teoria ${v}`,
    pc: "Gigante mutua sopra l'1% di N da p =",
    pcSingle: "Rete singola sopra l'1% di N da p =",
    peak: 'Massimo dei passi',
    peakAt: (r, p) => `${r}, a p = ${p}`,
    against: (v) => `formula ${v}`,
    running: 'Calcolo in corso…',
    chart: 'Quota di nodi rimasta al variare di p',
    chartRounds: 'Passi della cascata al variare di p',
    legend: { mutual: 'accoppiate, misurata', single: 'singola, misurata', tm: 'accoppiate, teoria', ts: 'singola, teoria' },
    kept: 'p',
    ariaChart: 'Componente gigante mutua e componente più grande di una rete singola al variare della frazione di nodi tenuta, misurate e dalla teoria',
    ariaRounds: 'Numero di passi della cascata al variare della frazione di nodi tenuta',
    locale: 'it-IT',
  },
}

export default function CoupledPanel({ lang = 'en' }) {
  const t = T[lang] || T.en
  const num = (v, d) => (Number.isFinite(v) ? v.toLocaleString(t.locale, { minimumFractionDigits: d, maximumFractionDigits: d }) : '–')
  const [kind, setKind] = useState(C_DEFAULT.kind)
  const [sizeIdx, setSizeIdx] = useState(C_SIZES.indexOf(C_DEFAULT.N))
  const [meanK, setMeanK] = useState(C_DEFAULT.meanK)
  const [p, setP] = useState(C_DEFAULT.p)
  const N = C_SIZES[sizeIdx]
  const pair = useMemo(() => coupledPair({ kind, N, meanK }), [kind, N, meanK])
  const exp = useExperiment()
  useEffect(() => {
    exp.run(coupledSweepJob(pair))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pair])
  const d = exp.data && exp.data.n === N && exp.data.kind === kind ? exp.data : null
  const done = d && d.done && !exp.running
  const k = pair.meanK
  const theory = useMemo(() => {
    const count = Math.round(1 / C_STEP)
    const ps = Array.from({ length: count + 1 }, (_, i) => i / count)
    return { mutual: ps.map((x) => [x, mutualTheory(x, k)]), single: ps.map((x) => [x, singleTheory(x, k)]) }
  }, [k])
  const row = done ? d.rows[Math.round(p / C_STEP)] : null
  const maxRounds = d && d.rows.length ? Math.max(10, ...d.rows.map((r) => r.rounds)) : 10
  const top = Math.ceil(maxRounds / 10) * 10

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {['random', 'power'].map((id) => (
          <Pill key={id} active={kind === id} onClick={() => setKind(id)} data-kind={id}>
            {t.kinds[id]}
          </Pill>
        ))}
      </div>
      <div className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-2 max-w-2xl">
        <Slider label={t.N} min={0} max={C_SIZES.length - 1} step={1} value={sizeIdx} onChange={(v) => setSizeIdx(Math.round(v))} format={(v) => C_SIZES[Math.round(v)].toLocaleString(t.locale)} />
        {kind === 'random' && <Slider label={t.meanK} min={2.5} max={8} step={0.5} value={meanK} onChange={(v) => setMeanK(Math.round(v * 2) / 2)} format={(v) => num(v, 1)} />}
        <Slider label={t.p} min={0} max={1} step={0.01} value={p} onChange={(v) => setP(Math.round(v * 100) / 100)} format={(v) => num(v, 2)} />
      </div>
      <p className="mt-2 text-xs text-slate-500 leading-snug">{t.note}</p>
      {kind === 'power' && <p className="mt-1 text-xs text-slate-500 leading-snug">{t.powerNote(num(k, 2))}</p>}
      {exp.running && <p className="mt-1 font-mono text-xs text-slate-500">{`${t.running} ${Math.round(exp.progress * 100)}%`}</p>}

      <div
        className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2"
        data-readout="coupled"
        data-done={done ? '1' : '0'}
        data-p={p}
        data-k={k.toFixed(3)}
        data-mutual={row ? row.mutual.toFixed(3) : ''}
        data-single={row ? row.single.toFixed(3) : ''}
        data-rounds={row ? row.rounds : ''}
        data-pc={done ? d.pc : ''}
        data-pcsingle={done ? d.pcSingle : ''}
        data-peak={done ? `${d.peak.rounds} ${d.peak.p}` : ''}
      >
        <Stat label={t.mutual}>
          <span style={{ color: ORANGE_DARK }}>{row ? num(row.mutual, 3) : '–'}</span>
          {` · ${t.theory(num(mutualTheory(p, k), 3))}`}
        </Stat>
        <Stat label={t.single}>{`${row ? num(row.single, 3) : '–'} · ${t.theory(num(singleTheory(p, k), 3))}`}</Stat>
        <Stat label={t.rounds}>{row ? row.rounds : '–'}</Stat>
        <Stat label={t.pc}>{`${done ? num(d.pc, 2) : '–'} · ${t.against(`${num(CONSTANT, 4)}/⟨k⟩ = ${num(CONSTANT / k, 3)}`)}`}</Stat>
        <Stat label={t.pcSingle}>{`${done ? num(d.pcSingle, 2) : '–'} · ${t.against(`1/⟨k⟩ = ${num(1 / k, 3)}`)}`}</Stat>
        <Stat label={t.peak}>{done ? t.peakAt(d.peak.rounds, num(d.peak.p, 2)) : '–'}</Stat>
      </div>

      {d && d.rows.length > 1 && (
        <div className="mt-4 grid gap-6 lg:grid-cols-2 items-start">
          <div className="min-w-0">
            <Eyebrow>{t.chart}</Eyebrow>
            <Chart
              x={{ min: 0, max: 1, ticks: [0, 0.2, 0.4, 0.6, 0.8, 1], label: t.kept, format: (v) => num(v, 1) }}
              y={{ min: 0, max: 1, ticks: [0, 0.25, 0.5, 0.75, 1], format: (v) => num(v, 2) }}
              height={190}
              aria={t.ariaChart}
              marks={[{ x: p, color: MUTED, dashed: true }]}
              series={[
                { points: theory.single, color: SLATE, width: 1.2, dashed: true },
                { points: theory.mutual, color: ORANGE_DARK, width: 1.2, dashed: true },
                { points: d.rows.map((r) => [r.p, r.single]), color: INK, width: 1.6 },
                { points: d.rows.map((r) => [r.p, r.mutual]), color: ORANGE_DARK, width: 1.9 },
              ]}
            />
            <Legend
              items={[
                { label: t.legend.mutual, color: ORANGE_DARK },
                { label: t.legend.single, color: INK },
                { label: t.legend.tm, color: ORANGE_DARK, dashed: true },
                { label: t.legend.ts, color: SLATE, dashed: true },
              ]}
            />
          </div>
          <div className="min-w-0">
            <Eyebrow>{t.chartRounds}</Eyebrow>
            <Chart
              x={{ min: 0, max: 1, ticks: [0, 0.2, 0.4, 0.6, 0.8, 1], label: t.kept, format: (v) => num(v, 1) }}
              y={{ min: 0, max: top, ticks: [0, top / 2, top] }}
              height={190}
              aria={t.ariaRounds}
              marks={[{ x: CONSTANT / k, color: SLATE, label: `${num(CONSTANT, 4)}/⟨k⟩` }]}
              series={[{ points: d.rows.map((r) => [r.p, r.rounds]), color: INK, width: 1.5 }]}
            />
          </div>
        </div>
      )}
    </div>
  )
}
