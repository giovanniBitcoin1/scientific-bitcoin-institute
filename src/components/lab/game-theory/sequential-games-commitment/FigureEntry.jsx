import { useMemo, useState } from 'react'
import Slider from '../../Slider.jsx'
import { Pill } from '../../network/ui.jsx'
import GameTree from '../GameTree.jsx'
import { ROW_COLOR, COL_COLOR } from '../PayoffTable.jsx'
import { entryStory, DEFAULT_F, DEFAULT_K } from './presets.js'

// Live figure F1: the entry game as a tree, payoffs (newcomer, firm). Slider
// f, the firm's payoff from fighting; a toggle gives the firm a first move
// that removes "share" at a cost k. The path of backward induction is drawn
// in orange and a line says what happens and why. Sliders, a pill and SVG:
// nothing captures a swipe.

export const num = (v, lang = 'en') => {
  const s = Number.isInteger(v) ? String(v) : String(Math.round(v * 100) / 100)
  return (lang === 'it' ? s.replace('.', ',') : s).replace('-', '−')
}

const T = {
  en: {
    f: 'f, the firm’s payoff from fighting',
    k: 'k, the cost of committing',
    commit: 'The firm can commit first',
    initials: ['N', 'F'],
    legend: ['newcomer', 'firm'],
    path: 'orange: the path of backward induction; dashed: moves not chosen',
    aria: 'The entry game drawn as a tree, with the path of backward induction',
    story(s, f, k, lang) {
      const n = (v) => num(v, lang)
      if (!s.commits && s.credible) {
        return s.tree.root.player === 1
          ? `The threat is credible without help: fighting pays the firm ${n(f)}, more than the 2 of sharing. So the firm waits, the newcomer stays out and the firm keeps 4; committing would only cost it k.`
          : `Fighting pays the firm ${n(f)}, more than the 2 of sharing: the threat is credible by itself. The newcomer stays out and the firm keeps 4.`
      }
      if (s.commits) return `Committing removes “share”: after entry the firm could only fight, so the newcomer stays out. The firm gets 4 − k = ${n(4 - k)} instead of the 2 of sharing, so it commits.`
      if (s.tieCommit) return `Committing would leave the firm 4 − k = 2, exactly what sharing gives: the firm is indifferent, and here it waits. The newcomer enters and they share.`
      if (s.tree.root.player === 1) return `Committing would leave the firm 4 − k = ${n(4 - k)}, less than the 2 of sharing: it waits, the newcomer enters and they share, 2 each.`
      if (s.tieFirm) return 'After entry the firm gets 2 whether it shares or fights: it is indifferent, and the tree alone does not settle it (here it shares). With f just above 2 the threat would be credible.'
      return `After entry the firm gets 2 by sharing and ${n(f)} by fighting, so it shares: the threat is empty. The newcomer enters, and both get 2.`
    },
  },
  it: {
    f: 'f, il payoff dell’incumbent se combatte',
    k: 'k, il costo dell’impegno',
    commit: 'L’incumbent può impegnarsi prima',
    initials: ['E', 'I'],
    legend: ['entrante', 'incumbent'],
    path: 'arancione: il cammino dell’induzione a ritroso; tratteggio: mosse non scelte',
    aria: 'Il gioco dell’entrata disegnato come un albero, con il cammino dell’induzione a ritroso',
    story(s, f, k, lang) {
      const n = (v) => num(v, lang)
      if (!s.commits && s.credible) {
        return s.tree.root.player === 1
          ? `La minaccia è credibile senza aiuti: combattere rende all’incumbent ${n(f)}, più del 2 della divisione. Quindi l’incumbent aspetta, l’entrante resta fuori e l’incumbent tiene 4; impegnarsi gli costerebbe soltanto k.`
          : `Combattere rende all’incumbent ${n(f)}, più del 2 della divisione: la minaccia è credibile da sola. L’entrante resta fuori e l’incumbent tiene 4.`
      }
      if (s.commits) return `L’impegno toglie “dividi”: dopo l’entrata l’incumbent potrebbe solo combattere, e quindi l’entrante resta fuori. L’incumbent ottiene 4 − k = ${n(4 - k)} invece del 2 della divisione, e si impegna.`
      if (s.tieCommit) return 'Impegnarsi lascerebbe all’incumbent 4 − k = 2, esattamente quanto rende dividere: l’incumbent è indifferente, e qui aspetta. L’entrante entra e si divide.'
      if (s.tree.root.player === 1) return `Impegnarsi lascerebbe all’incumbent 4 − k = ${n(4 - k)}, meno del 2 della divisione: aspetta, l’entrante entra e si divide, 2 ciascuno.`
      if (s.tieFirm) return 'Dopo l’entrata l’incumbent ottiene 2 sia dividendo sia combattendo: è indifferente, e l’albero da solo non decide (qui divide). Con f appena sopra 2 la minaccia sarebbe credibile.'
      return `Dopo l’entrata l’incumbent ottiene 2 dividendo e ${n(f)} combattendo, quindi divide: la minaccia non è credibile. L’entrante entra, ed entrambi ottengono 2.`
    },
  },
}

export default function FigureEntry({ lang = 'en' }) {
  const t = T[lang] || T.en
  const [f, setF] = useState(DEFAULT_F)
  const [k, setK] = useState(DEFAULT_K)
  const [commit, setCommit] = useState(false)
  const s = useMemo(() => entryStory({ f, k, commit }, lang), [f, k, commit, lang])
  const tree = s.tree
  const solvedIds = new Set(tree.nodes.filter((n) => !n.payoffs).map((n) => n.id))
  const path = new Set(s.bi.path.map((n) => n.id))

  return (
    <div className="grid gap-x-6 gap-y-3 md:grid-cols-[minmax(0,1fr)_minmax(0,17rem)] items-start">
      <div className="min-w-0 max-w-md">
        <GameTree
          tree={tree}
          initials={t.initials}
          choice={s.bi.choice}
          solved={solvedIds}
          path={path}
          format={(v) => num(v, lang)}
          aria={t.aria}
        />
        <p className="mt-1 text-[11px] text-slate-600 leading-snug">
          <span className="font-semibold" style={{ color: ROW_COLOR }}>
            {t.initials[0]} {t.legend[0]}
          </span>
          {' · '}
          <span className="font-semibold" style={{ color: COL_COLOR }}>
            {t.initials[1]} {t.legend[1]}
          </span>
          {' · '}
          {t.path}
        </p>
      </div>
      <div className="min-w-0 space-y-3">
        <Slider label={t.f} min={-2} max={3} step={0.5} value={f} onChange={setF} format={(v) => num(v, lang)} />
        <div>
          <Pill active={commit} onClick={() => setCommit(!commit)}>
            {t.commit}
          </Pill>
        </div>
        {commit && <Slider label={t.k} min={0} max={3} step={0.25} value={k} onChange={setK} format={(v) => num(v, lang)} />}
        <p className="text-sm text-slate-700 leading-snug" data-role="entry-story">
          {t.story(s, f, k, lang)}
        </p>
      </div>
    </div>
  )
}
