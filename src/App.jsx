import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Manifesto from './pages/Manifesto.jsx'
import People from './pages/People.jsx'
import ResearchFellows from './pages/ResearchFellows.jsx'
import Research from './pages/Research.jsx'
import BitcoinScienceLibrary from './pages/BitcoinScienceLibrary.jsx'
import Publications from './pages/Publications.jsx'
import SponsoredResearch from './pages/SponsoredResearch.jsx'
import OpenProblems from './pages/OpenProblems.jsx'
import News from './pages/News.jsx'
import Conferences from './pages/Conferences.jsx'
import Seminars from './pages/Seminars.jsx'
import Workshops from './pages/Workshops.jsx'
import CommunityEvents from './pages/CommunityEvents.jsx'
import NewsletterIndex from './pages/NewsletterIndex.jsx'
import NewsletterIssue01 from './pages/NewsletterIssue01.jsx'
import Education from './pages/Education.jsx'
import BitcoinFundamentals from './pages/BitcoinFundamentals.jsx'
import Contact from './pages/Contact.jsx'
import Collaborate from './pages/Collaborate.jsx'
import IndustryConnections from './pages/IndustryConnections.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/manifesto" element={<Manifesto />} />
        <Route path="/people" element={<People />} />
        <Route path="/people/research-fellows" element={<ResearchFellows />} />
        <Route path="/research" element={<Research />} />
        <Route path="/research/bitcoin-science-library" element={<BitcoinScienceLibrary />} />
        <Route path="/research/publications" element={<Publications />} />
        <Route path="/research/sponsored-research" element={<SponsoredResearch />} />
        <Route path="/research/open-problems" element={<OpenProblems />} />
        <Route path="/news" element={<News />} />
        <Route path="/news/conferences" element={<Conferences />} />
        <Route path="/news/seminars" element={<Seminars />} />
        <Route path="/news/workshops" element={<Workshops />} />
        <Route path="/news/community-events" element={<CommunityEvents />} />
        <Route path="/news/newsletter" element={<NewsletterIndex />} />
        <Route path="/news/newsletter/issue-01" element={<NewsletterIssue01 />} />
        <Route path="/education" element={<Education />} />
        <Route path="/education/bitcoin-fundamentals" element={<BitcoinFundamentals />} />
        <Route path="/about/contact" element={<Contact />} />
        <Route path="/collaborate" element={<Collaborate />} />
        <Route path="/collaborate/industry-connections" element={<IndustryConnections />} />
      </Routes>
    </BrowserRouter>
  )
}
