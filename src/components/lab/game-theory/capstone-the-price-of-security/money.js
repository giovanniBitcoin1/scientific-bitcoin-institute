import { num, int } from '../auctions/fmt.js'

// Dollar amounts for module 14, the same in the page, the texts and the
// self-check: whole dollars below a million, then "$4.09 million",
// "$21.44 billion", "$2.63 trillion" (Italian: "4,09 milioni di $").

const UNITS = {
  en: [[1e12, 'trillion'], [1e9, 'billion'], [1e6, 'million']],
  it: [[1e12, 'mila miliardi'], [1e9, 'miliardi'], [1e6, 'milioni']],
}

export function money(v, lang = 'en', d = 2) {
  if (v == null || !Number.isFinite(v)) return '–'
  for (const [u, name] of UNITS[lang] || UNITS.en) {
    if (Math.abs(v) >= u) return lang === 'it' ? `${num(v / u, 'it', d)} ${name} di $` : `$${num(v / u, 'en', d)} ${name}`
  }
  return lang === 'it' ? `${int(v, 'it')} $` : `$${int(v, 'en')}`
}

export const pct = (x, lang = 'en', d = 2) => `${num(100 * x, lang, d)}%`
// Large percentages with thousands separators: 262,801%.
export const bigPct = (x, lang = 'en') => `${int(100 * x, lang)}%`
