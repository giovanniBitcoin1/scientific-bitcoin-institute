import { useEffect, useRef } from 'react'

// Calls `callback(dt)` on every animation frame while `playing` is true;
// dt is the elapsed time in milliseconds since the previous frame. The latest
// callback is always used, so it may close over fresh state without restarting
// the loop. The frame is cancelled on pause and on unmount.
export default function useAnimationLoop(callback, playing) {
  const cbRef = useRef(callback)
  cbRef.current = callback

  useEffect(() => {
    if (!playing) return
    let frame
    let last = performance.now()
    const tick = (now) => {
      const dt = now - last
      last = now
      cbRef.current(dt)
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [playing])
}
