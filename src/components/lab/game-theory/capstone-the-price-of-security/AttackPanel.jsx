import { useMemo, useState } from 'react'
import { Pill } from '../../network/ui.jsx'
import { DATED, TEST, SOURCES } from './defaults.js'
import { FIELDS, LABELS, NumberField, Outputs, compute } from './attack.jsx'

// Panel A, "The cost of an attack": Budish's flow cost with dated defaults,
// and the objections, each with its verdict line. "Test values" loads the
// round values of the exercises.

const T = {
  en: { dated: 'Dated defaults', test: 'Test values (exercises)', note: 'Every default is dated; under each field, its source. Change any of them.' },
  it: { dated: 'Valori datati', test: 'Valori di prova (esercizi)', note: 'Ogni valore predefinito è datato; sotto ogni campo, la sua fonte. Cambiali come vuoi.' },
}

export default function AttackPanel({ lang = 'en' }) {
  const L = T[lang] || T.en
  const F = LABELS[lang] || LABELS.en
  const [x, setX] = useState(DATED)
  const [which, setWhich] = useState('dated')
  const r = useMemo(() => compute(x), [x])
  const set = (k) => (v) => { setX({ ...x, [k]: v }); setWhich(null) }
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <Pill active={which === 'dated'} onClick={() => { setX(DATED); setWhich('dated') }} data-role="at-dated">{L.dated}</Pill>
        <Pill active={which === 'test'} onClick={() => { setX(TEST); setWhich('test') }} data-role="at-test">{L.test}</Pill>
      </div>
      <p className="mt-2 text-xs text-slate-600">{L.note}</p>
      <div className="mt-3 grid gap-x-6 gap-y-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl" data-role="at-inputs">
        {FIELDS.map((f) => (
          <NumberField key={f.k} f={f} value={x[f.k]} onChange={set(f.k)} label={F[f.k]} note={which === 'dated' ? SOURCES[f.k][lang] : null}>
            {f.k === 'loss' && (
              <label className="mt-1 flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={x.collapse} onChange={(e) => set('collapse')(e.target.checked)} className="accent-orange-600" data-field="collapse" />
                {F.collapse}
              </label>
            )}
          </NumberField>
        ))}
      </div>
      <div className="mt-4 max-w-4xl">
        <Outputs x={x} r={r} lang={lang} role="at-out" />
      </div>
    </div>
  )
}
