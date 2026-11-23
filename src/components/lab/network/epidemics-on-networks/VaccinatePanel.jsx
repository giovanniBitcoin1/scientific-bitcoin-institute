import { useEffect, useMemo, useState } from 'react'
import Slider from '../../Slider.jsx'
import useExperiment from '../../useExperiment.js'
import { ORANGE_DARK, INK, SLATE, MUTED, Eyebrow, Pill, Stat } from '../ui.jsx'
import Chart, { Legend } from '../charts.jsx'
import { netC, immuniseJob, stopsAt, C_DEFAULT, C_SOURCES, C_SIZES, C_RUNS, C_STEP, C_GMAX, STRATEGIES, MEAN_K } from './experiments.js'

// Panel C, "Whom to vaccinate": a share g of the nodes is made immune before
// the outbreak, at random, by highest degree or by acquaintance; then SIR by
// percolation at a chosen T.

const BLUE = '#0284c7'
const COLOR = { random: INK, degree: ORANGE_DARK, acquaintance: BLUE }

const T = {
  en: {
    sources: { poisson: 'Random network', pa: 'Preferential attachment' },
    N: 'Nodes, N',
    T: 'Transmissibility, T',
    g: 'Share immunised, g',
    net: (n, l, k, k2) => `${n} nodes, ${l} links, ⟨k⟩ = ${k}, ⟨k²⟩ = ${k2}`,
    note: `Both networks have mean degree ${MEAN_K}. Immune nodes are taken out with their links; then each remaining link is kept with probability T, and the largest component, as a share of all N nodes, is the size of a large outbreak (mean of ${C_RUNS} runs, each with its own choice of whom to immunise). By degree uses the degrees of the intact network. By acquaintance: draw a node at random and immunise one of its neighbours, drawn at random, until gN distinct nodes are immune; nobody's degree needs to be known.`,
    strategies: { random: 'At random', degree: 'Highest degree', acquaintance: 'Acquaintance' },
    how: 'Strategy',
    size: (g) => `large outbreak at g = ${g}`,
    meanK: 'mean degree of the immunised',
    stops: 'below 1% of N from g =',
    never: `not up to ${C_GMAX}`,
    tc: 'T_c from the formula',
    gc: 'g_c = 1 − T_c/T, at random',
    running: 'Computing…',
    chart: 'Size of a large outbreak (share of N) against the share immunised',
    immunised: 'g',
    ariaChart: 'Size of a large outbreak against the share of nodes immunised, for the three strategies',
    locale: 'en-US',
  },
  it: {
    sources: { poisson: 'Rete casuale', pa: 'Aggancio preferenziale' },
    N: 'Nodi, N',
    T: 'Trasmissibilità, T',
    g: 'Quota immunizzata, g',
    net: (n, l, k, k2) => `${n} nodi, ${l} collegamenti, ⟨k⟩ = ${k}, ⟨k²⟩ = ${k2}`,
    note: `Entrambe le reti hanno grado medio ${MEAN_K}. I nodi immuni sono tolti con i loro collegamenti; poi ogni collegamento rimasto è tenuto con probabilità T, e la componente più grande, come quota di tutti gli N nodi, è la dimensione di un grande focolaio (media di ${C_RUNS} simulazioni, ciascuna con la propria scelta di chi immunizzare). Per grado usa i gradi della rete intatta. Conoscenti: estrai un nodo a caso e immunizza uno dei suoi vicini, estratto a caso, finché gN nodi distinti sono immuni; non serve conoscere il grado di nessuno.`,
    strategies: { random: 'A caso', degree: 'Grado più alto', acquaintance: 'Conoscenti' },
    how: 'Strategia',
    size: (g) => `grande focolaio con g = ${g}`,
    meanK: 'grado medio degli immunizzati',
    stops: "sotto l'1% di N da g =",
    never: `non fino a ${String(C_GMAX).replace('.', ',')}`,
    tc: 'T_c dalla formula',
    gc: 'g_c = 1 − T_c/T, a caso',
    running: 'Calcolo in corso…',
    chart: 'Dimensione di un grande focolaio (quota di N) al variare della quota immunizzata',
    immunised: 'g',
    ariaChart: 'Dimensione di un grande focolaio al variare della quota di nodi immunizzata, per le tre strategie',
    locale: 'it-IT',
  },
}

export default function VaccinatePanel({ lang = 'en' }) {
  const t = T[lang] || T.en
  const num = (v, d) => (Number.isFinite(v) ? v.toLocaleString(t.locale, { minimumFractionDigits: d, maximumFractionDigits: d }) : '–')
  const [source, setSource] = useState(C_DEFAULT.source)
  const [sizeIdx, setSizeIdx] = useState(C_SIZES.indexOf(C_DEFAULT.N))
  const [Tv, setT] = useState(C_DEFAULT.T)
  const [g, setG] = useState(C_DEFAULT.g)
  const N = C_SIZES[sizeIdx]
  const on = useMemo(() => netC({ source, N }), [source, N])
  const exp = useExperiment()
  useEffect(() => {
    exp.run(immuniseJob(on, Tv))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [on, Tv])
  const d = exp.data && exp.data.n === on.n && exp.data.source === on.source && exp.data.T === Tv ? exp.data : null
  const done = d && d.done && !exp.running
  const row = done ? d.rows[Math.round(g / C_STEP)] : null
  const gc = Math.max(0, 1 - on.Tc / Tv)

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {C_SOURCES.map((id) => (
          <Pill key={id} active={source === id} onClick={() => setSource(id)} data-source={id}>
            {t.sources[id]}
          </Pill>
        ))}
      </div>
      <div className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-2 max-w-2xl">
        <Slider label={t.N} min={0} max={C_SIZES.length - 1} step={1} value={sizeIdx} onChange={(v) => setSizeIdx(Math.round(v))} format={(v) => C_SIZES[Math.round(v)].toLocaleString(t.locale)} />
        <Slider label={t.T} min={0.05} max={1} step={0.05} value={Tv} onChange={(v) => setT(Math.round(v * 20) / 20)} format={(v) => num(v, 2)} />
        <Slider label={t.g} min={0} max={C_GMAX} step={C_STEP} value={g} onChange={(v) => setG(Math.round(v * 100) / 100)} format={(v) => num(v, 2)} />
      </div>
      <p className="mt-2 font-mono text-xs text-slate-600">{t.net(on.n.toLocaleString(t.locale), on.links.toLocaleString(t.locale), num(on.mean, 2), num(on.mean2, 2))}</p>
      <p className="mt-1 text-xs text-slate-500 leading-snug">{t.note}</p>
      {exp.running && <p className="mt-1 font-mono text-xs text-slate-500">{`${t.running} ${Math.round(exp.progress * 100)}%`}</p>}

      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-xl">
        <Stat label={t.tc}>{num(on.Tc, 3)}</Stat>
        <Stat label={t.gc}>{num(gc, 3)}</Stat>
      </div>

      <div className="mt-3 overflow-x-auto" data-readout="immune" data-done={done ? '1' : '0'} data-g={g} data-t={Tv} data-tc={on.Tc.toFixed(3)} data-gc={gc.toFixed(3)}>
        <table className="w-full text-sm font-mono tabular-nums">
          <thead>
            <tr className="text-xs text-slate-500 text-left">
              <th className="py-1 pr-2 font-normal">{t.how}</th>
              <th className="py-1 pr-2 font-normal">{t.size(num(g, 2))}</th>
              <th className="py-1 pr-2 font-normal">{t.meanK}</th>
              <th className="py-1 pr-2 font-normal">{t.stops}</th>
            </tr>
          </thead>
          <tbody>
            {STRATEGIES.map((s) => {
              const stop = done ? stopsAt(d.rows, s) : NaN
              return (
                <tr key={s} className="border-t border-slate-200" data-strategy={s} data-size={row ? row.size[s].toFixed(3) : ''} data-k={row && Number.isFinite(row.k[s]) ? row.k[s].toFixed(2) : ''} data-stops={Number.isFinite(stop) ? stop : ''}>
                  <td className="py-1 pr-2 font-sans">
                    <span className="inline-block w-2.5 h-2.5 rounded-full mr-1.5" style={{ background: COLOR[s] }} />
                    {t.strategies[s]}
                  </td>
                  <td className="py-1 pr-2">{row ? num(row.size[s], 3) : '–'}</td>
                  <td className="py-1 pr-2">{row ? num(row.k[s], 2) : '–'}</td>
                  <td className="py-1 pr-2">{done ? (Number.isFinite(stop) ? num(stop, 2) : t.never) : '–'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {d && d.runs > 0 && (
        <div className="mt-4 max-w-xl">
          <Eyebrow>{t.chart}</Eyebrow>
          <Chart
            x={{ min: 0, max: C_GMAX, ticks: [0, 0.3, 0.6, 0.9], label: t.immunised, format: (v) => num(v, 1) }}
            y={{ min: 0, max: 1, ticks: [0, 0.25, 0.5, 0.75, 1], format: (v) => num(v, 2) }}
            height={200}
            aria={t.ariaChart}
            marks={[{ x: gc, color: SLATE, label: 'g_c' }, { x: g, color: MUTED, dashed: true }]}
            series={STRATEGIES.map((s) => ({ points: d.rows.map((r) => [r.g, r.size[s]]), color: COLOR[s], width: 1.8 }))}
          />
          <Legend items={STRATEGIES.map((s) => ({ label: t.strategies[s], color: COLOR[s] }))} />
        </div>
      )}
    </div>
  )
}
