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

export default function GameTheory() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <ScrollToHash />

      <main className="pt-28 pb-24">
        {/* Banner + title */}
        <section className="max-w-5xl mx-auto px-6">
          <img
            src="/assets/education/game-theory-banner.png"
            alt=""
            className="w-full h-auto rounded-lg shadow-md mb-8"
          />
        </section>
        <section className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-orange-600 font-semibold mb-4 font-mono">
            Scientific Bitcoin Institute &nbsp;·&nbsp; Education
          </p>
          <h1 className="font-serif text-5xl md:text-6xl font-semibold text-slate-900 leading-tight">
            Game Theory
          </h1>
        </section>

        <SectionDivider />

        {/* Intro */}
        <section className="max-w-3xl mx-auto px-6">
          <p className="text-slate-700 text-base leading-relaxed">
            Game theory is the formal study of strategic decision-making — how rational actors should behave when
            their outcomes depend on the choices of others. Bitcoin is, from this perspective, a game played
            continuously by miners, users, exchanges, governments, and competing protocols, with payoffs in monetary
            value, hash rate, and protocol influence.
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
              Nakamoto's design solves a famous game-theoretic problem: how to coordinate honesty in a permissionless
              network where any participant can attempt to cheat. The proof-of-work mechanism does this by making it
              economically costly to attack and economically rewarding to follow protocol rules. The 51% attack
              threshold, the role of difficulty adjustment, the dynamics of fee markets, the equilibrium hashrate as
              a function of price, the strategic decisions facing miners around block withholding and selfish mining
              — all of these are problems in game theory, with formal solutions and testable predictions. Bitcoin's
              continued security depends on the equilibrium remaining stable; this is not a sociological assumption
              but a mathematical one.
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
            The Institute is developing material on the game-theoretic structure of Bitcoin, including the formal
            model of consensus, the economics of mining as an industry-scale strategic problem, the dynamics of fee
            markets, and the open problems in mining equilibrium that the Institute treats as part of its active
            research program. Both introductory and rigorous-mathematical treatments are planned.
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
