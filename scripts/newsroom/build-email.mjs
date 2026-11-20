// Builds the email of one SBI Dispatch issue, in the markdown form Buttondown
// accepts.
//
//   node scripts/newsroom/build-email.mjs src/content/dispatch/003-x.md [--json]
//
// Prints the subject and the body; with --json, one JSON object
// { subject, body, webUrl, slug, number, summary, image }.
//
// What it does to the issue's markdown:
//   - first line: a link to the web version;
//   - images and internal links made absolute;
//   - ```math fences turned into plain text blocks;
//   - utm_source=dispatch&utm_medium=email&utm_campaign=<NNN> appended to
//     links to the Institute's own domains, and to no other link;
//   - the standard footer.
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { DISPATCH, buildDispatch, mediaUrl } from '../../src/lib/newsroom-core.js'
import { canonicalUrl } from '../../src/lib/site.js'
import { REPO, parseArgs, siteOrigin } from './lib/content.mjs'

// Buttondown guesses the format of a body; this comment states it (markdown).
export const EDITOR_MODE = '<!-- buttondown-editor-mode: plaintext -->'

const pad = (n) => String(n).padStart(3, '0')

// True for the site's own host and its subdomains (app.…).
function isOwnHost(url, origin) {
  try {
    const host = new URL(url).hostname.toLowerCase()
    const own = new URL(origin).hostname.toLowerCase()
    return host === own || host.endsWith(`.${own}`)
  } catch {
    return false
  }
}

// Adds the campaign parameters to one of our own URLs, before any #fragment.
// Parameters already present are left as they are.
export function withUtm(url, campaign, origin) {
  if (!isOwnHost(url, origin)) return url
  const hashAt = url.indexOf('#')
  const base = hashAt === -1 ? url : url.slice(0, hashAt)
  const hash = hashAt === -1 ? '' : url.slice(hashAt)
  const have = new Set([...new URL(base).searchParams.keys()])
  const add = [['utm_source', 'dispatch'], ['utm_medium', 'email'], ['utm_campaign', campaign]]
    .filter(([k]) => !have.has(k))
    .map(([k, v]) => `${k}=${v}`)
  if (!add.length) return url
  return `${base}${base.includes('?') ? '&' : '?'}${add.join('&')}${hash}`
}

// Applies `fn` to the parts of the markdown that are not code (fences and
// `inline code` are passed through untouched).
function outsideCode(markdown, fn) {
  const out = []
  let fence = null
  let buffer = []
  const flush = () => {
    if (!buffer.length) return
    out.push(
      buffer
        .join('\n')
        .split(/(`+[^`\n]*`+)/)
        .map((part, i) => (i % 2 ? part : fn(part)))
        .join(''),
    )
    buffer = []
  }
  for (const line of markdown.split('\n')) {
    const m = line.match(/^\s*(```+|~~~+)(.*)$/)
    if (fence) {
      // Inside a fence. A math fence becomes a plain one: its opening line
      // loses the "math" word, the text stays as written.
      out.push(line)
      if (m && m[1][0] === fence[0] && m[1].length >= fence.length && !m[2].trim()) fence = null
    } else if (m) {
      flush()
      fence = m[1]
      out.push(m[2].trim().toLowerCase() === 'math' ? line.replace(/math\s*$/i, '').trimEnd() : line)
    } else buffer.push(line)
  }
  flush()
  return out.join('\n')
}

/**
 * { subject, body, webUrl, slug, number, summary, image } for a Dispatch file.
 * `file` is the path (only its name matters), `raw` its text.
 */
export function buildEmail({ file, raw, origin }) {
  const issue = buildDispatch(file, raw)
  if (!Number.isInteger(issue.number)) throw new Error(`${file}: not a Dispatch issue (no "number").`)
  const campaign = pad(issue.number)
  const utm = (url) => withUtm(url, campaign, origin)
  const absolute = (url) => (url.startsWith('/') && !url.startsWith('//') ? origin + url : url)
  const webUrl = canonicalUrl(origin, issue.path)

  const text = outsideCode(issue.body.replace(/\r\n?/g, '\n').trim(), (part) =>
    part
      // Images: ![alt](images/x.png "caption") -> absolute, never tagged.
      .replace(/!\[([^\]]*)\]\(\s*<?([^)\s>]+)>?(\s+"[^"]*")?\s*\)/g, (_, alt, src, title = '') => {
        const url = /^[a-z][a-z0-9+.-]*:/i.test(src) ? src : origin + mediaUrl(DISPATCH, issue.slug, src)
        return `![${alt}](${url}${title})`
      })
      // Links: [text](url "title") -> absolute; ours get the campaign tag.
      .replace(/(^|[^!])\[([^\]]+)\]\(\s*<?([^)\s>]+)>?(\s+"[^"]*")?\s*\)/g, (_, pre, label, url, title = '') => `${pre}[${label}](${utm(absolute(url))}${title})`)
      // Autolinks: <https://…>
      .replace(/<(https?:\/\/[^>\s]+)>/g, (_, url) => `<${utm(url)}>`),
  )

  const link = (label, to) => `[${label}](${utm(to)})`
  const footer = [
    '---',
    '',
    `You are receiving this because you subscribed at ${new URL(origin).hostname}.`,
    '',
    [
      link('Archive', canonicalUrl(origin, '/insights/dispatch')),
      link('Was this forwarded to you? Subscribe', canonicalUrl(origin, '/subscribe')),
      link('Become a member', `${origin}/support/membership`),
    ].join(' · '),
  ].join('\n')

  const body = [EDITOR_MODE, '', link('Read this issue on the web', webUrl), '', text, '', footer, ''].join('\n')

  return {
    subject: issue.subject,
    body,
    webUrl,
    slug: issue.slug,
    number: issue.number,
    summary: issue.summary,
    image: issue.shareImage ? origin + mediaUrl(DISPATCH, issue.slug, issue.shareImage) : '',
    status: issue.status,
    email: issue.email,
    sendAt: issue.sendAt,
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  const { pos, opt } = parseArgs()
  if (!pos[0]) {
    console.error('Usage: node scripts/newsroom/build-email.mjs <src/content/dispatch/NNN-slug.md> [--json]')
    process.exit(2)
  }
  const file = path.resolve(pos[0])
  const email = buildEmail({ file, raw: readFileSync(file, 'utf8'), origin: siteOrigin(REPO) })
  if (opt.json) console.log(JSON.stringify(email, null, 2))
  else console.log(`Subject: ${email.subject}\n\n${email.body}`)
}
