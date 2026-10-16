import { readFile, writeFile, readdir, mkdir } from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
const dist = path.resolve("dist");
const template = await readFile(path.join(dist, "index.html"), "utf8");
const origin = "https://pimxpassdns.pages.dev";
const pages = [];
const paths = [];
for (const lang of ["fa", "en"])
  for (const view of ["home", "test", "guide"]) {
    const test = view === "test",
      guide = view === "guide";
    const fa = lang === "fa";
    const route = `${fa ? "" : "/en"}/${guide ? "guide/" : test ? "test/" : ""}`;
    const title = guide
      ? fa
        ? "راهنمای تنظیم DNS برای گوشی و کامپیوتر | PIMX PASS"
        : "DNS setup guides for your devices | PIMX PASS"
      : test
        ? fa
          ? "تست و مقایسه DNS روی اینترنت خودت | PIMX PASS"
          : "Test and compare DNS on your connection | PIMX PASS"
        : fa
          ? "DNS مناسب اینترنت خودت را پیدا کن | PIMX PASS"
          : "Find the DNS for your connection | PIMX PASS";
    const description = fa
      ? "با PIMX PASS چند DNS را روی اینترنت خودت تست کن. مقایسه پاسخ واقعی DoH، نوسان، تاریخچه و راهنمای تنظیم گوشی و کامپیوتر؛ بدون تغییر خودکار تنظیمات."
      : "Test DNS on your own connection with PIMX PASS. Compare real DoH responses, variation and saved history, then follow a device setup guide. No automatic device changes.";
    let html = template
      .replace(
        /<html[^>]*>/,
        `<html lang="${lang}" dir="${fa ? "rtl" : "ltr"}">`,
      )
      .replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`);
    for (const key of [
      'name="description"',
      'property="og:description"',
      'name="twitter:description"',
    ])
      html = html.replace(
        new RegExp(`<meta ${key} content="[^"]*"\\s*/?>`),
        `<meta ${key} content="${description}" />`,
      );
    for (const key of ['property="og:title"', 'name="twitter:title"'])
      html = html.replace(
        new RegExp(`<meta ${key} content="[^"]*"\\s*/?>`),
        `<meta ${key} content="${title}" />`,
      );
    html = html
      .replace(
        /<link rel="canonical"[^>]*>/,
        `<link rel="canonical" href="${origin + route}" />`,
      )
      .replace(
        /<meta property="og:url"[^>]*>/,
        `<meta property="og:url" content="${origin + route}" />`,
      )
      .replace(
        /<meta property="og:locale"[^>]*>/,
        `<meta property="og:locale" content="${fa ? "fa_IR" : "en_US"}" />`,
      );
    for (const alternate of ["fa", "en", "x-default"]) {
      const target = `${alternate === "en" ? "/en" : ""}/${guide ? "guide/" : test ? "test/" : ""}`;
      html = html.replace(
        new RegExp(`<link rel="alternate" hreflang="${alternate}"[^>]*>`),
        `<link rel="alternate" hreflang="${alternate}" href="${origin + target}" />`,
      );
    }
    const homePath = fa ? "/" : "/en/",
      testPath = fa ? "/test/" : "/en/test/";
    let content = fa
      ? `<main class="static-content"><nav><a href="${homePath}">PIMX PASS</a><a href="${testPath}">شروع تست DNS</a><a href="${test ? "/en/test/" : "/en/"}">English</a></nav><h1>${test ? "اتصال خودت را تست کن." : "DNS را با اینترنتت بسنج."}</h1><p>یک DNS روی اینترنت دوستت خوب جواب می‌دهد؛ روی اینترنت تو شاید نه. اینجا چند گزینه را با اتصال خودت تست می‌کنی و با دیدن نتیجه‌ها تصمیم می‌گیری.</p><h2>تست چطور کار می‌کند؟</h2><p>درخواست واقعی DoH، زمان پاسخ، نوسان و تعداد پاسخ‌های موفق را مقایسه کن. تست سریع سه نمونه و تست دقیق هفت نمونه برای هر DNS می‌گیرد.</p><h2>این سایت DNS دستگاه را عوض می‌کند؟</h2><p>نه. برای تغییر DNS، راهنمای تنظیم گوشی یا کامپیوترت را باز کن. روش برگشت به تنظیم قبلی هم داخل راهنماست.</p><h2>اطلاعات تست‌ها کجا می‌ماند؟</h2><p>تاریخچه و نام شبکه داخل مرورگر می‌مانند. گزارش خروجی شامل نام شبکه و IP شخصی نیست.</p><p>UDP، DoT، DoQ، DNSCrypt و ODoH مستقیماً از مرورگر تست نمی‌شوند.</p></main>`
      : `<main class="static-content"><nav><a href="${homePath}">PIMX PASS</a><a href="${testPath}">Start DNS test</a><a href="${test ? "/test/" : "/"}">فارسی</a></nav><h1>${test ? "Test your connection." : "Your internet. Your DNS."}</h1><p>A DNS that works well for someone else may feel different on your connection. Test a few options on your own internet, then choose with the results in front of you.</p><h2>How does the test work?</h2><p>Compare real DoH queries, response time, variation and successful requests. Quick mode takes three samples per resolver; deep mode takes seven.</p><h2>Does this site change device DNS?</h2><p>No. Follow the guide for your phone or computer to change settings and undo the change.</p><h2>Where are results stored?</h2><p>History and network labels stay in this browser. Exported reports omit personal IP and network labels.</p><p>UDP, DoT, DoQ, DNSCrypt and ODoH are not directly browser-testable.</p></main>`;
    if (guide)
      content = `<main class="static-content"><nav><a href="${homePath}">PIMX PASS</a><a href="${testPath}">${fa ? "تست DNS" : "DNS test"}</a><a href="${fa ? "/en/guide/" : "/guide/"}">${fa ? "English" : "فارسی"}</a></nav><h1>${fa ? "از انتخاب تا اتصال." : "From choice to connection."}</h1><p>${fa ? "DNS را انتخاب کن، بعد راهنمای دستگاهت را باز کن. راهنما مقدار سازگار، مراحل تنظیم و راه برگشت به حالت قبلی را توضیح می‌دهد." : "Choose a resolver, then open your device guide. Each guide explains compatible values, setup steps and how to undo the change."}</p><h2>Android / iPhone / Windows / macOS</h2><p>${fa ? "تنظیمات DNS با دستگاه و پروتکل تفاوت دارد. اندروید برای Private DNS به نام میزبان سازگار نیاز دارد؛ آدرس IPv4، URL مربوط به DoH و نام میزبان DoT را به جای هم وارد نکن." : "DNS settings depend on your device and protocol. Android Private DNS needs a compatible hostname; IPv4 addresses, DoH URLs and DoT hostnames are different settings."}</p><h2>${fa ? "تنظیم DNS در مرورگر" : "Browser DNS setup"}</h2><p>${fa ? "برای Secure DNS از URL سازگار DoH استفاده کن. تنظیم مرورگر با تنظیم کل دستگاه یکسان نیست. راهنمای تعاملی با فعال‌بودن JavaScript در دسترس است." : "Use a compatible DoH URL for Secure DNS. A browser setting differs from device-wide DNS. Enable JavaScript to use the interactive device guides."}</p></main>`;
    const homeExtension =
      test || guide
        ? ""
        : fa
          ? "<h2>پشت هر آدرس، یک رفت‌وبرگشت هست.</h2><p>در نمای تعاملی، مسیر درخواست را از دستگاه تا سرور DNS و سپس سایت دنبال کن. این نما برای توضیح روند است و دادهٔ تست زنده ندارد.</p><h2>اینترنت تو، اولویت تو.</h2><p>حالت روزمره، بازی، حریم خصوصی یا خانواده را انتخاب کن و تست را با همان اولویت شروع کن. حالت بازی به نوسان پاسخ وزن بیشتری می‌دهد و کاهش پینگ داخل بازی را تضمین نمی‌کند.</p><h2>تست، تازه شروع ماجراست.</h2><p>تا چهار نتیجه را مقایسه کن، تست‌های ذخیره‌شده را کنار هم ببین، گزارش JSON، CSV، TXT یا تصویر بگیر و راهنمای تنظیم دستگاهت را باز کن.</p>"
          : "<h2>Behind every address, there is a round trip.</h2><p>Follow an interactive explanation from your device to the resolver and then the website. The diagram is illustrative, not live test data.</p><h2>Your connection, your priorities.</h2><p>Choose everyday, gaming, privacy or family mode and start a test with that priority. Gaming mode gives more weight to variation; it does not guarantee lower in-game latency.</p><h2>A test is just the beginning.</h2><p>Compare up to four results, compare saved tests, export JSON, CSV, TXT or an image, and follow a device setup guide.</p>";
    html = html.replace(
      /<div id="root">[\s\S]*?<\/div>\s*<!-- static-end -->/,
      `<div id="root">${content.replace("</main>", `${homeExtension}</main>`)}</div><!-- static-end -->`,
    );
    const output = path.join(dist, route, "index.html");
    await mkdir(path.dirname(output), { recursive: true });
    await writeFile(output, html);
    pages.push(html);
    paths.push(route);
  }
async function files(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return (
    await Promise.all(
      entries.map((e) =>
        e.isDirectory()
          ? files(path.join(dir, e.name))
          : [path.join(dir, e.name)],
      ),
    )
  ).flat();
}
const assets = (await files(dist))
  .filter((f) => !f.endsWith(".map") && !f.endsWith("sw.js"))
  .map((f) => "/" + path.relative(dist, f).replaceAll("\\", "/"));
const version = createHash("sha256")
  .update(assets.join("\n") + pages.join("\n"))
  .digest("hex")
  .slice(0, 12);
const urls = [...new Set([...paths, ...assets])];
await writeFile(
  path.join(dist, "sw.js"),
  `const CACHE='pimx-lab-${version}';const PRECACHE=${JSON.stringify(urls)};self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(PRECACHE)));self.skipWaiting()});self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('pimx-lab-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==self.location.origin||u.pathname.startsWith('/api/')||u.pathname.includes('pimxpassdnsadmin'))return;if(e.request.mode==='navigate'){const test=/\\/test\\/?$/.test(u.pathname);const guide=/\\/guide\\/?$/.test(u.pathname);const fallback=(u.pathname.startsWith('/en')?'/en':'')+'/'+(guide?'guide/':test?'test/':'');e.respondWith(fetch(e.request).catch(()=>caches.match(fallback)));return}if(PRECACHE.includes(u.pathname))e.respondWith(caches.open(CACHE).then(async c=>(await c.match(e.request))||fetch(e.request).then(r=>{if(r.ok)c.put(e.request,r.clone());return r}))) });`,
);
console.log(
  `Generated six localized pages and offline shell (${urls.length} files).`,
);
