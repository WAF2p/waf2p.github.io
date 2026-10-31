#!/usr/bin/env node
/*
 * Check the external links used by the compliance and trust pages.
 *
 *   node scripts/check-external-links.mjs
 *
 * A scheduled workflow runs this weekly. 404/410 and persistent network
 * failures are treated as broken; 401/403/429 are reported as restricted but
 * do not fail the check.
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { load as yamlLoad } from 'js-yaml'

const ROOT = process.cwd()
const FILES = [
  '_data/compliance.yml',
  '_data/compliance_de.yml',
  '_data/trust.yml',
  '_data/trust_de.yml',
]

const urls = new Set()

function add(value) {
  if (typeof value === 'string' && /^https?:\/\//i.test(value)) {
    urls.add(value)
  }
}

for (const relative of FILES) {
  const data = yamlLoad(readFileSync(path.join(ROOT, relative), 'utf8'))
  if (data && data.regulations) {
    for (const regulation of Object.values(data.regulations)) {
      if (regulation && regulation.official_url) add(regulation.official_url)
    }
  }
  if (data && Array.isArray(data.sections)) {
    for (const section of data.sections) {
      for (const link of section.links || []) add(link.url)
    }
  }
}

const sorted = [...urls].sort()

async function check(url) {
  const headers = {
    'User-Agent': 'Wombat link check (https://www.wombat-gov.dev)',
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  }
  try {
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      headers,
      signal: AbortSignal.timeout(20000),
    })
    return { url, status: response.status }
  } catch (error) {
    return { url, error: error.message }
  }
}

let broken = 0
let restricted = 0

for (const url of sorted) {
  let result = await check(url)
  if (result.error) {
    await new Promise((resolve) => setTimeout(resolve, 1200))
    result = await check(url)
  }

  if (result.error) {
    broken += 1
    console.log(`BROKEN network ${url} — ${result.error}`)
    continue
  }

  if (result.status === 404 || result.status === 410) {
    broken += 1
    console.log(`BROKEN ${result.status} ${url}`)
  } else if ([401, 403, 429].includes(result.status)) {
    restricted += 1
    console.log(`RESTRICTED ${result.status} ${url}`)
  } else if (result.status >= 200 && result.status < 400) {
    console.log(`ok ${result.status} ${url}`)
  } else {
    broken += 1
    console.log(`BROKEN ${result.status} ${url}`)
  }
}

console.log(`\nChecked ${sorted.length} external links: ${broken} broken, ${restricted} restricted.`)
if (broken) process.exit(1)
