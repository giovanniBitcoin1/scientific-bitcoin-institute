import { useEffect, useState } from 'react'

// Small pieces shared by the Network Lab panels and live figures. Same look
// as the Complexity Lab sims (slate + orange, mono eyebrows, bordered stats).

export const ORANGE = '#f7931a'
export const ORANGE_DARK = '#ea580c' // orange-600
export const INK = '#0f172a' // slate-900
export const SLATE = '#64748b' // slate-500
export const MUTED = '#94a3b8' // slate-400
export const GRID = '#e2e8f0' // slate-200
export const MONO = 'IBM Plex Mono, monospace'
export const DIST_STOPS = ['#0c4a6e', '#0284c7', '#7dd3fc'] // sky-900/600/300, near → far

function hexToRgb(hex) {
  const v = parseInt(hex.slice(1), 16)
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255]
}
const DIST_RGB = DIST_STOPS.map(hexToRgb)

// Sequential palette for a distance: t = 0 (the source) dark, t = 1 light.
export function distColor(t) {
  const x = Math.min(1, Math.max(0, t)) * (DIST_RGB.length - 1)
  const i = Math.min(Math.floor(x), DIST_RGB.length - 2)
  const f = x - i
  const c = DIST_RGB[i].map((a, j) => Math.round(a + (DIST_RGB[i + 1][j] - a) * f))
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`
}

export function useElementWidth(ref) {
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => setWidth(Math.floor(entry.contentRect.width)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [ref])
  return width
}

export function Eyebrow({ children }) {
  return (
    <p className="text-xs uppercase tracking-wider text-orange-600 font-semibold font-mono">{children}</p>
  )
}

export function Stat({ label, children, wide = false }) {
  return (
    <div
      className={`bg-white rounded-lg border border-slate-200 px-3 py-2.5 min-w-0 ${wide ? 'col-span-2' : ''}`}
    >
      <span className="block text-xs text-slate-500 font-sans">{label}</span>
      <span className="block mt-0.5 text-slate-900 tabular-nums font-mono text-sm">{children}</span>
    </div>
  )
}

const pillBase =
  'px-3 py-1.5 rounded-full border text-xs font-mono uppercase tracking-wider transition-colors disabled:opacity-40 disabled:pointer-events-none'

// Pill button: `active` paints it dark (a selected option), `primary` orange.
export function Pill({ active = false, primary = false, className = '', ...props }) {
  const tone = active
    ? 'border-slate-900 bg-slate-900 text-white'
    : primary
      ? 'border-orange-500 bg-orange-500 text-white hover:bg-orange-600'
      : 'border-slate-200 bg-white text-slate-600 hover:text-orange-600 hover:border-orange-300'
  return <button type="button" aria-pressed={active || undefined} className={`${pillBase} ${tone} ${className}`} {...props} />
}

export const fmt = (v, d = 2) => (v == null || !Number.isFinite(v) ? '–' : v.toFixed(d))

const SUP = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' }
export const sup = (n) => String(n).replace(/./g, (c) => SUP[c])

// 12,345 below a million (or 0.012 for small fractions), 1.2 × 10⁷ beyond.
export function sci(v, digits = 2) {
  if (!Number.isFinite(v)) return '–'
  if (v === 0) return '0'
  const a = Math.abs(v)
  if (a >= 1 && a < 1e6) return Math.round(v).toLocaleString('en-US')
  if (a >= 0.01 && a < 1) return v.toPrecision(digits)
  let e = Math.floor(Math.log10(a))
  let m = v / 10 ** e
  if (Number(m.toFixed(digits - 1)) >= 10) {
    m /= 10
    e++
  }
  return `${m.toFixed(digits - 1)} × 10${sup(e)}`
}
