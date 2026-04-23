import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Manifesto from './pages/Manifesto.jsx'
import People from './pages/People.jsx'
import Research from './pages/Research.jsx'
import BitcoinScienceLibrary from './pages/BitcoinScienceLibrary.jsx'
import Education from './pages/Education.jsx'
import BitcoinFundamentals from './pages/BitcoinFundamentals.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/manifesto" element={<Manifesto />} />
        <Route path="/people" element={<People />} />
        <Route path="/research" element={<Research />} />
        <Route path="/research/bitcoin-science-library" element={<BitcoinScienceLibrary />} />
        <Route path="/education" element={<Education />} />
        <Route path="/education/bitcoin-fundamentals" element={<BitcoinFundamentals />} />
      </Routes>
    </BrowserRouter>
  )
}
