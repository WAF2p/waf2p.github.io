#!/usr/bin/env node
/**
 * Playwright smoke test for the built site.
 *
 *   bundle exec jekyll build
 *   python3 -m http.server 4000 -d _site
 *   node tests/site-smoke.mjs
 *
 * Set BASE_URL to point at a different server.
 * On macOS the system Chrome is used when available; in CI the bundled
 * Chromium is used.
 */
import { existsSync } from 'node:fs'
import process from 'node:process'
import { chromium } from 'playwright'
import { AxeBuilder } from '@axe-core/playwright'

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:4000'
const MAC_CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const executablePath = process.env.PLAYWRIGHT_EXECUTABLE_PATH ||
  (existsSync(MAC_CHROME) ? MAC_CHROME : undefined)

const results = []
const errors = []

function check(name, ok, detail = '') {
  results.push({ name, ok: Boolean(ok), detail })
}

async function main() {
  const browser = await chromium.launch(
    executablePath ? { executablePath, headless: true } : { headless: true }
  )
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    permissions: ['clipboard-read', 'clipboard-write'],
  })
  const page = await context.newPage()
  page.on('pageerror', (error) => errors.push(error.message))

  const routes = [
    '/',
    '/cloud/',
    '/cloud/coverage/',
    '/cloud/methodology/',
    '/cloud/map/',
    '/cloud/aws/',
    '/de/cloud/',
    '/de/cloud/aws/',
    '/de/cloud/coverage/',
    '/de/cloud/methodology/',
    '/de/cloud/map/',
    '/de/compliance/',
    '/de/compliance/nis2/',
    '/de/sovereignty/',
    '/de/trust/',
    '/staff_members/artem/',
    '/staff_members/sascha/',
    '/.well-known/security.txt',
  ]

  for (const route of routes) {
    const response = await page.goto(BASE_URL + route)
    check(`${route} 200`, response && response.status() === 200, response ? String(response.status()) : 'no response')
  }

  await page.goto(BASE_URL + '/cloud/')
  check('cloud index has 25 provider cards', (await page.locator('.hub-card').count()) === 25, String(await page.locator('.hub-card').count()))

  await page.goto(BASE_URL + '/cloud/coverage/')
  check('coverage table has 25 rows', (await page.locator('.hub-table tbody tr:not(.hub-table__group)').count()) === 25)
  check('coverage table has 25 report links', (await page.locator('.hub-table a[href^="mailto:"]').count()) === 25)

  await page.goto(BASE_URL + '/cloud/aws/')
  check('AWS map renders', (await page.locator('.hub-map img').count()) === 1)
  check('AWS quickstart renders', (await page.locator('h2:has-text("quickstart")').count()) === 1)
  check('AWS control breakdown renders', (await page.locator('h2:has-text("Control coverage by pillar")').count()) === 1)
  check('AWS disclaimer renders', (await page.locator('.hub-data-disclaimer').count()) === 1)

  await page.goto(BASE_URL + '/de/cloud/aws/')
  check('German AWS disclaimer is German', (await page.textContent('.hub-data-disclaimer')).includes('Daten und Prüfung'))
  check('German AWS map renders', (await page.locator('.hub-map img').count()) === 1)

  await page.goto(BASE_URL + '/de/cloud/')
  check('German cloud index has 25 cards', (await page.locator('.hub-card').count()) === 25)

  await page.goto(BASE_URL + '/')
  await page.evaluate(() => {
    const el = document.getElementById('cookie-consent')
    if (el) el.remove()
  })
  check('language switch is a button', (await page.locator('button.lang-switch__trigger').count()) === 1)
  await page.locator('.lang-switch__trigger').click()
  check(
    'language switch opens with aria-expanded',
    (await page.locator('.lang-switch__trigger').getAttribute('aria-expanded')) === 'true' &&
      (await page.locator('.lang-switch__menu').isVisible())
  )
  await page.keyboard.press('Escape')
  check(
    'language switch closes on Escape',
    (await page.locator('.lang-switch__trigger').getAttribute('aria-expanded')) === 'false'
  )

  await page.goto(BASE_URL + '/staff_members/artem/')
  check('member profile header renders', (await page.locator('.profile-header').count()) === 1)
  check('member profile sidebar renders', (await page.locator('.profile-sidebar').count()) === 1)
  check('member profile main renders', (await page.locator('.profile-main').count()) === 1)
  check('member in-page nav renders', (await page.locator('.profile-anchor').count()) >= 2)
  check('member activity stats render', (await page.locator('.profile-stat__value').count()) >= 1)
  check('member next event renders', (await page.locator('.profile-next').count()) === 1)
  check('member team links render', (await page.locator('.profile-team__link').count()) === 3)
  await page.evaluate(() => document.getElementById('conferences').scrollIntoView())
  await page.waitForTimeout(400)
  check(
    'member scrollspy marks active section',
    (await page.locator('.profile-anchor.is-active').getAttribute('href')) === '#conferences'
  )
  await page.evaluate(() => window.scrollTo(0, 0))

  await page.goto(BASE_URL + '/staff_members/sascha/')
  check('member article list renders', (await page.locator('.profile-article').count()) > 0)

  await page.goto(BASE_URL + '/de/')
  const footerHtml = await page.locator('footer').innerHTML()
  check('German footer links /de/cloud/', footerHtml.includes('/de/cloud/'))
  check('German footer links /de/compliance/', footerHtml.includes('/de/compliance/'))
  check('German footer links /de/trust/', footerHtml.includes('/de/trust/'))
  check('German footer links /docs/', footerHtml.includes('/docs/'))

  await page.goto(BASE_URL + '/.well-known/security.txt')
  const securityText = await page.textContent('body')
  check('security.txt contact', securityText.includes('Contact: mailto:page@wombat-gov.dev'))
  check('security.txt policy', securityText.includes('Policy: https://www.wombat-gov.dev/trust/'))

  // Accessibility: axe-core on the new hub pages. Disable the reveal animation
  // so opacity does not distort the contrast calculation.
  const axeRoutes = [
    '/cloud/',
    '/cloud/aws/',
    '/cloud/coverage/',
    '/de/cloud/',
    '/de/compliance/',
    '/de/trust/',
    '/staff_members/artem/',
    '/wombat/',
    '/roles/',
    '/de/rfc/',
    '/governance/cloud/open_source/2026/04/13/exit-is-not-freedom/',
  ]
  for (const route of axeRoutes) {
    await page.goto(BASE_URL + route)
    await page.evaluate(() => {
      const el = document.getElementById('cookie-consent')
      if (el) el.remove()
    })
    await page.addStyleTag({
      content: '.dl-rise{opacity:1 !important;transform:none !important;transition:none !important;}',
    })
    const axe = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()
    check(
      `axe ${route}`,
      axe.violations.length === 0,
      axe.violations.map((violation) => violation.id).join(', ')
    )
  }

  // Mobile: no horizontal page overflow on the main hub routes.
  await page.setViewportSize({ width: 390, height: 844 })
  for (const route of [
    '/cloud/',
    '/cloud/aws/',
    '/cloud/coverage/',
    '/de/cloud/',
    '/de/compliance/',
    '/de/trust/',
    '/cloud/map/',
    '/staff_members/artem/',
  ]) {
    await page.goto(BASE_URL + route)
    await page.evaluate(() => {
      const el = document.getElementById('cookie-consent')
      if (el) el.remove()
    })
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth
    )
    check(`mobile ${route} no horizontal overflow`, overflow <= 1, String(overflow))
  }

  check('no page errors', errors.length === 0, errors.join(' | '))

  const failed = results.filter((result) => !result.ok)
  for (const result of results) {
    console.log(`${result.ok ? 'ok  ' : 'FAIL'} ${result.name}${result.detail ? ` (${result.detail})` : ''}`)
  }
  await browser.close()

  if (failed.length) {
    console.error(`\n${failed.length} smoke check(s) failed.`)
    process.exit(1)
  }
  console.log(`\nSmoke test passed: ${results.length}/${results.length}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
