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

const outlineButton =
  'inline-flex items-center justify-center border border-slate-300 text-slate-700 rounded px-5 py-2.5 font-semibold text-sm hover:border-slate-500 transition-colors'

const fellows = [
  {
    id: 'adriano-pecere',
    name: 'Adriano Pecere',
    photo: '/assets/team/adriano.png',
    alt: 'Adriano Pecere',
    bio: [
      <>
        Adriano Pecere is an interdisciplinary researcher specializing in evolutionary game theory and network
        dynamics applied to the Bitcoin protocol. His academic path, beginning with Aerospace Engineering at Sapienza
        University of Rome and continuing in Economics and Finance, reflects a methodological approach that combines
        hard sciences with the analysis of socio-economic phenomena.
      </>,
      <>
        His research focuses on the econophysics of Bitcoin: how local strategic interactions give rise to emergent
        macroscopic properties. Recent work includes studies of Bitcoin's Power Law interpreted through non-stationary
        multiplicative models and scale-invariant game equilibria, and analyses of the economic sustainability of
        mining business models — examining how firms in the sector can optimize long-term competitive equilibrium by
        leveraging the intrinsic mathematical regularities of the network.
      </>,
      <>
        Pecere views Bitcoin as an evolution of human coordination systems and an unprecedented experiment for network
        science and complex systems. In domains of social science historically constrained by the practical and
        ethical impossibility of controlled experimentation, Bitcoin provides a global, transparent, and immutable
        dataset, enabling real-time observation of an emerging economic order through the lenses of game theory,
        statistical physics, and the social sciences.
      </>,
    ],
  },
  {
    id: 'hendrik-zimmermann',
    name: 'Hendrik Zimmermann, Ph.D.',
    photo: '/assets/team/hendrik.png',
    alt: 'Hendrik Zimmermann',
    bio: [
      <>
        Hendrik Zimmermann holds a doctorate in physics from Ruprecht-Karls-Universität Heidelberg, where his
        dissertation work at the German Cancer Research Center (DKFZ) developed radio-frequency coil techniques and
        measurement methods for instrument localization in interventional magnetic resonance imaging. His subsequent
        work spanned industrial image processing — algorithm development and the calibration of mechanical and
        optical inspection systems — and a long career in physics and mathematics education at German Gymnasium level.
      </>,
      <>
        Zimmermann's path into Bitcoin research began with macroeconomic concerns about inflation and monetary policy.
        A close reading of the Power Law literature — including the work of the Institute's Director and
        Vice-Director — drew him toward a more rigorous analytical approach to Bitcoin. His current independent work
        emphasizes empirical analysis grounded in the same statistical physics methods that characterize the
        Institute's research program.
      </>,
      <>
        Zimmermann's contribution to the Institute reflects a commitment to communicating Bitcoin science to broader
        audiences with the precision that distinguishes scientific analysis from market commentary. His teaching
        background and his physicist's training combine in a methodological emphasis on facts and verifiable
        mathematics rather than narrative or technical analysis.
      </>,
    ],
  },
]

function FellowCard({ fellow }) {
  return (
    <article
      id={fellow.id}
      className="scroll-mt-28 grid grid-cols-1 md:grid-cols-[minmax(180px,260px)_1fr] gap-8 md:gap-12 items-start"
    >
      <div>
        <img
          src={fellow.photo}
          alt={fellow.alt}
          className="w-full max-w-[220px] mx-auto md:mx-0 aspect-[4/5] object-cover rounded-lg shadow-md"
        />
      </div>
      <div>
        <p className="text-xs uppercase tracking-wider text-orange-600 font-semibold font-mono">
          Research Fellow
        </p>
        <h2 className="font-serif text-2xl md:text-3xl font-semibold text-slate-900 leading-tight mt-2">
          {fellow.name}
        </h2>
        <div className="mt-5 space-y-4 text-slate-700 leading-relaxed text-[1.02rem]">
          {fellow.bio.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      </div>
    </article>
  )
}

export default function ResearchFellows() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <ScrollToHash />

      <main className="pt-28 pb-24">
        {/* Page title */}
        <section className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-orange-600 font-semibold mb-4 font-mono">
            Scientific Bitcoin Institute &nbsp;·&nbsp; People
          </p>
          <h1 className="font-serif text-5xl md:text-6xl font-semibold text-slate-900 leading-tight">
            Research Fellows
          </h1>
        </section>

        {/* Intro */}
        <section className="max-w-2xl mx-auto mt-10 px-6">
          <p className="text-slate-700 text-base leading-relaxed">
            Research Fellows are independent researchers affiliated with the Scientific Bitcoin Institute who pursue
            work that complements and extends the Institute's research program. Fellows contribute their own
            scholarship and analysis to the Institute's broader agenda of rigorous, scientifically-grounded study of
            Bitcoin as a complex system.
          </p>
        </section>

        <SectionDivider />

        {/* Fellows */}
        <section className="max-w-4xl mx-auto px-6">
          <div className="max-w-3xl mx-auto space-y-16">
            {fellows.map((fellow) => (
              <FellowCard key={fellow.id} fellow={fellow} />
            ))}
          </div>
        </section>

        <SectionDivider />

        {/* Closing */}
        <section className="max-w-2xl mx-auto px-6 text-center mt-16">
          <h3 className="font-serif text-2xl font-semibold text-slate-900 mb-4">
            Become a Research Fellow
          </h3>
          <p className="text-slate-600 leading-relaxed">
            Researchers interested in joining the Institute as a Research Fellow — whether to pursue an open problem
            from the Institute's research catalogue, to extend the Power Law framework, or to bring complementary
            expertise to the Institute's program — are invited to make contact.
          </p>

          <div className="mt-8 flex justify-center">
            <Link to="/about/contact" className={outlineButton}>
              Contact the Institute →
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
