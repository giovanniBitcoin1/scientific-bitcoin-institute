import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import ScrollToHash from '../components/ScrollToHash.jsx'
import SectionDivider from '../components/SectionDivider.jsx'
import articles, { getAllTags } from '../lib/insights.js'
import { resolveInsightImage } from '../lib/insightImages.js'

function ArticleCard({ article }) {
  const heroUrl = resolveInsightImage(article.slug, article.heroImage)
  return (
    <Link
      to={`/insights/${article.slug}`}
      className="group bg-white border border-slate-200 rounded-lg overflow-hidden hover:border-orange-300 hover:shadow-md transition flex flex-col"
    >
      <div className="aspect-[16/9] bg-slate-100 overflow-hidden">
        {heroUrl ? (
          <img
            src={heroUrl}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : null}
      </div>
      <div className="p-6 flex-1 flex flex-col">
        <span className="inline-block self-start bg-slate-100 text-slate-600 text-xs font-medium uppercase tracking-wider px-3 py-1 rounded-full">
          Explainer
        </span>
        <h3 className="font-serif text-xl mt-3 text-slate-900 leading-snug">{article.title}</h3>
        <p className="text-slate-600 text-sm mt-2 line-clamp-3">
          {article.subtitle || article.summary}
        </p>
        {article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="bg-slate-100 text-slate-600 text-xs px-2.5 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        <p className="text-slate-500 text-xs mt-auto pt-4">
          {article.formattedDate} · {article.readingTime}
        </p>
      </div>
    </Link>
  )
}

export default function Insights() {
  useEffect(() => {
    document.title = 'Insights — Scientific Bitcoin Institute'
    const meta = document.querySelector('meta[name="description"]')
    if (meta) {
      meta.setAttribute(
        'content',
        "Accessible explainers from the Scientific Bitcoin Institute on Bitcoin, complex systems, and the wider mathematical-financial landscape.",
      )
    }
  }, [])

  // Tag filters: data ready, UI to be added later.
  const allTags = getAllTags()

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <ScrollToHash />

      <main className="pt-28 pb-24">
        {/* Page header */}
        <section className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-xs uppercase tracking-wider text-orange-600 font-semibold font-mono">
            Scientific Bitcoin Institute · Insights
          </p>
          <h1 className="font-serif text-5xl md:text-6xl font-semibold text-slate-900 leading-tight mt-4">
            Insights
          </h1>
          <p className="text-slate-700 text-base leading-relaxed mt-6 max-w-2xl mx-auto">
            Accessible explainers from the Scientific Bitcoin Institute on Bitcoin, complex systems,
            and the wider mathematical-financial landscape. Insights articles synthesize current
            developments through the lens of the Institute's research, written for a general
            audience. They are educational analysis, distinct from the Institute's peer-reviewed
            publications.
          </p>
          <p className="text-slate-600 text-sm mt-4 max-w-2xl mx-auto">
            For the Institute's peer-reviewed research, see{' '}
            <Link to="/research/publications" className="text-orange-600 hover:text-orange-700 underline">
              Publications
            </Link>
            .
          </p>
        </section>

        <SectionDivider />

        {/* Articles grid */}
        <section className="max-w-6xl mx-auto px-6">
          {articles.length === 0 ? (
            <p className="text-slate-600 text-center">Insights coming soon.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.map((article) => (
                <ArticleCard key={article.slug} article={article} />
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  )
}
