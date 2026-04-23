import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'

const sections = [
  {
    id: 'primary-sources',
    title: 'Primary Sources',
    entries: [
      {
        title: 'Bitcoin: A Peer-to-Peer Electronic Cash System',
        byline: 'Satoshi Nakamoto — October 31, 2008',
        description: (
          <>
            The original nine-page whitepaper that introduced Bitcoin to the cypherpunks mailing list and to the world.
            It describes a system for electronic transactions without a trusted third party, introducing proof-of-work,
            the blockchain as a timestamped data structure, and the Nakamoto consensus mechanism. The paper's clarity,
            brevity, and durability make it a model of scientific writing. It is the foundational document of the entire
            field and the starting point for any serious study of Bitcoin.
          </>
        ),
        links: [
          { label: 'Read the whitepaper (PDF)', href: 'https://bitcoin.org/bitcoin.pdf' },
        ],
      },
    ],
  },
  {
    id: 'scientific-papers',
    title: 'Scientific Papers',
    entries: [
      {
        title:
          "Are Bitcoin Bubbles Predictable? Combining a Generalized Metcalfe's Law and the Log-Periodic Power Law Singularity Model",
        byline:
          'Spencer Wheatley, Didier Sornette, Tobias Huber, Max Reppen, Robert N. Gantner — Royal Society Open Science, 2019',
        description: (
          <>
            The definitive peer-reviewed treatment of Bitcoin's bubble dynamics from Sornette's ETH Zürich group.
            Applies the Johansen–Ledoit–Sornette log-periodic power law model to Bitcoin's historical bubbles while
            using a generalized Metcalfe's Law to quantify network-based fundamental value. Identifies the signatures
            of unsustainable super-exponential growth and the critical times at which bubbles are most likely to
            correct.
          </>
        ),
        links: [
          { label: 'Read the paper', href: 'https://royalsocietypublishing.org/doi/10.1098/rsos.180538' },
        ],
      },
      {
        title: "Dissection of Bitcoin's Multiscale Bubble History",
        byline:
          'Jan-Christian Gerlach, Guilherme Demos, Didier Sornette — Swiss Finance Institute Research Paper No. 18-30, 2018',
        description: (
          <>
            Companion analysis identifying bubble regimes at multiple timescales and using clustering methods to
            characterize likely post-bubble scenarios. Useful for understanding how Bitcoin's price dynamics break into
            distinct regimes that conventional time-series methods miss.
          </>
        ),
        links: [
          { label: 'Read on SSRN', href: 'https://papers.ssrn.com/sol3/papers.cfm?abstract_id=3164246' },
        ],
      },
      {
        title: "Metcalfe's Law as a Model for Bitcoin's Value",
        byline: 'Timothy F. Peterson — Alternative Investment Analyst Review, 2018',
        description: (
          <>
            An empirical demonstration that Bitcoin's medium-to-long-term price closely follows a Metcalfe's Law
            scaling with active addresses, modified by a Gompertz curve to account for inflationary issuance. One of
            the earliest quantitative treatments of Bitcoin's network-value relationship and an important precursor to
            the scaling work that underlies the Power Law Theory.
          </>
        ),
        links: [
          { label: 'Read on SSRN', href: 'https://papers.ssrn.com/sol3/papers.cfm?abstract_id=3078248' },
        ],
      },
      {
        title: "Digital Blockchain Networks Appear to Be Following Metcalfe's Law",
        byline: 'Ken Alabi — Electronic Commerce Research and Applications, 2017',
        description: (
          <>
            Peer-reviewed network analysis of blockchain systems demonstrating that the value of public blockchain
            networks tracks the square of active addresses, consistent with Metcalfe's Law. Broadens the empirical base
            beyond Bitcoin alone.
          </>
        ),
        links: [
          { label: 'Read the paper', href: 'https://dl.acm.org/doi/10.1016/j.elerap.2020.100939' },
        ],
      },
    ],
  },
  {
    id: 'technical-books',
    title: 'Technical Books',
    entries: [
      {
        title: 'Mastering Bitcoin: Programming the Open Blockchain (3rd edition)',
        byline: "Andreas M. Antonopoulos and David A. Harding — O'Reilly Media, 2023",
        description: (
          <>
            The canonical technical reference on Bitcoin's architecture. Covers keys, addresses, wallets, transactions,
            the scripting language, the blockchain, the peer-to-peer network, mining, consensus, and security in
            substantial depth. Written for engineers and technically-minded readers; also serves as a university
            textbook. Freely available under the CC-BY-SA license in addition to the commercial edition.
          </>
        ),
        links: [
          { label: 'Read on GitHub', href: 'https://github.com/bitcoinbook/bitcoinbook' },
        ],
      },
      {
        title: 'The Bitcoin Standard: The Decentralized Alternative to Central Banking',
        byline: 'Saifedean Ammous — Wiley, 2018',
        description: (
          <>
            The most widely read economic treatment of Bitcoin, written from an Austrian-school perspective. Surveys
            the history of monetary technologies, argues for sound money on historical and theoretical grounds, and
            situates Bitcoin as the first fully implemented digital hard money. Influential despite popular style;
            notable for making the economic case for Bitcoin accessible to a broad audience. Readers should approach it
            as a position paper in monetary theory rather than as a neutral survey.
          </>
        ),
        links: [
          { label: 'Publisher page', href: 'https://saifedean.com/tbs' },
        ],
      },
    ],
  },
  {
    id: 'institute-publications',
    title: 'Institute Publications',
    entries: [
      {
        title:
          'A Mechanistic Derivation of the Bitcoin Price Power Law: Network Adoption Dynamics and Generalised Metcalfe Scaling',
        byline:
          'Giovanni Santostasi, Stephen Perrenod — Scientific Bitcoin Institute, 2026 · Zenodo preprint · DOI: 10.5281/zenodo.19387099',
        description: (
          <>
            The Institute's flagship research publication. Demonstrates that Bitcoin's price follows a power law in
            time with exponent β = 5.69 ± 0.05 over 5,696 daily observations from 2010 to 2026, and — crucially —
            derives this exponent mechanistically as the product of two independently measured physical scaling
            relations: the cubic growth of non-zero-balance addresses (β<sub>A</sub> = 3.046, consistent with epidemic
            spreading on heterogeneous scale-free networks) and a generalised Metcalfe-type value law
            (β<sub>M</sub> = 1.838). The composition β<sub>A</sub> × β<sub>M</sub> = 5.60 matches the directly observed
            exponent to within 1.6%, establishing that the price trajectory is a deterministic mathematical consequence
            of network topology rather than speculative dynamics. The paper includes three independent empirical tests
            of scale invariance: a multi-asset pair-ratio scaling test, a direct collapse test of the power-law
            identity recovering β* = 5.59, and a sequential Bayesian analysis yielding a posterior
            β ~ N(5.729, 0.013²) with no structural breaks across fifteen years of data. This preprint is the
            mathematical foundation of SBI's research program.
          </>
        ),
        links: [
          {
            label: 'Read the preprint (PDF)',
            href: 'https://zenodo.org/records/19387099/files/bitcoin_powerlaw_v4_FINALA.pdf?download=1',
          },
          { label: 'View on Zenodo', href: 'https://doi.org/10.5281/zenodo.19387099' },
        ],
      },
      {
        title: 'The Physics of Bitcoin: Not an Asset but a Force of Nature',
        byline: 'Giovanni Santostasi — 2026 · Amazon #1 bestseller in Macroeconomics',
        description: (
          <>
            A book-length treatment of Bitcoin as a physical system, developing the Power Law Theory in full
            mathematical rigor and situating it within the framework of statistical physics, the renormalization group,
            and self-organized criticality. Argues that Bitcoin's architecture places it at a fixed point in the
            mathematical sense — a state whose long-run trajectory is determined by the network's relevant operators
            (fixed supply, difficulty adjustment, the halving) while market noise, regulatory events, and sentiment
            wash out as irrelevant perturbations. Written by SBI's Director and drawing on fifteen years of on-chain
            data and more than a decade of the author's research.
          </>
        ),
        links: [
          { label: 'thephysicsofbitcoin.com', href: 'https://thephysicsofbitcoin.com' },
          { label: 'Kindle and paperback on Amazon', href: 'https://www.amazon.com/dp/B0GQSYF9PR' },
        ],
      },
      {
        title: 'The Bitcoin Power Law Theory',
        byline: 'Giovanni Santostasi — 2024 · Online exposition',
        description: (
          <>
            The accessible introduction to the Power Law Theory, predating the formal preprint and book. Presents the
            empirical findings and their connection to scaling laws in cities and biological systems. A useful entry
            point for readers new to the framework.
          </>
        ),
        links: [
          {
            label: 'Read on Medium',
            href: 'https://giovannisantostasi.medium.com/the-bitcoin-power-law-theory-962dfaf99ee9',
          },
        ],
      },
      {
        title: 'Bitcoin Mining Industry Report (semi-annual)',
        byline: 'Stephen Perrenod, Ph.D. — Scientific Bitcoin Institute',
        description: (
          <>
            SBI Vice-Director Stephen Perrenod's recurring analysis of the Bitcoin mining industry, situating its
            growth within the broader high-performance computing sector. Covers global hash rate distribution,
            hardware evolution, energy economics, and the industrial-scale implications of Bitcoin's proof-of-work
            anchor.
          </>
        ),
        linkPlaceholder: 'Link coming soon',
      },
    ],
  },
  {
    id: 'further-reading',
    title: 'Further Reading',
    entries: [
      {
        title: 'Bitcoin Bubbles and Anti-Bubbles',
        byline: 'Stephen Perrenod — Substack essay',
        description: (
          <>
            An applied treatment of Sornette's log-periodic power law model to Bitcoin's bubble history, with a clear
            exposition of how LPPL complements the core Power Law Theory of Bitcoin's long-run trend. Useful as a
            bridge between the peer-reviewed Sornette literature and the Institute's broader framing.
          </>
        ),
        links: [
          {
            label: 'Read on Substack',
            href: 'https://stephenperrenod.substack.com/p/bitcoin-bubbles-and-anti-bubbles',
          },
        ],
      },
    ],
  },
]

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

function LibraryCard({ entry }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white px-8 py-7 shadow-sm hover:shadow-md transition-shadow">
      <h3 className="font-serif text-xl md:text-2xl font-bold text-slate-900 leading-snug">
        {entry.title}
      </h3>
      <p className="mt-2 text-sm italic text-slate-600">{entry.byline}</p>
      <div className="mt-4 text-slate-700 text-[1.02rem] leading-relaxed">
        <p>{entry.description}</p>
      </div>
      <div className="mt-5 text-sm flex flex-wrap items-center gap-x-2 gap-y-1">
        {entry.linkPlaceholder ? (
          <span className="italic text-slate-500">{entry.linkPlaceholder}</span>
        ) : (
          entry.links.map((link, i) => (
            <span key={i} className="inline-flex items-center gap-2">
              {i > 0 && <span className="text-slate-300" aria-hidden="true">·</span>}
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-600 hover:text-orange-700 hover:underline transition-colors"
              >
                {link.label}
              </a>
            </span>
          ))
        )}
      </div>
    </article>
  )
}

export default function BitcoinScienceLibrary() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <ScrollToHash />

      <main className="pt-28 pb-24">
        {/* Page title */}
        <section className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-orange-600 font-semibold mb-4">
            Scientific Bitcoin Institute &nbsp;·&nbsp; Research
          </p>
          <h1 className="font-serif text-5xl md:text-6xl font-semibold text-slate-900 leading-tight">
            Bitcoin Science Library
          </h1>
          <p className="mt-8 text-slate-700 text-lg leading-relaxed max-w-3xl mx-auto">
            The Bitcoin Science Library is a curated collection of the most intellectually serious work on Bitcoin:
            the foundational protocol documents, peer-reviewed scientific papers, rigorous technical books, and
            original research produced by the Institute and its affiliates. It is designed for readers who wish to
            engage with Bitcoin at the level of its mathematical, physical, and economic foundations — not as an
            investment thesis or a technology trend, but as a scientific subject. This library will grow over time;
            inclusion is by selection, not by comprehensiveness.
          </p>
        </section>

        {/* Table of Contents */}
        <nav
          aria-label="Library sections"
          className="max-w-3xl mx-auto mt-12 px-6"
        >
          <div className="rounded-lg border border-slate-200 bg-white px-6 py-5 shadow-sm">
            <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-3">
              Contents
            </p>
            <ol className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-700">
              {sections.map((section, i) => (
                <li key={section.id} className="flex items-center gap-2">
                  <span className="text-orange-500 font-mono text-xs">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <a
                    href={`#${section.id}`}
                    className="hover:text-orange-600 transition-colors"
                  >
                    {section.title}
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </nav>

        <SectionDivider />

        {/* Sections */}
        <div className="max-w-3xl mx-auto px-6">
          {sections.map((section, i) => (
            <div key={section.id}>
              <section id={section.id} className="scroll-mt-28">
                <p className="text-xs uppercase tracking-[0.2em] text-orange-600 font-semibold mb-3 font-mono">
                  Section {i + 1}
                </p>
                <h2 className="font-serif text-3xl md:text-4xl font-semibold text-slate-900 mb-8 leading-tight">
                  {section.title}
                </h2>
                <div className="space-y-6">
                  {section.entries.map((entry, idx) => (
                    <LibraryCard key={idx} entry={entry} />
                  ))}
                </div>
              </section>
              {i < sections.length - 1 && <SectionDivider />}
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  )
}
