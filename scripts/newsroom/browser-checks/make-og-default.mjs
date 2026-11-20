// Renders public/og/default.png, the 1200x630 share image used by every page
// that has none of its own. Run once; rerun only to change the design:
//
//   node make-og-default.mjs [--chrome <path>]
//
// Needs network access for the two Google Fonts. If either font fails to load
// the script stops without writing anything: a card in a fallback font is not
// the Institute's card.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { REPO, parseArgs, launch } from './lib.mjs'

const { opt } = parseArgs()
const logo = readFileSync(path.join(REPO, 'public', 'assets', 'logo.jpg')).toString('base64')
const out = path.join(REPO, 'public', 'og', 'default.png')

const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@600&family=IBM+Plex+Sans:wght@400&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 1200px; height: 630px; }
  body { background: #0f172a; display: flex; align-items: center; padding: 0 88px; gap: 64px; }
  img { width: 240px; height: 240px; border-radius: 50%; flex: none; }
  h1 { font-family: 'Crimson Pro', serif; font-weight: 600; font-size: 76px; line-height: 1.05; color: #ffffff; letter-spacing: -0.5px; }
  .rule { width: 96px; height: 4px; background: #f97316; margin: 30px 0 28px; }
  p { font-family: 'IBM Plex Sans', sans-serif; font-weight: 400; font-size: 30px; line-height: 1.35; color: #cbd5e1; }
</style>
</head>
<body>
  <img src="data:image/jpeg;base64,${logo}" alt="">
  <div>
    <h1>Scientific Bitcoin Institute</h1>
    <div class="rule"></div>
    <p>Rigorous research on Bitcoin as a complex adaptive system</p>
  </div>
</body>
</html>`

const browser = await launch(opt)
try {
  const page = await browser.newPage()
  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 })
  await page.setContent(html, { waitUntil: 'networkidle0' })
  const fonts = await page.evaluate(async () => {
    await document.fonts.ready
    return {
      serif: document.fonts.check("600 76px 'Crimson Pro'"),
      sans: document.fonts.check("400 30px 'IBM Plex Sans'"),
      loaded: [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family.replace(/["']/g, '')),
    }
  })
  const ok = fonts.serif && fonts.sans && fonts.loaded.includes('Crimson Pro') && fonts.loaded.includes('IBM Plex Sans')
  if (!ok) {
    console.error('Fonts not loaded (Crimson Pro, IBM Plex Sans): nothing written.', fonts)
    process.exitCode = 1
  } else {
    mkdirSync(path.dirname(out), { recursive: true })
    writeFileSync(out, await page.screenshot({ type: 'png', clip: { x: 0, y: 0, width: 1200, height: 630 } }))
    console.log(`Written ${out}`)
  }
} finally {
  await browser.close()
}
