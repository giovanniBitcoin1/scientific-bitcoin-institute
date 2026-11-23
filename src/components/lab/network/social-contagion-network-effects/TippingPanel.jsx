import { useMemo, useState } from 'react'
import Slider from '../../Slider.jsx'
import { ORANGE_DARK, INK, SLATE, MUTED, Eyebrow, Pill, Stat } from '../ui.jsx'
import Chart, { Legend } from '../charts.jsx'
import { crowd, crowdHistogram, sdSweep, CROWD_N, CROWD_DEFAULT, CROWDS, CROWD_BINS, MARKET_DEFAULT, BASS_DEFAULT } from './experiments.js'
import { crowdCurve, marketEquilibria, marketPath, MAX_PRICE, bassF, bassRate, bassPeak } from './contagion.js'

// Panel A, "Tipping points": a crowd with thresholds (Granovetter), a market
// with a network effect, and the Bass curve.

const T = {
  en: {
    views: { crowd: 'A crowd', market: 'A market', bass: 'Bass curve' },
    mean: 'Mean threshold',
    sd: 'Standard deviation',
    again: 'New crowd',
    many: `${CROWDS} crowds`,
    sweep: 'Sweep the standard deviation',
    crowdNote: `${CROWD_N} people, thresholds drawn from a normal distribution (a negative threshold counts as zero). The orange steps count how many of this crowd have a threshold of r or less; the thin line is the same for the distribution itself, N F(r). Starting from nobody, the staircase climbs between the steps and the diagonal until they meet: that is the outcome.`,
    outcome: 'This crowd ends at',
    smooth: 'The smooth curve ends at',
    above: `Of ${CROWDS} crowds, end above 50`,
    notRun: 'press the button',
    curve: 'How many have a threshold of r or less, against r',
    legend: { crowd: 'this crowd', smooth: 'N F(r)', diagonal: 'diagonal', stairs: 'staircase' },
    hist: (m, s) => `Outcomes of ${CROWDS} crowds with mean ${m} and standard deviation ${s}`,
    histNote: (avg, lo, hi) => `Average outcome ${avg}; from ${lo} to ${hi}.`,
    sweepTitle: 'Outcome against the standard deviation, as a share of the crowd',
    sweepLegend: { smooth: 'smooth curve', crowds: `share of ${CROWDS} crowds ending above 50` },
    sdAxis: 'standard deviation',
    people: 'people',
    crowds: 'crowds',
    price: 'Price, p',
    z0: 'Starting share, z₀',
    marketNote: 'Person x values the good (1 − x) z when a share z uses it. At price p nobody wants to change where p = z (1 − z). From a starting share the market moves by z → max(0, 1 − p/z): those for whom the good is worth its price at the present share.',
    tipping: 'Tipping point',
    high: 'Stable high share',
    ends: 'From z₀ the market ends at',
    none: 'none: the price is above 1/4',
    demand: 'z (1 − z) against the share z, and the price',
    path: 'The share, step by step',
    step: 'step',
    share: 'share z',
    p: 'On their own, p',
    q: 'By imitation, q',
    bassNote: 'dF/dt = (p + qF)(1 − F): each person who has not adopted does so at rate p on their own, plus q times the share that already has.',
    peakT: 'Adoption is fastest at t* =',
    peakF: 'Share adopted by then',
    peakRate: 'Rate at the peak',
    perYear: 'a year',
    years: 'years',
    F: 'Share adopted, F(t)',
    rate: 'Adoption rate, dF/dt',
    t: 't',
    ariaCurve: 'Number of people with threshold at most r against r, for this crowd and for the distribution, with the diagonal and the staircase to the outcome',
    ariaHist: 'Histogram of the outcomes of 200 crowds',
    ariaSweep: 'Outcome of the smooth curve and share of sampled crowds ending above half, against the standard deviation of the thresholds',
    ariaDemand: 'The curve z times one minus z against the share z, with the price as a horizontal line',
    ariaPath: 'The share of users step by step from the starting share',
    ariaF: 'Share adopted against time in the Bass model',
    ariaRate: 'Adoption rate against time in the Bass model',
    locale: 'en-US',
  },
  it: {
    views: { crowd: 'Una folla', market: 'Un mercato', bass: 'Curva di Bass' },
    mean: 'Soglia media',
    sd: 'Deviazione standard',
    again: 'Nuova folla',
    many: `${CROWDS} folle`,
    sweep: 'Scansione della deviazione standard',
    crowdNote: `${CROWD_N} persone, soglie estratte da una distribuzione normale (una soglia negativa vale zero). I gradini arancioni contano quanti in questa folla hanno una soglia pari a r o inferiore; la linea sottile è lo stesso per la distribuzione, N F(r). Partendo da nessuno, la scala sale tra i gradini e la diagonale finché si incontrano: quello è l'esito.`,
    outcome: 'Questa folla finisce a',
    smooth: 'La curva liscia finisce a',
    above: `Su ${CROWDS} folle, finiscono sopra 50`,
    notRun: 'premi il pulsante',
    curve: 'Quanti hanno una soglia pari a r o inferiore, al variare di r',
    legend: { crowd: 'questa folla', smooth: 'N F(r)', diagonal: 'diagonale', stairs: 'scala' },
    hist: (m, s) => `Esiti di ${CROWDS} folle con media ${m} e deviazione standard ${s}`,
    histNote: (avg, lo, hi) => `Esito medio ${avg}; da ${lo} a ${hi}.`,
    sweepTitle: 'Esito al variare della deviazione standard, come quota della folla',
    sweepLegend: { smooth: 'curva liscia', crowds: `quota di ${CROWDS} folle che finiscono sopra 50` },
    sdAxis: 'deviazione standard',
    people: 'persone',
    crowds: 'folle',
    price: 'Prezzo, p',
    z0: 'Quota di partenza, z₀',
    marketNote: 'La persona x attribuisce al bene il valore (1 − x) z quando lo usa una quota z. Al prezzo p nessuno vuole cambiare dove p = z (1 − z). Da una quota di partenza il mercato si muove con z → max(0, 1 − p/z): coloro per i quali il bene vale il suo prezzo alla quota attuale.',
    tipping: 'Punto di svolta',
    high: 'Quota alta stabile',
    ends: 'Da z₀ il mercato finisce a',
    none: 'nessuno: il prezzo è sopra 1/4',
    demand: 'z (1 − z) al variare della quota z, e il prezzo',
    path: 'La quota, passo dopo passo',
    step: 'passo',
    share: 'quota z',
    p: 'Da soli, p',
    q: 'Per imitazione, q',
    bassNote: "dF/dt = (p + qF)(1 − F): chi non ha ancora adottato lo fa al ritmo p per conto proprio, più q volte la quota che ha già adottato.",
    peakT: "L'adozione è più rapida a t* =",
    peakF: 'Quota che ha adottato a quel punto',
    peakRate: 'Ritmo al picco',
    perYear: "all'anno",
    years: 'anni',
    F: 'Quota che ha adottato, F(t)',
    rate: 'Ritmo di adozione, dF/dt',
    t: 't',
    ariaCurve: "Numero di persone con soglia al più r al variare di r, per questa folla e per la distribuzione, con la diagonale e la scala fino all'esito",
    ariaHist: 'Istogramma degli esiti di 200 folle',
    ariaSweep: 'Esito della curva liscia e quota delle folle estratte che finiscono sopra la metà, al variare della deviazione standard delle soglie',
    ariaDemand: 'La curva z per uno meno z al variare della quota z, con il prezzo come linea orizzontale',
    ariaPath: 'La quota di utenti passo dopo passo dalla quota di partenza',
    ariaF: 'Quota che ha adottato al variare del tempo nel modello di Bass',
    ariaRate: 'Ritmo di adozione al variare del tempo nel modello di Bass',
    locale: 'it-IT',
  },
}

function Crowd({ t, num }) {
  const [mean, setMean] = useState(CROWD_DEFAULT.mean)
  const [sd, setSd] = useState(CROWD_DEFAULT.sd)
  const [index, setIndex] = useState(0)
  const [hist, setHist] = useState(null)
  const [sweep, setSweep] = useState(null)
  const c = useMemo(() => crowd(mean, sd, index), [mean, sd, index])
  const h = hist && hist.mean === mean && hist.sd === sd ? hist : null
  const sw = sweep && sweep.mean === mean ? sweep : null
  const steps = useMemo(() => {
    const pts = []
    let k = 0
    for (let r = 0; r <= CROWD_N; r++) {
      while (k < CROWD_N && c.sorted[k] <= r) k++
      pts.push([r, k], [Math.min(CROWD_N, r + 1), k])
    }
    return pts
  }, [c])
  const smooth = useMemo(() => Array.from({ length: 201 }, (_, i) => [i / 2, crowdCurve(CROWD_N, mean, sd, i / 2)]), [mean, sd])
  const stairs = useMemo(() => {
    const pts = [[0, 0]]
    for (let i = 1; i < c.staircase.length; i++) pts.push([c.staircase[i - 1], c.staircase[i]], [c.staircase[i], c.staircase[i]])
    return pts
  }, [c])
  const top = h ? Math.max(20, Math.ceil(Math.max(...h.bins) / 20) * 20) : 100

  return (
    <div>
      <div className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-2 max-w-2xl">
        <Slider label={t.mean} min={0} max={50} step={1} value={mean} onChange={(v) => { setMean(Math.round(v)); setIndex(0) }} />
        <Slider label={t.sd} min={1} max={50} step={0.1} value={sd} onChange={(v) => { setSd(Math.round(v * 10) / 10); setIndex(0) }} format={(v) => num(v, 1)} />
      </div>
      <p className="mt-2 text-xs text-slate-500 leading-snug">{t.crowdNote}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Pill onClick={() => setIndex((i) => i + 1)} data-action="again">
          {t.again}
        </Pill>
        <Pill primary onClick={() => setHist(crowdHistogram(mean, sd))} data-action="many">
          {t.many}
        </Pill>
        <Pill primary onClick={() => setSweep({ mean, rows: sdSweep(mean) })} data-action="sweep">
          {t.sweep}
        </Pill>
      </div>
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2" data-readout="crowd" data-mean={mean} data-sd={sd} data-index={index} data-outcome={c.outcome} data-smooth={c.smooth.toFixed(1)} data-stairs={c.staircase.join(' ')} data-above={h ? h.above.toFixed(3) : ''} data-average={h ? h.average.toFixed(1) : ''}>
        <Stat label={t.outcome}>
          <span style={{ color: ORANGE_DARK }}>{`${c.outcome} ${t.people}`}</span>
        </Stat>
        <Stat label={t.smooth}>{`${num(c.smooth, 1)} ${t.people}`}</Stat>
        <Stat label={t.above}>{h ? num(h.above, 3) : t.notRun}</Stat>
      </div>
      <div className="mt-4 grid gap-6 lg:grid-cols-2 items-start">
        <div className="min-w-0">
          <Eyebrow>{t.curve}</Eyebrow>
          <Chart
            x={{ min: 0, max: CROWD_N, ticks: [0, 25, 50, 75, 100], label: 'r' }}
            y={{ min: 0, max: CROWD_N, ticks: [0, 25, 50, 75, 100], labelSide: 'left' }}
            height={250}
            aria={t.ariaCurve}
            series={[
              { points: [[0, 0], [CROWD_N, CROWD_N]], color: MUTED, width: 1.2, dashed: true },
              { points: smooth, color: INK, width: 1 },
              { points: steps, color: ORANGE_DARK, width: 1.8 },
              { points: stairs, color: SLATE, width: 1.2 },
            ]}
          >
            {({ sx, sy }) => <circle cx={sx(c.outcome)} cy={sy(c.outcome)} r="3.4" fill={ORANGE_DARK} stroke="#ffffff" strokeWidth="1" />}
          </Chart>
          <Legend items={[{ label: t.legend.crowd, color: ORANGE_DARK }, { label: t.legend.smooth, color: INK }, { label: t.legend.stairs, color: SLATE }, { label: t.legend.diagonal, color: MUTED, dashed: true }]} />
        </div>
        {h && (
          <div className="min-w-0" data-readout="histogram" data-bins={h.bins.join(' ')}>
            <Eyebrow>{t.hist(h.mean, num(h.sd, 1))}</Eyebrow>
            <Chart x={{ min: 0, max: CROWD_N, ticks: [0, 25, 50, 75, 100], label: t.people }} y={{ min: 0, max: top, ticks: [0, top / 2, top], label: t.crowds }} height={190} aria={t.ariaHist} series={[]}>
              {({ sx, sy }) =>
                h.bins.map((b, i) => {
                  const w = CROWD_N / CROWD_BINS
                  return b > 0 ? <rect key={i} x={sx(i * w) + 0.5} y={sy(b)} width={sx((i + 1) * w) - sx(i * w) - 1} height={sy(0) - sy(b)} fill={i * w >= CROWD_N / 2 ? ORANGE_DARK : SLATE} /> : null
                })
              }
            </Chart>
            <p className="mt-1 text-xs text-slate-500 leading-snug">{t.histNote(num(h.average, 1), h.min, h.max)}</p>
          </div>
        )}
        {sw && (
          <div className="min-w-0" data-readout="sdsweep" data-smooth={sw.rows.map((r) => r.smooth.toFixed(1)).join(' ')} data-above={sw.rows.map((r) => r.above.toFixed(2)).join(' ')}>
            <Eyebrow>{t.sweepTitle}</Eyebrow>
            <Chart
              x={{ min: 0, max: 50, ticks: [0, 10, 20, 30, 40, 50], label: t.sdAxis }}
              y={{ min: 0, max: 1, ticks: [0, 0.25, 0.5, 0.75, 1], format: (v) => num(v, 2) }}
              height={190}
              aria={t.ariaSweep}
              marks={[{ x: sd, color: MUTED, dashed: true }]}
              series={[
                { points: sw.rows.map((r) => [r.sd, r.smooth / CROWD_N]), color: INK, width: 1.6 },
                { points: sw.rows.map((r) => [r.sd, r.above]), color: ORANGE_DARK, width: 1.2, dots: 1.8 },
              ]}
            />
            <Legend items={[{ label: t.sweepLegend.smooth, color: INK }, { label: t.sweepLegend.crowds, color: ORANGE_DARK }]} />
          </div>
        )}
      </div>
    </div>
  )
}

function Market({ t, num }) {
  const [p, setP] = useState(MARKET_DEFAULT.p)
  const [z0, setZ0] = useState(MARKET_DEFAULT.z0)
  const eq = marketEquilibria(p)
  const path = useMemo(() => marketPath(z0, p, 30), [z0, p])
  const end = marketPath(z0, p, 400)[400]
  return (
    <div>
      <div className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-2 max-w-2xl">
        <Slider label={t.price} min={0.01} max={0.3} step={0.01} value={p} onChange={(v) => setP(Math.round(v * 100) / 100)} format={(v) => num(v, 2)} />
        <Slider label={t.z0} min={0} max={1} step={0.01} value={z0} onChange={(v) => setZ0(Math.round(v * 100) / 100)} format={(v) => num(v, 2)} />
      </div>
      <p className="mt-2 text-xs text-slate-500 leading-snug">{t.marketNote}</p>
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2" data-readout="market" data-p={p} data-z0={z0} data-tipping={eq ? eq.tipping.toFixed(3) : ''} data-high={eq ? eq.high.toFixed(3) : ''} data-end={end.toFixed(3)} data-path={path.slice(0, 6).map((z) => z.toFixed(3)).join(' ')}>
        <Stat label={t.tipping}>{eq ? num(eq.tipping, 3) : t.none}</Stat>
        <Stat label={t.high}>{eq ? num(eq.high, 3) : '–'}</Stat>
        <Stat label={t.ends}>
          <span style={{ color: ORANGE_DARK }}>{num(end, 3)}</span>
        </Stat>
      </div>
      <div className="mt-4 grid gap-6 lg:grid-cols-2 items-start">
        <div className="min-w-0">
          <Eyebrow>{t.demand}</Eyebrow>
          <Chart
            x={{ min: 0, max: 1, ticks: [0, 0.25, 0.5, 0.75, 1], label: 'z', format: (v) => num(v, 2) }}
            y={{ min: 0, max: 0.3, ticks: [0, 0.1, 0.2, 0.3], format: (v) => num(v, 1) }}
            height={190}
            aria={t.ariaDemand}
            marks={[{ x: z0, color: ORANGE_DARK, dashed: true, label: 'z₀' }]}
            series={[
              { points: Array.from({ length: 101 }, (_, i) => [i / 100, (i / 100) * (1 - i / 100)]), color: INK, width: 1.8 },
              { points: [[0, p], [1, p]], color: SLATE, width: 1.2, dashed: true },
            ]}
          >
            {({ sx, sy }) => (eq ? [eq.tipping, eq.high].map((z, i) => <circle key={i} cx={sx(z)} cy={sy(p)} r="3.4" fill={i ? INK : '#ffffff'} stroke={INK} strokeWidth="1.4" />) : null)}
          </Chart>
          <p className="mt-1 text-xs text-slate-500 leading-snug">{`p = ${num(p, 2)} · ${num(MAX_PRICE, 2)} = max z (1 − z)`}</p>
        </div>
        <div className="min-w-0">
          <Eyebrow>{t.path}</Eyebrow>
          <Chart x={{ min: 0, max: 30, ticks: [0, 10, 20, 30], label: t.step }} y={{ min: 0, max: 1, ticks: [0, 0.25, 0.5, 0.75, 1], label: t.share, format: (v) => num(v, 2) }} height={190} aria={t.ariaPath} series={[{ points: path.map((z, i) => [i, z]), color: ORANGE_DARK, width: 1.8, dots: 1.6 }]} />
        </div>
      </div>
    </div>
  )
}

function Bass({ t, num }) {
  const [p, setP] = useState(BASS_DEFAULT.p)
  const [q, setQ] = useState(BASS_DEFAULT.q)
  const peak = bassPeak(p, q)
  const tMax = Math.min(100, Math.max(20, Math.ceil((2.5 * peak.t) / 10) * 10))
  const ts = Array.from({ length: 201 }, (_, i) => (i * tMax) / 200)
  const rTop = Math.max(0.05, Math.ceil(peak.rate * 20) / 20)
  return (
    <div>
      <div className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-2 max-w-2xl">
        <Slider label={t.p} min={0.001} max={0.1} step={0.001} value={p} onChange={(v) => setP(Math.round(v * 1000) / 1000)} format={(v) => num(v, 3)} />
        <Slider label={t.q} min={0} max={1} step={0.01} value={q} onChange={(v) => setQ(Math.round(v * 100) / 100)} format={(v) => num(v, 2)} />
      </div>
      <p className="mt-2 text-xs text-slate-500 leading-snug">{t.bassNote}</p>
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2" data-readout="bass" data-p={p} data-q={q} data-t={peak.t.toFixed(2)} data-f={peak.F.toFixed(3)} data-rate={peak.rate.toFixed(4)} data-f5={bassF(5, p, q).toFixed(3)} data-f10={bassF(10, p, q).toFixed(3)}>
        <Stat label={t.peakT}>
          <span style={{ color: ORANGE_DARK }}>{`${num(peak.t, 2)} ${t.years}`}</span>
        </Stat>
        <Stat label={t.peakF}>{num(peak.F, 3)}</Stat>
        <Stat label={t.peakRate}>{`${num(peak.rate, 4)} ${t.perYear}`}</Stat>
      </div>
      <div className="mt-4 grid gap-6 lg:grid-cols-2 items-start">
        <div className="min-w-0">
          <Eyebrow>{t.F}</Eyebrow>
          <Chart x={{ min: 0, max: tMax, ticks: [0, tMax / 2, tMax], label: t.t }} y={{ min: 0, max: 1, ticks: [0, 0.25, 0.5, 0.75, 1], format: (v) => num(v, 2) }} height={180} aria={t.ariaF} marks={[{ x: peak.t, color: MUTED, dashed: true, label: 't*' }]} series={[{ points: ts.map((x) => [x, bassF(x, p, q)]), color: INK, width: 1.9 }]} />
        </div>
        <div className="min-w-0">
          <Eyebrow>{t.rate}</Eyebrow>
          <Chart x={{ min: 0, max: tMax, ticks: [0, tMax / 2, tMax], label: t.t }} y={{ min: 0, max: rTop, ticks: [0, rTop / 2, rTop], format: (v) => num(v, 3) }} height={180} aria={t.ariaRate} marks={[{ x: peak.t, color: MUTED, dashed: true, label: 't*' }]} series={[{ points: ts.map((x) => [x, bassRate(x, p, q)]), color: ORANGE_DARK, width: 1.9 }]} />
        </div>
      </div>
    </div>
  )
}

export default function TippingPanel({ lang = 'en' }) {
  const t = T[lang] || T.en
  const num = (v, d) => (Number.isFinite(v) ? v.toLocaleString(t.locale, { minimumFractionDigits: d, maximumFractionDigits: d }) : '–')
  const [view, setView] = useState('crowd')
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {['crowd', 'market', 'bass'].map((id) => (
          <Pill key={id} active={view === id} onClick={() => setView(id)} data-view={id}>
            {t.views[id]}
          </Pill>
        ))}
      </div>
      {view === 'crowd' && <Crowd t={t} num={num} />}
      {view === 'market' && <Market t={t} num={num} />}
      {view === 'bass' && <Bass t={t} num={num} />}
    </div>
  )
}
