// How each lab's module content is fetched, keyed by lab id. Every loader
// takes a slug and resolves to the module's content object (or null):
//
//   lectures   { en, it }  raw markdown
//   Sim        one simulation component                (Complexity Lab)
//   panels     [{ id, title: { en, it }, Component, observe: { en, it } }]
//   figures    { id: { Component, caption: { en, it } } }   live figures
//   exercises  [{ type, statement: { en, it }, solution: { en, it } }]
//
// All imports here are dynamic, so nothing is fetched while the labs are
// locked and each lab's code stays in its own chunks.

// Network Lab: one folder per module, src/components/lab/network/<slug>/,
// whose index.js default-exports the content object. One chunk per module.
const networkModules = import.meta.glob('../../components/lab/network/*/index.js')

export const loaders = {
  // The Complexity Lab ships all its lectures and sims as one chunk.
  complexity: (slug) => import('./content/complexity.js').then((m) => m.default(slug)),
  network: (slug) => {
    const load = networkModules[`../../components/lab/network/${slug}/index.js`]
    return load ? load().then((m) => m.default) : Promise.resolve(null)
  },
}
