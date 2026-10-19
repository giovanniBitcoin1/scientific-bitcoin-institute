import LogisticMap from './LogisticMap.jsx'
import RandomNetwork from './RandomNetwork.jsx'
import SmallWorld from './SmallWorld.jsx'
import ScaleFree from './ScaleFree.jsx'
import CellularAutomata from './CellularAutomata.jsx'
import GameOfLife from './GameOfLife.jsx'
import FractalsPercolation from './FractalsPercolation.jsx'
import SelfOrganizedCriticality from './SelfOrganizedCriticality.jsx'
import AgentBasedModels from './AgentBasedModels.jsx'

// Module slug → simulation component. Each sim receives a `lang` prop ("en" | "it").
const sims = {
  'what-is-complexity': LogisticMap,
  'random-networks': RandomNetwork,
  'small-worlds': SmallWorld,
  'scale-free': ScaleFree,
  'cellular-automata': CellularAutomata,
  'game-of-life': GameOfLife,
  'fractals-percolation': FractalsPercolation,
  'self-organized-criticality': SelfOrganizedCriticality,
  'agent-based-models': AgentBasedModels,
}

export default sims
