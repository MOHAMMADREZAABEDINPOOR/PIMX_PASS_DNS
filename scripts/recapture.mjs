import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
const origin = process.env.PIMX_PREVIEW_URL || 'http://127.0.0.1:3000';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
await mkdir('.impeccable/review', { recursive: true });
const findings = [];
for (const config of [{ name: 'desktop', width: 1440, height: 1000, path: '/' }, { name: 'mobile', width: 390, height: 844, path: '/' }, { name: 'user-300', width: 300, height: 800, path: '/' }, { name: 'english-light', width: 1440, height: 1000, path: '/en/', light: true }]) {
  const page = await browser.newPage({ viewport: { width: config.width, height: config.height }, deviceScaleFactor: 1 });
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto(origin + config.path);
  await page.evaluate(async () => { await document.fonts.ready; });
  if (config.light) await page.getByRole('button', { name: 'Light theme', exact: true }).click();
  await page.waitForTimeout(1600);
  await page.screenshot({ path: `.impeccable/review/${config.name}.png`, fullPage: true });
  const metrics = await page.evaluate(() => ({ width: innerWidth, scrollWidth: document.documentElement.scrollWidth, navigation: [...document.querySelectorAll('.workspace-tabs button')].map(e => ({ text: e.textContent, visible: e.getBoundingClientRect().left >= 0 && e.getBoundingClientRect().right <= innerWidth })), headings: [...document.querySelectorAll('h1,h2')].map(e => ({ text: e.textContent, width: e.clientWidth, scrollWidth: e.scrollWidth })) }));
  findings.push({ name: config.name, errors, ...metrics });
  await page.close();
}
await writeFile('.impeccable/review/metrics.json', JSON.stringify(findings, null, 2));
console.log(JSON.stringify(findings.map(f => ({ viewport: f.name, errors: f.errors, overflow: f.scrollWidth - f.width, hiddenDestinations: f.navigation.filter(n => !n.visible).length }))));
await browser.close();
