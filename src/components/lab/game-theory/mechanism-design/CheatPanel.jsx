import { useMemo, useState } from 'react'
import Slider from '../../Slider.jsx'
import { Pill, ORANGE_DARK } from '../../network/ui.jsx'
import { runCheat, BLOCK_COUNTS, RULES, honestUniform, oneFake } from './cheat.js'
import { num, int } from '../auctions/fmt.js'

// Panel C, "Who runs the auction?": module 11's block with a miner who may add
// fake transactions (their fees come back to it). For each rule, honest
// against cheating: the miner's revenue, users served, the users' total
// payoff. "Run again" n uses seed n (the same draws as module 11's Panel C).

const COLORS = { pyb: ORANGE_DARK, uniform: '#0369a1', monopolistic: '#15803d' }

const T = {
  en: {
    n: 'n, the users',
    k: 'k, the slots in the block',
    blocks: 'Blocks:',
    again: 'Run again',
    run: (s) => `Run no. ${s} (seed ${s})`,
    rules: { pyb: 'Pay your bid', uniform: 'Uniform price', monopolistic: 'Monopolistic price' },
    how: {
      pyb: 'each included user pays her bid (equilibrium bids, as in module 11); a fake only pushes a real user out, so the search finds no gain',
      uniform: 'every included user pays the highest losing bid (bids are values); the cheating miner puts k − j fakes on top and one just below the j-th real bid, which becomes the highest losing bid, and picks the best j',
      monopolistic: 'every included user pays the lowest included bid and the miner already picks how many to include: no fake raises what real users pay',
    },
    told: 'The users are not told that the miner cheats: their bids stay as in module 11. The search, block by block, covers h high fakes (h = 0 … k) and one more fake in every place among the real bids.',
    rows: ['revenue, honest', 'revenue, cheating', 'users served, honest', 'users served, cheating', 'users’ payoff, honest', 'users’ payoff, cheating'],
    fake: (h, o, g) => `Uniform price, one fake bid just below the k-th bid (exact): ${o} instead of ${h}, a gain of ${g}.`,
    noFake: 'Uniform price: with k > n there is no k-th bid, and a single fake gains nothing; the best cheating needs fakes that fill the room.',
    same: (s, b) => `Cheating uniform price = monopolistic price in ${s} of ${b} blocks.`,
    ours: 'That the cheating uniform price earns exactly what the monopolistic price earns (the largest j times the j-th bid) is our computation in this model, not a quoted result.',
  },
  it: {
    n: 'n, gli utenti',
    k: 'k, i posti nel blocco',
    blocks: 'Blocchi:',
    again: 'Nuova prova',
    run: (s) => `Prova n. ${s} (seme ${s})`,
    rules: { pyb: 'Paghi la tua offerta', uniform: 'Prezzo uniforme', monopolistic: 'Prezzo monopolistico' },
    how: {
      pyb: 'ogni utente incluso paga la sua offerta (offerte di equilibrio, come nel modulo 11); una transazione falsa spinge solo fuori un utente vero, e la ricerca non trova guadagno',
      uniform: 'ogni utente incluso paga l’offerta esclusa più alta (le offerte sono i valori); il miner che imbroglia mette k − j transazioni false in cima e una appena sotto la j-esima offerta vera, che diventa l’offerta esclusa più alta, e sceglie il j migliore',
      monopolistic: 'ogni utente incluso paga l’offerta inclusa più bassa e il miner sceglie già quanti includerne: nessuna transazione falsa alza ciò che pagano gli utenti veri',
    },
    told: 'Gli utenti non sanno che il miner imbroglia: le loro offerte restano quelle del modulo 11. La ricerca, blocco per blocco, considera h transazioni false in cima (h = 0 … k) e una in più in ogni posizione tra le offerte vere.',
    rows: ['ricavo, onesto', 'ricavo, imbroglio', 'utenti serviti, onesto', 'utenti serviti, imbroglio', 'payoff degli utenti, onesto', 'payoff degli utenti, imbroglio'],
    fake: (h, o, g) => `Prezzo uniforme, una sola offerta falsa appena sotto la k-esima (esatto): ${o} invece di ${h}, un guadagno di ${g}.`,
    noFake: 'Prezzo uniforme: con k > n non c’è una k-esima offerta, e una sola transazione falsa non rende nulla; l’imbroglio migliore richiede transazioni false che riempiano il blocco.',
    same: (s, b) => `Prezzo uniforme con imbroglio = prezzo monopolistico in ${s} blocchi su ${b}.`,
    ours: 'Che il prezzo uniforme con imbroglio renda esattamente quanto il prezzo monopolistico (il j più grande per la j-esima offerta) è un nostro calcolo in questo modello, non un risultato citato.',
  },
}

export default function CheatPanel({ lang = 'en' }) {
  const L = T[lang] || T.en
  const f2 = (v) => num(v, lang, 2)
  const [n, setN] = useState(20)
  const [k, setK] = useState(10)
  const [blocks, setBlocks] = useState(10000)
  const [seed, setSeed] = useState(1)
  const sim = useMemo(() => runCheat({ n, k, blocks, seed }), [n, k, blocks, seed])
  const one = oneFake(n, k)
  const hon = honestUniform(n, k)
  const cell = (rule, row) => {
    const s = sim[rule][row % 2 ? 'cheat' : 'honest']
    if (row < 2) return <><span data-value={row ? 'cheat' : 'honest'}>{f2(s.mean)}</span><span className="block text-slate-500">± {f2(s.se)}</span></>
    if (row < 4) return <span data-value={row === 2 ? 'servedHonest' : 'servedCheat'}>{f2(s.served)}</span>
    return <span data-value={row === 4 ? 'usersHonest' : 'usersCheat'}>{f2(s.users)}</span>
  }

  return (
    <div>
      <div className="grid gap-x-8 gap-y-2 sm:grid-cols-2 max-w-3xl">
        <Slider label={L.n} min={2} max={40} step={1} value={n} onChange={setN} />
        <Slider label={L.k} min={1} max={60} step={1} value={k} onChange={setK} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500" data-role="cp-counts">
        <span>{L.blocks}</span>
        {BLOCK_COUNTS.map((c) => (
          <Pill key={c} active={blocks === c} onClick={() => setBlocks(c)} data-count={c}>{int(c, lang)}</Pill>
        ))}
        <Pill primary onClick={() => setSeed(seed + 1)} data-role="cp-again">{L.again}</Pill>
        <span className="font-mono" data-role="cp-seed">{L.run(seed)}</span>
      </div>
      <ul className="mt-2 space-y-0.5 text-xs text-slate-600 leading-snug max-w-3xl">
        {RULES.map((r) => (
          <li key={r}>
            <span className="font-semibold" style={{ color: COLORS[r] }}>{L.rules[r]}</span>: {L.how[r]}.
          </li>
        ))}
      </ul>
      <p className="mt-1 text-xs text-slate-500 leading-snug max-w-3xl">{L.told}</p>

      <table className="mt-3 w-full max-w-3xl text-[11px] sm:text-xs font-mono tabular-nums" data-role="cp-table">
        <thead>
          <tr className="text-left align-bottom">
            <th className="font-normal pr-2 pb-1" />
            {RULES.map((r) => (
              <th key={r} className="font-sans font-semibold pr-2 pb-1" style={{ color: COLORS[r] }}>{L.rules[r]}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {L.rows.map((label, row) => (
            <tr key={row} data-row={row} className={Math.floor(row / 2) % 2 ? '' : 'bg-slate-50'}>
              <td className="pr-2 py-0.5 font-sans text-slate-600">{label}</td>
              {RULES.map((r) => (
                <td key={r} className="pr-2 py-0.5 align-top" data-rule={r}>{cell(r, row)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 text-sm text-slate-800" data-role="cp-fake">
        {one === null ? L.noFake : L.fake(f2(hon), f2(one), f2(one - hon))}
      </p>
      <p className="mt-1 text-xs text-slate-600" data-role="cp-same">{L.same(int(sim.sameAsMonopolistic, lang), int(sim.blocks, lang))}</p>
      <p className="mt-1 text-xs text-slate-500 leading-snug max-w-3xl">{L.ours}</p>
    </div>
  )
}
