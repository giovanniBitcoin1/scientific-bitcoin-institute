import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import ScrollToHash from '../components/ScrollToHash.jsx'
import SectionDivider from '../components/SectionDivider.jsx'

const ZIP_HASH = '78a917aecd3c37151a8cc2297d377e397429392a5a92b48f72e4cd9fbc3aaf9f'

const DOWNLOADS = [
  {
    href: '/seed-tool/downloads/SBI-Physical-Entropy-Seed-Kit-v1.2.zip',
    name: 'SBI-Physical-Entropy-Seed-Kit-v1.2.zip',
    note: '(complete kit, recommended)',
    hash: '78a917aecd3c37151a8cc2297d377e397429392a5a92b48f72e4cd9fbc3aaf9f',
  },
  {
    href: '/seed-tool/downloads/sbi-physical-entropy-seed-tool.html',
    name: 'sbi-physical-entropy-seed-tool.html',
    note: '(browser app)',
    hash: 'a8615bebf4e556a6efd46651655ad857673f11c4cddd85abe7bf6c16cb4d3929',
  },
  {
    href: '/seed-tool/downloads/sbi_seed_tool.py',
    name: 'sbi_seed_tool.py',
    note: '(Python app)',
    hash: 'e5975e5bc6e454fe6cfaaa040c15dba533d10c4847183d1b8220034e62354259',
  },
  {
    href: '/seed-tool/downloads/worksheet.html',
    name: 'worksheet.html',
    note: '(printable worksheet)',
    hash: '66edda925df8e9039735dcad1f8ecfdfa787f593d2056c962b633e6adb161d6e',
  },
  {
    href: '/seed-tool/downloads/wordlist-printable.html',
    name: 'wordlist-printable.html',
    note: '(printable BIP-39 list)',
    hash: '6e917ba34f422f82234545aec40195983a7f0e5d7b31664689e99237758c45e4',
  },
  {
    href: '/seed-tool/downloads/english.txt',
    name: 'english.txt',
    note: '(BIP-39 word list)',
    hash: '2f5eed53a4727b4bf8880d8f3f199efc90e58503646d9ff8eff3a2ed3b24dbda',
  },
  {
    href: '/seed-tool/downloads/README.md',
    name: 'README.md',
    note: '(kit documentation)',
    hash: 'de225789a65d42b1f4d1e6e5a3ee2dc499d45868cc5508b24684a12423c8b430',
  },
]

const STEPS = [
  {
    num: '01',
    title: 'Download and verify',
    body: "Download the kit and confirm its SHA-256 hash matches what's published on this page. This proves you have the exact file we published, unmodified in transit.",
  },
  {
    num: '02',
    title: 'Go offline',
    body: 'Copy the kit to a computer with networking disabled — a live-USB Linux session is best. Flip 128 or 256 coins for a 12-word or 24-word seed, or roll 50 or 99 dice for the equivalent.',
  },
  {
    num: '03',
    title: 'Enter and verify',
    body: 'Enter your flips into either app in the kit. Write the words on paper. Cross-verify by entering the same flips into the second edition; the words must match exactly.',
  },
]

export default function SeedTool() {
  useEffect(() => {
    document.title = 'Physical Entropy Seed Tool — Scientific Bitcoin Institute'
    const meta = document.querySelector('meta[name="description"]')
    if (meta) {
      meta.setAttribute(
        'content',
        'Generate your Bitcoin seed from coin flips or dice, with tools that contain no random number generator at all. Download the Scientific Bitcoin Institute Physical Entropy Seed Kit.'
      )
    }
  }, [])

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <ScrollToHash />

      <main className="pt-28 pb-24 px-6">
        {/* Hero */}
        <section className="max-w-4xl mx-auto text-center">
          <img
            src="/assets/logo.jpg"
            alt="Scientific Bitcoin Institute"
            className="w-16 h-16 object-contain mx-auto"
          />
          <p className="text-xs uppercase tracking-wider text-orange-600 font-semibold font-mono mt-6">
            Scientific Bitcoin Institute · Seed Tool
          </p>
          <h1 className="font-serif text-4xl md:text-5xl font-semibold text-slate-900 mt-4">
            Physical Entropy Seed Tool
          </h1>
          <p className="text-slate-700 text-lg md:text-xl mt-6 max-w-3xl mx-auto leading-relaxed">
            Generate your Bitcoin seed from coin flips or dice — with tools that contain no random
            number generator at all.
          </p>

          {/* Primary download */}
          <div className="mt-10">
            <a
              href="/seed-tool/downloads/SBI-Physical-Entropy-Seed-Kit-v1.2.zip"
              download="SBI-Physical-Entropy-Seed-Kit-v1.2.zip"
              className="inline-block bg-orange-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-orange-700 transition-colors"
            >
              Download the Kit (v1.2, ZIP)
            </a>
            <p className="font-mono text-xs text-slate-600 text-center mt-4 break-all">
              SHA-256: {ZIP_HASH}
            </p>
            <p className="text-slate-500 text-xs italic mt-1">
              Verify before use: sha256sum SBI-Physical-Entropy-Seed-Kit-v1.2.zip
            </p>
          </div>
        </section>

        <SectionDivider />

        {/* Why physical entropy */}
        <section className="max-w-3xl mx-auto">
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-slate-900">
            Why physical entropy
          </h2>
          <div className="text-slate-700 space-y-4 mt-6">
            <p>
              Software random number generators have failed repeatedly and invisibly. The Android
              SecureRandom bug in 2013, the Trust Wallet 32-bit entropy vulnerability in 2023, the
              Libbitcoin Milk Sad flaw in the same year, and the Coldcard firmware defect that
              enabled a ~$70M theft from 1,196 addresses in 41 minutes on July 30, 2026 — all shared
              one property. All the seeds looked random.
            </p>
            <p>
              Physical entropy you produce yourself, converted by deterministic and independently
              verifiable arithmetic, removes the entire trust problem. A coin in your hand cannot be
              backdoored. A pair of casino dice cannot be poisoned. The kit uses two independent
              implementations (browser and Python) that cross-verify against each other and against
              the BIP-39 standard, so a corruption in any one path is immediately detectable.
            </p>
            <p className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r">
              Coldcard's own advisory confirms that seeds made with 50+ user-supplied dice rolls
              were unaffected by the 2026 flaw. This kit implements that same dice-based method, with
              additional support for coin flips, debiasing, dual-source mixing, and built-in
              self-tests against the official BIP-39 test vectors.
            </p>
          </div>
        </section>

        <SectionDivider />

        {/* How it works */}
        <section className="max-w-4xl mx-auto">
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-slate-900">
            How it works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
            {STEPS.map((step) => (
              <div key={step.num} className="bg-white border border-slate-200 rounded-lg p-6">
                <div className="font-serif text-4xl font-bold text-orange-600">{step.num}</div>
                <h3 className="font-serif text-xl font-semibold mt-3 text-slate-900">
                  {step.title}
                </h3>
                <p className="text-slate-700 text-sm mt-3 leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              to="/seed-tool/guide"
              className="text-orange-600 hover:text-orange-700 underline"
            >
              Read the full safety guide →
            </Link>
          </div>
        </section>

        <SectionDivider />

        {/* Downloads and hashes */}
        <section className="max-w-4xl mx-auto">
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-slate-900">
            Downloads and hashes
          </h2>
          <p className="text-slate-700 mt-6">
            The complete kit is bundled as a ZIP for convenience. Individual files are also available
            for verification and inspection. Every file's SHA-256 hash is published below — verify
            these against your downloads before use.
          </p>

          <div className="max-w-4xl mx-auto mt-8 border border-slate-300 rounded overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300">
                  <th className="px-4 py-3 font-semibold text-slate-900">File</th>
                  <th className="px-4 py-3 font-semibold text-slate-900">SHA-256</th>
                </tr>
              </thead>
              <tbody>
                {DOWNLOADS.map((f) => (
                  <tr key={f.name} className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="px-4 py-3 align-top">
                      <a
                        href={f.href}
                        download
                        className="text-orange-600 hover:text-orange-700 underline break-all"
                      >
                        {f.name}
                      </a>{' '}
                      <span className="text-slate-500 text-xs">{f.note}</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-600 break-all align-top">
                      {f.hash}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <SectionDivider />

        {/* Preview in your browser */}
        <section className="max-w-3xl mx-auto">
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-slate-900">
            Preview in your browser
          </h2>

          <div className="bg-orange-50 border-l-4 border-orange-500 p-6 rounded-r mt-6">
            <p className="text-slate-900 font-semibold mb-2">
              Preview / practice only — never generate a real seed on a live website.
            </p>
            <p className="text-slate-700 text-sm">
              Download the kit and use it on an offline machine for any seed that will hold funds.
              The preview link below is intended only for exploration and practice.
            </p>
          </div>

          <div className="mt-6 text-center">
            <a
              href="/seed-tool/downloads/sbi-physical-entropy-seed-tool.html"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block border border-slate-300 text-slate-700 px-6 py-3 rounded-lg hover:border-orange-300 hover:text-orange-700 transition-colors"
            >
              Open the browser app (preview only)
            </a>
            <p className="text-slate-500 text-xs italic mt-2">
              This will open the same HTML file the kit contains. Do not use for real seeds.
            </p>
          </div>
        </section>

        <SectionDivider />

        {/* Attribution */}
        <section className="max-w-3xl mx-auto text-center">
          <p className="text-slate-600 text-sm leading-relaxed">
            Inspired by 'Do you trust your seed? Don't generate it yourself' from Estudio Bitcoin.
            The Scientific Bitcoin Institute implementation extends this procedure with dice support,
            debiasing, dual-source mixing, built-in self-tests, and a pen-and-paper worksheet.
          </p>
          <p className="mt-4 text-sm">
            <a
              href="https://estudiobitcoin.com/do-you-trust-your-seed-dont-generate-it-yourself/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-600 hover:text-orange-700 underline"
            >
              Read the original Estudio Bitcoin article →
            </a>
          </p>
          <p className="mt-6 text-slate-500 text-xs italic">
            MIT License · Scientific Bitcoin Institute
          </p>
        </section>
      </main>

      <Footer />
    </div>
  )
}
