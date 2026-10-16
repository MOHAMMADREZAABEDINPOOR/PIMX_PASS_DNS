import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
const origin = process.env.PIMX_PREVIEW_URL || "http://127.0.0.1:3001";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const folder = ".impeccable/review/refresh";
await mkdir(folder, { recursive: true });
const configs = [
  {
    name: "home-desktop-dark",
    path: "/",
    width: 1440,
    height: 1000,
    light: false,
  },
  {
    name: "home-mobile-light",
    path: "/",
    width: 390,
    height: 844,
    light: true,
  },
  {
    name: "test-desktop-light",
    path: "/en/test/",
    width: 1440,
    height: 1000,
    light: true,
    menu: true,
  },
  {
    name: "test-300-dark",
    path: "/test/",
    width: 300,
    height: 800,
    light: false,
    menu: true,
  },
];
const metrics = [];
for (const config of configs) {
  const context = await browser.newContext({
    viewport: { width: config.width, height: config.height },
  });
  await context.addInitScript(
    (light) =>
      localStorage.setItem(
        "pimx.lab.theme",
        JSON.stringify(light ? "light" : "dark"),
      ),
    config.light,
  );
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(origin + config.path);
  await page.locator(".app-loader").waitFor({ state: "hidden" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1300);
  if (config.menu) {
    await page
      .getByRole("combobox", {
        name: config.path.startsWith("/en") ? "Test collection" : "منبع تست",
        exact: true,
      })
      .click();
    await page.waitForTimeout(240);
  }
  await page.screenshot({
    path: `${folder}/${config.name}.png`,
    fullPage: !config.menu,
  });
  metrics.push({
    name: config.name,
    errors,
    ...(await page.evaluate(() => ({
      width: innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      headings: [...document.querySelectorAll("h1,h2")].map((e) => ({
        text: e.textContent,
        clipped: e.scrollWidth > e.clientWidth + 1,
      })),
      view: document.querySelector(".lab-app")?.getAttribute("data-view"),
    }))),
  });
  await context.close();
}
for (const fa of [true, false]) {
  const context = await browser.newContext({
    viewport: { width: fa ? 390 : 1440, height: fa ? 844 : 1000 },
  });
  await context.addInitScript(
    (light) =>
      localStorage.setItem(
        "pimx.lab.theme",
        JSON.stringify(light ? "light" : "dark"),
      ),
    !fa,
  );
  await context.route("**/*.woff*", async (route) => {
    await new Promise((r) => setTimeout(r, 4000));
    try {
      await route.continue();
    } catch {}
  });
  const page = await context.newPage();
  await page.goto(origin + (fa ? "/" : "/en/"), {
    waitUntil: "domcontentloaded",
  });
  await page.locator(".app-loader").waitFor({ state: "visible" });
  const cdp = await context.newCDPSession(page);
  const shot = await cdp.send("Page.captureScreenshot", { format: "png" });
  await writeFile(
    `${folder}/loader-${fa ? "fa-dark" : "en-light"}.png`,
    Buffer.from(shot.data, "base64"),
  );
  await context.close();
}
const assetPage = await browser.newPage({
  viewport: { width: 1200, height: 630 },
});
await assetPage.goto(origin + "/social-card.svg");
await assetPage.screenshot({ path: "public/social-card.png" });
for (const size of [192, 512]) {
  await assetPage.setViewportSize({ width: size, height: size });
  await assetPage.goto(origin + "/brand-icon.svg");
  await assetPage.screenshot({
    path: `public/icon-${size}.png`,
    omitBackground: true,
  });
}
await writeFile(`${folder}/metrics.json`, JSON.stringify(metrics, null, 2));
console.log(JSON.stringify(metrics));
await browser.close();
