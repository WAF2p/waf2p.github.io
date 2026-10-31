#!/usr/bin/env node
/**
 * Local link checker for the built Jekyll site.
 *
 *   bundle exec jekyll build
 *   node scripts/check-links.mjs
 *
 * Checks every href/src in the built _site HTML files for a matching local file.
 * External URLs, mailto/tel/javascript/data links and fragments are ignored.
 * Antora output under /docs/ is ignored because the Jekyll build does not
 * generate it; the deploy workflow builds Antora separately.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SITE = path.join(ROOT, '_site')
const SKIP_PREFIXES = ['/docs/']
const ALL = process.argv.includes('--all')
const OWNED_PREFIXES = [
  'cloud/', 'de/cloud/',
  'compliance/', 'de/compliance/',
  'sovereignty/', 'de/sovereignty/',
  'trust/', 'de/trust/',
  'for/', 'contributors/', 'staff_members/',
  'newsletter/', 'de/newsletter/',
]
const ATTR_RE = /\b(?:href|src)="([^"]+)"/gi

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry)
    const stat = statSync(full)
    if (stat.isDirectory()) walk(full, files)
    else if (entry.endsWith('.html')) files.push(full)
  }
  return files
}

function isExternal(value) {
  return /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(value)
}

function targetExists(base, rawPath) {
  let pathname
  try {
    pathname = decodeURIComponent(rawPath.split(/[?#]/)[0])
  } catch (_) {
    pathname = rawPath.split(/[?#]/)[0]
  }
  if (!pathname) return true
  if (pathname.startsWith('/')) {
    if (SKIP_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return true
  }

  const resolved = pathname.startsWith('/')
    ? path.join(SITE, pathname)
    : path.resolve(path.dirname(base), pathname)

  const candidates = [resolved]
  if (pathname.endsWith('/')) candidates.push(path.join(resolved, 'index.html'))
  else {
    candidates.push(`${resolved}.html`)
    candidates.push(path.join(resolved, 'index.html'))
  }
  return candidates.some((candidate) => existsSync(candidate))
}

if (!existsSync(SITE)) {
  console.error('error: _site/ does not exist. Run `bundle exec jekyll build` first.')
  process.exit(1)
}

const pages = walk(SITE).filter((file) => {
  const relative = path.relative(SITE, file).split(path.sep).join('/')
  if (relative.startsWith('docs/')) return false
  if (ALL) return true
  return OWNED_PREFIXES.some((prefix) => relative.startsWith(prefix)) ||
    relative === 'index.html' ||
    relative === 'de/index.html' ||
    relative === 'security.txt' ||
    relative === '.well-known/security.txt'
})
const missing = []

for (const page of pages) {
  const html = readFileSync(page, 'utf8')
  let match
  ATTR_RE.lastIndex = 0
  while ((match = ATTR_RE.exec(html))) {
    const ref = match[1].trim()
    if (!ref || isExternal(ref)) continue
    if (!targetExists(page, ref)) {
      missing.push({ page: path.relative(ROOT, page), ref })
    }
  }
}

if (missing.length) {
  console.error(`Broken local links: ${missing.length}`)
  const targetCounts = new Map()
  for (const item of missing) {
    targetCounts.set(item.ref, (targetCounts.get(item.ref) || 0) + 1)
  }
  console.error('Missing targets (top 20):')
  for (const [ref, count] of [...targetCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20)) {
    console.error(`  ${count}x ${ref}`)
  }
  for (const item of missing.slice(0, 100)) {
    console.error(`  ${item.page} -> ${item.ref}`)
  }
  if (missing.length > 100) console.error(`  … ${missing.length - 100} more`)
  process.exit(1)
}

console.log(`Link check passed: ${pages.length} HTML pages, 0 broken local links.`)
if (!ALL) console.log('Scoped check. Run with --all for the full site (may include pre-existing localized link debt).')
