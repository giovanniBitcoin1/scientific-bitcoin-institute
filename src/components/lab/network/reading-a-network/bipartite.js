// A small bipartite network and its two one-mode projections. Pure logic,
// shared by the panel and by scripts/lab/check-network-01.mjs.
//
// The network is a membership grid: grid[t][b] is true when top node t
// (a paper, a film, a transaction) is joined to bottom node b (an author, an
// actor, an address).

export const TOPS = 6
export const BOTTOMS = 8

export const emptyGrid = () => Array.from({ length: TOPS }, () => new Array(BOTTOMS).fill(false))

// Builds a grid from the member lists of the top nodes, e.g. [[0, 1, 2], [2, 3]].
export function gridFrom(members) {
  const grid = emptyGrid()
  members.forEach((list, t) => list.forEach((b) => (grid[t][b] = true)))
  return grid
}

export const PRESET_GRIDS = {
  // P1 {a, b, c}, P2 {c, d}, P3 {d, e, f}, P4 {a, f}
  exercise6: () => gridFrom([[0, 1, 2], [2, 3], [3, 4, 5], [0, 5]]),
  // One top node joined to all eight bottom nodes.
  bigPaper: () => gridFrom([[0, 1, 2, 3, 4, 5, 6, 7]]),
}

// Projection onto one side: two nodes of that side are linked when they share
// at least one neighbour on the other side, and the weight of the link is the
// number of neighbours they share. Returns { size, weight[i][j], links, maxWeight }.
function projectSide(size, neighbours) {
  const weight = Array.from({ length: size }, () => new Array(size).fill(0))
  let links = 0
  let maxWeight = 0
  for (let i = 0; i < size; i++) {
    for (let j = i + 1; j < size; j++) {
      let shared = 0
      for (const x of neighbours[i]) if (neighbours[j].has(x)) shared++
      weight[i][j] = shared
      weight[j][i] = shared
      if (shared) links++
      if (shared > maxWeight) maxWeight = shared
    }
  }
  return { size, weight, links, maxWeight }
}

export function project(grid) {
  const tops = grid.length
  const bottoms = grid[0].length
  const ofTop = grid.map((row) => new Set(row.flatMap((on, b) => (on ? [b] : []))))
  const ofBottom = Array.from(
    { length: bottoms },
    (_, b) => new Set(grid.flatMap((row, t) => (row[b] ? [t] : []))),
  )
  let links = 0
  for (const s of ofTop) links += s.size
  return {
    links, // links of the bipartite network
    topDegree: ofTop.map((s) => s.size),
    bottomDegree: ofBottom.map((s) => s.size),
    top: projectSide(tops, ofTop),
    bottom: projectSide(bottoms, ofBottom),
  }
}
