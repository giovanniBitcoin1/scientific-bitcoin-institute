// Number formatting shared by the module's figures and panels: toFixed, a
// true minus sign, and a decimal comma in Italian. The texts and the checks
// format the same way.
export const num = (v, lang, d = 2) => {
  if (v == null || !Number.isFinite(v)) return '–'
  const s = (Object.is(v, -0) ? 0 : v).toFixed(d).replace('-', '−')
  return lang === 'it' ? s.replace('.', ',') : s
}

// A list of numbers in parentheses: (0.25, 0.25, 0.50) in English,
// (0,25; 0,25; 0,50) in Italian.
export const tuple = (xs, lang, d = 2) => `(${xs.map((x) => num(x, lang, d)).join(lang === 'it' ? '; ' : ', ')})`
