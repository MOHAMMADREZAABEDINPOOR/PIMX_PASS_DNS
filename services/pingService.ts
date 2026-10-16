import type { DnsProvider, DnsResult } from "../types";
import { endpoint } from "./catalog";
export function makeQuery(domain = "example.com", type = 1): Uint8Array {
  const normalized = domain.toLowerCase().replace(/\.$/, "");
  if (
    normalized.length > 253 ||
    !normalized
      .split(".")
      .every((s) => /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i.test(s))
  )
    throw new Error("Invalid domain");
  const labels = normalized
    .split(".")
    .flatMap((s) => [s.length, ...Array.from(s, (c) => c.charCodeAt(0))]);
  return new Uint8Array([
    0,
    0,
    1,
    0,
    0,
    1,
    0,
    0,
    0,
    0,
    0,
    0,
    ...labels,
    0,
    type >> 8,
    type & 255,
    0,
    1,
  ]);
}
export async function queryDns(
  url: string,
  domain = "example.com",
  type = 1,
  signal?: AbortSignal,
) {
  const bytes = makeQuery(domain, type);
  const encoded = btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  const target = new URL(url);
  if (target.protocol !== "https:") throw new Error("HTTPS required");
  target.searchParams.set("dns", encoded);
  const combined = signal
    ? AbortSignal.any([signal, AbortSignal.timeout(4000)])
    : AbortSignal.timeout(4000);
  const start = performance.now();
  const response = await fetch(target, {
    headers: { accept: "application/dns-message" },
    cache: "no-store",
    credentials: "omit",
    referrerPolicy: "no-referrer",
    signal: combined,
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  if (
    !response.headers.get("content-type")?.includes("application/dns-message")
  )
    throw new Error("Unexpected response format");
  const data = new Uint8Array(await response.arrayBuffer());
  if (
    data.length < bytes.length ||
    data[0] !== 0 ||
    data[1] !== 0 ||
    !(data[2] & 128) ||
    (data[2] & 122) !== 0 ||
    (data[3] & 15) !== 0 ||
    data[4] !== 0 ||
    data[5] !== 1 ||
    bytes.slice(12).some((byte, i) => byte !== data[i + 12])
  )
    throw new Error("No valid DNS answer");
  return {
    latency: Math.max(1, Math.round(performance.now() - start)),
    answers: (data[6] << 8) | data[7],
    bytes: data,
  };
}
export async function measureLatency(
  host: string,
  signal?: AbortSignal,
): Promise<number> {
  const start = performance.now();
  try {
    const url = new URL(
      host.startsWith("https://")
        ? host
        : `https://${host.includes(":") && !host.startsWith("[") ? `[${host}]` : host}/`,
    );
    url.searchParams.set("_pimx", String(Date.now()));
    await fetch(url, {
      mode: "no-cors",
      cache: "no-store",
      credentials: "omit",
      referrerPolicy: "no-referrer",
      signal: signal
        ? AbortSignal.any([signal, AbortSignal.timeout(2500)])
        : AbortSignal.timeout(2500),
    });
    return Math.max(1, Math.round(performance.now() - start));
  } catch {
    return 9999;
  }
}
export async function runBatchTest(
  list: DnsProvider[],
  onProgress: (result: DnsResult) => void,
  shouldCancel?: () => boolean,
  options: {
    samples?: number;
    signal?: AbortSignal;
    onTesting?: (name: string) => void;
  } = {},
) {
  const samples = options.samples || 3;
  for (let offset = 0; offset < list.length; offset += 3) {
    if (shouldCancel?.() || options.signal?.aborted) break;
    await Promise.all(
      list.slice(offset, offset + 3).map(async (dns) => {
        if (shouldCancel?.() || options.signal?.aborted) return;
        const doh = endpoint(dns);
        const unsupported =
          !doh && !["plain", "unknown", undefined].includes(dns.protocol);
        const rawPings: number[] = [];
        let attempted = 0;
        options.onTesting?.(dns.name);
        if (!unsupported)
          for (let i = 0; i < samples; i++) {
            if (shouldCancel?.() || options.signal?.aborted) break;
            attempted++;
            try {
              const ms = doh
                ? (await queryDns(doh, "example.com", 1, options.signal))
                    .latency
                : await measureLatency(
                    dns.testTarget || dns.primary,
                    options.signal,
                  );
              if (ms < 9999) rawPings.push(ms);
            } catch {
              /* A failed connection is never a successful measurement. */
            }
          }
        if (options.signal?.aborted || shouldCancel?.()) return;
        const latency = rawPings.length
          ? Math.round(rawPings.reduce((a, b) => a + b, 0) / rawPings.length)
          : 9999;
        const jitter =
          rawPings.length > 1
            ? Math.round(
                Math.sqrt(
                  rawPings.reduce((sum, p) => sum + (p - latency) ** 2, 0) /
                    rawPings.length,
                ),
              )
            : 0;
        onProgress({
          ...dns,
          latency,
          jitter,
          rawPings,
          attempted,
          successRate: attempted
            ? Math.round((rawPings.length / attempted) * 100)
            : 0,
          status: unsupported
            ? "unsupported"
            : rawPings.length
              ? "success"
              : "failed",
          method: unsupported ? "unsupported" : doh ? "doh" : "https",
        });
      }),
    );
  }
}
