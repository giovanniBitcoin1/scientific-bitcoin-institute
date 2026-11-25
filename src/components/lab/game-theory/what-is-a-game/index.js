import en from '../../../../content/game-theory-lab/what-is-a-game.en.md?raw'
import it from '../../../../content/game-theory-lab/what-is-a-game.it.md?raw'
import GameExplorerPanel from './GameExplorerPanel.jsx'
import GuessingPanel from './GuessingPanel.jsx'
import DominancePanel from './DominancePanel.jsx'
import FigureEliminate from './FigureEliminate.jsx'
import FigureAtlas from './FigureAtlas.jsx'
import { observe, exercises } from './texts.js'

// Game Theory Lab, module 01 "What is a game?": the content object that
// src/pages/lab/loaders.js hands to LabLecture. This folder is one chunk.
export default {
  lectures: { en, it },
  // Live figures, placed in the lecture by a ```figure block holding the id.
  figures: {
    eliminate: {
      Component: FigureEliminate,
      caption: {
        en: 'Delete what you would never play: one strictly dominated row or column goes at each step.',
        it: 'Cancella ciò che non giocheresti mai: a ogni passo esce una riga o una colonna strettamente dominata.',
      },
    },
    atlas: {
      Component: FigureAtlas,
      caption: {
        en: 'A map of two-by-two games: with R = 1 and P = 0, the numbers T and S decide which game it is.',
        it: 'Una mappa dei giochi due per due: con R = 1 e P = 0, i numeri T e S decidono di quale gioco si tratta.',
      },
    },
  },
  panels: [
    {
      id: 'explorer',
      title: { en: 'Game explorer', it: 'Esploratore di giochi' },
      Component: GameExplorerPanel,
      observe: observe.explorer,
    },
    {
      id: 'guessing',
      title: { en: 'Guess two thirds of the average', it: 'Indovina i due terzi della media' },
      Component: GuessingPanel,
      observe: observe.guessing,
    },
    {
      id: 'dominance',
      title: { en: 'How far does dominance go?', it: 'Fin dove arriva la dominanza?' },
      Component: DominancePanel,
      observe: observe.dominance,
    },
  ],
  exercises,
}
