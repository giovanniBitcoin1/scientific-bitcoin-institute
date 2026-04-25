export default function NewsletterSignup() {
  return (
    <section className="px-6">
      <div className="max-w-3xl mx-auto mt-16 rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 to-white p-8 md:p-12 shadow-sm text-center">
        <p className="text-xs uppercase tracking-wider text-orange-600 font-semibold font-mono">
          Newsletter
        </p>
        <h2 className="font-serif text-3xl md:text-4xl font-semibold text-slate-900 leading-tight mt-3">
          Dispatches from the Scientific Bitcoin Institute
        </h2>
        <p className="text-slate-700 text-base md:text-lg leading-relaxed max-w-xl mx-auto mt-5">
          Get the rigorous side of Bitcoin in your inbox. The Institute's monthly dispatch covers new research,
          publications, and developments in the scientific study of Bitcoin as a complex system. No tracking, no hype.
        </p>

        <form
          action="https://buttondown.com/api/emails/embed-subscribe/gsantostasi"
          method="post"
          target="popupwindow"
          onSubmit={() => window.open('https://buttondown.com/gsantostasi', 'popupwindow')}
          className="mt-8 flex flex-col sm:flex-row gap-3 max-w-xl mx-auto"
        >
          <label htmlFor="bd-email" className="sr-only">
            Email address
          </label>
          <input
            type="email"
            name="email"
            id="bd-email"
            required
            placeholder="your@email.com"
            className="flex-1 px-4 py-3 rounded-lg border border-slate-300 text-base text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
          />
          <button
            type="submit"
            className="bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
          >
            Subscribe
          </button>
        </form>

        <p className="mt-4 italic text-slate-500 text-xs">
          Powered by Buttondown. We don't sell or share your address.
        </p>
      </div>
    </section>
  )
}
