export default function StatsBanner() {
  return (
    <section className="py-6 bitcoin-gradient">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-center gap-8 text-white text-sm font-medium">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span>150+ Research Papers Published</span>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span>40+ International Researchers</span>
          </div>
          <div className="hidden lg:flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span>15+ Active Research Projects</span>
          </div>
        </div>
      </div>
    </section>
  )
}
