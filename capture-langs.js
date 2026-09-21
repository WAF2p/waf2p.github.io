const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const langs = ['','de','fr','nl','es','it','pl','pt'];
  for (const lang of langs) {
    const page = await context.newPage();
    const url = lang ? `http://localhost:8080/${lang}/` : 'http://localhost:8080/';
    await page.goto(url);
    await page.waitForTimeout(800);
    await page.evaluate(() => {
      localStorage.setItem('agentic-launch-modal-dismissed', '1');
    });
    await page.reload();
    await page.waitForTimeout(800);
    await page.click('#lang-switch-check');
    await page.waitForTimeout(400);
    await page.screenshot({ path: `/tmp/navbar-lang-${lang || 'en'}.png` });
    await page.close();
  }
  await browser.close();
})();
