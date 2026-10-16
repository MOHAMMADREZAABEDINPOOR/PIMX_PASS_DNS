import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { makeQuery } from "../services/pingService";
import { catalog, validateEndpoint } from "../services/catalog";
import { rankResults } from "../services/storage";
import { collectHealth } from "../cloudflare/monitor";
import type { DnsResult } from "../types";

async function openPage(page: Page, path: string) {
  await page.goto(path);
  await page.locator(".app-loader").waitFor({ state: "hidden" });
}

const response = Buffer.from([
  0, 0, 0x81, 0x80, 0, 1, 0, 1, 0, 0, 0, 0, 7, 101, 120, 97, 109, 112, 108, 101,
  3, 99, 111, 109, 0, 0, 1, 0, 1, 0xc0, 12, 0, 1, 0, 1, 0, 0, 0, 60, 0, 4, 93,
  184, 216, 34,
]);
async function mockDns(page: Page, delay = 10) {
  await page.route("https://**/*", async (route) => {
    if (route.request().url().includes("dns=")) {
      await new Promise((r) => setTimeout(r, delay));
      try {
        await route.fulfill({
          status: 200,
          headers: {
            "content-type": "application/dns-message",
            "access-control-allow-origin": "*",
          },
          body: response,
        });
      } catch {
        /* aborted scan */
      }
    } else await route.abort();
  });
}
test("wire-format query and endpoint validation reject invalid input", () => {
  expect(Array.from(makeQuery())).toEqual([
    0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 7, 101, 120, 97, 109, 112, 108, 101, 3,
    99, 111, 109, 0, 0, 1, 0, 1,
  ]);
  expect(() => makeQuery("bad..domain")).toThrow();
  for (const value of [
    "1.1.1.1",
    "2001:4860:4860::8888",
    "https://dns.google/dns-query",
    "tls://dns.quad9.net",
    "sdns://AQIDBA",
  ])
    expect(validateEndpoint(value)).toBe(true);
  for (const value of [
    "999.1.1.1",
    "javascript:alert(1)",
    "https://user:password@example.com/query",
    "example..com",
    "https://",
  ])
    expect(validateEndpoint(value)).toBe(false);
});
test("ranking never recommends reachability over a valid DNS response", () => {
  const make = (
    index: number,
    latency: number,
    method: DnsResult["method"],
    status: DnsResult["status"],
  ): DnsResult => ({
    ...catalog[index],
    latency,
    method,
    status,
    jitter: 1,
    rawPings: [latency],
    successRate: 100,
  });
  expect(
    rankResults(
      [
        make(0, 5, "https", "success"),
        make(1, 80, "doh", "success"),
        make(2, 1, "doh", "failed"),
      ],
      "daily",
    ).map((r) => r.name),
  ).toEqual(["Google Public DNS", "Cloudflare", "Quad9"]);
});

test("the delayed full catalog reaches scan pools and collection lists", async ({
  page,
}) => {
  await openPage(page, "/en/test/");
  await expect(page.locator(".scan-count")).toContainText("12 resolvers ready");
  await page.getByRole("button", { name: "Resolvers", exact: true }).click();
  await expect(page.locator(".resolver-row")).toHaveCount(20);
});
test("edge monitor retains real history and records invalid responses as failures", async () => {
  let stored: any = null;
  const env = {
    MONITOR_KV: {
      get: async () => stored,
      put: async (_key: string, value: string) => {
        stored = JSON.parse(value);
      },
    },
  };
  const first = await collectHealth(
    env,
    async () => new Response(response, { status: 200 }),
    1000,
  );
  expect(first.services.every((s) => s.history[0].ok)).toBe(true);
  const second = await collectHealth(
    env,
    async () => new Response("not DNS", { status: 200 }),
    2000,
  );
  expect(
    second.services.every(
      (s) =>
        s.history.length === 2 &&
        !s.history[1].ok &&
        s.history[1].latency === null,
    ),
  ).toBe(true);
});

test("scan, compare, exports, history, custom import and setup work together", async ({
  page,
}) => {
  await mockDns(page);
  await openPage(page, "/en/test/");
  await page.getByLabel("Resolver limit").fill("3");
  await page.getByRole("button", { name: "Test my connection" }).click();
  await expect(page.getByText("This scan’s pick")).toBeVisible();
  await expect(page.locator(".resolver-row")).toHaveCount(3);
  await page
    .getByRole("checkbox", { name: /^Compare / })
    .nth(0)
    .check();
  await page
    .getByRole("checkbox", { name: /^Compare / })
    .nth(1)
    .check();
  await page.getByRole("button", { name: "Compare side by side" }).click();
  await expect(page.locator("dialog .comparison-grid article")).toHaveCount(2);
  await page.getByRole("button", { name: "Close / بستن" }).click();
  await page.getByRole("button", { name: "Export results" }).click();
  const downloading = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "JSON Complete data and samples" })
    .click();
  const report = await downloading;
  expect(report.suggestedFilename()).toBe("pimx-results.json");
  await expect(page.locator(".qr-panel img")).toBeVisible();
  await page.getByRole("button", { name: "Close / بستن" }).click();
  await page
    .getByRole("button", { name: "History", exact: false })
    .first()
    .click();
  await expect(page.locator(".history-list article")).toHaveCount(1);
  await page.reload();
  await page
    .getByRole("button", { name: /History/ })
    .first()
    .click();
  await expect(page.locator(".history-list article")).toHaveCount(1);
  await page.getByRole("button", { name: "Resolvers", exact: true }).click();
  await page.getByRole("button", { name: "Add resolver", exact: true }).click();
  await page
    .locator("dialog")
    .getByLabel("Name (optional)")
    .fill("My resolver");
  await page
    .locator("dialog")
    .getByLabel("Address or address list")
    .fill(
      "https://test.example/dns-query\n999.9.9.9\nhttps://test.example/dns-query",
    );
  await page
    .locator("dialog")
    .getByRole("button", { name: "Add to collection" })
    .click();
  await expect(page.locator("dialog .custom-list")).toContainText(
    "My resolver",
  );
  await expect(page.locator("dialog .form-error")).toContainText(
    "1 added; 1 duplicate and 1 invalid",
  );
  await page.getByRole("button", { name: "Close / بستن" }).click();
  await page.getByRole("button", { name: "Setup guides", exact: true }).click();
  await page.getByRole("button", { name: "Android", exact: true }).click();
  await expect(page.locator(".guide-content")).toContainText("one.one.one.one");
  await page.getByRole("button", { name: "Windows", exact: true }).click();
  await expect(page.locator(".setup-steps")).toContainText("Automatic (DHCP)");
});
test("cancel aborts active work and does not fabricate results", async ({
  page,
}) => {
  await mockDns(page, 1200);
  await openPage(page, "/en/test/");
  await page.getByRole("button", { name: "Test my connection" }).click();
  await page.getByRole("button", { name: "Stop scan" }).click();
  await expect(
    page.getByRole("heading", { name: "Stopped right here." }),
  ).toBeVisible();
  await expect(page.locator(".recommendation")).toHaveCount(0);
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("pimx.lab.history") || "[]").length,
    ),
  ).toBe(0);
});

test("named collections preserve favorites and can be selected for scanning", async ({
  page,
}) => {
  await mockDns(page);
  await openPage(page, "/en/test/");
  await page.getByRole("button", { name: "Resolvers", exact: true }).click();
  await page
    .getByRole("button", { name: "Favorite: Cloudflare", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Favorite: Google Public DNS", exact: true })
    .click();
  await page.getByLabel("Collection name").fill("Mobile setup");
  await page
    .getByRole("button", { name: "Save 2 favorites", exact: true })
    .click();
  await expect(page.locator(".saved-collections")).toContainText(
    "Mobile setup",
  );
  await page.getByRole("button", { name: "Use for scan", exact: true }).click();
  await expect(
    page.getByRole("combobox", { name: "Test collection", exact: true }),
  ).toContainText("Mobile setup");
  await expect(page.locator(".scan-count")).toContainText("2 resolvers ready");
  await page
    .getByRole("button", { name: "Test my connection", exact: true })
    .click();
  await expect(page.locator(".recommendation")).toBeVisible();
  await expect(page.locator(".resolver-row")).toHaveCount(2);
});

test("dark Persian UI and setup dialog meet accessibility checks at 300 pixels", async ({
  page,
}) => {
  await mockDns(page);
  await page.setViewportSize({ width: 300, height: 800 });
  await openPage(page, "/test/");
  let audit = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(audit.violations.map((v) => v.id)).toEqual([]);
  await page
    .getByRole("button", { name: "راهنمای تنظیم", exact: true })
    .click();
  await page.getByRole("button", { name: "Windows", exact: true }).click();
  await expect(page.locator(".guide-content")).toContainText("1.1.1.1");
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    300,
  );
  audit = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(audit.violations.map((v) => v.id)).toEqual([]);
});

test("completed scan checkboxes have accessible names on a 300px screen", async ({
  page,
}) => {
  await mockDns(page);
  await page.setViewportSize({ width: 300, height: 800 });
  await openPage(page, "/en/test/");
  await page.getByLabel("Resolver limit").fill("2");
  await page
    .getByRole("button", { name: "Test my connection", exact: true })
    .click();
  await expect(page.locator(".recommendation")).toBeVisible();
  await expect(
    page.getByRole("checkbox", { name: "Compare Cloudflare", exact: true }),
  ).toBeVisible();
  const audit = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(
    audit.violations.map(
      (v) => `${v.id}: ${v.nodes.map((n) => n.target).join(",")}`,
    ),
  ).toEqual([]);
});
test("domain queries and unavailable or stale monitoring have honest states", async ({
  page,
}) => {
  await mockDns(page);
  await page.route("**/api/status", (r) =>
    r.fulfill({
      status: 503,
      contentType: "application/json",
      body: '{"error":"monitor_unconfigured"}',
    }),
  );
  await openPage(page, "/en/test/");
  await page.getByRole("button", { name: "Domain lab", exact: true }).click();
  await page.getByLabel("Domain", { exact: true }).fill("example.com");
  await page.getByRole("button", { name: "Query domain" }).click();
  await expect(page.locator(".domain-answers article")).toHaveCount(4);
  await expect(page.locator(".domain-answers article").first()).toContainText(
    "1 answer records",
  );
  await page
    .getByRole("button", { name: "Service health", exact: true })
    .first()
    .click();
  await expect(page.getByText("Monitoring data is unavailable.")).toBeVisible();
  await page.route("**/api/status", (r) =>
    r.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        generatedAt: Date.now() - 3600000,
        services: [
          { name: "Fixture", history: [{ t: 1000, ok: true, latency: 12 }] },
        ],
      }),
    }),
  );
  await page.getByRole("button", { name: "Refresh", exact: true }).click();
  await expect(
    page.getByText(
      "These checks are stale and do not establish current service health.",
    ),
  ).toBeVisible();
});
test("locales, keyboard dialog, light theme and reduced motion are accessible", async ({
  page,
}) => {
  await openPage(page, "/test/");
  await page.locator(".app-loader").waitFor({ state: "hidden" });
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await page.keyboard.press("Control+k");
  await expect(page.locator("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator("dialog")).toHaveCount(0);
  await page.getByRole("button", { name: "Switch to English" }).click();
  await expect(page).toHaveURL(/\/en\//);
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  await page.getByRole("button", { name: "Light theme", exact: true }).click();
  await page.getByRole("button", { name: "Motion on", exact: true }).click();
  await expect(page.locator(".lab-app")).toHaveClass(/reduced-motion/);
  const audit = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(
    audit.violations.map(
      (v) => `${v.id}: ${v.nodes.map((n) => n.target).join(",")}`,
    ),
  ).toEqual([]);
});
test("responsive layout has no page overflow at 300 through 2560 pixels in both languages", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const locale of [
    "/",
    "/en/",
    "/test/",
    "/en/test/",
    "/guide/",
    "/en/guide/",
  ]) {
    await openPage(page, locale);
    for (const width of [300, 320, 390, 540, 768, 1024, 1440, 1920, 2560]) {
      await page.setViewportSize({ width, height: 950 });
      const metrics = await page.evaluate(() => ({
        page: document.documentElement.scrollWidth,
        viewport: innerWidth,
        clipped: Array.from(document.querySelectorAll("h1,h2"))
          .filter((e) => e.scrollWidth > e.clientWidth + 2)
          .map((e) => e.textContent),
      }));
      expect(metrics.page, `${locale} at ${width}px`).toBeLessThanOrEqual(
        width,
      );
      expect(metrics.clipped, `${locale} at ${width}px`).toEqual([]);
    }
  }
});
test("production app shell, fonts and local history work offline", async ({
  page,
  context,
}) => {
  await openPage(page, "/en/test/");
  await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.ready;
    if (!registration.active) throw new Error("No active service worker");
  });
  await page.reload();
  await page
    .getByRole("button", { name: "History", exact: false })
    .first()
    .click();
  await context.setOffline(true);
  await page.reload();
  await expect(
    page.getByText(
      "You’re offline. History and guides are available; scanning needs a connection.",
    ),
  ).toBeVisible();
  await page.getByRole("button", { name: "Setup guides", exact: true }).click();
  await expect(page.locator(".guide-content")).toContainText("one.one.one.one");
  await context.setOffline(false);
});

test("home explains the product and opens a separate test page with working back navigation", async ({
  page,
}) => {
  await openPage(page, "/en/");
  await page.locator(".app-loader").waitFor({ state: "hidden" });
  await expect(page.locator(".home-hero")).toBeVisible();
  await expect(page.locator(".scan-config")).toHaveCount(0);
  await page.getByRole("link", { name: "Start DNS test", exact: true }).click();
  await expect(page).toHaveURL(/\/en\/test\/$/);
  await expect(page.locator(".scan-config")).toBeVisible();
  await expect(page.locator("h1")).toBeFocused();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://pimxpassdns.pages.dev/en/test/",
  );
  await expect(page.locator('link[hreflang="fa"]')).toHaveAttribute(
    "href",
    "https://pimxpassdns.pages.dev/test/",
  );
  await page.getByLabel("Network name").fill("Home route test");
  await page
    .getByRole("button", { name: "تغییر زبان به فارسی", exact: true })
    .click();
  await expect(page).toHaveURL(/\/test\/$/);
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await page
    .getByRole("button", { name: "برگشت به خانه", exact: true })
    .click();
  await expect(page).toHaveURL(/4173\/$/);
  await expect(page.locator(".home-hero")).toBeVisible();
  await expect(page.locator("h1")).toBeFocused();
  await expect(page.locator('link[hreflang="en"]')).toHaveAttribute(
    "href",
    "https://pimxpassdns.pages.dev/en/",
  );
  await page.goBack();
  await expect(page).toHaveURL(/\/test\/$/);
  await expect(page.getByLabel("نام شبکه", { exact: true })).toHaveValue(
    "Home route test",
  );
  await expect(page.locator("h1")).toBeFocused();
});

test("test-source listbox supports keyboard, selection and escape without scrolling the page", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openPage(page, "/en/test/");
  const trigger = page.getByRole("combobox", {
    name: "Test collection",
    exact: true,
  });
  await trigger.scrollIntoViewIfNeeded();
  const initial = await page.evaluate(() => scrollY);
  await trigger.click();
  await expect(
    page.getByRole("listbox", { name: "Test collection", exact: true }),
  ).toBeVisible();
  expect(Math.abs((await page.evaluate(() => scrollY)) - initial)).toBeLessThan(
    2,
  );
  await trigger.press("ArrowDown");
  await trigger.press("Enter");
  await expect(trigger).toContainText("Favorites");
  await expect(page.getByRole("listbox")).toHaveCount(0);
  await trigger.press("ArrowDown");
  await trigger.press("End");
  await trigger.press("Enter");
  await expect(trigger).toContainText("All sources");
  await trigger.click();
  await trigger.press("Escape");
  await expect(page.getByRole("listbox")).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test("home FAQ discloses answers and meets accessibility checks in each theme", async ({
  page,
}) => {
  await page.setViewportSize({ width: 300, height: 800 });
  await openPage(page, "/en/");
  await page.locator(".app-loader").waitFor({ state: "hidden" });
  const first = page.getByRole("button", {
    name: "Does this site change my device DNS?",
    exact: true,
  });
  const privacy = page.getByRole("button", {
    name: "Where are my results stored?",
    exact: true,
  });
  await expect(first).toHaveAttribute("aria-expanded", "true");
  await privacy.click();
  await expect(privacy).toHaveAttribute("aria-expanded", "true");
  await expect(first).toHaveAttribute("aria-expanded", "false");
  for (const theme of ["dark", "light"]) {
    if (theme === "light")
      await page
        .getByRole("button", { name: "Light theme", exact: true })
        .click();
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(
      result.violations.map(
        (v) => `${v.id}: ${v.nodes.map((n) => n.target).join(",")}`,
      ),
    ).toEqual([]);
  }
});

test("loading screen follows theme and language while actual font requests are pending", async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem("pimx.lab.theme", '"light"'),
  );
  await page.route("**/*.woff*", async (route) => {
    await new Promise((r) => setTimeout(r, 2000));
    try {
      await route.continue();
    } catch {}
  });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator(".app-loader")).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.locator(".app-loader")).toContainText(
    "داریم ابزارها را آماده می‌کنیم.",
  );
  await page
    .locator(".app-loader")
    .getByRole("button", { name: "Switch to English" })
    .click();
  await expect(page.locator(".app-loader")).toContainText(
    "Getting your tools ready.",
  );
  await page.locator(".app-loader").waitFor({ state: "hidden" });
  await expect(page.locator(".home-hero")).toBeVisible();
});

test("home journey explains its stops and purpose carries into the actual scanner", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openPage(page, "/en/");
  const journey = page.locator(".home-signal");
  await journey.getByRole("button", { name: /To the DNS resolver/ }).click();
  await expect(journey.locator("animateMotion")).toHaveCount(0);
  await expect(journey.locator(".signal-detail")).toContainText(
    "either in its cache",
  );
  await journey.getByRole("button", { name: /Then, the website/ }).click();
  await expect(journey.locator(".signal-detail")).toContainText(
    "full page loading",
  );
  const purpose = page.locator(".home-purpose");
  await purpose.getByRole("button", { name: "Gaming", exact: true }).click();
  await expect(purpose).toContainText(
    "does not guarantee lower in-game latency",
  );
  await purpose.getByRole("link", { name: "Test with this priority" }).click();
  await expect(page).toHaveURL(/\/en\/test\/$/);
  await expect(
    page
      .locator(".purpose-options")
      .getByRole("button", { name: "Gaming", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
});

test("home tool explorer opens actual guides and history, with a separate footer", async ({
  page,
}) => {
  await openPage(page, "/en/");
  const toolkit = page.locator(".home-toolkit");
  await toolkit
    .getByRole("button", { name: "Device setup", exact: true })
    .click();
  await toolkit.getByRole("link", { name: "Explore device guides" }).click();
  await expect(page).toHaveURL(/\/en\/guide\/$/);
  await expect(page.locator(".guide-content")).toBeVisible();
  await page.getByRole("link", { name: "Home", exact: true }).click();
  await toolkit.getByRole("button", { name: "History", exact: true }).click();
  await toolkit.getByRole("link", { name: "Open your history" }).click();
  await expect(
    page.getByRole("heading", { name: "Your first scan starts the story." }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Home", exact: true }).click();
  await expect(page.locator(".home-final")).toBeVisible();
  const gap = await page.evaluate(
    () =>
      document.querySelector(".site-footer")!.getBoundingClientRect().top -
      document.querySelector(".home-final")!.getBoundingClientRect().bottom,
  );
  expect(gap).toBeGreaterThanOrEqual(64);
  await expect(page.locator(".home-companions")).toHaveCount(0);
});

test("standalone guides search the full catalog and preserve their route across language and back", async ({
  page,
}) => {
  await openPage(page, "/en/guide/");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://pimxpassdns.pages.dev/en/guide/",
  );
  await expect(page.locator(".scan-config")).toHaveCount(0);
  await page
    .getByRole("combobox", { name: "Choose resolver", exact: true })
    .click();
  await expect(page.locator(".source-count")).toContainText("1441");
  const search = page.getByRole("searchbox", {
    name: "Search Choose resolver",
    exact: true,
  });
  await search.fill("8.8.8.8");
  await expect(
    page.getByRole("option", { name: /Google Public DNS/ }),
  ).toBeVisible();
  await search.press("Enter");
  await expect(page.locator(".guide-content")).toContainText("dns.google");
  await page.getByRole("button", { name: "Windows", exact: true }).click();
  await expect(page.locator(".guide-content")).toContainText("8.8.8.8");
  await page
    .getByRole("button", { name: "تغییر زبان به فارسی", exact: true })
    .click();
  await expect(page).toHaveURL(/\/guide\/$/);
  await expect(
    page.getByRole("combobox", { name: "انتخاب DNS", exact: true }),
  ).toContainText("Google Public DNS");
  await page
    .getByRole("link", { name: "برگشت به تست DNS", exact: true })
    .click();
  await expect(page).toHaveURL(/\/test\/$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/guide\/$/);
  await expect(page.locator("h1")).toBeFocused();
});

test("styled menus work inside export dialogs and filters change resolver lists", async ({
  page,
}) => {
  await mockDns(page);
  await openPage(page, "/en/test/");
  await page.getByRole("button", { name: "Resolvers", exact: true }).click();
  const protocol = page.getByRole("combobox", {
    name: "Protocol",
    exact: true,
  });
  await protocol.click();
  await page.getByRole("option", { name: "DNSCRYPT", exact: true }).click();
  await expect(page.locator(".resolver-row").first()).toContainText("DNSCrypt");
  await page.getByRole("button", { name: "Scan", exact: true }).click();
  await page.getByLabel("Resolver limit").fill("2");
  await page
    .getByRole("button", { name: "Test my connection", exact: true })
    .click();
  await expect(page.locator(".recommendation")).toBeVisible();
  await page
    .getByRole("button", { name: "Export results", exact: true })
    .click();
  await page
    .getByRole("combobox", { name: "Resolver address QR", exact: true })
    .click();
  await page.getByRole("option", { name: /Google Public DNS/ }).click();
  await expect(
    page.getByRole("combobox", { name: "Resolver address QR", exact: true }),
  ).toContainText("Google Public DNS");
  await expect(page.locator("dialog .qr-panel img")).toBeVisible();
});

test("guide menu is accessible at 300 pixels and six-route offline navigation keeps the guide page", async ({
  page,
  context,
}) => {
  await page.setViewportSize({ width: 300, height: 850 });
  await openPage(page, "/en/guide/");
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await page.locator(".app-loader").waitFor({ state: "hidden" });
  await page
    .getByRole("combobox", { name: "Choose resolver", exact: true })
    .click();
  const audit = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(
    audit.violations.map(
      (v) => `${v.id}: ${v.nodes.map((n) => n.target).join(",")}`,
    ),
  ).toEqual([]);
  await page.getByRole("searchbox").press("Escape");
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator(".guide-page")).toBeVisible();
  await expect(page.locator(".guide-content")).toBeVisible();
  await context.setOffline(false);
});
