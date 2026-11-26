import { useEffect, useMemo, useState } from 'react'
import { Pill } from '../../network/ui.jsx'
import { DATED, SOURCES } from './defaults.js'
import { FIELDS, LABELS, NumberField, Outputs, compute, outputLines, fmtInput } from './attack.jsx'

// Panel C, "Your own estimate": Panel A's calculator as a worksheet. Every
// input has a field for its source and its date; the summary lists every
// assumption and every result as plain text to copy. Nothing is stored.

const T = {
  en: {
    source: 'source',
    date: 'date',
    summary: 'Summary to copy',
    copy: 'Copy',
    copied: 'Copied',
    reset: 'Start from the dated defaults',
    note: 'Nothing you type is stored: it lives in this page until you leave it.',
    title: 'Estimate of the cost of a majority attack on Bitcoin (Budish’s model)',
    inputs: 'Assumptions',
    results: 'Results',
    verdicts: 'Verdicts',
    none: 'no source given',
    noDate: 'no date',
    sentence: (v, yes, n) => `Under these assumptions, an attack worth ${v} is ${yes ? '' : 'not '}deterred by the flow of payments to miners, with k + e = ${n}.`,
    caveat: 'A statement about a model with these inputs, not a verdict on Bitcoin.',
  },
  it: {
    source: 'fonte',
    date: 'data',
    summary: 'Riepilogo da copiare',
    copy: 'Copia',
    copied: 'Copiato',
    reset: 'Riparti dai valori datati',
    note: 'Nulla di ciò che scrivi viene salvato: resta in questa pagina finché non la lasci.',
    title: 'Stima del costo di un attacco di maggioranza a Bitcoin (modello di Budish)',
    inputs: 'Ipotesi',
    results: 'Risultati',
    verdicts: 'Verdetti',
    none: 'nessuna fonte indicata',
    noDate: 'nessuna data',
    sentence: (v, yes, n) => `Con queste ipotesi, un attacco che vale ${v} ${yes ? 'è' : 'non è'} scoraggiato dal flusso dei pagamenti ai miner, con k + e = ${n}.`,
    caveat: 'Un’affermazione su un modello con questi valori, non un verdetto su Bitcoin.',
  },
}

const blankMeta = (lang) => Object.fromEntries(FIELDS.map((f) => [f.k, { source: SOURCES[f.k][lang], date: '' }]))

export default function EstimatePanel({ lang = 'en' }) {
  const L = T[lang] || T.en
  const F = LABELS[lang] || LABELS.en
  const [x, setX] = useState(DATED)
  const [meta, setMeta] = useState(() => blankMeta(lang))
  const [copied, setCopied] = useState(false)
  // A language switch translates the sources the reader has not changed.
  useEffect(() => {
    setMeta((m) => Object.fromEntries(Object.entries(m).map(([k, v]) => [k, Object.values(SOURCES[k]).includes(v.source) ? { ...v, source: SOURCES[k][lang] } : v])))
  }, [lang])
  const r = useMemo(() => compute(x), [x])
  const o = outputLines(x, r, lang)
  const set = (k) => (v) => { setX({ ...x, [k]: v }); setCopied(false) }
  const setM = (k, part) => (e) => { setMeta({ ...meta, [k]: { ...meta[k], [part]: e.target.value } }); setCopied(false) }
  const summary = [
    L.title,
    '',
    `${L.inputs}:`,
    ...FIELDS.map((f) => `- ${F[f.k]}: ${fmtInput(f.k, x[f.k], lang)} (${meta[f.k].source || L.none}; ${meta[f.k].date || L.noDate})`),
    `- ${F.collapse}: ${x.collapse ? (lang === 'it' ? 'sì' : 'yes') : 'no'}`,
    '',
    `${L.results}:`,
    ...[...o.values, ...o.zero].map(([, label, v]) => `- ${label}: ${v}`),
    '',
    `${L.verdicts}:`,
    ...o.verdicts.map(([, s]) => `- ${s}`),
    '',
    L.sentence(fmtInput('V', x.V, lang), r.deterred, x.n),
    L.caveat,
  ].join('\n')
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(summary)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <Pill onClick={() => { setX(DATED); setMeta(blankMeta(lang)); setCopied(false) }} data-role="es-reset">{L.reset}</Pill>
        <span className="text-xs text-slate-500">{L.note}</span>
      </div>
      <div className="mt-3 grid gap-x-6 gap-y-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl" data-role="es-inputs">
        {FIELDS.map((f) => (
          <NumberField key={f.k} f={f} value={x[f.k]} onChange={set(f.k)} label={F[f.k]}>
            <div className="mt-1 grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-1">
              <input type="text" value={meta[f.k].source} onChange={setM(f.k, 'source')} placeholder={L.source} aria-label={`${F[f.k]}: ${L.source}`} className="min-w-0 rounded border border-slate-200 px-1.5 py-0.5 text-xs" data-meta={`${f.k}-source`} />
              <input type="text" value={meta[f.k].date} onChange={setM(f.k, 'date')} placeholder={L.date} aria-label={`${F[f.k]}: ${L.date}`} className="min-w-0 rounded border border-slate-200 px-1.5 py-0.5 text-xs" data-meta={`${f.k}-date`} />
            </div>
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
        <Outputs x={x} r={r} lang={lang} role="es-out" />
        <p className="mt-3 text-sm font-semibold text-slate-900" data-role="es-sentence">{L.sentence(fmtInput('V', x.V, lang), r.deterred, x.n)}</p>
      </div>
      <div className="mt-4 max-w-4xl">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-slate-700">{L.summary}</p>
          <Pill primary onClick={copy} data-role="es-copy">{copied ? L.copied : L.copy}</Pill>
        </div>
        <textarea readOnly value={summary} rows={12} className="mt-1 w-full rounded border border-slate-200 p-2 font-mono text-xs leading-snug text-slate-700" data-role="es-summary" />
      </div>
    </div>
  )
}
