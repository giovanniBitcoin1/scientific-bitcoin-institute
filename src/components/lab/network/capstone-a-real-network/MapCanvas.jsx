import { useEffect, useRef } from 'react'
import { useElementWidth } from '../ui.jsx'

// The nodes of a network as dots on a canvas, at positions in the unit
// square, with some links drawn under them. It listens to clicks only (a
// click never scrolls the page), so a swipe over it always scrolls.
//
//   pos      flat array x0, y0, x1, y1, …
//   radii    radius of every node in CSS pixels
//   colors   fill of every node
//   links    [{ a, b, color, width }], drawn in order
//   rings    [{ v, color }] nodes drawn again on top with a ring
//   wrap     true on a map: a link spanning more than half the width is
//            drawn around the back, in two pieces
//   onTap    called with the node a click lands on (the largest within a few
//            pixels, otherwise the nearest within reach), or −1
export default function MapCanvas({ pos, radii, colors, links = [], rings = [], wrap = false, onTap, ratio = 0.5, maxHeight = 330, minHeight = 150, aria }) {
  const wrapRef = useRef(null)
  const canvasRef = useRef(null)
  const width = useElementWidth(wrapRef)
  const height = Math.round(Math.min(maxHeight, Math.max(minHeight, width * ratio)))
  const PAD = 6
  const n = radii.length

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
    const x = (i) => PAD + pos[2 * i] * (width - 2 * PAD)
    const y = (i) => PAD + pos[2 * i + 1] * (height - 2 * PAD)
    ctx.lineCap = 'round'
    for (const l of links) {
      ctx.strokeStyle = l.color
      ctx.lineWidth = l.width ?? 1
      ctx.beginPath()
      const xa = x(l.a)
      const xb = x(l.b)
      if (wrap && Math.abs(pos[2 * l.a] - pos[2 * l.b]) > 0.5) {
        const [lx, ly, rx, ry] = xa < xb ? [xa, y(l.a), xb, y(l.b)] : [xb, y(l.b), xa, y(l.a)]
        const span = lx - PAD + (width - PAD - rx)
        const yEdge = span > 0 ? ly + ((ry - ly) * (lx - PAD)) / span : ly
        ctx.moveTo(lx, ly)
        ctx.lineTo(PAD, yEdge)
        ctx.moveTo(width - PAD, yEdge)
        ctx.lineTo(rx, ry)
      } else {
        ctx.moveTo(xa, y(l.a))
        ctx.lineTo(xb, y(l.b))
      }
      ctx.stroke()
    }
    let last = null
    for (let v = 0; v < n; v++) {
      if (colors[v] !== last) {
        last = colors[v]
        ctx.fillStyle = last
      }
      ctx.beginPath()
      ctx.arc(x(v), y(v), radii[v], 0, Math.PI * 2)
      ctx.fill()
    }
    for (const r of rings) {
      ctx.beginPath()
      ctx.arc(x(r.v), y(r.v), Math.max(radii[r.v], 2.5) + 2.5, 0, Math.PI * 2)
      ctx.strokeStyle = r.color
      ctx.lineWidth = 2
      ctx.stroke()
    }
  }, [width, height, pos, radii, colors, links, rings, wrap, n])

  const click = (e) => {
    if (!onTap || !width) return
    const box = canvasRef.current.getBoundingClientRect()
    const px = e.clientX - box.left - canvasRef.current.clientLeft
    const py = e.clientY - box.top - canvasRef.current.clientTop
    // the largest node within NEAR pixels of the click, otherwise the nearest within reach
    const NEAR = 7
    let best = -1
    let bestD = 18 * 18
    let big = -1
    for (let v = 0; v < n; v++) {
      const dx = PAD + pos[2 * v] * (width - 2 * PAD) - px
      const dy = PAD + pos[2 * v + 1] * (height - 2 * PAD) - py
      const d = dx * dx + dy * dy
      if (d < bestD) {
        bestD = d
        best = v
      }
      if (d <= NEAR * NEAR && (big < 0 || radii[v] > radii[big])) big = v
    }
    onTap(big >= 0 ? big : best)
  }

  return (
    <div ref={wrapRef}>
      <canvas ref={canvasRef} role="img" aria-label={aria} onClick={click} className={`block bg-white border border-slate-200 rounded ${onTap ? 'cursor-pointer' : ''}`} />
    </div>
  )
}
