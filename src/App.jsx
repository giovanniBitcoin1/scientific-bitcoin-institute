import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Manifesto from './pages/Manifesto.jsx'
import People from './pages/People.jsx'
import ResearchFellows from './pages/ResearchFellows.jsx'
import Faculty from './pages/Faculty.jsx'
import Postdocs from './pages/Postdocs.jsx'
import VisitingScholars from './pages/VisitingScholars.jsx'
import Research from './pages/Research.jsx'
import BitcoinScienceLibrary from './pages/BitcoinScienceLibrary.jsx'
import Publications from './pages/Publications.jsx'
import Insights from './pages/Insights.jsx'
import InsightArticle from './pages/InsightArticle.jsx'
import SponsoredResearch from './pages/SponsoredResearch.jsx'
import OpenProblems from './pages/OpenProblems.jsx'
import News from './pages/News.jsx'
import Conferences from './pages/Conferences.jsx'
import Seminars from './pages/Seminars.jsx'
import Workshops from './pages/Workshops.jsx'
import CommunityEvents from './pages/CommunityEvents.jsx'
import DispatchArchive from './pages/DispatchArchive.jsx'
import DispatchIssue from './pages/DispatchIssue.jsx'
import LensArchive from './pages/LensArchive.jsx'
import LensArticle from './pages/LensArticle.jsx'
import OnTheRecord from './pages/OnTheRecord.jsx'
import Subscribe from './pages/Subscribe.jsx'
import { RouteCanonical } from './lib/seo.js'
import { getClaims } from './lib/newsroom.js'
import JournalIndex from './pages/JournalIndex.jsx'
import JournalPost from './pages/JournalPost.jsx'
import Education from './pages/Education.jsx'
import BitcoinFundamentals from './pages/BitcoinFundamentals.jsx'
import AdvancedCryptography from './pages/AdvancedCryptography.jsx'
import GameTheory from './pages/GameTheory.jsx'
import NetworkScience from './pages/NetworkScience.jsx'
import ComplexityScience from './pages/ComplexityScience.jsx'
import EconomicModels from './pages/EconomicModels.jsx'
import OnlineCourses from './pages/OnlineCourses.jsx'
import SummerSchool from './pages/SummerSchool.jsx'
import Contact from './pages/Contact.jsx'
import History from './pages/History.jsx'
import FAQs from './pages/FAQs.jsx'
import Transparency from './pages/Transparency.jsx'
import Support from './pages/Support.jsx'
import Membership from './pages/Membership.jsx'
import Donate from './pages/Donate.jsx'
import DonateBitcoin from './pages/DonateBitcoin.jsx'
import EndowmentFund from './pages/EndowmentFund.jsx'
import ResearchGrantsSupport from './pages/ResearchGrantsSupport.jsx'
import Collaborate from './pages/Collaborate.jsx'
import IndustryConnections from './pages/IndustryConnections.jsx'
import ResearchPartnerships from './pages/ResearchPartnerships.jsx'
import DeveloperRelations from './pages/DeveloperRelations.jsx'
import AcademicPrograms from './pages/AcademicPrograms.jsx'
import GrantOpportunities from './pages/GrantOpportunities.jsx'
import AcademicDay from './pages/AcademicDay.jsx'
import SeedTool from './pages/SeedTool.jsx'
import SeedToolGuide from './pages/SeedToolGuide.jsx'
import { LAB_PATHS, LABS_HUB } from './data/lab/paths.js'

// The labs (Complexity Lab, Network Lab, Game Theory Lab…) are lazy-loaded so their pages, sims
// and lecture text ship in their own chunks instead of the main bundle. One
// index route and one module route are registered per entry of LAB_PATHS,
// plus the hub page that lists the labs (LABS_HUB).
const LabIndex = lazy(() => import('./pages/lab/LabIndex.jsx'))
const LabChapter = lazy(() => import('./pages/lab/LabChapter.jsx'))
const LabsHub = lazy(() => import('./pages/lab/LabsHub.jsx'))

function LabFallback() {
  return <div className="min-h-screen bg-slate-50" />
}

export default function App() {
  return (
    <BrowserRouter>
      <RouteCanonical />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/manifesto" element={<Manifesto />} />
        <Route path="/people" element={<People />} />
        <Route path="/people/research-fellows" element={<ResearchFellows />} />
        <Route path="/people/faculty" element={<Faculty />} />
        <Route path="/people/postdocs" element={<Postdocs />} />
        <Route path="/people/visiting-scholars" element={<VisitingScholars />} />
        <Route path="/research" element={<Research />} />
        <Route path="/research/bitcoin-science-library" element={<BitcoinScienceLibrary />} />
        <Route path="/research/publications" element={<Publications />} />
        <Route path="/research/sponsored-research" element={<SponsoredResearch />} />
        <Route path="/research/open-problems" element={<OpenProblems />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/insights/dispatch" element={<DispatchArchive />} />
        <Route path="/insights/dispatch/:slug" element={<DispatchIssue />} />
        <Route path="/insights/lens" element={<LensArchive />} />
        <Route path="/insights/lens/:slug" element={<LensArticle />} />
        {/* On the record exists only while at least one claim does. */}
        {getClaims().length > 0 && <Route path="/insights/on-the-record" element={<OnTheRecord />} />}
        <Route path="/insights/:slug" element={<InsightArticle />} />
        <Route path="/subscribe" element={<Subscribe />} />
        <Route path="/news" element={<News />} />
        <Route path="/news/conferences" element={<Conferences />} />
        <Route path="/news/seminars" element={<Seminars />} />
        <Route path="/news/workshops" element={<Workshops />} />
        <Route path="/news/community-events" element={<CommunityEvents />} />
        <Route path="/news/newsletter" element={<Navigate to="/insights/dispatch" replace />} />
        <Route path="/news/newsletter/issue-01" element={<Navigate to="/insights/dispatch/001-the-power-law-lands" replace />} />
        <Route path="/newsletter" element={<Navigate to="/insights/dispatch" replace />} />
        <Route path="/news/journal" element={<JournalIndex />} />
        <Route path="/news/journal/:slug" element={<JournalPost />} />
        <Route path="/education" element={<Education />} />
        <Route path="/education/bitcoin-fundamentals" element={<BitcoinFundamentals />} />
        <Route path="/education/advanced-cryptography" element={<AdvancedCryptography />} />
        <Route path="/education/game-theory" element={<GameTheory />} />
        <Route path="/education/network-science" element={<NetworkScience />} />
        <Route path="/education/complexity-science" element={<ComplexityScience />} />
        <Route path="/education/economic-models" element={<EconomicModels />} />
        <Route path="/education/online-courses" element={<OnlineCourses />} />
        <Route path="/education/summer-school" element={<SummerSchool />} />
        <Route path="/about/contact" element={<Contact />} />
        <Route path="/about/history" element={<History />} />
        <Route path="/about/faqs" element={<FAQs />} />
        <Route path="/about/transparency" element={<Transparency />} />
        <Route path="/support" element={<Support />} />
        <Route path="/support/membership" element={<Membership />} />
        <Route path="/support/become-a-member" element={<Navigate to="/support/membership" replace />} />
        <Route path="/support/donate" element={<Donate />} />
        <Route path="/support/donate-bitcoin" element={<DonateBitcoin />} />
        <Route path="/support/endowment-fund" element={<EndowmentFund />} />
        <Route path="/support/research-grants" element={<ResearchGrantsSupport />} />
        <Route path="/collaborate" element={<Collaborate />} />
        <Route path="/collaborate/industry-connections" element={<IndustryConnections />} />
        <Route path="/collaborate/research-partnerships" element={<ResearchPartnerships />} />
        <Route path="/collaborate/developer-relations" element={<DeveloperRelations />} />
        <Route path="/collaborate/academic-programs" element={<AcademicPrograms />} />
        <Route path="/collaborate/grant-opportunities" element={<GrantOpportunities />} />
        <Route path="/events/academic-day" element={<AcademicDay />} />
        <Route path="/seed-tool" element={<SeedTool />} />
        <Route path="/seed-tool/guide" element={<SeedToolGuide />} />
        <Route
          path={LABS_HUB}
          element={
            <Suspense fallback={<LabFallback />}>
              <LabsHub />
            </Suspense>
          }
        />
        {Object.entries(LAB_PATHS).flatMap(([labId, basePath]) => [
          <Route
            key={labId}
            path={basePath}
            element={
              <Suspense fallback={<LabFallback />}>
                <LabIndex labId={labId} />
              </Suspense>
            }
          />,
          <Route
            key={`${labId}/module`}
            path={`${basePath}/:slug`}
            element={
              <Suspense fallback={<LabFallback />}>
                <LabChapter key={labId} labId={labId} />
              </Suspense>
            }
          />,
        ])}
      </Routes>
    </BrowserRouter>
  )
}
