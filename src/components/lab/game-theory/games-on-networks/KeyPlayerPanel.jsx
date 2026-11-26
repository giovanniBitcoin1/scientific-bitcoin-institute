import { useMemo, useState } from 'react'
import Slider from '../../Slider.jsx'
import { Pill, ORANGE_DARK } from '../../network/ui.jsx'
import NetDraw from './NetDraw.jsx'
import { NETWORKS, lambdaMax } from './netgames.js'
import { analyse, sliderMax, without, katz } from './keyplayer.js'
import { num } from './fmt.js'

// Panel B, "The key player": with complements and δ below 1/λ_max the
// equilibrium is x = (I − δG)⁻¹ 1, each effort a Katz–Bonacich centrality.
// The table gives every player's effort b_i and intercentrality b_i²/m_ii;
// clicking a player (in the drawing or the table) removes it and shows the
// new total and the drop next to b_i²/m_ii. The slider's upper end is the
// last step of 0.01 below 1/λ_max of the chosen network.

const SKY = '#0369a1'
const KEYS = ['bridge', 'line5', 'star6', 'ring6']

const T = {
  en: {
    nets: { bridge: 'Bridge', line5: 'Line of 5', star6: 'Star of 6', ring6: 'Ring of 6' },
    delta: 'δ, complements',
    lambda: 'λ_max and 1/λ_max',
    total: 'Total effort',
    byEffort: 'Most active first',
    byInter: 'Highest intercentrality first',
    head: ['player', 'effort b_i', 'b_i²/m_ii'],
    most: 'most active',
    key: 'key player',
    restore: 'Restore',
    hint: 'Click a player, in the drawing or in the table, to remove it.',
    removed: (i) => `Without player ${i}`,
    newTotal: 'New total',
    drop: 'Drop',
    inter: 'b_i²/m_ii',
    equal: 'Equal?',
    yes: 'yes (within 1e-9)',
    no: 'no',
    note: 'Node size shows the effort. Orange ring: the key player; blue ring: the most active.',
    aria: 'The network, each player sized by its effort; players can be clicked to remove them',
    nodeLabel: (i) => `Remove player ${i}`,
  },
  it: {
    nets: { bridge: 'Ponte', line5: 'Linea di 5', star6: 'Stella di 6', ring6: 'Anello di 6' },
    delta: 'δ, complementi',
    lambda: 'λ_max e 1/λ_max',
    total: 'Sforzo totale',
    byEffort: 'Prima il più attivo',
    byInter: 'Prima l’intercentralità più alta',
    head: ['giocatore', 'sforzo b_i', 'b_i²/m_ii'],
    most: 'il più attivo',
    key: 'giocatore chiave',
    restore: 'Ripristina',
    hint: 'Clicca su un giocatore, nel disegno o nella tabella, per toglierlo.',
    removed: (i) => `Senza il giocatore ${i}`,
    newTotal: 'Nuovo totale',
    drop: 'Calo',
    inter: 'b_i²/m_ii',
    equal: 'Uguali?',
    yes: 'sì (entro 1e-9)',
    no: 'no',
    note: 'La dimensione mostra lo sforzo. Anello arancione: il giocatore chiave; anello blu: il più attivo.',
    aria: 'La rete, ogni giocatore dimensionato secondo il suo sforzo; si può cliccare su un giocatore per toglierlo',
    nodeLabel: (i) => `Togli il giocatore ${i}`,
  },
}

export default function KeyPlayerPanel({ lang = 'en' }) {
  const L = T[lang] || T.en
  const n4 = (v) => num(v, lang, 4)
  const [key, setKey] = useState('bridge')
  const [delta, setDelta] = useState(0.3)
  const [gone, setGone] = useState(null)
  const net = NETWORKS[key]
  const g = useMemo(() => net.make(), [net])
  const lmax = useMemo(() => lambdaMax(g), [g])
  const dmax = useMemo(() => sliderMax(g), [g])
  const d = Math.min(delta, dmax)
  const a = useMemo(() => analyse(g, d), [g, d])
  const after = useMemo(() => {
    if (gone == null) return null
    const w = without(g, gone)
    const k = katz(w.g, d)
    const x = new Array(g.n).fill(0)
    w.keep.forEach((p, t) => (x[p] = k.b[t]))
    return { x, total: k.total, drop: a.total - k.total }
  }, [g, d, gone, a.total])
  const x = after ? after.x : a.b
  const maxB = Math.max(...a.b)
  const sep = lang === 'it' ? '; ' : ', '
  const rank = (o) => o.map((i) => i + 1).join(sep)

  const choose = (k) => {
    setKey(k)
    setGone(null)
  }
  const toggle = (i) => setGone(gone === i ? null : i)

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2" data-role="kp-nets">
        {KEYS.map((k) => (
          <Pill key={k} active={key === k} onClick={() => choose(k)} data-net={k}>{L.nets[k]}</Pill>
        ))}
      </div>
      <div className="mt-3 max-w-md">
        <Slider label={L.delta} min={0.01} max={dmax} step={0.01} value={d} onChange={(v) => setDelta(Math.round(v * 100) / 100)} format={(v) => num(v, lang, 2)} />
      </div>

      <div className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-2 items-start max-w-3xl">
        <div className="min-w-0">
          <NetDraw
            layout={net.layout}
            edges={g.edges}
            removed={gone == null ? [] : [gone]}
            radius={(i) => 6 + 11 * Math.sqrt(Math.max(0, x[i]) / maxB)}
            fill={(i) => `rgba(234, 88, 12, ${0.15 + 0.55 * (x[i] / maxB)})`}
            stroke={(i) => (i === a.key ? ORANGE_DARK : i === a.mostActive ? SKY : '#0f172a')}
            onNode={toggle}
            nodeLabel={(i) => L.nodeLabel(i + 1)}
            aria={L.aria}
            role="kp-net"
            nodeData={(i) => ({ 'data-effort': a.b[i].toFixed(4), 'data-inter': a.inter[i].toFixed(4) })}
          />
          <p className="text-xs text-slate-500 leading-snug">{L.note} {L.hint}</p>
        </div>
        <div className="min-w-0">
          <table className="w-full text-xs font-mono tabular-nums" data-role="kp-table">
            <thead>
              <tr className="text-slate-500 text-left">
                {L.head.map((h) => (
                  <th key={h} className="font-normal pr-2 pb-1">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {a.b.map((b, i) => (
                <tr
                  key={i}
                  className={`cursor-pointer ${gone === i ? 'bg-slate-100 text-slate-400' : 'hover:bg-orange-50'}`}
                  onClick={() => toggle(i)}
                  data-player={i + 1}
                >
                  <td className="pr-2 py-0.5">
                    <button type="button" className="underline decoration-dotted" onClick={(e) => { e.stopPropagation(); toggle(i) }} aria-label={L.nodeLabel(i + 1)}>{i + 1}</button>
                    {i === a.mostActive && <span className="ml-1 text-sky-700">· {L.most}</span>}
                    {i === a.key && <span className="ml-1 text-orange-600">· {L.key}</span>}
                  </td>
                  <td className="pr-2" data-value="b">{n4(b)}</td>
                  <td data-value="inter">{n4(a.inter[i])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <dl className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1.5 text-sm max-w-3xl" data-role="kp-readout">
        {[
          [L.lambda, `${n4(lmax)}, ${n4(1 / lmax)}`, 'lambda'],
          [L.total, n4(a.total), 'total'],
          [L.byEffort, rank(a.byEffort), 'byEffort'],
          [L.byInter, rank(a.byInter), 'byInter'],
        ].map(([label, v, k]) => (
          <div key={k} className="min-w-0">
            <dt className="text-xs text-slate-500">{label}</dt>
            <dd className="font-mono tabular-nums text-slate-900 break-words" data-value={k}>{v}</dd>
          </div>
        ))}
      </dl>
      {after && (
        <div className="mt-2 max-w-3xl rounded-lg border border-slate-200 bg-white px-3 py-2" data-role="kp-removed">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium text-slate-800">{L.removed(gone + 1)}</p>
            <Pill onClick={() => setGone(null)} data-role="kp-restore">{L.restore}</Pill>
          </div>
          <dl className="mt-1 grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 text-sm">
            {[
              [L.newTotal, n4(after.total), 'newTotal'],
              [L.drop, n4(after.drop), 'drop'],
              [L.inter, n4(a.inter[gone]), 'inter'],
              [L.equal, Math.abs(after.drop - a.inter[gone]) <= 1e-9 ? L.yes : L.no, 'equal'],
            ].map(([label, v, k]) => (
              <div key={k} className="min-w-0">
                <dt className="text-xs text-slate-500">{label}</dt>
                <dd className="font-mono tabular-nums text-slate-900" data-value={k}>{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </div>
  )
}
