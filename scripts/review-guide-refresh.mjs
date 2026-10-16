import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
const folder = ".impeccable/review/guide-refresh";
await mkdir(folder, { recursive: true });
const browser = await chromium.launch({ channel: "chrome" });
const metrics = [];
for (const c of [
  { name: "guide-fa-light", path: "/guide/", width: 1440, light: true },
  { name: "guide-en-dark-300", path: "/en/guide/", width: 300, light: false },
  { name: "home-fa-light", path: "/", width: 1440, light: true },
  { name: "home-en-dark-300", path: "/en/", width: 300, light: false },
  { name: "filters-fa-light", path: "/test/", width: 390, light: true },
]) {
  const context = await browser.newContext({
    viewport: { width: c.width, height: 1000 },
  });
  await context.addInitScript(
    (light) =>
      localStorage.setItem(
        "pimx.lab.theme",
        JSON.stringify(light ? "light" : "dark"),
      ),
    c.light,
  );
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("http://127.0.0.1:3001" + c.path);
  await page.locator(".app-loader").waitFor({ state: "hidden" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1400);
  if (c.name.startsWith("guide")) {
    await page.screenshot({
      path: `${folder}/${c.name}-full.png`,
      fullPage: true,
      animations: "disabled",
    });
    await page
      .getByRole("combobox", {
        name: c.path.startsWith("/en") ? "Choose resolver" : "انتخاب DNS",
        exact: true,
      })
      .click();
    await page.waitForTimeout(230);
    await page.screenshot({
      path: `${folder}/${c.name}-menu.png`,
      animations: "disabled",
    });
  } else if (c.name.startsWith("home")) {
    for (const selector of [".home-signal", ".home-purpose"]) {
      await page.locator(selector).scrollIntoViewIfNeeded();
      if (selector === ".home-signal")
        await page
          .locator(selector)
          .getByRole("button", {
            name: c.path.startsWith("/en")
              ? /To the DNS resolver/
              : /تا سرور DNS/,
          })
          .click();
      if (selector === ".home-purpose")
        await page
          .locator(selector)
          .getByRole("button", {
            name: c.path.startsWith("/en") ? "Gaming" : "بازی",
            exact: true,
          })
          .click();
      await page.waitForTimeout(1100);
      await page
        .locator(selector)
        .screenshot({
          path: `${folder}/${c.name}-${selector.slice(6)}.png`,
          animations: "disabled",
        });
    }
  } else {
    await page.getByRole("combobox", { name: "پروتکل", exact: true }).click();
    await page.waitForTimeout(230);
    await page.screenshot({
      path: `${folder}/${c.name}-menu.png`,
      animations: "disabled",
    });
  }
  metrics.push({
    name: c.name,
    errors,
    ...(await page.evaluate(() => ({
      width: innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      theme: document.documentElement.dataset.theme,
      clipped: [...document.querySelectorAll("h1,h2,h3")]
        .filter((e) => e.scrollWidth > e.clientWidth + 2)
        .map((e) => e.textContent),
    }))),
  });
  await context.close();
}
await writeFile(`${folder}/metrics.json`, JSON.stringify(metrics, null, 2));
console.log(metrics);
await browser.close();
