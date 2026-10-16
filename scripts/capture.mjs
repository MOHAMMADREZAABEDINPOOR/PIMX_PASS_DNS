import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
const origin = process.env.PIMX_PREVIEW_URL || 'http://127.0.0.1:3000';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
await mkdir('.impeccable/review', { recursive: true });
const assets = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await assets.goto(`${origin}/social-card.svg`);
await assets.screenshot({ path: 'public/social-card.png' });
for (const size of [192, 512]) {
  await assets.setViewportSize({ width: size, height: size });
  await assets.goto(`${origin}/brand-icon.svg`);
  await assets.screenshot({ path: `public/icon-${size}.png`, omitBackground: true });
}
await assets.close();
const findings = [];
for (const config of [{ name: 'desktop', width: 1440, height: 1000, path: '/' }, { name: 'mobile', width: 390, height: 844, path: '/' }, { name: 'user-300', width: 300, height: 800, path: '/' }, { name: 'english-light', width: 1440, height: 1000, path: '/en/', light: true }]) {
  const page = await browser.newPage({ viewport: { width: config.width, height: config.height }, deviceScaleFactor: 1 });
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto(origin + config.path);
  await page.evaluate(async () => { await document.fonts.ready; });
  if (config.light) await page.getByRole('button', { name: 'Light theme', exact: true }).click();
  await page.waitForTimeout(1700);
  await page.screenshot({ path: `.impeccable/review/${config.name}.png`, fullPage: true });
  const metrics = await page.evaluate(() => ({ width: innerWidth, scrollWidth: document.documentElement.scrollWidth, headings: [...document.querySelectorAll('h1,h2')].map(e => ({ text: e.textContent, font: getComputedStyle(e).fontSize, width: e.clientWidth, scroll: e.scrollWidth })) }));
  findings.push({ name: config.name, errors, ...metrics });
  await page.close();
}
console.log(JSON.stringify(findings, null, 2));
await browser.close();
