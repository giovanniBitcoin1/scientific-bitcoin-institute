// The "Labs" section: the nav entry with its dropdown, the hub page (/labs)
// and the links between the hub and the labs.
//
//   node check-links.mjs [--dist <dir> | --base <url>] [--chrome <path>] [--quiet]
//
// - /labs at 1280 and 375 px, EN and IT: public (no lock), one card per lab
//   with its name, "ready of total" count and a link to the lab.
// - Desktop: "Labs" links to /labs, hovering it opens a dropdown with one
//   link per lab, and both links work. Mobile: the same links in the menu.
// - "Labs" is marked as the current section on /labs and on every lab page,
//   and nowhere else.
// - Every lab index links back to /labs.
import {
  allLabIds, loadLab, parseArgs, siteFromArgs, launch, newPage, go, bodyText, has, noHScroll, reporter, shotPath,
  sleep, COPY, WIDTHS, LANGS,
} from './lib.mjs'

const { opt } = parseArgs()
const site = await siteFromArgs(opt)
const browser = await launch(opt)
const { ok, finish } = reporter()
const labs = await Promise.all(allLabIds().map(loadLab))
const { LABS_HUB } = await import(new URL('../../../src/data/lab/paths.js', import.meta.url))
const HUB = site.url + LABS_HUB

const TEXT = {
  en: {
    intro: 'Advanced, interactive courses by the Scientific Bitcoin Institute. Each lab pairs rigorous lectures with simulations you can run, measure and test against theory.',
    ready: (r, t) => `${r} of ${t} modules ready`,
    allLabs: 'All labs',
  },
  it: {
    intro: 'Corsi avanzati e interattivi dello Scientific Bitcoin Institute. Ogni lab unisce lezioni rigorose a simulazioni da eseguire, misurare e confrontare con la teoria.',
    ready: (r, t) => `${r} ${r === 1 ? 'modulo pronto' : 'moduli pronti'} su ${t}`,
    allLabs: 'Tutti i lab',
  },
}
const pathOf = (page) => page.evaluate(() => location.pathname)

// ---- The hub page
for (const width of WIDTHS) {
  for (const lang of LANGS) {
    const tag = `[hub ${width} ${lang}]`
    const ctx = await browser.createBrowserContext()
    const p = await newPage(ctx, { width, lang })
    await go(p, HUB)
    const t = await bodyText(p)
    ok(`${tag} title "Labs" and the intro text`, (await p.$eval('main h1', (h) => h.innerText.trim())) === 'Labs' && has(t, TEXT[lang].intro))
    ok(`${tag} public: no lock overlay`, !has(t, COPY.lock[lang]))
    const cards = await p.$$eval('main section a', (as) => as.map((a) => ({ href: a.getAttribute('href'), text: a.innerText })))
    ok(`${tag} one card per lab (${labs.length})`, cards.length === labs.length, JSON.stringify(cards.map((c) => c.href)))
    for (const lab of labs) {
      const card = cards.find((c) => c.href === lab.basePath)
      ok(`${tag} ${lab.name}: name, "${TEXT[lang].ready(lab.ready.length, lab.modules.length)}" and a link to ${lab.basePath}`, !!card && has(card.text, lab.name) && has(card.text, TEXT[lang].ready(lab.ready.length, lab.modules.length)), card ? card.text.replace(/\s+/g, ' ') : 'no card')
    }
    ok(`${tag} document title`, (await p.title()) === 'Labs — Scientific Bitcoin Institute')
    ok(`${tag} no horizontal scroll`, await noHScroll(p))
    ok(`${tag} no console errors`, p.errors.length === 0, p.errors.join(' | '))
    await p.screenshot({ path: shotPath(`hub-${width}-${lang}.png`), fullPage: true })
    // Each card opens its lab, and the lab index links back.
    for (const lab of labs) {
      await go(p, HUB, 600)
      await p.click(`main section a[href="${lab.basePath}"]`)
      await sleep(1200)
      ok(`${tag} the ${lab.name} card opens ${lab.basePath}`, (await pathOf(p)) === lab.basePath)
      const back = await p.$$eval(`main a[href="${LABS_HUB}"]`, (as) => as.map((a) => a.innerText))
      ok(`${tag} ${lab.basePath} has an "${TEXT[lang].allLabs}" link to ${LABS_HUB}`, back.some((b) => b.includes(TEXT[lang].allLabs)), back.join(' | '))
      await p.click(`main a[href="${LABS_HUB}"]`)
      await sleep(800)
      ok(`${tag} … and it leads back to the hub`, (await pathOf(p)) === LABS_HUB)
    }
    await ctx.close()
  }
}

// ---- Desktop nav
{
  const ctx = await browser.createBrowserContext()
  const p = await newPage(ctx, { width: 1280, lang: 'en' })
  const NAV = 'header nav'
  // The top-level entry only: a dropdown item of another menu that has no
  // page yet links to "#", which the router renders as the current path.
  const labsLink = `${NAV} .nav-item > a[href="${LABS_HUB}"]`
  await go(p, site.url + '/', 800)
  const labels = await p.$$eval(`${NAV} > .nav-item > :first-child`, (els) => els.map((e) => e.innerText.trim()))
  const i = labels.indexOf('Labs')
  ok('desktop nav: "Labs" sits between Education and Academy; no "Complexity Lab" entry', labels[i - 1] === 'Education' && labels[i + 1] === 'Academy' && !labels.includes('Complexity Lab'), labels.join(' | '))
  const drop = `${NAV} .nav-item:has(> a[href="${LABS_HUB}"]) .nav-dropdown`
  const visible = () => p.$eval(drop, (d) => getComputedStyle(d).visibility === 'visible' && Number(getComputedStyle(d).opacity) > 0.9)
  ok('desktop nav: the dropdown is closed until hovered', !(await visible()))
  await p.hover(labsLink)
  await sleep(500)
  ok('desktop nav: hovering "Labs" opens the dropdown', await visible())
  const items = await p.$$eval(`${drop} a`, (as) => as.map((a) => `${a.innerText.trim()} -> ${a.getAttribute('href')}`))
  ok('desktop nav: the dropdown lists the labs of the registry', items.join('; ') === labs.map((l) => `${l.name} -> ${l.basePath}`).join('; '), items.join('; '))
  for (const lab of labs) {
    await go(p, site.url + '/', 600)
    await p.hover(labsLink)
    await sleep(500)
    await p.click(`${drop} a[href="${lab.basePath}"]`)
    await sleep(1200)
    ok(`desktop nav: dropdown link "${lab.name}" opens ${lab.basePath}`, (await pathOf(p)) === lab.basePath && has(await bodyText(p), lab.name))
  }
  await go(p, site.url + '/', 600)
  await p.click(labsLink)
  await sleep(1000)
  ok(`desktop nav: "Labs" itself opens ${LABS_HUB}`, (await pathOf(p)) === LABS_HUB)

  // Current section
  const active = () => p.$eval(labsLink, (a) => a.getAttribute('aria-current') === 'page' && a.className.includes('text-orange-400'))
  const on = [LABS_HUB, ...labs.flatMap((l) => [l.basePath, `${l.basePath}/${l.modules[0].slug}`])]
  for (const url of on) {
    await go(p, site.url + url, 500)
    ok(`desktop nav: "Labs" is the current section on ${url}`, await active())
  }
  for (const url of ['/', '/education', '/support/membership']) {
    await go(p, site.url + url, 500)
    ok(`desktop nav: "Labs" is not marked on ${url}`, !(await active()))
  }
  ok('desktop nav: no console errors', p.errors.length === 0, p.errors.join(' | '))
  await ctx.close()
}

// ---- Mobile menu
{
  const ctx = await browser.createBrowserContext()
  const p = await newPage(ctx, { width: 375, lang: 'en', touch: true })
  const MENU = 'header > div.lg\\:hidden'
  const openMenu = async () => {
    await p.click('header button[aria-label="Toggle menu"]')
    await sleep(300)
  }
  await go(p, site.url + '/', 800)
  ok('mobile: the menu is closed at first', !(await p.$(MENU)))
  await openMenu()
  const hrefs = await p.$$eval(`${MENU} a`, (as) => as.map((a) => a.getAttribute('href')))
  ok('mobile menu: "Labs" and one link per lab', hrefs.includes(LABS_HUB) && labs.every((l) => hrefs.includes(l.basePath)), hrefs.filter((h) => /lab/.test(h)).join(', '))
  const order = await p.$$eval(`${MENU} > div > :first-child`, (els) => els.map((e) => e.innerText.trim()))
  const i = order.indexOf('Labs')
  ok('mobile menu: "Labs" sits between Education and Academy', order[i - 1] === 'Education' && order[i + 1] === 'Academy', order.join(' | '))
  ok('mobile menu: no horizontal scroll', await noHScroll(p))
  await p.screenshot({ path: shotPath('nav-mobile-menu.png') })
  for (const target of [LABS_HUB, ...labs.map((l) => l.basePath)]) {
    await go(p, site.url + '/', 600)
    await openMenu()
    const link = await p.$(`${MENU} a[href="${target}"]`)
    await link.evaluate((a) => a.scrollIntoView({ block: 'center' }))
    await sleep(200)
    await link.tap()
    await sleep(1200)
    ok(`mobile menu: the link to ${target} works and the menu closes`, (await pathOf(p)) === target && !(await p.$(MENU)))
  }
  ok('mobile: no console errors', p.errors.length === 0, p.errors.join(' | '))
  await ctx.close()
}

await browser.close()
await site.close()
process.exit(finish({ quiet: !!opt.quiet }) ? 1 : 0)
