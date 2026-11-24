import { useId } from 'react'
import { COPY } from '../lib/site.js'

// The Buttondown subscribe form on its own. Each instance gets its own input
// id, so two forms can sit on one page (the home page has two).
export function SignupForm({ className = '' }) {
  const id = useId()
  return (
    <form
      action="https://buttondown.com/api/emails/embed-subscribe/gsantostasi"
      method="post"
      target="popupwindow"
      onSubmit={() => window.open('https://buttondown.com/gsantostasi', 'popupwindow')}
      className={`flex flex-col sm:flex-row gap-3 max-w-xl mx-auto ${className}`}
    >
      <label htmlFor={id} className="sr-only">
        Email address
      </label>
      <input
        type="email"
        name="email"
        id={id}
        required
        placeholder="your@email.com"
        className="flex-1 min-w-0 px-4 py-3 rounded-lg border border-slate-300 text-base text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
      />
      <button
        type="submit"
        className="bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
      >
        Subscribe
      </button>
    </form>
  )
}

export function SignupFootnote({ className = '' }) {
  return <p className={`italic text-slate-500 text-xs ${className}`}>{COPY.signupFootnote}</p>
}

export default function NewsletterSignup() {
  return (
    <section className="px-6">
      <div className="max-w-3xl mx-auto mt-16 rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 to-white p-8 md:p-12 shadow-sm text-center">
        <p className="text-xs uppercase tracking-wider text-orange-600 font-semibold font-mono">
          {COPY.signupEyebrow}
        </p>
        <h2 className="font-serif text-3xl md:text-4xl font-semibold text-slate-900 leading-tight mt-3">
          {COPY.signupHeading}
        </h2>
        <p className="text-slate-700 text-base md:text-lg leading-relaxed max-w-xl mx-auto mt-5">
          {COPY.signupBody}
        </p>

        <SignupForm className="mt-8" />

        <SignupFootnote className="mt-4" />
      </div>
    </section>
  )
}
