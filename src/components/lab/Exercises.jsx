import { useState } from 'react'
import LabMarkdown from './LabMarkdown.jsx'

// Numbered exercises with the solution hidden behind a button. Each item is
//   { type, statement: { en, it }, solution: { en, it } }
// where `type` is "paper", "sim" or "both" (on paper first, then checked in
// the simulation) and statement and solution are markdown. Rendered by
// LabLecture, so like the lecture they are never fetched while the Lab is locked.
const COPY = {
  en: {
    exercise: 'Exercise',
    show: 'Show solution',
    hide: 'Hide solution',
    solution: 'Solution',
    type: { paper: 'On paper', sim: 'In the simulation', both: 'On paper, then in the simulation' },
  },
  it: {
    exercise: 'Esercizio',
    show: 'Mostra soluzione',
    hide: 'Nascondi soluzione',
    solution: 'Soluzione',
    type: { paper: 'Su carta', sim: 'Nella simulazione', both: 'Su carta, poi nella simulazione' },
  },
}

function Exercise({ item, number, lang, c }) {
  const [open, setOpen] = useState(false)
  return (
    <li className="bg-white rounded-xl border border-slate-200 shadow-sm px-5 py-4">
      <p className="text-xs uppercase tracking-wider text-orange-600 font-semibold font-mono">
        {c.exercise} {number} <span className="text-slate-400">·</span>{' '}
        <span className="text-slate-500">{c.type[item.type] || c.type.paper}</span>
      </p>
      <LabMarkdown lang={lang}>{item.statement[lang] || item.statement.en}</LabMarkdown>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="px-4 py-1.5 rounded-full border border-slate-200 bg-white text-xs font-mono uppercase tracking-wider text-slate-600 hover:text-orange-600 hover:border-orange-300 transition-colors"
      >
        {open ? c.hide : c.show}
      </button>
      {open && (
        <div className="mt-4 border-t border-slate-200 pt-1">
          <p className="mt-3 text-xs uppercase tracking-wider text-slate-500 font-semibold font-mono">
            {c.solution}
          </p>
          <LabMarkdown lang={lang}>{item.solution[lang] || item.solution.en}</LabMarkdown>
        </div>
      )}
    </li>
  )
}

export default function Exercises({ items, lang }) {
  const c = COPY[lang] || COPY.en
  return (
    <ol className="space-y-5 list-none p-0">
      {items.map((item, i) => (
        <Exercise key={i} item={item} number={i + 1} lang={lang} c={c} />
      ))}
    </ol>
  )
}
