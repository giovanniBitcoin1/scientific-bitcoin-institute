// Loads every event in src/data/journal/*.json at build time via Vite's
// import.meta.glob (eager). Add a new event by dropping a JSON file in that
// folder — no imports to wire up. Events are sorted most-recent-first by date.
const modules = import.meta.glob('./journal/*.json', { eager: true })

const events = Object.values(modules)
  .map((m) => m.default)
  .sort((a, b) => b.date.localeCompare(a.date))

export default events
