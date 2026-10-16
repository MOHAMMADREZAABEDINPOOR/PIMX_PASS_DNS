import { SourceSelect } from "./SourceSelect";
import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowDownToLine,
  ArrowUpRight,
  Check,
  Clock3,
  Search,
  Trash2,
  Activity,
  WifiOff,
  Plus,
  FileUp,
  X,
} from "lucide-react";
import type { DnsProvider, DnsResult } from "../types";
import {
  catalog,
  customProvider,
  endpoint,
  validateEndpoint,
} from "../services/catalog";
import type { ScanRecord } from "../services/storage";
import { exportImage, exportResults } from "../services/exports";
import { queryDns } from "../services/pingService";
import { Address, QrPanel, Sparkline } from "./LabUI";

export function ComparePanel({
  results,
  fa,
  onRemove,
}: {
  results: DnsResult[];
  fa: boolean;
  onRemove: (id: string) => void;
}) {
  const f = (a: string, b: string) => (fa ? a : b);
  const max = Math.max(...results.map((r) => r.latency), 1);
  return (
    <div className="comparison">
      <p className="muted">
        {f(
          "سرعت، نوسان و نرخ موفقیت را کنار هم بخوان. عدد کمتر در زمان و نوسان بهتر است.",
          "Read response time, variation and success together. Lower time and variation are better.",
        )}
      </p>
      {new Set(results.map((r) => r.method)).size > 1 && (
        <p className="notice">
          {f(
            "روش تست این گزینه‌ها یکسان نیست؛ پاسخ DNS و اتصال HTTPS مقایسه مستقیم ندارند.",
            "These entries use different methods. DNS responses and HTTPS reachability are not directly comparable.",
          )}
        </p>
      )}
      <div
        className="comparison-grid"
        style={{ "--compare-count": results.length } as React.CSSProperties}
      >
        {results.map((r) => (
          <article key={r.id}>
            <div className="section-heading">
              <h3 dir="auto">{r.name}</h3>
              <button
                className="icon-button"
                onClick={() => onRemove(r.id)}
                aria-label={f("حذف از مقایسه", "Remove from comparison")}
              >
                <X size={16} />
              </button>
            </div>
            <p className="muted">
              {r.method === "doh" ? "DNS over HTTPS" : "HTTPS reachability"}
            </p>
            <strong className="comparison-number">
              {r.latency}
              <small> ms</small>
            </strong>
            <div className="metric-bar">
              <i style={{ width: `${(r.latency / max) * 100}%` }} />
            </div>
            <dl>
              <div>
                <dt>{f("نوسان", "Variation")}</dt>
                <dd>{r.jitter} ms</dd>
              </div>
              <div>
                <dt>{f("پاسخ موفق", "Success")}</dt>
                <dd>{r.successRate}%</dd>
              </div>
              <div>
                <dt>{f("نمونه‌ها", "Samples")}</dt>
                <dd>
                  {r.rawPings.length}/{r.attempted || r.rawPings.length}
                </dd>
              </div>
            </dl>
            <Sparkline
              values={r.rawPings}
              label={f("زمان پاسخ‌ها", "Response times")}
            />
          </article>
        ))}
      </div>
    </div>
  );
}

export function ExportPanel({
  results,
  fa,
  notify,
}: {
  results: DnsResult[];
  fa: boolean;
  notify: (message: string) => void;
}) {
  const f = (a: string, b: string) => (fa ? a : b);
  const [selected, setSelected] = useState(results[0]?.id || "");
  const [imageBusy, setImageBusy] = useState(false);
  const dns = results.find((r) => r.id === selected);
  return (
    <div>
      <p>
        {f(
          "گزارش فقط شامل DNSها و اندازه‌گیری‌هاست؛ نام شبکه و IP شخصی در خروجی نیست.",
          "Reports include resolvers and measurements. Your network name and personal IP are omitted.",
        )}
      </p>
      <div className="export-options">
        {(["json", "csv", "txt"] as const).map((format) => (
          <button
            className="export-option"
            key={format}
            onClick={() => exportResults(results, format)}
          >
            <ArrowDownToLine />
            <strong>{format.toUpperCase()}</strong>
            <span>
              {
                {
                  json: f("داده کامل و نمونه‌ها", "Complete data and samples"),
                  csv: f("برای اکسل و جدول‌ها", "For spreadsheets"),
                  txt: f("ساده و قابل ارسال", "Plain and easy to share"),
                }[format]
              }
            </span>
          </button>
        ))}
        <button
          className="export-option"
          disabled={imageBusy}
          onClick={async () => {
            setImageBusy(true);
            try {
              await exportImage(results);
            } catch {
              notify(
                f(
                  "ساخت تصویر انجام نشد؛ خروجی JSON را امتحان کن.",
                  "Image export failed. Try JSON export.",
                ),
              );
            } finally {
              setImageBusy(false);
            }
          }}
        >
          <ArrowDownToLine />
          <strong>PNG</strong>
          <span>{f("کارت تصویری نتیجه‌ها", "Shareable result image")}</span>
        </button>
      </div>
      <label className="field">
        <span>{f("QR آدرس DNS", "Resolver address QR")}</span>
        <SourceSelect
          value={selected}
          onChange={setSelected}
          fa={fa}
          label={f("QR آدرس DNS", "Resolver address QR")}
          options={results.map((r) => ({
            value: r.id,
            label: r.name,
            description: r.primary,
          }))}
        />
      </label>
      {dns && <QrPanel value={endpoint(dns) || dns.primary} fa={fa} />}
    </div>
  );
}

export function HistoryPanel({
  history,
  fa,
  network,
  onOpen,
  onDelete,
  onClear,
}: {
  history: ScanRecord[];
  fa: boolean;
  network: string;
  onOpen: (r: ScanRecord) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
}) {
  const f = (a: string, b: string) => (fa ? a : b);
  const [onlyNetwork, setOnlyNetwork] = useState(false);
  const [beforeId, setBeforeId] = useState("");
  const [afterId, setAfterId] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);
  const records = history.filter((r) => !onlyNetwork || r.network === network);
  const before = history.find((r) => r.id === beforeId),
    after = history.find((r) => r.id === afterId);
  const paired =
    before && after
      ? after.results.flatMap((a) => {
          const b = before.results.find(
            (b) =>
              b.primary === a.primary &&
              b.method === a.method &&
              b.status === "success",
          );
          return b && a.status === "success" ? [{ before: b, after: a }] : [];
        })
      : [];
  const points = records
    .slice(0, 12)
    .reverse()
    .flatMap((r) => {
      const best = r.results.find(
        (x) => x.status === "success" && x.method === "doh",
      );
      return best ? [{ record: r, latency: best.latency }] : [];
    });
  return (
    <section className="workspace-panel">
      <div className="section-heading">
        <div>
          <h2>{f("مسیرت را نگه دار.", "Keep track of your connection.")}</h2>
          <p className="muted">
            {f(
              "تا ۳۰ تست روی همین دستگاه ذخیره می‌شود.",
              "Up to 30 scans are stored on this device.",
            )}
          </p>
        </div>
        <Clock3 className="section-icon" />
      </div>
      {!history.length ? (
        <div className="empty-state">
          <Clock3 size={36} />
          <h3>
            {f("هنوز تستی ذخیره نشده.", "Your first scan starts the story.")}
          </h3>
          <p>
            {f(
              "بعد از اولین اسکن، نتیجه‌ها و نمودار اینجا منتظرت هستند.",
              "Run a scan to see saved results and trends here.",
            )}
          </p>
        </div>
      ) : (
        <>
          <div className="toolbar">
            <label className="check-label">
              <input
                type="checkbox"
                checked={onlyNetwork}
                onChange={(e) => setOnlyNetwork(e.target.checked)}
              />
              {f("فقط شبکه فعلی", "Current network only")}: {network}
            </label>
            <button
              className="text-button danger"
              onClick={() => setConfirmClear(true)}
            >
              <Trash2 size={16} />
              {f("پاک‌کردن تاریخچه", "Clear history")}
            </button>
          </div>
          {confirmClear && (
            <div className="notice button-row">
              <span>
                {f(
                  "همه تست‌های ذخیره‌شده حذف شوند؟",
                  "Delete all saved scans?",
                )}
              </span>
              <button
                className="button secondary"
                onClick={() => {
                  onClear();
                  setConfirmClear(false);
                }}
              >
                {f("بله، حذف کن", "Delete all")}
              </button>
              <button
                className="text-button"
                onClick={() => setConfirmClear(false)}
              >
                {f("انصراف", "Cancel")}
              </button>
            </div>
          )}
          {points.length > 0 && (
            <div className="history-chart">
              <div className="section-heading">
                <h3>
                  {f(
                    "بهترین پاسخ DoH در هر تست",
                    "Best DoH response in each scan",
                  )}
                </h3>
                <span className="muted">ms</span>
              </div>
              <div
                className="history-bars"
                role="img"
                aria-label={points
                  .map(
                    (p) =>
                      `${new Date(p.record.timestamp).toLocaleString(fa ? "fa-IR" : "en-US")}: ${p.latency} ms`,
                  )
                  .join("; ")}
              >
                {points.map((p) => (
                  <button
                    key={p.record.id}
                    onClick={() => onOpen(p.record)}
                    title={`${p.record.network}: ${p.latency} ms`}
                  >
                    <span>{p.latency}</span>
                    <i
                      style={{
                        height: `${Math.max(8, (p.latency / Math.max(...points.map((p) => p.latency))) * 120)}px`,
                      }}
                    />
                    <time>
                      {new Date(p.record.timestamp).toLocaleDateString(
                        fa ? "fa-IR" : "en-US",
                        { month: "short", day: "numeric" },
                      )}
                    </time>
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="history-list">
            {records.map((r) => (
              <article key={r.id}>
                <div>
                  <strong>{r.network}</strong>
                  <time dateTime={new Date(r.timestamp).toISOString()}>
                    {new Date(r.timestamp).toLocaleString(
                      fa ? "fa-IR" : "en-US",
                    )}
                  </time>
                  <span className="muted">
                    {r.results.length} {f("DNS", "resolvers")} ·{" "}
                    {r.cancelled
                      ? f("متوقف‌شده", "Stopped")
                      : r.mode === "deep"
                        ? f("تست دقیق", "Deep scan")
                        : f("تست سریع", "Quick scan")}
                  </span>
                </div>
                <div className="button-row">
                  <button
                    className="button secondary"
                    onClick={() => onOpen(r)}
                  >
                    {f("بازکردن", "Open")}
                    <ArrowUpRight size={16} />
                  </button>
                  <button
                    className="icon-button danger"
                    onClick={() => onDelete(r.id)}
                    aria-label={f("حذف تست", "Delete scan")}
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </article>
            ))}
          </div>
          {history.length >= 2 && (
            <div className="before-after">
              <h3>{f("قبل و بعد را مقایسه کن", "Compare before and after")}</h3>
              <div className="form-grid">
                {[
                  {
                    label: f("قبل", "Before"),
                    value: beforeId,
                    set: setBeforeId,
                  },
                  { label: f("بعد", "After"), value: afterId, set: setAfterId },
                ].map((field) => (
                  <label className="field" key={field.label}>
                    <span>{field.label}</span>
                    <SourceSelect
                      value={field.value}
                      onChange={field.set}
                      fa={fa}
                      label={field.label}
                      options={[
                        { value: "", label: f("انتخاب تست", "Choose scan") },
                        ...history.map((r) => ({
                          value: r.id,
                          label: r.network,
                          description: new Date(r.timestamp).toLocaleString(
                            fa ? "fa-IR" : "en-US",
                          ),
                        })),
                      ]}
                    />
                  </label>
                ))}
              </div>
              {before &&
                after &&
                (beforeId === afterId ? (
                  <p className="notice">
                    {f(
                      "دو تست متفاوت را انتخاب کن.",
                      "Choose two different scans.",
                    )}
                  </p>
                ) : (
                  <>
                    <p className="muted">
                      {before.network === after.network
                        ? f(
                            "شبکه ثبت‌شده یکسان است؛ فقط روش‌های تست یکسان مقایسه می‌شوند.",
                            "The saved network matches. Only matching measurement methods are compared.",
                          )
                        : f(
                            "این تست‌ها روی دو شبکه متفاوت ثبت شده‌اند؛ اختلاف فقط نتیجه تغییر DNS نیست.",
                            "These scans have different network labels. Differences cannot be attributed only to DNS changes.",
                          )}
                    </p>
                    {paired.length ? (
                      <div className="table-scroll">
                        <table>
                          <thead>
                            <tr>
                              <th>DNS</th>
                              <th>{f("قبل", "Before")}</th>
                              <th>{f("بعد", "After")}</th>
                              <th>{f("تغییر", "Change")}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {paired.map(({ before: b, after: a }) => (
                              <tr key={a.id}>
                                <th>{a.name}</th>
                                <td>{b.latency} ms</td>
                                <td>{a.latency} ms</td>
                                <td
                                  className={
                                    a.latency < b.latency ? "positive" : ""
                                  }
                                >
                                  {a.latency - b.latency > 0 ? "+" : ""}
                                  {a.latency - b.latency} ms
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p>
                        {f(
                          "DNS موفق با روش اندازه‌گیری مشترک پیدا نشد.",
                          "No successful resolver with a matching measurement method was found.",
                        )}
                      </p>
                    )}
                  </>
                ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}

export function CustomPanel({
  custom,
  existing = catalog,
  fa,
  onAdd,
  onDelete,
  notify,
}: {
  custom: DnsProvider[];
  existing?: DnsProvider[];
  fa: boolean;
  onAdd: (items: DnsProvider[]) => void;
  onDelete: (id: string) => void;
  notify: (message: string) => void;
}) {
  const f = (a: string, b: string) => (fa ? a : b);
  const [value, setValue] = useState(""),
    [name, setName] = useState(""),
    [error, setError] = useState("");
  const add = (text: string) => {
    let values: { primary: string; name?: string }[];
    try {
      const parsed =
        text.trim().startsWith("[") || text.trim().startsWith("{")
          ? JSON.parse(text)
          : null;
      if (parsed) {
        const rows = Array.isArray(parsed) ? parsed : parsed.results;
        if (!Array.isArray(rows)) throw new Error();
        values = rows.map((r) =>
          typeof r === "string"
            ? { primary: r }
            : { primary: r.primary, name: r.name },
        );
      } else
        values = text
          .split(/[\n,;]+/)
          .map((v) => ({ primary: v.trim(), name }));
    } catch {
      setError(
        f(
          "ساختار JSON خوانده نشد. آرایه آدرس‌ها یا خروجی JSON همین سایت را وارد کن.",
          "Could not read JSON. Import an address array or this site’s JSON export.",
        ),
      );
      return;
    }
    const seen = new Set(
      [...existing, ...custom].map((d) => d.primary.toLowerCase()),
    );
    let invalid = 0,
      duplicates = 0;
    const added: DnsProvider[] = [];
    values
      .filter((v) => v.primary)
      .slice(0, 200)
      .forEach((v) => {
        if (typeof v.primary !== "string" || !validateEndpoint(v.primary)) {
          invalid++;
          return;
        }
        const key = v.primary.trim().toLowerCase();
        if (seen.has(key)) {
          duplicates++;
          return;
        }
        seen.add(key);
        added.push(customProvider(v.primary, v.name));
      });
    if (added.length) {
      onAdd(added);
      setValue("");
      setName("");
    }
    const message = fa
      ? `${added.length} آدرس اضافه شد؛ ${duplicates} تکراری و ${invalid} نامعتبر.`
      : `${added.length} added; ${duplicates} duplicate and ${invalid} invalid.`;
    setError(invalid || !added.length ? message : "");
    notify(message);
  };
  return (
    <div className="custom-panel">
      <div>
        <h3>{f("لیست خودت، قواعد خودت.", "Your own resolver collection.")}</h3>
        <p className="muted">
          {f(
            "IPv4، IPv6، لینک DoH، آدرس tls:// و استمپ sdns://. هر آدرس در یک خط؛ تا ۲۰۰ ورودی در هر بار.",
            "IPv4, IPv6, DoH URLs, tls:// hostnames and sdns:// stamps. One address per line, up to 200 entries per import.",
          )}
        </p>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          add(value);
        }}
      >
        <label className="field">
          <span>{f("نام دلخواه (اختیاری)", "Name (optional)")}</span>
          <input
            value={name}
            maxLength={80}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label className="field">
          <span>{f("آدرس یا فهرست آدرس‌ها", "Address or address list")}</span>
          <textarea
            required
            dir="ltr"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={"https://resolver.example/dns-query\n2001:db8::1"}
            rows={4}
          />
        </label>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <div className="button-row">
          <button className="button primary" type="submit">
            <Plus size={18} />
            {f("افزودن به مجموعه", "Add to collection")}
          </button>
          <label className="button secondary file-upload">
            <FileUp size={17} />
            {f("ورود فایل TXT / JSON", "Import TXT / JSON")}
            <input
              type="file"
              accept=".txt,.json,text/plain,application/json"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  if (file.size > 1024 * 1024)
                    setError(
                      f(
                        "حجم فایل باید کمتر از یک مگابایت باشد.",
                        "File must be smaller than 1 MB.",
                      ),
                    );
                  else add(await file.text());
                }
                e.target.value = "";
              }}
            />
          </label>
        </div>
      </form>
      {custom.length > 0 && (
        <div className="custom-list">
          {custom.map((d) => (
            <div key={d.id}>
              <span dir="auto">{d.name}</span>
              <code dir="ltr">{d.primary}</code>
              <button
                className="icon-button danger"
                aria-label={f("حذف ", "Delete ") + d.name}
                onClick={() => onDelete(d.id)}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

type HealthPoint = { t: number; ok: boolean; latency: number | null };
type HealthPayload = {
  generatedAt: number;
  services: { name: string; history: HealthPoint[] }[];
};
export function StatusPanel({ fa }: { fa: boolean }) {
  const f = (a: string, b: string) => (fa ? a : b);
  const [data, setData] = useState<HealthPayload | null>(null),
    [state, setState] = useState<"loading" | "ready" | "unavailable">(
      "loading",
    );
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setState("loading");
    fetch("/api/status", { signal: controller.signal, cache: "no-store" })
      .then(async (r) => {
        if (
          !r.ok ||
          !r.headers.get("content-type")?.includes("application/json")
        )
          throw new Error();
        const body = await r.json();
        if (!body.generatedAt || !Array.isArray(body.services))
          throw new Error();
        setData(body);
        setState("ready");
      })
      .catch(() => {
        if (!controller.signal.aborted) setState("unavailable");
      });
    return () => controller.abort();
  }, [revision]);
  const stale = data ? Date.now() - data.generatedAt > 15 * 60 * 1000 : false;
  return (
    <section className="workspace-panel">
      <div className="section-heading">
        <div>
          <h2>{f("از سمت شبکه چه خبر؟", "What does the edge see?")}</h2>
          <p className="muted">
            {f(
              "پایش دوره‌ای از Cloudflare؛ مسیر این تست با اینترنت تو فرق دارد.",
              "Scheduled checks from Cloudflare. This path differs from your connection.",
            )}
          </p>
        </div>
        <button
          className="button secondary"
          disabled={state === "loading"}
          onClick={() => setRevision((v) => v + 1)}
        >
          <Activity size={17} />
          {f("تازه‌سازی", "Refresh")}
        </button>
      </div>
      {state === "loading" ? (
        <p className="notice" role="status">
          {f("در حال دریافت آخرین پایش…", "Fetching the latest check…")}
        </p>
      ) : state === "unavailable" ? (
        <div className="empty-state">
          <WifiOff size={36} />
          <h3>
            {f("داده پایش در دسترس نیست.", "Monitoring data is unavailable.")}
          </h3>
          <p>
            {f(
              "ممکن است سرویس هنوز راه‌اندازی نشده باشد یا اتصال برقرار نباشد. تست مرورگر همچنان در بخش اسکن قابل انجام است.",
              "The monitoring service may not be configured, or the connection may be unavailable. You can still run a browser scan.",
            )}
          </p>
        </div>
      ) : (
        <>
          {stale && (
            <p className="notice">
              {f(
                "داده‌ها قدیمی‌اند؛ وضعیت فعلی را نمی‌شود از آن‌ها نتیجه گرفت.",
                "These checks are stale and do not establish current service health.",
              )}
            </p>
          )}
          <p className="muted">
            {f("آخرین پایش", "Last check")}:{" "}
            {data &&
              new Date(data.generatedAt).toLocaleString(fa ? "fa-IR" : "en-US")}
          </p>
          <div className="status-list">
            {data?.services.map((service) => {
              const latest = service.history[service.history.length - 1];
              return (
                <article key={service.name}>
                  <div>
                    <h3>{service.name}</h3>
                    <span
                      className={
                        stale ? "muted" : latest?.ok ? "positive" : "danger"
                      }
                    >
                      {stale
                        ? f("نامشخص", "Unknown")
                        : latest?.ok
                          ? f("پاسخ دریافت شد", "Responded")
                          : f("پاسخ معتبر دریافت نشد", "No valid response")}
                    </span>
                  </div>
                  <div
                    className="uptime-strip"
                    role="img"
                    aria-label={service.history
                      .map(
                        (p) =>
                          `${new Date(p.t).toISOString()}: ${p.ok ? "responded" : "failed"}`,
                      )
                      .join("; ")}
                  >
                    {service.history.slice(-48).map((point) => (
                      <i
                        className={point.ok ? "up" : "down"}
                        key={point.t}
                        title={`${new Date(point.t).toLocaleString()}: ${point.latency ?? "—"} ms`}
                      />
                    ))}
                  </div>
                  <span>{latest?.ok ? `${latest.latency} ms` : "—"}</span>
                </article>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}

export function DomainPanel({ fa }: { fa: boolean }) {
  const f = (a: string, b: string) => (fa ? a : b);
  const [domain, setDomain] = useState(""),
    [type, setType] = useState(1),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const [answers, setAnswers] = useState<
    { name: string; latency?: number; count?: number; error?: boolean }[]
  >([]);
  useEffect(() => () => controller.current?.abort(), []);
  const controller = React.useRef<AbortController | null>(null);
  return (
    <section className="workspace-panel">
      <div className="section-heading">
        <div>
          <h2>{f("یک دامنه، چند مسیر.", "One domain. Different routes.")}</h2>
          <p className="muted">
            {f(
              "تعداد پاسخ‌های معتبر و زمان درخواست DoH را برای دامنه دلخواه مقایسه کن.",
              "Compare valid answer counts and DoH response times for a domain.",
            )}
          </p>
        </div>
        <Search className="section-icon" />
      </div>
      <form
        className="domain-form"
        onSubmit={async (e) => {
          e.preventDefault();
          setError("");
          setAnswers([]);
          if (
            !/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}\.?$/i.test(
              domain.trim(),
            ) ||
            domain.length > 253
          ) {
            setError(
              f(
                "یک دامنه مثل example.com وارد کن؛ بدون https یا مسیر.",
                "Enter a domain such as example.com, without https or a path.",
              ),
            );
            return;
          }
          controller.current = new AbortController();
          setBusy(true);
          await Promise.all(
            catalog
              .filter((d) => d.documented && !d.family)
              .map(async (dns) => {
                try {
                  const result = await queryDns(
                    endpoint(dns)!,
                    domain.trim(),
                    type,
                    controller.current!.signal,
                  );
                  if (!controller.current?.signal.aborted)
                    setAnswers((a) => [
                      ...a,
                      {
                        name: dns.name,
                        latency: result.latency,
                        count: result.answers,
                      },
                    ]);
                } catch {
                  if (!controller.current?.signal.aborted)
                    setAnswers((a) => [...a, { name: dns.name, error: true }]);
                }
              }),
          );
          setBusy(false);
        }}
      >
        <label className="field">
          <span>{f("دامنه", "Domain")}</span>
          <input
            required
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="example.com"
            dir="ltr"
            autoCapitalize="none"
            spellCheck={false}
            disabled={busy}
          />
        </label>
        <label className="field">
          <span>{f("نوع رکورد", "Record type")}</span>
          <SourceSelect
            value={String(type)}
            onChange={(v) => setType(Number(v))}
            disabled={busy}
            fa={fa}
            label={f("نوع رکورد", "Record type")}
            options={[
              { value: "1", label: "A ? IPv4" },
              { value: "28", label: "AAAA ? IPv6" },
              { value: "15", label: "MX" },
              { value: "16", label: "TXT" },
            ]}
          />
        </label>
        <button className="button primary" disabled={busy} type="submit">
          {busy
            ? f("در حال پرس‌وجو…", "Querying…")
            : f("بررسی دامنه", "Query domain")}
          <ArrowUpRight size={18} />
        </button>
      </form>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <p className="small muted">
        {f(
          "درخواست مستقیم به ارائه‌دهنده‌های نمایش‌داده‌شده ارسال می‌شود. دامنه در تاریخچه ذخیره نمی‌شود. نداشتن پاسخ لزوماً به معنی اختلال DNS نیست.",
          "Queries go directly to the listed providers. Domains are not saved in history. No answer does not necessarily indicate a DNS outage.",
        )}
      </p>
      <div className="domain-answers" aria-live="polite">
        {answers.map((a) => (
          <article key={a.name}>
            <h3>{a.name}</h3>
            <strong className={a.error ? "muted" : "positive"}>
              {a.error ? "—" : `${a.latency} ms`}
            </strong>
            <p>
              {a.error
                ? f("پاسخ معتبر دریافت نشد", "No valid answer received")
                : `${a.count} ${f("رکورد پاسخ", "answer records")}`}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
