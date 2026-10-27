import { memo, useEffect, useMemo, useRef, useState } from 'react'
import {
  ScatterChart,
  Scatter,
  LineChart,
  Line,
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts'
import Slider from '../Slider.jsx'
import SimControls from '../SimControls.jsx'
import useAnimationLoop from '../useAnimationLoop.js'
import labConfig from '../../../data/lab/config.json'
import {
  SBI_WINDOW,
  daysSinceGenesis,
  dateFromDays,
  prepareSeries,
  analyseWindow,
  exponentStability,
  syntheticSeries,
  ADOPTION_MODELS,
  ADOPTION_DEFAULTS,
  adoptionCurve,
  DIFFICULTY_DEFAULTS,
  RETARGET_BLOCKS,
  createDifficultySim,
  mineUntil,
  mineBlock,
  currentPeriod,
  HALVING_BLOCKS,
  SAT_PER_BTC,
  subsidySat,
  supplySat,
  MAX_SUPPLY_SAT,
  LAST_SUBSIDY_HEIGHT,
  heightToMs,
  msToHeight,
  annualIssuanceRate,
  issuanceCurve,
} from '../bitcoin.js'

// Bitcoin as a complex adaptive system, in four panels: the power law in the
// price data, a toy model from adoption to network value, the difficulty
// adjustment as negative feedback, and the issuance schedule.

const ORANGE = '#f7931a'
const INK = '#0f172a' // slate-900
const SLATE = '#64748b' // slate-500
const SLATE_LIGHT = '#cbd5e1' // slate-300
const MUTED = '#94a3b8' // slate-400
const GRID = '#e2e8f0' // slate-200
const MONO = 'IBM Plex Mono, monospace'

// SBI's published exponent (Santostasi & Perrenod, preprint), shown for reference.
const SBI_BETA = 5.69
const SBI_BETA_SE = 0.05

// Panel A: the price file, if present, is loaded on demand. Not while the Lab
// is locked (src/data/lab/config.json): the lock presents it as a members'
// area, and the Coin Metrics data (CC BY-NC 4.0) may not be used in a paid
// one, so Panel A falls back to its synthetic placeholder.
const PRICE_FILE = '../../../data/lab/bitcoin-price.json'
const priceFiles = labConfig.locked
  ? {}
  : import.meta.glob('../../../data/lab/bitcoin-price.json', { import: 'default' })
// Source, licence and retrieval date of the price file, for the attribution line.
const PRICE_META = Object.values(import.meta.glob('../../../data/lab/bitcoin-price.meta.json', { eager: true, import: 'default' }))[0] || null
const MIN_WINDOW = 365 // days
const MAX_POINTS = 700 // points drawn in the price chart
const RES_BINS = 30

// Panel C
const MAX_DAYS = 730

const T = {
  en: {
    controls: { play: 'Play', pause: 'Pause', step: 'Step', reset: 'Reset' },
    seed: 'Seed',
    disclaimer:
      'This is educational material, not investment advice. A good fit to past data does not guarantee future prices.',

    // Panel A
    powerTitle: 'The power law in the data',
    seriesLabel: 'Series',
    seriesNames: { real: 'Bitcoin price', synthetic: 'Synthetic test series' },
    loading: 'Loading the price data…',
    placeholderTitle: 'Data to be provided',
    placeholderText:
      'This panel will fit a power law to the daily Bitcoin price, measured against the days since the genesis block. The price file has not been added to the site yet. Meanwhile, you can try every tool below on a synthetic test series.',
    trySynthetic: 'Explore with a synthetic series',
    realCaption: (n, a, b) => `${n} daily prices, from ${a} to ${b}. Time t is counted in days since the genesis block, which is day 0 (3 January 2009).`,
    windowNote: 'The fit window opens on the one of SBI’s published fit: from the first price in July 2010 to 28 February 2026.',
    resetWindow: 'Published window',
    attribution: (m, d) => `Price data: ${m.source}, ${m.licence}, retrieved ${d}.`,
    syntheticCaption:
      'Synthetic series, not Bitcoin prices: one value per day following t^5.69 exactly, multiplied by random fluctuations that persist for months and have heavy tails, in arbitrary units. Use it to see what the fitting tools can and cannot tell you when the true exponent is known.',
    axes: 'Axes',
    axesNames: { loglog: 'log–log', semilog: 'semi-log' },
    startLabel: 'Fit window, from',
    endLabel: 'Fit window, to',
    priceChart: 'Price against time since the genesis block',
    priceAria: (log) =>
      `Daily prices as dots on a logarithmic price axis against ${log ? 'a logarithmic' : 'a linear'} time axis, with the points inside the fit window in orange, the fitted power law as a solid line, the exponential fit dashed, and a line with the published slope 5.69 dotted.`,
    inWindow: 'in the fit window',
    outWindow: 'outside it',
    powerLine: 'power-law fit',
    expLine: 'exponential fit',
    sbiLine: 'slope 5.69 (SBI), through the centre of the window',
    daysAxis: 'days since genesis',
    priceUsd: 'price (USD)',
    priceArb: 'price (arbitrary units)',
    betaHat: 'Exponent β̂ (OLS)',
    r2Power: 'R², power law',
    r2Exp: 'R², exponential',
    nPoints: 'Points in the window',
    sbiRef: 'SBI published',
    sbiRefSub: '5,696 daily observations, R² = 0.961',
    resSd: 'Residual spread',
    resRho: 'Residual autocorrelation, 1 day',
    kurt: 'Excess kurtosis, daily changes',
    statNote:
      (se, lag) =>
      `The ± after β̂ is the textbook least-squares error, which assumes residuals independent from day to day. In a time series they are not: when today’s residual almost repeats yesterday’s, the data hold far fewer independent points than days, so naive error bars come out too small. This is why published uncertainties must allow for the correlation. A Newey–West standard error, which lets residuals up to ${lag} days apart be correlated, gives ± ${se} on this window; it widens further if longer correlations are allowed. The R² of the two fits are a simple comparison on the same window and the same log price, not a formal test between models.`,
    stabilityChart: 'Exponent as the window start moves',
    stabilityAria: 'The fitted exponent against the start date of the fit window, with the end of the window fixed; the published value 5.69 is dashed.',
    stabilityNote: 'End of the window fixed; start moved from the first data point to two years before the end.',
    currentStart: 'current start',
    residualsChart: 'Residuals over time',
    residualsAria: 'Residuals of the power-law fit in dex, against time.',
    residualsKey: 'log10(price) − fit, in dex (1 dex = a factor of 10)',
    histChart: 'Distribution of the residuals',
    histAria: 'Histogram of the residuals of the power-law fit, with a Gaussian of the same mean and spread as a line.',
    histBars: 'residuals',
    gaussian: 'Gaussian, same spread',
    density: 'density',
    dex: 'dex',
    date: 'date',

    // Panel B
    adoptTitle: 'From adoption to value (a toy model)',
    toyBadge: 'Toy model — not SBI’s model',
    model: 'Adoption',
    modelNames: { power: 'power law', logistic: 'S-curve (logistic)', bass: 'Bass' },
    modelNotes: {
      power: 'Users grow as n(t) = 1000 · t^a, with t in years.',
      logistic: 'Users follow an S-curve n(t) = K / (1 + e^(−r(t − t_m))): early on almost exponential, then slowing towards the ceiling K.',
      bass:
        'Bass (1969): each year a fraction p of those who have not adopted yet do so on their own (innovators) and a further share q times the adopted fraction copy those who have (imitators). Out of a market of m people.',
    },
    a: 'Adoption exponent a',
    K: 'Ceiling K',
    tm: 'Midpoint t_m (years)',
    r: 'Rate r (per year)',
    m: 'Market size m',
    p: 'Innovation p',
    q: 'Imitation q',
    k: 'Value exponent k (V ∝ n^k)',
    tFrom: 'Time, from (years)',
    tTo: 'Time, to (years)',
    nChart: 'Adoption n(t)',
    nAria: 'Log–log plot of the number of users against time.',
    vChart: 'Network value V(t) ∝ n^k',
    vAria: 'Log–log plot of the network value against time.',
    slopeChart: 'Local slope on log–log axes',
    slopeAria: 'The local log–log slopes of users and of value against time; for a pure power law the value slope is constant at a·k.',
    slopeN: 'slope of n',
    slopeV: 'slope of V',
    slopeRef: (v) => `a·k = ${v}`,
    years: 'years',
    users: 'users',
    value: 'value (arbitrary units)',
    slopeEnd: 'Slope of V at the end',
    slopeStart: 'Slope of V at the start',
    ak: 'a · k',
    adoptNote:
      'A pure power law gives a straight line with slope a·k on log–log axes, at every time. Any saturation bends it: the local slope of an S-curve or of the Bass model rises, peaks and falls towards zero as the ceiling is approached. A straight line over a long range is therefore informative, but it does not tell which mechanism produced it.',

    // Panel C
    diffTitle: 'Difficulty adjustment as feedback',
    growth: 'Hash-rate growth per year',
    shockDay: 'Shock on day',
    shock: 'Hash rate lost in the shock',
    recovery: 'Recovery',
    onOff: { off: 'Off', on: 'On' },
    halfLife: 'Recovery half-life (days)',
    speed: 'Days per second',
    diffNote:
      'Blocks arrive at random, as a Poisson process whose rate is hash rate divided by difficulty. Every 2016 blocks the difficulty is rescaled by two weeks divided by the time those blocks took, but by no more than a factor of four either way. Step mines one adjustment period.',
    hashChart: 'Hash rate and difficulty',
    hashAria: 'Hash rate and difficulty, both relative to their starting values, against time in days; the difficulty is a step line that moves at each retarget.',
    hashLine: 'hash rate',
    diffLine: 'difficulty (as the hash rate it is tuned for)',
    shockLine: 'shock',
    intervalChart: 'Block interval, rolling mean of 144 blocks',
    intervalAria: 'Mean time between blocks over the last 144 blocks, in minutes, against time in days, with the ten-minute target dashed and a faint vertical line at each retarget.',
    intervalLine: 'mean interval',
    targetLine: 'target, 10 minutes',
    retargetLine: 'retarget',
    minutes: 'minutes',
    day: 'day',
    dayStat: 'Day',
    height: 'Blocks mined',
    period: 'Adjustment period',
    left: 'Blocks until the next retarget',
    lastAdj: 'Last adjustment',
    clamped: 'clamped at ×4',
    periodMean: 'Mean interval this period',
    relative: 'relative to the start',
    done: (d) => `Stopped at day ${d}.`,

    // Panel D
    issuanceTitle: 'The issuance schedule',
    range: 'Range',
    rangeNames: { near: 'to about 2048', all: 'to about 2140' },
    supplyChart: 'Supply against block height',
    supplyAria: 'Total bitcoin issued against block height, approaching 21 million; a dashed line marks the current height estimate.',
    subsidyChart: 'Block subsidy',
    subsidyAria: 'The block subsidy in bitcoin, on a logarithmic axis, halving every 210,000 blocks.',
    rateChart: 'New supply per year, as a share of the existing supply',
    rateAria: 'The annual issuance rate in per cent, on a logarithmic axis, against block height.',
    supplyLine: 'supply',
    limitLine: '21 million',
    nowLine: 'now (estimate)',
    heightAxis: 'block height · approximate year',
    btc: 'BTC',
    heightNow: 'Current height (estimate)',
    subsidyNow: 'Subsidy per block',
    minedNow: 'Issued so far',
    ofLimit: (v) => `${v} of the limit`,
    nextHalving: 'Next halving',
    rateNow: 'Issuance rate now',
    perYear: 'per year',
    limit: 'Limit of the supply',
    lastBlock: (h) => `last subsidy at height ${h}`,
    issuanceNote:
      'Heights and dates are related approximately: past halvings are placed at their actual dates and, after the last one, one block every ten minutes is assumed, so the current height and future dates are estimates. Subsidies are computed in whole satoshi, as in the protocol.',
  },
  it: {
    controls: { play: 'Avvia', pause: 'Pausa', step: 'Passo', reset: 'Azzera' },
    seed: 'Seme',
    disclaimer:
      'Questo è materiale didattico, non una consulenza finanziaria. Un buon adattamento ai dati passati non garantisce i prezzi futuri.',

    powerTitle: 'La legge di potenza nei dati',
    seriesLabel: 'Serie',
    seriesNames: { real: 'Prezzo di Bitcoin', synthetic: 'Serie sintetica di prova' },
    loading: 'Caricamento dei dati di prezzo…',
    placeholderTitle: 'Dati in arrivo',
    placeholderText:
      'Questo pannello adatterà una legge di potenza al prezzo giornaliero di Bitcoin, misurato rispetto ai giorni trascorsi dal blocco genesi. Il file dei prezzi non è ancora stato aggiunto al sito. Nel frattempo puoi provare tutti gli strumenti qui sotto su una serie sintetica di prova.',
    trySynthetic: 'Esplora con una serie sintetica',
    realCaption: (n, a, b) => `${n} prezzi giornalieri, dal ${a} al ${b}. Il tempo t si conta in giorni dal blocco genesi, che è il giorno 0 (3 gennaio 2009).`,
    windowNote: 'La finestra parte da quella dell’adattamento pubblicato da SBI: dal primo prezzo di luglio 2010 al 28 febbraio 2026.',
    resetWindow: 'Finestra pubblicata',
    attribution: (m, d) => `Dati di prezzo: ${m.source}, ${m.licence}, scaricati il ${d}.`,
    syntheticCaption:
      'Serie sintetica, non prezzi di Bitcoin: un valore al giorno che segue esattamente t^5,69, moltiplicato per fluttuazioni casuali che persistono per mesi e hanno code pesanti, in unità arbitrarie. Usala per vedere che cosa gli strumenti di adattamento possono e non possono dirti quando l’esponente vero è noto.',
    axes: 'Assi',
    axesNames: { loglog: 'log–log', semilog: 'semi-log' },
    startLabel: 'Finestra di adattamento, dal',
    endLabel: 'Finestra di adattamento, al',
    priceChart: 'Prezzo contro il tempo dal blocco genesi',
    priceAria: (log) =>
      `Prezzi giornalieri come punti su un asse dei prezzi logaritmico contro un asse dei tempi ${log ? 'logaritmico' : 'lineare'}, con i punti dentro la finestra in arancione, la legge di potenza adattata come linea continua, l’adattamento esponenziale tratteggiato e una retta con la pendenza pubblicata 5,69 punteggiata.`,
    inWindow: 'nella finestra',
    outWindow: 'fuori dalla finestra',
    powerLine: 'legge di potenza adattata',
    expLine: 'adattamento esponenziale',
    sbiLine: 'pendenza 5,69 (SBI), per il centro della finestra',
    daysAxis: 'giorni dal blocco genesi',
    priceUsd: 'prezzo (USD)',
    priceArb: 'prezzo (unità arbitrarie)',
    betaHat: 'Esponente β̂ (OLS)',
    r2Power: 'R², legge di potenza',
    r2Exp: 'R², esponenziale',
    nPoints: 'Punti nella finestra',
    sbiRef: 'Valore pubblicato da SBI',
    sbiRefSub: '5.696 osservazioni giornaliere, R² = 0,961',
    resSd: 'Dispersione dei residui',
    resRho: 'Autocorrelazione dei residui, 1 giorno',
    kurt: 'Curtosi in eccesso, variazioni giornaliere',
    statNote:
      (se, lag) =>
      `Il ± dopo β̂ è l’errore dei minimi quadrati da manuale, che presuppone residui indipendenti da un giorno all’altro. In una serie temporale non lo sono: quando il residuo di oggi ripete quasi quello di ieri, i dati contengono molti meno punti indipendenti che giorni, e le barre d’errore ingenue risultano troppo piccole. Per questo le incertezze pubblicate devono tenere conto della correlazione. Un errore standard di Newey–West, che ammette residui correlati fino a ${lag} giorni di distanza, dà ± ${se} su questa finestra; si allarga ancora se si ammettono correlazioni più lunghe. Gli R² dei due adattamenti sono un semplice confronto sulla stessa finestra e sullo stesso logaritmo del prezzo, non un test formale tra modelli.`,
    stabilityChart: 'L’esponente al variare dell’inizio della finestra',
    stabilityAria: 'L’esponente adattato contro la data di inizio della finestra, con la fine fissa; il valore pubblicato 5,69 è tratteggiato.',
    stabilityNote: 'Fine della finestra fissa; inizio spostato dal primo dato fino a due anni prima della fine.',
    currentStart: 'inizio attuale',
    residualsChart: 'Residui nel tempo',
    residualsAria: 'Residui dell’adattamento a legge di potenza in dex, contro il tempo.',
    residualsKey: 'log10(prezzo) − adattamento, in dex (1 dex = un fattore 10)',
    histChart: 'Distribuzione dei residui',
    histAria: 'Istogramma dei residui dell’adattamento a legge di potenza, con una gaussiana di uguale media e dispersione come linea.',
    histBars: 'residui',
    gaussian: 'gaussiana, stessa dispersione',
    density: 'densità',
    dex: 'dex',
    date: 'data',

    adoptTitle: 'Dall’adozione al valore (un modello giocattolo)',
    toyBadge: 'Modello giocattolo — non è il modello di SBI',
    model: 'Adozione',
    modelNames: { power: 'legge di potenza', logistic: 'curva a S (logistica)', bass: 'Bass' },
    modelNotes: {
      power: 'Gli utenti crescono come n(t) = 1000 · t^a, con t in anni.',
      logistic: 'Gli utenti seguono una curva a S n(t) = K / (1 + e^(−r(t − t_m))): all’inizio quasi esponenziale, poi sempre più lenta verso il tetto K.',
      bass:
        'Bass (1969): ogni anno una frazione p di chi non ha ancora adottato lo fa da sé (innovatori) e un’ulteriore quota, q volte la frazione di chi ha già adottato, imita quest’ultimo (imitatori). Su un mercato di m persone.',
    },
    a: 'Esponente di adozione a',
    K: 'Tetto K',
    tm: 'Punto medio t_m (anni)',
    r: 'Tasso r (all’anno)',
    m: 'Dimensione del mercato m',
    p: 'Innovazione p',
    q: 'Imitazione q',
    k: 'Esponente del valore k (V ∝ n^k)',
    tFrom: 'Tempo, da (anni)',
    tTo: 'Tempo, a (anni)',
    nChart: 'Adozione n(t)',
    nAria: 'Grafico log–log del numero di utenti contro il tempo.',
    vChart: 'Valore della rete V(t) ∝ n^k',
    vAria: 'Grafico log–log del valore della rete contro il tempo.',
    slopeChart: 'Pendenza locale sugli assi log–log',
    slopeAria: 'Le pendenze locali log–log degli utenti e del valore contro il tempo; per una legge di potenza pura la pendenza del valore è costante e pari ad a·k.',
    slopeN: 'pendenza di n',
    slopeV: 'pendenza di V',
    slopeRef: (v) => `a·k = ${v}`,
    years: 'anni',
    users: 'utenti',
    value: 'valore (unità arbitrarie)',
    slopeEnd: 'Pendenza di V alla fine',
    slopeStart: 'Pendenza di V all’inizio',
    ak: 'a · k',
    adoptNote:
      'Una legge di potenza pura dà sugli assi log–log una retta di pendenza a·k, a ogni tempo. Qualunque saturazione la piega: la pendenza locale di una curva a S o del modello di Bass sale, raggiunge un massimo e scende verso zero man mano che ci si avvicina al tetto. Una retta su un lungo intervallo è quindi un’informazione, ma non dice quale meccanismo l’ha prodotta.',

    diffTitle: 'L’aggiustamento della difficoltà come retroazione',
    growth: 'Crescita dell’hash rate all’anno',
    shockDay: 'Shock al giorno',
    shock: 'Hash rate perso nello shock',
    recovery: 'Recupero',
    onOff: { off: 'No', on: 'Sì' },
    halfLife: 'Tempo di dimezzamento del recupero (giorni)',
    speed: 'Giorni al secondo',
    diffNote:
      'I blocchi arrivano a caso, come un processo di Poisson con tasso pari all’hash rate diviso per la difficoltà. Ogni 2016 blocchi la difficoltà viene riscalata di due settimane divise per il tempo impiegato da quei blocchi, ma non più di un fattore quattro in un senso o nell’altro. Passo estrae un periodo di aggiustamento.',
    hashChart: 'Hash rate e difficoltà',
    hashAria: 'Hash rate e difficoltà, entrambi rispetto ai valori iniziali, contro il tempo in giorni; la difficoltà è una linea a gradini che si sposta a ogni ricalcolo.',
    hashLine: 'hash rate',
    diffLine: 'difficoltà (come l’hash rate per cui è tarata)',
    shockLine: 'shock',
    intervalChart: 'Intervallo tra i blocchi, media mobile su 144 blocchi',
    intervalAria: 'Tempo medio tra i blocchi sugli ultimi 144 blocchi, in minuti, contro il tempo in giorni, con l’obiettivo di dieci minuti tratteggiato e una linea verticale tenue a ogni ricalcolo.',
    intervalLine: 'intervallo medio',
    targetLine: 'obiettivo, 10 minuti',
    retargetLine: 'ricalcolo',
    minutes: 'minuti',
    day: 'giorno',
    dayStat: 'Giorno',
    height: 'Blocchi estratti',
    period: 'Periodo di aggiustamento',
    left: 'Blocchi al prossimo ricalcolo',
    lastAdj: 'Ultimo aggiustamento',
    clamped: 'limitato a ×4',
    periodMean: 'Intervallo medio in questo periodo',
    relative: 'rispetto all’inizio',
    done: (d) => `Fermato al giorno ${d}.`,

    issuanceTitle: 'Il calendario di emissione',
    range: 'Intervallo',
    rangeNames: { near: 'fino al 2048 circa', all: 'fino al 2140 circa' },
    supplyChart: 'Offerta contro l’altezza dei blocchi',
    supplyAria: 'Bitcoin emessi in totale contro l’altezza dei blocchi, in avvicinamento a 21 milioni; una linea tratteggiata segna la stima dell’altezza attuale.',
    subsidyChart: 'Sussidio per blocco',
    subsidyAria: 'Il sussidio per blocco in bitcoin, su un asse logaritmico, che si dimezza ogni 210.000 blocchi.',
    rateChart: 'Nuova offerta all’anno, come quota dell’offerta esistente',
    rateAria: 'Il tasso di emissione annuo in percentuale, su un asse logaritmico, contro l’altezza dei blocchi.',
    supplyLine: 'offerta',
    limitLine: '21 milioni',
    nowLine: 'oggi (stima)',
    heightAxis: 'altezza del blocco · anno approssimativo',
    btc: 'BTC',
    heightNow: 'Altezza attuale (stima)',
    subsidyNow: 'Sussidio per blocco',
    minedNow: 'Emessi finora',
    ofLimit: (v) => `${v} del limite`,
    nextHalving: 'Prossimo halving',
    rateNow: 'Tasso di emissione oggi',
    perYear: 'all’anno',
    limit: 'Limite dell’offerta',
    lastBlock: (h) => `ultimo sussidio all’altezza ${h}`,
    issuanceNote:
      'Altezze e date sono collegate in modo approssimativo: gli halving passati sono collocati alle loro date reali e, dopo l’ultimo, si assume un blocco ogni dieci minuti, quindi l’altezza attuale e le date future sono stime. I sussidi sono calcolati in satoshi interi, come nel protocollo.',
  },
}

function fmtFixed(v, d, locale) {
  if (v == null || !Number.isFinite(v)) return '–'
  return v.toLocaleString(locale, { minimumFractionDigits: d, maximumFractionDigits: d })
}

const fmtInt = (v, locale) => Math.round(v).toLocaleString(locale)
const fmtPct = (v, locale, d = 0) => `${fmtFixed(v * 100, d, locale)}%`
const fmtSignedPct = (v, locale, d = 1) => (v == null ? '–' : `${v > 0 ? '+' : v < 0 ? '−' : ''}${fmtFixed(Math.abs(v) * 100, d, locale)}%`)

// Three significant figures, switching to powers of ten outside 0.01 … 10⁵.
function fmtSig(v, locale) {
  if (!Number.isFinite(v)) return '–'
  const a = Math.abs(v)
  if (a !== 0 && (a < 0.01 || a >= 1e5)) return v.toExponential(2).replace('e+', 'e')
  return v.toLocaleString(locale, { maximumSignificantDigits: 3 })
}

const fmtDate = (day, locale) =>
  new Date(dateFromDays(day)).toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' })
const fmtMs = (ms, locale) => new Date(ms).toLocaleDateString(locale, { year: 'numeric', month: 'short', timeZone: 'UTC' })
const yearOfDay = (day) => Number(dateFromDays(day).slice(0, 4))

const SUPERSCRIPT = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' }
const powTick = (v) => {
  const e = Math.round(Math.log10(v))
  if (e === 0) return '1'
  if (e === 1) return '10'
  return `10${String(e).replace(/./g, (c) => SUPERSCRIPT[c])}`
}

// Powers of ten covering [lo, hi], for the domain and ticks of a log axis;
// over many decades only every few get a tick.
function decades(lo, hi) {
  const a = Math.floor(Math.log10(lo))
  const b = Math.max(a + 1, Math.ceil(Math.log10(hi) - 1e-9))
  const every = Math.ceil((b - a + 1) / 7)
  const ticks = []
  for (let e = b; e >= a; e -= every) ticks.unshift(10 ** e)
  return { domain: [10 ** a, 10 ** b], ticks }
}

// Ticks 1, 2, 5 × 10ⁿ inside [lo, hi], for a log axis spanning less than two decades.
function ticks125(lo, hi) {
  const out = []
  for (let e = Math.floor(Math.log10(lo)); e <= Math.ceil(Math.log10(hi)); e++) {
    for (const m of [1, 2, 5]) {
      const v = m * 10 ** e
      if (v >= lo && v <= hi) out.push(v)
    }
  }
  return out
}

// Days of 1 January for years in [d0, d1], every `every` years.
function yearTicks(d0, d1, every = 2) {
  const out = []
  for (let y = yearOfDay(d0); y <= yearOfDay(d1) + 1; y++) {
    const d = daysSinceGenesis(`${y}-01-01`)
    if (y % every === 0 && d >= d0 && d <= d1) out.push(d)
  }
  return out
}

function PanelTitle({ children }) {
  return (
    <p className="text-xs uppercase tracking-wider text-orange-600 font-semibold font-mono">
      {children}
    </p>
  )
}

const panel = 'bg-white rounded-xl border border-slate-200 shadow-sm p-4 md:p-6 min-w-0'
const axisTick = { fontSize: 11, fontFamily: MONO }
const tooltipStyle = { fontFamily: MONO, fontSize: 12 }

const chip = (active) =>
  `px-2.5 py-1 rounded-full border text-xs font-mono transition-colors ${
    active
      ? 'border-orange-500 bg-orange-500 text-white'
      : 'border-slate-200 bg-white text-slate-600 hover:text-orange-600 hover:border-orange-300'
  }`

function Chips({ label, options, value, onChange, names }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-slate-700 mr-1">{label}</span>
      {options.map((o) => (
        <button key={o} type="button" className={chip(value === o)} aria-pressed={value === o} onClick={() => onChange(o)}>
          {names[o]}
        </button>
      ))}
    </div>
  )
}

function Stat({ label, children }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 px-3 py-2.5 min-w-0">
      <span className="block text-xs text-slate-500 font-sans">{label}</span>
      <span className="block mt-0.5 text-slate-900 tabular-nums">{children}</span>
    </div>
  )
}

function LineSwatch({ color, width = 2, dashed = false, dotted = false }) {
  return (
    <span
      className="inline-block w-5 shrink-0"
      style={{ borderTop: `${width}px ${dotted ? 'dotted' : dashed ? 'dashed' : 'solid'} ${color}` }}
      aria-hidden="true"
    />
  )
}

function DotSwatch({ color, size = 8 }) {
  return <span className="inline-block shrink-0 rounded-full" style={{ width: size, height: size, background: color }} aria-hidden="true" />
}

function Legend({ children }) {
  return <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-slate-600">{children}</div>
}

function LegendItem({ swatch, children }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {swatch} {children}
    </span>
  )
}

function Disclaimer({ t }) {
  return (
    <p className="mt-6 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 leading-relaxed">
      {t.disclaimer}
    </p>
  )
}

// A Scatter drawn only as a line, for curves.
const NoDot = () => null
const DotIn = ({ cx, cy }) => <circle cx={cx} cy={cy} r={1.6} fill={ORANGE} />
const DotOut = ({ cx, cy }) => <circle cx={cx} cy={cy} r={1.6} fill={SLATE_LIGHT} />

// Repaints charts at most a few times per second while a simulation runs.
function useThrottledVersion(ms = 400) {
  const [version, setVersion] = useState(0)
  const last = useRef(0)
  const bump = (force = false) => {
    const now = performance.now()
    if (force || now - last.current > ms) {
      last.current = now
      setVersion((v) => v + 1)
    }
  }
  return [version, bump]
}

// Every k-th element, so that at most `max` remain (the last one included).
function thin(arr, max) {
  if (arr.length <= max) return arr
  const k = Math.ceil(arr.length / max)
  const out = []
  for (let i = 0; i < arr.length; i += k) out.push(arr[i])
  if (out[out.length - 1] !== arr[arr.length - 1]) out.push(arr[arr.length - 1])
  return out
}

// ---------------------------------------------------------------- Panel A

// Indices of the points to draw: a point is kept when it is far enough from
// the last kept one in log t or in t, so both kinds of axis stay well covered.
function drawIndices(series) {
  const { n, t, x } = series
  if (!n) return []
  const dx = (x[n - 1] - x[0]) / (MAX_POINTS / 2)
  const dt = (t[n - 1] - t[0]) / (MAX_POINTS / 2)
  const out = [0]
  for (let i = 1; i < n; i++) {
    const j = out[out.length - 1]
    if (x[i] - x[j] >= dx || t[i] - t[j] >= dt || i === n - 1) out.push(i)
  }
  return out
}

function usePriceData() {
  const [state, setState] = useState(() => (priceFiles[PRICE_FILE] ? { status: 'loading' } : { status: 'missing' }))
  useEffect(() => {
    const load = priceFiles[PRICE_FILE]
    if (!load) return
    let alive = true
    load()
      .then((rows) => {
        if (!alive) return
        const series = prepareSeries(Array.isArray(rows) ? rows : [])
        setState(series.n >= 30 ? { status: 'ready', series } : { status: 'missing' })
      })
      .catch(() => alive && setState({ status: 'missing' }))
    return () => {
      alive = false
    }
  }, [])
  return state
}

const PriceChart = memo(function PriceChart({ series, idx, w, logX, synthetic, t, locale }) {
  const chart = useMemo(() => {
    const { t: days, y, n } = series
    const inside = []
    const outside = []
    for (const i of idx) (i >= w.i0 && i < w.i1 ? inside : outside).push({ t: days[i], p: 10 ** y[i] })
    const d0 = days[w.i0]
    const d1 = days[w.i1 - 1]
    const curve = (f) => {
      const pts = []
      for (let k = 0; k <= 48; k++) {
        const d = logX ? d0 * (d1 / d0) ** (k / 48) : d0 + ((d1 - d0) * k) / 48
        pts.push({ t: d, p: 10 ** f(d) })
      }
      return pts
    }
    const { a, b } = w.power
    const power = curve((d) => a + b * Math.log10(d))
    const exp = curve((d) => w.exp.a + w.exp.b * d)
    // The published slope, through the centre of mass of the window in log–log space.
    let mx = 0
    let my = 0
    for (let i = w.i0; i < w.i1; i++) {
      mx += series.x[i]
      my += y[i]
    }
    mx /= w.n
    my /= w.n
    const sbi = curve((d) => my + SBI_BETA * (Math.log10(d) - mx))
    let lo = Infinity
    let hi = -Infinity
    for (let i = 0; i < n; i++) {
      if (y[i] < lo) lo = y[i]
      if (y[i] > hi) hi = y[i]
    }
    const yAxis = decades(10 ** lo, 10 ** hi)
    const xDomain = logX ? [days[0] * 0.92, days[n - 1] * 1.08] : [days[0], days[n - 1]]
    const xTicks = logX ? ticks125(xDomain[0], xDomain[1]) : yearTicks(days[0], days[n - 1], days[n - 1] - days[0] > 3650 ? 2 : 1)
    return { inside, outside, power, exp, sbi, yAxis, xDomain, xTicks }
  }, [series, idx, w, logX])

  return (
    <div className="min-w-0">
      <PanelTitle>{t.priceChart}</PanelTitle>
      <div className="mt-3 h-72 sm:h-80 -ml-4" role="img" aria-label={t.priceAria(logX)}>
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 8, right: 14, bottom: 4, left: 0 }}>
            <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
            <XAxis
              dataKey="t"
              type="number"
              scale={logX ? 'log' : 'linear'}
              domain={chart.xDomain}
              ticks={chart.xTicks}
              allowDataOverflow
              tickFormatter={(v) => (logX ? fmtInt(v, locale) : String(yearOfDay(v)))}
              tick={axisTick}
              stroke={MUTED}
            />
            <YAxis
              dataKey="p"
              type="number"
              scale="log"
              domain={chart.yAxis.domain}
              ticks={chart.yAxis.ticks}
              tickFormatter={powTick}
              allowDataOverflow
              width={44}
              tick={axisTick}
              stroke={MUTED}
            />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              formatter={(v, name) => (name === 't' ? [fmtDate(v, locale), t.date] : [fmtSig(v, locale), synthetic ? t.priceArb : t.priceUsd])}
              contentStyle={tooltipStyle}
            />
            <Scatter data={chart.outside} shape={DotOut} isAnimationActive={false} />
            <Scatter data={chart.inside} shape={DotIn} isAnimationActive={false} />
            <Scatter data={chart.sbi} line={{ stroke: INK, strokeWidth: 1.5, strokeDasharray: '1 3' }} shape={NoDot} isAnimationActive={false} />
            <Scatter data={chart.exp} line={{ stroke: SLATE, strokeWidth: 1.5, strokeDasharray: '6 4' }} shape={NoDot} isAnimationActive={false} />
            <Scatter data={chart.power} line={{ stroke: INK, strokeWidth: 2 }} shape={NoDot} isAnimationActive={false} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <Legend>
        <LegendItem swatch={<DotSwatch color={ORANGE} size={6} />}>{t.inWindow}</LegendItem>
        <LegendItem swatch={<DotSwatch color={SLATE_LIGHT} size={6} />}>{t.outWindow}</LegendItem>
        <LegendItem swatch={<LineSwatch color={INK} />}>{t.powerLine}</LegendItem>
        <LegendItem swatch={<LineSwatch color={SLATE} width={1.5} dashed />}>{t.expLine}</LegendItem>
        <LegendItem swatch={<LineSwatch color={INK} width={2} dotted />}>{t.sbiLine}</LegendItem>
      </Legend>
      <p className="mt-1 font-mono text-xs text-slate-500">
        {logX ? t.daysAxis : t.date} · {synthetic ? t.priceArb : t.priceUsd}
      </p>
    </div>
  )
})

const StabilityChart = memo(function StabilityChart({ series, endDay, startDay, t, locale }) {
  const data = useMemo(() => exponentStability(series, endDay), [series, endDay])
  if (data.length < 2) return null
  const lo = Math.min(...data.map((d) => d.beta), SBI_BETA)
  const hi = Math.max(...data.map((d) => d.beta), SBI_BETA)
  const pad = Math.max(0.1, (hi - lo) * 0.1)
  const d0 = data[0].day
  const d1 = data[data.length - 1].day
  return (
    <div className="min-w-0">
      <PanelTitle>{t.stabilityChart}</PanelTitle>
      <div className="mt-3 h-52 -ml-4" role="img" aria-label={t.stabilityAria}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 14, bottom: 4, left: 0 }}>
            <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
            <XAxis dataKey="day" type="number" domain={[d0, d1]} ticks={yearTicks(d0, d1, d1 - d0 > 3650 ? 2 : 1)} tickFormatter={(v) => String(yearOfDay(v))} tick={axisTick} stroke={MUTED} />
            <YAxis domain={[Math.floor((lo - pad) * 10) / 10, Math.ceil((hi + pad) * 10) / 10]} tickFormatter={(v) => fmtFixed(v, 1, locale)} width={44} tick={axisTick} stroke={MUTED} />
            <ReferenceLine y={SBI_BETA} stroke={INK} strokeWidth={1.25} strokeDasharray="5 4" />
            {startDay >= d0 && startDay <= d1 && <ReferenceLine x={startDay} stroke={ORANGE} strokeWidth={1} />}
            <Tooltip
              formatter={(v) => [fmtFixed(v, 3, locale), 'β̂']}
              labelFormatter={(v) => fmtDate(v, locale)}
              contentStyle={tooltipStyle}
            />
            <Line type="linear" dataKey="beta" stroke={ORANGE} strokeWidth={2} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <Legend>
        <LegendItem swatch={<LineSwatch color={ORANGE} />}>β̂</LegendItem>
        <LegendItem swatch={<LineSwatch color={INK} width={1.5} dashed />}>{t.sbiRef}, {fmtFixed(SBI_BETA, 2, locale)}</LegendItem>
        <LegendItem swatch={<LineSwatch color={ORANGE} width={1} />}>{t.currentStart}</LegendItem>
      </Legend>
      <p className="mt-1 text-xs text-slate-500">{t.stabilityNote}</p>
    </div>
  )
})

const ResidualCharts = memo(function ResidualCharts({ series, w, t, locale }) {
  const { line, hist, lim } = useMemo(() => {
    const pts = []
    for (let i = 0; i < w.n; i++) pts.push({ day: series.t[w.i0 + i], r: w.residuals[i] })
    let m = 0
    for (const v of w.residuals) m = Math.max(m, Math.abs(v))
    const lim = Math.max(0.1, Math.ceil(m * 10) / 10)
    const width = (2 * lim) / RES_BINS
    const counts = new Array(RES_BINS).fill(0)
    for (const v of w.residuals) counts[Math.min(RES_BINS - 1, Math.max(0, Math.floor((v + lim) / width)))]++
    let mean = 0
    for (const v of w.residuals) mean += v
    mean /= w.n
    const sd = Math.sqrt(w.residuals.reduce((s, v) => s + (v - mean) ** 2, 0) / w.n)
    const hist = counts.map((c, k) => {
      const x = -lim + (k + 0.5) * width
      return {
        x: fmtFixed(x, 2, locale),
        density: c / w.n / width,
        gauss: sd > 0 ? Math.exp(-((x - mean) ** 2) / (2 * sd * sd)) / (sd * Math.sqrt(2 * Math.PI)) : 0,
      }
    })
    return { line: thin(pts, 600), hist, lim }
  }, [series, w, locale])
  const d0 = line[0].day
  const d1 = line[line.length - 1].day
  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-2">
      <div className="min-w-0">
        <PanelTitle>{t.residualsChart}</PanelTitle>
        <div className="mt-3 h-52 -ml-4" role="img" aria-label={t.residualsAria}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={line} margin={{ top: 8, right: 14, bottom: 4, left: 0 }}>
              <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
              <XAxis dataKey="day" type="number" domain={[d0, d1]} ticks={yearTicks(d0, d1, d1 - d0 > 3650 ? 2 : 1)} tickFormatter={(v) => String(yearOfDay(v))} tick={axisTick} stroke={MUTED} />
              <YAxis domain={[-lim, lim]} tickFormatter={(v) => fmtFixed(v, 1, locale)} width={44} tick={axisTick} stroke={MUTED} />
              <ReferenceLine y={0} stroke={INK} strokeWidth={1} />
              <Tooltip formatter={(v) => [`${fmtFixed(v, 3, locale)} ${t.dex}`, t.histBars]} labelFormatter={(v) => fmtDate(v, locale)} contentStyle={tooltipStyle} />
              <Line type="linear" dataKey="r" stroke={SLATE} strokeWidth={1.5} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-1 font-mono text-xs text-slate-500">{t.residualsKey}</p>
      </div>
      <div className="min-w-0">
        <PanelTitle>{t.histChart}</PanelTitle>
        <div className="mt-3 h-52 -ml-4" role="img" aria-label={t.histAria}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={hist} margin={{ top: 8, right: 8, bottom: 4, left: 0 }} barCategoryGap={1}>
              <CartesianGrid stroke={GRID} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="x" tick={axisTick} stroke={MUTED} minTickGap={12} />
              <YAxis width={44} tick={axisTick} stroke={MUTED} tickFormatter={(v) => fmtSig(v, locale)} />
              <Tooltip formatter={(v, name) => [fmtSig(v, locale), name === 'gauss' ? t.gaussian : t.density]} labelFormatter={(v) => `${v} ${t.dex}`} contentStyle={tooltipStyle} />
              <Bar dataKey="density" fill={SLATE_LIGHT} isAnimationActive={false} />
              <Line type="monotone" dataKey="gauss" stroke={INK} strokeWidth={1.5} strokeDasharray="5 4" dot={false} isAnimationActive={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <Legend>
          <LegendItem swatch={<DotSwatch color={SLATE_LIGHT} />}>{t.histBars}</LegendItem>
          <LegendItem swatch={<LineSwatch color={INK} width={1.5} dashed />}>{t.gaussian}</LegendItem>
        </Legend>
        <p className="mt-1 font-mono text-xs text-slate-500">{t.dex}</p>
      </div>
    </div>
  )
})

function PowerLawPanel({ t, locale }) {
  const price = usePriceData()
  const [source, setSource] = useState('real')
  const [seed, setSeed] = useState(1)
  const [logX, setLogX] = useState(true)
  const [win, setWin] = useState(null) // { start, end } in days, or null for the whole series

  const synthetic = source === 'synthetic'
  const series = useMemo(
    () => (synthetic ? prepareSeries(syntheticSeries({ seed })) : price.status === 'ready' ? price.series : null),
    [synthetic, seed, price],
  )
  // Real data open on the window of SBI's published fit; the synthetic series on all of it.
  const publishedWin = { start: daysSinceGenesis(SBI_WINDOW.start), end: daysSinceGenesis(SBI_WINDOW.end) }
  useEffect(() => setWin(synthetic ? null : publishedWin), [series]) // eslint-disable-line react-hooks/exhaustive-deps

  const first = series ? series.t[0] : 0
  const last = series ? series.t[series.n - 1] : 1
  const start = win ? Math.max(first, win.start) : first
  const end = win ? Math.min(last, win.end) : last
  const w = useMemo(() => (series ? analyseWindow(series, start, end) : null), [series, start, end])
  const idx = useMemo(() => (series ? drawIndices(series) : []), [series])

  const setStart = (v) => setWin({ start: Math.min(v, last - MIN_WINDOW), end: Math.max(end, Math.min(v, last - MIN_WINDOW) + MIN_WINDOW) })
  const setEnd = (v) => setWin({ end: Math.max(v, first + MIN_WINDOW), start: Math.min(start, Math.max(v, first + MIN_WINDOW) - MIN_WINDOW) })

  return (
    <div className={panel}>
      <PanelTitle>A · {t.powerTitle}</PanelTitle>
      <div className="mt-4">
        <Chips label={t.seriesLabel} options={['real', 'synthetic']} value={source} names={t.seriesNames} onChange={setSource} />
      </div>

      {!synthetic && price.status === 'loading' && <p className="mt-4 text-sm text-slate-500">{t.loading}</p>}

      {!synthetic && price.status === 'missing' && (
        <div className="mt-4 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center">
          <p className="font-mono text-xs uppercase tracking-wider text-orange-600 font-semibold">{t.placeholderTitle}</p>
          <p className="mt-3 text-sm text-slate-600 leading-relaxed max-w-xl mx-auto">{t.placeholderText}</p>
          <button type="button" className={`mt-4 ${chip(false)}`} onClick={() => setSource('synthetic')}>
            {t.trySynthetic}
          </button>
        </div>
      )}

      {series && w && (
        <>
          <p className="mt-3 text-xs text-slate-500 leading-relaxed">
            {synthetic ? t.syntheticCaption : t.realCaption(fmtInt(series.n, locale), fmtDate(first, locale), fmtDate(last, locale))}
          </p>
          <div className="mt-4">
            <Chips label={t.axes} options={['loglog', 'semilog']} value={logX ? 'loglog' : 'semilog'} names={t.axesNames} onChange={(v) => setLogX(v === 'loglog')} />
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Slider label={t.startLabel} min={first} max={last} step={1} value={start} onChange={setStart} format={(v) => fmtDate(v, locale)} />
            <Slider label={t.endLabel} min={first} max={last} step={1} value={end} onChange={setEnd} format={(v) => fmtDate(v, locale)} />
            {synthetic && <Slider label={t.seed} min={1} max={50} step={1} value={seed} onChange={setSeed} />}
          </div>
          {!synthetic && (
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <p className="text-xs text-slate-500 leading-relaxed flex-1 min-w-[12rem]">{t.windowNote}</p>
              <button type="button" className={chip(false)} onClick={() => setWin(publishedWin)}>
                {t.resetWindow}
              </button>
            </div>
          )}

          <div className="mt-6">
            <PriceChart series={series} idx={idx} w={w} logX={logX} synthetic={synthetic} t={t} locale={locale} />
            {!synthetic && PRICE_META && (
              <p className="mt-2 text-xs text-slate-500">
                <a href={PRICE_META.url} target="_blank" rel="noopener noreferrer" className="underline decoration-slate-300 hover:text-orange-600">
                  {t.attribution(PRICE_META, fmtDate(daysSinceGenesis(PRICE_META.retrieved), locale))}
                </a>
              </p>
            )}
          </div>

          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-sm">
            <div className="col-span-2">
              <Stat label={t.sbiRef}>
                β = {fmtFixed(SBI_BETA, 2, locale)} ± {fmtFixed(SBI_BETA_SE, 2, locale)}
                <span className="block text-xs text-slate-500">{t.sbiRefSub}</span>
              </Stat>
            </div>
            <div className="col-span-2">
              <Stat label={t.betaHat}>
                <span className="text-orange-700">{fmtFixed(w.power.b, 3, locale)}</span>
                <span className="text-slate-500"> ± {fmtFixed(w.power.se, 3, locale)}</span>
              </Stat>
            </div>
            <Stat label={t.r2Power}>{fmtFixed(w.power.r2, 3, locale)}</Stat>
            <Stat label={t.r2Exp}>{fmtFixed(w.exp.r2, 3, locale)}</Stat>
            <Stat label={t.nPoints}>{fmtInt(w.n, locale)}</Stat>
            <Stat label={t.resSd}>
              {fmtFixed(w.sd, 2, locale)} {t.dex}
            </Stat>
            <Stat label={t.resRho}>{fmtFixed(w.rho, 3, locale)}</Stat>
            <Stat label={t.kurt}>{fmtFixed(w.kurtosis, 1, locale)}</Stat>
          </div>
          <p className="mt-2 text-xs text-slate-500 leading-relaxed">{t.statNote(fmtFixed(w.seRobust, 3, locale), w.nwLag)}</p>

          <div className="mt-6">
            <StabilityChart series={series} endDay={end} startDay={start} t={t} locale={locale} />
          </div>
          <ResidualCharts series={series} w={w} t={t} locale={locale} />
        </>
      )}

      <Disclaimer t={t} />
    </div>
  )
}

// ---------------------------------------------------------------- Panel B

const LogLogCurve = memo(function LogLogCurve({ data, dataKey, title, aria, yLabel, t, locale }) {
  const vals = data.map((d) => d[dataKey]).filter((v) => v > 0 && Number.isFinite(v))
  const y = decades(Math.max(Math.min(...vals), 1e-300), Math.max(...vals))
  const x = decades(data[0].t, data[data.length - 1].t)
  return (
    <div className="min-w-0">
      <PanelTitle>{title}</PanelTitle>
      <div className="mt-3 h-52 -ml-4" role="img" aria-label={aria}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 14, bottom: 4, left: 0 }}>
            <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
            <XAxis dataKey="t" type="number" scale="log" domain={[data[0].t, data[data.length - 1].t]} ticks={x.ticks.filter((v) => v >= data[0].t * 0.999 && v <= data[data.length - 1].t * 1.001)} allowDataOverflow tickFormatter={(v) => fmtSig(v, locale)} tick={axisTick} stroke={MUTED} />
            <YAxis type="number" scale="log" domain={y.domain} ticks={y.ticks} allowDataOverflow tickFormatter={powTick} width={44} tick={axisTick} stroke={MUTED} />
            <Tooltip formatter={(v) => [fmtSig(v, locale), yLabel]} labelFormatter={(v) => `t = ${fmtSig(v, locale)} ${t.years}`} contentStyle={tooltipStyle} />
            <Line type="linear" dataKey={dataKey} stroke={ORANGE} strokeWidth={2} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-1 font-mono text-xs text-slate-500">
        {t.years} · {yLabel}
      </p>
    </div>
  )
})

function AdoptionPanel({ t, locale }) {
  const [model, setModel] = useState('power')
  const [o, setO] = useState(ADOPTION_DEFAULTS)
  const [k, setK] = useState(2)
  const [tMin, setTMin] = useState(0.5)
  const [tMax, setTMax] = useState(40)
  const set = (patch) => setO((prev) => ({ ...prev, ...patch }))

  const data = useMemo(() => adoptionCurve(model, o, k, tMin, tMax), [model, o, k, tMin, tMax])
  const slopeRange = useMemo(() => {
    const vs = data.flatMap((d) => [d.slopeN, d.slopeV]).filter(Number.isFinite)
    return [Math.min(0, Math.floor(Math.min(...vs))), Math.max(1, Math.ceil(Math.max(...vs)))]
  }, [data])
  const f2 = (v) => fmtFixed(v, 2, locale)
  const ak = o.a * k

  return (
    <div className={panel}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <PanelTitle>B · {t.adoptTitle}</PanelTitle>
        <span className="rounded-full border border-orange-300 bg-orange-50 px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-wider text-orange-700">{t.toyBadge}</span>
      </div>
      <div className="mt-4">
        <Chips label={t.model} options={ADOPTION_MODELS} value={model} names={t.modelNames} onChange={setModel} />
      </div>
      <p className="mt-2 text-xs text-slate-500 leading-relaxed">{t.modelNotes[model]}</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {model === 'power' && <Slider label={t.a} min={0.5} max={4} step={0.05} value={o.a} onChange={(v) => set({ a: v })} format={f2} />}
        {model === 'logistic' && (
          <>
            <Slider label={t.K} min={1e4} max={1e10} log value={o.K} onChange={(v) => set({ K: Number(v.toPrecision(2)) })} format={(v) => fmtSig(v, locale)} />
            <Slider label={t.tm} min={1} max={60} step={0.5} value={o.tm} onChange={(v) => set({ tm: v })} format={(v) => fmtFixed(v, 1, locale)} />
            <Slider label={t.r} min={0.05} max={2} step={0.05} value={o.r} onChange={(v) => set({ r: v })} format={f2} />
          </>
        )}
        {model === 'bass' && (
          <>
            <Slider label={t.m} min={1e4} max={1e10} log value={o.m} onChange={(v) => set({ m: Number(v.toPrecision(2)) })} format={(v) => fmtSig(v, locale)} />
            <Slider label={t.p} min={0.0005} max={0.05} log value={o.p} onChange={(v) => set({ p: Number(v.toPrecision(2)) })} format={(v) => fmtSig(v, locale)} />
            <Slider label={t.q} min={0.05} max={1} step={0.05} value={o.q} onChange={(v) => set({ q: v })} format={f2} />
          </>
        )}
        <Slider label={t.k} min={1} max={2.5} step={0.05} value={k} onChange={setK} format={f2} />
        <Slider label={t.tFrom} min={0.1} max={5} log value={tMin} onChange={(v) => setTMin(Number(v.toPrecision(2)))} format={(v) => fmtSig(v, locale)} />
        <Slider label={t.tTo} min={6} max={100} log value={tMax} onChange={(v) => setTMax(Number(v.toPrecision(2)))} format={(v) => fmtSig(v, locale)} />
      </div>

      <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-sm">
        <Stat label={t.slopeStart}>{f2(data[0].slopeV)}</Stat>
        <Stat label={t.slopeEnd}>{f2(data[data.length - 1].slopeV)}</Stat>
        {model === 'power' && (
          <Stat label={t.ak}>
            <span className="text-orange-700">{f2(ak)}</span>
          </Stat>
        )}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <LogLogCurve data={data} dataKey="n" title={t.nChart} aria={t.nAria} yLabel={t.users} t={t} locale={locale} />
        <LogLogCurve data={data} dataKey="V" title={t.vChart} aria={t.vAria} yLabel={t.value} t={t} locale={locale} />
      </div>

      <div className="mt-6 min-w-0">
        <PanelTitle>{t.slopeChart}</PanelTitle>
        <div className="mt-3 h-52 -ml-4" role="img" aria-label={t.slopeAria}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 14, bottom: 4, left: 0 }}>
              <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
              <XAxis dataKey="t" type="number" scale="log" domain={[tMin, tMax]} ticks={decades(tMin, tMax).ticks.filter((v) => v >= tMin * 0.999 && v <= tMax * 1.001)} allowDataOverflow tickFormatter={(v) => fmtSig(v, locale)} tick={axisTick} stroke={MUTED} />
              <YAxis domain={slopeRange} tickFormatter={(v) => fmtFixed(v, 0, locale)} width={44} tick={axisTick} stroke={MUTED} allowDecimals={false} />
              {model === 'power' && <ReferenceLine y={ak} stroke={INK} strokeWidth={1.25} strokeDasharray="5 4" />}
              <Tooltip formatter={(v, name) => [f2(v), name === 'slopeV' ? t.slopeV : t.slopeN]} labelFormatter={(v) => `t = ${fmtSig(v, locale)} ${t.years}`} contentStyle={tooltipStyle} />
              <Line type="linear" dataKey="slopeN" stroke={SLATE} strokeWidth={1.5} strokeDasharray="5 3" dot={false} isAnimationActive={false} />
              <Line type="linear" dataKey="slopeV" stroke={ORANGE} strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <Legend>
          <LegendItem swatch={<LineSwatch color={ORANGE} />}>{t.slopeV}</LegendItem>
          <LegendItem swatch={<LineSwatch color={SLATE} width={1.5} dashed />}>{t.slopeN}</LegendItem>
          {model === 'power' && <LegendItem swatch={<LineSwatch color={INK} width={1.5} dashed />}>{t.slopeRef(f2(ak))}</LegendItem>}
        </Legend>
        <p className="mt-1 font-mono text-xs text-slate-500">{t.years}</p>
      </div>
      <p className="mt-4 text-xs text-slate-500 leading-relaxed">{t.adoptNote}</p>
    </div>
  )
}

// ---------------------------------------------------------------- Panel C

const DAY_TICKS = [0, 90, 180, 270, 360, 450, 540, 630, 730]

function DifficultyPanel({ t, locale }) {
  const [o, setO] = useState(DIFFICULTY_DEFAULTS)
  const [speed, setSpeed] = useState(20)
  const [playing, setPlaying] = useState(false)
  const [, setFrame] = useState(0)
  const [version, bump] = useThrottledVersion(250)

  const key = JSON.stringify(o)
  const ref = useRef(null)
  if (!ref.current || ref.current.key !== key) {
    ref.current = createDifficultySim(o)
    ref.current.key = key
  }
  const s = ref.current

  const set = (patch) => {
    setPlaying(false)
    setO((prev) => ({ ...prev, ...patch }))
    bump(true)
  }

  useAnimationLoop((dt) => {
    const target = Math.min(MAX_DAYS, s.t / 86400 + (Math.min(dt, 100) / 1000) * speed)
    mineUntil(s, target, 12)
    if (s.t / 86400 >= MAX_DAYS) setPlaying(false)
    setFrame((f) => f + 1)
    bump()
  }, playing)

  useEffect(() => {
    if (!playing) bump(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing])

  const data = useMemo(
    () => thin(s.history, 600),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [s, version],
  )
  const retargets = s.retargets
  const period = currentPeriod(s)
  const day = s.t / 86400
  const last = retargets[retargets.length - 1]
  const hashMax = useMemo(() => {
    let m = 1
    for (const p of data) m = Math.max(m, p.hash, p.diff)
    return Math.ceil(m * 1.1 * 4) / 4
  }, [data])
  const intervalMax = useMemo(() => {
    let m = 12
    for (const p of data) m = Math.max(m, p.interval)
    return Math.ceil(m / 5) * 5
  }, [data])

  const finished = day >= MAX_DAYS
  const dayTicks = DAY_TICKS

  return (
    <div className={panel}>
      <PanelTitle>C · {t.diffTitle}</PanelTitle>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Slider label={t.growth} min={0} max={1} step={0.05} value={o.growth} onChange={(v) => set({ growth: v })} format={(v) => fmtSignedPct(v, locale, 0)} />
        <Slider label={t.shock} min={0} max={0.8} step={0.05} value={o.shock} onChange={(v) => set({ shock: v })} format={(v) => fmtPct(v, locale)} />
        <Slider label={t.shockDay} min={30} max={600} step={5} value={o.shockDay} onChange={(v) => set({ shockDay: v })} />
        <Slider label={t.seed} min={1} max={50} step={1} value={o.seed} onChange={(v) => set({ seed: v })} />
      </div>
      <div className="mt-4">
        <Chips label={t.recovery} options={['off', 'on']} value={o.recovery ? 'on' : 'off'} names={t.onOff} onChange={(v) => set({ recovery: v === 'on' })} />
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {o.recovery && <Slider label={t.halfLife} min={7} max={180} step={1} value={o.halfLife} onChange={(v) => set({ halfLife: v })} />}
        <Slider label={t.speed} min={1} max={60} step={1} value={speed} onChange={setSpeed} />
      </div>
      <div className="mt-4">
        <SimControls
          playing={playing}
          onPlayPause={() => setPlaying((p) => !p && !finished)}
          onStep={() => {
            const next = (Math.floor(s.height / RETARGET_BLOCKS) + 1) * RETARGET_BLOCKS
            while (s.height < next && s.t / 86400 < MAX_DAYS) mineBlock(s)
            bump(true)
          }}
          onReset={() => {
            setPlaying(false)
            ref.current = null
            bump(true)
          }}
          labels={t.controls}
        />
      </div>
      <p className="mt-2 text-xs text-slate-500 leading-relaxed">{t.diffNote}</p>
      {finished && <p className="mt-2 font-mono text-xs text-slate-500">{t.done(MAX_DAYS)}</p>}

      <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-sm">
        <Stat label={t.dayStat}>{fmtFixed(day, 1, locale)}</Stat>
        <Stat label={t.height}>{fmtInt(s.height, locale)}</Stat>
        <Stat label={t.period}>{fmtInt(period.index, locale)}</Stat>
        <Stat label={t.left}>{fmtInt(period.left, locale)}</Stat>
        <Stat label={t.lastAdj}>
          <span className="text-orange-700">{last ? fmtSignedPct(last.adjust, locale) : '–'}</span>
          {last && last.clamped && <span className="block text-xs text-slate-500">{t.clamped}</span>}
        </Stat>
        <Stat label={t.periodMean}>
          {fmtFixed(period.meanInterval / 60, 1, locale)} {t.minutes}
        </Stat>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="min-w-0">
          <PanelTitle>{t.hashChart}</PanelTitle>
          <div className="mt-3 h-56 -ml-4" role="img" aria-label={t.hashAria}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 8, right: 14, bottom: 4, left: 0 }}>
                <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
                <XAxis dataKey="day" type="number" domain={[0, MAX_DAYS]} ticks={dayTicks} tick={axisTick} stroke={MUTED} />
                <YAxis domain={[0, hashMax]} tickFormatter={(v) => fmtFixed(v, 1, locale)} width={44} tick={axisTick} stroke={MUTED} />
                {o.shock > 0 && <ReferenceLine x={o.shockDay} stroke={MUTED} strokeDasharray="3 3" />}
                <Tooltip formatter={(v, name) => [fmtFixed(v, 3, locale), name === 'hash' ? t.hashLine : t.diffLine]} labelFormatter={(v) => `${t.day} ${fmtFixed(v, 1, locale)}`} contentStyle={tooltipStyle} />
                <Line type="linear" dataKey="hash" stroke={ORANGE} strokeWidth={2} dot={false} isAnimationActive={false} />
                <Line type="stepAfter" dataKey="diff" stroke={INK} strokeWidth={1.5} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <Legend>
            <LegendItem swatch={<LineSwatch color={ORANGE} />}>{t.hashLine}</LegendItem>
            <LegendItem swatch={<LineSwatch color={INK} width={1.5} />}>{t.diffLine}</LegendItem>
            {o.shock > 0 && <LegendItem swatch={<LineSwatch color={MUTED} width={1} dashed />}>{t.shockLine}</LegendItem>}
          </Legend>
          <p className="mt-1 font-mono text-xs text-slate-500">
            {t.day} · {t.relative}
          </p>
        </div>
        <div className="min-w-0">
          <PanelTitle>{t.intervalChart}</PanelTitle>
          <div className="mt-3 h-56 -ml-4" role="img" aria-label={t.intervalAria}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 8, right: 14, bottom: 4, left: 0 }}>
                <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
                <XAxis dataKey="day" type="number" domain={[0, MAX_DAYS]} ticks={dayTicks} tick={axisTick} stroke={MUTED} />
                <YAxis domain={[0, intervalMax]} width={44} tick={axisTick} stroke={MUTED} />
                {retargets.map((r) => (
                  <ReferenceLine key={r.height} x={r.day} stroke={SLATE_LIGHT} strokeWidth={1} />
                ))}
                <ReferenceLine y={10} stroke={INK} strokeWidth={1.25} strokeDasharray="5 4" />
                <Tooltip formatter={(v) => [`${fmtFixed(v, 2, locale)} ${t.minutes}`, t.intervalLine]} labelFormatter={(v) => `${t.day} ${fmtFixed(v, 1, locale)}`} contentStyle={tooltipStyle} />
                <Line type="linear" dataKey="interval" stroke={SLATE} strokeWidth={1.5} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <Legend>
            <LegendItem swatch={<LineSwatch color={SLATE} width={1.5} />}>{t.intervalLine}</LegendItem>
            <LegendItem swatch={<LineSwatch color={INK} width={1.5} dashed />}>{t.targetLine}</LegendItem>
            <LegendItem swatch={<LineSwatch color={SLATE_LIGHT} width={1} />}>{t.retargetLine}</LegendItem>
          </Legend>
          <p className="mt-1 font-mono text-xs text-slate-500">
            {t.day} · {t.minutes}
          </p>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------- Panel D

const RANGES = {
  near: { max: 10 * HALVING_BLOCKS, every: 2 * HALVING_BLOCKS },
  all: { max: LAST_SUBSIDY_HEIGHT + 1, every: 6 * HALVING_BLOCKS },
}

function fmtHeight(h, locale) {
  if (h === 0) return '0'
  if (h >= 1e6) return `${(h / 1e6).toLocaleString(locale, { maximumFractionDigits: 2 })}M`
  return `${(h / 1e3).toLocaleString(locale, { maximumFractionDigits: 0 })}k`
}

// Two-line tick: the height, and the approximate year below it.
function HeightTick({ x, y, payload, locale }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <text dy={12} textAnchor="middle" fontSize={11} fontFamily={MONO} fill={SLATE}>
        {fmtHeight(payload.value, locale)}
      </text>
      <text dy={25} textAnchor="middle" fontSize={10} fontFamily={MONO} fill={MUTED}>
        {new Date(heightToMs(payload.value)).getUTCFullYear()}
      </text>
    </g>
  )
}

function IssuanceChart({ data, dataKey, title, aria, range, nowH, yProps, step = false, fmt, t, locale, children }) {
  const ticks = []
  for (let h = 0; h <= range.max; h += range.every) ticks.push(h)
  return (
    <div className="min-w-0">
      <PanelTitle>{title}</PanelTitle>
      <div className="mt-3 h-56 -ml-4" role="img" aria-label={aria}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 18, bottom: 4, left: 0 }}>
            <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
            <XAxis dataKey="h" type="number" domain={[0, range.max]} ticks={ticks} tick={<HeightTick locale={locale} />} height={36} interval={0} stroke={MUTED} />
            <YAxis width={44} tick={axisTick} stroke={MUTED} {...yProps} />
            {children}
            <ReferenceLine x={nowH} stroke={ORANGE} strokeWidth={1.25} strokeDasharray="4 3" />
            <Tooltip
              formatter={(v) => [fmt(v), title]}
              labelFormatter={(v) => `${fmtInt(v, locale)} · ${fmtMs(heightToMs(v), locale)}`}
              contentStyle={tooltipStyle}
            />
            <Line type={step ? 'stepAfter' : 'linear'} dataKey={dataKey} stroke={ORANGE} strokeWidth={2} dot={false} isAnimationActive={false} connectNulls={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-1 font-mono text-xs text-slate-500">{t.heightAxis}</p>
    </div>
  )
}

function IssuancePanel({ t, locale }) {
  const [rangeKey, setRangeKey] = useState('near')
  const range = RANGES[rangeKey]
  const nowH = useMemo(() => msToHeight(Date.now()), [])
  const data = useMemo(() => issuanceCurve(range.max, rangeKey === 'near' ? 16 : 6), [range, rangeKey])
  // The issuance rate is meaningless in the first months; start it after two years of blocks.
  const rateData = useMemo(() => data.map((d) => ({ ...d, rate: d.h >= 105000 ? d.rate : null })), [data])
  const subsidyAxis = useMemo(() => {
    const vals = data.map((d) => d.subsidy).filter((v) => v > 0)
    return decades(Math.min(...vals), 50)
  }, [data])
  const rateAxis = useMemo(() => {
    const vals = rateData.map((d) => d.rate).filter((v) => v > 0)
    return decades(Math.min(...vals), Math.max(...vals))
  }, [rateData])

  const supplyNow = supplySat(nowH)
  const nextH = (Math.floor(nowH / HALVING_BLOCKS) + 1) * HALVING_BLOCKS
  const btc = (sat, d = 8) => `${(sat / SAT_PER_BTC).toLocaleString(locale, { maximumFractionDigits: d })} ${t.btc}`

  return (
    <div className={panel}>
      <PanelTitle>D · {t.issuanceTitle}</PanelTitle>
      <div className="mt-4">
        <Chips label={t.range} options={['near', 'all']} value={rangeKey} names={t.rangeNames} onChange={setRangeKey} />
      </div>

      <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-sm">
        <Stat label={t.heightNow}>≈ {fmtInt(nowH, locale)}</Stat>
        <Stat label={t.subsidyNow}>{btc(subsidySat(nowH))}</Stat>
        <Stat label={t.minedNow}>
          ≈ {btc(supplyNow, 0)}
          <span className="block text-xs text-slate-500">{t.ofLimit(fmtPct(supplyNow / MAX_SUPPLY_SAT, locale, 1))}</span>
        </Stat>
        <Stat label={t.nextHalving}>
          {fmtInt(nextH, locale)}
          <span className="block text-xs text-slate-500">≈ {fmtMs(heightToMs(nextH), locale)}</span>
        </Stat>
        <Stat label={t.rateNow}>
          <span className="text-orange-700">{fmtPct(annualIssuanceRate(nowH), locale, 2)}</span> <span className="text-xs text-slate-500">{t.perYear}</span>
        </Stat>
        <Stat label={t.limit}>
          {btc(MAX_SUPPLY_SAT)}
          <span className="block text-xs text-slate-500">{t.lastBlock(fmtInt(LAST_SUBSIDY_HEIGHT, locale))}</span>
        </Stat>
      </div>

      <div className="mt-6 min-w-0">
        <IssuanceChart
          data={data}
          dataKey="supply"
          title={t.supplyChart}
          aria={t.supplyAria}
          range={range}
          nowH={nowH}
          t={t}
          locale={locale}
          fmt={(v) => `${fmtInt(v, locale)} ${t.btc}`}
          yProps={{ domain: [0, 21e6], ticks: [0, 5e6, 10e6, 15e6, 20e6], tickFormatter: (v) => `${v / 1e6}M` }}
        >
          <ReferenceLine y={21e6} stroke={INK} strokeWidth={1.25} strokeDasharray="5 4" />
        </IssuanceChart>
        <Legend>
          <LegendItem swatch={<LineSwatch color={ORANGE} />}>{t.supplyLine}</LegendItem>
          <LegendItem swatch={<LineSwatch color={INK} width={1.5} dashed />}>{t.limitLine}</LegendItem>
          <LegendItem swatch={<LineSwatch color={ORANGE} width={1.25} dashed />}>{t.nowLine}</LegendItem>
        </Legend>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <IssuanceChart
          data={data}
          dataKey="subsidy"
          title={t.subsidyChart}
          aria={t.subsidyAria}
          range={range}
          nowH={nowH}
          step
          t={t}
          locale={locale}
          fmt={(v) => `${v.toLocaleString(locale, { maximumFractionDigits: 8 })} ${t.btc}`}
          yProps={{ scale: 'log', domain: subsidyAxis.domain, ticks: subsidyAxis.ticks, tickFormatter: powTick, allowDataOverflow: true }}
        />
        <IssuanceChart
          data={rateData}
          dataKey="rate"
          title={t.rateChart}
          aria={t.rateAria}
          range={range}
          nowH={nowH}
          t={t}
          locale={locale}
          fmt={(v) => fmtPct(v, locale, 3)}
          yProps={{ scale: 'log', domain: rateAxis.domain, ticks: rateAxis.ticks, tickFormatter: (v) => `${v * 100 >= 0.01 ? fmtSig(v * 100, locale) : powTick(v * 100)}%`, allowDataOverflow: true }}
        />
      </div>
      <p className="mt-4 text-xs text-slate-500 leading-relaxed">{t.issuanceNote}</p>
    </div>
  )
}

// ---------------------------------------------------------------- Root

export default function BitcoinComplexSystem({ lang = 'en' }) {
  const t = T[lang] || T.en
  const locale = lang === 'it' ? 'it-IT' : 'en-US'
  return (
    <div className="space-y-6">
      <PowerLawPanel t={t} locale={locale} />
      <AdoptionPanel t={t} locale={locale} />
      <DifficultyPanel t={t} locale={locale} />
      <IssuancePanel t={t} locale={locale} />
    </div>
  )
}
