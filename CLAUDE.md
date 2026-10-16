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

**Index** (`src/pages/JournalIndex.jsx`): a responsive grid of event cards in
a single ascending chronological timeline (see **Index order** below). Each card = large 16:9
cover image, a `Past`/`Upcoming` badge, a mono eyebrow with date · location, the
title, and a 1–2 line summary. No paragraphs, no author.

**Detail** (`src/pages/JournalPost.jsx`, route `/news/journal/:slug`): large
cover, title, date/location/type, short summary, highlights list, pull quote,
people-met chips, photo gallery with a lightbox, embedded YouTube videos, and
official links. An **EN/IT language toggle** (`useState`, default `en`)
switches only the `*_en` / `*_it` fields.

### Data

One JSON file per event in `src/data/journal/`. They are auto-loaded and
ordered by `src/data/journalEvents.js` via
`import.meta.glob('./journal/*.json', { eager: true })`. Add an event by
dropping a new JSON file — no wiring needed.

### Index order

`/news/journal` is **one single chronological timeline, ascending — oldest
first, newest last — with no exceptions**. This is a diary: it reads front to
back, like turning the pages in order. Implemented by the sort in
`src/data/journalEvents.js`:

```js
.sort((a, b) => new Date(a.date) - new Date(b.date))
```

`status` does **not** affect ordering. Upcoming events are not pinned to the
top and are not a separate block — they simply fall at the end because their
dates are in the future, and the `Upcoming` badge is what marks them. Do not
reintroduce "most-recent first", "newest first", or an "upcoming on top"
grouping. The `date_display_*` fields are display strings only and never
affect order.

Event schema:

```
slug, status ("past" | "upcoming"), date (ISO "YYYY-MM-DD"),
date_display_en, date_display_it, location, place, coords {lat, lng}, type,
cover_image, title_en, title_it, summary_en, summary_it,
highlights_en[], highlights_it[], people_met[],
gallery[] ({ src, alt_en, alt_it }),
videos[] — each item is either a plain URL string or an object
  { url, title_en, title_it, poster } (the localized title is shown as a
  caption; `poster` is optional — a still shown before playback, ignored for
  YouTube embeds and omitted entirely when the field is absent).
  URLs may be YouTube (watch, youtu.be short links, or embed — the id is
  extracted and embedded as a responsive iframe) or local file paths like
  /assets/.../clip.mp4 (.mp4/.webm/.ogg/.mov rendered with a <video controls> tag),
official_links[] ({label, url} — or {label_en, label_it, url} for a label
  that follows the EN/IT toggle; `label` is the fallback),
pull_quote_en, pull_quote_it, pull_quote_by (optional)
```

`pull_quote_*` hold only the quoted words. The speaker goes in
`pull_quote_by` (e.g. `"Giovanni Santostasi"`), rendered as "— Name" on its
own line outside the quote marks. Never append "— Name" to the quote text.

`summary_*` may hold several paragraphs separated by a blank line (`\n\n`):
the detail page renders each as its own `<p>`, while the index card and the
meta description use only the first. An `official_links` URL starting with
`/` is a site-internal link and opens in the same tab via `<Link>`.

`date_display_en` / `date_display_it` are **required on every event** and carry
the human-readable date shown in the card and detail eyebrows, replacing the
date auto-formatted from `date`. Keep both in sync with the real span:

- EN: `"June 5, 2026"`, multi-day `"August 27–28, 2026"` (en dash).
- IT: `"5 giugno 2026"`, multi-day `"27–28 agosto 2026"` (en dash).

The index is English-only, so it always renders `date_display_en`; the detail
page follows the EN/IT toggle. Without them the date falls back to an
auto-format in the active locale. Never use a single shared `date_display` —
an Italian string then leaks into the English index. These are display strings
only: `date` stays the ISO first day of the event and alone drives sort order.

### Event globe / map

The "Follow us around the world" globe on `/news/journal` is **generated from
these same JSON files — never hand-maintained**. `src/components/EventGlobe.jsx`
reads `journalEvents.js` (the same `import.meta.glob` list the Journal pages
use), numbers each stop by its position on the ascending timeline, and hands the
result to the engine on `window.SBI_EVENTS`. The engine
(`public/sbi-event-globe/sbi-event-globe.js`) is a plain script in `public/`, so
it cannot import anything — that global is the only way data reaches it. Never
add a stop to the engine's arrays by hand.

Each pin is **one city**, grouped on the `place` field (not on a distance
threshold, which merged genuinely different cities such as San Marino and
Cervia). A city with several events shows them all in its popup, each with its
own number and link. A pin is filled when the city has at least one `past`
event and hollow when all of its events are upcoming, matching the legend.

So **every new event needs `place` and `coords`**, or it gets no pin:

- `place` — short city name, also the popup heading and the grouping key
  (`"Lugano"`, `"Prague"`). Not derivable from `location`, whose format varies.
- `coords` — `{"lat": 46.0021, "lng": 8.9440}`, the venue's real position.

The globe's chrome is English-only (no EN/IT toggle), so popups use
`date_display_en` and `title_en`.

The map derives from the Journal **100%, with no exceptions**: there is no
supplementary list of stops in the engine, and a stop without a JSON file in
`src/data/journal/` gets no pin. To put a place on the map, give it a Journal
entry.

Nothing under `public/` is fingerprinted by Vite, so the engine and its
stylesheet would stay cached in browsers across deploys. `vite.config.js` hashes
both files and exposes `__SBIG_JS_HASH__` / `__SBIG_CSS_HASH__`, which
`EventGlobe.jsx` appends as `?v=` — automatic, so there is no version number to
remember to bump, and the URL only moves when the file actually changes. The
hashes are read when the config loads: **restart `npm run dev` after editing
either file**.

### Checklist for a new event

1. `src/data/journal/<slug>.json` with the full schema above — including
   `date_display_en` / `date_display_it`, `place` and `coords`.
2. Assets in `public/assets/journal/<slug>/` (cover plus gallery and videos),
   or a placeholder SVG cover in `public/assets/journal/`.
3. Nothing else to wire: the index card, the detail route and the globe pin all
   appear on their own.

Images live in `public/assets/journal/`, one folder per event slug. Current
events: `bitcoin-asia-hong-kong`, `franklin-university-lugano`, `btc-prague`,
`bitcoin-corporate-day`, `cervia`, `san-marino` (all past), `lac-lugano` and
`plan-b-forum` (upcoming).

## Complexity Lab (`/lab`)

An independent SBI course on complex systems: short lectures plus
slider-driven simulations. Both routes are lazy-loaded in `src/App.jsx`, so
lab code ships in its own chunk. Not yet linked from the nav.

- `src/pages/lab/` — `LabIndex.jsx` (`/lab`), `LabChapter.jsx` (`/lab/:slug`).
- `src/data/lab/modules.json` — ordered module list: `slug`, `number` ("01"),
  `status` (`"ready"` | `"coming-soon"`), `title_en/it`, `summary_en/it`.
- `src/content/lab/<slug>.en.md` / `.it.md` — lecture text. A line holding
  only `<!-- simulation -->` splits it: the lecture before, then the sim, then
  the part after ("What to observe", "Further reading"). Other HTML comments
  (e.g. `<!-- DRAFT … -->`) are stripped. Display equations go in ```` ```math ````
  fences, inline ones in backticks — no math library.
- `src/components/lab/` — shared pieces: `Slider.jsx` (supports `log`),
  `SimControls.jsx` (Play/Pause, Step, Reset), `useAnimationLoop.js`, `rng.js`
  (seeded mulberry32), `LangToggle.jsx`, `useLabLang.js` (EN/IT, remembered in
  localStorage `sbi_lab_lang`).
- `src/components/lab/sims/` — one component per module plus `index.js`, the
  slug → component registry. Sims take a `lang` prop.

**Adding a module:** set its `status` to `"ready"` in `modules.json`, write
the two markdown files, build the sim in `sims/`, register it in
`sims/index.js`. A coming-soon or unknown slug shows a friendly "not
available" page.

Sims are plain React + canvas 2D (recharts for simple line plots), with no
physics/math libraries; anything random uses the seeded RNG in `rng.js` so
runs are reproducible. Heavy computations run progressively across animation
frames so the UI never freezes, and every sim must fit a 375px-wide screen
without horizontal scroll.

**Originality:** all lecture text is original, written from scratch in our
own words — never copy or closely paraphrase any book. No book PDFs or
third-party course material may ever be committed to this public repo.
