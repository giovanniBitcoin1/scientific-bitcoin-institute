// One module page of one lab: locked and admin, EN and IT, 1280 and 375 px.
//
//   node check-module.mjs <labId> <slug> [--figures n] [--exercises n] [--panels n]
//                         [--dist <dir> | --base <url>] [--chrome <path>] [--quiet]
//
// Checks: lock view (no lecture text, no content chunk requested); admin view
// (lecture, counts of live figures, panels, exercises and canvases, solutions
// open, nothing wider than the viewport, no console errors); at 375 px with a
// touch screen, a swipe over every canvas scrolls the page while Draw is off,
// and does not when a Draw toggle is on. An SVG that a Draw toggle arms is
// marked data-draw-surface and is tested (and counted) as a canvas.
//
// Expected counts come from expect.json ("<labId>/<slug>") or from the flags;
// without either they are only reported.
import { readFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import {
  parseArgs, loadLab, labsLocked, siteFromArgs, launch, newPage, go, bodyText, has, noHScroll, overflowing,
  jsRequests, makeSwipe, settle, reporter, shotPath, sleep, COPY, WIDTHS, LANGS, HERE,
} from './lib.mjs'

const { pos, opt } = parseArgs()
const [labId, slug] = pos
if (!labId || !slug) {
  console.error('Usage: node check-module.mjs <labId> <slug> [--figures n] [--exercises n] [--panels n] [--dist <dir> | --base <url>] [--chrome <path>] [--quiet]')
  process.exit(2)
}
const lab = await loadLab(labId)
const mod = lab.modules.find((m) => m.slug === slug)
if (!mod || mod.status !== 'ready') {
  console.error(`"${slug}" is not a ready module of the ${lab.name}.`)
  process.exit(2)
}
const expectFile = path.join(HERE, 'expect.json')
const expect = { ...((existsSync(expectFile) && JSON.parse(readFileSync(expectFile, 'utf8'))[`${labId}/${slug}`]) || {}) }
for (const key of ['figures', 'exercises', 'panels']) if (typeof opt[key] === 'string') expect[key] = Number(opt[key])

const site = await siteFromArgs(opt)
const browser = await launch(opt)
const { ok, info, finish } = reporter()
const locked = labsLocked()
const URL_ = `${site.url}${lab.basePath}/${slug}`
const mainJs = (await (await fetch(site.url + '/')).text()).match(/src="\/assets\/(index-[^"]+\.js)"/)?.[1]

for (const width of WIDTHS) {
  for (const lang of LANGS) {
    const tag = `[${lab.id}/${slug} ${width} ${lang}]`
    const heading = lab.lectureHeading(slug, lang)
    const ctx = await browser.createBrowserContext()

    // ---- Locked visitor
    if (locked) {
      const p = await newPage(ctx, { width, lang })
      await go(p, URL_)
      const t = await bodyText(p)
      const title = lang === 'en' ? mod.title_en : mod.title_it
      ok(`${tag} locked: title and lock overlay naming the ${lab.name}`, has(t, title) && has(t, COPY.lock[lang]) && has(t, COPY.lockText[lang](lab.name)))
      ok(`${tag} locked: no lecture text on the page`, !heading || !has(t, heading))
      const js = jsRequests(p)
      const allowed = js.every((f) => f === mainJs || /^(LabIndex|LabChapter|AdminBar|LockedZone|registry|useLabAccess|useLabLang|LangToggle)-/.test(f))
      ok(`${tag} locked: no lecture, content or sim chunk requested`, allowed && !js.some((f) => /LabLecture|bitcoin-price/.test(f)), js.join(', '))
      ok(`${tag} locked: no horizontal scroll`, await noHScroll(p))
      ok(`${tag} locked: no console errors`, p.errors.length === 0, p.errors.join(' | '))
      await p.screenshot({ path: shotPath(`module-${lab.id}-${slug}-locked-${width}-${lang}.png`) })
      await p.close()
    }

    // ---- Admin preview
    const touch = width === 375
    const p = await newPage(ctx, { width, lang, admin: true, touch })
    await go(p, URL_, 2500)
    await settle(p)
    const t = await bodyText(p)
    ok(`${tag} admin: lecture shown${locked ? ' with the admin bar' : ''}`, (!heading || has(t, heading)) && (!locked || has(t, COPY.bar[lang])), `heading "${heading}"`)
    const found = await p.evaluate((show) => ({
      figures: document.querySelectorAll('figure').length,
      canvases: document.querySelectorAll('canvas, [data-draw-surface]').length,
      exercises: [...document.querySelectorAll('button')].filter((b) => new RegExp(show, 'i').test(b.innerText)).length,
      panels: document.querySelectorAll('main section .space-y-14 > div').length,
      figureHeights: [...document.querySelectorAll('figure > div')].map((e) => Math.round(e.getBoundingClientRect().height)),
      h2: [...document.querySelectorAll('main h2')].map((h) => h.innerText),
    }), COPY.showSolution)
    info(`${tag} live figures ${found.figures}, panels ${found.panels}, exercises ${found.exercises}, canvases ${found.canvases}; figure heights ${found.figureHeights.join(', ') || '–'} px`)
    for (const key of ['figures', 'panels', 'exercises'])
      if (expect[key] != null) ok(`${tag} admin: ${expect[key]} ${key}`, found[key] === expect[key], `found ${found[key]}`)
    if (width === 1280 && lang === 'en') info(`${tag} sections: ${found.h2.join(' | ')}`)
    ok(`${tag} admin: no horizontal scroll`, await noHScroll(p))
    const wide = await overflowing(p)
    ok(`${tag} admin: nothing sticks out of the viewport`, wide.length === 0, wide.join(' ; '))

    if (found.exercises) {
      await p.$$eval('button', (bs, show) => bs.filter((b) => new RegExp(show, 'i').test(b.innerText)).forEach((b) => b.click()), COPY.showSolution)
      await sleep(300)
      const open = await p.$$eval('button', (bs, hide) => bs.filter((b) => new RegExp(hide, 'i').test(b.innerText)).length, COPY.hideSolution)
      ok(`${tag} admin: all ${found.exercises} solutions open`, open === found.exercises, `open ${open}`)
      ok(`${tag} admin: no horizontal scroll with the solutions open`, await noHScroll(p))
    }

    if (touch) {
      // A swipe over each canvas must scroll the page while Draw is off.
      const swipe = await makeSwipe(p)
      const place = (k) =>
        p.evaluate((i) => {
          const c = document.querySelectorAll('canvas, [data-draw-surface]')[i]
          c.scrollIntoView({ block: 'center', behavior: 'instant' })
          const r = c.getBoundingClientRect()
          return { x: r.left + r.width / 2, y: r.top + r.height / 2, h: r.height, w: r.width, ta: getComputedStyle(c).touchAction }
        }, k)
      for (let i = 0; i < found.canvases; i++) {
        const box = await place(i)
        if (box.h < 20 || box.w < 20) {
          info(`${tag} canvas ${i + 1}/${found.canvases} is not displayed: skipped`)
          continue
        }
        await sleep(400)
        const moved = await swipe(box.x, box.y)
        ok(`${tag} swipe over canvas ${i + 1}/${found.canvases} scrolls the page (Draw off, touch-action ${box.ta})`, moved > 100, `scrolled ${moved}`)
      }
      // Control: with a Draw toggle on, the armed canvas must not scroll.
      const toggles = await p.$$eval('button', (bs) => bs.filter((b) => /^\s*✎/.test(b.innerText)).length)
      for (let k = 0; k < toggles; k++) {
        const armed = await p.evaluate((i) => {
          const before = [...document.querySelectorAll('canvas, [data-draw-surface]')].map((c) => getComputedStyle(c).touchAction)
          ;[...document.querySelectorAll('button')].filter((b) => /^\s*✎/.test(b.innerText))[i].click()
          return new Promise((resolve) =>
            setTimeout(() => {
              const now = [...document.querySelectorAll('canvas, [data-draw-surface]')].map((c) => getComputedStyle(c).touchAction)
              resolve(now.findIndex((ta, j) => ta === 'none' && before[j] !== 'none'))
            }, 300),
          )
        }, k)
        if (armed < 0) ok(`${tag} Draw toggle ${k + 1}/${toggles} arms a canvas (touch-action none)`, false)
        else {
          const box = await place(armed)
          await sleep(300)
          const moved = await swipe(box.x, box.y)
          ok(`${tag} control: Draw toggle ${k + 1}/${toggles} on, the swipe over its canvas does not scroll`, Math.abs(moved) < 5, `scrolled ${moved}`)
        }
        await p.evaluate((i) => [...document.querySelectorAll('button')].filter((b) => /^\s*✎/.test(b.innerText))[i].click(), k)
        await sleep(150)
      }
    }

    await p.evaluate(() => window.scrollTo(0, 0))
    await sleep(200)
    await p.screenshot({ path: shotPath(`module-${lab.id}-${slug}-admin-${width}-${lang}.png`), fullPage: true })
    ok(`${tag} admin: no console errors`, p.errors.length === 0, p.errors.join(' | '))
    if (width === 1280 && lang === 'en') info(`${tag} js requested: ${jsRequests(p).join(', ')}`)
    await ctx.close()
  }
}

await browser.close()
await site.close()
process.exit(finish({ quiet: !!opt.quiet }) ? 1 : 0)
