import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import Header from '../../components/Header.jsx'
import Footer from '../../components/Footer.jsx'
import LangToggle from '../../components/lab/LangToggle.jsx'
import useLabLang from '../../components/lab/useLabLang.js'
import LockedZone from '../../components/lab/LockedZone.jsx'
import modules from '../../data/lab/modules.json'
import labConfig from '../../data/lab/config.json'

const COPY = {
  en: {
    title: 'An independent course on complex systems',
    intro:
      'Flocks, traffic jams, markets and monetary networks all organise themselves without a central plan. The Complexity Lab is a course by the Scientific Bitcoin Institute on how that happens: short lectures, each paired with a simulation you can steer with sliders. You learn by changing a parameter and watching what the system does.',
    modules: 'Modules',
    module: 'Module',
    comingSoon: 'Coming soon',
    open: 'Open module →',
  },
  it: {
    title: 'Un corso indipendente sui sistemi complessi',
    intro:
      "Stormi, ingorghi, mercati e reti monetarie si organizzano da soli, senza un piano centrale. Il Complexity Lab è un corso dello Scientific Bitcoin Institute su come questo accade: lezioni brevi, ciascuna accompagnata da una simulazione da guidare con i cursori. Si impara cambiando un parametro e osservando che cosa fa il sistema.",
    modules: 'Moduli',
    module: 'Modulo',
    comingSoon: 'In arrivo',
    open: 'Apri il modulo →',
  },
}

export default function LabIndex() {
  const [lang, setLang] = useLabLang()
  const c = COPY[lang]

  useEffect(() => {
    document.title = 'Complexity Lab — Scientific Bitcoin Institute'
    const meta = document.querySelector('meta[name="description"]')
    if (meta) {
      meta.setAttribute(
        'content',
        'An independent course on complex systems by the Scientific Bitcoin Institute: short lectures and interactive simulations.',
      )
    }
  }, [])

  // Locked, the cards sit blurred under the lock overlay and are not links.
  const grid = (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {modules.map((m) => {
        const ready = m.status === 'ready'
        const open = ready && !labConfig.locked
        const body = (
          <>
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs uppercase tracking-wider text-orange-600 font-semibold font-mono">
                {c.module} {m.number}
              </p>
              {!ready && (
                <span className="text-[11px] uppercase tracking-wider font-mono text-slate-500 border border-slate-200 rounded-full px-2.5 py-0.5">
                  {c.comingSoon}
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
            to={`/lab/${m.slug}`}
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

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="pt-28 pb-24">
        <section className="bg-slate-900 text-white">
          <div className="max-w-6xl mx-auto px-6 py-16 md:py-20">
            <div className="flex flex-wrap items-start justify-between gap-6">
              <p className="text-xs uppercase tracking-[0.25em] text-orange-400 font-semibold font-mono">
                Complexity Lab
              </p>
              <LangToggle lang={lang} setLang={setLang} />
            </div>
            <h1 className="font-serif text-4xl md:text-6xl font-semibold leading-tight mt-5 max-w-3xl">
              {c.title}
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed mt-6 max-w-2xl">{c.intro}</p>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 pt-16">
          <p className="text-xs uppercase tracking-wider text-orange-600 font-semibold font-mono">
            {c.modules}
          </p>
          <div className="mt-6">{labConfig.locked ? <LockedZone lang={lang}>{grid}</LockedZone> : grid}</div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
