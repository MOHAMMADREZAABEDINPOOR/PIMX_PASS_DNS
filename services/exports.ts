import QRCode from "qrcode";
import type { DnsProvider, DnsResult } from "../types";
import { endpoint } from "./catalog";

export function download(
  content: BlobPart,
  filename: string,
  type = "text/plain;charset=utf-8",
) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
export const exportRows = (results: DnsResult[]) =>
  results.map((r) => ({
    name: r.name,
    primary: r.primary,
    secondary: r.secondary,
    protocol: r.protocol,
    method: r.method,
    latency: r.status === "success" ? r.latency : null,
    jitter: r.status === "success" ? r.jitter : null,
    successRate: r.successRate,
    status: r.status,
    samples: r.rawPings,
    source: r.source || null,
  }));
export function exportResults(
  results: DnsResult[],
  format: "json" | "csv" | "txt",
) {
  const rows = exportRows(results);
  if (format === "json")
    return download(
      JSON.stringify(
        {
          product: "PIMX PASS",
          exportedAt: new Date().toISOString(),
          note: "DoH is a DNS query. HTTPS is reachability only. No network identity is included.",
          results: rows,
        },
        null,
        2,
      ),
      "pimx-results.json",
      "application/json",
    );
  const cell = (v: unknown) => {
    const s = String(v ?? "");
    return `"${/^[=+@-]/.test(s) ? "'" : ""}${s.replace(/"/g, '""')}"`;
  };
  const content =
    format === "csv"
      ? "\ufeff" +
        [
          "Name,Primary,Protocol,Method,Latency ms,Jitter ms,Success %,Status",
          ...rows.map((r) =>
            [
              r.name,
              r.primary,
              r.protocol,
              r.method,
              r.latency,
              r.jitter,
              r.successRate,
              r.status,
            ]
              .map(cell)
              .join(","),
          ),
        ].join("\r\n")
      : [
          "PIMX PASS / DNS report",
          "DoH = DNS query; HTTPS = connection timing only.",
          ...rows.map(
            (r) =>
              `${r.name}\n${r.primary}\n${r.method}: ${r.latency ?? "unavailable"} ms | jitter ${r.jitter ?? "—"} ms | success ${r.successRate}% | ${r.status}\n`,
          ),
        ].join("\n");
  download(
    content,
    `pimx-results.${format}`,
    format === "csv" ? "text/csv;charset=utf-8" : undefined,
  );
}
export const qrData = (value: string) =>
  QRCode.toDataURL(value, {
    width: 280,
    margin: 3,
    color: { dark: "#12203a", light: "#ffffff" },
    errorCorrectionLevel: "M",
  });
export async function exportImage(results: DnsResult[]) {
  await document.fonts.ready;
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 260 + Math.min(results.length, 8) * 90;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  ctx.fillStyle = "#0d1119";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#91b3ff";
  ctx.font = "800 44px Manrope Variable, sans-serif";
  ctx.fillText("PIMX PASS / DNS LAB", 60, 85);
  ctx.fillStyle = "#a4b2c8";
  ctx.font = "22px Manrope Variable, sans-serif";
  ctx.fillText(
    "Measured on your connection. DoH and HTTPS are different methods.",
    60,
    132,
  );
  results.slice(0, 8).forEach((r, i) => {
    const y = 220 + i * 90;
    ctx.fillStyle = "#eff4fc";
    ctx.font = "700 26px Manrope Variable, sans-serif";
    ctx.fillText(r.name.slice(0, 40), 60, y);
    ctx.fillStyle = "#a4b2c8";
    ctx.font = "20px Manrope Variable, sans-serif";
    ctx.fillText(
      `${r.method || "—"}  ·  ${r.status === "success" ? `${r.latency} ms` : r.status}  ·  ${r.successRate}%`,
      760,
      y,
    );
    ctx.fillText(r.primary.slice(0, 65), 60, y + 32);
  });
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/png"),
  );
  if (!blob) throw new Error("Image export failed");
  download(blob, "pimx-report.png", "image/png");
}
export function exportConfig(
  dns: DnsProvider,
  format: "adguard" | "dnsmasq" | "dnscrypt",
) {
  if (format === "adguard") {
    const value =
      endpoint(dns) ||
      (dns.protocol === "dot" && !dns.primary.startsWith("tls://")
        ? `tls://${dns.primary}`
        : dns.primary);
    download(
      `dns:\n  upstream_dns:\n    - ${JSON.stringify(value)}\n`,
      "pimx-adguard-upstreams.yaml",
      "application/yaml",
    );
  }
  if (format === "dnsmasq" && /^\d+(\.\d+){3}$/.test(dns.primary))
    download(
      `# PIMX PASS — merge into dnsmasq configuration\nno-resolv\nserver=${dns.primary}\n${/^\d+(\.\d+){3}$/.test(dns.secondary) ? `server=${dns.secondary}\n` : ""}`,
      "pimx-dnsmasq.conf",
    );
  if (format === "dnscrypt" && dns.primary.startsWith("sdns://"))
    download(
      `server_names = ['pimx-custom']\n[static.'pimx-custom']\nstamp = '${dns.primary}'\n`,
      "pimx-dnscrypt-proxy.toml",
    );
}
