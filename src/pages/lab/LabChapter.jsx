import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Header from '../../components/Header.jsx'
import Footer from '../../components/Footer.jsx'
import LangToggle from '../../components/lab/LangToggle.jsx'
import LockedZone from '../../components/lab/LockedZone.jsx'
import useLabLang from '../../components/lab/useLabLang.js'
import { getLab } from '../../data/lab/registry.js'
import AdminBar from '../../components/lab/AdminBar.jsx'
import useLabAccess from '../../components/lab/useLabAccess.js'
import { loaders } from './loaders.js'

// A module page of any lab of the registry. The page renderer (LabLecture)
// and the module's content (lecture text, sims, figures, exercises) live in
// their own chunks, requested only when the labs are unlocked
// (src/data/lab/config.json, or an admin preview).
function useUnlockedContent(lab, mod, unlocked) {
  const key = mod && unlocked ? `${lab.id}/${mod.slug}` : null
  const [loaded, setLoaded] = useState(null)

  useEffect(() => {
    if (!key) return
    let live = true
    Promise.all([import('./LabLecture.jsx'), loaders[lab.id](mod.slug)])
      .then(([page, content]) => live && setLoaded({ key, Lecture: page.default, content }))
      .catch(() => live && setLoaded({ key, Lecture: null, content: null }))
    return () => {
      live = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return loaded && loaded.key === key ? loaded : null
}

const COPY = {
  en: {
    module: 'Module',
    sim: 'Interactive simulation',
    all: '← All modules',
    next: 'Next module →',
    notFound: 'Module not available',
    notFoundText:
      "This module doesn't exist or hasn't been published yet. New modules are added regularly.",
    back: (name) => `← Back to the ${name}`,
  },
  it: {
    module: 'Modulo',
    sim: 'Simulazione interattiva',
    all: '← Tutti i moduli',
    next: 'Modulo successivo →',
    notFound: 'Modulo non disponibile',
    notFoundText:
      'Questo modulo non esiste o non è ancora stato pubblicato. Nuovi moduli vengono aggiunti regolarmente.',
    back: (name) => `← Torna al ${name}`,
  },
}

const orangeLink =
  'text-orange-600 hover:text-orange-700 hover:underline transition-colors font-semibold'

// Links on the dark title band; the header is transparent until scrolled, so
// the band starts at the very top of the page (pt-28 sits inside it).
const darkLink =
  'text-orange-400 hover:text-orange-300 hover:underline transition-colors font-semibold'

function NotFound({ lab, c, lang, setLang }) {
  return (
    <section className="bg-slate-900 text-white pt-28">
      <div className="max-w-2xl mx-auto px-6 py-12 md:py-16 text-center">
        <div className="flex justify-center mb-8">
          <LangToggle lang={lang} setLang={setLang} />
        </div>
        <p className="text-xs uppercase tracking-[0.25em] text-bitcoin font-semibold mb-4 font-mono">
          {lab.name}
        </p>
        <h1 className="font-serif text-4xl md:text-5xl font-semibold text-white leading-tight">
          {c.notFound}
        </h1>
        <p className="mt-6 text-slate-300 leading-relaxed">{c.notFoundText}</p>
        <Link to={lab.basePath} className={`inline-block mt-6 ${darkLink}`}>
          {c.back(lab.name)}
        </Link>
      </div>
    </section>
  )
}

// While locked: number, title and summary, then a blurred stand-in for the
// lecture and the sim (grey bars, no text) under the site's lock overlay.
function LockedModule({ lab, mod, lang, setLang, c }) {
  const bar = 'h-3 rounded bg-slate-200'
  return (
    <>
      <section className="bg-slate-900 text-white pt-28">
        <div className="max-w-3xl mx-auto px-6 py-12 md:py-16">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link to={lab.basePath} className={darkLink}>
              {c.all}
            </Link>
            <LangToggle lang={lang} setLang={setLang} />
          </div>
          <p className="mt-10 text-xs uppercase tracking-[0.25em] text-bitcoin font-semibold font-mono">
            {c.module} {mod.number}
          </p>
          <h1 className="font-serif text-4xl md:text-5xl font-semibold text-white leading-tight mt-3">
            {lang === 'en' ? mod.title_en : mod.title_it}
          </h1>
          <p className="mt-6 text-lg text-slate-300 leading-relaxed">
            {lang === 'en' ? mod.summary_en : mod.summary_it}
          </p>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 pt-12">
        <LockedZone lang={lang} labName={lab.name}>
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
            {[100, 92, 97, 60, 0, 95, 88, 99, 70].map((w, i) =>
              w ? <div key={i} className={bar} style={{ width: `${w}%` }} /> : <div key={i} className="h-3" />,
            )}
            <div className="mt-6 h-56 rounded-lg bg-slate-100 border border-slate-200" />
            {[94, 85, 55].map((w, i) => (
              <div key={i} className={bar} style={{ width: `${w}%` }} />
            ))}
          </div>
        </LockedZone>
      </section>

      <nav className="max-w-3xl mx-auto px-6 mt-12">
        <Link to={lab.basePath} className={orangeLink}>
          {c.back(lab.name)}
        </Link>
      </nav>
    </>
  )
}

export default function LabChapter({ labId = 'complexity' }) {
  const lab = getLab(labId)
  const { slug } = useParams()
  const [lang, setLang] = useLabLang()
  const c = COPY[lang]
  const { unlocked } = useLabAccess()

  const index = lab.modules.findIndex((m) => m.slug === slug)
  const mod = index >= 0 && lab.modules[index].status === 'ready' ? lab.modules[index] : null
  const loaded = useUnlockedContent(lab, mod, unlocked)

  useEffect(() => {
    document.title = mod
      ? `${mod.number} · ${mod.title_en} — ${lab.name} — Scientific Bitcoin Institute`
      : `${lab.name} — Scientific Bitcoin Institute`
    const meta = document.querySelector('meta[name="description"]')
    if (meta && mod) meta.setAttribute('content', mod.summary_en)
  }, [lab, mod])

  const notFound = <NotFound lab={lab} c={c} lang={lang} setLang={setLang} />

  let content
  if (!mod) content = notFound
  else if (!unlocked) content = <LockedModule lab={lab} mod={mod} lang={lang} setLang={setLang} c={c} />
  else if (!loaded) content = <div className="min-h-[60vh]" />
  else if (!loaded.Lecture || !loaded.content) content = notFound
  else
    content = (
      <loaded.Lecture
        lab={lab}
        mod={mod}
        index={index}
        content={loaded.content}
        lang={lang}
        setLang={setLang}
        c={c}
        notFound={notFound}
        darkLink={darkLink}
        adminBar={<AdminBar lang={lang} />}
      />
    )

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="pb-24">{content}</main>
      <Footer />
    </div>
  )
}
