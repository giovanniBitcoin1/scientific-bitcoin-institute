// EN/IT pill toggle, copied from the one in JournalPost.jsx so the Lab can
// evolve independently of the Journal.
export default function LangToggle({ lang, setLang }) {
  return (
    <div
      className="inline-flex rounded-full border border-slate-200 bg-white p-1 text-xs font-mono uppercase tracking-wider"
      role="group"
      aria-label="Language"
    >
      {['en', 'it'].map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLang(code)}
          aria-pressed={lang === code}
          className={
            'px-4 py-1.5 rounded-full transition-colors ' +
            (lang === code ? 'bg-orange-500 text-white' : 'text-slate-600 hover:text-orange-600')
          }
        >
          {code}
        </button>
      ))}
    </div>
  )
}
