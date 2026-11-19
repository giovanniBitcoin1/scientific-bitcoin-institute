import { useState } from 'react'
import { unlockAdmin } from './useLabAccess.js'

const COPY = {
  en: { label: 'Admin passphrase', button: 'Unlock', wrong: 'Not recognised.' },
  it: { label: 'Passphrase admin', button: 'Sblocca', wrong: 'Non riconosciuta.' },
}

// Small passphrase form, rendered under the /lab hero only when the URL has
// ?admin. Nothing on the site links to it.
export default function AdminUnlock({ lang }) {
  const c = COPY[lang] || COPY.en
  const [value, setValue] = useState('')
  const [wrong, setWrong] = useState(false)
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    const ok = await unlockAdmin(value)
    setBusy(false)
    setWrong(!ok)
    if (ok) setValue('')
  }

  return (
    <form onSubmit={submit} className="max-w-6xl mx-auto px-6 pt-8">
      <label className="block text-xs uppercase tracking-wider text-slate-500 font-semibold font-mono" htmlFor="lab-admin">
        {c.label}
      </label>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <input
          id="lab-admin"
          type="password"
          autoComplete="off"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full max-w-xs rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
        />
        <button
          type="submit"
          disabled={busy || !value}
          className="rounded-md bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50"
        >
          {c.button}
        </button>
        {wrong && <p className="text-sm text-slate-500">{c.wrong}</p>}
      </div>
    </form>
  )
}
