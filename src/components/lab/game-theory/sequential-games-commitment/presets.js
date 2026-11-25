import { node, leaf, prepare, twoStage, backwardInduction } from './trees.js'
import { CLASSICS } from '../what-is-a-game/games.js'

// The trees of Figure F1 and Panel A, with their move names in English and
// Italian. Pure logic, shared by the page and scripts/lab/check-game-theory-04.mjs.

export const NAMES = {
  en: {
    out: ['Stay out', 'O'], in: ['Enter', 'E'], share: ['Share', 'S'], fight: ['Fight', 'F'],
    commit: ['Commit', 'C'], free: ['Wait', 'W'],
    concert: ['Concert', 'C'], match: ['Match', 'M'], heads: ['Heads', 'H'], tails: ['Tails', 'T'],
    take: ['Take', 'T'], pass: ['Pass', 'P'],
    U: ['Up', 'U'], D: ['Down', 'D'], L: ['Left', 'L'], R: ['Right', 'R'],
  },
  it: {
    out: ['Resta fuori', 'F'], in: ['Entra', 'E'], share: ['Dividi', 'D'], fight: ['Combatti', 'C'],
    commit: ['Impegnati', 'I'], free: ['Aspetta', 'A'],
    concert: ['Concerto', 'C'], match: ['Partita', 'P'], heads: ['Testa', 'T'], tails: ['Croce', 'C'],
    take: ['Prendi', 'P'], pass: ['Lascia', 'L'],
    U: ['Su', 'S'], D: ['GiÃƒÂ¹', 'G'], L: ['Sinistra', 'S'], R: ['Destra', 'D'],
  },
}

// The entry game of Figure F1, payoffs (newcomer, firm): stay out (0, 4);
// enter and share (2, 2); enter and fight (Ã¢Ë†â€™1, f). With `commit`, the firm
// moves first: committing removes "share" and costs k on every payoff of the
// firm below it. Player 0 is the newcomer, player 1 the firm.
export const ENTRY = { out: [0, 4], share: [2, 2], fight: [-1, 0] }
export const DEFAULT_F = 0
export const DEFAULT_K = 1

export function entryTree({ f = DEFAULT_F, k = DEFAULT_K, commit = false } = {}, lang = 'en') {
  const n = NAMES[lang] || NAMES.en
  const plain = () =>
    node(0, [
      [...n.out, leaf(...ENTRY.out)],
      [...n.in, node(1, [[...n.share, leaf(...ENTRY.share)], [...n.fight, leaf(-1, f)]])],
    ])
  if (!commit) return prepare(plain())
  const committed = node(0, [
    [...n.out, leaf(0, 4 - k)],
    [...n.in, node(1, [[...n.fight, leaf(-1, f - k)]])],
  ])
  // "Wait" is listed first, so that a firm indifferent between the two does not
  // pay for a commitment (backward induction gives ties to the first move).
  return prepare(node(1, [[...n.free, plain()], [...n.commit, committed]]))
}

// What happens in Figure F1, in a few words the page turns into a sentence.
export function entryStory({ f = DEFAULT_F, k = DEFAULT_K, commit = false } = {}, lang = 'en') {
  const t = entryTree({ f, k, commit }, lang)
  const bi = backwardInduction(t)
  const firmNode = commit ? t.root.moves[0].child.moves[1].child : t.root.moves[1].child
  const shares = bi.choice.get(firmNode.id) === 0
  const tieFirm = f === ENTRY.share[1]
  const credible = f > ENTRY.share[1]
  const commits = commit ? bi.choice.get(t.root.id) === 1 : false
  const without = credible ? ENTRY.out[1] : ENTRY.share[1] // what the firm gets without committing
  return {
    tree: t, bi, outcome: bi.outcome.payoffs, credible, tieFirm, shares, commits,
    without, withCommit: 4 - k, tieCommit: commit && 4 - k === without,
  }
}

// ------------------------------------------------------------------ Panel A

export const TREE_PRESETS = ['entry', 'commit', 'battle', 'pennies', 'centipede', 'random']

// The centipede of Panel A: pots (1, 0), (0, 2), (3, 1), (2, 4), and (5, 3)
// if nobody takes, as payoffs of the first and second player.
export const CENTIPEDE = [[1, 0], [0, 2], [3, 1], [2, 4], [5, 3]]

function centipede(n) {
  const take = (k) => [...n.take, leaf(...CENTIPEDE[k])]
  let tail = leaf(...CENTIPEDE[4])
  for (let k = 3; k >= 0; k--) tail = node(k % 2, [take(k), [...n.pass, tail]])
  return prepare(tail)
}

// In every Panel A tree player 0 moves first and payoffs are (first, second).
export function presetTree(id, lang = 'en', cells = null) {
  const n = NAMES[lang] || NAMES.en
  if (id === 'entry') return entryTree({ f: 0 }, lang)
  if (id === 'commit') {
    // The firm moves first here, so it is player 0: payoffs (firm, newcomer).
    const plain = node(1, [
      [...n.out, leaf(4, 0)],
      [...n.in, node(0, [[...n.share, leaf(2, 2)], [...n.fight, leaf(0, -1)]])],
    ])
    const committed = node(1, [
      [...n.out, leaf(3, 0)],
      [...n.in, node(0, [[...n.fight, leaf(-1, -1)]])],
    ])
    return prepare(node(0, [[...n.free, plain], [...n.commit, committed]]))
  }
  if (id === 'battle' || id === 'pennies') {
    const [x, y] = id === 'battle' ? [n.concert, n.match] : [n.heads, n.tails]
    return twoStage(CLASSICS[id], { U: x, D: y, L: x, R: y })
  }
  if (id === 'centipede') return centipede(n)
  return twoStage(cells, { U: n.U, D: n.D, L: n.L, R: n.R })
}

// Who the two players are in each preset (for the page).
export const PLAYERS = {
  en: {
    entry: ['Newcomer', 'Firm'], commit: ['Firm', 'Newcomer'], battle: ['Row player', 'Column player'],
    pennies: ['Row player', 'Column player'], centipede: ['First player', 'Second player'], random: ['First player', 'Second player'],
  },
  it: {
    entry: ['Nuovo arrivato', 'Impresa'], commit: ['Impresa', 'Nuovo arrivato'], battle: ['Giocatore di riga', 'Giocatore di colonna'],
    pennies: ['Giocatore di riga', 'Giocatore di colonna'], centipede: ['Primo giocatore', 'Secondo giocatore'], random: ['Primo giocatore', 'Secondo giocatore'],
  },
}
