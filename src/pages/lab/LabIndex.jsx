import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Header from '../../components/Header.jsx'
import Footer from '../../components/Footer.jsx'
import LangToggle from '../../components/lab/LangToggle.jsx'
import useLabLang from '../../components/lab/useLabLang.js'
import LockedZone from '../../components/lab/LockedZone.jsx'
import { getLab } from '../../data/lab/registry.js'
import { LABS_HUB } from '../../data/lab/paths.js'
import AdminBar from '../../components/lab/AdminBar.jsx'
import AdminUnlock from '../../components/lab/AdminUnlock.jsx'
import useLabAccess from '../../components/lab/useLabAccess.js'

const COPY = {
  en: { modules: 'Modules', module: 'Module', part: 'Part', open: 'Open module →', allLabs: '← All labs' },
  it: { modules: 'Moduli', module: 'Modulo', part: 'Parte', open: 'Apri il modulo →', allLabs: '← Tutti i lab' },
}

// Index of one lab of the registry (src/data/lab/registry.js): hero, then the
// module grid, grouped under part headings when the lab has parts.
export default function LabIndex({ labId = 'complexity' }) {
  const lab = getLab(labId)
  const [lang, setLang] = useLabLang()
  const c = COPY[lang]
  const { admin, unlocked } = useLabAccess()
  // ?admin shows the passphrase form; nothing links to it.
  const showAdminForm = new URLSearchParams(useLocation().search).has('admin') && !admin

  useEffect(() => {
    document.title = `${lab.name} — Scientific Bitcoin Institute`
    const meta = document.querySelector('meta[name="description"]')
    if (meta) meta.setAttribute('content', lab.description)
  }, [lab])

  const [lead, ...notes] = lab.intro[lang]

  // Locked, the cards sit blurred under the lock overlay and are not links.
  const grid = (modules) => (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {modules.map((m) => {
        const ready = m.status === 'ready'
        const open = ready && unlocked
        const body = (
          <>
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs uppercase tracking-wider text-orange-600 font-semibold font-mono">
                {c.module} {m.number}
              </p>
              {!ready && (
                <span className="text-[11px] uppercase tracking-wider font-mono text-slate-500 border border-slate-200 rounded-full px-2.5 py-0.5">
                  {lab.pending[lang]}
                </span>
              )}
            </div>
            <h2 className="font-serif text-2xl font-semibold text-slate-900 leading-snug mt-3">
              {lang === 'en' ? m.title_en : m.title_it}
            </h2>
            <p className="text-slate-600 leading-relaxed mt-3">
              {lang === 'en' ? m.summary_en : m.summary_it}
            </p>
            {open && (
              <p className="mt-5 text-sm font-semibold text-orange-600 group-hover:text-orange-700">
                {c.open}
              </p>
            )}
          </>
        )
        return open ? (
          <Link
            key={m.slug}
            to={`${lab.basePath}/${m.slug}`}
            className="group block bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:border-orange-300 hover:shadow-md transition"
          >
            {body}
          </Link>
        ) : (
          <div
            key={m.slug}
            className={`bg-white rounded-xl border border-slate-200 shadow-sm p-6${ready ? '' : ' opacity-60'}`}
          >
            {body}
          </div>
        )
      })}
    </div>
  )

  const listing = lab.parts ? (
    <div className="space-y-12">
      {lab.parts.map((part) => (
        <div key={part.id}>
          <h2 className="font-serif text-2xl md:text-3xl font-semibold text-slate-900">
            <span className="text-slate-400">
              {c.part} {part.id}
            </span>{' '}
            · {part.title[lang]}
          </h2>
          <div className="mt-5">{grid(lab.modules.filter((m) => m.part === part.id))}</div>
        </div>
      ))}
    </div>
  ) : (
    grid(lab.modules)
  )

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      {/* The header is transparent until scrolled: pt-28 sits inside the dark hero. */}
      <main className="pb-24">
        <section className="bg-slate-900 text-white pt-28">
          <AdminBar lang={lang} />
          <div className="max-w-6xl mx-auto px-6 py-16 md:py-20">
            <Link
              to={LABS_HUB}
              className="inline-block mb-6 text-sm font-semibold text-orange-400 hover:text-orange-300 hover:underline transition-colors"
            >
              {c.allLabs}
            </Link>
            <div className="flex flex-wrap items-start justify-between gap-6">
              <p className="text-xs uppercase tracking-[0.25em] text-bitcoin font-semibold font-mono">
                {lab.eyebrow[lang]}
              </p>
              <LangToggle lang={lang} setLang={setLang} />
            </div>
            <h1 className="font-serif text-4xl md:text-6xl font-semibold leading-tight mt-5 max-w-3xl">
              {lab.title[lang]}
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed mt-6 max-w-2xl">{lead}</p>
            {notes.map((text) => (
              <p key={text} className="text-slate-400 text-base leading-relaxed mt-4 max-w-2xl">
                {text}
              </p>
            ))}
          </div>
        </section>

        {showAdminForm && <AdminUnlock lang={lang} />}

        <section className="max-w-6xl mx-auto px-6 pt-16">
          <p className="text-xs uppercase tracking-wider text-orange-600 font-semibold font-mono">
            {c.modules}
          </p>
          <div className="mt-6">
            {!unlocked ? (
              <LockedZone lang={lang} labName={lab.name}>
                {listing}
              </LockedZone>
            ) : (
              listing
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
