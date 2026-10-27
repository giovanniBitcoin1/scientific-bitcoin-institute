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
    title: 'An advanced course on complex systems',
    intro:
      'Why do starlings turn as one, traffic jam with no accident, and wealth concentrate in a few hands? The Complexity Lab is an advanced course by the Scientific Bitcoin Institute on the science of systems whose collective behaviour cannot be read off their parts. In thirteen modules it moves from nonlinear dynamics and chaos to random, small-world and scale-free networks; from cellular automata, fractals and percolation to self-organized criticality; and from agent-based models, collective motion and game theory to the physics of inequality — ending with Bitcoin as a complex adaptive system. Each module pairs a rigorous lecture, grounded in the primary scientific literature, with interactive simulations you can run, measure and test against theory.',
    audience: 'Designed for readers comfortable with some mathematics: logarithms, probability and simple equations.',
    modules: 'Modules',
    module: 'Module',
    comingSoon: 'Coming soon',
    open: 'Open module →',
  },
  it: {
    title: 'Un corso avanzato sui sistemi complessi',
    intro:
      "Perché uno stormo di storni vira all'unisono, un ingorgo si forma senza incidenti e la ricchezza si concentra in poche mani? Il Complexity Lab è un corso avanzato dello Scientific Bitcoin Institute sulla scienza dei sistemi il cui comportamento collettivo non si deduce dalle singole parti. In tredici moduli passa dalla dinamica non lineare e dal caos alle reti casuali, small-world e a invarianza di scala; dagli automi cellulari, dai frattali e dalla percolazione alla criticità auto-organizzata; dai modelli ad agenti, dal moto collettivo e dalla teoria dei giochi alla fisica della disuguaglianza, fino a Bitcoin come sistema complesso adattivo. Ogni modulo unisce una lezione rigorosa, fondata sulla letteratura scientifica originale, a simulazioni interattive da eseguire, misurare e confrontare con la teoria.",
    audience: "Pensato per chi ha familiarità con un po' di matematica: logaritmi, probabilità ed equazioni semplici.",
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
        'An advanced course on complex systems by the Scientific Bitcoin Institute: 13 modules with rigorous lectures and interactive simulations, from chaos and networks to criticality, game theory and Bitcoin.',
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

      {/* The header is transparent until scrolled: pt-28 sits inside the dark hero. */}
      <main className="pb-24">
        <section className="bg-slate-900 text-white pt-28">
          <div className="max-w-6xl mx-auto px-6 py-16 md:py-20">
            <div className="flex flex-wrap items-start justify-between gap-6">
              <p className="text-xs uppercase tracking-[0.25em] text-bitcoin font-semibold font-mono">
                Complexity Lab
              </p>
              <LangToggle lang={lang} setLang={setLang} />
            </div>
            <h1 className="font-serif text-4xl md:text-6xl font-semibold leading-tight mt-5 max-w-3xl">
              {c.title}
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed mt-6 max-w-2xl">{c.intro}</p>
            <p className="text-slate-400 text-base leading-relaxed mt-4 max-w-2xl">{c.audience}</p>
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
