import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'

function SectionDivider() {
  return (
    <div className="my-20 flex justify-center" aria-hidden="true">
      <div className="h-px w-24 bg-orange-500/60" />
    </div>
  )
}

function ScrollToHash() {
  const { hash } = useLocation()
  useEffect(() => {
    if (!hash) return
    const id = hash.replace('#', '')
    const el = document.getElementById(id)
    if (el) {
      requestAnimationFrame(() => {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    }
  }, [hash])
  return null
}

const inlineLink =
  'text-orange-600 hover:text-orange-700 hover:underline transition-colors font-semibold'

const faqs = [
  {
    id: 'what-is-sbi',
    question: 'What is the Scientific Bitcoin Institute?',
    answer: (
      <>
        The Scientific Bitcoin Institute is an independent 501(c)(3) nonprofit organization dedicated to the rigorous
        scientific study of Bitcoin as a complex adaptive system. The Institute conducts original research, supports
        sponsored academic research at partner institutions, and publishes educational material on the mathematical
        and physical foundations of Bitcoin.
      </>
    ),
  },
  {
    id: 'university-affiliation',
    question: 'Is the Institute affiliated with a university?',
    answer: (
      <>
        The Institute is independent of any university but maintains formal sponsored research engagements with
        academic partners. Current and forthcoming engagements include Politecnico di Torino (Department of
        Mathematical Sciences) and other international academic institutions. See{' '}
        <Link to="/research/sponsored-research" className={inlineLink}>Sponsored Research</Link> for details.
      </>
    ),
  },
  {
    id: 'funding',
    question: 'How is the Institute funded?',
    answer: (
      <>
        The Institute is funded through the support of corporate sponsors, individual donors, and grant programs in
        development. The Institute's principal sponsor is Fulgur Ventures, a venture capital firm focused on Bitcoin
        and the Lightning Network. Sponsors do not direct the Institute's research agenda; their support enables the
        broader mission. See{' '}
        <Link to="/collaborate/industry-connections" className={inlineLink}>Industry Connections</Link> for more.
      </>
    ),
  },
  {
    id: 'peer-review',
    question: "Is the Institute's research peer-reviewed?",
    answer: (
      <>
        The Institute publishes preprints with permanent DOIs through services such as Zenodo, intended for citation
        and review by the broader scientific community. The Institute's research is open to and welcomes formal peer
        review at academic journals; specific journal submissions are pursued as appropriate for each paper. The
        Institute's flagship preprint, <em>A Mechanistic Derivation of the Bitcoin Price Power Law</em>, is openly
        available for review and discussion.
      </>
    ),
  },
  {
    id: 'power-law',
    question: 'What is the Power Law Theory?',
    answer: (
      <>
        The Power Law Theory describes Bitcoin's long-run price trajectory as a power law in time — a scaling
        relationship that has held across more than fifteen years of data with remarkable consistency. The Institute's
        research has further demonstrated that this exponent is not arbitrary but the deterministic mathematical
        consequence of two independently measured network scaling laws. For an introduction, see the{' '}
        <Link to="/education/bitcoin-fundamentals" className={inlineLink}>Bitcoin Fundamentals</Link> page; for the
        formal treatment, see the{' '}
        <Link to="/research/publications#preprint" className={inlineLink}>preprint</Link> and{' '}
        <Link to="/research/publications#physics-of-bitcoin" className={inlineLink}>The Physics of Bitcoin</Link>{' '}
        book.
      </>
    ),
  },
  {
    id: 'support',
    question: 'How can I support the Institute?',
    answer: (
      <>
        The Institute welcomes financial support from organizations and individuals. Sponsorship inquiries from
        companies and institutions can be directed to the{' '}
        <Link to="/collaborate/industry-connections" className={inlineLink}>Industry Connections</Link> page. Bitcoin
        and fiat donations from individuals will be coordinated through dedicated infrastructure currently in
        development; in the meantime, please{' '}
        <Link to="/about/contact" className={inlineLink}>contact the Institute directly</Link>.
      </>
    ),
  },
  {
    id: 'collaborate',
    question: 'How can I collaborate with the Institute?',
    answer: (
      <>
        The Institute welcomes collaboration through several pathways: sponsored research engagements, research
        partnerships with academic institutions, postdoctoral fellowships, visiting scholar arrangements, and Research
        Fellow affiliations. See the <Link to="/collaborate" className={inlineLink}>Collaborate</Link> section for the
        full set of pathways and the{' '}
        <Link to="/research/open-problems" className={inlineLink}>Open Problems</Link> page for specific research
        questions where collaboration is currently sought.
      </>
    ),
  },
  {
    id: 'follow',
    question: "Where can I follow the Institute's work?",
    answer: (
      <>
        The Institute publishes a monthly newsletter — <em>Dispatches from the Scientific Bitcoin Institute</em> —
        covering new research, publications, and developments. The Institute also maintains a{' '}
        <a
          href="https://www.youtube.com/@Scientific_Bitcoin_Institute"
          target="_blank"
          rel="noopener noreferrer"
          className={inlineLink}
        >
          YouTube channel
        </a>{' '}
        for the weekly <em>Physics of Bitcoin</em> show and an{' '}
        <a
          href="https://x.com/ScientificBTC"
          target="_blank"
          rel="noopener noreferrer"
          className={inlineLink}
        >
          X account
        </a>{' '}
        for institutional announcements.
      </>
    ),
  },
]

export default function FAQs() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <ScrollToHash />

      <main className="pt-28 pb-24">
        {/* Page title */}
        <section className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-orange-600 font-semibold mb-4 font-mono">
            Scientific Bitcoin Institute &nbsp;·&nbsp; About
          </p>
          <h1 className="font-serif text-5xl md:text-6xl font-semibold text-slate-900 leading-tight">
            Frequently Asked Questions
          </h1>
        </section>

        {/* Intro */}
        <section className="max-w-2xl mx-auto mt-10 px-6">
          <p className="text-slate-700 text-base leading-relaxed text-center">
            Common questions about the Institute, its research, and how to engage with its work.
          </p>
        </section>

        <SectionDivider />

        {/* Q&A list */}
        <section className="max-w-3xl mx-auto px-6">
          <div className="space-y-10">
            {faqs.map((faq) => (
              <article key={faq.id} id={faq.id} className="scroll-mt-28">
                <h2 className="font-serif text-xl font-semibold text-slate-900 leading-tight">
                  {faq.question}
                </h2>
                <p className="text-slate-700 text-base mt-3 leading-relaxed">{faq.answer}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
