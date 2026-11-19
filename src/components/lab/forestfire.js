// The Drossel–Schwabl forest-fire model on an L × L torus.
//
// Each site is empty, a tree or burning. In one time step:
//   1. sites that burned in the previous step become empty;
//   2. every empty site grows a tree with probability p, and every tree that
//      was already standing is struck by lightning with probability f;
//   3. a struck tree burns, and with it its whole cluster of trees connected
//      through nearest neighbours.
// Fires burn instantly: a whole cluster is consumed within the step in which
// lightning strikes it, which is the limit of fires much faster than growth
// in which the model is usually studied. The burnt sites are shown as burning
// for that one step. The interesting regime is f ≪ p, with p/f large.

export const EMPTY = 0
export const TREE = 1
export const FIRE = 2

export function createForest(L) {
  const N = L * L
  return {
    L,
    N,
    s: new Uint8Array(N),
    trees: 0,
    t: 0,
    queue: new Int32Array(N),
    strikes: new Int32Array(N),
    burning: new Int32Array(N), // sites burnt in the last step
    nBurning: 0,
  }
}

// Burns the cluster of trees that contains site i; returns its size.
function burnCluster(st, i) {
  const { L, N, s, queue, burning } = st
  let head = 0
  let tail = 0
  s[i] = FIRE
  queue[tail++] = i
  while (head < tail) {
    const j = queue[head++]
    burning[st.nBurning++] = j
    const x = j % L
    const left = x > 0 ? j - 1 : j + L - 1
    const right = x < L - 1 ? j + 1 : j - L + 1
    const up = j >= L ? j - L : j + N - L
    const down = j < N - L ? j + L : j - N + L
    if (s[left] === TREE) {
      s[left] = FIRE
      queue[tail++] = left
    }
    if (s[right] === TREE) {
      s[right] = FIRE
      queue[tail++] = right
    }
    if (s[up] === TREE) {
      s[up] = FIRE
      queue[tail++] = up
    }
    if (s[down] === TREE) {
      s[down] = FIRE
      queue[tail++] = down
    }
  }
  st.trees -= tail
  return tail
}

// One time step. Calls onFire(size) for every fire; returns the tree density
// after the step.
export function forestStep(st, random, p, f, onFire) {
  const { N, s, burning, strikes } = st
  for (let k = 0; k < st.nBurning; k++) s[burning[k]] = EMPTY
  st.nBurning = 0
  // One uniform per site decides both growth (empty sites) and lightning (trees).
  let nStrikes = 0
  let grown = 0
  for (let i = 0; i < N; i++) {
    const r = random()
    if (s[i] === EMPTY) {
      if (r < p) {
        s[i] = TREE
        grown++
      }
    } else if (r < f) strikes[nStrikes++] = i
  }
  // Trees grown this step are not yet counted, so they cannot have been struck.
  st.trees += grown
  for (let k = 0; k < nStrikes; k++) {
    const i = strikes[k]
    if (s[i] === TREE) {
      const size = burnCluster(st, i)
      if (onFire) onFire(size)
    }
  }
  st.t++
  return st.trees / N
}
