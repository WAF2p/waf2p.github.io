#!/usr/bin/env node
/*
 * Generate the public provider data export.
 *
 *   node scripts/generate-provider-data.mjs
 *
 * Outputs:
 *   assets/data/providers.json
 *   assets/data/providers.csv
 *
 * The data is a derived compilation from the WOMBATpass dashboard and the
 * Wombat framework control pack. It is published under CC BY 4.0 with a clear
 * no-warranty disclaimer. No personal data is included.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { load as yamlLoad } from 'js-yaml'

const ROOT = process.cwd()
const DATA = path.join(ROOT, '_data')
const OUT = path.join(ROOT, 'assets', 'data')

const cloudsFile = path.join(DATA, 'clouds.yml')
const regionsFile = path.join(DATA, 'cloud_regions.yml')
const breakdownFile = path.join(DATA, 'provider_control_breakdown.yml')
const pillarsFile = path.join(DATA, 'pillars.yml')

const cloudsConfig = yamlLoad(readFileSync(cloudsFile, 'utf8'))
const clouds = cloudsConfig.clouds || {}
const regions = yamlLoad(readFileSync(regionsFile, 'utf8')) || {}
const breakdown = yamlLoad(readFileSync(breakdownFile, 'utf8')) || {}
const pillars = yamlLoad(readFileSync(pillarsFile, 'utf8')) || []
const contact = cloudsConfig.provider_data_contact || 'page@wombat-gov.dev'
const updated = cloudsConfig.region_data_updated || ''

const coverageRank = { framework: 0, dashboard: 1, region: 2 }

const providers = Object.entries(clouds)
  .map(([slug, cloud]) => {
    const regionData = regions[slug] || {}
    const providerBreakdown = breakdown[slug] || {}
    const name = cloud.name || slug
    return {
      slug,
      name,
      coverage: cloud.coverage || 'region',
      controls: Number(cloud.control_count || 0),
      region_count: Number(regionData.region_count || 0),
      regions: Array.isArray(regionData.locations) ? regionData.locations.slice() : [],
      pillars: providerBreakdown.pillars || {},
      url: `https://www.wombat-gov.dev/cloud/${slug}/`,
      de_url: `https://www.wombat-gov.dev/de/cloud/${slug}/`,
      correction_email: `mailto:${contact}?subject=${encodeURIComponent(`Correction: ${name} provider data`)}`,
      correction_issue: `https://github.com/WAF2p/waf2p.github.io/issues/new?template=provider-data-correction.yml&title=${encodeURIComponent(`[Provider data] ${name}`)}`,
    }
  })
  .sort((a, b) => {
    const rank = (coverageRank[a.coverage] ?? 9) - (coverageRank[b.coverage] ?? 9)
    if (rank !== 0) return rank
    return a.name < b.name ? -1 : a.name > b.name ? 1 : 0
  })

const payload = {
  schema: 'wombat-provider-data/1',
  license: 'CC BY 4.0',
  license_url: 'https://creativecommons.org/licenses/by/4.0/',
  license_file: 'https://www.wombat-gov.dev/assets/data/LICENSE.txt',
  attribution: 'Wombat Community, derived from the WOMBATpass dashboard and the Wombat framework control pack',
  source: 'https://github.com/WAF2p/waf2p.github.io',
  methodology: 'https://www.wombat-gov.dev/cloud/methodology/',
  disclaimer: 'Provider names, coverage levels, control counts and region labels are compiled from the WOMBATpass dashboard and the Wombat framework control pack. The data is not cross-validated with the providers and may be incomplete, approximate or outdated. It is provided for general orientation only, without warranty, and is not a guarantee of service availability, a datacenter address or provider certification.',
  region_data_updated: updated,
  providers,
}

const json = `${JSON.stringify(payload, null, 2)}\n`

function csvCell(value) {
  const text = String(value == null ? '' : value)
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`
  return text
}

const csvRows = [
  ['slug', 'name', 'coverage', 'controls', 'region_count', 'url', 'de_url', 'correction_email', 'correction_issue'],
  ...providers.map((provider) => [
    provider.slug,
    provider.name,
    provider.coverage,
    provider.controls,
    provider.region_count,
    provider.url,
    provider.de_url,
    provider.correction_email,
    provider.correction_issue,
  ]),
]
const csv = `${csvRows.map((row) => row.map(csvCell).join(',')).join('\n')}\n`

mkdirSync(OUT, { recursive: true })
writeFileSync(path.join(OUT, 'providers.json'), json, 'utf8')
writeFileSync(path.join(OUT, 'providers.csv'), csv, 'utf8')
console.log(`Wrote ${providers.length} providers to assets/data/providers.json and assets/data/providers.csv`)
