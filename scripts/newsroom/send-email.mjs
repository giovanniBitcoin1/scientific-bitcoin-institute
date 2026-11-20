// Hands a new SBI Dispatch issue to Buttondown as an email — as a DRAFT, or
// SCHEDULED for the issue's `send_at`. It never sends immediately.
// Run by .github/workflows/dispatch-email.yml.
//
//   node scripts/newsroom/send-email.mjs --file <path> [--mode draft|scheduled] [--dry-run]
//   node scripts/newsroom/send-email.mjs --added <before-sha> <after-sha>
//
// Environment: BUTTONDOWN_API_KEY (secret), DISPATCH_EMAIL_MODE (repository
// variable), GITHUB_STEP_SUMMARY (set by GitHub Actions).
//
// Buttondown API relied on (read 2026-11-20, https://docs.buttondown.com/api-emails-create
// and the OpenAPI spec at github.com/buttondown/openapi):
//   GET  https://api.buttondown.com/v1/emails?subject=<text>   list, "subject contains"
//   POST https://api.buttondown.com/v1/emails                  create
//   headers  Authorization: Token <key> · X-API-Version: 2026-04-01
//   fields   subject, body, status, publish_date, canonical_url, slug,
//            secondary_id, description, image, metadata
// The API's default `status` is "about_to_send" (send now), so this script
// ALWAYS states the status and refuses any value but "draft" and "scheduled".
import { execFileSync } from 'node:child_process'
import { appendFileSync, existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { isIsoDateTime, toRfc3339 } from '../../src/lib/newsroom-core.js'
import { buildEmail } from './build-email.mjs'
import { REPO, parseArgs, posix, siteOrigin } from './lib/content.mjs'

export const API = 'https://api.buttondown.com/v1'
export const API_VERSION = '2026-04-01'
export const MIN_LEAD_MS = 2 * 60 * 60 * 1000
const DISPATCH_FILE = /^src\/content\/dispatch\/(?!_)[^/]+\.md$/
const ALLOWED_STATUS = new Set(['draft', 'scheduled'])

/**
 * Decides what to do with one file. Pure: no network, no clock of its own.
 * Returns { action: "skip", reason } or
 *         { action: "create", mode, notes: [...], request: {...}, email }.
 */
export function planEmail({ file, raw, origin, repoMode = '', forceMode = '', now = Date.now() }) {
  const rel = posix(file)
  if (!DISPATCH_FILE.test(rel)) {
    return { action: 'skip', reason: `${rel} is not a Dispatch issue. Emails are created for SBI Dispatch only, never for The Lens or an Explainer.` }
  }
  const email = buildEmail({ file: rel, raw, origin })
  if (email.status !== 'published') return { action: 'skip', reason: `${rel} is not published (status: ${email.status || 'missing'}).` }
  if (email.email === 'none') return { action: 'skip', reason: `${rel} says "email: none".` }
  if (email.email !== 'draft' && email.email !== 'scheduled') {
    return { action: 'skip', reason: `${rel} has an unknown "email" value ("${email.email}").` }
  }

  // Scheduled only when BOTH the repository variable and the file say so.
  // A manual run may ask for a mode, but it can only lower it to "draft":
  // it cannot schedule a file that says "email: draft".
  const notes = []
  let mode = repoMode === 'scheduled' && email.email === 'scheduled' ? 'scheduled' : 'draft'
  if (forceMode === 'draft') mode = 'draft'
  if (forceMode === 'scheduled' && mode !== 'scheduled') {
    notes.push('Mode "scheduled" was asked for, but it needs both the repository variable DISPATCH_EMAIL_MODE=scheduled and "email: scheduled" in the file. Created as a draft.')
  }
  if (mode === 'draft' && email.email === 'scheduled' && repoMode !== 'scheduled' && forceMode !== 'draft') {
    notes.push('The file says "email: scheduled" but the repository variable DISPATCH_EMAIL_MODE is not "scheduled". Created as a draft.')
  }
  if (mode === 'scheduled') {
    if (!isIsoDateTime(email.sendAt)) {
      mode = 'draft'
      notes.push('"send_at" is missing or not a date and time with an offset. Created as a draft.')
    } else if (Date.parse(email.sendAt) - now < MIN_LEAD_MS) {
      mode = 'draft'
      notes.push(`"send_at" (${email.sendAt}) is less than two hours away. Created as a draft instead of scheduled: schedule it by hand in Buttondown.`)
    }
  }

  const request = {
    subject: email.subject,
    body: email.body,
    status: mode,
    ...(mode === 'scheduled' ? { publish_date: toRfc3339(email.sendAt) } : {}),
    canonical_url: email.webUrl,
    slug: email.slug,
    secondary_id: email.number,
    description: email.summary,
    ...(email.image ? { image: email.image } : {}),
    metadata: { source: 'sbi-newsroom', file: rel },
  }
  if (!ALLOWED_STATUS.has(request.status)) throw new Error(`Refusing to create an email with status "${request.status}".`)
  return { action: 'create', mode, notes, request, email }
}

const headers = (key) => ({
  Authorization: `Token ${key}`,
  'Content-Type': 'application/json',
  'X-API-Version': API_VERSION,
})

// True when an email with exactly this subject already exists (any state but
// deleted). The API filter is "contains", so the match is confirmed here.
export async function subjectExists({ subject, key, fetchImpl }) {
  let url = `${API}/emails?subject=${encodeURIComponent(subject)}`
  for (let page = 0; url && page < 20; page++) {
    const res = await fetchImpl(url, { headers: headers(key) })
    if (!res.ok) throw new Error(`Buttondown answered ${res.status} to the list of emails: ${(await res.text()).slice(0, 300)}`)
    const data = await res.json()
    if ((data.results || []).some((e) => e.subject === subject && e.status !== 'deleted')) return true
    url = data.next || ''
  }
  return false
}

/**
 * Processes the files. Returns the lines of the job summary.
 * Exit status is the caller's: this throws only on an API or usage error.
 */
export async function run({ files, env = process.env, fetchImpl = fetch, dryRun = false, forceMode = '', now = Date.now(), root = REPO, log = console.log }) {
  const summary = []
  const say = (line) => {
    summary.push(line)
    log(line)
  }
  const origin = siteOrigin(root)
  const key = env.BUTTONDOWN_API_KEY || ''
  if (!files.length) say('No new Dispatch issue in this push: nothing to do.')

  for (const file of files) {
    const abs = path.resolve(root, file)
    if (!existsSync(abs)) {
      say(`- ${file}: the file does not exist. Skipped.`)
      continue
    }
    const plan = planEmail({ file: posix(path.relative(root, abs)), raw: readFileSync(abs, 'utf8'), origin, repoMode: env.DISPATCH_EMAIL_MODE || '', forceMode, now })
    if (plan.action === 'skip') {
      say(`- Skipped: ${plan.reason}`)
      continue
    }
    plan.notes.forEach((n) => say(`- Note: ${n}`))
    if (dryRun) {
      say(`- Dry run for ${file}: the request below was NOT sent.`)
      log(JSON.stringify({ method: 'POST', url: `${API}/emails`, headers: { 'X-API-Version': API_VERSION }, body: plan.request }, null, 2))
      continue
    }
    if (!key) {
      say(`- ${file}: the secret BUTTONDOWN_API_KEY is not set, so no email was created. Add it under Settings → Secrets and variables → Actions, then run this workflow by hand for the file.`)
      continue
    }
    if (await subjectExists({ subject: plan.request.subject, key, fetchImpl })) {
      say(`- ${file}: an email with the subject "${plan.request.subject}" already exists in Buttondown. Nothing done.`)
      continue
    }
    const res = await fetchImpl(`${API}/emails`, {
      method: 'POST',
      headers: { ...headers(key), 'X-Idempotency-Key': `sbi-dispatch-${plan.request.slug}` },
      body: JSON.stringify(plan.request),
    })
    if (!res.ok) throw new Error(`Buttondown refused the email for ${file} (${res.status}): ${(await res.text()).slice(0, 500)}`)
    const created = await res.json().catch(() => ({}))
    say(
      plan.mode === 'scheduled'
        ? `- ${file}: email SCHEDULED in Buttondown for ${plan.request.publish_date} — "${plan.request.subject}".`
        : `- ${file}: email created as a DRAFT in Buttondown — "${plan.request.subject}". Review and send it from Buttondown.`,
    )
    if (created.id) say(`  Buttondown id: ${created.id}`)
  }
  return summary
}

// Dispatch files ADDED between two commits (modified files do not count).
export function addedFiles(before, after, root = REPO) {
  const zero = /^0+$/.test(before || '')
  const range = zero || !before ? [`${after}~1`, after] : [before, after]
  const out = execFileSync('git', ['diff', '--name-only', '--diff-filter=A', ...range, '--', 'src/content/dispatch'], { cwd: root, encoding: 'utf8' })
  return out.split(/\r?\n/).map((l) => l.trim()).filter((l) => DISPATCH_FILE.test(l))
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  const { pos, opt } = parseArgs()
  const truthy = (v) => v === true || v === 'true' || v === '1'
  let files
  if (opt.added) files = addedFiles(opt.added, pos[0] || 'HEAD')
  else if (typeof opt.file === 'string' && opt.file.trim()) files = [opt.file.trim()]
  else {
    console.error('Usage: send-email.mjs --file <path> [--mode draft|scheduled] [--dry-run]  |  send-email.mjs --added <before> <after>')
    process.exit(2)
  }
  const forceMode = typeof opt.mode === 'string' && ['draft', 'scheduled'].includes(opt.mode) ? opt.mode : ''
  try {
    const summary = await run({ files, dryRun: truthy(opt['dry-run']), forceMode })
    if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `## SBI Dispatch email\n\n${summary.join('\n')}\n`)
  } catch (e) {
    console.error(`ERROR: ${e.message}`)
    if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `## SBI Dispatch email\n\nFAILED: ${e.message}\n`)
    process.exit(1)
  }
}
