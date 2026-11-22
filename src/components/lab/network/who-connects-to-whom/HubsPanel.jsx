import { useEffect, useState } from 'react'
import Slider from '../../Slider.jsx'
import useExperiment from '../../useExperiment.js'
import { ORANGE_DARK, INK, MUTED, Eyebrow, Pill, Stat } from '../ui.jsx'
import Chart, { Legend } from '../charts.jsx'
import { panelAJob, sweepJob, A_DEFAULT, A_MAX_N, A_KMIN, A_MEAN_K, KNN_FROM, SWEEP_SEEDS } from './experiments.js'
import { RC_RANDOMISATIONS } from './mixing.js'

// Panel A, "Do hubs link to hubs?". A source network, optionally rewired
// towards assortative or disassortative (Xulvi-Brunet–Sokolov), its degree
// correlations, k_nn(k) and the rich club against degree-preserving
// randomisations; "Grow N" compares r and ρ at three sizes.

const T = {
  en: {
    sources: { pa: 'Preferential attachment, m = 2', power: `Power law, k_min = ${A_KMIN}, multiple links erased`, poisson: `Poisson, ⟨k⟩ = ${A_MEAN_K}` },
    N: 'Nodes, N',
    gamma: 'Exponent γ',
    modes: { none: 'As built', assortative: 'Rewire towards assortative', disassortative: 'Rewire towards disassortative' },
    p: 'Probability p of an ordered swap',
    swaps: 'Swaps, per link',
    running: 'Computing…',
    r: 'Pearson r',
    rho: 'Spearman ρ',
    ks: 'Structural cutoff k_s',
    max: 'Largest degree',
    unc: '⟨k²⟩/⟨k⟩',
    slope: `k_nn slope from k = ${KNN_FROM}`,
    knn: 'Mean degree of the neighbours, k_nn(k)',
    uncLine: 'no correlations: ⟨k²⟩/⟨k⟩',
    measured: 'measured',
    phi: 'Rich-club coefficient φ(k)',
    network: 'this network',
    randomised: (c) => `mean of ${c} randomisations`,
    ratio: 'Normalised: φ / φ of the randomisations',
    rcNote: (c) => `Randomisations: ${c} states of a chain of degree-preserving swaps (module 02), no self-link or repeated link; shown where at least 5 nodes are above k.`,
    sweep: 'Grow N',
    sweepNote: `r and ρ of the source as built, ${SWEEP_SEEDS} seeds at each size (the rewiring is not applied).`,
    size: 'N',
    mean: 'mean',
    ariaKnn: 'Mean neighbour degree against degree on logarithmic axes',
    ariaPhi: 'Rich-club coefficient against degree on logarithmic axes',
    ariaRatio: 'Normalised rich-club coefficient against degree',
    locale: 'en-US',
  },
  it: {
    sources: { pa: 'Aggancio preferenziale, m = 2', power: `Legge di potenza, k_min = ${A_KMIN}, collegamenti multipli cancellati`, poisson: `Poisson, ⟨k⟩ = ${A_MEAN_K}` },
    N: 'Nodi, N',
    gamma: 'Esponente γ',
    modes: { none: 'Come costruita', assortative: 'Ricabla verso assortativa', disassortative: 'Ricabla verso disassortativa' },
    p: 'Probabilità p di uno scambio ordinato',
    swaps: 'Scambi, per collegamento',
    running: 'Calcolo in corso…',
    r: 'r di Pearson',
    rho: 'ρ di Spearman',
    ks: 'Cutoff strutturale k_s',
    max: 'Grado massimo',
    unc: '⟨k²⟩/⟨k⟩',
    slope: `pendenza di k_nn da k = ${KNN_FROM}`,
    knn: 'Grado medio dei vicini, k_nn(k)',
    uncLine: 'senza correlazioni: ⟨k²⟩/⟨k⟩',
    measured: 'misurato',
    phi: 'Coefficiente di rich club φ(k)',
    network: 'questa rete',
    randomised: (c) => `media di ${c} randomizzazioni`,
    ratio: 'Normalizzato: φ / φ delle randomizzazioni',
    rcNote: (c) => `Randomizzazioni: ${c} stati di una catena di scambi che conservano i gradi (modulo 02), senza cappi né collegamenti ripetuti; mostrato dove almeno 5 nodi stanno sopra k.`,
    sweep: 'Fai crescere N',
    sweepNote: `r e ρ della sorgente come costruita, ${SWEEP_SEEDS} semi per ogni dimensione (la ricablatura non si applica).`,
    size: 'N',
    mean: 'media',
    ariaKnn: 'Grado medio dei vicini al variare del grado, su assi logaritmici',
    ariaPhi: 'Coefficiente di rich club al variare del grado, su assi logaritmici',
    ariaRatio: 'Coefficiente di rich club normalizzato al variare del grado',
    locale: 'it-IT',
  },
}

const decades = (lo, hi) => {
  const out = []
  for (let v = lo; v <= hi * 1.0001; v *= 10) out.push(v)
  return out
}
const top10 = (v) => 10 ** Math.ceil(Math.log10(Math.max(10, v)))

export default function HubsPanel({ lang = 'en' }) {
  const t = T[lang] || T.en
  const num = (v, d) => (Number.isFinite(v) ? v.toLocaleString(t.locale, { minimumFractionDigits: d, maximumFractionDigits: d }) : '–')
  const int = (v) => Math.round(v).toLocaleString(t.locale)
  const [source, setSource] = useState(A_DEFAULT.source)
  const [N, setN] = useState(A_DEFAULT.N)
  const [gamma, setGamma] = useState(A_DEFAULT.gamma)
  const [mode, setMode] = useState(A_DEFAULT.mode)
  const [p, setP] = useState(A_DEFAULT.p)
  const [swaps, setSwaps] = useState(A_DEFAULT.swaps)
  const exp = useExperiment()
  const sweep = useExperiment()
  useEffect(() => {
    exp.run(panelAJob({ source, N, gamma, mode, p, swaps }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source, N, gamma, mode, p, swaps])
  const d = exp.data
  const s = d && d.stats
  const rc = d && d.rc
  const sw = sweep.data && sweep.data.source === source && sweep.data.gamma === gamma ? sweep.data : null

  const kTop = s ? top10(s.max) : 100
  const knnPts = s ? s.knn.map((q) => [q[0], q[1]]) : []
  const knnHi = s ? top10(Math.max(s.uncorrelated, ...knnPts.map((q) => q[1]))) : 100
  const knnLo = s ? 10 ** Math.floor(Math.log10(Math.max(1, Math.min(s.uncorrelated, ...knnPts.map((q) => q[1]))))) : 1
  const rcPts = rc ? rc.points.filter((q) => q.k >= 1) : []
  const phiPts = rcPts.filter((q) => q.phi > 0).map((q) => [q.k, q.phi])
  const randPts = rcPts.filter((q) => q.rand > 0).map((q) => [q.k, q.rand])
  const ratioPts = rcPts.filter((q) => Number.isFinite(q.ratio)).map((q) => [q.k, q.ratio])
  const phiLo = phiPts.length || randPts.length ? 10 ** Math.floor(Math.log10(Math.min(...phiPts.map((q) => q[1]), ...randPts.map((q) => q[1])))) : 1e-4
  const rMax = ratioPts.length ? Math.max(2, Math.ceil(Math.max(...ratioPts.map((q) => q[1])))) : 2
  const kRc = rcPts.length ? top10(rcPts[rcPts.length - 1].k) : 100

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {['pa', 'power', 'poisson'].map((id) => (
          <Pill key={id} active={source === id} onClick={() => setSource(id)} data-source={id}>
            {t.sources[id]}
          </Pill>
        ))}
      </div>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        <Slider label={t.N} min={1000} max={A_MAX_N} log value={N} onChange={(v) => setN(Math.round(v / 1000) * 1000)} format={(v) => int(v)} />
        {source === 'power' && <Slider label={t.gamma} min={2.1} max={3.5} step={0.1} value={gamma} onChange={(v) => setGamma(Math.round(v * 10) / 10)} format={(v) => num(v, 1)} />}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {['none', 'assortative', 'disassortative'].map((id) => (
          <Pill key={id} active={mode === id} onClick={() => setMode(id)} data-mode={id}>
            {t.modes[id]}
          </Pill>
        ))}
      </div>
      {mode !== 'none' && (
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <Slider label={t.p} min={0} max={1} step={0.05} value={p} onChange={(v) => setP(Math.round(v * 20) / 20)} format={(v) => num(v, 2)} />
          <Slider label={t.swaps} min={1} max={20} step={1} value={swaps} onChange={(v) => setSwaps(Math.round(v))} format={(v) => int(v)} />
        </div>
      )}
      {exp.running && <p className="mt-1 font-mono text-xs text-slate-500">{`${t.running} ${Math.round(exp.progress * 100)}%`}</p>}

      <div
        className="mt-4 grid grid-cols-2 lg:grid-cols-6 gap-2"
        data-readout="hubs"
        data-done={d && d.done ? '1' : '0'}
        data-r={s ? s.r.toFixed(4) : ''}
        data-rho={s ? s.rho.toFixed(4) : ''}
        data-max={s ? s.max : ''}
      >
        <Stat label={t.r}>{s ? num(s.r, 3) : '–'}</Stat>
        <Stat label={t.rho}>{s ? num(s.rho, 3) : '–'}</Stat>
        <Stat label={t.ks}>{s ? int(s.ks) : '–'}</Stat>
        <Stat label={t.max}>{s ? int(s.max) : '–'}</Stat>
        <Stat label={t.unc}>{s ? num(s.uncorrelated, 1) : '–'}</Stat>
        <Stat label={t.slope}>{s ? num(s.slope, 2) : '–'}</Stat>
      </div>

      <div className="mt-4 grid gap-6 lg:grid-cols-3 items-start">
        <div className="min-w-0">
          <Eyebrow>{t.knn}</Eyebrow>
          <Chart
            x={{ min: 1, max: kTop, log: true, ticks: decades(1, kTop), label: 'k' }}
            y={{ min: knnLo, max: knnHi, log: true, ticks: decades(knnLo, knnHi), label: 'k_nn', labelSide: 'left' }}
            height={160}
            aria={t.ariaKnn}
            marks={s ? [{ x: s.ks, color: MUTED, dashed: true, label: 'k_s' }] : []}
            series={s ? [{ points: [[1, s.uncorrelated], [kTop, s.uncorrelated]], color: MUTED, dashed: true, width: 1.4 }, { points: knnPts, color: ORANGE_DARK, dots: 1.8, line: false }] : []}
          />
          <Legend items={[{ label: t.measured, color: ORANGE_DARK }, { label: t.uncLine, color: MUTED, dashed: true }]} />
        </div>
        <div className="min-w-0">
          <Eyebrow>{t.phi}</Eyebrow>
          <Chart
            x={{ min: 1, max: kRc, log: true, ticks: decades(1, kRc), label: 'k' }}
            y={{ min: phiLo, max: 1, log: true, ticks: decades(phiLo, 1), label: 'φ', labelSide: 'left' }}
            height={160}
            aria={t.ariaPhi}
            series={[{ points: randPts, color: MUTED, width: 1.6 }, { points: phiPts, color: ORANGE_DARK, width: 1.8 }]}
          />
          <Legend items={[{ label: t.network, color: ORANGE_DARK }, { label: t.randomised(RC_RANDOMISATIONS), color: MUTED }]} />
        </div>
        <div className="min-w-0" data-readout="richclub" data-done={rc && rc.finished ? '1' : '0'}>
          <Eyebrow>{t.ratio}</Eyebrow>
          <Chart
            x={{ min: 1, max: kRc, log: true, ticks: decades(1, kRc), label: 'k' }}
            y={{ min: 0, max: rMax, ticks: Array.from({ length: rMax + 1 }, (_, i) => i) }}
            height={160}
            aria={t.ariaRatio}
            series={[{ points: [[1, 1], [kRc, 1]], color: MUTED, dashed: true, width: 1.2 }, { points: ratioPts, color: INK, width: 1.8 }]}
          />
          <p className="mt-1 text-xs text-slate-500 leading-snug">{t.rcNote(rc ? rc.done : 0)}</p>
        </div>
      </div>

      <div className="mt-5">
        <div className="flex flex-wrap items-center gap-3">
          <Pill primary onClick={() => sweep.run(sweepJob({ source, gamma }))} disabled={sweep.running} data-action="sweep">
            {sweep.running ? `${t.running} ${Math.round(sweep.progress * 100)}%` : t.sweep}
          </Pill>
          <p className="text-xs text-slate-500 leading-snug">{t.sweepNote}</p>
        </div>
        {sw && (
          <div className="mt-2 overflow-x-auto" data-readout="sweep" data-done={sw.done ? '1' : '0'} data-r={sw.rows.map((r) => (Number.isFinite(r.rMean) ? r.rMean.toFixed(3) : '')).join(' ')} data-rho={sw.rows.map((r) => (Number.isFinite(r.rhoMean) ? r.rhoMean.toFixed(3) : '')).join(' ')}>
            <table className="w-full text-sm font-mono tabular-nums">
              <thead>
                <tr className="text-xs text-slate-500 text-left">
                  <th className="py-1 pr-3 font-normal">{t.size}</th>
                  <th className="py-1 pr-3 font-normal">{`r (${t.mean})`}</th>
                  <th className="py-1 font-normal">{`ρ (${t.mean})`}</th>
                </tr>
              </thead>
              <tbody>
                {sw.rows.map((row) => (
                  <tr key={row.N} className="border-t border-slate-200">
                    <td className="py-1 pr-3">{int(row.N)}</td>
                    <td className="py-1 pr-3">{num(row.rMean, 3)}</td>
                    <td className="py-1">{num(row.rhoMean, 3)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
