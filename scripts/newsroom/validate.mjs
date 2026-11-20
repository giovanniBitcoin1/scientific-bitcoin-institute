// Validator for the Insights content. First step of `npm run build`: a file
// that breaks a rule fails the build, so it is never published.
//
//   node scripts/newsroom/validate.mjs              check src/content (drafts included)
//   node scripts/newsroom/validate.mjs --root <dir> check another tree
//   node scripts/newsroom/validate.mjs --self-test  prove every rule on the fixtures
//
// Exit code 0 when there is no error (warnings do not fail), 1 otherwise.
import { cpSync, existsSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync, mkdirSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { renderToStaticMarkup } from 'react-dom/server'
import {
  DISPATCH, LENS, EXPLAINER, RESERVED_EXPLAINER_SLUGS, STATUSES, EMAIL_MODES, CLAIM_STATUSES, SOURCE_KINDS,
  TITLE_MAX, SUMMARY_MAX, parseFrontmatter, isIsoDate, isIsoDateTime, slugFromFile,
} from '../../src/lib/newsroom-core.js'
import { renderNewsroomMarkdown } from '../../src/lib/newsroomMarkdown.js'
import { REPO, readContentFiles, mediaDir, explainerDir, parseArgs } from './lib/content.mjs'
import { imageSize } from './lib/image-size.mjs'

const HERE = path.dirname(fileURLToPath(import.meta.url))

const SHARE_W = 1200
const SHARE_H = 630

// Words that mean "not finished". Whole words; TODO, TK and XXX in capitals.
const LEFTOVERS = [
  ['TODO', /\bTODO\b/],
  ['TK', /\bTK\b/],
  ['[CHECK]', /\[CHECK\]/i],
  ['lorem', /\blorem\b/i],
  ['XXX', /\bXXX\b/],
]

const KNOWN_FIELDS = {
  [DISPATCH]: ['number', 'title', 'subject', 'summary', 'date', 'status', 'email', 'send_at', 'authors', 'tags', 'share_image', 'lens', 'claim'],
  [LENS]: ['title', 'dek', 'summary', 'date', 'facts_as_of', 'status', 'instrument', 'tags', 'share_image', 'sources', 'updates', 'dispatch', 'claim'],
}
const REQUIRED = {
  [DISPATCH]: ['number', 'title', 'summary', 'date', 'status', 'email', 'authors'],
  [LENS]: ['title', 'summary', 'date', 'facts_as_of', 'status', 'instrument'],
}
const SLUG_SHAPE = {
  [DISPATCH]: /^\d{3,}-[a-z0-9]+(?:-[a-z0-9]+)*$/,
  [LENS]: /^\d{4}-\d{2}-\d{2}-[a-z0-9]+(?:-[a-z0-9]+)*$/,
  [EXPLAINER]: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
}
const SLUG_HELP = {
  [DISPATCH]: 'Name it NNN-words-in-lowercase.md, for example 003-how-surprising.md.',
  [LENS]: 'Name it YYYY-MM-DD-words-in-lowercase.md, for example 2026-12-01-exchange-outage.md.',
  [EXPLAINER]: 'Use lowercase letters, digits and hyphens only.',
}

const isText = (v) => typeof v === 'string' && v.trim() !== ''
const isMap = (v) => v !== null && typeof v === 'object' && !Array.isArray(v)
const present = (v) => v !== undefined && v !== null && !(typeof v === 'string' && v.trim() === '')

// Images and raw HTML of a markdown body, found by the site's own renderer
// (so text inside a code fence is not mistaken for an image).
function scanBody(body, series, slug) {
  const images = []
  const raw = []
  renderToStaticMarkup(
    renderNewsroomMarkdown({ body, series, slug, onImage: (img) => images.push(img), onRaw: (html) => raw.push(html) }),
  )
  return { images, raw }
}

/**
 * Checks every piece under <root>/src/content. Returns { errors, warnings },
 * each a list of { code, file, message }.
 */
export function validateTree(root = REPO) {
  const errors = []
  const warnings = []
  const files = readContentFiles(root)
  const parsed = files.map((f) => ({ ...f, slug: slugFromFile(f.file), ...parseFrontmatter(f.raw) }))

  const published = (p) => (p.series === EXPLAINER && p.data.status === undefined) || p.data.status === 'published'
  const bySlug = (series, slug) => parsed.find((p) => p.series === series && p.slug === slug)

  for (const p of parsed) {
    const { series, file, data, content } = p
    const err = (code, message) => errors.push({ code, file, message })
    const warn = (code, message) => warnings.push({ code, file, message })

    if (p.error) {
      err('E_FRONTMATTER', `Cannot read the header of the file: ${p.error}.`)
      continue
    }

    // ---- File name
    if (!SLUG_SHAPE[series].test(p.slug)) {
      err('E_FILENAME', `The file name "${p.slug}.md" cannot be used as a web address. ${SLUG_HELP[series]}`)
    }

    // ---- Dates (shared helpers)
    const checkDate = (label, value) => {
      if (!present(value)) return
      if (!isIsoDate(value)) err('E_DATE', `${label} must be a real date written as YYYY-MM-DD (found "${value}").`)
    }
    const checkDateTime = (label, value) => {
      if (!present(value)) return
      if (isIsoDateTime(value)) return
      const noOffset = typeof value === 'string' && /T\d{2}:\d{2}/.test(value) && !/(Z|[+-]\d{2}:\d{2})$/.test(value)
      err(
        'E_DATE',
        noOffset
          ? `${label} gives a time without saying which time zone: add the offset, for example 2026-12-03T08:30:00+01:00 (found "${value}").`
          : `${label} must be a date and time with its offset, for example 2026-12-03T08:30:00+01:00 (found "${value}").`,
      )
    }

    if (series === EXPLAINER) {
      // Explainers keep their older header: only the rules that concern them.
      if (!isText(data.title)) err('E_REQUIRED', 'The field "title" is missing.')
      if (!present(data.date)) err('E_REQUIRED', 'The field "date" is missing.')
      checkDate('"date"', data.date)
      const slug = isText(data.slug) ? data.slug : p.slug
      p.urlSlug = slug
      if (RESERVED_EXPLAINER_SLUGS.includes(slug) || RESERVED_EXPLAINER_SLUGS.includes(p.slug)) {
        err(
          'E_RESERVED_SLUG',
          `An Explainer cannot be called "${slug}": /insights/${slug} is the address of another page. Reserved names: ${RESERVED_EXPLAINER_SLUGS.join(', ')}.`,
        )
      }
      const dir = explainerDir(root, slug)
      if (isText(data.hero_image) && !existsSync(path.join(dir, data.hero_image.split('/').pop()))) {
        err('E_IMAGE_MISSING', `The hero image "${data.hero_image}" is not in src/content/insights/${slug}/.`)
      }
      for (const img of scanBody(content, series, slug).images) {
        if (!img.alt.trim()) err('E_IMAGE_ALT', `The image "${img.src}" has no alt text. Write ![what the image shows](${img.src}).`)
        if (!existsSync(path.join(dir, img.src.split('/').pop()))) {
          err('E_IMAGE_MISSING', `The image "${img.src}" is not in src/content/insights/${slug}/.`)
        }
      }
    } else {
      p.urlSlug = p.slug

      // ---- Required fields
      for (const field of REQUIRED[series]) {
        if (!present(data[field])) err('E_REQUIRED', `The field "${field}" is missing or empty.`)
      }
      for (const field of Object.keys(data)) {
        if (!KNOWN_FIELDS[series].includes(field)) {
          warn('W_UNKNOWN_FIELD', `The field "${field}" is not one this series uses; it is ignored. Check the spelling.`)
        }
      }

      // ---- Types and allowed values
      for (const field of ['title', 'summary', 'subject', 'authors', 'dek', 'instrument', 'share_image', 'lens']) {
        if (present(data[field]) && typeof data[field] !== 'string') {
          err('E_TYPE', `The field "${field}" must be text. Put it between double quotes.`)
        }
      }
      if (present(data.tags) && !(Array.isArray(data.tags) && data.tags.every((t) => typeof t === 'string'))) {
        err('E_TYPE', 'The field "tags" must be a list of words, for example [security, mining].')
      }
      if (present(data.status) && !STATUSES.includes(data.status)) {
        err('E_VALUE', `"status" must be one of: ${STATUSES.join(', ')} (found "${data.status}").`)
      }
      if (series === DISPATCH) {
        if (present(data.number) && !(Number.isInteger(data.number) && data.number > 0)) {
          err('E_TYPE', `"number" must be a whole number such as 3 (found "${data.number}").`)
        }
        if (present(data.email) && !EMAIL_MODES.includes(data.email)) {
          err('E_VALUE', `"email" must be one of: ${EMAIL_MODES.join(', ')} (found "${data.email}").`)
        }
      }
      if (series === LENS && present(data.dispatch) && !(Number.isInteger(data.dispatch) && data.dispatch > 0)) {
        err('E_TYPE', `"dispatch" must be the number of an issue, such as 3 (found "${data.dispatch}").`)
      }

      // ---- Lengths
      if (typeof data.title === 'string' && data.title.length > TITLE_MAX) {
        err('E_TITLE_LENGTH', `The title is ${data.title.length} characters long; the limit is ${TITLE_MAX}. Shorten it.`)
      }
      if (typeof data.summary === 'string' && data.summary.length > SUMMARY_MAX) {
        err('E_SUMMARY_LENGTH', `The summary is ${data.summary.length} characters long; the limit is ${SUMMARY_MAX}. Shorten it.`)
      }

      // ---- Dates
      checkDate('"date"', data.date)
      checkDateTime('"send_at"', data.send_at)
      checkDateTime('"facts_as_of"', data.facts_as_of)

      // ---- File name agrees with number / date
      if (series === DISPATCH && Number.isInteger(data.number)) {
        const prefix = p.slug.match(/^(\d+)-/)
        const expected = String(data.number).padStart(3, '0')
        if (prefix && prefix[1] !== expected) {
          err('E_FILENAME_NUMBER', `The file name starts with "${prefix[1]}" but "number" is ${data.number}. Rename the file to ${expected}-… or correct the number.`)
        }
      }
      if (series === LENS && isIsoDate(data.date)) {
        const prefix = p.slug.slice(0, 10)
        if (/^\d{4}-\d{2}-\d{2}$/.test(prefix) && prefix !== data.date) {
          err('E_FILENAME_DATE', `The file name starts with "${prefix}" but "date" is ${data.date}. They must be the same day.`)
        }
      }

      // ---- Email
      if (series === DISPATCH && data.email === 'scheduled' && !present(data.send_at)) {
        err('E_SEND_AT', '"email: scheduled" needs "send_at", the date and time of sending, for example 2026-12-03T08:30:00+01:00.')
      }

      // ---- Claim
      if (present(data.claim)) {
        if (!isMap(data.claim)) {
          err('E_TYPE', '"claim" must be a group of lines: text, made, status (and optionally check_by, note).')
        } else {
          const c = data.claim
          if (!isText(c.text)) err('E_REQUIRED', 'The claim has no "text".')
          if (!present(c.made)) err('E_REQUIRED', 'The claim has no "made" date.')
          checkDate('The claim\'s "made"', c.made)
          checkDate('The claim\'s "check_by"', c.check_by)
          if (!present(c.status)) err('E_REQUIRED', 'The claim has no "status".')
          else if (!CLAIM_STATUSES.includes(c.status)) {
            err('E_VALUE', `The claim's "status" must be one of: ${CLAIM_STATUSES.join(', ')} (found "${c.status}").`)
          }
          if (present(c.note) && typeof c.note !== 'string') err('E_TYPE', 'The claim\'s "note" must be text.')
        }
      }

      // ---- Lens: sources and updates
      if (series === LENS) {
        if (present(data.sources) && !(Array.isArray(data.sources) && data.sources.every(isMap))) {
          err('E_TYPE', '"sources" must be a list; each source has title, url and kind.')
        }
        const sources = Array.isArray(data.sources) ? data.sources.filter(isMap) : []
        sources.forEach((s, i) => {
          const n = `Source ${i + 1}`
          if (!isText(s.title)) err('E_REQUIRED', `${n} has no "title".`)
          if (!isText(s.url)) err('E_REQUIRED', `${n} has no "url".`)
          else {
            let ok = false
            try {
              ok = new URL(s.url).protocol === 'https:'
            } catch {
              ok = false
            }
            if (!ok) err('E_SOURCE_URL', `${n}: the address must be a complete https:// link (found "${s.url}").`)
          }
          if (!SOURCE_KINDS.includes(s.kind)) {
            err('E_VALUE', `${n}: "kind" must be one of: ${SOURCE_KINDS.join(', ')} (found "${s.kind ?? ''}").`)
          }
        })
        if (data.status === 'published') {
          if (sources.length < 2) {
            err('E_SOURCES_COUNT', `A published Lens piece needs at least two sources; this one has ${sources.length}.`)
          }
          if (!sources.some((s) => s.kind === 'primary')) {
            err('E_SOURCES_PRIMARY', 'A published Lens piece needs at least one source of kind "primary".')
          }
        }
        if (present(data.updates) && !(Array.isArray(data.updates) && data.updates.every(isMap))) {
          err('E_TYPE', '"updates" must be a list; each update has "at" and "note".')
        }
        ;(Array.isArray(data.updates) ? data.updates.filter(isMap) : []).forEach((u, i) => {
          const n = `Update ${i + 1}`
          if (!present(u.at)) err('E_REQUIRED', `${n} has no "at" (date and time).`)
          checkDateTime(`${n}: "at"`, u.at)
          if (!isText(u.note)) err('E_REQUIRED', `${n} has no "note".`)
        })
      }

      // ---- Images and raw HTML in the body
      const dir = mediaDir(root, series, p.slug)
      const where = `public/insights-media/${series}/${p.slug}/`
      const scan = scanBody(content, series, p.slug)
      for (const img of scan.images) {
        if (!img.alt.trim()) err('E_IMAGE_ALT', `The image "${img.src}" has no alt text. Write ![what the image shows](${img.src}).`)
        if (!/^images\/[^/]+$/.test(img.src)) {
          err('E_IMAGE_REF', `The image "${img.src}" must be written as images/<file name> and the file placed in ${where}.`)
        } else if (!existsSync(path.join(dir, img.src.slice('images/'.length)))) {
          err('E_IMAGE_MISSING', `The image "${img.src}" is not in ${where}.`)
        }
      }
      for (const html of scan.raw) {
        err('E_RAW_HTML', `HTML is not allowed in the text (found "${html.trim().slice(0, 40)}"). Only <sub> and <sup> are accepted; write the rest in markdown.`)
      }

      // ---- Share image
      if (isText(data.share_image)) {
        const img = path.join(dir, data.share_image.split('/').pop())
        if (!existsSync(img)) {
          err('E_SHARE_IMAGE_MISSING', `The share image "${data.share_image}" is not in ${where}.`)
        } else {
          const size = imageSize(img)
          if (!size || (size.type !== 'png' && size.type !== 'jpeg')) {
            err('E_SHARE_IMAGE_SIZE', `The share image "${data.share_image}" must be a PNG or JPEG file.`)
          } else if (size.width !== SHARE_W || size.height !== SHARE_H) {
            err('E_SHARE_IMAGE_SIZE', `The share image "${data.share_image}" is ${size.width}x${size.height}; it must be exactly ${SHARE_W}x${SHARE_H}.`)
          }
        }
      }
    }

    // ---- Leftover markers, in published files only
    if (published(p)) {
      for (const [label, re] of LEFTOVERS) {
        const line = p.raw.split(/\r?\n/).findIndex((l) => re.test(l))
        if (line !== -1) {
          err('E_LEFTOVER', `Line ${line + 1} still contains "${label}", a marker for unfinished text. Finish the passage or set "status: draft".`)
        }
      }
    }
  }

  // ---- Unique addresses
  const seen = new Map()
  for (const p of parsed) {
    if (!p.urlSlug) continue
    const key = `${p.series}/${p.urlSlug}`
    if (seen.has(key)) {
      errors.push({ code: 'E_DUPLICATE_SLUG', file: p.file, message: `This file and ${seen.get(key)} would be published at the same address ("${p.urlSlug}"). Change one of them.` })
    } else seen.set(key, p.file)
  }

  // ---- Dispatch numbers: unique; a gap is only worth a warning
  const numbers = new Map()
  for (const p of parsed.filter((x) => x.series === DISPATCH && Number.isInteger(x.data.number))) {
    if (numbers.has(p.data.number)) {
      errors.push({ code: 'E_DUPLICATE_NUMBER', file: p.file, message: `Issue number ${p.data.number} is already used by ${numbers.get(p.data.number)}.` })
    } else numbers.set(p.data.number, p.file)
  }
  const sorted = [...numbers.keys()].sort((a, b) => a - b)
  for (let i = 0; i < sorted.length; i++) {
    const expected = i === 0 ? 1 : sorted[i - 1] + 1
    if (sorted[i] > expected) {
      const missing = sorted[i] - 1 === expected ? `No. ${expected}` : `No. ${expected} to No. ${sorted[i] - 1}`
      warnings.push({ code: 'W_NUMBER_GAP', file: numbers.get(sorted[i]), message: `There is a gap in the numbering: ${missing} does not exist.` })
    }
  }

  // ---- Cross-references
  for (const p of parsed) {
    if (p.error) continue
    if (p.series === DISPATCH && isText(p.data.lens)) {
      const target = bySlug(LENS, p.data.lens)
      if (!target) {
        errors.push({ code: 'E_XREF_LENS', file: p.file, message: `"lens: ${p.data.lens}" does not match any file in src/content/lens/ (write the file name without .md).` })
      } else if (p.data.status === 'published' && target.data.status !== 'published') {
        errors.push({ code: 'E_XREF_LENS', file: p.file, message: `"lens: ${p.data.lens}" points to a draft; a published issue can only feature a published piece.` })
      }
    }
    if (p.series === LENS && Number.isInteger(p.data.dispatch)) {
      const target = parsed.find((x) => x.series === DISPATCH && x.data.number === p.data.dispatch)
      if (!target) {
        errors.push({ code: 'E_XREF_DISPATCH', file: p.file, message: `"dispatch: ${p.data.dispatch}" does not match any issue in src/content/dispatch/.` })
      } else if (p.data.status === 'published' && target.data.status !== 'published') {
        errors.push({ code: 'E_XREF_DISPATCH', file: p.file, message: `"dispatch: ${p.data.dispatch}" points to a draft issue; a published piece can only name a published issue.` })
      }
    }
  }

  return { errors, warnings, count: parsed.length }
}

function printReport({ errors, warnings, count }, log = console.log) {
  const group = (items) => {
    const byFile = new Map()
    for (const it of items) byFile.set(it.file, [...(byFile.get(it.file) || []), it])
    return byFile
  }
  for (const [file, items] of group(warnings)) {
    log(`\nWARNING  ${file}`)
    for (const it of items) log(`  - ${it.message} [${it.code}]`)
  }
  for (const [file, items] of group(errors)) {
    log(`\nERROR  ${file}`)
    for (const it of items) log(`  - ${it.message} [${it.code}]`)
  }
  log(
    errors.length
      ? `\nContent check FAILED: ${errors.length} error${errors.length === 1 ? '' : 's'} in ${count} file${count === 1 ? '' : 's'}. Nothing was published. Fix the lines above and run "npm run validate" again.`
      : `Content check passed: ${count} file${count === 1 ? '' : 's'}, ${warnings.length} warning${warnings.length === 1 ? '' : 's'}.`,
  )
}

// ------------------------------------------------------------ Self-test
// fixtures/valid is a small, correct content tree. Each case in
// fixtures/cases.json changes it in one way and names the error codes that
// change must produce: exactly those, no more and no fewer.
function applyOps(root, ops) {
  for (const op of ops) {
    if (op.edit) {
      const file = path.join(root, op.edit)
      // A Windows checkout may have CRLF line ends; the cases are written with LF.
      const text = readFileSync(file, 'utf8').replace(/\r\n/g, '\n')
      if (!text.includes(op.find)) throw new Error(`"${op.find}" not found in ${op.edit}: the case is out of date`)
      writeFileSync(file, text.replace(op.find, op.replace))
    } else if (op.write) {
      mkdirSync(path.dirname(path.join(root, op.write)), { recursive: true })
      writeFileSync(path.join(root, op.write), op.content)
    } else if (op.copy) {
      mkdirSync(path.dirname(path.join(root, op.to)), { recursive: true })
      cpSync(path.join(root, op.copy), path.join(root, op.to))
    } else if (op.rename) {
      renameSync(path.join(root, op.rename), path.join(root, op.to))
    } else if (op.delete) {
      rmSync(path.join(root, op.delete))
    } else throw new Error(`Unknown operation: ${JSON.stringify(op)}`)
  }
}

function selfTest() {
  const fixtures = path.join(HERE, 'fixtures')
  const valid = path.join(fixtures, 'valid')
  const cases = JSON.parse(readFileSync(path.join(fixtures, 'cases.json'), 'utf8'))
  let failures = 0
  const line = (ok, name, detail = '') => {
    if (!ok) failures++
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  ${detail}` : ''}`)
  }
  const codes = (items) => [...new Set(items.map((i) => i.code))].sort()
  const same = (a, b) => a.length === b.length && a.every((x, i) => x === b[i])

  const base = validateTree(valid)
  line(base.errors.length === 0 && base.warnings.length === 0, 'valid tree: no error, no warning', codes([...base.errors, ...base.warnings]).join(', '))

  const tmp = mkdtempSync(path.join(os.tmpdir(), 'newsroom-validate-'))
  try {
    cases.forEach((c, i) => {
      const root = path.join(tmp, String(i))
      cpSync(valid, root, { recursive: true })
      let got
      try {
        applyOps(root, c.ops)
        got = validateTree(root)
      } catch (e) {
        line(false, c.name, e.message)
        return
      }
      const wantErrors = [...(c.errors || [])].sort()
      const wantWarnings = [...(c.warnings || [])].sort()
      const ok = same(codes(got.errors), wantErrors) && same(codes(got.warnings), wantWarnings)
      const what = wantErrors.length ? `must fail with ${wantErrors.join(', ')}` : `must pass with ${wantWarnings.join(', ') || 'nothing'}`
      line(ok, `${c.name}: ${what}`, ok ? '' : `got errors [${codes(got.errors).join(', ')}] warnings [${codes(got.warnings).join(', ')}]`)
    })
  } finally {
    rmSync(tmp, { recursive: true, force: true })
  }

  // Every error code the validator can produce must be covered by a case.
  const source = readFileSync(fileURLToPath(import.meta.url), 'utf8')
  const all = [...new Set(source.match(/'[EW]_[A-Z_]+'/g).map((s) => s.slice(1, -1)))].sort()
  const covered = new Set(cases.flatMap((c) => [...(c.errors || []), ...(c.warnings || [])]))
  const uncovered = all.filter((code) => !covered.has(code))
  line(uncovered.length === 0, `every rule has a failing fixture (${all.length} codes)`, uncovered.join(', '))

  console.log(`\n${failures} failures of ${cases.length + 2} checks`)
  return failures
}

// ------------------------------------------------------------ Command line
if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  const { opt } = parseArgs()
  if (opt['self-test']) process.exit(selfTest() ? 1 : 0)
  const root = typeof opt.root === 'string' ? path.resolve(opt.root) : REPO
  const result = validateTree(root)
  printReport(result)
  process.exit(result.errors.length ? 1 : 0)
}
