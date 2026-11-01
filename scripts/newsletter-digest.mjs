#!/usr/bin/env node
/**
 * From the Burrow — newsletter digest composer.
 *
 * Default behaviour is a local draft:
 *   node scripts/newsletter-digest.mjs
 *
 * That reads recent posts, changelog data and (if present) sessions, and writes
 * a Markdown draft into _newsletters/ with `published: false` and `draft: true`.
 * It does not call a provider.
 *
 * A provider API is only called with an explicit --send AND the env key named
 * by `digest.api_key_env` in _data/newsletter.yml. There is no automatic send.
 *
 * Usage:
 *   node scripts/newsletter-digest.mjs --dry-run --verbose
 *   node scripts/newsletter-digest.mjs --date 2026-11-01 --issue 2
 *   node scripts/newsletter-digest.mjs --print
 *   NEWSLETTER_API_KEY=… node scripts/newsletter-digest.mjs --send
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { load as yamlLoad } from 'js-yaml'

const ROOT = process.cwd()
const POSTS_DIR = path.join(ROOT, '_posts')
const DATA_DIR = path.join(ROOT, '_data')
const ISSUES_DIR = path.join(ROOT, '_newsletters')
const CONFIG_FILE = path.join(DATA_DIR, 'newsletter.yml')

const SITE_URL = 'https://www.wombat-gov.dev'

const opts = {
  dryRun: true,
  send: false,
  verbose: false,
  print: false,
  force: false,
  date: new Date().toISOString().slice(0, 10),
  issue: null,
  lang: 'en',
  out: null,
  help: false,
}

const argv = process.argv.slice(2)
for (let i = 0; i < argv.length; i += 1) {
  const arg = argv[i]
  if (arg === '--dry-run') opts.dryRun = true
  else if (arg === '--send') {
    opts.send = true
    opts.dryRun = false
  } else if (arg === '--verbose') opts.verbose = true
  else if (arg === '--print') opts.print = true
  else if (arg === '--force') opts.force = true
  else if (arg === '--date') {
    opts.date = String(argv[++i] || '')
  } else if (arg === '--issue') {
    opts.issue = Number(argv[++i])
  } else if (arg === '--lang') {
    opts.lang = String(argv[++i] || 'en').toLowerCase()
  } else if (arg === '--out') {
    opts.out = String(argv[++i] || '')
  } else if (arg === '--help' || arg === '-h') {
    opts.help = true
  } else {
    console.error(`Unknown option: ${arg}`)
    process.exitCode = 1
  }
}

if (opts.help) {
  console.log(`Usage: node scripts/newsletter-digest.mjs [options]

  --dry-run    Local draft only (default). Never calls a provider.
  --send       Explicitly call the provider draft API; requires the env key
               named by digest.api_key_env. There is no automatic send.
  --date DATE  Issue date in YYYY-MM-DD form (default: today, UTC).
  --issue N    Issue number (default: next unused number).
  --lang en|de Draft language (default: en).
  --out PATH   Output path, or "-" to print to stdout.
  --print      Print the draft instead of writing a file.
  --force      Overwrite an existing draft.
  --verbose    Log the inputs and counts.

The default run writes a Markdown draft into _newsletters/ and stops.`)
  process.exit(0)
}

if (process.exitCode) process.exit(process.exitCode)
if (!['en', 'de'].includes(opts.lang)) fail('--lang must be "en" or "de".')
if (!/^\d{4}-\d{2}-\d{2}$/.test(opts.date)) fail('--date must be YYYY-MM-DD.')
if (opts.issue != null && (!Number.isInteger(opts.issue) || opts.issue < 1)) {
  fail('--issue must be a positive integer.')
}

function fail(message) {
  console.error(`error: ${message}`)
  process.exit(1)
}

function log(message) {
  console.log(message)
}

function vlog(message) {
  if (opts.verbose) console.log(message)
}

function readText(file) {
  return readFileSync(file, 'utf8')
}

function readYaml(file, fallback) {
  if (!existsSync(file)) return fallback
  const text = readText(file)
  if (!text.trim()) return fallback
  try {
    return yamlLoad(text)
  } catch (err) {
    fail(`Could not parse ${path.relative(ROOT, file)}: ${err.message}`)
  }
}

function parseFrontMatter(text) {
  const match = text.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/)
  if (!match) return { data: {}, body: text }
  let data = {}
  try {
    data = yamlLoad(match[1]) || {}
  } catch (err) {
    data = {}
  }
  return { data, body: match[2] }
}

function dateValue(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()))
  }
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return null
  return new Date(Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate()))
}

function isoDate(date) {
  return date.toISOString().slice(0, 10)
}

function formatDate(date, lang) {
  try {
    return new Intl.DateTimeFormat(lang === 'de' ? 'de-DE' : 'en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(date)
  } catch (err) {
    return isoDate(date)
  }
}

function plainText(value) {
  return String(value == null ? '' : value)
    .replace(/<[^>]+>/g, ' ')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[`*_>#]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function truncate(text, max) {
  const value = String(text || '')
  if (value.length <= max) return value
  return `${value.slice(0, max - 1).trim()}…`
}

function compareDatesThen(a, b) {
  if (a.date.getTime() !== b.date.getTime()) return b.date - a.date
  return String(a.key).localeCompare(String(b.key))
}

const config = readYaml(CONFIG_FILE, {})
const digest = config.digest || {}
const maxPosts = Math.max(0, Number(digest.max_posts ?? 5))
const maxChangelogGroups = Math.max(0, Number(digest.max_changelog_groups ?? 2))
const sessionsFile = path.resolve(ROOT, digest.sessions_file || '_data/sessions.yml')

const targetDate = dateValue(opts.date)
if (!targetDate) fail('Could not parse --date.')

/* ------------------------------------------------------------------ */
/* Recent posts                                                       */
/* ------------------------------------------------------------------ */

function postUrl(data, filename) {
  if (data.permalink) return String(data.permalink)
  const date = dateValue(data.date)
  if (!date) return null
  const slug = filename
    .replace(/^\d{4}-\d{2}-\d{2}-/, '')
    .replace(/\.md$/, '')
  const categories = Array.isArray(data.categories)
    ? data.categories.map((category) => String(category).trim().replace(/\s+/g, '-'))
    : []
  const parts = [
    ...categories,
    String(date.getUTCFullYear()),
    String(date.getUTCMonth() + 1).padStart(2, '0'),
    String(date.getUTCDate()).padStart(2, '0'),
    slug,
  ]
  return `/${parts.join('/')}/`
}

function readPosts() {
  if (!existsSync(POSTS_DIR)) return []
  const posts = []
  for (const filename of readdirSync(POSTS_DIR)) {
    if (!filename.endsWith('.md') || filename.startsWith('_')) continue
    const { data } = parseFrontMatter(readText(path.join(POSTS_DIR, filename)))
    if (data.published === false || data.draft === true) continue
    if (String(data.lang || 'en').toLowerCase() !== opts.lang) continue
    const date = dateValue(data.date)
    if (!date || date > targetDate) continue
    const url = postUrl(data, filename)
    if (!url) continue
    posts.push({
      key: filename,
      date,
      title: String(data.title || filename.replace(/\.md$/, '')),
      url,
      description: truncate(plainText(data.description || data.excerpt || ''), 200),
      categories: Array.isArray(data.categories) ? data.categories : [],
    })
  }
  posts.sort(compareDatesThen)
  return posts.slice(0, maxPosts)
}

/* ------------------------------------------------------------------ */
/* Changelog data                                                     */
/* ------------------------------------------------------------------ */

function readChangelog() {
  if (!existsSync(DATA_DIR)) return []
  const groups = []
  for (const filename of readdirSync(DATA_DIR)) {
    if (!/^changelog_.*\.yml$/.test(filename)) continue
    const entries = readYaml(path.join(DATA_DIR, filename), [])
    if (!Array.isArray(entries)) continue
    const source = filename.replace(/^changelog_/, '').replace(/\.yml$/, '').replace(/_/g, ' ')
    for (const entry of entries) {
      if (!entry || typeof entry !== 'object') continue
      const date = dateValue(entry.date)
      if (!date || date > targetDate) continue
      const changes = Array.isArray(entry.changes)
        ? entry.changes
            .map((change) => String(opts.lang === 'de' ? change.text_de : change.text_en || '').trim())
            .filter(Boolean)
            .slice(0, 6)
        : []
      if (!changes.length) continue
      groups.push({
        key: `${filename}:${entry.group_en || entry.version || entry.date}`,
        date,
        title: String(
          opts.lang === 'de'
            ? entry.group_de || entry.group_en || entry.version || ''
            : entry.group_en || entry.version || ''
        ),
        source,
        changes,
      })
    }
  }
  groups.sort(compareDatesThen)
  return groups.slice(0, maxChangelogGroups)
}

/* ------------------------------------------------------------------ */
/* Optional sessions                                                  */
/* ------------------------------------------------------------------ */

function readSessions() {
  if (!existsSync(sessionsFile)) return []
  const entries = readYaml(sessionsFile, [])
  if (!Array.isArray(entries)) return []
  const sessions = []
  for (const entry of entries) {
    if (!entry || typeof entry !== 'object') continue
    const date = dateValue(entry.date)
    if (!date) continue
    // Keep upcoming sessions and the most recent month.
    const age = targetDate.getTime() - date.getTime()
    if (age > 31 * 24 * 60 * 60 * 1000) continue
    sessions.push({
      date,
      title: String(entry.title || entry.name || ''),
      url: String(entry.url || entry.link || ''),
      location: String(entry.location || ''),
    })
  }
  sessions.sort((a, b) => a.date - b.date)
  return sessions.slice(0, 3)
}

/* ------------------------------------------------------------------ */
/* Issue number and output path                                       */
/* ------------------------------------------------------------------ */

function nextIssueNumber() {
  if (!existsSync(ISSUES_DIR)) return 1
  let max = 0
  for (const filename of readdirSync(ISSUES_DIR)) {
    if (!filename.endsWith('.md')) continue
    const { data } = parseFrontMatter(readText(path.join(ISSUES_DIR, filename)))
    const value = Number(data.issue)
    if (Number.isInteger(value) && value > max) max = value
  }
  return max + 1
}

const issue = opts.issue == null ? nextIssueNumber() : opts.issue
const issueSlug = opts.lang === 'de' ? 'aus-dem-bau' : 'from-the-burrow'
const defaultName = `${opts.date}-${issueSlug}-${String(issue).padStart(2, '0')}.md`
const outPath = opts.out === '-' || opts.print
  ? null
  : path.resolve(ROOT, opts.out || path.join('_newsletters', defaultName))

/* ------------------------------------------------------------------ */
/* Compose                                                           */
/* ------------------------------------------------------------------ */

const copy = {
  en: {
    title: `From the Burrow — Issue ${issue}`,
    description: 'The Wombat community newsletter.',
    intro: 'Here is what moved in the burrow this month.',
    draft: '_This is a prepared draft. It is not published and has not been sent._',
    blog: 'New on the blog',
    changelog: 'Framework & WOMBATpass changes',
    sessions: 'Sessions & community',
    footer: [
      `[Blog](${SITE_URL}/blog/) · [Changelog](${SITE_URL}/changelog/) · [Contributor ranks](${SITE_URL}/contributors/ranks/)`,
      '',
      'You are receiving this because you subscribed to From the Burrow. [Unsubscribe]({{ unsubscribe_url }})',
    ].join('\n'),
  },
  de: {
    title: `Aus dem Bau — Ausgabe ${issue}`,
    description: 'Der Newsletter der Wombat-Community.',
    intro: 'Das ist im Bau passiert.',
    draft: '_Dies ist ein vorbereiteter Entwurf. Er ist nicht veröffentlicht und wurde nicht versendet._',
    blog: 'Neu im Blog',
    changelog: 'Framework- & WOMBATpass-Änderungen',
    sessions: 'Sessions & Community',
    footer: [
      `[Blog](${SITE_URL}/blog/) · [Changelog](${SITE_URL}/de/changelog/) · [Mitwirkenden-Ränge](${SITE_URL}/contributors/ranks/)`,
      '',
      'Du erhältst diese E-Mail, weil du „Aus dem Bau“ abonniert hast. [Abmelden]({{ unsubscribe_url }})',
    ].join('\n'),
  },
}

const posts = readPosts()
const changelog = readChangelog()
const sessions = readSessions()
const text = copy[opts.lang]

vlog(`Issue ${issue}, ${opts.lang}, ${opts.date}`)
vlog(`Posts: ${posts.length}; changelog groups: ${changelog.length}; sessions: ${sessions.length}`)

const lines = []
lines.push(text.draft)
lines.push('')
lines.push(text.intro)
lines.push('')

if (posts.length) {
  lines.push(`## ${text.blog}`)
  lines.push('')
  for (const post of posts) {
    lines.push(`- **[${post.title}](${SITE_URL}${post.url})** — ${formatDate(post.date, opts.lang)}`)
    if (post.description) lines.push(`  ${post.description}`)
  }
  lines.push('')
}

if (changelog.length) {
  lines.push(`## ${text.changelog}`)
  lines.push('')
  for (const group of changelog) {
    lines.push(`### ${group.title || group.source}`)
    lines.push('')
    for (const change of group.changes) {
      lines.push(`- ${change}`)
    }
    lines.push('')
  }
}

if (sessions.length) {
  lines.push(`## ${text.sessions}`)
  lines.push('')
  for (const session of sessions) {
    const meta = [formatDate(session.date, opts.lang), session.location].filter(Boolean).join(' · ')
    lines.push(`- **${session.title}**${meta ? ` — ${meta}` : ''}${session.url ? ` · [Details](${session.url})` : ''}`)
  }
  lines.push('')
}

lines.push('---')
lines.push('')
lines.push(text.footer)
lines.push('')

const frontMatter = [
  '---',
  'layout: newsletter',
  `title: ${JSON.stringify(text.title)}`,
  `date: ${opts.date}`,
  `issue: ${issue}`,
  `lang: ${opts.lang}`,
  `description: ${JSON.stringify(text.description)}`,
  'published: false',
  'draft: true',
  '---',
].join('\n')

const markdown = `${frontMatter}\n\n${lines.join('\n')}\n`

if (opts.print || opts.out === '-') {
  process.stdout.write(markdown)
} else {
  if (existsSync(outPath) && !opts.force) {
    fail(`${path.relative(ROOT, outPath)} already exists. Pass --force to overwrite.`)
  }
  mkdirSync(path.dirname(outPath), { recursive: true })
  writeFileSync(outPath, markdown, 'utf8')
  log(`Draft written: ${path.relative(ROOT, outPath)}`)
}

/* ------------------------------------------------------------------ */
/* Explicit provider draft call                                       */
/* ------------------------------------------------------------------ */

async function sendDraft() {
  if (!opts.send) return

  const provider = String(digest.provider || '').toLowerCase()
  const apiUrl = String(digest.api_url || '')
  const keyEnv = String(digest.api_key_env || 'NEWSLETTER_API_KEY')
  const apiKey = process.env[keyEnv]

  if (!apiKey) {
    fail(`Refusing to ${provider || 'provider'} API call: set the ${keyEnv} environment variable.`)
  }

  let url = apiUrl
  const headers = {
    'Content-Type': 'application/json',
    'User-Agent': 'wombat-newsletter-digest',
  }
  let body = {
    subject: text.title,
    body: markdown,
    status: 'draft',
  }

  if (provider === 'buttondown') {
    url = 'https://api.buttondown.email/v1/emails'
    headers.Authorization = `Token ${apiKey}`
  } else if (apiUrl) {
    headers.Authorization = `Bearer ${apiKey}`
    body = {
      ...body,
      from: digest.from_email || undefined,
      reply_to: digest.reply_to || undefined,
    }
  } else {
    fail('No digest.provider or digest.api_url is configured in _data/newsletter.yml.')
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(30000),
  })

  const responseText = await response.text()
  if (!response.ok) {
    fail(`Provider API error ${response.status}: ${truncate(responseText, 300)}`)
  }
  log(`Provider draft created (${provider || 'custom endpoint'}), status ${response.status}.`)
  vlog(truncate(responseText, 500))
}

sendDraft().catch((err) => {
  console.error(err)
  process.exit(1)
})
