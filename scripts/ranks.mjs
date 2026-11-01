#!/usr/bin/env node
/**
 * Wombat contributor ranks + static badge factory.
 *
 * Reads:
 *   _data/ranks.yml                 tiers, weights, caps, privacy, overrides
 *   _data/github_contributors.json  cached GitHub contributor list
 *   _data/core_contributors.yml     curated maintainers
 *   _data/community_contributors.yml curated community contributors
 *   _data/honoured_members.yml      curated honoured members
 *
 * Writes:
 *   _data/contributor_ranks.json       deterministic rank data for Liquid/JS
 *   assets/data/contributor-ranks.json public copy for client-side lookups
 *   badges/<login>.svg                 self-contained rank badges
 *   _data/community_promotions.yml     rank changes since the previous run
 *
 * Usage:
 *   node scripts/ranks.mjs --dry-run --verbose
 *   node scripts/ranks.mjs
 *
 * Offline-first: the cached contributor JSON is enough. GraphQL enrichment is
 * attempted only when GITHUB_TOKEN is present and the run is not a dry run
 * (or --online is passed explicitly).
 */
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { dump as yamlDump, load as yamlLoad } from 'js-yaml'

const ROOT = process.cwd()
const DATA_DIR = path.join(ROOT, '_data')
const BADGE_DIR = path.join(ROOT, 'badges')
const PUBLIC_DATA_DIR = path.join(ROOT, 'assets', 'data')
const PILLAR_DIR = path.join(ROOT, 'images', 'brand', 'pillars')
const AVATAR_FILE = path.join(ROOT, 'images', 'brand', 'mascot', 'wombat-avatar.svg')

const PILLAR_ORDER = [
  'security',
  'cost-optimization',
  'performance-efficiency',
  'reliability',
  'operational-excellence',
  'sustainability',
  'sovereign',
  'agentic',
]

const BADGE_BG = '#06120c'
const BADGE_INK = '#eafff2'
const BADGE_MUTED = '#59a878'
const BADGE_BORDER = '#8df5b5'

const opts = {
  dryRun: false,
  verbose: false,
  online: false,
  help: false,
}

for (const arg of process.argv.slice(2)) {
  if (arg === '--dry-run') opts.dryRun = true
  else if (arg === '--verbose') opts.verbose = true
  else if (arg === '--online') opts.online = true
  else if (arg === '--help' || arg === '-h') opts.help = true
  else {
    console.error(`Unknown option: ${arg}`)
    process.exitCode = 1
  }
}

if (opts.help) {
  console.log(`Usage: node scripts/ranks.mjs [--dry-run] [--verbose] [--online]

  --dry-run   Compute everything but write no files.
  --verbose   Log every contributor and the enrichment decisions.
  --online    Allow GraphQL enrichment during a dry run (requires GITHUB_TOKEN).

Without --dry-run, writes _data/contributor_ranks.json, the public
assets/data/contributor-ranks.json copy, badges/<login>.svg and
_data/community_promotions.yml.`)
  process.exit(0)
}

if (process.exitCode) process.exit(process.exitCode)

function log(message) {
  console.log(message)
}

function vlog(message) {
  if (opts.verbose) console.log(message)
}

function fail(message) {
  console.error(`error: ${message}`)
  process.exit(1)
}

function readText(file) {
  return readFileSync(file, 'utf8')
}

function readJson(file, fallback) {
  if (!existsSync(file)) return fallback
  try {
    return JSON.parse(readText(file))
  } catch (err) {
    fail(`Could not parse ${path.relative(ROOT, file)}: ${err.message}`)
  }
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

function readYamlArray(file) {
  const value = readYaml(file, [])
  return Array.isArray(value) ? value : []
}

function ensureDir(dir) {
  if (!existsSync(dir)) {
    if (!opts.dryRun) mkdirSync(dir, { recursive: true })
    vlog(`${opts.dryRun ? 'would create' : 'created'} ${path.relative(ROOT, dir)}/`)
  }
}

function writeIfChanged(file, content) {
  const previous = existsSync(file) ? readText(file) : null
  if (previous === content) return false
  if (!opts.dryRun) {
    ensureDir(path.dirname(file))
    writeFileSync(file, content, 'utf8')
  }
  vlog(`${opts.dryRun ? 'would write' : 'wrote'} ${path.relative(ROOT, file)}`)
  return true
}

function normalizeLogin(value) {
  return String(value == null ? '' : value).trim().replace(/^@/, '')
}

function keyOf(login) {
  return normalizeLogin(login).toLowerCase()
}

function isBot(login) {
  const value = keyOf(login)
  return (
    /\[bot\]$/.test(value) ||
    /^(dependabot|renovate|github-actions|codecov|greenkeeper|mergify|snyk-bot)$/.test(value) ||
    /-bot$/.test(value) ||
    /^bot-/.test(value)
  )
}

function badgeFileName(login) {
  return (
    keyOf(login)
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || 'contributor'
  )
}

function finite(value, fallback = 0) {
  const number = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(number) ? number : fallback
}

function compareStrings(a, b) {
  return a < b ? -1 : a > b ? 1 : 0
}

function escapeXml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function fit(value, max) {
  const text = String(value == null ? '' : value)
  if (text.length <= max) return text
  return `${text.slice(0, Math.max(0, max - 1)).trim()}…`
}

function innerSvg(text) {
  return String(text || '')
    .replace(/<\?xml[\s\S]*?\?>/gi, '')
    .replace(/<svg\b[^>]*>/i, '')
    .replace(/<\/svg>\s*$/i, '')
    .replace(/<title[\s\S]*?<\/title>/gi, '')
    .trim()
}

/* ------------------------------------------------------------------ */
/* Configuration                                                      */
/* ------------------------------------------------------------------ */

const ranks = readYaml(path.join(DATA_DIR, 'ranks.yml'), null)
if (!ranks || typeof ranks !== 'object') fail('_data/ranks.yml is missing or empty.')
if (!Array.isArray(ranks.tiers) || ranks.tiers.length === 0) fail('_data/ranks.yml needs at least one tier.')
if (!ranks.signals || typeof ranks.signals !== 'object') fail('_data/ranks.yml needs a signals map.')

const tiers = ranks.tiers
  .map((tier) => ({
    id: String(tier.id || '').trim(),
    label: String(tier.label || tier.id || '').trim(),
    min_points: finite(tier.min_points, 0),
    color: String(tier.color || '#59a878'),
    badge_label: String(tier.badge_label || `Wombat ${tier.label || tier.id || 'Contributor'}`),
    blurb: String(tier.blurb || ''),
  }))
  .sort((a, b) => a.min_points - b.min_points)

if (!tiers[0] || tiers[0].min_points !== 0) fail('The first tier must have min_points: 0.')
for (const tier of tiers) {
  if (!tier.id) fail('Every tier needs an id.')
  if (!tier.label) fail(`Tier ${tier.id} needs a label.`)
}

const signalKeys = Object.keys(ranks.signals)
if (signalKeys.length === 0) fail('_data/ranks.yml needs at least one signal.')

const signals = {}
for (const key of signalKeys) {
  const signal = ranks.signals[key] || {}
  signals[key] = {
    label: String(signal.label || key),
    weight: finite(signal.weight, 0),
    cap: Math.max(0, finite(signal.cap, 0)),
    source: String(signal.source || ''),
    description: String(signal.description || ''),
  }
}

const privacy = ranks.privacy && typeof ranks.privacy === 'object' ? ranks.privacy : {}
const excludeBots = privacy.exclude_bots !== false
const optOut = new Set((Array.isArray(privacy.opt_out) ? privacy.opt_out : []).map(keyOf))
const noBadge = new Set((Array.isArray(privacy.no_badge) ? privacy.no_badge : []).map(keyOf))

const overrides = new Map()
if (ranks.overrides && typeof ranks.overrides === 'object') {
  for (const [login, override] of Object.entries(ranks.overrides)) {
    if (override && typeof override === 'object') overrides.set(keyOf(login), override)
  }
}

/* ------------------------------------------------------------------ */
/* Merge cached + curated identity data                               */
/* ------------------------------------------------------------------ */

const people = new Map()

function ensurePerson(login, source, fields = {}) {
  const normalized = normalizeLogin(login)
  if (!normalized) return null
  const key = keyOf(normalized)
  if (!key) return null

  if (excludeBots && isBot(normalized)) {
    vlog(`skip bot: ${normalized}`)
    return null
  }
  if (optOut.has(key)) {
    vlog(`skip opt-out: ${normalized}`)
    return null
  }

  let person = people.get(key)
  if (!person) {
    person = {
      key,
      login: normalized,
      display_name: '',
      sources: [],
      curated_types: [],
      role: '',
      position: '',
      github: { contributions: 0, avatar_url: '', html_url: '' },
      gh: null,
      curated: { points: null, manual_points: 0, signals: {} },
    }
    people.set(key, person)
  }

  if (!person.sources.includes(source)) person.sources.push(source)
  if (!person.display_name) {
    const name = fields.display_name || fields.name || ''
    if (name) person.display_name = String(name)
  }
  if (!person.role && fields.role) person.role = String(fields.role)
  if (!person.position && fields.position) person.position = String(fields.position)

  if (Array.isArray(fields.types)) {
    for (const type of fields.types) {
      const value = String(type)
      if (!person.curated_types.includes(value)) person.curated_types.push(value)
    }
  }

  if (fields.points != null && finite(fields.points, null) != null) {
    person.curated.points = finite(fields.points, 0)
  }
  if (fields.manual_points != null) {
    person.curated.manual_points += finite(fields.manual_points, 0)
  }
  if (fields.signals && typeof fields.signals === 'object') {
    for (const [signal, count] of Object.entries(fields.signals)) {
      if (!Object.prototype.hasOwnProperty.call(signals, signal)) continue
      person.curated.signals[signal] = (person.curated.signals[signal] || 0) + Math.max(0, finite(count, 0))
    }
  }

  return person
}

// Curated identity first, so display names win over the raw cache.
for (const entry of readYamlArray(path.join(DATA_DIR, 'core_contributors.yml'))) {
  ensurePerson(entry.github, 'core_contributors', entry)
}
for (const entry of readYamlArray(path.join(DATA_DIR, 'community_contributors.yml'))) {
  ensurePerson(entry.github, 'community_contributors', entry)
}
for (const entry of readYamlArray(path.join(DATA_DIR, 'honoured_members.yml'))) {
  ensurePerson(entry.github, 'honoured_members', entry)
}

const contributorCache = readJson(path.join(DATA_DIR, 'github_contributors.json'), { contributors: [] })
const cachedContributors = Array.isArray(contributorCache.contributors) ? contributorCache.contributors : []
for (const entry of cachedContributors) {
  const person = ensurePerson(entry.login, 'github_contributors', {})
  if (!person) continue
  person.github.contributions = Math.max(0, finite(entry.contributions, 0))
  person.github.avatar_url = String(entry.avatar_url || '')
  person.github.html_url = String(entry.html_url || `https://github.com/${person.login}`)
  if (!person.display_name) person.display_name = person.login
}

// Overrides may also name a login that is not in any source. Keep them out of
// the output unless they have an actual GitHub login; the rank engine is not a
// place to invent people.
for (const [key, override] of overrides) {
  if ((override.exclude === true || override.opt_out === true) && people.has(key)) {
    vlog(`skip override opt-out: ${key}`)
    people.delete(key)
  }
}

/* ------------------------------------------------------------------ */
/* Optional GraphQL enrichment                                        */
/* ------------------------------------------------------------------ */

const token = process.env.GITHUB_TOKEN
const shouldEnrich = Boolean(token) && (opts.online || !opts.dryRun)

async function enrichPerson(person, repo) {
  const login = person.login
  const queries = {
    mergedPr: `repo:${repo} is:pr is:merged author:${login}`,
    reviews: `repo:${repo} is:pr reviewed-by:${login}`,
    triage: `repo:${repo} is:issue assignee:${login}`,
    docs: `repo:${repo} is:pr is:merged author:${login} label:"area:docs"`,
    translation: `repo:${repo} is:pr is:merged author:${login} label:"area:translation"`,
    controls: `repo:${repo} is:pr is:merged author:${login} label:"area:controls"`,
    rfc: `repo:${repo} is:pr is:merged author:${login} label:"area:rfc"`,
  }

  const query = `query($mergedPr:String!, $reviews:String!, $triage:String!, $docs:String!, $translation:String!, $controls:String!, $rfc:String!) {
    mergedPr: search(query: $mergedPr, type: ISSUE, first: 1) { issueCount }
    reviews: search(query: $reviews, type: ISSUE, first: 1) { issueCount }
    triage: search(query: $triage, type: ISSUE, first: 1) { issueCount }
    docs: search(query: $docs, type: ISSUE, first: 1) { issueCount }
    translation: search(query: $translation, type: ISSUE, first: 1) { issueCount }
    controls: search(query: $controls, type: ISSUE, first: 1) { issueCount }
    rfc: search(query: $rfc, type: ISSUE, first: 1) { issueCount }
  }`

  try {
    const response = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'wombat-ranks',
      },
      body: JSON.stringify({ query, variables: queries }),
      signal: AbortSignal.timeout(20000),
    })
    if (!response.ok) {
      vlog(`graphql ${login}: HTTP ${response.status} — keeping cache/curated values`)
      return
    }
    const payload = await response.json()
    if (payload.errors && payload.errors.length) {
      vlog(`graphql ${login}: ${payload.errors[0].message} — keeping cache/curated values`)
      return
    }
    const data = payload.data || {}
    const count = (alias) => Math.max(0, finite(data[alias] && data[alias].issueCount, 0))
    person.gh = {
      merged_pr: count('mergedPr'),
      review: count('reviews'),
      issue_triage: count('triage'),
      docs: count('docs'),
      translation: count('translation'),
      controls_rfc: count('controls') + count('rfc'),
    }
    vlog(`graphql ${login}: ${JSON.stringify(person.gh)}`)
  } catch (err) {
    vlog(`graphql ${login}: ${err.message} — keeping cache/curated values`)
  }
}

/* ------------------------------------------------------------------ */
/* Compute ranks                                                      */
/* ------------------------------------------------------------------ */

function tierFor(points) {
  let current = tiers[0]
  for (const tier of tiers) {
    if (points >= tier.min_points) current = tier
  }
  return current
}

function computeContributor(person) {
  const override = overrides.get(person.key) || {}
  let total = 0

  for (const key of signalKeys) {
    const config = signals[key]
    let base = 0

    if (key === 'merged_pr') {
      base = person.gh && Number.isFinite(person.gh.merged_pr)
        ? person.gh.merged_pr
        : person.github.contributions
    } else if (person.gh && Number.isFinite(person.gh[key])) {
      base = person.gh[key]
    }

    const extra =
      finite(person.curated.signals[key], 0) +
      finite(override.signals && override.signals[key], 0)
    const raw = Math.max(0, base + extra)
    const counted = Math.min(raw, config.cap)
    total += counted * config.weight
  }

  const manualPoints =
    finite(person.curated.manual_points, 0) +
    finite(override.manual_points, 0)
  total += manualPoints

  if (override.points != null && finite(override.points, null) != null) {
    total = finite(override.points, 0)
  }
  total = Math.max(0, total)

  const tier = tierFor(total)
  const next = tiers.find((candidate) => candidate.min_points > total) || null
  const pointsToNext = next ? next.min_points - total : null
  const span = next ? next.min_points - tier.min_points : 0
  const progress = next && span > 0
    ? Math.min(1, Math.max(0, (total - tier.min_points) / span))
    : 1

  const suppressBadge = noBadge.has(person.key) || override.no_badge === true

  // Publish only the public GitHub login and the derived rank. Per-signal
  // counts, roles and curated notes stay in this process and in the source
  // YAML files; they are not copied into the committed rank output.
  return {
    login: person.login,
    points: total,
    rank: tier.id,
    rank_label: tier.label,
    rank_color: tier.color,
    badge_label: tier.badge_label,
    next_rank: next ? next.id : null,
    next_rank_label: next ? next.label : null,
    next_rank_color: next ? next.color : null,
    points_to_next: pointsToNext,
    progress: Math.round(progress * 1000) / 1000,
    badge: suppressBadge ? null : `/badges/${badgeFileName(person.login)}.svg`,
  }
}

async function main() {
  if (shouldEnrich) {
    const repo = String(ranks.repo || 'waf2p/framework')
    log(`Enriching ${people.size} contributor(s) from GitHub GraphQL (${repo})…`)
    for (const person of people.values()) {
      await enrichPerson(person, repo)
    }
  } else if (token && opts.dryRun) {
    vlog('GraphQL skipped during --dry-run (pass --online to allow it).')
  } else {
    vlog('GraphQL skipped (no GITHUB_TOKEN).')
  }

  const contributors = []
  for (const person of people.values()) {
    const override = overrides.get(person.key) || {}
    if (override.exclude === true || override.opt_out === true) continue
    contributors.push(computeContributor(person))
  }

  contributors.sort(
    (a, b) => b.points - a.points || compareStrings(a.login.toLowerCase(), b.login.toLowerCase())
  )

  const output = {
    schema: finite(ranks.schema, 1),
    repo: String(ranks.repo || 'waf2p/framework'),
    source: 'cached github contributors + curated yaml',
    tiers: tiers.map((tier) => ({
      id: tier.id,
      label: tier.label,
      min_points: tier.min_points,
      color: tier.color,
      badge_label: tier.badge_label,
      blurb: tier.blurb,
    })),
    signals: Object.fromEntries(
      signalKeys.map((key) => [
        key,
        {
          label: signals[key].label,
          weight: signals[key].weight,
          cap: signals[key].cap,
          source: signals[key].source,
          description: signals[key].description,
        },
      ])
    ),
    privacy: {
      publish: Array.isArray(privacy.publish) ? privacy.publish.slice() : ['github_login', 'rank'],
      exclude_bots: excludeBots,
    },
    contributors,
  }

  // Read the previous output before overwriting it, so rank changes can be
  // compared against the last committed run. On the first run there is no
  // previous data and no promotions are emitted.
  const previousOutput = readJson(path.join(DATA_DIR, 'contributor_ranks.json'), null)

  const json = `${JSON.stringify(output, null, 2)}\n`
  const wroteData = writeIfChanged(path.join(DATA_DIR, 'contributor_ranks.json'), json)
  const wrotePublic = writeIfChanged(path.join(PUBLIC_DATA_DIR, 'contributor-ranks.json'), json)

  // Badges. Read the mascot and pillar art once; no external references.
  const avatarInner = existsSync(AVATAR_FILE) ? innerSvg(readText(AVATAR_FILE)) : ''
  const pillarInners = {}
  for (const slug of PILLAR_ORDER) {
    const file = path.join(PILLAR_DIR, `${slug}.svg`)
    pillarInners[slug] = existsSync(file) ? innerSvg(readText(file)) : ''
  }

  let badgeCount = 0
  for (const contributor of contributors) {
    if (!contributor.badge) continue
    const file = path.join(BADGE_DIR, `${badgeFileName(contributor.login)}.svg`)
    const svg = renderBadge(contributor, avatarInner, pillarInners)
    if (writeIfChanged(file, svg)) badgeCount += 1
  }

  // A privacy opt-out or no-badge decision removes a previously generated file.
  for (const key of [...optOut, ...noBadge]) {
    const file = path.join(BADGE_DIR, `${badgeFileName(key)}.svg`)
    if (!existsSync(file)) continue
    if (!opts.dryRun) rmSync(file)
    vlog(`${opts.dryRun ? 'would remove' : 'removed'} ${path.relative(ROOT, file)}`)
  }

  // Rank changes since the previous run. First run is deliberately quiet.
  const promotions = buildPromotions(contributors, previousOutput)
  const promotionsBody = promotions.length
    ? yamlDump(promotions, { noRefs: true, lineWidth: 120, sortKeys: false })
    : '[]\n'
  const promotionsYaml = `# Generated by scripts/ranks.mjs — do not edit.\n${promotionsBody}`
  const wrotePromotions = writeIfChanged(path.join(DATA_DIR, 'community_promotions.yml'), promotionsYaml)

  log('')
  log(`Contributors: ${contributors.length}`)
  for (const contributor of contributors.slice(0, 12)) {
    const next = contributor.points_to_next == null
      ? 'top rank'
      : `${contributor.points_to_next} pts to ${contributor.next_rank_label}`
    vlog(`  ${contributor.login.padEnd(20)} ${String(contributor.points).padStart(4)} pts  ${contributor.rank_label} (${next})`)
  }
  if (contributors.length > 12) vlog(`  … ${contributors.length - 12} more`)
  log(`Badges ${opts.dryRun ? 'to write' : 'updated'}: ${badgeCount}`)
  log(`Rank changes: ${promotions.length}`)
  log(
    opts.dryRun
      ? `Dry run — no files written${wroteData || wrotePublic || wrotePromotions ? '' : ' (output already current)'}.`
      : 'Ranks and badges updated.'
  )
}

function renderBadge(contributor, avatarInner, pillarInners) {
  const color = contributor.rank_color || BADGE_MUTED
  const login = fit(contributor.login, 24)
  const label = fit(contributor.rank_label.toUpperCase(), 22)
  const title = `${contributor.badge_label} badge — @${contributor.login}`

  const avatar = avatarInner
    ? `<g transform="translate(10 8) scale(0.2917)">${avatarInner}</g>`
    : `<rect x="10" y="8" width="70" height="70" rx="18" fill="#0b1f15"/>`

  const pillars = PILLAR_ORDER.map((slug, index) => {
    const inner = pillarInners[slug] || '<circle cx="12" cy="12" r="7"/>'
    return `<g transform="translate(${310 + index * 18} 66) scale(0.5)" fill="none" stroke="${BADGE_MUTED}" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" opacity="0.75">${inner}</g>`
  }).join('')

  return `<svg xmlns="http://www.w3.org/2000/svg" width="460" height="88" viewBox="0 0 460 88" role="img" aria-labelledby="title">
  <title id="title">${escapeXml(title)}</title>
  <rect width="460" height="88" rx="16" fill="${BADGE_BG}"/>
  <rect x="1" y="1" width="458" height="86" rx="15" fill="none" stroke="${BADGE_BORDER}" stroke-opacity="0.24"/>
  ${avatar}
  <text x="92" y="38" font-family="'League Spartan', 'Helvetica Neue', Arial, sans-serif" font-size="20" font-weight="700" letter-spacing="2" fill="${BADGE_INK}">WOMBAT</text>
  <text x="92" y="56" font-family="ui-monospace, Menlo, Consolas, monospace" font-size="12" fill="${BADGE_MUTED}">@${escapeXml(login)}</text>
  <text x="92" y="72" font-family="ui-monospace, Menlo, Consolas, monospace" font-size="9" letter-spacing="2" fill="${BADGE_MUTED}">CONTRIBUTOR RANK</text>
  <text x="448" y="38" text-anchor="end" font-family="'League Spartan', 'Helvetica Neue', Arial, sans-serif" font-size="20" font-weight="700" letter-spacing="1" fill="${color}">${escapeXml(label)}</text>
  <text x="448" y="54" text-anchor="end" font-family="ui-monospace, Menlo, Consolas, monospace" font-size="9" letter-spacing="2" fill="${BADGE_MUTED}">WOMBAT RANK</text>
  ${pillars}
</svg>
`
}

function buildPromotions(contributors, previous) {
  if (!previous || !Array.isArray(previous.contributors)) return []

  const previousRanks = new Map()
  for (const person of previous.contributors) {
    if (!person || !person.login || !person.rank) continue
    previousRanks.set(keyOf(person.login), String(person.rank))
  }
  if (previousRanks.size === 0) return []

  const promotions = []
  for (const contributor of contributors) {
    const before = previousRanks.get(keyOf(contributor.login))
    if (!before || before === contributor.rank) continue
    promotions.push({
      login: contributor.login,
      from: before,
      to: contributor.rank,
      points: contributor.points,
      direction: contributor.points > 0 ? 'promotion' : 'change',
    })
  }
  promotions.sort((a, b) => compareStrings(a.login.toLowerCase(), b.login.toLowerCase()))
  return promotions
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
