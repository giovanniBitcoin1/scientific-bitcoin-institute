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

function Field({ label, value }) {
  return (
    <div className="flex flex-col sm:flex-row sm:gap-4 py-2 border-b border-slate-100 last:border-b-0">
      <div className="text-sm text-slate-500 sm:w-48 shrink-0">{label}</div>
      <div className="text-slate-700">{value}</div>
    </div>
  )
}

export default function Transparency() {
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
            Governance and Transparency
          </h1>
        </section>

        {/* Intro */}
        <section className="max-w-2xl mx-auto mt-10 px-6">
          <p className="text-slate-700 text-base leading-relaxed text-center">
            The Scientific Bitcoin Institute is committed to transparency in its governance, funding, and research
            practices. This page provides a current accounting of the Institute's structural and financial position.
            As the Institute grows, this disclosure will expand to include detailed financial reports, board
            policies, and other materials appropriate to public-facing nonprofit governance.
          </p>
        </section>

        <SectionDivider />

        {/* Legal status */}
        <section id="legal-status" className="max-w-3xl mx-auto px-6 scroll-mt-28">
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-slate-900 leading-tight">
            Legal status
          </h2>
          <div className="mt-5 space-y-4 text-slate-700 leading-relaxed">
            <p>
              The Scientific Bitcoin Institute is a 501(c)(3) tax-exempt nonprofit organization registered in the
              United States. Donations to the Institute are tax-deductible to the fullest extent permitted by law.
            </p>
          </div>

          <div className="mt-4 bg-white border border-slate-200 rounded-lg px-6 py-4">
            <Field label="Legal name" value="Scientific Bitcoin Institute" />
            <Field label="EIN" value="41-2154267" />
            <Field
              label="Mailing address"
              value="6210 University Avenue, San Diego, CA 92115, United States"
            />
            <Field label="State of incorporation" value="California" />
          </div>

          <p className="mt-4 italic text-slate-600 text-sm">
            The Institute's IRS determination letter and other formal incorporation documents are available upon
            written request.
          </p>
        </section>

        <SectionDivider />

        {/* Governance */}
        <section id="governance" className="max-w-3xl mx-auto px-6 scroll-mt-28">
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-slate-900 leading-tight">
            Governance
          </h2>
          <p className="mt-5 text-slate-700 leading-relaxed">
            The Institute is led by Director Giovanni Santostasi and Vice-Director Stephen Perrenod, Ph.D. The
            Institute's Advisory Board provides guidance on strategic direction and currently includes Shahin Khan
            (advisor on technology and high-performance computing) and Pius Sprenger, Ph.D. (advisor on mathematics
            and finance). Detailed biographies of the Institute's leadership and Advisory Board are available on the{' '}
            <Link to="/people" className={inlineLink}>People</Link> page.
          </p>
        </section>

        <SectionDivider />

        {/* Funding sources */}
        <section id="funding-sources" className="max-w-3xl mx-auto px-6 scroll-mt-28">
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-slate-900 leading-tight">
            Funding sources
          </h2>
          <div className="mt-5 space-y-4 text-slate-700 leading-relaxed">
            <p>
              The Institute is funded through corporate sponsorship, individual donations, and grants. The Institute's
              principal sponsor is Fulgur Ventures, a venture capital firm focused on Bitcoin and the Lightning
              Network. The Institute does not currently disclose specific dollar amounts of sponsorship publicly.
              Sponsors and donors do not direct the Institute's research agenda.
            </p>
            <p>
              A current list of sponsors is published on the{' '}
              <Link to="/collaborate/industry-connections" className={inlineLink}>Industry Connections</Link> page.
              The Institute is committed to publishing a complete annual financial report — in accordance with
              applicable nonprofit transparency standards — as the Institute matures.
            </p>
          </div>
        </section>

        <SectionDivider />

        {/* Research independence */}
        <section id="research-independence" className="max-w-3xl mx-auto px-6 scroll-mt-28">
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-slate-900 leading-tight">
            Research independence
          </h2>
          <p className="mt-5 text-slate-700 leading-relaxed">
            The Institute's research agenda is set independently by its leadership and Research Fellows. Sponsors and
            donors do not have authority to direct, restrict, or veto specific research projects. The Institute may
            decline funding from any source if such funding would compromise the independence or integrity of its
            research. This commitment to research independence is foundational to the credibility of the Institute's
            findings.
          </p>
        </section>

        <SectionDivider />

        {/* Open access */}
        <section id="open-access" className="max-w-3xl mx-auto px-6 scroll-mt-28">
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-slate-900 leading-tight">
            Publications and open access
          </h2>
          <p className="mt-5 text-slate-700 leading-relaxed">
            All major research publications by the Institute are released as open-access preprints with permanent
            DOIs (e.g., on Zenodo) under permissive licenses (e.g., CC-BY 4.0), making them freely available to the
            global research community. The Institute is committed to maintaining open access for its research output.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  )
}
