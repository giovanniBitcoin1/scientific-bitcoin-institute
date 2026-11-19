import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import Header from '../../components/Header.jsx'
import Footer from '../../components/Footer.jsx'
import LangToggle from '../../components/lab/LangToggle.jsx'
import useLabLang from '../../components/lab/useLabLang.js'
import { labs } from '../../data/lab/registry.js'

// The hub page (/labs): one card per lab of the registry. It is public and
// never locked: it only lists the labs. The lock stays on their content.
const COPY = {
  en: {
    eyebrow: 'Scientific Bitcoin Institute',
    title: 'Labs',
    intro:
      'Advanced, interactive courses by the Scientific Bitcoin Institute. Each lab pairs rigorous lectures with simulations you can run, measure and test against theory.',
    ready: (ready, total) => `${ready} of ${total} modules ready`,
    open: 'Open →',
  },
  it: {
    eyebrow: 'Scientific Bitcoin Institute',
    title: 'Labs',
    intro:
      'Corsi avanzati e interattivi dello Scientific Bitcoin Institute. Ogni lab unisce lezioni rigorose a simulazioni da eseguire, misurare e confrontare con la teoria.',
    ready: (ready, total) => `${ready} ${ready === 1 ? 'modulo pronto' : 'moduli pronti'} su ${total}`,
    open: 'Apri →',
  },
}

const DESCRIPTION =
  'Advanced, interactive courses by the Scientific Bitcoin Institute: rigorous lectures paired with simulations you can run, measure and test against theory.'

export default function LabsHub() {
  const [lang, setLang] = useLabLang()
  const c = COPY[lang] || COPY.en

  useEffect(() => {
    document.title = 'Labs — Scientific Bitcoin Institute'
    const meta = document.querySelector('meta[name="description"]')
    if (meta) meta.setAttribute('content', DESCRIPTION)
  }, [])

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      {/* The header is transparent until scrolled: pt-28 sits inside the dark hero. */}
      <main className="pb-24">
        <section className="bg-slate-900 text-white pt-28">
          <div className="max-w-6xl mx-auto px-6 py-16 md:py-20">
            <div className="flex flex-wrap items-start justify-between gap-6">
              <p className="text-xs uppercase tracking-[0.25em] text-bitcoin font-semibold font-mono">
                {c.eyebrow}
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
          <div className="grid gap-6 md:grid-cols-2">
            {labs.map((lab) => {
              const ready = lab.modules.filter((m) => m.status === 'ready').length
              return (
                <Link
                  key={lab.id}
                  to={lab.basePath}
                  className="group block bg-white rounded-xl border border-slate-200 shadow-sm p-6 md:p-8 hover:border-orange-300 hover:shadow-md transition"
                >
                  <p className="text-xs uppercase tracking-wider text-orange-600 font-semibold font-mono">
                    {c.ready(ready, lab.modules.length)}
                  </p>
                  <h2 className="font-serif text-3xl font-semibold text-slate-900 leading-snug mt-3">
                    {lab.name}
                  </h2>
                  <p className="text-slate-600 text-lg leading-relaxed mt-2">{lab.tagline[lang]}</p>
                  <p className="mt-6 text-sm font-semibold text-orange-600 group-hover:text-orange-700">
                    {c.open}
                  </p>
                </Link>
              )
            })}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
