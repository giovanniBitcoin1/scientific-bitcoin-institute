// Tests of the email hand-off: `npm run test:email`.
// The Buttondown API is never called: every network call goes to a fake.
//
//   node scripts/newsroom/test-email.mjs            run the tests
//   node scripts/newsroom/test-email.mjs --record   rewrite fixtures/email/expected.json
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildEmail, withUtm } from './build-email.mjs'
import { API, API_VERSION, planEmail, run } from './send-email.mjs'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const ORIGIN = 'https://scientificbitcoininstitute.org'
const FIXTURE = path.join(HERE, 'fixtures', 'email', '007-fixture-email-issue.md')
const EXPECTED = path.join(HERE, 'fixtures', 'email', 'expected.json')
const raw = readFileSync(FIXTURE, 'utf8')
const REL = 'src/content/dispatch/007-fixture-email-issue.md'

if (process.argv.includes('--record')) {
  writeFileSync(EXPECTED, `${JSON.stringify(buildEmail({ file: REL, raw, origin: ORIGIN }), null, 2)}\n`)
  console.log(`Recorded ${EXPECTED}. Read the diff before committing it.`)
  process.exit(0)
}
const expected = JSON.parse(readFileSync(EXPECTED, 'utf8'))

let failures = 0
let count = 0
const ok = (name, cond, detail = '') => {
  count++
  if (!cond) failures++
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${!cond && detail ? `  ${detail}` : ''}`)
}
const UTM = 'utm_source=dispatch&utm_medium=email&utm_campaign=007'

// ---- build-email
const email = buildEmail({ file: REL, raw, origin: ORIGIN })
ok('build: output equals the recorded fixture (fixtures/email/expected.json)', JSON.stringify(email) === JSON.stringify(expected))
ok('build: default subject "SBI Dispatch No. N · <title>"', email.subject === 'SBI Dispatch No. 7 · NEWSROOM-FIXTURE email issue')
ok('build: an explicit subject wins', buildEmail({ file: REL, raw: raw.replace('summary:', 'subject: "Custom subject"\nsummary:'), origin: ORIGIN }).subject === 'Custom subject')
const lines = email.body.split('\n')
ok('build: first content line links to the web version', lines[2] === `[Read this issue on the web](${ORIGIN}/insights/dispatch/007-fixture-email-issue/?${UTM})`, lines[2])
ok('build: the body does not start with "---" (Buttondown rejects frontmatter)', !email.body.trimStart().startsWith('---'))
ok('build: image made absolute, not tagged', email.body.includes(`![NEWSROOM-FIXTURE chart](${ORIGIN}/insights-media/dispatch/007-fixture-email-issue/chart.png "NEWSROOM-FIXTURE caption")`))
ok('build: internal link made absolute and tagged', email.body.includes(`[internal link](${ORIGIN}/insights/lens/2026-03-01-some-piece?${UTM})`))
ok('build: subdomain link tagged', email.body.includes(`(https://app.scientificbitcoininstitute.org/sign-up?${UTM})`))
ok('build: tag goes before the #fragment', email.body.includes(`/manifesto?${UTM}#mission>`))
ok('build: a parameter already present is not doubled', email.body.includes('/news/journal?utm_source=other&utm_medium=email&utm_campaign=007)'))
ok('build: outside links untouched', email.body.includes('(https://example.org/report?id=3)') && email.body.includes('<https://example.org/plain>'))
ok('build: no link outside our domains carries utm_', !/\]\((?!https:\/\/(?:app\.)?scientificbitcoininstitute\.org)[^)]*utm_/.test(email.body))
ok('build: math fence became a plain block', email.body.includes('```\nP(t) = A · t^β\n```') && !email.body.includes('```math'))
ok('build: code is left alone', email.body.includes('`[not a link](/insights)`') && email.body.includes('[also not a link](/insights) inside a plain fence'))
ok(
  'build: footer sentence and its three links',
  email.body.includes('You are receiving this because you subscribed at scientificbitcoininstitute.org.') &&
    email.body.endsWith(
      `[Archive](${ORIGIN}/insights/dispatch/?${UTM}) · [Was this forwarded to you? Subscribe](${ORIGIN}/subscribe/?${UTM}) · [Become a member](${ORIGIN}/support/membership?${UTM})\n`,
    ),
)
ok(
  'utm: a look-alike domain is not ours',
  withUtm('https://notscientificbitcoininstitute.org/x', '007', ORIGIN) === 'https://notscientificbitcoininstitute.org/x' &&
    !withUtm('https://scientificbitcoininstitute.org.evil.example/x', '007', ORIGIN).includes('utm_'),
)

// ---- planEmail (mode rules)
const T = Date.parse('2026-03-01T00:00:00Z') // days before send_at
const plan = (over = {}) => planEmail({ file: REL, raw, origin: ORIGIN, repoMode: 'scheduled', now: T, ...over })
ok('plan: scheduled when BOTH the variable and the file say so', plan().mode === 'scheduled' && plan().request.status === 'scheduled' && plan().request.publish_date === '2026-03-05T08:30:00+01:00')
ok('plan: draft when the variable is unset', plan({ repoMode: '' }).mode === 'draft' && plan({ repoMode: '' }).request.publish_date === undefined)
ok('plan: draft when the variable says draft', plan({ repoMode: 'draft' }).request.status === 'draft')
ok('plan: draft when the file says "email: draft"', plan({ raw: raw.replace('email: scheduled', 'email: draft') }).request.status === 'draft')
ok('plan: a manual "scheduled" cannot override the variable', plan({ repoMode: '', forceMode: 'scheduled' }).request.status === 'draft')
ok('plan: a manual "draft" lowers a scheduled issue', plan({ forceMode: 'draft' }).request.status === 'draft')
const soon = plan({ now: Date.parse('2026-03-05T06:00:00Z') }) // 1.5 h before 07:30Z
ok('plan: send_at less than two hours away falls back to draft, and says so', soon.request.status === 'draft' && soon.notes.some((n) => n.includes('less than two hours')))
ok('plan: exactly two hours away is still scheduled', plan({ now: Date.parse('2026-03-05T05:30:00Z') }).request.status === 'scheduled')
ok('plan: send_at in the past falls back to draft', plan({ now: Date.parse('2026-04-01T00:00:00Z') }).request.status === 'draft')
ok('plan: canonical URL, slug and issue number are set', plan().request.canonical_url === `${ORIGIN}/insights/dispatch/007-fixture-email-issue/` && plan().request.slug === '007-fixture-email-issue' && plan().request.secondary_id === 7)
ok('plan: "email: none" is skipped', plan({ raw: raw.replace('email: scheduled', 'email: none') }).action === 'skip')
ok('plan: a draft issue is skipped', plan({ raw: raw.replace('status: published', 'status: draft') }).action === 'skip')
ok('plan: a Lens piece is refused', plan({ file: 'src/content/lens/2026-03-01-some-piece.md' }).action === 'skip')
ok('plan: an Explainer is refused', plan({ file: 'src/content/insights/some-explainer.md' }).action === 'skip')
ok('plan: the template is refused', plan({ file: 'src/content/dispatch/_template.md' }).action === 'skip')
const everyStatus = [plan(), plan({ repoMode: '' }), soon, plan({ forceMode: 'draft' }), plan({ forceMode: 'scheduled' })].map((p) => p.request.status)
ok('plan: status is only ever "draft" or "scheduled" (never "about_to_send")', everyStatus.every((s) => s === 'draft' || s === 'scheduled'))

// ---- run (with a fake Buttondown)
function fakeApi({ existing = [] } = {}) {
  const calls = []
  const fetchImpl = async (url, init = {}) => {
    calls.push({ url, method: init.method || 'GET', headers: init.headers || {}, body: init.body ? JSON.parse(init.body) : null })
    if ((init.method || 'GET') === 'GET') return { ok: true, status: 200, json: async () => ({ results: existing, next: null }), text: async () => '' }
    return { ok: true, status: 201, json: async () => ({ id: 'em_fake' }), text: async () => '' }
  }
  return { calls, fetchImpl }
}

// run() reads files from disk under `root`: a temporary tree holding the fixture.
const root = mkdtempSync(path.join(os.tmpdir(), 'newsroom-email-'))
mkdirSync(path.join(root, 'src/content/dispatch'), { recursive: true })
mkdirSync(path.join(root, 'src/content/lens'), { recursive: true })
mkdirSync(path.join(root, 'public'), { recursive: true })
writeFileSync(path.join(root, 'public/CNAME'), 'scientificbitcoininstitute.org\n')
cpSync(FIXTURE, path.join(root, REL))
const LENS = 'src/content/lens/2026-03-01-some-piece.md'
writeFileSync(path.join(root, LENS), '---\ntitle: "x"\nstatus: published\n---\n\nx\n')
const quiet = () => {}
const both = { BUTTONDOWN_API_KEY: 'k', DISPATCH_EMAIL_MODE: 'scheduled' }

try {
  let api = fakeApi()
  let out = await run({ files: [REL], env: both, fetchImpl: api.fetchImpl, now: T, root, log: quiet })
  const post = api.calls.find((c) => c.method === 'POST')
  ok('run: looks for the subject, then creates one email', api.calls.length === 2 && api.calls[0].method === 'GET' && api.calls[0].url === `${API}/emails?subject=${encodeURIComponent(expected.subject)}` && post.url === `${API}/emails`)
  ok('run: token and pinned API version are sent', post.headers.Authorization === 'Token k' && post.headers['X-API-Version'] === API_VERSION)
  ok('run: created as scheduled for send_at', post.body.status === 'scheduled' && post.body.publish_date === '2026-03-05T08:30:00+01:00' && out.some((l) => l.includes('SCHEDULED')))

  api = fakeApi()
  out = await run({ files: [REL], env: { BUTTONDOWN_API_KEY: 'k' }, fetchImpl: api.fetchImpl, now: T, root, log: quiet })
  ok('run: without the repository variable it is a draft', api.calls.find((c) => c.method === 'POST').body.status === 'draft' && out.some((l) => l.includes('DRAFT')))

  api = fakeApi({ existing: [{ subject: expected.subject, status: 'draft' }] })
  out = await run({ files: [REL], env: both, fetchImpl: api.fetchImpl, now: T, root, log: quiet })
  ok('run: idempotent — same subject already there, nothing created', !api.calls.some((c) => c.method === 'POST') && out.some((l) => l.includes('already exists')))

  api = fakeApi({ existing: [{ subject: `${expected.subject} (copy)`, status: 'draft' }] })
  await run({ files: [REL], env: { BUTTONDOWN_API_KEY: 'k' }, fetchImpl: api.fetchImpl, now: T, root, log: quiet })
  ok('run: a subject that only contains ours does not count as existing', api.calls.some((c) => c.method === 'POST'))

  api = fakeApi()
  out = await run({ files: [REL], env: {}, fetchImpl: api.fetchImpl, now: T, root, log: quiet })
  ok('run: no API key — no call, a clear notice, no error', api.calls.length === 0 && out.some((l) => l.includes('BUTTONDOWN_API_KEY is not set')))

  api = fakeApi()
  const printed = []
  await run({ files: [REL], env: both, fetchImpl: api.fetchImpl, dryRun: true, now: T, root, log: (l) => printed.push(l) })
  ok('run: dry run prints the request body and calls nothing', api.calls.length === 0 && printed.some((l) => l.includes('"status": "scheduled"') && l.includes('"canonical_url"')))

  api = fakeApi()
  out = await run({ files: [LENS], env: both, fetchImpl: api.fetchImpl, now: T, root, log: quiet })
  ok('run: a Lens file never produces a call', api.calls.length === 0 && out.some((l) => l.includes('never for The Lens')))

  api = fakeApi()
  out = await run({ files: [], env: both, fetchImpl: api.fetchImpl, now: T, root, log: quiet })
  ok('run: no added file — nothing to do', api.calls.length === 0 && out.some((l) => l.includes('nothing to do')))

  let threw = false
  const refusing = async (url, init = {}) =>
    (init.method || 'GET') === 'GET'
      ? { ok: true, status: 200, json: async () => ({ results: [] }), text: async () => '' }
      : { ok: false, status: 400, json: async () => ({}), text: async () => 'slug_invalid' }
  try {
    await run({ files: [REL], env: both, fetchImpl: refusing, now: T, root, log: quiet })
  } catch {
    threw = true
  }
  ok('run: an API refusal is an error, not a silent pass', threw)
} finally {
  rmSync(root, { recursive: true, force: true })
}

console.log(`\n${failures} failures of ${count} checks`)
process.exit(failures ? 1 : 0)
