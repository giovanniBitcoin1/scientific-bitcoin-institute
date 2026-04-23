import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Manifesto from './pages/Manifesto.jsx'
import People from './pages/People.jsx'
import Research from './pages/Research.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/manifesto" element={<Manifesto />} />
        <Route path="/people" element={<People />} />
        <Route path="/research" element={<Research />} />
      </Routes>
    </BrowserRouter>
  )
}
