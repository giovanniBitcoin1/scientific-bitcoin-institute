import { useEffect, useMemo, useState } from 'react'
import Slider from '../../Slider.jsx'
import useExperiment from '../../useExperiment.js'
import { ORANGE_DARK, INK, MUTED, Eyebrow, Pill, Stat } from '../ui.jsx'
import Chart, { Legend } from '../charts.jsx'
import { kernelRun, kernelJob, KERNEL_DEFAULT, KERNEL_RUNS, KERNEL_SOURCES } from './experiments.js'
import { CUM_MIN_NODES } from './kernel.js'

// Panel C, "Measure the attachment rule": grow a network to N1 nodes (the
// first snapshot), then ΔN more; count the links from the new nodes to the old
// ones by the degree their target had at N1. Π(k), the cumulative κ(k) and the
// maximum-likelihood exponent; then the same on twenty networks.

const T = {
  en: {
    sources: { kernel: 'Growth with Π ∝ k^α', linkSelection: 'Link selection', copying: 'Copying, p = 0.5', walk: 'Random walk, ℓ = 1', optimisation: 'Optimisation, δ = 10' },
    alpha: 'α of the growth',
    N1: 'First snapshot, N1',
    dN: 'New nodes, ΔN',
    counted: (links, old) => `${links} links from new nodes to the ${old} old ones.`,
    pi: 'Links gained per node, by degree at N1',
    kappa: 'Cumulative, from the smallest degree',
    slope: (s) => `slope ${s}`,
    cumTo: (to) => `Cumulative slope − 1, up to k = ${to}`,
    cumAll: (to) => `Same, every class (up to k = ${to})`,
    cumNote: `First readout: from the smallest degree to the largest degree held by at least ${CUM_MIN_NODES} nodes. Second: every class. At the top most degrees do not occur, κ stops growing between them, and the slope comes out low: the answer depends on the range fitted.`,
    mle: 'Maximum likelihood α',
    repeat: `Repeat on ${KERNEL_RUNS} networks`,
    stop: 'Stop',
    running: 'Growing…',
    spread: (n) => `Over ${n} networks: mean ± standard deviation (range)`,
    rowCum: 'Cumulative, up to the last class of 10 nodes',
    rowAll: 'Cumulative, every class',
    rowMle: 'Maximum likelihood',
    ariaPi: 'Links gained per node against degree, on logarithmic axes, with lines of slope 0 and 1',
    ariaKappa: 'Cumulative kernel against degree, on logarithmic axes, with lines of slope 1 and 2',
    locale: 'en-US',
  },
  it: {
    sources: { kernel: 'Crescita con Π ∝ k^α', linkSelection: 'Selezione di un collegamento', copying: 'Copia, p = 0,5', walk: 'Passeggiata aleatoria, ℓ = 1', optimisation: 'Ottimizzazione, δ = 10' },
    alpha: 'α della crescita',
    N1: 'Prima istantanea, N1',
    dN: 'Nodi nuovi, ΔN',
    counted: (links, old) => `${links} collegamenti dai nodi nuovi ai ${old} vecchi.`,
    pi: 'Collegamenti ricevuti per nodo, secondo il grado a N1',
    kappa: 'Cumulativa, dal grado più piccolo',
    slope: (s) => `pendenza ${s}`,
    cumTo: (to) => `Pendenza cumulativa − 1, fino a k = ${to}`,
    cumAll: (to) => `Idem, tutte le classi (fino a k = ${to})`,
    cumNote: `Prima lettura: dal grado più piccolo al grado più grande che abbiano almeno ${CUM_MIN_NODES} nodi. Seconda: tutte le classi. In cima la maggior parte dei gradi non compare, κ smette di crescere tra l'uno e l'altro, e la pendenza esce bassa: la risposta dipende dall'intervallo adattato.`,
    mle: 'α di massima verosimiglianza',
    repeat: `Ripeti su ${KERNEL_RUNS} reti`,
    stop: 'Ferma',
    running: 'Crescita in corso…',
    spread: (n) => `Su ${n} reti: media ± deviazione standard (intervallo)`,
    rowCum: "Cumulativa, fino all'ultima classe di 10 nodi",
    rowAll: 'Cumulativa, tutte le classi',
    rowMle: 'Massima verosimiglianza',
    ariaPi: 'Collegamenti ricevuti per nodo al variare del grado, su assi logaritmici, con rette di pendenza 0 e 1',
    ariaKappa: 'Kernel cumulativo al variare del grado, su assi logaritmici, con rette di pendenza 1 e 2',
    locale: 'it-IT',
  },
}

const decadeTicks = (lo, hi) => {
  const out = []
  for (let e = Math.floor(Math.log10(lo)); e <= Math.ceil(Math.log10(hi)); e++) out.push(10 ** e)
  return out
}

export default function KernelPanel({ lang = 'en' }) {
  const t = T[lang] || T.en
  const [source, setSource] = useState(KERNEL_DEFAULT.source)
  const [alpha, setAlpha] = useState(KERNEL_DEFAULT.alpha)
  const [N1, setN1] = useState(KERNEL_DEFAULT.N1)
  const [dN, setDN] = useState(KERNEL_DEFAULT.dN)
  const exp = useExperiment()
  const params = useMemo(() => ({ source, alpha, N1, dN }), [source, alpha, N1, dN])
  const key = `${source}|${alpha}|${N1}|${dN}`
  const int = (v) => Math.round(v).toLocaleString(t.locale)
  const dec = (v, d) => (Number.isFinite(v) ? v.toLocaleString(t.locale, { minimumFractionDigits: d, maximumFractionDigits: d }) : '–')

  useEffect(() => {
    exp.cancel()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  const r = useMemo(() => kernelRun(params), [params])
  const pi = r.table.rows.filter((x) => x.rate > 0).map((x) => [x.k, x.rate])
  const kappa = r.cumulative.points.filter((x) => x.kappa > 0).map((x) => [x.k, x.kappa])
  const kLo = r.table.rows[0].k
  const kHi = r.table.rows[r.table.rows.length - 1].k
  const piMin = Math.min(...pi.map((x) => x[1]))
  const piMax = Math.max(...pi.map((x) => x[1]))
  const kapMax = Math.max(...kappa.map((x) => x[1]))
  const x = { min: 10 ** Math.floor(Math.log10(kLo)), max: 10 ** Math.ceil(Math.log10(kHi)), log: true, ticks: decadeTicks(kLo, kHi), label: 'k' }
  const yPi = { min: 10 ** Math.floor(Math.log10(piMin)), max: 10 ** Math.ceil(Math.log10(piMax * 1.01)), log: true, label: 'Π(k)', labelSide: 'left' }
  yPi.ticks = decadeTicks(yPi.min, yPi.max)
  const yKap = { min: 10 ** Math.floor(Math.log10(kappa[0][1])), max: 10 ** Math.ceil(Math.log10(kapMax * 1.01)), log: true, label: 'κ(k) = Σ Π(k′)', labelSide: 'left' }
  yKap.ticks = decadeTicks(yKap.min, yKap.max)
  const p0 = pi[0]
  // a line of slope s (log–log) through the point `at`, clipped to the chart's box
  const line = (at, s, y) => {
    const f = (k) => at[1] * (k / at[0]) ** s
    const inv = (v) => at[0] * (v / at[1]) ** (1 / s)
    let lo = x.min
    let hi = x.max
    if (s > 0) {
      lo = Math.max(lo, inv(y.min))
      hi = Math.min(hi, inv(y.max))
    }
    return lo < hi ? [[lo, f(lo)], [hi, f(hi)]] : []
  }
  // κ's reference lines go through the last point of the fitted range
  const kapAt = kappa.filter((p) => p[0] <= r.cumulative.to).pop() || kappa[0]
  const data = exp.data && exp.data.params && `${exp.data.params.source}|${exp.data.params.alpha}|${exp.data.params.N1}|${exp.data.params.dN}` === key ? exp.data : null
  const done = !!data && data.done === data.wanted && !exp.running
  const row = (s) => (s && s.count ? `${dec(s.mean, 2)} ± ${dec(s.sd, 2)} (${dec(s.min, 2)} … ${dec(s.max, 2)})${s.count < data.done ? ` · ${s.count}/${data.done}` : ''}` : '–')

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {KERNEL_SOURCES.map((s) => (
          <Pill key={s} active={s === source} onClick={() => setSource(s)} data-source={s} className="normal-case">
            {t.sources[s]}
          </Pill>
        ))}
      </div>
      <div className="mt-3 grid gap-4 sm:grid-cols-3">
        {source === 'kernel' ? <Slider label={t.alpha} min={0} max={2} step={0.1} value={alpha} onChange={(v) => setAlpha(Math.round(v * 10) / 10)} format={(v) => dec(v, 1)} /> : <div className="hidden sm:block" />}
        <Slider label={t.N1} min={1000} max={20000} log value={N1} onChange={(v) => setN1(Math.round(v / 100) * 100)} format={(v) => int(v)} />
        <Slider label={t.dN} min={100} max={5000} log value={dN} onChange={(v) => setDN(Math.round(v / 50) * 50)} format={(v) => int(v)} />
      </div>
      <p className="mt-2 font-mono text-xs text-slate-500">{t.counted(int(r.table.links), int(N1))}</p>

      <div className="mt-3 grid gap-6 lg:grid-cols-2 items-start">
        <div className="min-w-0">
          <Eyebrow>{t.pi}</Eyebrow>
          <Chart
            x={x}
            y={yPi}
            height={170}
            aria={t.ariaPi}
            series={[
              { points: line(p0, 0, yPi), color: MUTED, dashed: true, width: 1.2 },
              { points: line(p0, 1, yPi), color: INK, dashed: true, width: 1.2 },
              { points: pi, color: ORANGE_DARK, dots: 2, line: false },
            ]}
          />
          <Legend items={[{ label: t.slope(0), color: MUTED, dashed: true }, { label: t.slope(1), color: INK, dashed: true }]} />
        </div>
        <div className="min-w-0">
          <Eyebrow>{t.kappa}</Eyebrow>
          <Chart
            x={x}
            y={yKap}
            height={170}
            aria={t.ariaKappa}
            series={[
              { points: line(kapAt, 1, yKap), color: MUTED, dashed: true, width: 1.2 },
              { points: line(kapAt, 2, yKap), color: INK, dashed: true, width: 1.2 },
              { points: kappa, color: ORANGE_DARK, dots: 2, line: false },
            ]}
            marks={[{ x: r.cumulative.to, color: ORANGE_DARK, dashed: true }]}
          />
          <Legend items={[{ label: t.slope(1), color: MUTED, dashed: true }, { label: t.slope(2), color: INK, dashed: true }]} />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2" data-readout="kernel" data-cum={r.cumulative.alpha.toFixed(3)} data-cum-all={r.cumulative.alphaAll.toFixed(3)} data-mle={r.mle.alpha.toFixed(3)} data-se={r.mle.se.toFixed(3)}>
        <Stat label={t.cumTo(int(r.cumulative.to))}>{dec(r.cumulative.alpha, 2)}</Stat>
        <Stat label={t.cumAll(int(r.cumulative.toAll))}>{dec(r.cumulative.alphaAll, 2)}</Stat>
        <Stat label={t.mle}>
          {Number.isFinite(r.mle.alpha) ? `${dec(r.mle.alpha, 2)} ± ${dec(r.mle.se, 2)}` : '–'}
        </Stat>
      </div>
      <p className="mt-2 text-xs text-slate-500 leading-snug">{t.cumNote}</p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {exp.running ? (
          <Pill onClick={exp.cancel}>{t.stop}</Pill>
        ) : (
          <Pill primary onClick={() => exp.run(kernelJob(params))} data-action="repeat">
            {t.repeat}
          </Pill>
        )}
        <span className="font-mono text-xs text-slate-500" aria-live="polite">
          {exp.running ? `${t.running} ${Math.round(exp.progress * 100)}%` : ''}
        </span>
      </div>
      {data && data.mle && (
        <div className="mt-2">
          <Eyebrow>{t.spread(data.done)}</Eyebrow>
          <table className="mt-2 w-full max-w-xl text-sm" data-readout="repeat" data-done={done ? '1' : '0'}>
            <tbody>
              <tr className="border-t border-slate-100">
                <th scope="row" className="py-1.5 pr-2 text-left font-normal text-slate-700">{t.rowCum}</th>
                <td className="py-1.5 pl-2 text-right font-mono tabular-nums">{row(data.cumulative)}</td>
              </tr>
              <tr className="border-t border-slate-100">
                <th scope="row" className="py-1.5 pr-2 text-left font-normal text-slate-700">{t.rowAll}</th>
                <td className="py-1.5 pl-2 text-right font-mono tabular-nums">{row(data.cumulativeAll)}</td>
              </tr>
              <tr className="border-t border-slate-100">
                <th scope="row" className="py-1.5 pr-2 text-left font-normal text-slate-700">{t.rowMle}</th>
                <td className="py-1.5 pl-2 text-right font-mono tabular-nums">{row(data.mle)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
