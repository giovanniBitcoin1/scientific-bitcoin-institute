import { useMemo, useState } from 'react'
import { Pill } from '../../network/ui.jsx'
import { Legend } from '../../network/charts.jsx'
import { add, toNumber } from '../congestion-price-of-anarchy/frac.js'
import PowerBars, { BAR_COLORS } from './PowerBars.jsx'
import { powerIndices, splitLargest, VOTING_PRESETS, POOL_QUOTAS, COUNCIL_NAMES, MAX_PLAYERS } from './voting.js'
import { dec, num } from './fmt.js'

// Panel B, "Who decides?": weighted voting with up to 30 players, editable
// integer weights (0 to 100) and quota. Bars of weight share against the
// Shapley–Shubik and normalised Banzhaf indices, the absolute Banzhaf index,
// how many of the largest players reach the quota, and "Split the largest".
// Exact counts by dynamic programming (voting.js), shown as decimals.

const T = {
  en: {
    presets: { council: '1958 Council', parties: '49–49–2', pools: 'Pools (illustrative)' },
    quota: 'Quota',
    of: (W) => `of ${W}`,
    poolQuotas: 'Quota:',
    poolNote: 'Twenty-five pools with 26, 19, 19, 8 and 8 per cent of the hash rate and twenty with 1 per cent each: invented numbers, not a snapshot. The quotas are more than a quarter, a third, a half and two thirds of 100: a half for a majority attack, a quarter and a third for the thresholds of selfish mining (module 13).',
    weights: 'Weights (0 to 100)',
    addPlayer: 'Add a player',
    removePlayer: 'Remove the last',
    split: 'Split the largest',
    splitOff: 'at most 30 players',
    reset: 'Back to the preset',
    head: ['player', 'weight', 'share', 'S–S', 'Banzhaf', 'abs.'],
    legend: ['share of the weight', 'Shapley–Shubik (S–S)', 'Banzhaf (normalized)'],
    needed: 'Largest players needed to reach the quota',
    never: 'all together do not reach it',
    swings: 'Swings (coalitions where a vote decides), in all',
    splitLine: (name, before, after) => `${name} split in two: together they now have ${after} (Shapley–Shubik), against ${before} before.`,
    aria: 'Bars of each player’s share of the weight, Shapley–Shubik index and normalized Banzhaf index',
  },
  it: {
    presets: { council: 'Consiglio 1958', parties: '49–49–2', pools: 'Pool (illustrativi)' },
    quota: 'Quota',
    of: (W) => `su ${W}`,
    poolQuotas: 'Quota:',
    poolNote: 'Venticinque pool con il 26, 19, 19, 8 e 8 per cento dell’hash rate e venti con l’1 per cento ciascuno: numeri inventati, non una fotografia. Le quote sono più di un quarto, di un terzo, della metà e dei due terzi di 100: la metà per un attacco di maggioranza, un quarto e un terzo per le soglie del selfish mining (modulo 13).',
    weights: 'Pesi (da 0 a 100)',
    addPlayer: 'Aggiungi un giocatore',
    removePlayer: 'Togli l’ultimo',
    split: 'Dividi il più grande',
    splitOff: 'al massimo 30 giocatori',
    reset: 'Torna al preset',
    head: ['giocatore', 'peso', 'quota', 'S–S', 'Banzhaf', 'ass.'],
    legend: ['quota del peso', 'Shapley–Shubik (S–S)', 'Banzhaf (normalizzato)'],
    needed: 'Giocatori più grandi necessari per la quota',
    never: 'tutti insieme non la raggiungono',
    swings: 'Swing (coalizioni in cui un voto decide), in tutto',
    splitLine: (name, before, after) => `${name} diviso in due: insieme ora hanno ${after} (Shapley–Shubik), contro ${before} prima.`,
    aria: 'Barre della quota del peso, dell’indice di Shapley–Shubik e dell’indice di Banzhaf normalizzato di ogni giocatore',
  },
}

const clampW = (v) => Math.max(0, Math.min(100, Math.round(Number(v) || 0)))

export default function VotingPanel({ lang = 'en' }) {
  const L = T[lang] || T.en
  const [preset, setPreset] = useState('council')
  const [players, setPlayers] = useState(VOTING_PRESETS.council.players)
  const [quota, setQuota] = useState(VOTING_PRESETS.council.quota)
  const [split, setSplit] = useState(null)
  const weights = players.map((p) => p.weight)
  const W = weights.reduce((s, w) => s + w, 0)
  const q = Math.max(1, Math.min(Math.max(1, W), quota))
  const r = useMemo(() => powerIndices(weights, q), [weights.join(), q])
  const names = COUNCIL_NAMES[lang] || COUNCIL_NAMES.en
  const nameOf = (p) => {
    const base = p.name.slice(0, 2)
    if (preset !== 'council' || !names[base]) return p.name
    return p.name.length > 2 ? `${names[base]} (${p.name.slice(2)})` : names[base]
  }
  const n4 = (f) => dec(f, lang, 4)

  const choose = (id) => {
    setPreset(id)
    setPlayers(VOTING_PRESETS[id].players)
    setQuota(VOTING_PRESETS[id].quota)
    setSplit(null)
  }
  const editWeight = (i, v) => {
    setPlayers(players.map((p, k) => (k === i ? { ...p, weight: clampW(v) } : p)))
    setSplit(null)
  }
  const doSplit = () => {
    const before = powerIndices(weights, q)
    let at = 0
    weights.forEach((w, i) => {
      if (w > weights[at]) at = i
    })
    const next = splitLargest(players)
    const after = powerIndices(next.map((p) => p.weight), q)
    setSplit({ name: nameOf(players[at]), before: toNumber(before.ss[at]), after: toNumber(add(after.ss[at], after.ss[at + 1])) })
    setPlayers(next)
  }
  const groups = players.map((p, i) => ({ label: players.length <= 8 ? p.name : '', share: W ? p.weight / W : 0, index: toNumber(r.ss[i]), second: toNumber(r.banzhaf[i]) }))

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2" data-role="vb-presets">
        {Object.keys(VOTING_PRESETS).map((id) => (
          <Pill key={id} active={preset === id} onClick={() => choose(id)} data-preset={id}>{L.presets[id]}</Pill>
        ))}
      </div>
      {preset === 'pools' && (
        <div className="mt-2">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500" data-role="vb-quotas">
            <span>{L.poolQuotas}</span>
            {POOL_QUOTAS.map((k) => (
              <Pill key={k} active={q === k} onClick={() => setQuota(k)} data-quota={k}>{k}</Pill>
            ))}
          </div>
          <p className="mt-1 text-xs text-slate-600 leading-snug max-w-3xl">{L.poolNote}</p>
        </div>
      )}
      <div className="mt-3 flex flex-wrap items-end gap-3 text-sm">
        <label className="flex items-center gap-2">
          <span className="text-slate-700 font-medium">{L.quota}</span>
          <input type="number" min={1} max={Math.max(1, W)} step={1} value={q} onChange={(e) => setQuota(Math.max(1, Math.round(Number(e.target.value) || 1)))} className="w-20 rounded border border-slate-200 px-1.5 py-0.5 font-mono tabular-nums" data-role="vb-quota" />
          <span className="text-slate-500 font-mono">{L.of(W)}</span>
        </label>
        <Pill primary onClick={doSplit} disabled={players.length >= MAX_PLAYERS || W === 0} data-role="vb-split" title={players.length >= MAX_PLAYERS ? L.splitOff : undefined}>{L.split}</Pill>
        <Pill onClick={() => choose(preset)} data-role="vb-reset">{L.reset}</Pill>
      </div>

      <details className="mt-3 max-w-3xl" data-role="vb-weights">
        <summary className="text-sm text-slate-700 cursor-pointer">{L.weights} · {players.length}</summary>
        <div className="mt-2 grid grid-cols-3 sm:grid-cols-6 gap-1.5">
          {players.map((p, i) => (
            <label key={`${p.name}-${i}`} className="flex items-center gap-1 min-w-0 text-xs font-mono">
              <span className="text-slate-500 shrink-0 w-9 truncate" title={nameOf(p)}>{p.name}</span>
              <input type="number" min={0} max={100} step={1} value={p.weight} onChange={(e) => editWeight(i, e.target.value)} className="w-full min-w-0 rounded border border-slate-200 px-1 py-0.5 tabular-nums" aria-label={nameOf(p)} data-player={i} />
            </label>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          <Pill onClick={() => { setPlayers([...players, { name: `X${players.length + 1}`, weight: 1 }]); setSplit(null) }} disabled={players.length >= MAX_PLAYERS}>{L.addPlayer}</Pill>
          <Pill onClick={() => { setPlayers(players.slice(0, -1)); setSplit(null) }} disabled={players.length <= 1}>{L.removePlayer}</Pill>
        </div>
      </details>

      <div className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-2 items-start max-w-3xl">
        <div className="min-w-0">
          <PowerBars groups={groups} aria={L.aria} role="vb-bars" showLabels={players.length <= 8} />
          <Legend items={L.legend.map((label, i) => ({ label, color: [BAR_COLORS.share, BAR_COLORS.index, BAR_COLORS.second][i], bar: true }))} />
          <dl className="mt-2 grid gap-y-1 text-sm" data-role="vb-readout">
            <div>
              <dt className="text-xs text-slate-500">{L.needed}</dt>
              <dd className="font-mono" data-value="needed">{r.needed ?? L.never}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">{L.swings}</dt>
              <dd className="font-mono tabular-nums" data-value="swings">{r.totalSwings.toLocaleString(lang === 'it' ? 'it-IT' : 'en-US')}</dd>
            </div>
          </dl>
          {split && <p className="mt-2 text-sm text-slate-800 leading-snug" data-role="vb-split-line">{L.splitLine(split.name, num(split.before, lang, 4), num(split.after, lang, 4))}</p>}
        </div>
        <div className="min-w-0 max-h-80 overflow-y-auto">
          <table className="w-full text-xs font-mono tabular-nums" data-role="vb-table">
            <thead className="sticky top-0 bg-white">
              <tr className="text-slate-500 text-left">
                {L.head.map((h, k) => (
                  <th key={h} className={`font-normal pr-1.5 pb-1 ${k === 2 ? 'hidden sm:table-cell' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {players.map((p, i) => (
                <tr key={`${p.name}-${i}`} data-player={p.name} className={p.split ? 'bg-orange-50' : ''}>
                  <td className="pr-1.5 py-0.5 font-sans truncate max-w-[6rem]">{nameOf(p)}</td>
                  <td className="pr-1.5">{p.weight}</td>
                  <td className="pr-1.5 hidden sm:table-cell">{num(W ? p.weight / W : 0, lang, 3)}</td>
                  <td className="pr-1.5" data-value="ss">{n4(r.ss[i])}</td>
                  <td className="pr-1.5" data-value="bz">{n4(r.banzhaf[i])}</td>
                  <td data-value="abs">{n4(r.absolute[i])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
