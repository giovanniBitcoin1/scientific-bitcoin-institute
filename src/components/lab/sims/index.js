import LogisticMap from './LogisticMap.jsx'
import RandomNetwork from './RandomNetwork.jsx'

// Module slug → simulation component. Each sim receives a `lang` prop ("en" | "it").
const sims = {
  'what-is-complexity': LogisticMap,
  'random-networks': RandomNetwork,
}

export default sims
