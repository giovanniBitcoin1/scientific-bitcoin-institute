import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
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

function PrimaryButton({ href, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center bg-orange-600 text-white rounded px-5 py-2.5 font-semibold text-sm hover:bg-orange-700 transition-colors"
    >
      {children}
    </a>
  )
}

function SecondaryButton({ href, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center border border-slate-300 text-slate-700 rounded px-5 py-2.5 font-semibold text-sm hover:border-slate-500 transition-colors"
    >
      {children}
    </a>
  )
}

export default function Publications() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <ScrollToHash />

      <main className="pt-28 pb-24">
        {/* Page title */}
        <section className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-orange-600 font-semibold mb-4 font-mono">
            Scientific Bitcoin Institute &nbsp;·&nbsp; Research
          </p>
          <h1 className="font-serif text-5xl md:text-6xl font-semibold text-slate-900 leading-tight">
            Publications
          </h1>
          <p className="mt-8 text-slate-600 text-lg leading-relaxed max-w-2xl mx-auto">
            The Scientific Bitcoin Institute publishes original research developing the mathematical and physical
            foundations of Bitcoin. Our publications include a formal preprint establishing the mechanistic derivation
            of Bitcoin's price power law and a full-length book situating the Power Law Theory within the broader
            framework of complex systems science and statistical physics. Additional working papers and technical
            reports are in preparation.
          </p>
        </section>

        {/* Preprint */}
        <section
          id="preprint"
          className="max-w-6xl mx-auto px-6 my-20 scroll-mt-28"
        >
          <div className="grid grid-cols-1 md:grid-cols-[minmax(240px,320px)_1fr] gap-10 md:gap-14 items-start">
            <div>
              <a
                href="https://doi.org/10.5281/zenodo.19387099"
                target="_blank"
                rel="noopener noreferrer"
                className="block group"
              >
                <img
                  src="/assets/publications/preprint-mechanistic-derivation.png"
                  alt="First page of the Mechanistic Derivation preprint showing title and abstract"
                  className="rounded-lg shadow-lg w-full h-auto object-contain transition-transform duration-300 group-hover:scale-[1.02] group-hover:shadow-xl"
                />
              </a>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-orange-600 font-semibold font-mono">
                Preprint &nbsp;·&nbsp; Scientific Bitcoin Institute &nbsp;·&nbsp; 2026
              </p>
              <h2 className="font-serif text-3xl md:text-4xl font-semibold text-slate-900 leading-tight mt-3">
                A Mechanistic Derivation of the Bitcoin Price Power Law: Network Adoption Dynamics and Generalised
                Metcalfe Scaling
              </h2>
              <p className="text-slate-600 mt-3">Giovanni Santostasi, Stephen Perrenod</p>
              <p className="text-slate-500 text-sm mt-1">
                DOI:{' '}
                <a
                  href="https://doi.org/10.5281/zenodo.19387099"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-600 hover:text-orange-700 hover:underline transition-colors"
                >
                  10.5281/zenodo.19387099
                </a>
              </p>

              <div className="text-slate-700 text-base mt-6 space-y-4 leading-relaxed">
                <p>
                  The Institute's flagship research publication establishes that Bitcoin's price trajectory follows a
                  power law in time with exponent β = 5.69 ± 0.05, measured across 5,696 daily observations from July
                  2010 to February 2026. The paper's central contribution is a mechanistic derivation of this exponent:
                  it is not a free parameter, but the product of two independently measured physical scaling relations.
                  The count of non-zero-balance Bitcoin addresses grows as N(t) ∝ t<sup>3.046</sup>, a cubic scaling
                  consistent with epidemic spreading on heterogeneous scale-free networks. Price scales with address
                  count as P ∝ N<sup>1.838</sup>, a generalised Metcalfe-type network value law. Their composition,
                  3.046 × 1.838 = 5.60, matches the directly observed price exponent to within 1.6%.
                </p>
                <p>
                  This factorisation connects Bitcoin's global price trajectory to two well-studied universality
                  classes — spreading processes on heterogeneous contact networks, and value scaling in communication
                  networks — and places the Power Law Theory on a foundation that is both empirically validated and
                  theoretically derivable. The full preprint is openly available under a CC-BY 4.0 license.
                </p>
              </div>

              <div className="mt-8">
                <h3 className="font-serif text-lg font-semibold text-slate-900 mb-3">Key findings</h3>
                <ul className="list-disc pl-5 space-y-2 text-slate-700 leading-relaxed">
                  <li>Power-law fit holds over 5,696 daily observations (2010–2026) with R² = 0.961</li>
                  <li>Multi-asset pair-ratio scaling test confirms scale invariance</li>
                  <li>Direct collapse test recovers β* = 5.59 from 5,298 price ratios</li>
                  <li>
                    Sequential Bayesian analysis yields posterior β ∼ N(5.729, 0.013²) with no structural breaks
                  </li>
                  <li>Lognormal residuals are stationary, with no secular drift over fifteen years</li>
                </ul>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <PrimaryButton href="https://zenodo.org/records/19387099/files/bitcoin_powerlaw_v4_FINALA.pdf?download=1">
                  Read the Preprint (PDF)
                </PrimaryButton>
                <SecondaryButton href="https://doi.org/10.5281/zenodo.19387099">
                  View on Zenodo
                </SecondaryButton>
              </div>
            </div>
          </div>
        </section>

        <SectionDivider />

        {/* Book */}
        <section
          id="physics-of-bitcoin"
          className="max-w-6xl mx-auto px-6 my-24 scroll-mt-28"
        >
          <div className="grid grid-cols-1 md:grid-cols-[minmax(240px,320px)_1fr] gap-10 md:gap-14 items-start">
            <div>
              <a
                href="https://www.amazon.com/dp/B0GQSYF9PR"
                target="_blank"
                rel="noopener noreferrer"
                className="block group"
              >
                <img
                  src="/assets/publications/physics-of-bitcoin-cover.png"
                  alt="Cover of The Physics of Bitcoin by Giovanni Santostasi"
                  className="rounded-lg shadow-lg w-full h-auto object-contain transition-transform duration-300 group-hover:scale-[1.02] group-hover:shadow-xl"
                />
              </a>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-orange-600 font-semibold font-mono">
                Book &nbsp;·&nbsp; 2026 &nbsp;·&nbsp; Amazon #1 Bestseller in Macroeconomics
              </p>
              <h2 className="font-serif text-3xl md:text-4xl font-semibold text-slate-900 leading-tight mt-3">
                The Physics of Bitcoin: Not an Asset but a Force of Nature
              </h2>
              <p className="italic text-slate-700 text-lg mt-2 leading-snug">
                The Laws of Complexity, Growth, and Self-Organization Behind Bitcoin's Price, Adoption, and Network
                Security
              </p>
              <p className="text-slate-600 mt-3">
                Giovanni Santostasi &nbsp;·&nbsp; With a Foreword by Stephen Perrenod, Ph.D.
              </p>

              <div className="text-slate-700 text-base mt-6 space-y-4 leading-relaxed">
                <p>
                  Since 2009, Bitcoin has grown by a factor of more than ten million, surviving exchange collapses,
                  regulatory crackdowns, four halvings, and hundreds of declarations of its death. Yet a single
                  mathematical relationship — a power law stable across fifteen years and four orders of magnitude —
                  has described its growth throughout. The crashes appear on this curve as noise. The trajectory holds.
                </p>
                <p>
                  <em>The Physics of Bitcoin</em> demonstrates that this regularity is not a coincidence. Bitcoin's
                  growth follows the same mathematical laws that govern earthquakes, neural avalanches, the structure
                  of the World Wide Web, and critical phase transitions: power laws, scale invariance, and
                  self-organized criticality. These are not metaphors. They are precise, testable, quantitative claims,
                  and the data supports them with a rigour that most financial models cannot approach.
                </p>
                <p>
                  Drawing on statistical physics, network science, and fifteen years of on-chain data, the book
                  demonstrates that Bitcoin's architecture — fixed supply, programmatic issuance, decentralized
                  consensus, and scale-free network topology — places the network at a fixed point in the mathematical
                  sense, a state from which irrelevant perturbations cannot dislodge it. The same framework that
                  explains why water and iron share critical exponents, why the Internet exhibits scale-free structure,
                  and why sandpiles self-organize to criticality is shown to apply, with full quantitative rigour, to
                  Bitcoin.
                </p>
              </div>

              <blockquote className="mt-8 border-l-4 border-orange-500 bg-white/70 px-6 py-5 rounded-r-lg">
                <p className="italic text-slate-800 text-lg leading-relaxed">
                  <span className="font-semibold not-italic text-slate-900">The central insight:</span> Bitcoin's
                  network doesn't just exhibit power laws — it generates them through preferential attachment. As nodes
                  connect to well-established hubs, the network self-organizes to criticality. The topology is the
                  power law. Price is the emergent consequence.
                </p>
              </blockquote>

              <div className="mt-8">
                <h3 className="font-serif text-lg font-semibold text-slate-900 mb-3">What the book covers</h3>
                <ul className="list-disc pl-5 space-y-2 text-slate-700 leading-relaxed">
                  <li>Why power laws, rather than S-curves, correctly describe Bitcoin's long-run growth</li>
                  <li>The renormalization group and Bitcoin's universality class among complex systems</li>
                  <li>
                    How scale-free network topology generates power-law price dynamics through preferential attachment
                  </li>
                  <li>
                    Why Bitcoin's design parameters determine its trajectory while crashes, regulations, and market
                    sentiment wash out under coarse-graining
                  </li>
                  <li>
                    How network effects create a critical phase transition: below threshold, the system is unstable;
                    above threshold, power-law scaling becomes inevitable
                  </li>
                  <li>
                    A quantitative trading framework derived from the power-law slope signal-to-noise ratio, with
                    backtesting across sixteen years of price history
                  </li>
                </ul>
              </div>

              <div className="mt-8">
                <h3 className="font-serif text-lg font-semibold text-slate-900 mb-3">Who this book is for</h3>
                <p className="text-slate-700 leading-relaxed">
                  This book is for readers who want equations, data, and physical reasoning rather than narratives. It
                  is built from first principles, does not assume a physics degree, and presents its mathematical
                  content in optional technical boxes that allow the curious reader to go as deep as they wish while
                  keeping the main conceptual thread accessible throughout.
                </p>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <PrimaryButton href="https://www.amazon.com/dp/B0GQSYF9PR">Buy on Amazon</PrimaryButton>
                <SecondaryButton href="https://thephysicsofbitcoin.com">thephysicsofbitcoin.com</SecondaryButton>
              </div>
            </div>
          </div>
        </section>

        <SectionDivider />

        {/* Pecere — Multilevel Adaptive System */}
        <section
          id="multilevel-adaptive-system"
          className="max-w-6xl mx-auto px-6 my-20 scroll-mt-28"
        >
          <div className="grid grid-cols-1 md:grid-cols-[minmax(240px,320px)_1fr] gap-10 md:gap-14 items-start">
            <div>
              <a
                href="https://zenodo.org/records/20731403"
                target="_blank"
                rel="noopener noreferrer"
                className="block group"
              >
                <img
                  src="/assets/publications/pecere-multilevel-adaptive-system-cover.png"
                  alt="Cover page of From Local Incentives to Global Power Law Dynamics by Adriano Pecere"
                  className="rounded-lg shadow-lg w-full h-auto object-contain transition-transform duration-300 group-hover:scale-[1.02] group-hover:shadow-xl"
                />
              </a>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-orange-600 font-semibold font-mono">
                Preprint &nbsp;·&nbsp; November 2025
              </p>
              <h2 className="font-serif text-3xl md:text-4xl font-semibold text-slate-900 leading-tight mt-3">
                From Local Incentives to Global Power Law Dynamics: Modeling Bitcoin as a Multilevel
                Adaptive System
              </h2>
              <p className="text-slate-600 text-sm italic mt-2">
                Adriano Pecere — Scientific Bitcoin Institute, Università la Sapienza
              </p>

              <p className="text-slate-700 text-base leading-relaxed mt-4">
                Pecere models Bitcoin adoption as a multilevel adaptive system whose evolution
                follows an empirical power law. By establishing a structural equivalence between
                System Dynamics and Game Theory formulations, the paper shows that Bitcoin's
                power-law growth reflects a fractal strategic equilibrium across individual,
                corporate, and institutional scales — rather than stochastic dynamics. The work
                provides a dual SD⇄GT framework linking micro-level strategic optimization to
                macro-level structural dynamics.
              </p>

              <p className="text-slate-500 text-xs mt-3">DOI: 10.13140/RG.2.2.34945.93289</p>

              <div className="mt-6 flex flex-wrap gap-3">
                <PrimaryButton href="https://zenodo.org/records/20731403">
                  Read on Zenodo →
                </PrimaryButton>
                <SecondaryButton href="/assets/publications/pecere-multilevel-adaptive-system.pdf">
                  Download PDF
                </SecondaryButton>
              </div>
            </div>
          </div>
        </section>

        <SectionDivider />

        {/* Pecere — Economics / Ecology Bridge */}
        <section
          id="economics-ecology-bridge"
          className="max-w-6xl mx-auto px-6 my-20 scroll-mt-28"
        >
          <div className="grid grid-cols-1 md:grid-cols-[minmax(240px,320px)_1fr] gap-10 md:gap-14 items-start">
            <div>
              <a
                href="https://zenodo.org/records/20731928"
                target="_blank"
                rel="noopener noreferrer"
                className="block group"
              >
                <img
                  src="/assets/publications/pecere-economics-ecology-bridge-cover.png"
                  alt="Cover page of Resource-Constrained Competition: A Mathematical Bridge Between Economics and Ecology by Adriano Pecere"
                  className="rounded-lg shadow-lg w-full h-auto object-contain transition-transform duration-300 group-hover:scale-[1.02] group-hover:shadow-xl"
                />
              </a>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-orange-600 font-semibold font-mono">
                Preprint &nbsp;·&nbsp; November 2025
              </p>
              <h2 className="font-serif text-3xl md:text-4xl font-semibold text-slate-900 leading-tight mt-3">
                Resource-Constrained Competition: A Mathematical Bridge Between Economics and Ecology
              </h2>
              <p className="text-slate-600 text-sm italic mt-2">
                Adriano Pecere — Scientific Bitcoin Institute, Università la Sapienza
              </p>

              <p className="text-slate-700 text-base leading-relaxed mt-4">
                Pecere demonstrates that market equilibria in economic theory and ecological
                equilibria in population dynamics are mathematically isomorphic solutions to resource
                allocation problems. Monopoly, duopoly, oligopoly, and perfect competition correspond
                precisely to single-species, two-species, multi-species, and intense competition
                scenarios in ecology. The result reveals a general principle: systems where agents
                compete for scarce resources converge to predictable configurations regardless of
                whether allocation occurs through conscious optimization or evolutionary selection.
              </p>

              <p className="text-slate-500 text-xs mt-3">DOI: 10.13140/RG.2.2.22995.44326</p>

              <div className="mt-6 flex flex-wrap gap-3">
                <PrimaryButton href="https://zenodo.org/records/20731928">
                  Read on Zenodo →
                </PrimaryButton>
                <SecondaryButton href="/assets/publications/pecere-economics-ecology-bridge.pdf">
                  Download PDF
                </SecondaryButton>
              </div>
            </div>
          </div>
        </section>

        <SectionDivider />

        {/* Closing */}
        <section className="max-w-2xl mx-auto px-6 text-center mt-20">
          <h3 className="font-serif text-2xl font-semibold text-slate-900 mb-4">
            More publications in preparation
          </h3>
          <p className="text-slate-600 leading-relaxed">
            Additional working papers are in preparation on topics including bubble dynamics, hash-rate scaling, and
            the application of the Power Law framework to sovereign adoption. Updates will be posted here as work
            becomes publicly available.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  )
}
