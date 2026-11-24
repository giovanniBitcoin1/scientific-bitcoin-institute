import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Search } from './Icons.jsx'
import navItems from '../data/nav.json'
import { labs } from '../data/lab/registry.js'
import { LABS_HUB } from '../data/lab/paths.js'

const submenuHrefs = {
  'Manifesto': '/manifesto',
  'Team': '/people',
  'Research Areas': '/research',
  'Bitcoin Science Library': '/research/bitcoin-science-library',
  'Publications': '/research/publications',
  'Sponsored Research': '/research/sponsored-research',
  'Open Problems': '/research/open-problems',
  'Insights': '/insights',
  'Research Fellows': '/people/research-fellows',
  'Faculty': '/people/faculty',
  'Postdocs': '/people/postdocs',
  'Visiting Scholars': '/people/visiting-scholars',
  'Advisory Board': '/people#advisory-board',
  'Latest News': '/news',
  'Conferences': '/news/conferences',
  'Seminars': '/news/seminars',
  'Workshops': '/news/workshops',
  'Community Events': '/news/community-events',
  'Newsletter': '/insights/dispatch',
  'Event Journal': '/news/journal',
  'Academic Day': '/events/academic-day',
  'Bitcoin Fundamentals': '/education/bitcoin-fundamentals',
  'Advanced Cryptography': '/education/advanced-cryptography',
  'Game Theory': '/education/game-theory',
  'Network Science': '/education/network-science',
  'Complexity Science': '/education/complexity-science',
  'Economic Models': '/education/economic-models',
  'Online Courses': '/education/online-courses',
  'Summer School': '/education/summer-school',
  'Mission': '/manifesto#mission',
  'History': '/about/history',
  'FAQs': '/about/faqs',
  'Governance': '/about/transparency#governance',
  'Transparency': '/about/transparency',
  'Contact': '/about/contact',
  'Collaborate': '/collaborate',
  'Industry Connections': '/collaborate/industry-connections',
  'Research Partnerships': '/collaborate/research-partnerships',
  'Developer Relations': '/collaborate/developer-relations',
  'Academic Programs': '/collaborate/academic-programs',
  'Grant Opportunities': '/collaborate/grant-opportunities',
  'Support': '/support',
  'Become a Member': '/support/membership',
  'Donate': '/support/donate',
  'Donate Bitcoin': '/support/donate-bitcoin',
  'Endowment Fund': '/support/endowment-fund',
  'Research Grants': '/support/research-grants',
  'Seed Tool': '/seed-tool',
}

function subHref(label) {
  return submenuHrefs[label] || '#'
}

// The dropdown of a nav item as { label, href } pairs. An item with
// "labs": true (the "Labs" entry) lists the labs of the registry, so a new
// lab appears in the nav by itself; any other item lists its `submenu` labels.
function submenuOf(item) {
  if (item.labs) return labs.map((lab) => ({ label: lab.name, href: lab.basePath }))
  return item.submenu ? item.submenu.map((label) => ({ label, href: subHref(label) })) : null
}

// "Labs" is the current section on the hub and on every page of every lab.
function inLabs(pathname) {
  const path = pathname.replace(/\/+$/, '') || '/'
  return path === LABS_HUB || labs.some((lab) => path === lab.basePath || path.startsWith(`${lab.basePath}/`))
}

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const labsActive = inLabs(useLocation().pathname)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-slate-900/95 backdrop-blur-sm border-b border-white/10 shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/assets/logo.jpg"
              alt="Scientific Bitcoin Institute"
              className="w-20 h-20 object-contain"
            />
            <div
              className="flex lg:hidden xl:flex flex-col leading-tight"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              <span className="text-xl md:text-2xl font-semibold tracking-tight text-white leading-tight">Scientific Bitcoin</span>
              <span className="text-xl md:text-2xl font-semibold tracking-tight text-white leading-tight">Institute</span>
            </div>
          </Link>

          {/* Right cluster: nav + persistent Donate + mobile toggle */}
          <div className="flex items-center gap-3">
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {navItems.map((item, idx) => {
              const submenu = submenuOf(item)
              return (
              <div key={idx} className="nav-item relative">
                {item.labs ? (
                  <Link
                    to={item.href}
                    aria-haspopup="true"
                    aria-current={labsActive ? 'page' : undefined}
                    className={`px-1.5 xl:px-2.5 py-2 whitespace-nowrap text-[12px] xl:text-[13px] font-medium hover:text-orange-400 transition-colors duration-200 block ${
                      labsActive ? 'text-orange-400' : 'text-white/85'
                    }`}
                  >
                    {item.label}
                  </Link>
                ) : item.submenu ? (
                  <span
                    className="px-1.5 xl:px-2.5 py-2 whitespace-nowrap text-[12px] xl:text-[13px] font-medium text-white/85 hover:text-orange-400 transition-colors duration-200 block cursor-default select-none"
                    aria-haspopup="true"
                  >
                    {item.label}
                  </span>
                ) : item.external ? (
                  <a
                    href={item.href}
                    className="px-1.5 xl:px-2.5 py-2 whitespace-nowrap text-[12px] xl:text-[13px] font-medium text-white/85 hover:text-orange-400 transition-colors duration-200 block"
                  >
                    {item.label}
                  </a>
                ) : (
                  <Link
                    to={item.href}
                    className="px-1.5 xl:px-2.5 py-2 whitespace-nowrap text-[12px] xl:text-[13px] font-medium text-white/85 hover:text-orange-400 transition-colors duration-200 block"
                  >
                    {item.label}
                  </Link>
                )}
                {submenu && (
                  <div className="nav-dropdown mt-0 bg-slate-800/95 backdrop-blur-sm shadow-xl rounded-lg min-w-[220px] py-2 border border-white/10">
                    {submenu.map((sub, subidx) => (
                      <Link
                        key={subidx}
                        to={sub.href}
                        className="block px-6 py-2.5 text-sm text-white/80 hover:bg-white/5 hover:text-orange-400 transition-colors"
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              )
            })}
            <button className="ml-2 p-2 text-white hover:text-orange-400 transition-colors duration-200" aria-label="Search">
              <Search size={20} />
            </button>
          </nav>

          {/* Persistent Donate button — always visible */}
          <Link
            to="/support/donate"
            className="px-4 sm:px-5 py-2 rounded-full bitcoin-gradient text-white text-[13px] font-semibold hover:opacity-90 transition-opacity whitespace-nowrap shadow-sm"
          >
            Donate
          </Link>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-900 border-t border-white/10 max-h-[80vh] overflow-y-auto">
          <Link
            to="/support/donate"
            onClick={() => setMobileMenuOpen(false)}
            className="block m-4 text-center px-6 py-3 rounded-full bitcoin-gradient text-white font-semibold"
          >
            Donate
          </Link>
          {navItems.map((item, idx) => {
            const submenu = submenuOf(item)
            return (
            <div key={idx} className="border-b border-white/10">
              {item.labs ? (
                <Link
                  to={item.href}
                  aria-current={labsActive ? 'page' : undefined}
                  className={`block px-6 py-4 font-medium hover:text-orange-400 transition-colors ${
                    labsActive ? 'text-orange-400' : 'text-white'
                  }`}
                >
                  {item.label}
                </Link>
              ) : item.submenu ? (
                <span className="block px-6 py-4 font-medium text-white select-none">
                  {item.label}
                </span>
              ) : item.external ? (
                <a href={item.href} className="block px-6 py-4 font-medium text-white hover:text-orange-400 transition-colors">
                  {item.label}
                </a>
              ) : (
                <Link to={item.href} className="block px-6 py-4 font-medium text-white hover:text-orange-400 transition-colors">
                  {item.label}
                </Link>
              )}
              {submenu && (
                <div className="bg-slate-800/60 px-6 py-2">
                  {submenu.map((sub, subidx) => (
                    <Link key={subidx} to={sub.href} className="block py-2 text-sm text-white/75 hover:text-orange-400 transition-colors">
                      {sub.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            )
          })}
        </div>
      )}
    </header>
  )
}
