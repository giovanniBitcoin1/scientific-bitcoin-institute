import { useEffect, useRef, useState } from 'react'

// Runs a long computation progressively. A job is { iter, snapshot }: `iter`
// is a generator that yields often (a number in [0, 1] reports progress) and
// `snapshot()` returns the partial result to display. The generator is pumped
// for ~12 ms per animation frame and the result repainted a few times per
// second, so long experiments never block the page.
export default function useExperiment() {
  const [state, setState] = useState({ running: false, progress: 0, data: null, cancelled: false })
  const frameRef = useRef(0)
  const jobRef = useRef(null)

  const run = (job) => {
    cancelAnimationFrame(frameRef.current)
    jobRef.current = job
    let progress = 0
    let lastPaint = 0
    setState({ running: true, progress: 0, data: job.snapshot(), cancelled: false })
    const work = () => {
      const start = performance.now()
      let r
      do {
        r = job.iter.next()
        if (typeof r.value === 'number') progress = r.value
      } while (!r.done && performance.now() - start < 12)
      if (r.done) {
        setState({ running: false, progress: 1, data: job.snapshot(), cancelled: false })
        return
      }
      if (start - lastPaint > 150) {
        lastPaint = start
        setState({ running: true, progress, data: job.snapshot(), cancelled: false })
      }
      frameRef.current = requestAnimationFrame(work)
    }
    frameRef.current = requestAnimationFrame(work)
  }

  const cancel = () => {
    cancelAnimationFrame(frameRef.current)
    const job = jobRef.current
    setState((s) => ({ ...s, running: false, cancelled: true, data: job ? job.snapshot() : s.data }))
  }

  useEffect(() => () => cancelAnimationFrame(frameRef.current), [])
  return { ...state, run, cancel }
}
