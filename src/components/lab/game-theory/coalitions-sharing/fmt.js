// Number formatting for module 10 (as module 09's fmt.js): toFixed, a true
// minus sign, a decimal comma in Italian; fractions written as 125/3. The
// texts and the checks format the same way.
import { toNumber, show } from '../congestion-price-of-anarchy/frac.js'

export const num = (v, lang, d = 2) => {
  if (v == null || !Number.isFinite(v)) return '–'
  const s = (Object.is(v, -0) ? 0 : v).toFixed(d).replace('-', '−')
  return lang === 'it' ? s.replace('.', ',') : s
}
// A fraction as a decimal.
export const dec = (f, lang, d = 2) => num(toNumber(f), lang, d)
// A fraction as itself: 125/3, −5/2, 7.
export const fracText = (f) => show(f).replace('-', '−')
// 125/3 (41.67), or just 45 when it is whole.
export const both = (f, lang, d = 2) => (f.d === 1n ? fracText(f) : `${fracText(f)} (${dec(f, lang, d)})`)
// A list in parentheses: (60, 40, 0) in English, (60; 40; 0) in Italian when
// the numbers have decimals.
export const tuple = (xs, lang, show1 = (x) => x) => {
  const parts = xs.map(show1)
  const sep = lang === 'it' && parts.some((p) => p.includes(',')) ? '; ' : ', '
  return `(${parts.join(sep)})`
}
