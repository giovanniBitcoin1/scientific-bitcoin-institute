import { useState } from 'react'
import { Menu, X, Search } from './Icons.jsx'
import navItems from '../data/nav.json'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md shadow-sm z-50 border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center gap-3">
            <img
              src="/assets/logo.jpg"
              alt="Scientific Bitcoin Institute"
              className="w-16 h-16 object-contain"
            />
            <div className="flex flex-col leading-tight">
              <span className="text-lg font-semibold tracking-tight text-slate-900 font-serif">Scientific Bitcoin</span>
              <span className="text-lg font-semibold tracking-tight text-slate-900 font-serif">Institute</span>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item, idx) => (
              <div key={idx} className="nav-item relative">
                <a
                  href={item.href}
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-orange-600 transition-colors block"
                >
                  {item.label}
                </a>
                {item.submenu && (
                  <div className="nav-dropdown mt-0 bg-white shadow-xl rounded-lg min-w-[220px] py-2 border border-slate-100">
                    {item.submenu.map((subitem, subidx) => (
                      <a
                        key={subidx}
                        href="#"
                        className="block px-6 py-2.5 text-sm text-slate-600 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                      >
                        {subitem}
                      </a>
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
              <a href={item.href} className="block px-6 py-4 font-medium text-slate-800">
                {item.label}
              </a>
              {item.submenu && (
                <div className="bg-slate-50 px-6 py-2">
                  {item.submenu.map((subitem, subidx) => (
                    <a key={subidx} href="#" className="block py-2 text-sm text-slate-600">
                      {subitem}
                    </a>
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
