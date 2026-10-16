import type { DnsProvider } from "../types";

const known: DnsProvider[] = [
  {
    id: "lab-cloudflare",
    name: "Cloudflare",
    provider: "Cloudflare",
    primary: "1.1.1.1",
    secondary: "1.0.0.1",
    primaryIPv6: "2606:4700:4700::1111",
    secondaryIPv6: "2606:4700:4700::1001",
    protocol: "doh",
    doh: "https://cloudflare-dns.com/dns-query",
    dot: "one.one.one.one",
    tags: ["General", "Privacy"],
    location: "Anycast",
    source: "https://developers.cloudflare.com/1.1.1.1/",
    documented: true,
    reviewedAt: "2026-10-15",
  },
  {
    id: "lab-google",
    name: "Google Public DNS",
    provider: "Google",
    primary: "8.8.8.8",
    secondary: "8.8.4.4",
    primaryIPv6: "2001:4860:4860::8888",
    secondaryIPv6: "2001:4860:4860::8844",
    protocol: "doh",
    doh: "https://dns.google/dns-query",
    dot: "dns.google",
    tags: ["General"],
    location: "Anycast",
    source: "https://developers.google.com/speed/public-dns/docs/using",
    documented: true,
    reviewedAt: "2026-10-15",
  },
  {
    id: "lab-quad9",
    name: "Quad9",
    provider: "Quad9",
    primary: "9.9.9.9",
    secondary: "149.112.112.112",
    primaryIPv6: "2620:fe::fe",
    protocol: "doh",
    doh: "https://dns.quad9.net/dns-query",
    dot: "dns.quad9.net",
    tags: ["Security", "Privacy"],
    location: "Anycast",
    source: "https://docs.quad9.net/services/",
    documented: true,
    reviewedAt: "2026-10-15",
  },
  {
    id: "lab-adguard",
    name: "AdGuard DNS",
    provider: "AdGuard",
    primary: "94.140.14.14",
    secondary: "94.140.15.15",
    primaryIPv6: "2a10:50c0::ad1:ff",
    protocol: "doh",
    doh: "https://dns.adguard-dns.com/dns-query",
    dot: "dns.adguard-dns.com",
    tags: ["Security", "Privacy"],
    location: "Anycast",
    source: "https://adguard-dns.io/en/public-dns.html",
    documented: true,
    reviewedAt: "2026-10-15",
  },
  {
    id: "lab-family",
    name: "Cloudflare Families",
    provider: "Cloudflare",
    primary: "1.1.1.3",
    secondary: "1.0.0.3",
    protocol: "doh",
    doh: "https://family.cloudflare-dns.com/dns-query",
    dot: "family.cloudflare-dns.com",
    tags: ["Security"],
    family: true,
    location: "Anycast",
    source: "https://developers.cloudflare.com/1.1.1.1/setup/",
    documented: true,
    reviewedAt: "2026-10-15",
  },
  {
    id: "lab-adguard-family",
    name: "AdGuard Family",
    provider: "AdGuard",
    primary: "94.140.14.15",
    secondary: "94.140.15.16",
    protocol: "doh",
    doh: "https://family.adguard-dns.com/dns-query",
    dot: "family.adguard-dns.com",
    tags: ["Security"],
    family: true,
    location: "Anycast",
    source: "https://adguard-dns.io/en/public-dns.html",
    documented: true,
    reviewedAt: "2026-10-15",
  },
];
export const catalog = known;
let fullCatalog: Promise<DnsProvider[]> | undefined;
export function loadCatalog(): Promise<DnsProvider[]> {
  if (fullCatalog) return fullCatalog;
  fullCatalog = import("../constants").then(({ DNS_LIST }) => {
    const seen = new Set<string>();
    const ids = new Set<string>();
    return [...known, ...DNS_LIST]
      .filter((d) => {
        const key = d.primary.toLowerCase();
        if (seen.has(key) || ids.has(d.id)) return false;
        seen.add(key);
        ids.add(d.id);
        return true;
      })
      .map((d) => ({
        ...d,
        protocol:
          d.protocol ||
          (d.primary.startsWith("https://")
            ? "doh"
            : d.primary.startsWith("sdns://")
              ? "dnscrypt"
              : "plain"),
      }));
  });
  return fullCatalog;
}
export const endpoint = (d: DnsProvider) =>
  d.doh ||
  ((d.protocol === "doh" || d.protocol === "doh3") &&
  d.primary.startsWith("https://")
    ? d.primary
    : null);
export const protocolName = (d: DnsProvider) =>
  ({
    plain: "DNS",
    doh: "DoH",
    dot: "DoT",
    dnscrypt: "DNSCrypt",
    odoh: "ODoH",
    doh3: "DoH3",
    doq: "DoQ",
    unknown: "DNS",
  })[d.protocol || "unknown"];
export type Purpose = "daily" | "gaming" | "privacy" | "family";
export const fitsPurpose = (d: DnsProvider, purpose: Purpose) =>
  purpose === "family"
    ? d.family === true
    : purpose === "privacy"
      ? d.tags.includes("Privacy")
      : true;
export function validateEndpoint(raw: string): boolean {
  const value = raw.trim();
  if (!value || value.length > 2048) return false;
  if (/^sdns:\/\/[A-Za-z0-9_-]+$/.test(value)) return true;
  if (/^https:\/\//.test(value)) {
    try {
      const u = new URL(value);
      return !u.username && !u.password && !u.hash && !!u.hostname;
    } catch {
      return false;
    }
  }
  const host = value
    .replace(/^(tls|quic|udp|tcp):\/\//, "")
    .replace(/:853$/, "");
  if (/^\d+(\.\d+){3}$/.test(host))
    return host.split(".").every((p) => Number(p) >= 0 && Number(p) <= 255);
  if (host.includes(":")) {
    try {
      return !!new URL(`https://[${host.replace(/^\[|\]$/g, "")}]/`).hostname;
    } catch {
      return false;
    }
  }
  return /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i.test(
    host,
  );
}
export function customProvider(value: string, name?: string): DnsProvider {
  const protocol = value.startsWith("https://")
    ? "doh"
    : value.startsWith("sdns://")
      ? "dnscrypt"
      : value.startsWith("quic://")
        ? "doq"
        : value.startsWith("tls://")
          ? "dot"
          : "plain";
  return {
    id: `custom-${crypto.randomUUID()}`,
    name:
      (typeof name === "string" ? name.trim() : "") ||
      value.replace(/^\w+:\/\//, "").split("/")[0],
    provider: "Personal",
    primary: value.trim(),
    secondary: "",
    protocol,
    tags: ["General"],
    custom: true,
    ...(protocol === "doh" ? { doh: value.trim() } : {}),
  };
}
