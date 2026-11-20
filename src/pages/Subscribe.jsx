import { Link } from 'react-router-dom'
import ScrollToHash from '../components/ScrollToHash.jsx'
import { SignupFootnote, SignupForm } from '../components/NewsletterSignup.jsx'
import { PageShell, eyebrowClass, orangeLink } from '../components/newsroom/parts.jsx'
import { getDispatches } from '../lib/newsroom.js'
import { COPY, PAGES } from '../lib/site.js'
import { usePageSEO } from '../lib/seo.js'

export default function Subscribe() {
  usePageSEO('/subscribe')
  const hasIssues = getDispatches().length > 0

  return (
    <PageShell>
      <ScrollToHash />

      <main className="pt-28 pb-24">
        <section className="max-w-3xl mx-auto px-6 text-center">
          <p className={eyebrowClass}>{COPY.signupEyebrow}</p>
          <h1 className="font-serif text-5xl md:text-6xl font-semibold text-slate-900 leading-tight mt-4">
            {PAGES['/subscribe'].heading}
          </h1>
          <p className="text-slate-700 text-base md:text-lg leading-relaxed max-w-xl mx-auto mt-6">
            {COPY.signupBody}
          </p>
          <p className="text-slate-600 text-base leading-relaxed max-w-xl mx-auto mt-4">{COPY.subscribeLensNote}</p>
        </section>

        <section className="px-6">
          <div className="max-w-3xl mx-auto mt-10 rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 to-white p-8 md:p-12 shadow-sm text-center">
            <SignupForm />
            <SignupFootnote className="mt-4" />
          </div>
        </section>

        <section className="max-w-3xl mx-auto px-6 mt-10 text-center">
          <p className="text-slate-700">
            {hasIssues ? (
              <Link to="/insights/dispatch" className={orangeLink}>
                Read past issues in the archive →
              </Link>
            ) : (
              <Link to="/insights" className={orangeLink}>
                Insights →
              </Link>
            )}
          </p>
        </section>
      </main>
    </PageShell>
  )
}
