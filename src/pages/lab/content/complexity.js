import sims from '../../../components/lab/sims/index.js'

// Complexity Lab content: every lecture and every sim, in one chunk that
// LabChapter requests only when the Lab is unlocked.
// Lecture text: src/content/lab/<slug>.<lang>.md.
const rawFiles = import.meta.glob('../../../content/lab/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
})

export default function getContent(slug) {
  return {
    lectures: {
      en: rawFiles[`../../../content/lab/${slug}.en.md`],
      it: rawFiles[`../../../content/lab/${slug}.it.md`],
    },
    Sim: sims[slug],
  }
}
