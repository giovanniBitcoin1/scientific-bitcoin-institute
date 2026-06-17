// Resolves per-article image references to Vite-imported asset URLs.
//
// Images live in src/content/insights/{slug}/{filename}. The markdown and
// frontmatter reference them with an "images/" prefix (e.g.
// "images/chart_powerlaw.png") — a logical prefix that does NOT exist on disk —
// so we resolve by (slug, basename) and ignore any leading folder segments.
const imageModules = import.meta.glob(
  '../content/insights/*/*.{png,jpg,jpeg,webp}',
  { eager: true, query: '?url', import: 'default' },
)

// Map "slug/filename" -> imported URL.
const lookup = {}
for (const [path, url] of Object.entries(imageModules)) {
  const parts = path.split('/')
  const filename = parts.pop()
  const slug = parts.pop()
  lookup[`${slug}/${filename}`] = url
}

export function resolveInsightImage(slug, imagePath) {
  if (!slug || !imagePath) return ''
  const filename = imagePath.split('/').pop()
  return lookup[`${slug}/${filename}`] || ''
}

export default resolveInsightImage
