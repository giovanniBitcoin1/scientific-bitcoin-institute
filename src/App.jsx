import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Manifesto from './pages/Manifesto.jsx'
import People from './pages/People.jsx'
import Research from './pages/Research.jsx'
import BitcoinScienceLibrary from './pages/BitcoinScienceLibrary.jsx'
import Publications from './pages/Publications.jsx'
import SponsoredResearch from './pages/SponsoredResearch.jsx'
import OpenProblems from './pages/OpenProblems.jsx'
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
        <Route path="/research/publications" element={<Publications />} />
        <Route path="/research/sponsored-research" element={<SponsoredResearch />} />
        <Route path="/research/open-problems" element={<OpenProblems />} />
        <Route path="/education" element={<Education />} />
        <Route path="/education/bitcoin-fundamentals" element={<BitcoinFundamentals />} />
      </Routes>
    </BrowserRouter>
  )
}
