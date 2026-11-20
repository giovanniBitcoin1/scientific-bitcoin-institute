import { useEffect, useMemo, useRef, useState } from 'react'
import Slider from '../../Slider.jsx'
import SimControls from '../../SimControls.jsx'
import useAnimationLoop from '../../useAnimationLoop.js'
import { mulberry32 } from '../../rng.js'
import { ORANGE_DARK, INK, SLATE, MONO, Pill, Eyebrow, fmt } from '../ui.jsx'
import { directed, undirected, degree, inDegree, eigenvector, katzFraction, pagerank, hits, surf, toSum, places } from './centrality.js'
import { WEB } from './networks.js'

// Panel B, "The random surfer": a web of twelve pages and a surfer who
// follows a random link with probability α and otherwise jumps to a random
// page. The share of visits to each page is drawn beside its exact PageRank.
// The drawing is SVG with no pointer handlers.

const SKY = '#0284c7'
const SURFER_SEED = 2024
const KATZ_FRACTION = 0.5

const T = {
  en: {
    alpha: 'Damping α: probability of following a link',
    speed: 'Steps per second',
    twoWay: 'Every link two-way',
    play: 'Play',
    pause: 'Pause',
    step: 'Step',
    reset: 'Reset',
    steps: 'Steps',
    at: 'The surfer is on',
    followed: 'followed a link',
    jumped: 'jumped to a random page',
    jumpedDead: 'no link to follow: jumped to a random page',
    loop: 'Share of visits to J, K, L',
    exact: 'exact',
    bars: 'Visits and PageRank',
    barsNote: 'Orange bar: share of the surfer’s visits. Black mark: exact PageRank.',
    table: 'The twelve pages, six scores',
    cols: { page: 'Page', pagerank: 'PageRank', inlinks: 'Links in', eigenvector: 'Eigenv.', katz: 'Katz', hub: 'Hub', authority: 'Author.' },
    colsTwoWay: 'Links',
    tableNote: `Links in: incoming links. Author.: authority. All scores are rescaled to sum to 1. Katz is taken at α = ${KATZ_FRACTION} of its limit.`,
    restart: 'Changing α or the switch starts the count again.',
    legend: 'F: nobody links to it. H: no outgoing links. J → K → L → J: a loop with no way out.',
    aria: (page) => `A web of twelve pages with their links; the surfer is on page ${page}`,
    ariaBars: 'For each page, the share of visits and the exact PageRank',
  },
  it: {
    alpha: 'Smorzamento α: probabilità di seguire un collegamento',
    speed: 'Passi al secondo',
    twoWay: 'Ogni collegamento nei due sensi',
    play: 'Avvia',
    pause: 'Pausa',
    step: 'Passo',
    reset: 'Azzera',
    steps: 'Passi',
    at: 'Il navigatore è su',
    followed: 'ha seguito un collegamento',
    jumped: 'è saltato su una pagina a caso',
    jumpedDead: 'nessun collegamento da seguire: è saltato su una pagina a caso',
    loop: 'Quota di visite a J, K, L',
    exact: 'esatta',
    bars: 'Visite e PageRank',
    barsNote: 'Barra arancione: quota delle visite del navigatore. Segno nero: PageRank esatto.',
    table: 'Le dodici pagine, sei punteggi',
    cols: { page: 'Pag.', pagerank: 'PageRank', inlinks: 'In entr.', eigenvector: 'Autov.', katz: 'Katz', hub: 'Hub', authority: 'Autor.' },
    colsTwoWay: 'Coll.',
    tableNote: `In entr.: collegamenti in entrata. Autov.: autovettore. Autor.: autorità. Tutti i punteggi sono riscalati in modo che la somma sia 1. Katz è calcolato con α = ${KATZ_FRACTION} del suo limite.`,
    restart: "Cambiare α o l'interruttore fa ripartire il conteggio.",
    legend: 'F: nessuna pagina rimanda a lei. H: nessun collegamento in uscita. J → K → L → J: un anello senza via d’uscita.',
    aria: (page) => `Una rete di dodici pagine con i loro collegamenti; il navigatore è sulla pagina ${page}`,
    ariaBars: 'Per ogni pagina, la quota di visite e il PageRank esatto',
  },
}

const VB = { w: 340, h: 250 }
const X = (v) => 26 + WEB.pos[2 * v] * (VB.w - 52)
const Y = (v) => 24 + WEB.pos[2 * v + 1] * (VB.h - 48)
const R = 11

// A link drawn from the rim of one circle to the rim of the other.
function segment(a, b, gapEnd) {
  const dx = X(b) - X(a)
  const dy = Y(b) - Y(a)
  const d = Math.hypot(dx, dy) || 1
  return {
    x1: X(a) + (dx / d) * R,
    y1: Y(a) + (dy / d) * R,
    x2: X(b) - (dx / d) * (R + gapEnd),
    y2: Y(b) - (dy / d) * (R + gapEnd),
  }
}

const fresh = () => ({ at: 0, steps: 0, visits: new Float64Array(WEB.n), last: null, random: mulberry32(SURFER_SEED) })

export default function SurferPanel({ lang = 'en' }) {
  const t = T[lang] || T.en
  const [alpha, setAlpha] = useState(0.85)
  const [twoWay, setTwoWay] = useState(false)
  const [rate, setRate] = useState(4)
  const [playing, setPlaying] = useState(false)
  const sim = useRef(fresh())
  const carry = useRef(0)
  const [, setTick] = useState(0)

  const G = useMemo(() => (twoWay ? undirected(WEB) : directed(WEB)), [twoWay])
  const scores = useMemo(() => {
    const eig = eigenvector(G)
    const h = hits(G)
    return {
      pagerank: pagerank(G, alpha).vector,
      inlinks: twoWay ? degree(G) : inDegree(G),
      eigenvector: toSum(eig.vector),
      katz: toSum(katzFraction(G, KATZ_FRACTION, eig.value)),
      hub: h.hub,
      authority: h.authority,
    }
  }, [G, alpha, twoWay])

  // A new α or a new web: the old visits no longer mean anything.
  useEffect(() => {
    sim.current = fresh()
    carry.current = 0
    setTick((v) => v + 1)
  }, [alpha, twoWay])

  const advance = (count) => {
    const s = sim.current
    for (let i = 0; i < count; i++) {
      const from = s.at
      const move = surf(G, from, alpha, s.random)
      s.at = move.next
      s.visits[s.at]++
      s.steps++
      s.last = { from, to: s.at, jumped: move.jumped, dead: G.out[from].length === 0 }
    }
    setTick((v) => v + 1)
  }
  useAnimationLoop((dt) => {
    carry.current += (rate * Math.min(dt, 100)) / 1000
    const count = Math.floor(carry.current)
    if (count > 0) {
      carry.current -= count
      advance(count)
    }
  }, playing)
  const reset = () => {
    setPlaying(false)
    sim.current = fresh()
    carry.current = 0
    setTick((v) => v + 1)
  }

  const s = sim.current
  const share = (v) => (s.steps ? s.visits[v] / s.steps : 0)
  const loop = WEB.roles.loop
  const loopShare = loop.reduce((sum, v) => sum + share(v), 0)
  const loopExact = loop.reduce((sum, v) => sum + scores.pagerank[v], 0)
  const order = places(scores.pagerank).order
  const barMax = Math.max(0.2, ...scores.pagerank, ...Array.from({ length: WEB.n }, (_, v) => share(v)))
  const bx = (v) => 22 + (v / barMax) * 196
  const followed = s.last && !s.last.jumped
  const num = (v, d = 3) => fmt(v, d)

  return (
    <div>
      <div className="grid gap-x-6 gap-y-3 md:grid-cols-2 items-end">
        <Slider label={t.alpha} min={0} max={1} step={0.01} value={alpha} onChange={setAlpha} format={(v) => fmt(v, 2)} />
        <Slider label={t.speed} min={1} max={20000} value={rate} onChange={(v) => setRate(Math.round(v))} format={(v) => String(Math.round(v))} log />
        <div className="flex flex-wrap items-center gap-2">
          <SimControls
            playing={playing}
            onPlayPause={() => setPlaying((p) => !p)}
            onStep={() => advance(1)}
            onReset={reset}
            labels={{ play: t.play, pause: t.pause, step: t.step, reset: t.reset }}
          />
        </div>
        <div>
          <Pill active={twoWay} onClick={() => setTwoWay((v) => !v)}>
            {t.twoWay}
          </Pill>
        </div>
      </div>
      <p className="mt-2 text-xs text-slate-500 leading-snug">{t.restart}</p>

      <div className="mt-4 grid gap-6 lg:grid-cols-2 items-start">
        <div className="min-w-0">
          <svg viewBox={`0 0 ${VB.w} ${VB.h}`} className="w-full h-auto bg-white border border-slate-200 rounded" role="img" aria-label={t.aria(WEB.names[s.at])}>
            <defs>
              <marker id="surfer-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
                <path d="M 0 1 L 10 5 L 0 9 z" fill={SLATE} />
              </marker>
              <marker id="surfer-arrow-hot" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
                <path d="M 0 1 L 10 5 L 0 9 z" fill={ORANGE_DARK} />
              </marker>
            </defs>
            {Array.from(WEB.A, (a, e) => {
              const b = WEB.B[e]
              const hot = followed && ((s.last.from === a && s.last.to === b) || (twoWay && s.last.from === b && s.last.to === a))
              return (
                <line
                  key={e}
                  {...segment(a, b, twoWay ? 0 : 2)}
                  stroke={hot ? ORANGE_DARK : SLATE}
                  strokeOpacity={hot ? 1 : 0.6}
                  strokeWidth={hot ? 2.4 : 1.2}
                  markerEnd={twoWay ? undefined : `url(#surfer-arrow${hot ? '-hot' : ''})`}
                />
              )
            })}
            {WEB.names.map((name, v) => {
              const here = s.at === v
              const special = v === WEB.roles.source || v === WEB.roles.dangling || loop.includes(v)
              return (
                <g key={name}>
                  <circle cx={X(v)} cy={Y(v)} r={R} fill={here ? ORANGE_DARK : '#fff'} stroke={here ? ORANGE_DARK : special && !twoWay ? SKY : INK} strokeWidth={special && !twoWay ? 2 : 1.4} />
                  <text x={X(v)} y={Y(v) + 3.6} textAnchor="middle" fontSize="10.5" fontFamily={MONO} fontWeight="700" fill={here ? '#fff' : INK}>
                    {name}
                  </text>
                </g>
              )
            })}
          </svg>
          {!twoWay && <p className="mt-2 text-xs text-slate-500 leading-snug">{t.legend}</p>}
          <p className="mt-2 font-mono text-xs text-slate-700 tabular-nums leading-relaxed" aria-live="off" data-readout="surfer">
            {t.steps}: {s.steps.toLocaleString(lang === 'it' ? 'it-IT' : 'en-US')} · {t.at} {WEB.names[s.at]}
            {s.last ? ` (${s.last.jumped ? (s.last.dead ? t.jumpedDead : t.jumped) : t.followed})` : ''}
            <br />
            {t.loop}: {num(loopShare)} ({t.exact} {num(loopExact)})
          </p>
        </div>

        <div className="min-w-0">
          <Eyebrow>{t.bars}</Eyebrow>
          <svg viewBox={`0 0 260 ${WEB.n * 15 + 4}`} className="mt-2 w-full h-auto" role="img" aria-label={t.ariaBars}>
            {order.map((v, row) => (
              <g key={v} transform={`translate(0, ${row * 15 + 2})`}>
                <text x="2" y="9.5" fontSize="10" fontFamily={MONO} fontWeight="700" fill={INK}>
                  {WEB.names[v]}
                </text>
                <rect x="22" y="1.5" width="196" height="9" fill="#f1f5f9" />
                <rect x="22" y="1.5" width={Math.max(0, bx(share(v)) - 22)} height="9" fill={ORANGE_DARK} fillOpacity="0.85" />
                <line x1={bx(scores.pagerank[v])} x2={bx(scores.pagerank[v])} y1="0" y2="12" stroke={INK} strokeWidth="1.4" />
                <text x="258" y="9.5" textAnchor="end" fontSize="9" fontFamily={MONO} fill={SLATE}>
                  {num(share(v))}
                </text>
              </g>
            ))}
          </svg>
          <p className="mt-1 text-xs text-slate-500 leading-snug">{t.barsNote}</p>
        </div>
      </div>

      <div className="mt-6">
        <Eyebrow>{t.table}</Eyebrow>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full text-[10px] sm:text-xs font-mono tabular-nums" data-readout="pages">
            <thead>
              <tr className="text-slate-500">
                {['page', 'pagerank', 'inlinks', 'eigenvector', 'katz', 'hub', 'authority'].map((c, i) => (
                  <th key={c} scope="col" className={`pb-1 px-0.5 sm:px-1 font-semibold font-sans ${i ? 'text-right' : 'text-left'}`}>
                    {c === 'inlinks' && twoWay ? t.colsTwoWay : t.cols[c]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {order.map((v) => (
                <tr key={v} className="border-t border-slate-100">
                  <th scope="row" className="py-1 px-0.5 sm:px-1 text-left font-bold text-slate-900">
                    {WEB.names[v]}
                  </th>
                  <td className="py-1 px-0.5 sm:px-1 text-right text-orange-700">{num(scores.pagerank[v])}</td>
                  <td className="py-1 px-0.5 sm:px-1 text-right text-slate-900">{scores.inlinks[v]}</td>
                  <td className="py-1 px-0.5 sm:px-1 text-right text-slate-900">{num(scores.eigenvector[v])}</td>
                  <td className="py-1 px-0.5 sm:px-1 text-right text-slate-900">{num(scores.katz[v])}</td>
                  <td className="py-1 px-0.5 sm:px-1 text-right text-slate-900">{num(scores.hub[v])}</td>
                  <td className="py-1 px-0.5 sm:px-1 text-right text-slate-900">{num(scores.authority[v])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-1 text-xs text-slate-500 leading-snug">{t.tableNote}</p>
      </div>
    </div>
  )
}
