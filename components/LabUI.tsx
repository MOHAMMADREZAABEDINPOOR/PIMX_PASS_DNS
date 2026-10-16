import React, { useEffect, useRef, useState } from "react";
import {
  Check,
  Copy,
  X,
  ArrowUpRight,
  Star,
  SlidersHorizontal,
  Download,
} from "lucide-react";
import type { DnsProvider, DnsResult } from "../types";
import { endpoint, protocolName } from "../services/catalog";
import { exportConfig, qrData } from "../services/exports";

export function Modal({
  title,
  onClose,
  children,
  wide = false,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => {
      dialog?.close();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={`lab-dialog ${wide ? "wide" : ""}`}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      aria-labelledby="dialog-title"
    >
      <div className="dialog-content">
        <div className="dialog-heading">
          <h2 id="dialog-title">{title}</h2>
          <button
            className="icon-button"
            onClick={onClose}
            aria-label="Close / بستن"
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
export function CopyButton({
  value,
  fa,
  notify,
}: {
  value: string;
  fa: boolean;
  notify?: (message: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  return (
    <button
      className="copy-button"
      title={fa ? "کپی آدرس" : "Copy address"}
      aria-label={fa ? "کپی آدرس" : "Copy address"}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          clearTimeout(timer.current);
          timer.current = setTimeout(() => setCopied(false), 1800);
        } catch {
          notify?.(
            fa
              ? "کپی خودکار ممکن نبود؛ آدرس را انتخاب و کپی کن."
              : "Select the address and copy it manually.",
          );
        }
      }}
    >
      {copied ? <Check size={17} /> : <Copy size={17} />}
    </button>
  );
}
export function Address({
  label,
  value,
  fa,
  notify,
}: {
  label: string;
  value?: string;
  fa: boolean;
  notify?: (message: string) => void;
}) {
  if (!value) return null;
  return (
    <div className="address-line">
      <span>{label}</span>
      <code dir="ltr">{value}</code>
      <CopyButton value={value} fa={fa} notify={notify} />
    </div>
  );
}
export function Sparkline({
  values,
  label,
}: {
  values: number[];
  label: string;
}) {
  if (!values.length) return <span className="muted">—</span>;
  const max = Math.max(...values, 1);
  return (
    <svg
      className="sparkline"
      viewBox="0 0 120 32"
      role="img"
      aria-label={`${label}: ${values.join(", ")} ms`}
    >
      <polyline
        points={values
          .map(
            (v, i) =>
              `${values.length === 1 ? 60 : 3 + (i / (values.length - 1)) * 114},${29 - (v / max) * 26}`,
          )
          .join(" ")}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle
        cx={values.length === 1 ? 60 : 117}
        cy={29 - (values[values.length - 1] / max) * 26}
        r="2.5"
        fill="currentColor"
      />
    </svg>
  );
}
export function ResolverRow({
  dns,
  result,
  fa,
  favorite,
  selected,
  onFavorite,
  onSelect,
  onGuide,
  notify,
}: {
  dns: DnsProvider;
  result?: DnsResult;
  fa: boolean;
  favorite: boolean;
  selected?: boolean;
  onFavorite: () => void;
  onSelect?: () => void;
  onGuide: () => void;
  notify: (message: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const f = (a: string, b: string) => (fa ? a : b);
  const success = result?.status === "success";
  return (
    <article className={`resolver-row ${selected ? "selected" : ""}`}>
      <div className="resolver-main">
        <button
          className={`icon-button favorite ${favorite ? "active" : ""}`}
          aria-pressed={favorite}
          aria-label={f("علاقه‌مندی: ", "Favorite: ") + dns.name}
          onClick={onFavorite}
        >
          <Star size={18} fill={favorite ? "currentColor" : "none"} />
        </button>
        <div
          className={`provider-mark mark-${dns.provider
            .toLowerCase()
            .replace(/[^a-z]/g, "")
            .slice(0, 12)}`}
          aria-hidden="true"
        >
          {dns.name.charAt(0)}
        </div>
        <div className="resolver-name">
          <h3 dir="auto">{dns.name}</h3>
          <span>
            {protocolName(dns)}
            {dns.primaryIPv6 ? " · IPv6" : ""}
            {dns.family ? f(" · خانواده", " · Family") : ""}
          </span>
        </div>
        <div className="resolver-metric">
          {result ? (
            <>
              <strong className={success ? "positive" : "muted"}>
                {success ? result.latency : "—"}
                {success && <small> ms</small>}
              </strong>
              <span>
                {result.method === "doh"
                  ? f("پاسخ DNS", "DNS response")
                  : result.method === "https"
                    ? f("اتصال HTTPS", "HTTPS connection")
                    : f("تست مستقیم ندارد", "Not browser-testable")}
              </span>
            </>
          ) : (
            <>
              <strong className="unmeasured">
                {f("آماده تست", "Ready to test")}
              </strong>
              <span>
                {endpoint(dns)
                  ? f("درخواست واقعی DoH", "Real DoH query")
                  : f("فهرست منابع", "Source catalog")}
              </span>
            </>
          )}
        </div>
        <div className="resolver-chart">
          {result && (
            <Sparkline
              values={result.rawPings}
              label={f("نمونه‌های پاسخ", "Response samples")}
            />
          )}
        </div>
        {onSelect && (
          <label className="compare-check">
            <input
              type="checkbox"
              aria-label={f("مقایسه ", "Compare ") + dns.name}
              checked={!!selected}
              onChange={onSelect}
            />
            <span>{f("مقایسه", "Compare")}</span>
          </label>
        )}
        <button
          className="icon-button"
          aria-expanded={expanded}
          aria-label={f("جزئیات ", "Details for ") + dns.name}
          onClick={() => setExpanded(!expanded)}
        >
          <SlidersHorizontal size={18} />
        </button>
      </div>
      {expanded && (
        <div className="resolver-details">
          <div>
            <Address
              label="Primary"
              value={dns.primary}
              fa={fa}
              notify={notify}
            />
            <Address
              label="Secondary"
              value={dns.secondary}
              fa={fa}
              notify={notify}
            />
            <Address
              label="IPv6"
              value={dns.primaryIPv6}
              fa={fa}
              notify={notify}
            />
            <Address
              label="IPv6 secondary"
              value={dns.secondaryIPv6}
              fa={fa}
              notify={notify}
            />
            <Address
              label="DoH"
              value={endpoint(dns) || undefined}
              fa={fa}
              notify={notify}
            />
            <Address
              label="DoT"
              value={
                dns.dot || (dns.protocol === "dot" ? dns.primary : undefined)
              }
              fa={fa}
              notify={notify}
            />
          </div>
          <div className="detail-notes">
            {result && (
              <p>
                {f("موفقیت درخواست‌ها", "Successful requests")}:{" "}
                {result.successRate}% · {f("نوسان", "Variation")}:{" "}
                {success ? `${result.jitter} ms` : "—"} ·{" "}
                {result.rawPings.length}/{result.attempted || 0}
              </p>
            )}
            {result?.status === "failed" && (
              <p>
                {f(
                  "از این مرورگر پاسخ قابل‌اندازه‌گیری نگرفتیم. محدودیت مرورگر یا مسیر شبکه هم می‌تواند علت باشد.",
                  "No measurable response from this browser. Browser policy or the network route may be responsible.",
                )}
              </p>
            )}
            <p>
              {dns.documented
                ? f(
                    "آدرس‌ها با مستندات ارائه‌دهنده تطبیق داده شده‌اند؛ این برچسب تضمین کیفیت یا حریم خصوصی نیست.",
                    "Addresses match provider documentation. This is not a quality or privacy certification.",
                  )
                : f(
                    "واردشده از فهرست منابع؛ قابلیت‌ها مستقلاً تأیید نشده‌اند.",
                    "Imported catalog entry; capabilities have not been independently verified.",
                  )}
            </p>
            {dns.reviewedAt && (
              <p>
                {f("بررسی منبع", "Source reviewed")}:{" "}
                <time>{dns.reviewedAt}</time>
              </p>
            )}
            {dns.source && /^https?:\/\//.test(dns.source) && (
              <a href={dns.source} target="_blank" rel="noreferrer">
                {f("مشاهده منبع", "Open source")} <ArrowUpRight size={16} />
              </a>
            )}
            <button className="text-button" onClick={onGuide}>
              {f("راهنمای تنظیم این DNS", "Set up this DNS")}{" "}
              <ArrowUpRight size={16} />
            </button>
          </div>
        </div>
      )}
    </article>
  );
}

const steps = {
  android: {
    fa: [
      "تنظیمات گوشی ← شبکه و اینترنت ← DNS خصوصی را باز کن. نام گزینه‌ها ممکن است با مدل گوشی فرق کند.",
      "«نام میزبان ارائه‌دهنده DNS خصوصی» را انتخاب کن و نام میزبان DoT زیر را وارد کن.",
      "ذخیره کن و یک سایت را باز کن. اگر اتصال قطع شد، DNS خصوصی را روی «خودکار» بگذار.",
    ],
    en: [
      "Open Settings → Network & internet → Private DNS. Names vary by device.",
      "Select Private DNS provider hostname and enter the DoT hostname below.",
      "Save and open a website. To undo, switch Private DNS back to Automatic.",
    ],
  },
  windows: {
    fa: [
      "تنظیمات ← شبکه و اینترنت ← اتصال فعال ← تنظیمات DNS را باز کن.",
      "ویرایش را بزن، حالت دستی و IPv4 را فعال کن و آدرس اصلی و جایگزین زیر را وارد کن.",
      "ذخیره کن. برای بازگشت، تخصیص DNS را روی «خودکار / DHCP» بگذار.",
    ],
    en: [
      "Open Settings → Network & internet → your active connection → DNS settings.",
      "Edit DNS assignment, select Manual and enable IPv4. Enter the preferred and alternate addresses below.",
      "Save. To undo, select Automatic (DHCP) for DNS assignment.",
    ],
  },
  ios: {
    fa: [
      "تنظیمات ← Wi-Fi ← علامت اطلاعات کنار شبکه فعلی ← Configure DNS.",
      "حالت Manual را انتخاب کن، آدرس‌های قبلی را یادداشت کن و سرورهای زیر را اضافه کن.",
      "Save را بزن. این روش برای همین وای‌فای است. برای بازگشت، Automatic را انتخاب کن.",
    ],
    en: [
      "Open Settings → Wi-Fi → the information button for your network → Configure DNS.",
      "Choose Manual, note your existing entries and add the addresses below.",
      "Save. This applies to this Wi-Fi network. To undo, choose Automatic.",
    ],
  },
  mac: {
    fa: [
      "تنظیمات سیستم ← شبکه ← اتصال فعال ← Details ← DNS.",
      "با دکمه افزودن، آدرس‌های زیر را وارد کن؛ تنظیمات قبلی را یادداشت کن.",
      "تأیید کن. برای بازگشت، ورودی‌های اضافه‌شده را حذف کن تا DNS دریافتی از شبکه استفاده شود.",
    ],
    en: [
      "Open System Settings → Network → active connection → Details → DNS.",
      "Add the addresses below and note your previous configuration.",
      "Confirm. To undo, remove the entries you added and use network-provided DNS.",
    ],
  },
  browser: {
    fa: [
      "در تنظیمات Chrome یا Edge، بخش امنیت و «استفاده از DNS امن» را پیدا کن. در Firefox بخش DNS over HTTPS را باز کن.",
      "ارائه‌دهنده سفارشی را انتخاب کن و آدرس کامل HTTPS زیر را وارد کن.",
      "این تنظیم فقط برای مرورگر است. برای بازگشت، ارائه‌دهنده پیش‌فرض را انتخاب کن.",
    ],
    en: [
      "In Chrome or Edge, open Security → Use secure DNS. In Firefox, open DNS over HTTPS settings.",
      "Choose a custom provider and enter the complete HTTPS URL below.",
      "This applies to the browser only. To undo, choose your default provider.",
    ],
  },
};
export function Guide({
  dns,
  fa,
  notify,
}: {
  dns: DnsProvider;
  fa: boolean;
  notify: (message: string) => void;
}) {
  const [device, setDevice] = useState<keyof typeof steps>("android");
  const f = (a: string, b: string) => (fa ? a : b);
  const ip =
    /^\d+(\.\d+){3}$/.test(dns.primary) ||
    (dns.primary.includes(":") && !dns.primary.includes("://"));
  const candidate =
    device === "android"
      ? dns.dot ||
        (dns.protocol === "dot"
          ? dns.primary.replace(/^tls:\/\//, "").replace(/:853$/, "")
          : "")
      : device === "browser"
        ? endpoint(dns)
        : ip
          ? dns.primary
          : "";
  const value =
    device === "android" &&
    candidate &&
    !/^(?:[a-z0-9-]+\.)+[a-z]{2,}$/i.test(candidate)
      ? ""
      : candidate;
  return (
    <div className="guide-content">
      <div className="segmented device-selector">
        {(["android", "windows", "ios", "mac", "browser"] as const).map((d) => (
          <button
            key={d}
            className={device === d ? "active" : ""}
            onClick={() => setDevice(d)}
            aria-pressed={device === d}
          >
            {
              {
                android: "Android",
                windows: "Windows",
                ios: "iPhone",
                mac: "macOS",
                browser: f("مرورگر", "Browser"),
              }[d]
            }
          </button>
        ))}
      </div>
      <h3 dir="auto">{dns.name}</h3>
      {!value ? (
        <div className="notice">
          {f(
            "برای این DNS مقدار سازگار با این روش نداریم. دستگاه یا DNS دیگری را انتخاب کن. DNSCrypt و ODoH به برنامه سازگار نیاز دارند.",
            "No compatible value is documented for this setup method. Choose another device or resolver. DNSCrypt and ODoH need a compatible client.",
          )}
        </div>
      ) : (
        <>
          <ol className="setup-steps">
            {steps[device][fa ? "fa" : "en"].map((s) => (
              <li key={s}>
                {device === "windows" && ip && dns.primary.includes(":")
                  ? s.replaceAll("IPv4", "IPv6")
                  : s}
              </li>
            ))}
          </ol>
          <Address
            label={
              device === "android"
                ? "DoT hostname"
                : device === "browser"
                  ? "DoH URL"
                  : "Primary"
            }
            value={value}
            fa={fa}
            notify={notify}
          />
          {!["android", "browser"].includes(device) && (
            <Address
              label="Secondary"
              value={dns.secondary}
              fa={fa}
              notify={notify}
            />
          )}
        </>
      )}
      <p className="muted small">
        {f(
          "سایت تنظیمات دستگاهت را تغییر نمی‌دهد. مسیر منوها بسته به نسخه سیستم‌عامل فرق می‌کند.",
          "This site does not change device settings. Menu names vary between OS versions.",
        )}
      </p>
      <div className="button-row">
        <button
          className="button secondary"
          disabled={
            !endpoint(dns) &&
            !ip &&
            !dns.primary.startsWith("sdns://") &&
            dns.protocol !== "dot"
          }
          onClick={() => exportConfig(dns, "adguard")}
        >
          <Download size={16} />
          AdGuard Home YAML
        </button>
        <button
          className="button secondary"
          disabled={!/^\d+(\.\d+){3}$/.test(dns.primary)}
          onClick={() => exportConfig(dns, "dnsmasq")}
        >
          dnsmasq.conf
        </button>
        {dns.primary.startsWith("sdns://") && (
          <button
            className="button secondary"
            onClick={() => exportConfig(dns, "dnscrypt")}
          >
            DNSCrypt TOML
          </button>
        )}
      </div>
      <p className="small muted">
        {f(
          "فایل‌ها قطعه تنظیمات هستند؛ پیش از ادغام از تنظیمات فعلی نسخه پشتیبان بگیر.",
          "Files are configuration snippets. Back up your existing configuration before merging.",
        )}
      </p>
    </div>
  );
}
export function QrPanel({ value, fa }: { value: string; fa: boolean }) {
  const [src, setSrc] = useState("");
  const [error, setError] = useState(false);
  useEffect(() => {
    let active = true;
    qrData(value)
      .then((url) => {
        if (active) setSrc(url);
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, [value]);
  return (
    <div className="qr-panel">
      {src ? (
        <img
          src={src}
          alt={
            fa
              ? "کد QR آدرس DNS انتخاب‌شده"
              : "QR code for selected resolver address"
          }
          width="280"
          height="280"
        />
      ) : (
        <p>
          {error
            ? fa
              ? "این آدرس برای QR طولانی است؛ از خروجی متن استفاده کن."
              : "This address is too long for QR. Use text export."
            : fa
              ? "ساخت کد…"
              : "Creating code…"}
        </p>
      )}
      <code dir="ltr">{value}</code>
      {src && (
        <a className="button secondary" href={src} download="pimx-dns-qr.png">
          {fa ? "ذخیره QR" : "Save QR"}
        </a>
      )}
    </div>
  );
}
