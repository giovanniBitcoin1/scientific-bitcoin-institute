import { MAX_NODES, MAX_LINKS } from './capstone.js'

// "Your own network": the text of an edge list, or the JSON of
// `lncli describegraph`, turned into a network { n, A, B, w, names }. Read as
// undirected; links from a node to itself are dropped; repeated links are
// merged and their weights added. Nothing here touches the network: the text
// is read in the browser and goes nowhere.
//
// Both return { ok: true, net, report } or { ok: false, error, ... }, with
// error one of 'empty', 'nodes', 'links', 'format'.

function collector() {
  const index = new Map()
  const names = []
  const pairs = new Map()
  const report = { lines: 0, rows: 0, skipped: 0, selfLinks: 0, merged: 0 }
  let weighted = false
  let error = null
  const node = (name) => {
    let i = index.get(name)
    if (i === undefined) {
      i = names.length
      index.set(name, i)
      names.push(name)
      if (names.length > MAX_NODES) error = 'nodes'
    }
    return i
  }
  return {
    report,
    get error() {
      return error
    },
    add(nameA, nameB, weight, explicit) {
      report.rows++
      if (nameA === nameB) {
        report.selfLinks++
        return
      }
      const a = node(nameA)
      const b = node(nameB)
      const key = a < b ? a * (MAX_NODES + 1) + b : b * (MAX_NODES + 1) + a
      const old = pairs.get(key)
      if (old === undefined) {
        pairs.set(key, weight)
        if (pairs.size > MAX_LINKS) error = 'links'
      } else {
        pairs.set(key, old + weight)
        report.merged++
        weighted = true
      }
      if (explicit) weighted = true
    },
    finish(id) {
      if (error) return { ok: false, error, limit: error === 'nodes' ? MAX_NODES : MAX_LINKS }
      if (!pairs.size) return { ok: false, error: 'empty' }
      const L = pairs.size
      const A = new Int32Array(L)
      const B = new Int32Array(L)
      const w = new Float64Array(L)
      let e = 0
      for (const [key, weight] of pairs) {
        A[e] = Math.floor(key / (MAX_NODES + 1))
        B[e] = key % (MAX_NODES + 1)
        w[e++] = weight
      }
      return { ok: true, net: { id, n: names.length, A, B, w: weighted ? w : null, names, labels: null }, report }
    },
  }
}

// One link per line: "a b" or "a b weight", separated by spaces, tabs, commas
// or semicolons; lines starting with # are ignored; names are text. A line
// with fewer than two fields, or with a weight that is not a positive number,
// is skipped and counted.
export function parseEdgeList(text) {
  const c = collector()
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim()
    if (!line || line.startsWith('#')) continue
    c.report.lines++
    const f = line.split(/[\s,;]+/).filter(Boolean)
    const weight = f.length > 2 ? Number(f[2]) : 1
    if (f.length < 2 || !(weight > 0) || !Number.isFinite(weight)) {
      c.report.skipped++
      continue
    }
    c.add(f[0], f[1], weight, f.length > 2)
    if (c.error) break
  }
  return c.finish('own')
}

// The JSON of LND's DescribeGraph (`lncli describegraph`): nodes with
// pub_key (and alias), edges with node1_pub, node2_pub and capacity (a
// string of satoshis). One link per pair of nodes, the total capacity as its
// weight; a node is named by its alias followed by the start of its key.
export function parseLnd(graph) {
  if (!graph || !Array.isArray(graph.edges)) return { ok: false, error: 'format' }
  const alias = new Map()
  for (const nd of Array.isArray(graph.nodes) ? graph.nodes : []) if (nd && nd.pub_key) alias.set(nd.pub_key, nd.alias)
  const label = (pub) => (alias.get(pub) ? `${alias.get(pub)} (${pub.slice(0, 8)})` : pub.slice(0, 16))
  const c = collector()
  for (const e of graph.edges) {
    c.report.lines++
    const capacity = Number(e && e.capacity)
    if (!e || typeof e.node1_pub !== 'string' || typeof e.node2_pub !== 'string' || !(capacity > 0)) {
      c.report.skipped++
      continue
    }
    if (e.node1_pub === e.node2_pub) {
      c.report.rows++
      c.report.selfLinks++
      continue
    }
    c.add(label(e.node1_pub), label(e.node2_pub), capacity, true)
    if (c.error) break
  }
  const out = c.finish('own')
  if (out.ok) out.report.lnd = true
  return out
}

// Text that starts with { is read as the JSON of describegraph, anything
// else as an edge list.
export function readNetwork(text) {
  const t = text.trim()
  if (!t) return { ok: false, error: 'empty' }
  if (t[0] === '{') {
    try {
      return parseLnd(JSON.parse(t))
    } catch {
      return { ok: false, error: 'format' }
    }
  }
  return parseEdgeList(t)
}
