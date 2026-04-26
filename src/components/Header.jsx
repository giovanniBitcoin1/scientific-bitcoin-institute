import { useState } from 'react'
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
  'Research Fellows': '/people/research-fellows',
  'Faculty': '/people/faculty',
  'Postdocs': '/people/postdocs',
  'Visiting Scholars': '/people/visiting-scholars',
  'Latest News': '/news',
  'Conferences': '/news/conferences',
  'Seminars': '/news/seminars',
  'Workshops': '/news/workshops',
  'Community Events': '/news/community-events',
  'Newsletter': '/news/newsletter',
  'Bitcoin Fundamentals': '/education/bitcoin-fundamentals',
  'Advanced Cryptography': '/education/advanced-cryptography',
  'Game Theory': '/education/game-theory',
  'Network Science': '/education/network-science',
  'Complexity Science': '/education/complexity-science',
  'Economic Models': '/education/economic-models',
  'Online Courses': '/education/online-courses',
  'Summer School': '/education/summer-school',
  'Contact': '/about/contact',
  'Collaborate': '/collaborate',
  'Industry Connections': '/collaborate/industry-connections',
  'Research Partnerships': '/collaborate/research-partnerships',
  'Developer Relations': '/collaborate/developer-relations',
  'Academic Programs': '/collaborate/academic-programs',
  'Grant Opportunities': '/collaborate/grant-opportunities',
}

function subHref(label) {
  return submenuHrefs[label] || '#'
}

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md shadow-sm z-50 border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/assets/logo.jpg"
              alt="Scientific Bitcoin Institute"
              className="w-16 h-16 object-contain"
            />
            <div className="flex flex-col leading-tight">
              <span className="text-lg font-semibold tracking-tight text-slate-900 font-serif">Scientific Bitcoin</span>
              <span className="text-lg font-semibold tracking-tight text-slate-900 font-serif">Institute</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item, idx) => (
              <div key={idx} className="nav-item relative">
                {item.submenu ? (
                  <span
                    className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-orange-600 transition-colors block cursor-default select-none"
                    aria-haspopup="true"
                  >
                    {item.label}
                  </span>
                ) : (
                  <Link
                    to={item.href}
                    className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-orange-600 transition-colors block"
                  >
                    {item.label}
                  </Link>
                )}
                {item.submenu && (
                  <div className="nav-dropdown mt-0 bg-white shadow-xl rounded-lg min-w-[220px] py-2 border border-slate-100">
                    {item.submenu.map((subitem, subidx) => (
                      <Link
                        key={subidx}
                        to={subHref(subitem)}
                        className="block px-6 py-2.5 text-sm text-slate-600 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                      >
                        {subitem}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <button className="ml-2 p-2 text-slate-600 hover:text-orange-600 transition-colors" aria-label="Search">
              <Search size={20} />
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-slate-700"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-slate-200 max-h-[80vh] overflow-y-auto">
          {navItems.map((item, idx) => (
            <div key={idx} className="border-b border-slate-100">
              {item.submenu ? (
                <span className="block px-6 py-4 font-medium text-slate-800 select-none">
                  {item.label}
                </span>
              ) : (
                <Link to={item.href} className="block px-6 py-4 font-medium text-slate-800">
                  {item.label}
                </Link>
              )}
              {item.submenu && (
                <div className="bg-slate-50 px-6 py-2">
                  {item.submenu.map((subitem, subidx) => (
                    <Link key={subidx} to={subHref(subitem)} className="block py-2 text-sm text-slate-600">
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
