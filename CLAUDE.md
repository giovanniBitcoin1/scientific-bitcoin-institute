# Scientific Bitcoin Institute — website

React + Vite + Tailwind single-page site. Routes in `src/App.jsx`, pages in
`src/pages/`, shared chrome in `src/components/` (`Header.jsx`, `Footer.jsx`),
content data in `src/data/`. Nav is data-driven from `src/data/nav.json` plus
the `submenuHrefs` map in `src/components/Header.jsx`.

## Design system

- **Accent color:** orange `#f97316` (Tailwind `orange-500` / `orange-600`).
- **Headings:** Crimson Pro — `font-serif`.
- **Body:** IBM Plex Sans — `font-sans` (default).
- **Eyebrows:** IBM Plex Mono — `font-mono`, uppercase, orange, tracked-out
  (e.g. `text-xs uppercase tracking-wider text-orange-600 font-semibold font-mono`).
- **Cards:** white background, `border border-slate-200`, rounded, soft shadow.
- **Page shell:** `bg-slate-50`, `<Header />` … `<main className="pt-28 pb-24">` … `<Footer />`.
- **SEO:** do NOT use react-helmet-async. Set `document.title` and the
  `meta[name="description"]` tag inside a `useEffect`.

Fonts are loaded in `index.html` and mapped in `tailwind.config.js`.

## Event Journal (`/news/journal`)

The Event Journal is a **visual diary of the Institute's conferences and
events** — past ones (with photos and video) and upcoming ones. It is NOT a
blog, essay collection, or academic article feed. There is no "author" byline
and no long-form body text. Do not reintroduce the old "The Journal /
essays / explainers" concept or the power-law articles.

**Index** (`src/pages/JournalIndex.jsx`): a responsive grid of event cards,
most-recent first. Each card = large 16:9 cover image, a `Past`/`Upcoming`
badge, a mono eyebrow with date · location, the title, and a 1–2 line summary.
No paragraphs, no author.

**Detail** (`src/pages/JournalPost.jsx`, route `/news/journal/:slug`): large
cover, title, date/location/type, short summary, highlights list, pull quote,
people-met chips, photo gallery with a lightbox, embedded YouTube videos, and
official links. An **EN/IT language toggle** (`useState`, default `en`)
switches only the `*_en` / `*_it` fields.

### Data

One JSON file per event in `src/data/journal/`. They are auto-loaded and
sorted (newest first) by `src/data/journalEvents.js` via
`import.meta.glob('./journal/*.json', { eager: true })`. Add an event by
dropping a new JSON file — no wiring needed.

Event schema:

```
slug, status ("past" | "upcoming"), date (ISO "YYYY-MM-DD"), location, type,
cover_image, title_en, title_it, summary_en, summary_it,
highlights_en[], highlights_it[], people_met[],
gallery[] ({ src, alt_en, alt_it }),
videos[] — each item is either a plain URL string or an object
  { url, title_en, title_it } (the localized title is shown as a caption).
  URLs may be YouTube (watch, youtu.be short links, or embed — the id is
  extracted and embedded as a responsive iframe) or local file paths like
  /assets/.../clip.mp4 (.mp4/.webm/.ogg/.mov rendered with a <video controls> tag),
official_links[] ({label, url}), pull_quote_en, pull_quote_it
```

Images live in `public/assets/journal/` (placeholder SVGs for now). Current
events: `san-marino` (past), `lac-lugano` (upcoming), `plan-b-forum` (upcoming).
