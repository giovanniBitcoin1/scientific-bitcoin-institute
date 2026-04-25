import { useEffect, useState } from 'react'
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

function ObfuscatedEmail({ user, domain, className = 'text-lg font-serif font-semibold text-orange-700 hover:underline' }) {
  const [email, setEmail] = useState(null)
  useEffect(() => {
    setEmail(`${user}@${domain}`)
  }, [user, domain])

  if (!email) {
    return (
      <span aria-hidden="true" className={className}>
        &nbsp;
      </span>
    )
  }
  return (
    <a href={`mailto:${email}`} className={className}>
      {email}
    </a>
  )
}

const externalLink =
  'text-orange-600 hover:text-orange-700 hover:underline transition-colors'

export default function Contact() {
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
            Contact
          </h1>
        </section>

        {/* Intro */}
        <section className="max-w-2xl mx-auto mt-10 px-6">
          <p className="text-slate-700 text-base leading-relaxed">
            The Scientific Bitcoin Institute welcomes inquiries from researchers, donors, journalists, and potential
            collaborators. The Institute does not maintain a public phone line. We respond to written inquiries within
            several business days.
          </p>
        </section>

        <SectionDivider />

        {/* By Email */}
        <section id="email" className="px-6 scroll-mt-28">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-slate-900 leading-tight">
              By Email
            </h2>
          </div>

          <div className="max-w-2xl mx-auto mt-8 bg-white border border-slate-200 rounded-lg p-8 text-center">
            <p className="text-xs uppercase tracking-wider text-orange-600 font-semibold font-mono">
              General Inquiries
            </p>
            <div className="mt-3">
              <ObfuscatedEmail user="info" domain="scientificbitcoininstitute.org" />
            </div>
            <p className="text-slate-600 text-sm mt-4">
              We aim to respond within several business days.
            </p>
          </div>
        </section>

        <SectionDivider />

        {/* Leadership */}
        <section id="leadership" className="px-6 scroll-mt-28">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-slate-900 leading-tight">
              Leadership
            </h2>
            <p className="text-slate-700 mt-5 leading-relaxed">
              Inquiries directly addressed to the Institute's leadership may be sent via email. Direct messages to
              specific individuals are typically forwarded to the appropriate team member.
            </p>
          </div>

          <div className="max-w-3xl mx-auto mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-lg p-6 flex flex-col gap-2">
              <p className="text-xs uppercase tracking-wider text-orange-600 font-semibold font-mono">
                Director
              </p>
              <p className="font-serif text-xl text-slate-900">Giovanni Santostasi</p>
              <div className="mt-1">
                <ObfuscatedEmail
                  user="gsantostasi"
                  domain="scientificbitcoininstitute.org"
                  className="text-orange-700 hover:underline break-all"
                />
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-lg p-6 flex flex-col gap-2">
              <p className="text-xs uppercase tracking-wider text-orange-600 font-semibold font-mono">
                Vice-Director
              </p>
              <p className="font-serif text-xl text-slate-900">Stephen Perrenod, Ph.D.</p>
              <div className="mt-1">
                <ObfuscatedEmail
                  user="perrenod"
                  domain="scientificbitcoininstitute.org"
                  className="text-orange-700 hover:underline break-all"
                />
              </div>
            </div>
          </div>
        </section>

        <SectionDivider />

        {/* Mailing Address */}
        <section id="mailing-address" className="px-6 scroll-mt-28">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-slate-900 leading-tight">
              Mailing Address
            </h2>
          </div>

          <div className="max-w-2xl mx-auto mt-8 bg-white border border-slate-200 rounded-lg p-8 text-center">
            <address className="not-italic text-slate-700 leading-relaxed">
              <div>Scientific Bitcoin Institute</div>
              <div>6210 University Avenue</div>
              <div>San Diego, CA 92115</div>
              <div>United States</div>
            </address>
            <p className="mt-6 italic text-slate-500 text-sm">
              Tax-exempt 501(c)(3) nonprofit organization
            </p>
            <p className="text-slate-700 text-sm mt-1">EIN: 41-2154267</p>
          </div>
        </section>

        <SectionDivider />

        {/* Elsewhere */}
        <section id="elsewhere" className="px-6 scroll-mt-28">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-slate-900 leading-tight">
              Elsewhere on the Web
            </h2>
            <p className="text-slate-700 mt-5 leading-relaxed">
              The Institute's research, publications, and ongoing dispatches are also available through the following
              channels:
            </p>
          </div>

          <ul className="max-w-2xl mx-auto mt-6 space-y-3">
            <li className="flex items-start gap-3">
              <span className="text-orange-500 mt-1" aria-hidden="true">→</span>
              <a
                href="https://x.com/ScientificBTC"
                target="_blank"
                rel="noopener noreferrer"
                className={externalLink}
              >
                X (formerly Twitter)
              </a>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-orange-500 mt-1" aria-hidden="true">→</span>
              <a
                href="https://www.youtube.com/@Scientific_Bitcoin_Institute"
                target="_blank"
                rel="noopener noreferrer"
                className={externalLink}
              >
                YouTube — Scientific Bitcoin Institute
              </a>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-orange-500 mt-1" aria-hidden="true">→</span>
              <Link to="/news/newsletter" className={externalLink}>
                Newsletter — Dispatches from the Institute
              </Link>
            </li>
          </ul>
        </section>

        <SectionDivider />

        {/* Closing */}
        <section className="max-w-2xl mx-auto px-6 text-center mt-16">
          <p className="italic text-slate-500 leading-relaxed">
            We do not currently maintain a public phone line. The Institute is opening a research office in Turin,
            Italy, with details to be announced.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  )
}
