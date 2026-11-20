import { useEffect, useRef } from 'react'
import { useElementWidth } from './ui.jsx'

// A static drawing of a network on a canvas. It has no pointer handlers and
// never takes touch-action: none, so a swipe over it always scrolls the page.
//
//   pos     flat array x0, y0, x1, y1, … in the unit square
//   nodes   [{ i, r, fill, stroke, lineWidth }]  i indexes `pos`
//   links   [{ a, b, color, width, dash }]       a, b index `pos`; drawn in order
export default function NetCanvas({ pos, nodes, links, aria, maxHeight = 300, ratio = 0.82 }) {
  const wrapRef = useRef(null)
  const canvasRef = useRef(null)
  const width = useElementWidth(wrapRef)
  const height = Math.round(Math.min(maxHeight, Math.max(200, width * ratio)))

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !width) return
    const dpr = window.devicePixelRatio || 1
    canvas.width = Math.round(width * dpr)
    canvas.height = Math.round(height * dpr)
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    const ctx = canvas.getContext('2d')
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, width, height)
    const PAD = 12
    const x = (i) => PAD + pos[2 * i] * (width - 2 * PAD)
    const y = (i) => PAD + pos[2 * i + 1] * (height - 2 * PAD)
    ctx.lineCap = 'round'
    for (const l of links) {
      ctx.strokeStyle = l.color
      ctx.lineWidth = l.width ?? 1
      ctx.setLineDash(l.dash || [])
      ctx.beginPath()
      ctx.moveTo(x(l.a), y(l.a))
      ctx.lineTo(x(l.b), y(l.b))
      ctx.stroke()
    }
    ctx.setLineDash([])
    for (const nd of nodes) {
      ctx.beginPath()
      ctx.arc(x(nd.i), y(nd.i), nd.r, 0, Math.PI * 2)
      if (nd.fill) {
        ctx.fillStyle = nd.fill
        ctx.fill()
      }
      if (nd.stroke) {
        ctx.strokeStyle = nd.stroke
        ctx.lineWidth = nd.lineWidth ?? 1
        ctx.stroke()
      }
    }
  }, [width, height, pos, nodes, links])

  return (
    <div ref={wrapRef}>
      <canvas ref={canvasRef} role="img" aria-label={aria} className="block bg-white border border-slate-200 rounded" />
    </div>
  )
}

// Rescales a flat layout so that it fills the unit square.
export function fitUnit(flat, n) {
  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity
  for (let i = 0; i < n; i++) {
    minX = Math.min(minX, flat[2 * i])
    maxX = Math.max(maxX, flat[2 * i])
    minY = Math.min(minY, flat[2 * i + 1])
    maxY = Math.max(maxY, flat[2 * i + 1])
  }
  const sx = Math.max(maxX - minX, 1e-6)
  const sy = Math.max(maxY - minY, 1e-6)
  const out = new Float64Array(2 * n)
  for (let i = 0; i < n; i++) {
    out[2 * i] = (flat[2 * i] - minX) / sx
    out[2 * i + 1] = (flat[2 * i + 1] - minY) / sy
  }
  return out
}
