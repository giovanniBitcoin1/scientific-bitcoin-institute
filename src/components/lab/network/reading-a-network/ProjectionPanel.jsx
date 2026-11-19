import { useMemo, useState } from 'react'
import { ORANGE_DARK, INK, SLATE, MUTED, MONO, Stat, Pill, Eyebrow } from '../ui.jsx'
import { TOPS, BOTTOMS, PRESET_GRIDS, emptyGrid, project } from './bipartite.js'

// Panel C: one bipartite network, two projections. The network is edited by
// tapping the cells of a membership grid (buttons, so nothing captures a
// swipe); both projections are redrawn live with link width = weight.

const BOTTOM_NAMES = 'abcdefgh'

const THEMES = {
  papers: { prefix: 'P' },
  films: { prefix: 'F' },
  transactions: { prefix: 'T' },
}

const T = {
  en: {
    theme: 'Theme',
    themes: { papers: 'Papers – authors', films: 'Films – actors', transactions: 'Transactions – addresses' },
    top: { papers: 'papers', films: 'films', transactions: 'transactions' },
    bottom: { papers: 'authors', films: 'actors', transactions: 'addresses' },
    presets: { exercise6: 'Exercise 6', bigPaper: { papers: 'One big paper', films: 'One big film', transactions: 'One big transaction' } },
    clear: 'Clear',
    grid: 'Membership grid',
    gridHint: (top, bottom) => `Rows: ${top}. Columns: ${bottom}. Tap a cell to join or separate them.`,
    bipartite: 'Bipartite network',
    projBottom: (bottom, top) => `${bottom} sharing ${top}`,
    projTop: (top, bottom) => `${top} sharing ${bottom}`,
    weightNote: 'Link width and number: weight (how many they share).',
    stats: { links: 'Links, bipartite', bottom: (b) => `Links among ${b}`, top: (t) => `Links among ${t}`, max: 'Largest weight' },
    none: 'no nodes yet',
    aria: 'Projection drawn as a network: line width shows the weight of each link',
    cell: (top, bottom, on) => `${top}, ${bottom}: ${on ? 'joined' : 'not joined'}`,
  },
  it: {
    theme: 'Tema',
    themes: { papers: 'Articoli – autori', films: 'Film – attori', transactions: 'Transazioni – indirizzi' },
    top: { papers: 'articoli', films: 'film', transactions: 'transazioni' },
    bottom: { papers: 'autori', films: 'attori', transactions: 'indirizzi' },
    presets: { exercise6: 'Esercizio 6', bigPaper: { papers: 'Un grande articolo', films: 'Un grande film', transactions: 'Una grande transazione' } },
    clear: 'Svuota',
    grid: 'Griglia di appartenenza',
    gridHint: (top, bottom) => `Righe: ${top}. Colonne: ${bottom}. Tocca una cella per unirli o separarli.`,
    bipartite: 'Rete bipartita',
    projBottom: (bottom, top) => `${bottom} con ${top} in comune`,
    projTop: (top, bottom) => `${top} con ${bottom} in comune`,
    weightNote: 'Spessore e numero del collegamento: peso (quanti ne hanno in comune).',
    stats: { links: 'Collegamenti, bipartita', bottom: (b) => `Collegamenti tra ${b}`, top: (t) => `Collegamenti tra ${t}`, max: 'Peso massimo' },
    none: 'ancora nessun nodo',
    aria: 'Proiezione disegnata come rete: lo spessore della linea indica il peso di ogni collegamento',
    cell: (top, bottom, on) => `${top}, ${bottom}: ${on ? 'uniti' : 'non uniti'}`,
  },
}

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1)

// One projection: the nodes that take part sit at fixed places on a circle,
// so they do not jump when the grid changes.
function Projection({ side, labels, degree, title, aria, none }) {
  const size = side.size
  const R = 62
  const at = (i) => {
    const a = -Math.PI / 2 + (2 * Math.PI * i) / size
    return [90 + R * Math.cos(a), 84 + R * Math.sin(a)]
  }
  const present = labels.map((_, i) => degree[i] > 0)
  const links = []
  for (let i = 0; i < size; i++) for (let j = i + 1; j < size; j++) if (side.weight[i][j]) links.push([i, j, side.weight[i][j]])
  return (
    <div className="min-w-0">
      <p className="text-[11px] uppercase tracking-wider text-slate-500 font-mono leading-snug min-h-[2rem]">{title}</p>
      <svg viewBox="0 0 180 168" className="w-full max-w-[260px] mx-auto h-auto" role="img" aria-label={aria}>
        {links.map(([i, j, w]) => {
          const [x1, y1] = at(i)
          const [x2, y2] = at(j)
          return <line key={`${i}-${j}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={w > 1 ? ORANGE_DARK : SLATE} strokeWidth={1 + 1.6 * (w - 1)} strokeLinecap="round" opacity="0.85" />
        })}
        {links
          .filter(([, , w]) => w > 1)
          .map(([i, j, w]) => {
            const [x1, y1] = at(i)
            const [x2, y2] = at(j)
            return (
              <g key={`w${i}-${j}`}>
                <circle cx={(x1 + x2) / 2} cy={(y1 + y2) / 2} r="7" fill="#fff" stroke={ORANGE_DARK} strokeWidth="1" />
                <text x={(x1 + x2) / 2} y={(y1 + y2) / 2 + 3} textAnchor="middle" fontSize="9" fontFamily={MONO} fill={ORANGE_DARK}>
                  {w}
                </text>
              </g>
            )
          })}
        {labels.map((label, i) => {
          if (!present[i]) return null
          const [x, y] = at(i)
          return (
            <g key={label}>
              <circle cx={x} cy={y} r="11" fill="#fff" stroke={INK} strokeWidth="1.5" />
              <text x={x} y={y + 3.5} textAnchor="middle" fontSize="10" fontFamily={MONO} fill={INK}>
                {label}
              </text>
            </g>
          )
        })}
        {!present.some(Boolean) && (
          <text x="90" y="88" textAnchor="middle" fontSize="10" fontFamily={MONO} fill={MUTED}>
            {none}
          </text>
        )}
      </svg>
    </div>
  )
}

export default function ProjectionPanel({ lang = 'en' }) {
  const t = T[lang] || T.en
  const [theme, setTheme] = useState('papers')
  const [grid, setGrid] = useState(PRESET_GRIDS.exercise6)

  const p = useMemo(() => project(grid), [grid])
  const topLabels = Array.from({ length: TOPS }, (_, i) => `${THEMES[theme].prefix}${i + 1}`)
  const bottomLabels = BOTTOM_NAMES.slice(0, BOTTOMS).split('')
  const top = t.top[theme]
  const bottom = t.bottom[theme]

  const toggle = (r, c) => setGrid(grid.map((row, i) => (i === r ? row.map((on, j) => (j === c ? !on : on)) : row)))

  // Bipartite drawing: top nodes on one row, bottom nodes on another.
  const tx = (i) => 30 + (i * 300) / (TOPS - 1)
  const bx = (j) => 12 + (j * 336) / (BOTTOMS - 1)

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700 min-w-0">
          {t.theme}
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="min-w-0 rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 focus:outline-none focus:border-orange-500"
          >
            {Object.keys(THEMES).map((id) => (
              <option key={id} value={id}>
                {t.themes[id]}
              </option>
            ))}
          </select>
        </label>
        <Pill onClick={() => setGrid(PRESET_GRIDS.exercise6())}>{t.presets.exercise6}</Pill>
        <Pill onClick={() => setGrid(PRESET_GRIDS.bigPaper())}>{t.presets.bigPaper[theme]}</Pill>
        <Pill onClick={() => setGrid(emptyGrid())}>{t.clear}</Pill>
      </div>

      <div className="mt-4 grid gap-6 lg:grid-cols-[auto_1fr] items-start">
        <div className="min-w-0">
          <Eyebrow>{t.grid}</Eyebrow>
          <div className="mt-2 inline-grid font-mono text-xs" style={{ gridTemplateColumns: `2rem repeat(${BOTTOMS}, auto)` }}>
            <span />
            {bottomLabels.map((b) => (
              <span key={b} className="w-[30px] text-center text-slate-500 pb-1">
                {b}
              </span>
            ))}
            {grid.map((row, r) => [
              <span key={`l${r}`} className="h-[30px] leading-[30px] text-slate-500">
                {topLabels[r]}
              </span>,
              ...row.map((on, c) => (
                <button
                  key={c}
                  type="button"
                  aria-pressed={on}
                  aria-label={t.cell(topLabels[r], bottomLabels[c], on)}
                  onClick={() => toggle(r, c)}
                  className={`w-[30px] h-[30px] border border-white rounded-sm transition-colors ${
                    on ? 'bg-orange-500 hover:bg-orange-600' : 'bg-slate-100 hover:bg-orange-100'
                  }`}
                />
              )),
            ])}
          </div>
          <p className="mt-2 text-xs text-slate-500 leading-snug max-w-[18rem]">{t.gridHint(top, bottom)}</p>
        </div>

        <div className="min-w-0">
          <Eyebrow>{t.bipartite}</Eyebrow>
          <svg viewBox="0 0 360 96" className="mt-2 w-full max-w-[560px] h-auto" role="img" aria-label={t.bipartite}>
            {grid.flatMap((row, r) =>
              row.map((on, c) => (on ? <line key={`${r}-${c}`} x1={tx(r)} y1="22" x2={bx(c)} y2="74" stroke={SLATE} strokeWidth="1.25" /> : null)),
            )}
            {topLabels.map((label, r) => (
              <g key={label} opacity={p.topDegree[r] ? 1 : 0.3}>
                <rect x={tx(r) - 13} y="9" width="26" height="20" rx="3" fill={INK} />
                <text x={tx(r)} y="23" textAnchor="middle" fontSize="10" fontFamily={MONO} fill="#fff">
                  {label}
                </text>
              </g>
            ))}
            {bottomLabels.map((label, c) => (
              <g key={label} opacity={p.bottomDegree[c] ? 1 : 0.3}>
                <circle cx={bx(c)} cy="80" r="10" fill="#fff" stroke={INK} strokeWidth="1.5" />
                <text x={bx(c)} y="83.5" textAnchor="middle" fontSize="10" fontFamily={MONO} fill={INK}>
                  {label}
                </text>
              </g>
            ))}
          </svg>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <Projection
              side={p.bottom}
              labels={bottomLabels}
              degree={p.bottomDegree}
              title={t.projBottom(cap(bottom), top)}
              aria={t.aria}
              none={t.none}
            />
            <Projection
              side={p.top}
              labels={topLabels}
              degree={p.topDegree}
              title={t.projTop(cap(top), bottom)}
              aria={t.aria}
              none={t.none}
            />
          </div>
          <p className="mt-1 text-xs text-slate-500">{t.weightNote}</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label={t.stats.links}>{p.links}</Stat>
        <Stat label={t.stats.bottom(bottom)}>{p.bottom.links}</Stat>
        <Stat label={t.stats.top(top)}>{p.top.links}</Stat>
        <Stat label={t.stats.max}>{Math.max(p.top.maxWeight, p.bottom.maxWeight)}</Stat>
      </div>
    </div>
  )
}
