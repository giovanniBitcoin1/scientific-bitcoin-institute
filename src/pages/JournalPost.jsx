import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import events from '../data/journalEvents.js'

function parseIsoDate(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function formatLongDateUpper(iso) {
  return parseIsoDate(iso)
    .toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    .toUpperCase()
}

// Extract the YouTube video id from a watch / youtu.be / embed URL.
function youtubeId(url) {
  const patterns = [
    /[?&]v=([^?&]+)/,
    /youtu\.be\/([^?&]+)/,
    /youtube\.com\/embed\/([^?&]+)/,
  ]
  for (const re of patterns) {
    const m = url.match(re)
    if (m) return m[1]
  }
  return null
}

// True for local/hosted video files we can play with a <video> tag.
function isVideoFile(url) {
  return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url)
}

const orangeLink =
  'text-orange-600 hover:text-orange-700 hover:underline transition-colors font-semibold'

function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="pt-28 pb-24">
        <section className="max-w-2xl mx-auto px-6 text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-orange-600 font-semibold mb-4 font-mono">
            Scientific Bitcoin Institute &nbsp;·&nbsp; Event Journal
          </p>
          <h1 className="font-serif text-4xl md:text-5xl font-semibold text-slate-900 leading-tight">
            Event not found
          </h1>
          <p className="mt-6 text-slate-700 leading-relaxed">
            We couldn't find the event you were looking for. It may have moved or never existed.
          </p>
          <Link to="/news/journal" className={`inline-block mt-6 ${orangeLink}`}>
            ← Back to the Event Journal
          </Link>
        </section>
      </main>
      <Footer />
    </div>
  )
}

function LangToggle({ lang, setLang }) {
  return (
    <div className="inline-flex rounded-full border border-slate-200 bg-white p-1 text-xs font-mono uppercase tracking-wider">
      {['en', 'it'].map((code) => (
        <button
          key={code}
          onClick={() => setLang(code)}
          className={
            'px-4 py-1.5 rounded-full transition-colors ' +
            (lang === code
              ? 'bg-orange-500 text-white'
              : 'text-slate-600 hover:text-orange-600')
          }
        >
          {code}
        </button>
      ))}
    </div>
  )
}

function Lightbox({ images, index, setIndex }) {
  if (index === null) return null
  const close = () => setIndex(null)
  const prev = (e) => {
    e.stopPropagation()
    setIndex((index - 1 + images.length) % images.length)
  }
  const next = (e) => {
    e.stopPropagation()
    setIndex((index + 1) % images.length)
  }
  return (
    <div
      className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4"
      onClick={close}
    >
      <button
        onClick={close}
        className="absolute top-5 right-6 text-white/80 hover:text-white text-3xl leading-none"
        aria-label="Close"
      >
        ×
      </button>
      {images.length > 1 && (
        <button
          onClick={prev}
          className="absolute left-4 md:left-8 text-white/80 hover:text-white text-4xl px-3"
          aria-label="Previous"
        >
          ‹
        </button>
      )}
      <img
        src={images[index].src}
        alt={images[index].alt}
        className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg"
        onClick={(e) => e.stopPropagation()}
      />
      {images.length > 1 && (
        <button
          onClick={next}
          className="absolute right-4 md:right-8 text-white/80 hover:text-white text-4xl px-3"
          aria-label="Next"
        >
          ›
        </button>
      )}
    </div>
  )
}

export default function JournalPost() {
  const { slug } = useParams()
  const event = events.find((e) => e.slug === slug)
  const [lang, setLang] = useState('en')
  const [lightbox, setLightbox] = useState(null)

  const title = event ? (lang === 'en' ? event.title_en : event.title_it) : ''

  useEffect(() => {
    if (!event) return
    document.title = `${event.title_en} — Event Journal — Scientific Bitcoin Institute`
    const meta = document.querySelector('meta[name="description"]')
    if (meta) meta.setAttribute('content', event.summary_en)
  }, [event])

  if (!event) return <NotFound />

  const summary = lang === 'en' ? event.summary_en : event.summary_it
  const highlights = lang === 'en' ? event.highlights_en : event.highlights_it
  const pullQuote = lang === 'en' ? event.pull_quote_en : event.pull_quote_it
  const isUpcoming = event.status === 'upcoming'
  const galleryImages = (event.gallery || []).map((g) => ({
    src: g.src,
    alt: (lang === 'en' ? g.alt_en : g.alt_it) || event.title_en,
  }))

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="pt-28 pb-24">
        <article className="max-w-4xl mx-auto px-6">
          {/* Top bar: back link + language toggle */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <Link to="/news/journal" className={orangeLink}>
              ← Event Journal
            </Link>
            <LangToggle lang={lang} setLang={setLang} />
          </div>

          {/* Cover */}
          <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
            <img
              src={event.cover_image}
              alt={event.title_en}
              className="w-full h-full object-cover"
            />
            <span
              className={
                'absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold font-mono uppercase tracking-wider ' +
                (isUpcoming ? 'bg-orange-500 text-white' : 'bg-white/90 text-slate-700')
              }
            >
              {isUpcoming ? 'Upcoming' : 'Past'}
            </span>
          </div>

          {/* Title block */}
          <header className="mt-8">
            <p className="text-xs uppercase tracking-wider text-orange-600 font-semibold font-mono">
              {formatLongDateUpper(event.date)} &nbsp;·&nbsp; {event.location}
              {event.type ? <> &nbsp;·&nbsp; {event.type}</> : null}
            </p>
            <h1 className="font-serif text-4xl md:text-5xl font-semibold text-slate-900 leading-tight mt-3">
              {title}
            </h1>
            <p className="mt-5 text-slate-700 text-lg leading-relaxed">{summary}</p>
          </header>

          {/* Highlights */}
          {highlights && highlights.length > 0 && (
            <section className="mt-10 bg-white rounded-xl border border-slate-200 p-6 md:p-8">
              <p className="text-xs uppercase tracking-wider text-orange-600 font-semibold font-mono">
                {lang === 'en' ? 'Highlights' : 'Punti salienti'}
              </p>
              <ul className="mt-4 space-y-2.5">
                {highlights.map((h, i) => (
                  <li key={i} className="flex gap-3 text-slate-700 leading-relaxed">
                    <span className="text-orange-500 mt-1">●</span>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Pull quote */}
          {pullQuote && (
            <blockquote className="mt-10 border-l-4 border-orange-500 pl-6 py-2">
              <p className="font-serif text-2xl md:text-3xl text-slate-900 italic leading-snug">
                “{pullQuote}”
              </p>
            </blockquote>
          )}

          {/* People met */}
          {event.people_met && event.people_met.length > 0 && (
            <section className="mt-10">
              <p className="text-xs uppercase tracking-wider text-orange-600 font-semibold font-mono">
                {lang === 'en' ? 'People met' : 'Persone incontrate'}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {event.people_met.map((p, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-full bg-white border border-slate-200 text-sm text-slate-700"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Gallery */}
          {galleryImages.length > 0 && (
            <section className="mt-12">
              <p className="text-xs uppercase tracking-wider text-orange-600 font-semibold font-mono">
                {lang === 'en' ? 'Gallery' : 'Galleria'}
              </p>
              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                {galleryImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setLightbox(i)}
                    className="block aspect-[4/3] rounded-lg overflow-hidden bg-slate-100 border border-slate-200 group"
                  >
                    <img
                      src={img.src}
                      alt={img.alt}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Videos */}
          {event.videos && event.videos.length > 0 && (
            <section className="mt-12">
              <p className="text-xs uppercase tracking-wider text-orange-600 font-semibold font-mono">
                {lang === 'en' ? 'Video' : 'Video'}
              </p>
              <div className="mt-4 space-y-8">
                {event.videos.map((item, i) => {
                  // A video may be a plain URL string or an object with a url
                  // plus localized titles.
                  const url = typeof item === 'string' ? item : item.url
                  const title =
                    typeof item === 'string'
                      ? null
                      : lang === 'en'
                        ? item.title_en
                        : item.title_it

                  let player = null
                  if (isVideoFile(url)) {
                    player = (
                      <video className="w-full h-full" src={url} controls preload="metadata">
                        {lang === 'en'
                          ? 'Your browser does not support the video tag.'
                          : 'Il tuo browser non supporta il tag video.'}
                      </video>
                    )
                  } else {
                    const id = youtubeId(url)
                    if (id) {
                      player = (
                        <iframe
                          className="w-full h-full"
                          src={`https://www.youtube.com/embed/${id}`}
                          title={title || `${event.title_en} — video ${i + 1}`}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      )
                    }
                  }
                  if (!player) return null

                  return (
                    <figure key={i}>
                      <div className="aspect-video rounded-xl overflow-hidden bg-black border border-slate-200">
                        {player}
                      </div>
                      {title && (
                        <figcaption className="mt-2 text-sm text-slate-600">{title}</figcaption>
                      )}
                    </figure>
                  )
                })}
              </div>
            </section>
          )}

          {/* Official links */}
          {event.official_links && event.official_links.length > 0 && (
            <section className="mt-12">
              <p className="text-xs uppercase tracking-wider text-orange-600 font-semibold font-mono">
                {lang === 'en' ? 'Official links' : 'Link ufficiali'}
              </p>
              <ul className="mt-4 space-y-2">
                {event.official_links.map((link, i) => (
                  <li key={i}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={orangeLink}
                    >
                      {link.label} ↗
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <div className="mt-14 pt-8 border-t border-slate-200">
            <Link to="/news/journal" className={orangeLink}>
              ← Back to the Event Journal
            </Link>
          </div>
        </article>
      </main>

      <Lightbox images={galleryImages} index={lightbox} setIndex={setLightbox} />

      <Footer />
    </div>
  )
}
