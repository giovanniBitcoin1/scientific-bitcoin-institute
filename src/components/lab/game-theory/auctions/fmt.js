// Number formatting for module 11 (as modules 09 and 10): toFixed, a true
// minus sign, a decimal comma in Italian; thousands with a comma in English
// and a point in Italian. The texts and the checks format the same way.

export const num = (v, lang, d = 2) => {
  if (v == null || !Number.isFinite(v)) return '–'
  const r = Number(v.toFixed(d))
  const s = (Object.is(r, -0) || r === 0 ? 0 : v).toFixed(d).replace('-', '−')
  return lang === 'it' ? s.replace('.', ',') : s
}
export const int = (v, lang) => Math.round(v).toLocaleString('en-US').replace(/,/g, lang === 'it' ? '.' : ',')
// "a ± b"
export const pm = (m, se, lang, d = 2) => `${num(m, lang, d)} ± ${num(se, lang, d)}`
