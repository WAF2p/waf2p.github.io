#!/usr/bin/env node
/*
 * Generate 1200×630 Open Graph cards for the brand system.
 *
 *   node scripts/generate-og.mjs
 *
 * Requires Playwright with the locally installed Chrome:
 *   npx playwright install chrome   (or use the channel below)
 *
 * Outputs:
 *   images/og/pillars/<slug>.png      (EN)
 *   images/og/pillars/<slug>-de.png   (DE)
 *   images/og/brand.png, brand-de.png
 *   images/og/wombat-room.png, wombat-room-de.png
 *
 * The card uses the same League Spartan / Plus Jakarta fonts, mascot
 * SVGs and pillar icon SVGs as the site. Fonts are embedded as data
 * URIs so the page can be rendered with page.setContent().
 */
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'images/og');
const PILLAR_DIR = path.join(OUT, 'pillars');

const FONTS = {
  display: 'league-spartan-latin-600-normal.woff2',
  body: 'plus-jakarta-sans-latin-500-normal.woff2'
};

const PILLARS = [
  { slug: 'security', en: 'Security', de: 'Sicherheit', code: 'WAF-SEC' },
  { slug: 'cost-optimization', en: 'Cost Optimization', de: 'Kostenoptimierung', code: 'WAF-COST' },
  { slug: 'performance-efficiency', en: 'Performance Efficiency', de: 'Leistungseffizienz', code: 'WAF-PERF' },
  { slug: 'reliability', en: 'Reliability', de: 'Zuverlässigkeit', code: 'WAF-REL' },
  { slug: 'operational-excellence', en: 'Operational Excellence', de: 'Operative Exzellenz', code: 'WAF-OPS' },
  { slug: 'sustainability', en: 'Sustainability', de: 'Nachhaltigkeit', code: 'WAF-SUS' },
  { slug: 'sovereign', en: 'Sovereign', de: 'Souverän', code: 'WAF-SOV' },
  { slug: 'agentic', en: 'Agentic', de: 'Agentisch', code: 'WAF-AGN' }
];

const TEXT = {
  en: {
    kicker: 'WOMBAT // CONTROL ROOM',
    pillarSub: 'One of the eight Wombat pillars',
    pillarPrompt: '> pillar loaded',
    brandKicker: 'WOMBAT // BRAND',
    brandTitle: 'The Wombat brand',
    brandSub: 'Mascot · Pillar icons · Color',
    brandPrompt: '> brand system loaded',
    brandFooter: 'wombat-gov.dev/brand',
    roomKicker: 'WOMBAT // CONTROL ROOM',
    roomTitle: 'Wombat Control Room',
    roomSub: 'Dig the eight pillars',
    roomPrompt: '> control room online',
    roomFooter: 'wombat-gov.dev/wombat',
    footerRight: '8 pillars · 1 framework'
  },
  de: {
    kicker: 'WOMBAT // KONTROLLRAUM',
    pillarSub: 'Eine der acht Wombat-Säulen',
    pillarPrompt: '> Säule geladen',
    brandKicker: 'WOMBAT // MARKE',
    brandTitle: 'Die Wombat-Marke',
    brandSub: 'Maskottchen · Säulen-Icons · Farbe',
    brandPrompt: '> Markensystem geladen',
    brandFooter: 'wombat-gov.dev/de/brand',
    roomKicker: 'WOMBAT // KONTROLLRAUM',
    roomTitle: 'Wombat-Kontrollraum',
    roomSub: 'Grab die acht Säulen aus',
    roomPrompt: '> Kontrollraum online',
    roomFooter: 'wombat-gov.dev/de/wombat',
    footerRight: '8 Säulen · 1 Framework'
  }
};

function readFont(name) {
  return fs.readFileSync(path.join(ROOT, 'assets/fonts', name)).toString('base64');
}

function readSvg(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8').replace(/<title[\s\S]*?<\/title>/g, '');
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function cardHtml({ kicker, title, subtitle, code, prompt, footer, footerRight, iconSvg, mascotSvg }) {
  const longTitle = title.length > 18 ? ' title--long' : '';
  const art = mascotSvg || iconSvg;
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    @font-face{font-family:'League Spartan';font-weight:600;src:url(data:font/woff2;base64,${FONT_DISPLAY}) format('woff2');}
    @font-face{font-family:'Plus Jakarta Sans';font-weight:500;src:url(data:font/woff2;base64,${FONT_BODY}) format('woff2');}
    *{box-sizing:border-box}
    html,body{margin:0;width:1200px;height:630px;overflow:hidden}
    body{
      background:#06120c;
      color:#8df5b5;
      font-family:'Plus Jakarta Sans',system-ui,sans-serif;
    }
    .card{position:relative;width:1200px;height:630px;padding:48px 56px;display:flex;flex-direction:column;
      background-image:
        radial-gradient(circle at 82% 45%, rgba(46,213,115,.16), transparent 55%),
        repeating-linear-gradient(to bottom, rgba(255,255,255,.018) 0 1px, rgba(0,0,0,.14) 1px 3px);
    }
    .frame{position:absolute;inset:26px;border:1px solid rgba(141,245,181,.28);border-radius:24px;pointer-events:none}
    .top{display:flex;align-items:center;justify-content:space-between;position:relative;z-index:2}
    .brand{display:flex;align-items:center;gap:14px}
    .mark{width:52px;height:52px}
    .mark svg{display:block;width:100%;height:100%}
    .kicker{font-family:'League Spartan',system-ui,sans-serif;font-weight:600;font-size:14px;letter-spacing:3.5px;color:#59a878}
    .wordmark{font-family:'League Spartan',system-ui,sans-serif;font-weight:600;font-size:22px;letter-spacing:2px;color:#eafff2}
    .status{display:flex;align-items:center;gap:9px;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:13px;letter-spacing:1px;color:#59a878}
    .dot{width:8px;height:8px;border-radius:50%;background:#28c840;box-shadow:0 0 10px rgba(40,200,64,.8)}
    .body{display:flex;align-items:center;justify-content:space-between;flex:1;position:relative;z-index:2;gap:28px}
    .lead{max-width:660px}
    .icon{width:56px;height:56px;margin-bottom:22px;color:#8df5b5}
    .icon svg{display:block;width:100%;height:100%}
    h1{
      margin:0;font-family:'League Spartan',system-ui,sans-serif;font-weight:600;
      font-size:62px;line-height:1.02;letter-spacing:-1px;color:#eafff2;
    }
    h1.title--long{font-size:52px}
    .subtitle{margin:16px 0 0;font-size:22px;line-height:1.35;color:#8df5b5}
    .code{margin:18px 0 0;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:20px;letter-spacing:2px;color:#8df5b5}
    .prompt{margin:24px 0 0;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:15px;color:#59a878}
    .art{flex:none;width:300px;height:300px;display:flex;align-items:center;justify-content:center;color:#8df5b5}
    .art svg{display:block;width:100%;height:100%}
    .art--icon{opacity:.18}
    .art--mascot svg{width:290px;height:290px}
    .footer{display:flex;justify-content:space-between;align-items:center;position:relative;z-index:2;
      font-family:ui-monospace,Menlo,Consolas,monospace;font-size:13px;color:#59a878;letter-spacing:.5px}
  </style></head><body>
    <div class="card">
      <div class="frame"></div>
      <div class="top">
        <div class="brand">
          <div class="mark">${MASCOT}</div>
          <div><div class="kicker">${escapeHtml(kicker)}</div><div class="wordmark">WOMBAT</div></div>
        </div>
        <div class="status"><span class="dot"></span>8/8</div>
      </div>
      <div class="body">
        <div class="lead">
          ${iconSvg ? `<div class="icon">${iconSvg}</div>` : ''}
          <h1 class="${longTitle.trim()}">${escapeHtml(title)}</h1>
          <p class="subtitle">${escapeHtml(subtitle)}</p>
          ${code ? `<p class="code">${escapeHtml(code)}</p>` : ''}
          <p class="prompt">${escapeHtml(prompt)}</p>
        </div>
        <div class="art ${mascotSvg ? 'art--mascot' : 'art--icon'}">${art}</div>
      </div>
      <div class="footer"><span>${escapeHtml(footer)}</span><span>${escapeHtml(footerRight)}</span></div>
    </div>
  </body></html>`;
}

const FONT_DISPLAY = readFont(FONTS.display);
const FONT_BODY = readFont(FONTS.body);
const MASCOT = readSvg('images/brand/mascot/wombat-idle.svg');

async function main() {
  fs.mkdirSync(PILLAR_DIR, { recursive: true });

  const browser = await chromium.launch({ channel: 'chrome' });
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });

  async function render(html, file) {
    await page.setContent(html, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(120);
    await page.screenshot({ path: file });
    console.log('wrote', path.relative(ROOT, file));
  }

  for (const lang of ['en', 'de']) {
    const t = TEXT[lang];
    const footerRight = t.footerRight;

    for (const pillar of PILLARS) {
      const iconSvg = readSvg(`images/brand/pillars/${pillar.slug}.svg`);
      const title = pillar[lang];
      const html = cardHtml({
        kicker: t.kicker,
        title,
        subtitle: t.pillarSub,
        code: pillar.code,
        prompt: `${t.pillarPrompt}: ${pillar.code}`,
        footer: `wombat-gov.dev${lang === 'de' ? '/de' : ''}/pillars/${pillar.slug}/`,
        iconSvg,
        footerRight
      });
      const file = path.join(PILLAR_DIR, `${pillar.slug}${lang === 'de' ? '-de' : ''}.png`);
      await render(html, file);
    }

    await render(cardHtml({
      kicker: t.brandKicker,
      title: t.brandTitle,
      subtitle: t.brandSub,
      prompt: t.brandPrompt,
      footer: t.brandFooter,
      mascotSvg: MASCOT,
      footerRight
    }), path.join(OUT, `brand${lang === 'de' ? '-de' : ''}.png`));

    await render(cardHtml({
      kicker: t.roomKicker,
      title: t.roomTitle,
      subtitle: t.roomSub,
      prompt: t.roomPrompt,
      footer: t.roomFooter,
      mascotSvg: MASCOT,
      footerRight
    }), path.join(OUT, `wombat-room${lang === 'de' ? '-de' : ''}.png`));
  }

  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
