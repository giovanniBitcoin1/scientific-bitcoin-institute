export default function Footer() {
  const columns = [
    {
      title: 'Research',
      links: ['Research Themes', 'Publications', 'Working Papers', 'Open Problems'],
    },
    {
      title: 'Education',
      links: ['Online Courses', 'Summer School', 'Workshops', 'Resources'],
    },
    {
      title: 'Community',
      links: ['News & Updates', 'Events', 'Newsletter', 'Social Media'],
    },
    {
      title: 'Support',
      links: ['Donate Bitcoin', 'Endowment Fund', 'Research Grants', 'Contact Us'],
    },
  ]

  return (
    <footer className="bg-slate-900 text-slate-300 py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {columns.map((col, idx) => (
            <div key={idx}>
              <h4 className="text-white font-bold mb-4 font-serif">{col.title}</h4>
              <ul className="space-y-2 text-sm">
                {col.links.map((link, i) => (
                  <li key={i}>
                    <a href="#" className="hover:text-orange-400 transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
          <p>&copy; {new Date().getFullYear()} Scientific Bitcoin Institute. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-orange-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-orange-400 transition-colors">Terms of Use</a>
            <a href="#" className="hover:text-orange-400 transition-colors">Code of Conduct</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
