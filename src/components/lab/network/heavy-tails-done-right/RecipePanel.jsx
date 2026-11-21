import { useMemo, useState } from 'react'
import Slider from '../../Slider.jsx'
import useExperiment from '../../useExperiment.js'
import { ORANGE_DARK, INK, SLATE, Eyebrow, Pill, Stat } from '../ui.jsx'
import Chart, { Legend } from '../charts.jsx'
import { hurwitz } from './zeta.js'
import { tabulate, fitRecipe, bootstrapJob, compare, verdict, wrongWays, hillPlot, BOOT_DEFAULT, BOOT_MAX, P_LIMIT } from './fit.js'
import {
  SOURCES, SOURCE_IDS, MYSTERIES, drawSample, SAMPLE_SEED, DEFAULT_N, DEFAULT_GAMMA, TAIL_START, LOGNORMAL, EXPONENTIAL_MEAN, CUTOFF, THIN, PA_M,
} from './sources.js'

// Panel C, "Is it a power law?": whole-number data from a chosen source, and
// the recipe applied to them step by step. Everything but the bootstrap is
// computed at once; the bootstrap runs on a button, in chunks.

const SKY = '#0284c7'

const T = {
  en: {
    source: 'Data',
    sources: {
      power: 'Pure power law',
      tailBody: 'Power-law tail, different body',
      lognormal: 'Lognormal',
      exponential: 'Exponential',
      cutoff: 'Power law with a cut-off',
      attachment: 'Preferential-attachment network',
      thinned: 'Power-law network, sampled',
      mystery1: 'Mystery sample 1',
      mystery2: 'Mystery sample 2',
      mystery3: 'Mystery sample 3',
    },
    about: {
      power: (g) => `p_k ∝ k^(−γ) from k = 1, with γ = ${g}.`,
      tailBody: (g) => `40% of the values follow p_k ∝ k^(−γ) from k = ${TAIL_START}, with γ = ${g}; the rest are spread evenly over 1 … ${TAIL_START - 1}.`,
      lognormal: () => `The whole number nearest to e^x, where x is Gaussian with mean ${LOGNORMAL.mu} and standard deviation ${LOGNORMAL.sigma}.`,
      exponential: () => `An exponential with mean ${EXPONENTIAL_MEAN}, rounded up to a whole number.`,
      cutoff: () => `p_k ∝ k^(−${CUTOFF.gamma}) e^(−k/${CUTOFF.scale}) from k = 1.`,
      attachment: () => `The degrees of a preferential-attachment network with m = ${PA_M}: exactly p_k = 12 / (k(k+1)(k+2)), exponent 3 only for large k.`,
      thinned: () => `Degrees from p_k ∝ k^(−${THIN.gamma}); then each link is seen with probability ${THIN.keep}, and nodes with no link seen are missing. The tail keeps the exponent ${THIN.gamma}.`,
      mystery: 'One of the sources above, with a fixed seed. Give your verdict, then press Reveal.',
    },
    n: 'Sample size n',
    gamma: 'Exponent γ of the source',
    fresh: 'New sample',
    reveal: 'Reveal',
    revealed: (name, n) => `It was: ${name}, n = ${n}.`,
    sample: (i) => `Sample ${i}`,
    step1: 'Step 1 · Look: the CCDF',
    step2: 'Step 2 · Fit: KS distance for each candidate k_min',
    step3: 'Step 3 · Test',
    step4: 'Step 4 · Compare',
    dataLine: 'data',
    fitLine: 'fitted power law',
    kMin: 'Chosen k_min',
    gammaHat: 'γ ± standard error',
    nTail: 'Values in the tail, n_tail',
    range: 'The tail runs from … to',
    ks: 'KS distance',
    sets: 'Synthetic data sets',
    test: 'Run the test',
    stop: 'Stop',
    p: 'p-value',
    notRun: 'not run yet',
    progress: (d, s) => `${d} of ${s} sets`,
    pNote: `Share of the synthetic sets that fit worse than the data. At ${P_LIMIT} or below the power law is ruled out.`,
    // No synthetic set fitted worse: p is below 1/(number of sets), not zero.
    pNone: (lim, sets) => `< ${lim} (none of the ${sets} synthetic sets fitted worse)`,
    pVerdict: (p) => `p = ${p}`,
    pVerdictNone: (lim, sets) => `p < ${lim}: none of the ${sets} synthetic sets fitted worse than the data`,
    cmpCol: ['Power law against', 'Log-likelihood ratio', 'p'],
    cmpNames: { lognormal: 'Lognormal', exponential: 'Exponential', cutoff: 'Power law with cut-off' },
    reading: { power: 'power law favoured', other: 'the other is favoured', none: 'no decision' },
    cmpNote: 'All fitted to the same tail. A positive ratio favours the power law. The cut-off law contains the power law, so its ratio is never positive.',
    verdictLabel: 'Verdict',
    verdict: {
      small: (f) => `Nothing can be concluded: the tail holds only ${f.nTail} values.`,
      narrow: (f, kMax) => `Nothing can be concluded: the tail runs from ${f.kMin} to ${kMax}, less than a factor of ten.`,
      untested: () => 'Run the test of step 3 first.',
      ruledOut: (f, kMax, p) => `Power law ruled out (${p}).`,
      alternative: (f, kMax, p, better) => `Not ruled out by the test (${p}), but a better candidate exists: ${better}.`,
      plausible: (f, kMax, p, open) =>
        open ? `Power law not ruled out (${p}). Not confirmed either: it cannot be told apart from ${open}.` : `Power law not ruled out (${p}), and favoured over all three alternatives. Still not a proof.`,
    },
    joinNames: { lognormal: 'a lognormal', exponential: 'an exponential', cutoff: 'a power law with a cut-off' },
    and: ' and ',
    tailBeside: (n, all) => `n_tail = ${n} of ${all}`,
    wrong: 'Four ways to get it wrong',
    wrongRows: {
      equalBins: 'Straight line through a histogram, equal bins',
      logBins: 'Straight line through a histogram, logarithmic bins',
      ccdf: 'Straight line through the CCDF',
      mle: (k) => `Maximum likelihood with k_min = ${k}`,
      recipe: 'The full recipe',
      truth: 'The truth (exponent of the tail)',
    },
    noTruth: 'not a power law',
    hidden: 'hidden',
    hill: 'Hill plot: the exponent from the j largest values',
    hillNote: 'Read as a degree exponent (1 + the Hill estimate). Dashed: the γ of the recipe. Vertical line: the recipe’s n_tail.',
    ariaCcdf: 'Share of values at least k against k, on logarithmic axes, with the fitted power law',
    ariaKs: 'Kolmogorov–Smirnov distance against the candidate k_min',
    ariaHill: 'Hill estimate of the exponent against the number of largest values used',
    locale: 'en-US',
  },
  it: {
    source: 'Dati',
    sources: {
      power: 'Legge di potenza pura',
      tailBody: 'Coda a legge di potenza, corpo diverso',
      lognormal: 'Lognormale',
      exponential: 'Esponenziale',
      cutoff: 'Legge di potenza con taglio',
      attachment: 'Rete ad aggancio preferenziale',
      thinned: 'Rete a legge di potenza, campionata',
      mystery1: 'Campione misterioso 1',
      mystery2: 'Campione misterioso 2',
      mystery3: 'Campione misterioso 3',
    },
    about: {
      power: (g) => `p_k ∝ k^(−γ) da k = 1, con γ = ${g}.`,
      tailBody: (g) => `Il 40% dei valori segue p_k ∝ k^(−γ) da k = ${TAIL_START}, con γ = ${g}; gli altri sono distribuiti in modo uniforme tra 1 e ${TAIL_START - 1}.`,
      lognormal: () => `Il numero intero più vicino a e^x, dove x è gaussiana con media ${LOGNORMAL.mu} e deviazione standard ${String(LOGNORMAL.sigma).replace('.', ',')}.`,
      exponential: () => `Un'esponenziale di media ${EXPONENTIAL_MEAN}, arrotondata per eccesso a un numero intero.`,
      cutoff: () => `p_k ∝ k^(−${CUTOFF.gamma}) e^(−k/${CUTOFF.scale}) da k = 1.`,
      attachment: () => `I gradi di una rete ad aggancio preferenziale con m = ${PA_M}: esattamente p_k = 12 / (k(k+1)(k+2)), esponente 3 solo per k grandi.`,
      thinned: () => `Gradi da p_k ∝ k^(−${String(THIN.gamma).replace('.', ',')}); poi ogni collegamento è visto con probabilità ${String(THIN.keep).replace('.', ',')}, e i nodi di cui non si vede alcun collegamento mancano. La coda conserva l'esponente ${String(THIN.gamma).replace('.', ',')}.`,
      mystery: 'Una delle sorgenti qui sopra, con un seme fisso. Dai il tuo verdetto, poi premi Rivela.',
    },
    n: 'Dimensione del campione n',
    gamma: 'Esponente γ della sorgente',
    fresh: 'Nuovo campione',
    reveal: 'Rivela',
    revealed: (name, n) => `Era: ${name}, n = ${n}.`,
    sample: (i) => `Campione ${i}`,
    step1: 'Passo 1 · Guarda: la CCDF',
    step2: 'Passo 2 · Adatta: distanza KS per ogni k_min candidato',
    step3: 'Passo 3 · Verifica',
    step4: 'Passo 4 · Confronta',
    dataLine: 'dati',
    fitLine: 'legge di potenza adattata',
    kMin: 'k_min scelto',
    gammaHat: 'γ ± errore standard',
    nTail: 'Valori nella coda, n_tail',
    range: 'La coda va da … a',
    ks: 'Distanza KS',
    sets: 'Insiemi di dati sintetici',
    test: 'Esegui il test',
    stop: 'Ferma',
    p: 'Valore p',
    notRun: 'non ancora eseguito',
    progress: (d, s) => `${d} insiemi su ${s}`,
    pNote: `Quota degli insiemi sintetici che si adattano peggio dei dati. Se è ${String(P_LIMIT).replace('.', ',')} o meno, la legge di potenza è esclusa.`,
    pNone: (lim, sets) => `< ${lim} (nessuno dei ${sets} insiemi sintetici si adatta peggio)`,
    pVerdict: (p) => `p = ${p}`,
    pVerdictNone: (lim, sets) => `p < ${lim}: nessuno dei ${sets} insiemi sintetici si adatta peggio dei dati`,
    cmpCol: ['Legge di potenza contro', 'Rapporto di log-verosim.', 'p'],
    cmpNames: { lognormal: 'Lognormale', exponential: 'Esponenziale', cutoff: 'Legge di potenza con taglio' },
    reading: { power: 'favorita la legge di potenza', other: "favorita l'altra", none: 'nessuna decisione' },
    cmpNote: 'Tutte adattate alla stessa coda. Un rapporto positivo favorisce la legge di potenza. La legge con taglio contiene la legge di potenza, quindi il suo rapporto non è mai positivo.',
    verdictLabel: 'Verdetto',
    verdict: {
      small: (f) => `Non si può concludere nulla: la coda contiene solo ${f.nTail} valori.`,
      narrow: (f, kMax) => `Non si può concludere nulla: la coda va da ${f.kMin} a ${kMax}, meno di un fattore dieci.`,
      untested: () => 'Esegui prima il test del passo 3.',
      ruledOut: (f, kMax, p) => `Legge di potenza esclusa (${p}).`,
      alternative: (f, kMax, p, better) => `Non esclusa dal test (${p}), ma c'è un candidato migliore: ${better}.`,
      plausible: (f, kMax, p, open) =>
        open ? `Legge di potenza non esclusa (${p}). Nemmeno confermata: non si distingue da ${open}.` : `Legge di potenza non esclusa (${p}), e favorita rispetto a tutte e tre le alternative. Non è comunque una prova.`,
    },
    joinNames: { lognormal: 'una lognormale', exponential: "un'esponenziale", cutoff: 'una legge di potenza con taglio' },
    and: ' e ',
    tailBeside: (n, all) => `n_tail = ${n} su ${all}`,
    wrong: 'Quattro modi di sbagliare',
    wrongRows: {
      equalBins: 'Retta su un istogramma, classi uguali',
      logBins: 'Retta su un istogramma, classi logaritmiche',
      ccdf: 'Retta sulla CCDF',
      mle: (k) => `Massima verosimiglianza con k_min = ${k}`,
      recipe: 'La ricetta completa',
      truth: 'La verità (esponente della coda)',
    },
    noTruth: 'non è una legge di potenza',
    hidden: 'nascosta',
    hill: "Grafico di Hill: l'esponente dai j valori più grandi",
    hillNote: 'Letto come esponente dei gradi (1 + la stima di Hill). Tratteggiata: il γ della ricetta. Linea verticale: n_tail della ricetta.',
    ariaCcdf: 'Quota di valori pari almeno a k al variare di k, su assi logaritmici, con la legge di potenza adattata',
    ariaKs: 'Distanza di Kolmogorov–Smirnov al variare del k_min candidato',
    ariaHill: "Stima di Hill dell'esponente al variare del numero di valori più grandi usati",
    locale: 'it-IT',
  },
}

const ALL_IDS = [...SOURCE_IDS, ...MYSTERIES.map((m) => m.id)]
const roundN = (v) => {
  const p = 10 ** (Math.floor(Math.log10(v)) - 1)
  return Math.round(v / p) * p
}
const decades = (lo, hi) => {
  const out = []
  for (let e = Math.round(Math.log10(lo)); 10 ** e <= hi * 1.0001; e++) out.push(10 ** e)
  return out
}
const select = 'min-w-0 max-w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 focus:outline-none focus:border-orange-500'
const th = 'pb-1 px-2 font-mono text-xs uppercase tracking-wider text-slate-500 font-semibold'
const td = 'py-1.5 px-2 text-right font-mono tabular-nums text-slate-900'

export default function RecipePanel({ lang = 'en' }) {
  const t = T[lang] || T.en
  const [sourceId, setSourceId] = useState('power')
  const [nRaw, setNRaw] = useState(DEFAULT_N)
  const [gamma, setGamma] = useState(DEFAULT_GAMMA)
  const [nonce, setNonce] = useState(0)
  const [sets, setSets] = useState(BOOT_DEFAULT)
  const [revealed, setRevealed] = useState(false)
  const [tested, setTested] = useState(null)
  const exp = useExperiment()

  const mystery = MYSTERIES.find((m) => m.id === sourceId)
  const source = SOURCES[mystery ? mystery.source : sourceId]
  const n = roundN(nRaw)
  const key = mystery ? sourceId : `${sourceId}|${n}|${source.gamma ? gamma : ''}|${nonce}`
  const int = (v) => Math.round(v).toLocaleString(t.locale)
  const dec = (v, d = 2) => (Number.isFinite(v) ? v.toLocaleString(t.locale, { minimumFractionDigits: d, maximumFractionDigits: d }) : '–')

  const r = useMemo(() => {
    const tab = tabulate(drawSample(sourceId, n, { gamma }, SAMPLE_SEED + nonce))
    const fit = fitRecipe(tab, { scan: true })
    return { tab, fit, cmp: compare(tab, fit), wrong: wrongWays(tab), hill: hillPlot(tab), kMax: tab.ks[tab.ks.length - 1] }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
  const { tab, fit, cmp, wrong, kMax } = r

  const test = tested === key && exp.data ? exp.data : null
  const p = test && test.finished && !exp.running ? test.p : null
  const v = verdict(fit, p, cmp, kMax)
  const names = (list) => list.map((id) => t.joinNames[id]).join(t.and)
  // A p-value from `sets` synthetic sets is a count out of `sets`: when none
  // fitted worse it is below 1/sets, not 0; a small non-zero one keeps three
  // decimals so that it never reads 0.00.
  const pLim = (sets) => (1 / sets).toLocaleString(t.locale, { maximumSignificantDigits: 2 })
  const pDec = (v) => dec(v, v > 0 && v < 0.01 ? 3 : 2)
  const pVerdictText = p == null ? '' : test.worse === 0 ? t.pVerdictNone(pLim(test.sets), int(test.sets)) : t.pVerdict(pDec(p))
  const verdictText = t.verdict[v.kind](fit, int(kMax), pVerdictText, names(v.kind === 'alternative' ? v.better : v.open || []))
  const truth = mystery && !revealed ? t.hidden : source.truth(mystery ? mystery.params : { gamma }) == null ? t.noTruth : dec(source.truth(mystery ? mystery.params : { gamma }), 2)

  const xMax = 10 ** Math.max(1, Math.ceil(Math.log10(kMax)))
  const yMin = 10 ** -Math.ceil(Math.log10(tab.n))
  const ccdf = tab.ks.map((k, i) => [k, tab.tailN[i] / tab.n])
  const line = useMemo(() => {
    const Z = hurwitz(fit.gamma, fit.kMin)
    const out = []
    for (let i = 0; i <= 40; i++) {
      const k = Math.max(fit.kMin, Math.round(fit.kMin * (xMax / fit.kMin) ** (i / 40)))
      out.push([k, ((fit.nTail / tab.n) * hurwitz(fit.gamma, k)) / Z])
    }
    return out
  }, [fit, tab, xMax])
  const scan = fit.scan
  const scanMax = 10 ** Math.max(1, Math.ceil(Math.log10(scan[scan.length - 1].kMin + 1)))
  const dTop = Math.max(0.1, Math.ceil(Math.max(...scan.map((s) => s.D)) * 10) / 10)
  const reading = (c) => (c.p < P_LIMIT ? (c.R > 0 ? t.reading.power : t.reading.other) : t.reading.none)
  const reset = () => {
    exp.cancel()
    setTested(null)
    setRevealed(false)
  }

  return (
    <div>
      <div className="grid gap-x-6 gap-y-3 sm:grid-cols-3 items-end">
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700 min-w-0">
          {t.source}
          <select
            value={sourceId}
            onChange={(e) => {
              setSourceId(e.target.value)
              reset()
            }}
            className={select}
          >
            {ALL_IDS.map((id) => (
              <option key={id} value={id}>
                {t.sources[id]}
              </option>
            ))}
          </select>
        </label>
        {!mystery && (
          <Slider
            label={t.n}
            min={100}
            max={50000}
            log
            value={nRaw}
            onChange={(x) => {
              setNRaw(x)
              reset()
            }}
            format={(x) => int(roundN(x))}
          />
        )}
        {!mystery && source.gamma && (
          <Slider
            label={t.gamma}
            min={1.5}
            max={4}
            step={0.1}
            value={gamma}
            onChange={(x) => {
              setGamma(x)
              reset()
            }}
            format={(x) => dec(x, 1)}
          />
        )}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {mystery ? (
          <Pill onClick={() => setRevealed(true)} disabled={revealed} data-action="reveal">
            {t.reveal}
          </Pill>
        ) : (
          <Pill
            onClick={() => {
              setNonce((x) => x + 1)
              reset()
            }}
          >
            {t.fresh}
          </Pill>
        )}
        <span className="text-sm text-slate-600 leading-snug" data-readout="about">
          {mystery
            ? revealed
              ? `${t.revealed(t.sources[mystery.source], int(mystery.n))} ${t.about[mystery.source](dec(mystery.params.gamma ?? 0, 1))}`
              : t.about.mystery
            : `${t.sample(nonce + 1)}. ${t.about[sourceId](dec(gamma, 1))}`}
        </span>
      </div>

      <div className="mt-5 grid gap-6 md:grid-cols-2 items-start">
        <div className="min-w-0">
          <Eyebrow>{t.step1}</Eyebrow>
          <Chart
            x={{ min: 1, max: xMax, log: true, ticks: decades(1, xMax), label: 'k' }}
            y={{ min: yMin, max: 1, log: true, ticks: decades(yMin, 1) }}
            height={210}
            aria={t.ariaCcdf}
            marks={[{ x: fit.kMin, color: SKY, dashed: true, label: `k_min = ${fit.kMin}` }]}
            series={[
              { points: ccdf, color: INK, line: false, dots: 1.8 },
              { points: line, color: ORANGE_DARK, width: 2 },
            ]}
          />
          <Legend
            items={[
              { label: t.dataLine, color: INK },
              { label: t.fitLine, color: ORANGE_DARK },
            ]}
          />
        </div>
        <div className="min-w-0">
          <Eyebrow>{t.step2}</Eyebrow>
          <Chart
            x={{ min: 1, max: scanMax, log: true, ticks: decades(1, scanMax), label: 'k_min' }}
            y={{ min: 0, max: dTop, ticks: [0, dTop / 2, dTop], format: (x) => dec(x, 2), label: t.ks }}
            height={210}
            aria={t.ariaKs}
            marks={[{ x: fit.kMin, color: SKY, dashed: true }]}
            series={[{ points: scan.map((s) => [s.kMin, s.D]), color: INK, width: 1.4, dots: scan.length < 80 ? 1.6 : false }]}
          />
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 lg:grid-cols-5 gap-2" data-readout="fit">
        <Stat label={t.kMin}>{fit.kMin}</Stat>
        <Stat label={t.gammaHat}>
          {dec(fit.gamma)} ± {dec(fit.se)}
        </Stat>
        <Stat label={t.nTail}>
          {int(fit.nTail)} / {int(tab.n)}
        </Stat>
        <Stat label={t.range}>
          {fit.kMin} … {int(kMax)}
        </Stat>
        <Stat label={t.ks}>{dec(fit.D, 3)}</Stat>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2 items-start">
        <div className="min-w-0">
          <Eyebrow>{t.step3}</Eyebrow>
          <div className="mt-2 max-w-sm">
            <Slider
              label={t.sets}
              min={100}
              max={BOOT_MAX}
              step={100}
              value={sets}
              onChange={(x) => {
                setSets(x)
                exp.cancel()
                setTested(null)
              }}
              format={int}
            />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            {exp.running ? (
              <Pill onClick={exp.cancel}>{t.stop}</Pill>
            ) : (
              <Pill
                primary
                data-action="test"
                onClick={() => {
                  setTested(key)
                  exp.run(bootstrapJob(tab, fit, sets))
                }}
              >
                {t.test}
              </Pill>
            )}
            <span className="font-mono text-xs text-slate-500" aria-live="polite">
              {test ? t.progress(int(test.done), int(test.sets)) : ''}
            </span>
          </div>
          <div className="mt-2 h-1.5 max-w-sm rounded bg-slate-200 overflow-hidden" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={test ? Math.round((100 * test.done) / test.sets) : 0}>
            <div className="h-full bg-orange-500" style={{ width: `${test ? (100 * test.done) / test.sets : 0}%` }} />
          </div>
          <p className="mt-3 font-mono text-sm text-slate-900 tabular-nums" data-readout="p" data-done={p == null ? '0' : '1'}>
            {t.p}: {p == null ? (test && test.done ? `${pDec(test.p)} …` : t.notRun) : test.worse === 0 ? t.pNone(pLim(test.sets), int(test.sets)) : pDec(p)}
          </p>
          <p className="mt-1 text-xs text-slate-500 leading-snug">{t.pNote}</p>
        </div>
        <div className="min-w-0">
          <Eyebrow>{t.step4}</Eyebrow>
          <table className="mt-2 w-full text-sm" data-readout="compare">
            <thead>
              <tr>
                {t.cmpCol.slice(0, 3).map((c, i) => (
                  <th key={c} scope="col" className={`${th} ${i ? 'text-right' : 'text-left pl-0'}`}>
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {['lognormal', 'exponential', 'cutoff'].map((id) => (
                <tr key={id} className="border-t border-slate-100" data-candidate={id}>
                  <th scope="row" className="py-1.5 pr-2 text-left font-normal text-slate-700">
                    {t.cmpNames[id]}
                    <span className="block text-xs text-slate-500">{reading(cmp[id])}</span>
                  </th>
                  <td className={td}>{dec(cmp[id].R + 0, 1).replace(/^-0([.,]0)$/, '0$1')}</td>
                  <td className={td}>{cmp[id].p < 0.005 ? `< ${dec(0.01, 2)}` : dec(cmp[id].p, 2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 text-xs text-slate-500 leading-snug">{t.cmpNote}</p>
        </div>
      </div>

      <p className="mt-5 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 leading-snug" aria-live="polite" data-readout="verdict" data-kind={v.kind}>
        <span className="font-mono text-xs uppercase tracking-wider text-orange-600 font-semibold mr-2">{t.verdictLabel}</span>
        {verdictText} <span className="font-mono text-xs text-slate-500">({t.tailBeside(int(fit.nTail), int(tab.n))})</span>
      </p>

      <div className="mt-6 grid gap-6 md:grid-cols-2 items-start">
        <div className="min-w-0">
          <Eyebrow>{t.wrong}</Eyebrow>
          <table className="mt-2 w-full text-sm" data-readout="wrong">
            <tbody>
              {[
                ['equalBins', t.wrongRows.equalBins, dec(wrong.equalBins)],
                ['logBins', t.wrongRows.logBins, dec(wrong.logBins)],
                ['ccdf', t.wrongRows.ccdf, dec(wrong.ccdf)],
                ['mle', t.wrongRows.mle(wrong.smallest), dec(wrong.mleSmallest)],
                ['recipe', t.wrongRows.recipe, `${dec(fit.gamma)} ± ${dec(fit.se)}`],
                ['truth', t.wrongRows.truth, truth],
              ].map(([id, label, value], i) => (
                <tr key={id} className={`border-t border-slate-100 ${i >= 4 ? 'bg-orange-50/60' : ''}`} data-way={id}>
                  <th scope="row" className="py-1.5 pr-2 text-left font-normal text-slate-700">
                    {label}
                  </th>
                  <td className={td}>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="min-w-0">
          <Eyebrow>{t.hill}</Eyebrow>
          <Chart
            x={{ min: 1, max: 10 ** Math.ceil(Math.log10(tab.n)), log: true, ticks: decades(1, 10 ** Math.ceil(Math.log10(tab.n))), label: 'j' }}
            y={{ min: 1, max: 6, ticks: [1, 2, 3, 4, 5, 6], format: (x) => String(x) }}
            height={190}
            aria={t.ariaHill}
            marks={[{ x: fit.nTail, color: SKY, dashed: true }]}
            series={[
              { points: [[1, fit.gamma], [tab.n, fit.gamma]], color: ORANGE_DARK, dashed: true, width: 1.3 },
              { points: r.hill.filter((q) => q[1] <= 6), color: INK, width: 1.6 },
            ]}
          />
          <p className="mt-1 text-xs text-slate-500 leading-snug">{t.hillNote}</p>
        </div>
      </div>
    </div>
  )
}
