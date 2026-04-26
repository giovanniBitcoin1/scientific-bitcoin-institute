import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import NewsletterSignup from '../components/NewsletterSignup.jsx'

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

export default function AdvancedCryptography() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <ScrollToHash />

      <main className="pt-28 pb-24">
        {/* Banner + title */}
        <section className="max-w-5xl mx-auto px-6">
          <img
            src="/assets/education/advanced-cryptography-banner.png"
            alt=""
            className="w-full h-auto rounded-lg shadow-md mb-8"
          />
        </section>
        <section className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-orange-600 font-semibold mb-4 font-mono">
            Scientific Bitcoin Institute &nbsp;·&nbsp; Education
          </p>
          <h1 className="font-serif text-5xl md:text-6xl font-semibold text-slate-900 leading-tight">
            Advanced Cryptography
          </h1>
        </section>

        <SectionDivider />

        {/* Intro */}
        <section className="max-w-3xl mx-auto px-6">
          <p className="text-slate-700 text-base leading-relaxed">
            Cryptography is the formal mathematical foundation of Bitcoin — the discipline that guarantees, with
            provable security under stated assumptions, that no participant can falsify transactions, double-spend
            coins, or alter the ledger after the fact. Beyond Bitcoin's hash functions and digital signatures,
            cryptography continues to develop new tools — zero-knowledge proofs, threshold signatures, post-quantum
            primitives — that may extend or constrain what Bitcoin and its layers can do.
          </p>
        </section>

        <SectionDivider />

        {/* Why it matters */}
        <section className="max-w-3xl mx-auto px-6">
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-slate-900 leading-tight">
            Why it matters for Bitcoin
          </h2>
          <div className="mt-5 space-y-4 text-slate-700 leading-relaxed">
            <p>
              Bitcoin's security rests on three cryptographic pillars: SHA-256 as a one-way hash function, ECDSA
              (and now Schnorr) as a digital signature scheme, and the Merkle tree structure that compresses
              transaction history into compact commitments. Each of these is a specific instance of a much broader
              cryptographic landscape. Schnorr signatures, recently activated through the Taproot upgrade, illustrate
              how protocol-level cryptographic choices can compose into new transaction patterns — multi-signature
              schemes that look indistinguishable from single-signature transactions, scriptless scripts, and adaptor
              signatures for Lightning. Looking forward, the question of post-quantum security — whether Bitcoin's
              signature scheme remains secure as quantum computing advances — will eventually require coordinated
              cryptographic upgrades to the protocol.
            </p>
          </div>
        </section>

        <SectionDivider />

        {/* Where this is going */}
        <section className="max-w-3xl mx-auto px-6">
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-slate-900 leading-tight">
            Where this is going
          </h2>
          <p className="mt-5 text-slate-700 leading-relaxed">
            The Institute is developing material on the cryptographic foundations of Bitcoin at a level appropriate
            for serious students and practitioners. Topics in development include the algebra of elliptic curves used
            by Bitcoin, the mathematical content of digital signature security proofs, the Merkle structure of block
            validation, and the cryptographic implications of proposed upgrades. This page will be expanded as the
            material is published.
          </p>
        </section>

        <SectionDivider />

        {/* Newsletter intro + signup */}
        <section className="max-w-2xl mx-auto px-6 text-center">
          <p className="text-slate-700 text-base leading-relaxed mt-12">
            Subscribe to the Institute's monthly dispatch to be notified when new educational material is published.
          </p>
        </section>

        <NewsletterSignup />
      </main>

      <Footer />
    </div>
  )
}
