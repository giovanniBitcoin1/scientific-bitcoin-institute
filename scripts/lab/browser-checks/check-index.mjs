// Index page of one lab, as a locked visitor and in the admin preview, EN and
// IT, at 1280 and 375 px.
//
//   node check-index.mjs <labId> [--dist <dir> | --base <url>] [--chrome <path>] [--quiet]
//
// labId is a key of src/data/lab/paths.js (complexity, network).
import {
  parseArgs, loadLab, allLabIds, labsLocked, siteFromArgs, launch, newPage, setAdminOnce, go, bodyText, has,
  occurrences, noHScroll, count, reporter, shotPath, sleep, COPY, WIDTHS, LANGS,
} from './lib.mjs'

const { pos, opt } = parseArgs()
const labId = pos[0]
if (!labId) {
  console.error('Usage: node check-index.mjs <labId> [--dist <dir> | --base <url>] [--chrome <path>] [--quiet]')
  process.exit(2)
}
const lab = await loadLab(labId)
const others = await Promise.all(allLabIds().filter((id) => id !== labId).map(loadLab))
const site = await siteFromArgs(opt)
const browser = await launch(opt)
const { ok, info, finish } = reporter()
const locked = labsLocked()
const BASE = site.url + lab.basePath
const moduleLinks = (page, l = lab) =>
  page.$$eval(`main a[href^="${l.basePath}/"]`, (a) => a.map((x) => x.getAttribute('href')))
const CARD = 'main section h2.text-2xl.leading-snug'
const pendingSlug = lab.modules.find((m) => m.status !== 'ready')?.slug

if (!locked) info('config.json says "locked": false — the locked-visitor checks are skipped')

for (const width of WIDTHS) {
  for (const lang of LANGS) {
    const tag = `[${lab.id} ${width} ${lang}]`
    const ctx = await browser.createBrowserContext()

    // ---- Locked visitor
    if (locked) {
      const p = await newPage(ctx, { width, lang })
      await go(p, BASE)
      let t = await bodyText(p)
      ok(`${tag} locked index: lock overlay names the ${lab.name}`, has(t, COPY.lock[lang]) && has(t, COPY.lockText[lang](lab.name)))
      ok(`${tag} locked index: ${lab.modules.length} module cards under the overlay`, (await count(p, CARD)) === lab.modules.length)
      ok(`${tag} locked index: no module links, no admin bar, no admin form`, (await moduleLinks(p)).length === 0 && !has(t, COPY.bar[lang]) && !(await p.$('#lab-admin')))
      ok(`${tag} locked index: no horizontal scroll`, await noHScroll(p))
      await p.screenshot({ path: shotPath(`index-${lab.id}-locked-${width}-${lang}.png`) })

      if (pendingSlug) {
        await go(p, `${BASE}/${pendingSlug}`)
        ok(`${tag} locked ${pendingSlug} (not ready): not available`, has(await bodyText(p), COPY.notAvailable[lang]))
      }
      await go(p, `${BASE}/no-such-module`)
      ok(`${tag} unknown slug: not available`, has(await bodyText(p), COPY.notAvailable[lang]))

      // ?admin form with a wrong passphrase
      await go(p, `${BASE}?admin`)
      ok(`${tag} ?admin shows the passphrase form`, !!(await p.$('#lab-admin')))
      await p.type('#lab-admin', 'not-the-passphrase')
      await p.click('form button[type=submit]')
      await sleep(500)
      t = await bodyText(p)
      ok(`${tag} wrong passphrase: neutral message, still locked`, has(t, COPY.wrong[lang]) && has(t, COPY.lock[lang]))
      ok(`${tag} locked: no console errors`, p.errors.length === 0, p.errors.join(' | '))
      await p.close()
    }

    // ---- Admin preview
    let p = await newPage(ctx, { width, lang, admin: true })
    await go(p, BASE)
    let t = await bodyText(p)
    ok(`${tag} admin index: unlocked${locked ? ', admin bar shown' : ''}`, !has(t, COPY.lock[lang]) && (!locked || has(t, COPY.bar[lang])))
    const links = await moduleLinks(p)
    const expected = lab.ready.map((m) => `${lab.basePath}/${m.slug}`)
    ok(`${tag} admin index: ${lab.modules.length} cards, ${expected.length} open (the ready ones)`, (await count(p, CARD)) === lab.modules.length && links.join() === expected.join(), `links: ${links.join(', ')}`)
    if (lab.partIds.length) {
      const headings = await p.$$eval('main section h2.text-2xl', (hs) => hs.map((h) => h.innerText))
      ok(`${tag} admin index: ${lab.partIds.length} part headings`, lab.partIds.every((id) => headings.some((h) => new RegExp(`\\b${id}\\s*·`).test(h))), headings.slice(0, 6).join(' | '))
    }
    ok(`${tag} admin index: no horizontal scroll`, await noHScroll(p))
    await p.screenshot({ path: shotPath(`index-${lab.id}-admin-${width}-${lang}.png`), fullPage: true })
    // One lock for all labs: the same flag opens the others.
    for (const other of others) {
      await go(p, site.url + other.basePath)
      ok(`${tag} admin: ${other.basePath} is unlocked by the same flag`, (await moduleLinks(p, other)).length === other.ready.length)
    }
    ok(`${tag} admin: no console errors`, p.errors.length === 0, p.errors.join(' | '))
    await p.close()

    // ---- "Lock again" locks every lab (flag set once, not on every load)
    if (locked) {
      p = await ctx.newPage()
      await p.setViewport({ width, height: 900 })
      await p.goto(BASE)
      await setAdminOnce(p, lang)
      await go(p, `${BASE}?admin`)
      ok(`${tag} admin + ?admin: no form, bar shown`, !(await p.$('#lab-admin')) && has(await bodyText(p), COPY.bar[lang]))
      const [btn] = await p.$$(`xpath/.//button[contains(., '${COPY.lockAgain[lang]}')]`)
      await btn.click()
      await sleep(400)
      t = await bodyText(p)
      ok(`${tag} Lock again: locked`, has(t, COPY.lock[lang]) && !has(t, COPY.bar[lang]))
      for (const other of others) {
        await go(p, site.url + other.basePath)
        ok(`${tag} after Lock again: ${other.basePath} is locked too`, has(await bodyText(p), COPY.lock[lang]) && (await moduleLinks(p, other)).length === 0)
      }
    }
    await ctx.close()
  }
}

await browser.close()
await site.close()
process.exit(finish({ quiet: !!opt.quiet }) ? 1 : 0)
