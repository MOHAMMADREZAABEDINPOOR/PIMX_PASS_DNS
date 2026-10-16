import type { DnsResult } from "../types";
import type { Purpose } from "./catalog";
export type ScanRecord = {
  id: string;
  timestamp: number;
  network: string;
  mode: "quick" | "deep";
  purpose: Purpose;
  cancelled: boolean;
  results: DnsResult[];
};
export function readLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`pimx.lab.${key}`);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
export function writeLocal(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(`pimx.lab.${key}`, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}
export function rankResults(items: DnsResult[], purpose: Purpose): DnsResult[] {
  const score = (d: DnsResult) =>
    d.latency +
    d.jitter * (purpose === "gaming" ? 2 : 0.5) +
    (100 - d.successRate) * 10;
  return [...items].sort((a, b) => {
    if (a.status !== b.status)
      return a.status === "success" ? -1 : b.status === "success" ? 1 : 0;
    if (a.method !== b.method)
      return a.method === "doh" ? -1 : b.method === "doh" ? 1 : 0;
    return score(a) - score(b);
  });
}

export function readHistory(): ScanRecord[] {
  const current = readLocal<ScanRecord[]>("history", []);
  if (Array.isArray(current) && current.length)
    return current
      .filter(
        (r) =>
          typeof r?.id === "string" &&
          Array.isArray(r.results) &&
          Number.isFinite(r.timestamp),
      )
      .slice(0, 30);
  try {
    if (localStorage.getItem("pimx.lab.history") !== null) return [];
    const old = JSON.parse(
      localStorage.getItem("pimxpassdns_last_results_v1") || "null",
    );
    if (!old || !Array.isArray(old.results) || !Number.isFinite(old.timestamp))
      return [];
    const results: DnsResult[] = old.results
      .filter(
        (r: DnsResult) =>
          typeof r.primary === "string" && Array.isArray(r.rawPings),
      )
      .map((r: DnsResult) => ({ ...r, method: "https", attempted: 3 }));
    return results.length
      ? [
          {
            id: "legacy-last-scan",
            timestamp: old.timestamp,
            network: "Previous network",
            mode: "quick",
            purpose: "daily",
            cancelled: !!old.cancelled,
            results,
          },
        ]
      : [];
  } catch {
    return [];
  }
}
