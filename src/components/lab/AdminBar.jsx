import labConfig from '../../data/lab/config.json'
import useLabAccess, { lockAgain } from './useLabAccess.js'

const COPY = {
  en: { text: 'Admin preview — visitors see the locked Lab', button: 'Lock again' },
  it: { text: 'Anteprima admin — i visitatori vedono il Lab bloccato', button: 'Blocca di nuovo' },
}

// Thin slate strip at the top of the dark title band, shown only in an admin
// preview of a locked Lab (see useLabAccess.js).
export default function AdminBar({ lang }) {
  const { admin } = useLabAccess()
  if (!admin || !labConfig.locked) return null
  const c = COPY[lang] || COPY.en
  return (
    <div className="bg-slate-700 text-slate-100 text-sm">
      <div className="max-w-6xl mx-auto px-6 py-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <p className="font-mono text-xs uppercase tracking-wider">{c.text}</p>
        <button
          type="button"
          onClick={lockAgain}
          className="text-xs font-semibold text-orange-300 hover:text-orange-200 hover:underline"
        >
          {c.button}
        </button>
      </div>
    </div>
  )
}
