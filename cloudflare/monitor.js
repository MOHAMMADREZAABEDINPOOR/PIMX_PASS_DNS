// Scheduled edge monitoring. No arbitrary upstream URLs are accepted.
const SERVICES = [
  { name: "Cloudflare", url: "https://cloudflare-dns.com/dns-query" },
  { name: "Google Public DNS", url: "https://dns.google/dns-query" },
  { name: "Quad9", url: "https://dns.quad9.net/dns-query" },
  { name: "AdGuard DNS", url: "https://dns.adguard-dns.com/dns-query" },
];
export const STATUS_KEY = "pimx-monitor-v1";
export async function collectHealth(env, fetcher = fetch, now = Date.now()) {
  if (!env.MONITOR_KV) throw new Error("MONITOR_KV binding is required");
  const previous = await env.MONITOR_KV.get(STATUS_KEY, "json");
  const query = new Uint8Array([
    0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 7, 101, 120, 97, 109, 112, 108, 101, 3,
    99, 111, 109, 0, 0, 1, 0, 1,
  ]);
  const dns = btoa(String.fromCharCode(...query))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  const services = await Promise.all(
    SERVICES.map(async (service) => {
      const start = performance.now();
      let ok = false,
        latency = null;
      try {
        const r = await fetcher(`${service.url}?dns=${dns}`, {
          headers: { accept: "application/dns-message" },
          signal: AbortSignal.timeout(5000),
          cache: "no-store",
        });
        if (r.ok) {
          const body = new Uint8Array(await r.arrayBuffer());
          ok = body.length >= 12 && !!(body[2] & 128) && (body[3] & 15) === 0;
        }
        if (ok) latency = Math.max(1, Math.round(performance.now() - start));
      } catch {
        /* A failed check stays failed. */
      }
      const old =
        previous?.services?.find((s) => s.name === service.name)?.history || [];
      return {
        name: service.name,
        history: [...old, { t: now, ok, latency }].slice(-288),
      };
    }),
  );
  const payload = {
    generatedAt: now,
    vantage: "Cloudflare edge; not the visitor network",
    services,
  };
  await env.MONITOR_KV.put(STATUS_KEY, JSON.stringify(payload));
  return payload;
}
export default {
  async scheduled(_event, env, ctx) {
    ctx.waitUntil(collectHealth(env));
  },
  async fetch(request, env) {
    if (request.method !== "GET" || new URL(request.url).pathname !== "/status")
      return new Response("Not found", { status: 404 });
    if (!env.MONITOR_KV)
      return Response.json({ error: "monitor_unconfigured" }, { status: 503 });
    // Bootstrap a genuine edge check on the first read after provisioning.
    const payload = (await env.MONITOR_KV.get(STATUS_KEY, "json")) || await collectHealth(env);
    return Response.json(payload || { error: "no_checks_yet" }, {
      status: payload ? 200 : 503,
      headers: { "cache-control": "no-store" },
    });
  },
};
