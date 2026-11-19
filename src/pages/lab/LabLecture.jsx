import { Link } from 'react-router-dom'
import LangToggle from '../../components/lab/LangToggle.jsx'
import LabMarkdown from '../../components/lab/LabMarkdown.jsx'
import Exercises from '../../components/lab/Exercises.jsx'

// The unlocked body of a module page, for any lab: lecture (with its live
// figures), simulation, exercises, follow-up and module navigation.
// LabChapter loads this file and the module's content with dynamic imports
// only when the labs are unlocked, so while they are locked neither the
// lecture text nor the sims are fetched.
//
// `content` is the object described in loaders.js. The lecture markdown is
// split at a line holding only <!-- simulation --> into the lecture (before)
// and the follow-up (after). A module gives either one `Sim` or a list of
// `panels`, each shown with its own "What to observe".

function getLecture(raw) {
  if (raw == null) return null
  const [before, ...rest] = raw.split(/^[ \t]*<!--\s*simulation\s*-->[ \t]*$/m)
  // Remaining HTML comments (e.g. the DRAFT marker) are editorial notes, not content.
  const clean = (s) => s.replace(/<!--[\s\S]*?-->/g, '').trim()
  return { part1: clean(before), part2: clean(rest.join('\n')) }
}

const COPY = {
  en: { simulation: 'Simulation', observe: 'What to observe', exercises: 'Exercises' },
  it: { simulation: 'Simulazione', observe: 'Che cosa osservare', exercises: 'Esercizi' },
}

const orangeLink =
  'text-orange-600 hover:text-orange-700 hover:underline transition-colors font-semibold'

const LETTERS = 'ABCDEFGH'

export default function LabLecture({ lab, mod, index, content, lang, setLang, c, notFound, darkLink, adminBar }) {
  const lecture = getLecture(content.lectures[lang]) || getLecture(content.lectures.en)
  if (!lecture) return notFound

  const t = COPY[lang] || COPY.en
  const { Sim, panels, figures, exercises } = content
  const next = lab.modules[index + 1]
  const title = lang === 'en' ? mod.title_en : mod.title_it

  return (
    <>
      {/* Title band */}
      <section className="bg-slate-900 text-white pt-28">
        {adminBar}
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
            {title}
          </h1>
          <p className="mt-6 text-lg text-slate-300 leading-relaxed">
            {lang === 'en' ? mod.summary_en : mod.summary_it}
          </p>
        </div>
      </section>

      {/* Lecture */}
      <section className="bg-white border-b border-slate-200">
        <article className="max-w-3xl mx-auto px-6 py-12 md:py-16">
          <LabMarkdown figures={figures} lang={lang}>
            {lecture.part1}
          </LabMarkdown>
        </article>
      </section>

      {/* Simulation */}
      {Sim && (
        <section className="bg-slate-50 py-12 md:py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <p className="text-xs uppercase tracking-wider text-orange-600 font-semibold font-mono">
              {c.sim}
            </p>
            <div className="mt-4 bg-white rounded-xl border border-slate-200 shadow-sm p-3 sm:p-6">
              <Sim lang={lang} />
            </div>
          </div>
        </section>
      )}

      {/* Simulation panels, each followed by what to observe in it */}
      {panels && panels.length > 0 && (
        <section className="bg-slate-50 py-12 md:py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-14">
            {panels.map((panel, i) => (
              <div key={panel.id}>
                <p className="text-xs uppercase tracking-wider text-orange-600 font-semibold font-mono">
                  {t.simulation} {LETTERS[i]}
                </p>
                <h2 className="font-serif text-2xl md:text-3xl font-semibold text-slate-900 mt-2">
                  {panel.title[lang] || panel.title.en}
                </h2>
                <div className="mt-4 bg-white rounded-xl border border-slate-200 shadow-sm p-3 sm:p-6">
                  <panel.Component lang={lang} />
                </div>
                {panel.observe && (
                  <div className="max-w-3xl mt-6 px-2 sm:px-0">
                    <h3 className="font-serif text-xl font-semibold text-slate-900">{t.observe}</h3>
                    <LabMarkdown lang={lang}>{panel.observe[lang] || panel.observe.en}</LabMarkdown>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Exercises */}
      {exercises && exercises.length > 0 && (
        <section className="bg-slate-50 border-t border-slate-200 py-12 md:py-16">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="font-serif text-2xl md:text-3xl font-semibold text-slate-900 mb-6">
              {t.exercises}
            </h2>
            <Exercises items={exercises} lang={lang} />
          </div>
        </section>
      )}

      {/* Follow-up: what to observe, further reading */}
      {lecture.part2 && (
        <section className="bg-white border-y border-slate-200">
          <article className="max-w-3xl mx-auto px-6 py-12 md:py-16">
            <LabMarkdown figures={figures} lang={lang}>
              {lecture.part2}
            </LabMarkdown>
          </article>
        </section>
      )}

      {/* Module navigation */}
      <nav className="max-w-3xl mx-auto px-6 mt-12 flex flex-wrap items-center justify-between gap-4">
        <Link to={lab.basePath} className={orangeLink}>
          {c.all}
        </Link>
        {next &&
          (next.status === 'ready' ? (
            <Link to={`${lab.basePath}/${next.slug}`} className={orangeLink}>
              {c.next}
            </Link>
          ) : (
            <span className="text-slate-400 font-semibold" aria-disabled="true">
              {c.next}{' '}
              <span className="ml-1 text-[11px] uppercase tracking-wider font-mono">
                {lab.pending[lang]}
              </span>
            </span>
          ))}
      </nav>
    </>
  )
}
