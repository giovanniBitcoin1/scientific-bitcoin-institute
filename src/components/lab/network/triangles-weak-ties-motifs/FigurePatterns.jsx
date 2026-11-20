import { useState } from 'react'
import { INK, ORANGE_DARK } from '../ui.jsx'
import { PATTERN_IDS } from './motifs.js'
import { PATTERN_TEXT } from './names.js'
import PatternIcon from './PatternIcon.jsx'

// Live figure F2, "Thirteen patterns": every connected pattern of three nodes
// in a directed network. A tap shows its name and, for the chain, the
// feed-forward loop and the three-node cycle, where it turns up. Buttons only.

const T = {
  en: { hint: 'Tap a pattern.', where: 'Where it turns up', of: 'of 13', open: 'Open: two of the three pairs are linked.', closed: 'Closed: all three pairs are linked.' },
  it: { hint: 'Tocca uno schema.', where: 'Dove compare', of: 'di 13', open: 'Aperto: sono collegate due delle tre coppie.', closed: 'Chiuso: sono collegate tutte e tre le coppie.' },
}
const OPEN = 6 // the first six patterns are open

export default function FigurePatterns({ lang = 'en' }) {
  const t = T[lang] || T.en
  const names = PATTERN_TEXT[lang] || PATTERN_TEXT.en
  const [sel, setSel] = useState('feedForward')
  const text = names[sel]
  const index = PATTERN_IDS.indexOf(sel)

  return (
    <div>
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2 max-w-md mx-auto">
        {PATTERN_IDS.map((id, k) => {
          const on = id === sel
          return (
            <button
              key={id}
              type="button"
              data-pattern={id}
              aria-pressed={on}
              aria-label={`${k + 1}. ${names[id].name}`}
              onClick={() => setSel(id)}
              className={`flex items-center justify-center rounded-lg border py-1.5 transition-colors ${
                on ? 'border-orange-500 bg-orange-50' : 'border-slate-200 bg-white hover:border-orange-300'
              }`}
            >
              <PatternIcon id={id} size={30} color={on ? ORANGE_DARK : INK} className="max-w-full h-auto" />
            </button>
          )
        })}
      </div>
      <div className="mt-3 text-sm text-slate-700 leading-snug min-h-[5.5rem]" aria-live="polite" data-readout="pattern">
        <p>
          <span className="font-mono text-xs text-slate-500">
            {index + 1} {t.of} ·{' '}
          </span>
          <span className="font-semibold text-orange-700">{text.name}</span>
        </p>
        <p className="mt-0.5">
          {text.what} <span className="text-slate-500">{index < OPEN ? t.open : t.closed}</span>
        </p>
        {text.where && (
          <p className="mt-0.5">
            <span className="font-mono text-xs uppercase tracking-wider text-slate-500">{t.where}: </span>
            {text.where}
          </p>
        )}
      </div>
      <p className="mt-1 text-xs text-slate-500 leading-snug">{t.hint}</p>
    </div>
  )
}
