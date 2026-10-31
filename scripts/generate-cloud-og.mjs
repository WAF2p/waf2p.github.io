#!/usr/bin/env node
/*
 * Generate provider-specific 1200×630 Open Graph cards.
 *
 *   node scripts/generate-cloud-og.mjs
 *
 * Requires Playwright and a local Chrome (same as scripts/generate-og.mjs).
 * Outputs:
 *   images/og/cloud/<slug>.png
 *   images/og/cloud/<slug>-de.png
 */
import fs from 'node:fs'
import path from 'node:path'
import { load as yamlLoad } from 'js-yaml'
import { chromium } from 'playwright'

const ROOT = process.cwd()
const OUT = path.join(ROOT, 'images/og/cloud')
const MAP_DIR = path.join(ROOT, 'images/cloud-regions')

const FONTS = {
  display: 'league-spartan-latin-600-normal.woff2',
  body: 'plus-jakarta-sans-latin-500-normal.woff2',
}

const COPY = {
  en: {
    kicker: 'WOMBAT // CLOUD PROVIDER',
    subtitle: 'Provider-neutral baseline for multi-cloud comparison, evidence and sovereignty.',
    controls: 'controls',
    regions: 'region codes',
    framework: 'Framework control coverage',
    dashboard: 'Dashboard-tracked · coverage expanding',
    region: 'Region-map tracked · discovery baseline',
    footerRight: 'Approximate regions · not a datacenter map',
  },
  de: {
    kicker: 'WOMBAT // CLOUD-PROVIDER',
    subtitle: 'Providerneutrale Baseline für Multi-Cloud-Vergleich, Evidenz und Souveränität.',
    controls: 'Controls',
    regions: 'Regionscodes',
    framework: 'Framework-Control-Abdeckung',
    dashboard: 'Dashboard-getrackt · Abdeckung wird ausgebaut',
    region: 'Region-Map erkannt · Discovery-Baseline',
    footerRight: 'Ungefähre Regionen · keine Datacenter-Karte',
  },
}

function readFont(name) {
  return fs.readFileSync(path.join(ROOT, 'assets/fonts', name)).toString('base64')
}

function readSvg(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8')
    .replace(/<title[\s\S]*?<\/title>/g, '')
}

function innerSvg(text) {
  return text
    .replace(/<\?xml[\s\S]*?\?>/gi, '')
    .replace(/<svg\b[^>]*>/i, '')
    .replace(/<\/svg>\s*$/i, '')
    .trim()
}

function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const FONT_DISPLAY = readFont(FONTS.display)
const FONT_BODY = readFont(FONTS.body)
const MASCOT = innerSvg(readSvg('images/brand/mascot/wombat-avatar.svg'))

const clouds = yamlLoad(fs.readFileSync(path.join(ROOT, '_data/clouds.yml'), 'utf8')).clouds
const regions = yamlLoad(fs.readFileSync(path.join(ROOT, '_data/cloud_regions.yml'), 'utf8'))

function cardHtml(cloud, slug, lang) {
  const t = COPY[lang]
  const coverageLabel = t[cloud.coverage] || t.region
  const controls = Number(cloud.control_count || 0)
  const regionCount = regions[slug] ? regions[slug].region_count : '—'
  const mapFile = path.join(MAP_DIR, `${slug}.svg`)
  const mapSvg = fs.existsSync(mapFile)
    ? fs.readFileSync(mapFile, 'utf8').replace(/<title[\s\S]*?<\/title>/g, '')
    : ''
  const titleClass = String(cloud.name).length > 18 ? ' title--long' : ''
  const footer = `wombat-gov.dev${lang === 'de' ? '/de' : ''}/cloud/${slug}/`

  return `<!doctype html><html><head><meta charset="utf-8"><style>
    @font-face{font-family:'League Spartan';font-weight:600;src:url(data:font/woff2;base64,${FONT_DISPLAY}) format('woff2');}
    @font-face{font-family:'Plus Jakarta Sans';font-weight:500;src:url(data:font/woff2;base64,${FONT_BODY}) format('woff2');}
    *{box-sizing:border-box}
    html,body{margin:0;width:1200px;height:630px;overflow:hidden}
    body{background:#06120c;color:#8df5b5;font-family:'Plus Jakarta Sans',system-ui,sans-serif}
    .card{position:relative;width:1200px;height:630px;padding:44px 52px;display:flex;flex-direction:column;
      background-image:repeating-linear-gradient(to bottom, rgba(255,255,255,.018) 0 1px, rgba(0,0,0,.14) 1px 3px);}
    .frame{position:absolute;inset:24px;border:1px solid rgba(141,245,181,.26);border-radius:24px;pointer-events:none}
    .top{display:flex;align-items:center;justify-content:space-between;position:relative;z-index:2}
    .brand{display:flex;align-items:center;gap:14px}
    .mark{width:50px;height:50px;border-radius:50%;overflow:hidden}
    .mark svg{display:block;width:100%;height:100%}
    .kicker{font-family:'League Spartan',system-ui,sans-serif;font-weight:600;font-size:13px;letter-spacing:3.2px;color:#59a878}
    .wordmark{font-family:'League Spartan',system-ui,sans-serif;font-weight:600;font-size:21px;letter-spacing:2px;color:#eafff2}
    .coverage{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:12px;letter-spacing:1px;color:#8df5b5;text-align:right;max-width:360px}
    .body{display:flex;align-items:center;justify-content:space-between;flex:1;position:relative;z-index:2;gap:28px}
    .lead{max-width:600px}
    h1{margin:0;font-family:'League Spartan',system-ui,sans-serif;font-weight:600;font-size:66px;line-height:1.02;letter-spacing:-1.4px;color:#eafff2}
    h1.title--long{font-size:50px}
    .subtitle{margin:16px 0 0;font-size:20px;line-height:1.35;color:#8df5b5}
    .stats{display:flex;gap:34px;margin-top:26px}
    .stats strong{display:block;font-family:'League Spartan',system-ui,sans-serif;font-weight:600;font-size:34px;line-height:1;color:#eafff2}
    .stats span{display:block;margin-top:6px;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:11px;letter-spacing:1px;color:#59a878}
    .map{flex:none;width:470px;height:235px;padding:10px;border-radius:22px;background:#0b1f15;border:1px solid rgba(141,245,181,.2);overflow:hidden}
    .map svg{display:block;width:100%;height:100%}
    .footer{display:flex;justify-content:space-between;align-items:center;position:relative;z-index:2;
      font-family:ui-monospace,Menlo,Consolas,monospace;font-size:12px;color:#59a878;letter-spacing:.4px}
  </style></head><body>
    <div class="card">
      <div class="frame"></div>
      <div class="top">
        <div class="brand">
          <div class="mark">${MASCOT}</div>
          <div><div class="kicker">${escapeHtml(t.kicker)}</div><div class="wordmark">WOMBAT</div></div>
        </div>
        <div class="coverage">${escapeHtml(coverageLabel)}</div>
      </div>
      <div class="body">
        <div class="lead">
          <h1 class="${titleClass.trim()}">${escapeHtml(cloud.name)}</h1>
          <p class="subtitle">${escapeHtml(t.subtitle)}</p>
          <div class="stats">
            ${controls > 0 ? `<div><strong>${controls}</strong><span>${escapeHtml(t.controls)}</span></div>` : ''}
            <div><strong>${regionCount}</strong><span>${escapeHtml(t.regions)}</span></div>
          </div>
        </div>
        <div class="map">${mapSvg}</div>
      </div>
      <div class="footer"><span>${escapeHtml(footer)}</span><span>${escapeHtml(t.footerRight)}</span></div>
    </div>
  </body></html>`
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true })
  const browser = await chromium.launch({ channel: 'chrome' })
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 })

  async function render(html, file) {
    await page.setContent(html, { waitUntil: 'load' })
    await page.evaluate(() => document.fonts.ready)
    await page.waitForTimeout(80)
    await page.screenshot({ path: file })
    console.log('wrote', path.relative(ROOT, file))
  }

  for (const lang of ['en', 'de']) {
    for (const [slug, cloud] of Object.entries(clouds)) {
      const suffix = lang === 'de' ? '-de' : ''
      await render(cardHtml(cloud, slug, lang), path.join(OUT, `${slug}${suffix}.png`))
    }
  }

  await browser.close()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
