import { chromium } from 'playwright';

const URL = 'http://127.0.0.1:4000';

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });

async function capture(path, name) {
  const page = await context.newPage();
  await page.goto(`${URL}${path}`);
  await page.waitForTimeout(1500);

  const dialog = page.locator('.cookie-consent');
  if (await dialog.count() > 0 && await dialog.isVisible()) {
    const acceptBtn = page.locator('button[data-cookie-accept]');
    if (await acceptBtn.count() > 0) {
      await acceptBtn.evaluate(el => el.click());
      await page.waitForTimeout(300);
    }
  }

  for (let i = 0; i < 14; i++) {
    await page.evaluate(y => window.scrollBy(0, y), 700);
    await page.waitForTimeout(100);
  }
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(300);

  await page.screenshot({ path: name, fullPage: true });
  await page.close();
}

await capture('/controls/index.html', 'tmp-port4000-controls.png');
await capture('/comparison/index.html', 'tmp-port4000-comparison.png');
await capture('/why-not/index.html', 'tmp-port4000-why-not.png');

await browser.close();
console.log('done');
