import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import events from '../data/journalEvents.js'

// Assets live in public/sbi-event-globe/ and are served from /sbi-event-globe/.
// Nothing under public/ gets a fingerprinted filename, so the engine and its
// stylesheet carry a ?v= hash of their own contents, injected by vite.config.js,
// to keep a stale copy from surviving a deploy. three.min.js is a pinned vendor
// build that never changes, so it is left cacheable as-is.
const CSS_HREF = `/sbi-event-globe/sbi-event-globe.css?v=${__SBIG_CSS_HASH__}`
const THREE_SRC = '/sbi-event-globe/three.min.js'
const ENGINE_SRC = `/sbi-event-globe/sbi-event-globe.js?v=${__SBIG_JS_HASH__}`
const TEXTURES_PATH = '/sbi-event-globe/textures/'

// The pins are derived from the Event Journal, never hand-maintained: `events`
// is the same import.meta.glob list the Journal index and detail pages use, in
// the same ascending chronological order, so a stop's number here is its
// position on that timeline. The engine is a plain <script> in public/ and so
// cannot import anything — it reads this off window.SBI_EVENTS instead.
// The globe's chrome is English-only (no EN/IT toggle), so dates use
// date_display_en.
function journalStops() {
  return events
    .filter((e) => e.coords)
    .map((e, i) => ({
      num: i + 1,
      status: e.status,
      title: e.title_en,
      place: e.place || e.location,
      venue: e.location,
      date: e.date_display_en || e.date,
      lat: e.coords.lat,
      lng: e.coords.lng,
      url: `/news/journal/${e.slug}`,
    }))
}

// Markup from the sbi-event-globe package (snippet.html), minus its <link>/<script>
// tags — those are injected below, because React does not execute <script> in JSX.
const STAGE_HTML = `
<section id="sbi-event-globe">
  <div class="sbig-top">
    <p class="sbig-lead">Follow us around the world</p>
    <div class="sbig-view-toggle" role="group" aria-label="View">
      <button type="button" id="sbigViewGlobe" class="sbig-vbtn sbig-active" aria-pressed="true">Globe</button>
      <button type="button" id="sbigViewMap" class="sbig-vbtn" aria-pressed="false">Map</button>
    </div>
  </div>
  <div class="sbig-stage" id="sbigStage" tabindex="0"
       aria-label="Interactive globe of the Institute's events. Use the arrow keys to rotate, or drag with the mouse. Click a marker to see the events at that stop.">
    <canvas id="sbigCanvas"></canvas>
    <div class="sbig-map" id="sbigMap" hidden></div>
    <div class="sbig-tooltip" id="sbigTooltip" role="tooltip" hidden><b id="sbigTtTitle"></b><span id="sbigTtMeta"></span></div>
    <aside class="sbig-card" id="sbigCard" hidden aria-live="polite">
      <button class="sbig-close" id="sbigCardClose" aria-label="Close event details">&times;</button>
      <h2 id="sbigCardPlace"></h2>
      <div id="sbigCardRows"></div>
    </aside>
    <div class="sbig-zoom">
      <button type="button" class="sbig-zbtn" id="sbigZoomIn" aria-label="Zoom in">+</button>
      <button type="button" class="sbig-zbtn" id="sbigZoomOut" aria-label="Zoom out">&minus;</button>
    </div>
  </div>
  <p class="sbig-legend">
    <span><span class="sbig-dot sbig-dot-past"></span>Where the Institute has been</span>
    <span><span class="sbig-dot sbig-dot-next"></span>Upcoming events</span>
  </p>
</section>`

// The engine is a self-running IIFE with no teardown hook: it grabs its nodes by
// id the moment it runs, then owns a WebGL context and a rAF loop for the life of
// the page. So we build its DOM and boot it exactly once, and park that subtree in
// a hidden holder — still inside the document, so the ids stay resolvable — while
// the Journal is unmounted. Re-mounting moves the same globe back instead of
// booting a second one, which would leak a WebGL context per visit.
let stage = null
let holder = null
let booted = false

function park() {
  if (!holder) {
    holder = document.createElement('div')
    holder.style.display = 'none'
    document.body.appendChild(holder)
  }
  return holder
}

function loadScript(src, dataset) {
  return new Promise((resolve, reject) => {
    const el = document.createElement('script')
    el.src = src
    if (dataset) Object.assign(el.dataset, dataset)
    el.onload = resolve
    el.onerror = () => reject(new Error(`EventGlobe: failed to load ${src}`))
    document.body.appendChild(el)
  })
}

// Loads three.js and then the engine, which boots itself against the markup.
function boot() {
  if (booted) return
  booted = true
  const three = window.THREE ? Promise.resolve() : loadScript(THREE_SRC)
  three
    .then(() => loadScript(ENGINE_SRC, { assets: TEXTURES_PATH }))
    .catch((err) => {
      booted = false
      console.error(err)
    })
}

export default function EventGlobe() {
  const hostRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const host = hostRef.current
    if (!host) return undefined

    // Hand the engine its data before it can run. Set on every mount so a
    // parked globe that is re-shown still matches the current Journal.
    window.SBI_EVENTS = journalStops()

    if (!document.querySelector(`link[data-sbig-css="true"]`)) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = CSS_HREF
      link.dataset.sbigCss = 'true'
      document.head.appendChild(link)
    }

    if (!stage) {
      const tpl = document.createElement('div')
      tpl.innerHTML = STAGE_HTML.trim()
      stage = tpl.firstElementChild
    }
    host.appendChild(stage)

    // The engine renders "View event →" as a real <a href="/news/journal/…">, so
    // it still works without JS and honours middle- and modifier-click. Plain
    // left-clicks are routed through React Router instead, which avoids a full
    // reload — on GitHub Pages a hard navigation detours through 404.html.
    const onClick = (e) => {
      const a = e.target.closest('a.sbig-view')
      if (!a) return
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return
      }
      const href = a.getAttribute('href')
      if (!href || !href.startsWith('/')) return
      e.preventDefault()
      navigate(href)
    }
    stage.addEventListener('click', onClick)

    // three.js plus the engine and its textures are ~2 MB, so they are fetched
    // only once the block is about to come into view. The markup above is mounted
    // right away, so the section already occupies its full height from the package
    // stylesheet and nothing shifts when the globe finally paints.
    let observer = null
    if (!booted) {
      if (typeof IntersectionObserver === 'undefined') {
        boot()
      } else {
        observer = new IntersectionObserver(
          (entries) => {
            if (entries.some((e) => e.isIntersecting)) {
              observer.disconnect()
              observer = null
              boot()
            }
          },
          { rootMargin: '300px' }, // start loading just before it is scrolled to
        )
        observer.observe(host)
      }
    }

    // Park the globe instead of destroying it, so it survives navigation.
    return () => {
      if (observer) observer.disconnect()
      if (stage) {
        stage.removeEventListener('click', onClick)
        park().appendChild(stage)
      }
    }
  }, [navigate])

  return <div ref={hostRef} />
}
