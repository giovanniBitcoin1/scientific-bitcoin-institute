import yaml from 'js-yaml'

function parseFrontmatter(raw) {
  const match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  if (!match) {
    return { data: {}, content: raw };
  }
  let data = {};
  try {
    data = yaml.load(match[1]) || {};
  } catch (e) {
    console.error('Failed to parse frontmatter:', e);
    data = {};
  }
  return { data, content: match[2] };
}

function computeReadingTime(body) {
  const text = (body || '').replace(/```[\s\S]*?```/g, ' ').replace(/<[^>]+>/g, ' ');
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min read`;
}

// Eagerly import all top-level *.md files in src/content/insights/ as raw strings.
// The glob is intentionally NON-recursive (`./.../*.md`, not `**/*.md`) so the
// per-article image folders (e.g. the-strategy-machine/) are excluded.
const rawFiles = import.meta.glob('../content/insights/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
})

function slugFromPath(path) {
  // ../content/insights/the-strategy-machine.md -> the-strategy-machine
  return path.split('/').pop().replace(/\.md$/, '')
}

function formatLongDate(date) {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function buildArticle(path, raw) {
  const { data, content } = parseFrontmatter(raw)

  // Date frontmatter may be parsed by gray-matter as a Date already, or as a
  // string ("2026-06-16"). Normalize to a Date, parsing date-only strings as
  // local (not UTC) to avoid off-by-one day shifts.
  let date
  if (data.date instanceof Date) {
    date = data.date
  } else if (typeof data.date === 'string') {
    const [y, m, d] = data.date.split('-').map(Number)
    date = new Date(y, (m || 1) - 1, d || 1)
  } else {
    date = new Date(0)
  }

  return {
    slug: data.slug || slugFromPath(path),
    title: data.title || '',
    subtitle: data.subtitle || '',
    summary: data.summary || '',
    date,
    formattedDate: formatLongDate(date),
    author: data.author || '',
    tags: Array.isArray(data.tags) ? data.tags : [],
    heroImage: data.hero_image || '',
    body: content,
    readingTime: computeReadingTime(content),
  }
}

const articles = Object.entries(rawFiles)
  // Exclude any file whose name starts with an underscore (e.g. _template.md)
  .filter(([path]) => !slugFromPath(path).startsWith('_'))
  .map(([path, raw]) => buildArticle(path, raw))
  // Reverse-chronological by date frontmatter (newest first)
  .sort((a, b) => b.date.getTime() - a.date.getTime())

export function getArticles() {
  return articles
}

export function getArticleBySlug(slug) {
  return articles.find((a) => a.slug === slug) || null
}

// All unique tags across the catalog, sorted — ready for future filter UI.
export function getAllTags() {
  const set = new Set()
  for (const a of articles) for (const t of a.tags) set.add(t)
  return Array.from(set).sort((a, b) => a.localeCompare(b))
}

export default articles
