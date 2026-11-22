import { useMemo, useState } from 'react'
import Slider from '../../Slider.jsx'
import { ORANGE_DARK, INK, Eyebrow, Pill, Stat } from '../ui.jsx'
import { groupsState, illusionState, C_DEFAULT, C_N, C_M } from './experiments.js'

// Panel C, "Birds of a feather": a growing network with two groups and a
// homophily parameter h, its mixing matrix and the indices built on it; then
// the majority illusion on the same network, with a switch for disassortative
// rewiring that keeps every degree.

const T = {
  en: {
    q: 'Minority share q',
    h: 'Homophily h: chance that a link stays in the group',
    model: `${C_N.toLocaleString('en-US')} nodes, grown one at a time. Each newcomer is in the minority with probability q and brings ${C_M} links; each link goes to its own group with probability h, to the other otherwise, and within that group to a node chosen in proportion to its degree.`,
    matrix: 'Mixing matrix, shares of link ends',
    majority: 'majority',
    minority: 'minority',
    measured: 'Minority share, measured',
    assort: 'Attribute assortativity',
    inside: (g) => `Links of the ${g} that stay inside`,
    coleman: (g) => `Coleman's index, ${g}`,
    illusion: 'The majority illusion',
    share: 'Share of nodes coloured',
    how: { top: 'Colour the highest degrees', random: 'Colour at random' },
    rewire: 'Rewire towards disassortative, same degrees',
    colouredOverall: 'Coloured overall',
    see: 'Nodes that see a coloured majority',
    r: 'Degree r of the network shown',
    note: 'A node "sees a coloured majority" when more than half of its neighbours are coloured. The same nodes stay coloured when the network is rewired.',
    ariaMatrix: 'Mixing matrix of the two groups',
    locale: 'en-US',
  },
  it: {
    q: 'Quota della minoranza q',
    h: 'Omofilia h: probabilità che un collegamento resti nel gruppo',
    model: `${C_N.toLocaleString('it-IT')} nodi, aggiunti uno alla volta. Ogni nodo nuovo è nella minoranza con probabilità q e porta ${C_M} collegamenti; ogni collegamento va al proprio gruppo con probabilità h, all'altro altrimenti, e dentro quel gruppo a un nodo scelto in proporzione al suo grado.`,
    matrix: 'Matrice di mescolamento, quote di estremi dei collegamenti',
    majority: 'maggioranza',
    minority: 'minoranza',
    measured: 'Quota della minoranza, misurata',
    assort: "Assortatività per attributo",
    inside: (g) => `Collegamenti della ${g} che restano dentro`,
    coleman: (g) => `Indice di Coleman, ${g}`,
    illusion: "L'illusione della maggioranza",
    share: 'Quota di nodi colorati',
    how: { top: 'Colora i gradi più alti', random: 'Colora a caso' },
    rewire: 'Ricabla verso disassortativa, stessi gradi',
    colouredOverall: 'Colorati in tutto',
    see: 'Nodi che vedono una maggioranza colorata',
    r: 'r dei gradi della rete mostrata',
    note: 'Un nodo "vede una maggioranza colorata" quando più di metà dei suoi vicini sono colorati. Quando la rete viene ricablata restano colorati gli stessi nodi.',
    ariaMatrix: 'Matrice di mescolamento dei due gruppi',
    locale: 'it-IT',
  },
}

export default function GroupsPanel({ lang = 'en' }) {
  const t = T[lang] || T.en
  const num = (v, d) => (Number.isFinite(v) ? v.toLocaleString(t.locale, { minimumFractionDigits: d, maximumFractionDigits: d }) : '–')
  const pct = (v) => `${num(100 * v, 1)}%`
  const [q, setQ] = useState(C_DEFAULT.q)
  const [h, setH] = useState(C_DEFAULT.h)
  const [share, setShare] = useState(C_DEFAULT.share)
  const [how, setHow] = useState(C_DEFAULT.how)
  const [rewired, setRewired] = useState(C_DEFAULT.rewired)
  const s = useMemo(() => groupsState({ q, h }), [q, h])
  const ill = useMemo(() => illusionState(s.net, { share, how, rewired }), [s, share, how, rewired])
  const names = [t.majority, t.minority]

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Slider label={t.q} min={0.05} max={0.5} step={0.05} value={q} onChange={(v) => setQ(Math.round(v * 20) / 20)} format={(v) => num(v, 2)} />
        <Slider label={t.h} min={0} max={1} step={0.05} value={h} onChange={(v) => setH(Math.round(v * 20) / 20)} format={(v) => num(v, 2)} />
      </div>
      <p className="mt-1 text-xs text-slate-500 leading-snug">{t.model}</p>

      <div className="mt-4 grid gap-6 lg:grid-cols-2 items-start">
        <div className="min-w-0">
          <Eyebrow>{t.matrix}</Eyebrow>
          <table className="mt-2 text-sm font-mono tabular-nums" aria-label={t.ariaMatrix}>
            <thead>
              <tr className="text-xs text-slate-500">
                <th className="py-1 pr-3" />
                {names.map((g) => (
                  <th key={g} className="py-1 px-3 font-normal">{g}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[0, 1].map((i) => (
                <tr key={i} className="border-t border-slate-200">
                  <th className="py-1 pr-3 text-xs text-slate-500 font-normal text-left">{names[i]}</th>
                  {[0, 1].map((j) => (
                    <td key={j} className="py-1 px-3 text-center" style={{ background: `rgba(234, 88, 12, ${(0.08 + 0.6 * s.e[i][j]).toFixed(3)})` }}>
                      {num(s.e[i][j], 3)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div
          className="min-w-0 grid grid-cols-2 gap-2"
          data-readout="groups"
          data-assort={s.assortativity.toFixed(3)}
          data-inside={s.inside.map((v) => v.toFixed(3)).join(' ')}
          data-coleman={s.coleman.map((v) => v.toFixed(3)).join(' ')}
        >
          <Stat label={t.measured}>{pct(s.w[1])}</Stat>
          <Stat label={t.assort}>{num(s.assortativity, 3)}</Stat>
          <Stat label={t.inside(t.majority)}>{pct(s.inside[0])}</Stat>
          <Stat label={t.inside(t.minority)}>{pct(s.inside[1])}</Stat>
          <Stat label={t.coleman(t.majority)}>{num(s.coleman[0], 3)}</Stat>
          <Stat label={t.coleman(t.minority)}>{num(s.coleman[1], 3)}</Stat>
        </div>
      </div>

      <div className="mt-6">
        <Eyebrow>{t.illusion}</Eyebrow>
        <div className="mt-2 grid gap-4 sm:grid-cols-2">
          <Slider label={t.share} min={0.01} max={0.3} step={0.01} value={share} onChange={(v) => setShare(Math.round(v * 100) / 100)} format={(v) => pct(v)} />
          <div className="flex flex-wrap gap-2 items-start">
            {['top', 'random'].map((id) => (
              <Pill key={id} active={how === id} onClick={() => setHow(id)} data-how={id}>
                {t.how[id]}
              </Pill>
            ))}
            <Pill active={rewired} onClick={() => setRewired((x) => !x)} data-action="rewire">
              {t.rewire}
            </Pill>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 lg:grid-cols-3 gap-2" data-readout="illusion-c" data-majority={ill.majority.toFixed(3)} data-coloured={ill.coloured.toFixed(3)} data-r={ill.r.toFixed(3)}>
          <Stat label={t.colouredOverall}>
            <span style={{ color: ORANGE_DARK }}>{pct(ill.coloured)}</span>
          </Stat>
          <Stat label={t.see}>
            <span style={{ color: INK }}>{pct(ill.majority)}</span>
          </Stat>
          <Stat label={t.r}>{num(ill.r, 3)}</Stat>
        </div>
        <p className="mt-1 text-xs text-slate-500 leading-snug">{t.note}</p>
      </div>
    </div>
  )
}
