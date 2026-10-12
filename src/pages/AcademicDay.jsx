import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import ScrollToHash from '../components/ScrollToHash.jsx'

const REGISTRATION_URL = 'https://luma.com/40aayf5j'
const MAPS_URL =
  'https://www.google.com/maps/search/?api=1&query=SUPSI+Dipartimento+Tecnologie+Innovative+Campus+Est+Viganello'
const POSTER_SRC = '/assets/events/academic-day/poster.jpg'

/* ---------- buttons (same shapes as the Publications page) ---------- */

function PrimaryButton({ href, children, external = false }) {
  const className =
    'inline-flex items-center justify-center bg-orange-600 text-white rounded px-5 py-2.5 font-semibold text-sm hover:bg-orange-700 transition-colors'
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    )
  }
  return (
    <a href={href} className={className}>
      {children}
    </a>
  )
}

function SecondaryButtonDark({ href, children, external = false }) {
  const className =
    'inline-flex items-center justify-center border border-white/30 text-white/90 rounded px-5 py-2.5 font-semibold text-sm hover:bg-white/10 hover:border-white transition-colors'
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    )
  }
  return (
    <a href={href} className={className}>
      {children}
    </a>
  )
}

function RegisterBlock({ align = 'left' }) {
  return (
    <div className={align === 'center' ? 'text-center' : ''}>
      <PrimaryButton href={REGISTRATION_URL} external>
        Register to attend
      </PrimaryButton>
      <p className="text-xs text-slate-400 mt-3 font-mono">Registration subject to host approval</p>
    </div>
  )
}

/* ---------- content ---------- */

const researchAreas = [
  {
    title: 'Power-law and scaling models',
    line: 'Long-term growth dynamics of price, adoption, and hash rate.',
  },
  {
    title: 'Complex systems and network science',
    line: 'Bitcoin as a self-organizing network; feedback between adoption, security, and value.',
  },
  {
    title: 'Econophysics and monetary economics',
    line: 'Statistical properties of Bitcoin markets; Bitcoin in monetary theory.',
  },
  {
    title: 'Energy and thermodynamics of proof-of-work',
    line: 'Mining as an energy-information process; grids and sustainability.',
  },
  {
    title: 'Computer science and protocol research',
    line: 'Security, cryptography, Layer-2 systems, protocol evolution.',
  },
  {
    title: 'Data science and methodology',
    line: 'On-chain analytics, reproducible datasets, statistical rigor.',
  },
  {
    title: 'Societal and adoption dynamics',
    line: 'Sociotechnical perspectives on global adoption, education, and policy.',
  },
]

const programme = [
  {
    time: '13:30–13:45',
    session: 'Welcome and opening remarks',
    speaker: 'Luca Esposito (SBI, host) · Giovanni Santostasi (SBI) · SUPSI representative',
  },
  {
    time: '13:45–14:25',
    session: "Bitcoin's Power Law and Scale Invariance",
    speaker: 'Giovanni Santostasi (SBI)',
  },
  {
    time: '14:25–15:05',
    session:
      "Bitcoin's Power-Law Exponents: From Daily Distributions to Averaged Dynamics and Applications",
    speaker: 'Hendrik Zimmermann',
  },
  {
    time: '15:05–15:45',
    session: 'Bitcoin Conquers Time and Space: Logarithmically Persistent Autopoiesis',
    speaker: 'Stephen Perrenod (SBI)',
  },
  {
    time: '15:45–16:25',
    session: 'The Game(s) of Bitcoin: From Strategic Interaction to Emergent Dynamics',
    speaker: 'Adriano Pecere (SBI)',
  },
  { time: '16:25–16:55', session: 'Coffee break', speaker: '' },
  {
    time: '16:55–17:35',
    session: 'Developing a Predictive Model for Medium-Term Bitcoin Price Movements',
    speaker: 'Alex Bragin (JAN3)',
  },
  {
    time: '17:35–18:35',
    session: 'Panel discussion',
    speaker: 'All speakers; moderated by Luca Esposito',
  },
  { time: '18:35–19:00', session: 'Closing remarks and networking aperitivo', speaker: '' },
]

const speakers = [
  {
    name: 'Giovanni Santostasi',
    initials: 'GS',
    role: 'Founder & Scientific Director, Scientific Bitcoin Institute',
    bio: "Physicist and originator of the Bitcoin Power Law model, which describes Bitcoin's long-run price trajectory as a scale-invariant power law in time. He holds a PhD in physics, with prior research in gravitational-wave data analysis (LIGO Scientific Collaboration) and computational neuroscience at Northwestern University. He has published and lectured extensively on the Bitcoin Power Law and its scaling properties.",
    abstract: null,
  },
  {
    name: 'Hendrik Zimmermann',
    initials: 'HZ',
    role: 'Independent researcher',
    bio: 'Holds a doctorate in physics from Heidelberg University, where he worked on magnetic resonance imaging at the German Cancer Research Center (DKFZ). After developing image-processing algorithms in industry, he taught mathematics, physics and computer science for more than a decade. His independent Bitcoin research applies methods from statistical physics, with an emphasis on verifiable mathematics rather than narrative or market commentary.',
    abstract:
      "Bitcoin is usually analysed in price space. Using its power-law behaviour, we can carry out complementary analyses in exponent space, built on the daily 'local' exponents n = log(P₂/P₁) / log(t₂/t₁), computed from the prices on two consecutive days. From day to day the exponents scatter widely around a global mean and look like pure noise, but averaging brings out regularities and dynamic patterns: the averaged exponent fluctuates strongly in a recurring pattern, yet it repeatedly relaxes back towards its long-term value. The origin of this behaviour still has to be explored. I give an overview of my work in this area and, as an outlook, an application: a possible price projection in combination with a Monte Carlo simulation. Along the way I point out a beautiful connection between the two spaces: in log-time, log-price and exponent are related like position and velocity.",
  },
  {
    name: 'Stephen Perrenod',
    initials: 'SP',
    role: 'Vice Director, Scientific Bitcoin Institute; technology analyst, OrionX',
    bio: 'A thirty-year veteran of the high-performance computing industry, with business development roles at Cray, SGI and Sun Microsystems, and consulting work spanning HPC, cloud and quantum computing. Author of two books on cosmology and extragalactic astronomy. He earned a BS in physics from MIT and an MA and PhD in astronomy from Harvard University.',
    abstract:
      "Bitcoin's long-run growth follows a remarkably steep power law across a wide range of both fiat currencies and major commodities; in each case examined, the estimated exponent lies between 5.0 and 6.0. Recognizing this pattern requires the correct lens: log-log plots reveal Bitcoin's underlying network-scaling dynamics far more clearly than conventional charts. Gold conquered time by preserving value across centuries. Fiat currency conquered space by moving efficiently within national borders. Bitcoin combines both properties: it transfers value globally without dependence on national monetary rails while growing value through time. We interpret Bitcoin as an endogenous monetary meta-network into which liquidity percolates from the exogenous, allopoietic fiat system, and propose that the power law arises from Bitcoin's autopoietic character: its game-theoretic protocol jointly reproduces its monetary unit, ledger, and system of digital vaults, with powerful feedback loops operating within an absolutely finite supply constraint. This self-organizing process can be characterized using the Lambert W function — strikingly, Bitcoin's estimated W lies in a range comparable to that describing the Sun's long-term balance between gravitational contraction and radiation pressure. Empirically, the power law outperforms competing growth models, particularly in walk-forward forecasting, while its exponent has remained stable for more than a decade.",
  },
  {
    name: 'Adriano Pecere',
    initials: 'AP',
    role: 'Research Fellow, Scientific Bitcoin Institute',
    bio: "Works on evolutionary game theory, network dynamics, and complex systems applied to Bitcoin. His academic path, beginning with Aerospace Engineering and continuing with Economics and Finance at Sapienza University of Rome, combines methods from the hard sciences with the analysis of economic and social systems. Recent work includes studies of Bitcoin's Power Law through non-stationary multiplicative models and scale-invariant game equilibria.",
    abstract:
      'Bitcoin is a system of rules, incentives, and interacting agents whose large-scale properties emerge without a central authority. This makes it not only a monetary and technological system, but also a natural object of study and a living experiment for game theory and complex systems science. This talk develops a sequence of perspectives on Bitcoin, beginning with classical game theory and the strategic interactions between the different participants in the network; from there, it moves to evolutionary game theory, where strategies, populations, and incentives evolve over time, and to system dynamics, where feedback loops make the environment endogenous to the agents.',
  },
  {
    name: 'Alex Bragin',
    initials: 'AB',
    role: 'CTO, JAN3',
    bio: 'A Bitcoin user since 2011, he created Bitcoin futures and co-founded a Bitcoin exchange. Before that, he led the open-source operating system project ReactOS for a decade.',
    abstract:
      '100,000 simulated Bitcoin paths, one perfect-looking match, and why it predicts nothing. A practical walk-through of building an honest 30-day BTC price model with market, on-chain and macro data.',
  },
  {
    name: 'Luca Esposito',
    initials: 'LE',
    role: 'Host & Panel Moderator',
    bio: 'Host of the Academic Day and moderator of the panel discussion.',
    note: 'Full bio to be added.',
    abstract: null,
  },
]

/* ---------- sections ---------- */

// Web-optimised poster in public/assets/events/academic-day/poster.jpg.
// If it is missing, the frame removes itself rather than showing a broken image.
function Poster() {
  const [failed, setFailed] = useState(false)
  if (failed) return null
  return (
    <div className="rounded-xl border border-white/15 bg-white/5 p-3 shadow-xl">
      <img
        src={POSTER_SRC}
        alt="Event poster: Scientific Bitcoin Institute — The Science of Bitcoin, Academic Day and public launch. A glowing orange Bitcoin symbol built from a network of nodes sits above a night-time view of Lake Lugano, flanked by a log-log power-law chart labelled P(t) ∝ t^5.8 and the themes power laws, network science, econophysics, proof-of-work energy and data science. 20 October 2026, 13:30–19:00, SUPSI University Lugano — Sala Polivalente, Campus Est (USI–SUPSI), Via la Santa 1, 6962 Viganello. Register at luma.com/40aayf5j; registration subject to approval."
        onError={() => setFailed(true)}
        className="w-full max-h-[32rem] object-contain rounded-lg"
      />
    </div>
  )
}

function SpeakerCard({ speaker }) {
  return (
    <article className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col">
      <div className="flex items-start gap-4">
        {/* Monogram — swap this block for an <img> once speaker photos are available */}
        <div
          className="flex-shrink-0 w-14 h-14 rounded-full bg-slate-900 border border-orange-500/40 flex items-center justify-center font-mono text-sm font-semibold text-orange-400 tracking-wider"
          aria-hidden="true"
        >
          {speaker.initials}
        </div>
        <div>
          <h3 className="font-serif text-2xl text-slate-900 leading-tight">{speaker.name}</h3>
          <p className="text-xs uppercase tracking-wider text-orange-600 font-semibold font-mono mt-1">
            {speaker.role}
          </p>
        </div>
      </div>

      <p className="text-slate-600 text-sm leading-relaxed mt-5">{speaker.bio}</p>
      {speaker.note && <p className="text-slate-400 text-xs italic mt-2">{speaker.note}</p>}

      {speaker.abstract && (
        <details className="group mt-5 border-t border-slate-200 pt-4">
          <summary className="cursor-pointer list-none text-sm font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-2">
            <span className="font-mono text-xs transition-transform group-open:rotate-90">
              &#9656;
            </span>
            Talk abstract
          </summary>
          <p className="text-slate-600 text-sm leading-relaxed mt-3">{speaker.abstract}</p>
        </details>
      )}
    </article>
  )
}

export default function AcademicDay() {
  useEffect(() => {
    document.title = 'Academic Day — The Science of Bitcoin | Scientific Bitcoin Institute'
    const meta = document.querySelector('meta[name="description"]')
    if (meta) {
      meta.setAttribute(
        'content',
        'The Science of Bitcoin — Academic Day and public launch of the Scientific Bitcoin Institute. 20 October 2026, SUPSI Campus Est, Lugano-Viganello, Switzerland.',
      )
    }
  }, [])

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <ScrollToHash />

      <main className="pt-28 pb-24">
        {/* 1 — Hero */}
        <section className="bg-slate-900 text-white">
          <div className="max-w-6xl mx-auto px-6 py-16 md:py-24">
            <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-12 lg:gap-16 items-center">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-bitcoin font-semibold font-mono">
                  Academic Day &nbsp;·&nbsp; Public launch of the Institute
                </p>
                <h1 className="font-serif text-4xl md:text-6xl font-semibold leading-tight mt-5">
                  The Science of Bitcoin
                </h1>
                <p className="text-slate-300 text-lg md:text-xl mt-4">
                  Scientific Bitcoin Institute — Academic Day
                </p>

                <div className="mt-8 border-y border-white/10 py-5 font-mono text-sm md:text-base text-slate-300 leading-relaxed">
                  Tuesday, 20 October 2026 &nbsp;·&nbsp; 13:30–19:00 &nbsp;·&nbsp; SUPSI, Campus Est
                  (USI–SUPSI), Lugano-Viganello, Switzerland
                </div>

                <div className="mt-8 flex flex-wrap items-start gap-4">
                  <RegisterBlock />
                  <SecondaryButtonDark href="#programme">View programme</SecondaryButtonDark>
                </div>
              </div>

              <Poster />
            </div>
          </div>
        </section>

        {/* 2 — About */}
        <section id="about" className="bg-white scroll-mt-28">
          <div className="max-w-3xl mx-auto px-6 py-16 md:py-24">
            <p className="text-xs uppercase tracking-wider text-orange-600 font-semibold font-mono">
              The occasion
            </p>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-slate-900 mt-3">
              About the event
            </h2>
            <div className="mt-8 space-y-6 text-slate-600 text-base md:text-lg leading-relaxed">
              <p>
                The workshop marks the public launch of the Scientific Bitcoin Institute (SBI), a
                research organization dedicated to the rigorous, multidisciplinary study of Bitcoin
                as a complex adaptive system.
              </p>
              <p>
                Rather than approaching Bitcoin through the lens of advocacy, trading, or industry
                promotion, the Institute treats it as a natural object of scientific inquiry: a
                global socio-economic and technological system whose growth, adoption, and behavior
                can be measured, modeled, and understood with the tools of physics, network science,
                economics, and computer science.
              </p>
              <p>
                The inaugural event brings together invited researchers and international experts
                for a focused half-day of talks and discussion, hosted within Lugano's established
                Plan B academic ecosystem (City of Lugano, USI, SUPSI, and Franklin University
                Switzerland). The event is organised by SUPSI (Dipartimento Tecnologie Innovative)
                and the Scientific Bitcoin Institute.
              </p>
            </div>
          </div>
        </section>

        {/* 3 — Research areas */}
        <section className="bg-slate-50">
          <div className="max-w-6xl mx-auto px-6 py-16 md:py-24">
            <p className="text-xs uppercase tracking-wider text-orange-600 font-semibold font-mono">
              The Institute's scope
            </p>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-slate-900 mt-3">
              Research areas
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
              {researchAreas.map((area) => (
                <div
                  key={area.title}
                  className="bg-white rounded-xl border border-slate-200 shadow-sm p-6"
                >
                  <h3 className="font-serif text-xl text-slate-900 leading-snug">{area.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed mt-2">{area.line}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4 — Programme */}
        <section id="programme" className="bg-slate-900 text-white scroll-mt-28">
          <div className="max-w-4xl mx-auto px-6 py-16 md:py-24">
            <p className="text-xs uppercase tracking-[0.25em] text-bitcoin font-semibold font-mono">
              20 October 2026 &nbsp;·&nbsp; 13:30–19:00
            </p>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold mt-3">Programme</h2>

            <ol className="mt-12 space-y-10 border-l border-white/15">
              {programme.map((item) => (
                <li key={item.time} className="relative pl-8 md:pl-10">
                  <span
                    className="absolute -left-[5px] top-2 h-[9px] w-[9px] rounded-full bg-bitcoin"
                    aria-hidden="true"
                  />
                  <p className="font-mono text-sm text-bitcoin">{item.time}</p>
                  <h3 className="font-serif text-xl md:text-2xl leading-snug mt-1">
                    {item.session}
                  </h3>
                  {item.speaker && <p className="text-slate-400 text-sm mt-1.5">{item.speaker}</p>}
                </li>
              ))}
            </ol>

            <p className="text-slate-400 text-sm italic mt-12 pt-6 border-t border-white/10">
              Each talk slot includes audience questions.
            </p>
          </div>
        </section>

        {/* 5 — Speakers */}
        <section id="speakers" className="bg-white scroll-mt-28">
          <div className="max-w-6xl mx-auto px-6 py-16 md:py-24">
            <p className="text-xs uppercase tracking-wider text-orange-600 font-semibold font-mono">
              Invited researchers
            </p>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-slate-900 mt-3">
              Speakers
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">
              {speakers.map((speaker) => (
                <SpeakerCard key={speaker.name} speaker={speaker} />
              ))}
            </div>
          </div>
        </section>

        {/* 6 — Venue */}
        <section className="bg-slate-900 text-white">
          <div className="max-w-4xl mx-auto px-6 py-16 md:py-24">
            <p className="text-xs uppercase tracking-[0.25em] text-bitcoin font-semibold font-mono">
              Lugano-Viganello, Switzerland
            </p>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold mt-3">Venue</h2>
            <p className="text-slate-300 text-lg leading-relaxed mt-6 max-w-2xl">
              SUPSI — Dipartimento Tecnologie Innovative (DTI), Sala Polivalente, Campus Est
              (USI–SUPSI), Via la Santa 1, 6962 Lugano-Viganello, Switzerland.
            </p>
            <div className="mt-8">
              <SecondaryButtonDark href={MAPS_URL} external>
                Open in Google Maps
              </SecondaryButtonDark>
            </div>
          </div>
        </section>

        {/* 7 — Organisers */}
        <section className="bg-slate-50">
          <div className="max-w-6xl mx-auto px-6 py-16 md:py-24">
            <p className="text-xs uppercase tracking-wider text-orange-600 font-semibold font-mono">
              Organised by
            </p>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-slate-900 mt-3">
              Organisers
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
                <h3 className="font-serif text-2xl text-slate-900">SUPSI</h3>
                <p className="text-slate-600 text-base leading-relaxed mt-4">
                  One of the nine universities of applied sciences recognized by the Swiss
                  Confederation, providing education that integrates theoretical-scientific
                  knowledge with professional practice, with significant emphasis on research.
                </p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
                <h3 className="font-serif text-2xl text-slate-900">
                  Scientific Bitcoin Institute
                </h3>
                <p className="text-slate-600 text-base leading-relaxed mt-4">
                  An academic, public-interest non-profit dedicated to the rigorous scientific study
                  of Bitcoin, applying the methods of physics, mathematics, statistics and computer
                  science to the empirical analysis of Bitcoin and related decentralised systems.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 8 — Final CTA */}
        <section className="bg-slate-900 text-white">
          <div className="max-w-3xl mx-auto px-6 py-16 md:py-24 text-center">
            <h2 className="font-serif text-3xl md:text-4xl font-semibold leading-tight">
              Join us for the public launch of the Scientific Bitcoin Institute
            </h2>
            <div className="mt-10 flex justify-center">
              <RegisterBlock align="center" />
            </div>
            <p className="text-slate-400 text-sm mt-10">
              <Link to="/news/journal" className="underline hover:text-white">
                See the Institute's Event Journal
              </Link>
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
