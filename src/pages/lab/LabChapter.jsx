import { lazy, Suspense, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import Header from '../../components/Header.jsx'
import Footer from '../../components/Footer.jsx'
import LangToggle from '../../components/lab/LangToggle.jsx'
import LockedZone from '../../components/lab/LockedZone.jsx'
import useLabLang from '../../components/lab/useLabLang.js'
import modules from '../../data/lab/modules.json'
import labConfig from '../../data/lab/config.json'

// Lecture, sim and follow-up live in their own chunk, requested only when the
// Lab is unlocked (src/data/lab/config.json).
const LabLecture = lazy(() => import('./LabLecture.jsx'))

const COPY = {
  en: {
    module: 'Module',
    sim: 'Interactive simulation',
    all: '← All modules',
    next: 'Next module →',
    comingSoon: 'Coming soon',
    notFound: 'Module not available',
    notFoundText:
      "This module doesn't exist or hasn't been published yet. New modules are added regularly.",
    back: '← Back to the Complexity Lab',
  },
  it: {
    module: 'Modulo',
    sim: 'Simulazione interattiva',
    all: '← Tutti i moduli',
    next: 'Modulo successivo →',
    comingSoon: 'In arrivo',
    notFound: 'Modulo non disponibile',
    notFoundText:
      'Questo modulo non esiste o non è ancora stato pubblicato. Nuovi moduli vengono aggiunti regolarmente.',
    back: '← Torna al Complexity Lab',
  },
}

const orangeLink =
  'text-orange-600 hover:text-orange-700 hover:underline transition-colors font-semibold'

// Links on the dark title band; the header is transparent until scrolled, so
// the band starts at the very top of the page (pt-28 sits inside it).
const darkLink =
  'text-orange-400 hover:text-orange-300 hover:underline transition-colors font-semibold'

function NotFound({ c, lang, setLang }) {
  return (
    <section className="bg-slate-900 text-white pt-28">
      <div className="max-w-2xl mx-auto px-6 py-12 md:py-16 text-center">
        <div className="flex justify-center mb-8">
          <LangToggle lang={lang} setLang={setLang} />
        </div>
        <p className="text-xs uppercase tracking-[0.25em] text-bitcoin font-semibold mb-4 font-mono">
          Complexity Lab
        </p>
        <h1 className="font-serif text-4xl md:text-5xl font-semibold text-white leading-tight">
          {c.notFound}
        </h1>
        <p className="mt-6 text-slate-300 leading-relaxed">{c.notFoundText}</p>
        <Link to="/lab" className={`inline-block mt-6 ${darkLink}`}>
          {c.back}
        </Link>
      </div>
    </section>
  )
}

// While locked: number, title and summary, then a blurred stand-in for the
// lecture and the sim (grey bars, no text) under the site's lock overlay.
function LockedModule({ mod, lang, setLang, c }) {
  const bar = 'h-3 rounded bg-slate-200'
  return (
    <>
      <section className="bg-slate-900 text-white pt-28">
        <div className="max-w-3xl mx-auto px-6 py-12 md:py-16">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link to="/lab" className={darkLink}>
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
        <LockedZone lang={lang}>
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
        <Link to="/lab" className={orangeLink}>
          {c.back}
        </Link>
      </nav>
    </>
  )
}

export default function LabChapter() {
  const { slug } = useParams()
  const [lang, setLang] = useLabLang()
  const c = COPY[lang]

  const index = modules.findIndex((m) => m.slug === slug)
  const mod = index >= 0 && modules[index].status === 'ready' ? modules[index] : null

  useEffect(() => {
    document.title = mod
      ? `${mod.number} · ${mod.title_en} — Complexity Lab — Scientific Bitcoin Institute`
      : 'Complexity Lab — Scientific Bitcoin Institute'
    const meta = document.querySelector('meta[name="description"]')
    if (meta && mod) meta.setAttribute('content', mod.summary_en)
  }, [mod])

  const notFound = <NotFound c={c} lang={lang} setLang={setLang} />

  let content
  if (!mod) content = notFound
  else if (labConfig.locked) content = <LockedModule mod={mod} lang={lang} setLang={setLang} c={c} />
  else
    content = (
      <Suspense fallback={<div className="min-h-[60vh]" />}>
        <LabLecture mod={mod} index={index} lang={lang} setLang={setLang} c={c} notFound={notFound} darkLink={darkLink} />
      </Suspense>
    )

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="pb-24">{content}</main>
      <Footer />
    </div>
  )
}
