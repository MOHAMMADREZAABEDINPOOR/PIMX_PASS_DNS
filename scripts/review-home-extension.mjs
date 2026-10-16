import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
const browser = await chromium.launch({ channel: "chrome" });
const folder = ".impeccable/review/home-extension";
await mkdir(folder, { recursive: true });
const metrics = [];
for (const config of [
  { name: "desktop-fa-light", path: "/", width: 1440, light: true },
  { name: "mobile-fa-dark", path: "/", width: 390, light: false },
  { name: "small-en-light", path: "/en/", width: 300, light: true },
  { name: "desktop-en-dark", path: "/en/", width: 1440, light: false },
]) {
  const context = await browser.newContext({
    viewport: { width: config.width, height: 950 },
  });
  await context.addInitScript(
    (light) => localStorage.setItem("pimx.lab.theme", JSON.stringify(light ? "light" : "dark")),
    config.light,
  );
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("http://127.0.0.1:3001" + config.path);
  await page.locator(".app-loader").waitFor({ state: "hidden" });
  await page.evaluate(() => document.fonts.ready);
  for (const selector of [".home-signal", ".home-purpose", ".home-toolkit"]) {
    await page.locator(selector).scrollIntoViewIfNeeded();
    await page.waitForTimeout(250);
    await page
      .locator(selector)
      .screenshot({
        path: `${folder}/${config.name}-${selector.slice(6)}.png`,
        animations: "disabled",
      });
  }
  await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  await page.screenshot({
    path: `${folder}/${config.name}-full.png`,
    fullPage: true,
    animations: "disabled",
  });
  await page.evaluate(() =>
    scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "instant",
    }),
  );
  await page.screenshot({
    path: `${folder}/${config.name}-footer.png`,
    animations: "disabled",
  });
  metrics.push({
    name: config.name,
    errors,
    ...(await page.evaluate(() => ({
      width: innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      gap:
        document.querySelector(".site-footer").getBoundingClientRect().top -
        document.querySelector(".home-final").getBoundingClientRect().bottom,
      headings: [...document.querySelectorAll("h1,h2,h3")]
        .filter((e) => e.scrollWidth > e.clientWidth + 2)
        .map((e) => e.textContent),
    }))),
  });
  await context.close();
}
await writeFile(`${folder}/metrics.json`, JSON.stringify(metrics, null, 2));
console.log(metrics);
await browser.close();
