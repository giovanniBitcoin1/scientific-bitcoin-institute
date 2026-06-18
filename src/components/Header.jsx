import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X, Search } from './Icons.jsx'
import navItems from '../data/nav.json'

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
  'Newsletter': '/news/newsletter',
  'Event Journal': '/news/journal',
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
  'Donate': '/support/donate',
  'Donate Bitcoin': '/support/donate-bitcoin',
  'Endowment Fund': '/support/endowment-fund',
  'Research Grants': '/support/research-grants',
}

function subHref(label) {
  return submenuHrefs[label] || '#'
}

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

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
              className="flex flex-col leading-tight"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              <span className="text-xl md:text-2xl font-semibold tracking-tight text-white leading-tight">Scientific Bitcoin</span>
              <span className="text-xl md:text-2xl font-semibold tracking-tight text-white leading-tight">Institute</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {navItems.map((item, idx) => (
              <div key={idx} className="nav-item relative">
                {item.submenu ? (
                  <span
                    className="px-3 py-2 text-[13px] font-medium text-white/85 hover:text-orange-400 transition-colors duration-200 block cursor-default select-none"
                    aria-haspopup="true"
                  >
                    {item.label}
                  </span>
                ) : (
                  <Link
                    to={item.href}
                    className="px-3 py-2 text-[13px] font-medium text-white/85 hover:text-orange-400 transition-colors duration-200 block"
                  >
                    {item.label}
                  </Link>
                )}
                {item.submenu && (
                  <div className="nav-dropdown mt-0 bg-slate-800/95 backdrop-blur-sm shadow-xl rounded-lg min-w-[220px] py-2 border border-white/10">
                    {item.submenu.map((subitem, subidx) => (
                      <Link
                        key={subidx}
                        to={subHref(subitem)}
                        className="block px-6 py-2.5 text-sm text-white/80 hover:bg-white/5 hover:text-orange-400 transition-colors"
                      >
                        {subitem}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <button className="ml-2 p-2 text-white hover:text-orange-400 transition-colors duration-200" aria-label="Search">
              <Search size={20} />
            </button>
          </nav>

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

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-900 border-t border-white/10 max-h-[80vh] overflow-y-auto">
          {navItems.map((item, idx) => (
            <div key={idx} className="border-b border-white/10">
              {item.submenu ? (
                <span className="block px-6 py-4 font-medium text-white select-none">
                  {item.label}
                </span>
              ) : (
                <Link to={item.href} className="block px-6 py-4 font-medium text-white hover:text-orange-400 transition-colors">
                  {item.label}
                </Link>
              )}
              {item.submenu && (
                <div className="bg-slate-800/60 px-6 py-2">
                  {item.submenu.map((subitem, subidx) => (
                    <Link key={subidx} to={subHref(subitem)} className="block py-2 text-sm text-white/75 hover:text-orange-400 transition-colors">
                      {subitem}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </header>
  )
}
