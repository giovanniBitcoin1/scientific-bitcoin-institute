import { Link } from 'react-router-dom'

// The site's lock treatment, reproduced from the Accademia's members area
// (public/accademia/index.html, .premium-zone.blurred): a "Members area"
// heading with a PRO badge, then the content blurred at 9px and desaturated,
// neither clickable nor selectable, under a dark overlay with a 🔒 tile, a
// heading, a line of text and a violet button. Same wording, EN and IT.
// Purely visual: whatever is passed as children is still in the DOM.
const COPY = {
  en: {
    head: 'Members area',
    sub: 'Advanced content visible only to subscribed members.',
    lockTitle: 'Content reserved for subscribers',
    lockText: (name) => `Unlock the lectures and interactive simulations of the ${name}.`,
    button: 'Subscribe & unlock',
  },
  it: {
    head: 'Area riservata',
    sub: 'Contenuti avanzati visibili solo ai membri iscritti e abbonati.',
    lockTitle: 'Contenuto riservato agli abbonati',
    lockText: (name) => `Sblocca le lezioni e le simulazioni interattive del ${name}.`,
    button: 'Abbonati e sblocca',
  },
}

// `labName` is the lab named in the overlay text (one lock covers all labs).
export default function LockedZone({ lang, labName = 'Complexity Lab', children }) {
  const c = COPY[lang] || COPY.en
  return (
    <div>
      <div className="flex items-center gap-2.5 mb-1.5">
        <h2 className="font-serif text-2xl font-semibold text-slate-900">{c.head}</h2>
        <span className="text-[10.5px] font-extrabold tracking-[0.1em] bg-[#8B7CF6] text-white px-2 py-1 rounded-[7px]">
          PRO
        </span>
      </div>
      <p className="text-sm text-slate-500 mb-5">{c.sub}</p>

      {/* overflow-clip, not hidden, so the overlay text can stay sticky on tall zones */}
      <div className="relative rounded-[18px] overflow-clip">
        <div aria-hidden="true" inert="" className="[filter:blur(9px)_saturate(.7)] pointer-events-none select-none">
          {children}
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(14,17,22,.35),rgba(14,17,22,.72))]">
          <div className="sticky top-28 flex flex-col items-center gap-3.5 text-center px-6 py-16">
            <div className="w-14 h-14 rounded-[18px] bg-[rgba(139,124,246,.14)] border border-[rgba(139,124,246,.4)] flex items-center justify-center text-2xl">
              <span aria-hidden="true">🔒</span>
            </div>
            <h3 className="text-[19px] font-semibold text-[#EEF1F5]">{c.lockTitle}</h3>
            <p className="text-sm text-[#98A2B3] max-w-[340px] leading-relaxed">{c.lockText(labName)}</p>
            <Link
              to="/support/membership"
              className="text-sm font-bold text-white bg-[#8B7CF6] shadow-[0_4px_0_#5A4BC4] px-5 py-[11px] rounded-xl hover:brightness-110 active:scale-[.97] transition"
            >
              {c.button}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
