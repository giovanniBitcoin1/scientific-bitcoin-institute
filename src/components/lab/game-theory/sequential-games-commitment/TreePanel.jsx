import { useEffect, useMemo, useState } from 'react'
import Slider from '../../Slider.jsx'
import useExperiment from '../../useExperiment.js'
import { Pill, Eyebrow, fmt } from '../../network/ui.jsx'
import GameTree from '../GameTree.jsx'
import PayoffTable, { ROW_COLOR, COL_COLOR } from '../PayoffTable.jsx'
import { analyse, randomCells, surveyJob, DEFAULT_TREES } from './trees.js'
import { presetTree, TREE_PRESETS, PLAYERS } from './presets.js'
import { num } from './FigureEntry.jsx'

// Panel A: solve a tree. Presets (the entry game, with and without
// commitment; the battle of the sexes and matching pennies played in turn;
// a centipede with four moves) or a random two-move tree with whole payoffs
// 0–9 and no ties that matter. "Solve" walks backward induction from the
// leaves, one node at a time. Beside the tree: the same game as a table of
// plans, its pure Nash equilibria, which are subgame perfect, and for the
// others the threat that would not be carried out. "Survey" counts all this
// over random two-move trees with payoffs uniform on 0–1.

const STEP_MS = 550

// "of the …" in Italian: "dell’entrante", "dell’incumbent", "del giocatore di riga".
const di = (p) => {
  const s = p.toLowerCase()
  return /^[aeiou]/.test(s) ? `dell’${s}` : `del ${s}`
}

const T = {
  en: {
    presets: { entry: 'Entry game', commit: 'Entry with commitment (k = 1)', battle: 'Battle of the sexes in turn', pennies: 'Matching pennies in turn', centipede: 'Centipede', random: 'Random tree' },
    newTree: 'New tree',
    solve: 'Solve',
    reset: 'Clear',
    tree: (n) => `Random tree no. ${n}`,
    preset: 'A preset',
    plansNote: (p0, p1) => `Rows: the plans of the ${p0.toLowerCase()}, whose payoff is written first; columns: those of the ${p1.toLowerCase()}. A plan lists a move for every point where that player might choose, in the order the tree is read (left to right, top to bottom). Ringed: the pure Nash equilibria; framed: backward induction.`,
    order: (p0, p1) => `payoffs (${p0.toLowerCase()}, ${p1.toLowerCase()}), the first on top`,
    nash: (n) => (n === 1 ? 'One Nash equilibrium in pure strategies' : `${n} Nash equilibria in pure strategies`),
    spe: 'subgame perfect',
    notSpe: 'not subgame perfect',
    pays: (u, v) => `payoffs ${u} and ${v}`,
    where: (path) => (path.length ? `after ${path.join(', ')}` : 'at the start'),
    threat: (who, move, where, got, better, could) => `${who}: the plan says “${move}” ${where}, where it would get ${got}; “${better}” would give ${could}. The threat would not be carried out.`,
    steps: (k, n) => `Solved ${k} of ${n} points`,
    done: (u, v) => `Backward induction: payoffs ${u} and ${v}.`,
    tie: 'The first mover is indifferent here: both moves give it the same.',
    games: 'Trees G',
    survey: 'Survey',
    stop: 'Stop',
    computing: 'Computing…',
    surveyTitle: (g) => `${g.toLocaleString('en-US')} random two-move trees, payoffs uniform on 0–1`,
    rows: {
      nash: 'Nash equilibria in the table: 1, 2, 3',
      notSpe: 'With an equilibrium that is not subgame perfect',
      differs: '… that leads to a different outcome',
      secondBetter: 'Of those, the second player is better off in it',
      first: 'The first player, by moving first rather than second: better, worse, the same',
      bothFirst: 'Both want to move first',
      bothSecond: 'Both want to move second',
      noPure: 'No pure equilibrium when played at once',
      noPureBothSecond: 'Of those, both prefer to move second',
      leaderAbove: 'With one, the leader does strictly better than the best simultaneous equilibrium',
      leaderBelow: 'Games where the leader does worse than it',
    },
    aria: 'The game tree',
    tableAria: 'The same game as a table of plans',
  },
  it: {
    presets: { entry: 'Gioco dell’entrata', commit: 'Entrata con impegno (k = 1)', battle: 'Battaglia dei sessi a turno', pennies: 'Pari o dispari a turno', centipede: 'Millepiedi', random: 'Albero casuale' },
    newTree: 'Nuovo albero',
    solve: 'Risolvi',
    reset: 'Cancella',
    tree: (n) => `Albero casuale n. ${n}`,
    preset: 'Un gioco preimpostato',
    plansNote: (p0, p1) => `Righe: i piani ${di(p0)}, il cui payoff è scritto per primo; colonne: quelli ${di(p1)}. Un piano indica una mossa per ogni punto in cui quel giocatore potrebbe scegliere, nell’ordine in cui si legge l’albero (da sinistra a destra, dall’alto in basso). Cerchiati: gli equilibri di Nash puri; riquadrato: l’induzione a ritroso.`,
    order: (p0, p1) => `payoff (${p0.toLowerCase()}, ${p1.toLowerCase()}), il primo in alto`,
    nash: (n) => (n === 1 ? 'Un equilibrio di Nash in strategie pure' : `${n} equilibri di Nash in strategie pure`),
    spe: 'perfetto nei sottogiochi',
    notSpe: 'non perfetto nei sottogiochi',
    pays: (u, v) => `payoff ${u} e ${v}`,
    where: (path) => (path.length ? `dopo ${path.join(', ')}` : 'all’inizio'),
    threat: (who, move, where, got, better, could) => `${who}: il piano dice “${move}” ${where}, dove otterrebbe ${got}; “${better}” darebbe ${could}. La minaccia non verrebbe eseguita.`,
    steps: (k, n) => `Risolti ${k} punti su ${n}`,
    done: (u, v) => `Induzione a ritroso: payoff ${u} e ${v}.`,
    tie: 'Qui chi muove per primo è indifferente: le due mosse gli danno lo stesso.',
    games: 'Alberi G',
    survey: 'Rassegna',
    stop: 'Ferma',
    computing: 'Calcolo in corso…',
    surveyTitle: (g) => `${g.toLocaleString('it-IT')} alberi casuali a due mosse, payoff uniformi tra 0 e 1`,
    rows: {
      nash: 'Equilibri di Nash nella tabella: 1, 2, 3',
      notSpe: 'Con un equilibrio non perfetto nei sottogiochi',
      differs: '… che porta a un esito diverso',
      secondBetter: 'Di questi, il secondo giocatore ci sta meglio',
      first: 'Il primo giocatore, muovendo per primo invece che per secondo: meglio, peggio, uguale',
      bothFirst: 'Entrambi vogliono muovere per primi',
      bothSecond: 'Entrambi vogliono muovere per secondi',
      noPure: 'Nessun equilibrio puro giocando insieme',
      noPureBothSecond: 'Di questi, entrambi preferiscono muovere per secondi',
      leaderAbove: 'Con uno, il leader fa strettamente meglio del miglior equilibrio simultaneo',
      leaderBelow: 'Giochi in cui il leader fa peggio',
    },
    aria: 'L’albero del gioco',
    tableAria: 'Lo stesso gioco come tabella dei piani',
  },
}

export default function TreePanel({ lang = 'en' }) {
  const t = T[lang] || T.en
  const loc = (v, d = 3) => (lang === 'it' ? fmt(v, d).replace('.', ',') : fmt(v, d))
  const n = (v) => num(v, lang)
  const [preset, setPreset] = useState('entry')
  const [index, setIndex] = useState(0)
  const [steps, setSteps] = useState(null) // null: not solving; k: nodes solved
  const [games, setGames] = useState(DEFAULT_TREES)
  const [surveyKey, setSurveyKey] = useState(null)
  const exp = useExperiment()

  const tree = useMemo(() => presetTree(preset, lang, preset === 'random' ? randomCells(index) : null), [preset, index, lang])
  const a = useMemo(() => analyse(tree), [tree])
  const players = (PLAYERS[lang] || PLAYERS.en)[preset]
  const initials = preset === 'entry' || preset === 'commit' ? players.map((p) => p[0]) : ['1', '2']
  const total = a.bi.order.length

  useEffect(() => setSteps(null), [tree])
  const running = steps != null && steps < total
  useEffect(() => {
    if (!running) return
    const id = setTimeout(() => setSteps((s) => s + 1), STEP_MS)
    return () => clearTimeout(id)
  }, [running, steps])

  const solvedNodes = steps == null ? [] : a.bi.order.slice(0, steps)
  const solved = new Set(solvedNodes.map((x) => x.id))
  const finished = steps != null && steps >= total
  const path = finished ? new Set(a.bi.path.map((x) => x.id)) : new Set()
  const values = new Map(solvedNodes.map((x) => [x.id, a.bi.value.get(x.id)]))
  const biCell = (() => {
    const [p0, p1] = [0, 1].map((p) => tree.decision[p].map((x) => a.bi.choice.get(x.id)))
    const i = a.table.plans[0].findIndex((x) => x.join() === p0.join())
    const j = a.table.plans[1].findIndex((y) => y.join() === p1.join())
    return [i, j]
  })()
  const moveName = (x, k) => x.moves[k].name

  const showSurvey = exp.data && surveyKey === games
  const d = exp.data
  const big = a.table.rows.length > 3 || a.table.cols.length > 3

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {TREE_PRESETS.map((id) => (
          <Pill key={id} active={preset === id} onClick={() => setPreset(id)}>
            {t.presets[id]}
          </Pill>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Pill
          onClick={() => {
            if (preset === 'random') setIndex(index + 1)
            else setPreset('random')
          }}
        >
          {t.newTree}
        </Pill>
        <Pill primary onClick={() => setSteps(0)} disabled={running}>
          {t.solve}
        </Pill>
        <Pill onClick={() => setSteps(null)}>{t.reset}</Pill>
      </div>

      <div className="mt-5 grid gap-6 md:grid-cols-2 items-start">
        <div className="min-w-0">
          <Eyebrow>{preset === 'random' ? t.tree(index + 1) : t.preset}</Eyebrow>
          <div className="mt-2 max-w-md">
            <GameTree tree={tree} initials={initials} choice={a.bi.choice} solved={solved} path={path} values={values} format={n} aria={t.aria} />
          </div>
          <p className="mt-1 text-[11px] text-slate-600 leading-snug">
            <span className="font-semibold" style={{ color: ROW_COLOR }}>
              {initials[0]} {players[0]}
            </span>
            {' · '}
            <span className="font-semibold" style={{ color: COL_COLOR }}>
              {initials[1]} {players[1]}
            </span>
            {' · '}
            {t.order(players[0], players[1])}
          </p>
          <p className="mt-2 text-sm text-slate-700 leading-snug" data-role="tree-status">
            {steps == null ? '' : finished ? t.done(n(a.bi.outcome.payoffs[0]), n(a.bi.outcome.payoffs[1])) : t.steps(steps, total)}
            {finished && a.bi.tie.get(tree.root.id) ? ` ${t.tie}` : ''}
          </p>
        </div>
        <div className="min-w-0">
          <div className={big ? 'max-w-md' : 'max-w-xs'}>
            <PayoffTable game={a.table} stable={a.eq.map((e) => e.cell)} selected={biCell} compact={big} format={n} aria={t.tableAria} />
          </div>
          <p className="mt-2 text-xs text-slate-500 leading-snug">{t.plansNote(players[0], players[1])}</p>
          <div className="mt-3" data-role="tree-nash">
            <Eyebrow>{t.nash(a.eq.length)}</Eyebrow>
            <ol className="mt-2 space-y-2 text-sm text-slate-700">
              {a.eq.map((e, k) => {
                const [i, j] = e.cell
                const th = e.threat
                return (
                  <li key={k} className="rounded-lg border border-slate-200 bg-white px-3 py-2 leading-snug">
                    <span className="font-mono text-xs tabular-nums">
                      <span style={{ color: ROW_COLOR }}>{a.table.rows[i]}</span>, <span style={{ color: COL_COLOR }}>{a.table.cols[j]}</span>
                      {' · '}
                      {t.pays(n(a.table.a[i][j]), n(a.table.b[i][j]))}
                    </span>{' '}
                    <span className={`ml-1 font-mono text-[10px] uppercase tracking-wider font-semibold ${e.spe ? 'text-orange-600' : 'text-slate-500'}`}>{e.spe ? t.spe : t.notSpe}</span>
                    {th && (
                      <div className="mt-1 text-xs text-slate-600">
                        {t.threat(players[th.player], moveName(th.node, th.move), t.where(th.node.path), n(th.got), moveName(th.node, th.better), n(th.could))}
                      </div>
                    )}
                  </li>
                )
              })}
            </ol>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-x-8 gap-y-3 sm:grid-cols-2 max-w-3xl items-end">
        <Slider label={t.games} min={500} max={20000} step={500} value={games} onChange={setGames} format={(v) => v.toLocaleString('en-US')} />
        <div className="flex flex-wrap items-center gap-2">
          {exp.running ? (
            <Pill onClick={exp.cancel}>{t.stop}</Pill>
          ) : (
            <Pill
              primary
              onClick={() => {
                setSurveyKey(games)
                exp.run(surveyJob({ trees: games }))
              }}
            >
              {t.survey}
            </Pill>
          )}
          {exp.running && <span className="text-xs text-slate-500">{t.computing}</span>}
        </div>
      </div>
      {showSurvey && d.trees > 0 && (
        <div className="mt-4" data-role="tree-survey">
          <Eyebrow>{t.surveyTitle(games)}</Eyebrow>
          <div className="mt-2 max-w-3xl overflow-x-auto rounded-lg border border-slate-200 bg-white">
            <table className="w-full border-collapse text-xs">
              <tbody className="text-slate-700">
                {[
                  ['nash', `${loc(d.nash1)}, ${loc(d.nash2)}, ${loc(d.nash3)}`],
                  ['notSpe', loc(d.notSpe)],
                  ['differs', loc(d.differs)],
                  ['secondBetter', loc(d.secondBetter)],
                  ['first', `${loc(d.better)}, ${loc(d.worse)}, ${loc(d.same)}`],
                  ['bothFirst', loc(d.bothFirst)],
                  ['bothSecond', loc(d.bothSecond)],
                  ['noPure', loc(d.noPure)],
                  ['noPureBothSecond', loc(d.noPureBothSecond)],
                  ['leaderAbove', loc(d.leaderAbove)],
                  ['leaderBelow', String(d.leaderBelow)],
                ].map(([key, v]) => (
                  <tr key={key}>
                    <td className="border-b border-slate-100 px-2 py-1.5 leading-snug">{t.rows[key]}</td>
                    <td className="border-b border-slate-100 px-2 py-1.5 font-mono tabular-nums text-slate-900 whitespace-nowrap text-right" data-row={key}>
                      {v}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
