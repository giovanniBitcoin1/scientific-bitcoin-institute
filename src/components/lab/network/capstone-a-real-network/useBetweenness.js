import { useEffect, useState } from 'react'
import useExperiment from '../../useExperiment.js'
import { centralityJob, drain } from './capstone.js'

// The betweenness of the nodes of an entry's largest component, for the
// panels that remove nodes in that order: precomputed for the airports,
// computed at once for a small network, and on request (in slices) otherwise.
// Results are kept per network, so the panels share them.

export const INSTANT = 600
const cache = new Map()

export default function useBetweenness(entry) {
  const exp = useExperiment()
  const [, bump] = useState(0)
  const g = entry.giant
  let values = null
  if (g) {
    if (entry.pre) values = entry.pre.centrality.betweenness
    else if (cache.has(entry.key)) values = cache.get(entry.key)
    else if (g.n <= INSTANT) {
      values = drain(centralityJob(g, { sources: entry.sources })).betweenness
      cache.set(entry.key, values)
    }
  }
  useEffect(() => {
    if (exp.data && exp.data.done && !exp.running && exp.data.key && !cache.has(exp.data.key)) {
      cache.set(exp.data.key, exp.data.betweenness)
      bump((x) => x + 1)
    }
  }, [exp.data, exp.running])
  const request = () => {
    if (!g || values || exp.running) return
    const job = centralityJob(g, { sources: entry.sources })
    const key = entry.key
    exp.run({ iter: job.iter, snapshot: () => ({ ...job.snapshot(), key }) })
  }
  return { values, running: exp.running, progress: exp.progress, request }
}
