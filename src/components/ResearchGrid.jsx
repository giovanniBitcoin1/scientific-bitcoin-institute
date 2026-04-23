import { Link } from 'react-router-dom'
import { ChevronRight } from './Icons.jsx'
import areas from '../data/researchAreas.json'

export default function ResearchGrid() {
  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-4 font-serif">Research Areas</h2>
          <p className="text-xl text-slate-600">
            Advancing Bitcoin through rigorous scientific inquiry
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {areas.map((card, idx) => (
            <div
              key={idx}
              className="card-hover group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl bg-white border border-slate-200"
            >
              <div
                className="h-48 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                style={{ backgroundImage: `url(${card.img})` }}
              />
              <div className="absolute top-4 right-4 w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl shadow-lg">
                {card.icon}
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 text-slate-900 font-serif">{card.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{card.desc}</p>
                <Link
                  to={`/research#${card.anchor}`}
                  className="mt-4 text-orange-600 font-semibold text-sm inline-flex items-center gap-2 group-hover:gap-3 transition-all"
                >
                  Learn more
                  <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
