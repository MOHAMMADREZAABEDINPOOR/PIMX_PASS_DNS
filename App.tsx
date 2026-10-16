import { NetworkName } from "./components/NetworkName";
import React, {
  lazy,
  Suspense,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AnimatePresence,
  motion,
  MotionConfig,
  useIsPresent,
} from "framer-motion";
import {
  ArrowUpRight,
  ArrowDown,
  Activity,
  Check,
  ChevronDown,
  Command,
  Download,
  Globe2,
  History,
  Layers3,
  Moon,
  Play,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Square,
  Star,
  Sun,
  Wifi,
  X,
  Zap,
  HelpCircle,
  Monitor,
  Smartphone,
} from "lucide-react";
import { useI18n } from "./i18n";
import {
  catalog as starterCatalog,
  loadCatalog,
  endpoint,
  fitsPurpose,
  protocolName,
  type Purpose,
} from "./services/catalog";
import { runBatchTest } from "./services/pingService";
import {
  rankResults,
  readLocal,
  readHistory,
  writeLocal,
  type ScanRecord,
} from "./services/storage";
import type { DnsProvider, DnsResult } from "./types";
import { Modal, ResolverRow, Guide, Address } from "./components/LabUI";
import {
  ComparePanel,
  CustomPanel,
  DomainPanel,
  ExportPanel,
  HistoryPanel,
  StatusPanel,
} from "./components/LabPanels";
import "./styles.css";
import "./refresh.css";
import { Collections, type ResolverCollection } from "./components/Collections";
import { HomePage } from "./components/HomePage";
import { GuidePage } from "./components/GuidePage";
import { AppLoader } from "./components/AppLoader";
import { SourceSelect, type SourceOption } from "./components/SourceSelect";
import { currentPage, navigatePage, pagePath } from "./services/navigation";

const NetworkScene = lazy(() => import("./components/NetworkScene"));
const Admin = lazy(() =>
  import("./components/AdminPanel").then((m) => ({ default: m.AdminPanel })),
);
type Tab = "scan" | "history" | "collection" | "domain" | "status" | "guide";
type InstallEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
};
const purposes: Purpose[] = ["daily", "gaming", "privacy", "family"];

function TransitionSurface({
  children,
  reduced,
  route = false,
  onMount,
}: {
  children: React.ReactNode;
  reduced: boolean;
  route?: boolean;
  onMount?: () => void;
}) {
  const present = useIsPresent();
  useLayoutEffect(() => {
    if (present) onMount?.();
  }, [present]);
  return (
    <motion.div
      onAnimationComplete={() => {
        if (present) onMount?.();
      }}
      className={route ? "route-page" : undefined}
      inert={!present ? true : undefined}
      initial={reduced ? false : { opacity: 0, y: route ? 10 : 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={route ? { opacity: 0 } : { opacity: 0, y: -4 }}
      transition={{
        duration: reduced ? 0 : route ? 0.24 : 0.22,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

function Laboratory() {
  const { lang, dir, setLang } = useI18n();
  const fa = lang === "fa";
  const [catalog, setCatalog] = useState<DnsProvider[]>(starterCatalog);
  const f = (a: string, b: string) => (fa ? a : b);
  const [tab, setTab] = useState<Tab>("scan");
  const [route, setRoute] = useState(currentPage);
  const testPage = route === "test",
    guidePage = route === "guide";
  const [booting, setBooting] = useState(true);
  const [theme, setTheme] = useState<"dark" | "light">(() =>
    readLocal("theme", "dark"),
  );
  const [reduced, setReduced] = useState(
    () =>
      readLocal("motion", false) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [network, setNetwork] = useState(() =>
    readLocal("network", fa ? "شبکه من" : "My network"),
  );
  const [purpose, setPurpose] = useState<Purpose>("daily");
  const [mode, setMode] = useState<"quick" | "deep">("quick");
  const [scope, setScope] = useState<string>("recommended");
  const [collections, setCollections] = useState<ResolverCollection[]>(() => {
    const saved = readLocal<ResolverCollection[]>("collections", []);
    return Array.isArray(saved)
      ? saved.filter((c) => c?.id && c?.name && Array.isArray(c.ids))
      : [];
  });
  const [count, setCount] = useState(12);
  const [history, setHistory] = useState<ScanRecord[]>(readHistory);
  const [custom, setCustom] = useState<DnsProvider[]>(() => {
    const c = readLocal<DnsProvider[]>("custom", []);
    return Array.isArray(c)
      ? c.filter((r) => r?.id && r?.primary && Array.isArray(r.tags))
      : [];
  });
  const [favorites, setFavorites] = useState<string[]>(() => {
    const a = readLocal<string[]>("favorites", []);
    return Array.isArray(a) ? a : [];
  });
  const [results, setResults] = useState<DnsResult[]>([]);
  const [scanPurpose, setScanPurpose] = useState<Purpose>("daily");
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(0);
  const [total, setTotal] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [current, setCurrent] = useState("");
  const [cancelled, setCancelled] = useState(false);
  const [scanError, setScanError] = useState("");
  const [search, setSearch] = useState("");
  const [protocol, setProtocol] = useState("all");
  const [sort, setSort] = useState("recommended");
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [modal, setModal] = useState<
    "compare" | "export" | "custom" | "install" | "command" | null
  >(null);
  const [guideId, setGuideId] = useState(starterCatalog[0].id);
  const [toast, setToast] = useState("");
  const [online, setOnline] = useState(navigator.onLine);
  const [installEvent, setInstallEvent] = useState<InstallEvent | null>(null);
  const [installed, setInstalled] = useState(
    () => window.matchMedia("(display-mode: standalone)").matches,
  );
  const [command, setCommand] = useState("");
  const controller = useRef<AbortController | null>(null);
  const scanLock = useRef(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const progressRef = useRef<HTMLElement>(null);
  const workspace = useRef<HTMLElement>(null);
  const routeKind = useRef(route);
  const focusDestination = useRef(false);
  const goPage = (page: boolean | "guide") =>
    navigatePage(pagePath(lang, page));
  const openGuide = (dns: DnsProvider) => {
    setGuideId(dns.id);
    goPage("guide");
  };
  useEffect(() => {
    const sync = () => {
      const next = currentPage();
      if (next !== routeKind.current) focusDestination.current = true;
      routeKind.current = next;
      setRoute(next);
      window.scrollTo({ top: 0, behavior: "instant" });
    };
    window.addEventListener("popstate", sync);
    window.addEventListener("pimx:navigate", sync);
    return () => {
      window.removeEventListener("popstate", sync);
      window.removeEventListener("pimx:navigate", sync);
    };
  }, []);
  useEffect(() => {
    let active = true;
    const frame = requestAnimationFrame(() => {
      Promise.allSettled([
        document.fonts.load("800 24px Vazirmatn"),
        document.fonts.load("400 14px Vazirmatn"),
        document.fonts.load('800 24px "Manrope Variable"'),
      ]).then(() => {
        if (active) setBooting(false);
      });
    });
    const watchdog = setTimeout(() => {
      if (active) setBooting(false);
    }, 4500);
    return () => {
      active = false;
      cancelAnimationFrame(frame);
      clearTimeout(watchdog);
    };
  }, []);
  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => {
      loadCatalog()
        .then((items) => {
          if (active) setCatalog(items);
        })
        .catch(() => {
          /* The documented starter set remains usable offline. */
        });
    }, 1200);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, []);

  const notify = (message: string) => {
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 4200);
  };
  const persist = (key: string, value: unknown) => {
    if (!writeLocal(key, value))
      notify(
        f(
          "فضای ذخیره‌سازی در دسترس نیست؛ خروجی بگیر تا نتیجه‌ها را نگه داری.",
          "Storage is unavailable. Export your results to keep them.",
        ),
      );
  };
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.classList.toggle("light", theme === "light");
    document.documentElement.classList.toggle("dark", theme === "dark");
    writeLocal("theme", theme);
  }, [theme]);
  useEffect(() => {
    writeLocal("motion", reduced);
    document.documentElement.dataset.motion = reduced ? "reduced" : "full";
  }, [reduced]);
  useEffect(() => {
    const on = () => setOnline(navigator.onLine);
    const install = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as InstallEvent);
    };
    const installed = () => {
      setInstalled(true);
      setInstallEvent(null);
    };
    const key = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setModal((m) => (m === "command" ? null : "command"));
      }
    };
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const respectMotion = () => {
      if (media.matches) setReduced(true);
    };
    window.addEventListener("online", on);
    window.addEventListener("offline", on);
    window.addEventListener("beforeinstallprompt", install);
    window.addEventListener("appinstalled", installed);
    window.addEventListener("keydown", key);
    media.addEventListener("change", respectMotion);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", on);
      window.removeEventListener("beforeinstallprompt", install);
      window.removeEventListener("appinstalled", installed);
      window.removeEventListener("keydown", key);
      media.removeEventListener("change", respectMotion);
      controller.current?.abort();
      clearTimeout(toastTimer.current);
    };
  }, []);
  useEffect(() => {
    const title = guidePage
      ? f(
          "راهنمای تنظیم DNS برای گوشی و کامپیوتر | PIMX PASS",
          "DNS setup guides for your devices | PIMX PASS",
        )
      : testPage
        ? f(
            "تست و مقایسه DNS روی اینترنت خودت | PIMX PASS",
            "Test and compare DNS on your connection | PIMX PASS",
          )
        : f(
            "DNS مناسب اینترنت خودت را پیدا کن | PIMX PASS",
            "Find the DNS for your connection | PIMX PASS",
          );
    const description = f(
      "آزمایشگاه DNS پیمکس پس: تست واقعی DoH، مقایسه زمان پاسخ و پایداری، تاریخچه شبکه، خروجی و راهنمای تنظیم DNS برای گوشی و کامپیوتر.",
      "PIMX PASS DNS laboratory: real DoH queries, response time and stability comparisons, network history, exports and device setup guides.",
    );
    document.title = title;
    const setMeta = (selector: string, content: string) =>
      document.querySelector(selector)?.setAttribute("content", content);
    setMeta('meta[name="description"]', description);
    setMeta('meta[property="og:title"]', title);
    setMeta('meta[property="og:description"]', description);
    setMeta('meta[property="og:locale"]', fa ? "fa_IR" : "en_US");
    setMeta('meta[name="twitter:title"]', title);
    setMeta('meta[name="twitter:description"]', description);
    const canonical = `https://pimxpassdns.pages.dev${pagePath(lang, guidePage ? "guide" : testPage)}`;
    document
      .querySelector('link[rel="canonical"]')
      ?.setAttribute("href", canonical);
    setMeta('meta[property="og:url"]', canonical);
    for (const alternate of ["fa", "en", "x-default"] as const) {
      document
        .querySelector(`link[rel="alternate"][hreflang="${alternate}"]`)
        ?.setAttribute(
          "href",
          `https://pimxpassdns.pages.dev${pagePath(alternate === "en" ? "en" : "fa", guidePage ? "guide" : testPage)}`,
        );
    }
  }, [lang, testPage, guidePage]);

  const all = useMemo(() => [...catalog, ...custom], [catalog, custom]);
  const pool = useMemo(() => {
    const candidates = scope.startsWith("collection:")
      ? all.filter((d) =>
          collections.find((c) => c.id === scope.slice(11))?.ids.includes(d.id),
        )
      : scope === "favorites"
        ? all.filter((d) => favorites.includes(d.id))
        : scope === "custom"
          ? custom
          : scope === "recommended"
            ? all.filter((d) => endpoint(d))
            : all;
    return candidates.filter((d) => fitsPurpose(d, purpose)).slice(0, count);
  }, [scope, purpose, count, favorites, custom, all, collections]);
  const ranked = useMemo(
    () => rankResults(results, scanPurpose),
    [results, scanPurpose],
  );
  const best = ranked.find((r) => r.status === "success" && r.method === "doh");
  const successCount = results.filter((r) => r.status === "success").length;
  const selectedResults = selected.flatMap((id) => {
    const r = results.find((r) => r.id === id);
    return r ? [r] : [];
  });
  const purposeLabel = (p: Purpose) =>
    ({
      daily: f("روزمره", "Everyday"),
      gaming: f("بازی", "Gaming"),
      privacy: f("حریم خصوصی", "Privacy"),
      family: f("خانواده", "Family"),
    })[p];
  const purposeDescription = {
    daily: f(
      "پاسخ سریع با درنظرگرفتن نوسان و موفقیت درخواست‌ها.",
      "Fast responses, weighted by consistency and successful requests.",
    ),
    gaming: f(
      "در رتبه‌بندی، نوسان وزن بیشتری دارد. این تست پینگ سرور بازی را اندازه نمی‌گیرد.",
      "Variation carries more weight. This does not measure game-server ping.",
    ),
    privacy: f(
      "گزینه‌های دارای برچسب حریم خصوصی در فهرست منابع؛ سیاست هر ارائه‌دهنده را در منبع بخوان.",
      "Catalog entries tagged for privacy. Read each provider’s policy at its source.",
    ),
    family: f(
      "فقط ارائه‌دهنده‌هایی که حالت خانواده آن‌ها در مستندات مشخص شده است.",
      "Only documented family-filtering variants are included.",
    ),
  };
  const list = useMemo(() => {
    let entries: DnsProvider[] =
      tab === "collection"
        ? all
        : results.length || running
          ? ranked
          : catalog.slice(0, 6);
    entries = entries.filter(
      (d) =>
        (!search ||
          `${d.name} ${d.primary} ${d.provider}`
            .toLowerCase()
            .includes(search.toLowerCase())) &&
        (protocol === "all" || d.protocol === protocol) &&
        (!onlyFavorites || favorites.includes(d.id)),
    );
    if (sort === "name")
      entries = [...entries].sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "success")
      entries = [...entries].sort(
        (a, b) =>
          ((b as DnsResult).successRate || 0) -
          ((a as DnsResult).successRate || 0),
      );
    return entries;
  }, [
    all,
    catalog,
    results,
    ranked,
    tab,
    running,
    search,
    protocol,
    onlyFavorites,
    favorites,
    sort,
  ]);
  useEffect(() => setPage(1), [search, protocol, onlyFavorites, tab, sort]);
  const favorite = (id: string) => {
    const next = favorites.includes(id)
      ? favorites.filter((x) => x !== id)
      : [...favorites, id];
    setFavorites(next);
    persist("favorites", next);
  };
  const select = (id: string) => {
    if (selected.includes(id)) setSelected(selected.filter((x) => x !== id));
    else if (selected.length < 4) setSelected([...selected, id]);
    else
      notify(
        f(
          "تا ۴ DNS را هم‌زمان مقایسه کن.",
          "Compare up to four resolvers at a time.",
        ),
      );
  };
  const changeTab = (next: Tab) => {
    if (next === "guide") {
      goPage("guide");
      return;
    }
    if (!testPage) goPage(true);
    setTab(next);
    setSearch("");
    setProtocol("all");
    setOnlyFavorites(false);
    if (next !== "scan")
      setTimeout(
        () =>
          workspace.current?.scrollIntoView({
            behavior: reduced ? "instant" : "smooth",
            block: "start",
          }),
        testPage ? 30 : 360,
      );
  };
  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "scan", label: f("اسکن شبکه", "Scan"), icon: <Activity size={17} /> },
    {
      id: "collection",
      label: f("مجموعه DNS", "Resolvers"),
      icon: <Layers3 size={17} />,
    },
    {
      id: "history",
      label: f("تاریخچه", "History"),
      icon: <History size={17} />,
    },
    {
      id: "domain",
      label: f("آزمایشگاه دامنه", "Domain lab"),
      icon: <Globe2 size={17} />,
    },
    {
      id: "status",
      label: f("وضعیت سرویس‌ها", "Service health"),
      icon: <Wifi size={17} />,
    },
    {
      id: "guide",
      label: f("راهنمای تنظیم", "Setup guides"),
      icon: <HelpCircle size={17} />,
    },
  ];
  async function startScan() {
    if (scanLock.current) return;
    if (!online) {
      notify(
        f(
          "برای اسکن به اینترنت وصل شو. تاریخچه و راهنماها آفلاین هم باز می‌شوند.",
          "Connect to run a scan. Saved history and guides work offline.",
        ),
      );
      return;
    }
    if (!pool.length) {
      notify(
        f(
          "در این مجموعه DNS مناسبی نیست. منبع تست را عوض کن یا DNS اضافه کن.",
          "No matching resolver in this collection. Change the source or add one.",
        ),
      );
      return;
    }
    scanLock.current = true;
    controller.current = new AbortController();
    const signal = controller.current.signal;
    setResults([]);
    setSelected([]);
    setCancelled(false);
    setScanError("");
    setCompleted(0);
    setElapsed(0);
    setTotal(pool.length);
    setRunning(true);
    setScanPurpose(purpose);
    setTab("scan");
    const started = Date.now();
    const measured: DnsResult[] = [];
    const timer = setInterval(
      () => setElapsed(Math.floor((Date.now() - started) / 1000)),
      1000,
    );
    setTimeout(
      () =>
        progressRef.current?.scrollIntoView({
          behavior: reduced ? "instant" : "smooth",
          block: "center",
        }),
      80,
    );
    try {
      await runBatchTest(
        pool,
        (result) => {
          measured.push(result);
          setResults([...measured]);
          setCompleted(measured.length);
        },
        () => signal.aborted,
        { samples: mode === "deep" ? 7 : 3, signal, onTesting: setCurrent },
      );
    } catch {
      setScanError(
        f(
          "اسکن کامل نشد؛ نتیجه‌های دریافت‌شده را نگه داشتیم.",
          "The scan could not finish. Completed measurements are preserved.",
        ),
      );
    } finally {
      clearInterval(timer);
      scanLock.current = false;
      setRunning(false);
      setCancelled(signal.aborted);
      setElapsed(Math.floor((Date.now() - started) / 1000));
      if (measured.length) {
        const record: ScanRecord = {
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          network: network.trim() || "My network",
          mode,
          purpose,
          cancelled: signal.aborted,
          results: rankResults(measured, purpose),
        };
        setHistory((previous) => {
          const next = [record, ...previous].slice(0, 30);
          if (!writeLocal("history", next))
            setScanError(
              f(
                "ذخیره تاریخچه ممکن نبود؛ از نتیجه‌ها خروجی بگیر.",
                "History could not be saved. Export your results.",
              ),
            );
          return next;
        });
      }
    }
  }
  function openRecord(record: ScanRecord) {
    if (running) {
      notify(
        f(
          "اول اسکن فعلی را متوقف کن؛ بعد نتیجه قبلی را باز کن.",
          "Stop the current scan before opening a saved result.",
        ),
      );
      return;
    }
    setResults(record.results);
    setScanPurpose(record.purpose);
    setMode(record.mode);
    setCancelled(record.cancelled);
    setTotal(record.results.length);
    setCompleted(record.results.length);
    setSelected([]);
    changeTab("scan");
    setTimeout(
      () =>
        progressRef.current?.scrollIntoView({
          behavior: reduced ? "instant" : "smooth",
        }),
      60,
    );
  }
  const sourceOptions: SourceOption[] = [
    {
      value: "recommended",
      kind: "doh",
      label: f("قابل تست با DoH", "DoH testable"),
      description: f(
        "اندازه‌گیری با پاسخ واقعی DNS",
        "Measure a real DNS response",
      ),
      count: all.filter((d) => !!endpoint(d)).length,
    },
    {
      value: "favorites",
      kind: "favorites",
      label: f("علاقه‌مندی‌ها", "Favorites"),
      description: f(
        "فقط DNSهایی که ستاره‌دار کرده‌ای",
        "Only the resolvers you have starred",
      ),
      count: all.filter((d) => favorites.includes(d.id)).length,
    },
    {
      value: "custom",
      kind: "custom",
      label: f("DNSهای شخصی", "Personal resolvers"),
      description: f(
        "آدرس‌هایی که خودت اضافه کرده‌ای",
        "Addresses you have added yourself",
      ),
      count: custom.length,
    },
    {
      value: "all",
      kind: "all",
      label: f("همه منابع", "All sources"),
      description: f(
        "فهرست کامل؛ همه پروتکل‌ها قابل تست نیستند",
        "Full catalog; not every protocol is browser-testable",
      ),
      count: all.length,
    },
    ...collections.map((c) => ({
      value: "collection:" + c.id,
      kind: "collection" as const,
      label: c.name,
      description: f("مجموعه ذخیره‌شده تو", "Your saved collection"),
      count: all.filter((d) => c.ids.includes(d.id)).length,
    })),
  ];
  const scanConfig = (
    <section className="scan-config" aria-labelledby="scan-config-title">
      <div className="config-title">
        <h2 id="scan-config-title">
          {f("اینترنت تو، انتخاب تو.", "Your connection. Your choice.")}
        </h2>
        <p>
          {f(
            "تست از همین مرورگر و روی همین اتصال اجرا می‌شود.",
            "Measured from this browser, on this connection.",
          )}
        </p>
      </div>
      <div className="config-fields">
        <label className="field network-field">
          <span>
            <Wifi size={15} />
            {f("نام شبکه", "Network name")}
          </span>
          <NetworkName
            value={network}
            onChange={(value) => {
              setNetwork(value);
              writeLocal("network", value);
            }}
            names={history.map((r) => r.network)}
            disabled={running}
            label={f("نام شبکه", "Network name")}
          />
        </label>
        <div className="field">
          <span>{f("منبع تست", "Test collection")}</span>
          <SourceSelect
            value={scope}
            options={sourceOptions}
            onChange={setScope}
            disabled={running}
            label={f("منبع تست", "Test collection")}
            fa={fa}
          />
        </div>
        <label className="field count-field">
          <span>{f("تعداد DNS", "Resolver limit")}</span>
          <input
            type="number"
            min={1}
            max={200}
            value={count}
            disabled={running}
            onChange={(e) =>
              setCount(Math.max(1, Math.min(200, Number(e.target.value) || 1)))
            }
          />
        </label>
      </div>
      <div className="config-bottom">
        <div
          className="segmented mode-switch"
          aria-label={f("عمق تست", "Scan depth")}
        >
          <button
            disabled={running}
            className={mode === "quick" ? "active" : ""}
            aria-pressed={mode === "quick"}
            onClick={() => setMode("quick")}
          >
            <Zap size={16} />
            {f("سریع", "Quick")}
            <span>3×</span>
          </button>
          <button
            disabled={running}
            className={mode === "deep" ? "active" : ""}
            aria-pressed={mode === "deep"}
            onClick={() => setMode("deep")}
          >
            <SlidersHorizontal size={16} />
            {f("دقیق", "Deep")}
            <span>7×</span>
          </button>
        </div>
        <span className="scan-count">
          {pool.length} {f("DNS در صف تست", "resolvers ready")}
        </span>
        <button
          className="button primary scan-button"
          disabled={running || !pool.length || !online}
          onClick={startScan}
        >
          <span>
            {running
              ? f("اسکن در حال اجراست", "Scan in progress")
              : results.length
                ? f("دوباره تست کن", "Run another scan")
                : f("اتصال من را تست کن", "Test my connection")}
          </span>
          {running ? (
            <Activity size={20} className="activity-icon" />
          ) : (
            <ArrowUpRight size={22} />
          )}
        </button>
      </div>
    </section>
  );

  return (
    <MotionConfig reducedMotion={reduced ? "always" : "user"}>
      <AppLoader
        active={booting}
        fa={fa}
        light={theme === "light"}
        reduced={reduced}
        onLanguage={() => setLang(fa ? "en" : "fa")}
        onTheme={() => setTheme(theme === "dark" ? "light" : "dark")}
      />
      <div
        inert={booting ? true : undefined}
        data-view={route}
        className={`lab-app ${reduced ? "reduced-motion" : ""}`}
        dir={dir}
      >
        <a
          className="skip-link"
          href={testPage ? "#workspace" : "#main-content"}
        >
          {f("رفتن به ابزارها", "Skip to tools")}
        </a>
        <header className="site-header">
          <a
            href={pagePath(lang)}
            onClick={(e) => {
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
              e.preventDefault();
              goPage(false);
            }}
            className="wordmark"
            aria-label="PIMX PASS DNS home"
          >
            <span className="brand-symbol" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <span>
              PIMX<span className="brand-pass">PASS</span>
              <small>DNS LAB</small>
            </span>
          </a>
          <nav
            className="desktop-nav"
            aria-label={f("منوی اصلی", "Main navigation")}
          >
            <a
              href={pagePath(lang)}
              aria-current={route === "home" ? "page" : undefined}
              onClick={(e) => {
                if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
                e.preventDefault();
                goPage(false);
              }}
            >
              {f("خانه", "Home")}
            </a>
            <a
              href={pagePath(lang, true)}
              aria-current={testPage ? "page" : undefined}
              onClick={(e) => {
                if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
                e.preventDefault();
                goPage(true);
              }}
            >
              {f("تست DNS", "DNS test")}
            </a>
            <a
              href={pagePath(lang, "guide")}
              aria-current={guidePage ? "page" : undefined}
              onClick={(e) => {
                if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
                e.preventDefault();
                changeTab("guide");
              }}
            >
              {f("راهنمای تنظیم", "Setup guides")}
            </a>
          </nav>
          <div className="header-actions">
            <button
              className="icon-button command-button"
              onClick={() => setModal("command")}
              aria-label={f("جست‌وجوی سریع", "Quick search")}
              title="Ctrl + K"
            >
              <Search size={19} />
            </button>
            <button
              className="language-button"
              onClick={() => setLang(fa ? "en" : "fa")}
              aria-label={fa ? "Switch to English" : "تغییر زبان به فارسی"}
            >
              {fa ? "EN" : "فا"}
            </button>
            <button
              className="icon-button"
              aria-label={
                theme === "dark"
                  ? f("تم روشن", "Light theme")
                  : f("تم تاریک", "Dark theme")
              }
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? <Sun size={19} /> : <Moon size={19} />}
            </button>
            <button
              className="header-install"
              aria-label={
                installed
                  ? f("برنامه نصب شده", "App installed")
                  : f("نصب برنامه", "Install app")
              }
              onClick={() => setModal("install")}
            >
              <Download size={16} />
              <span>
                {installed
                  ? f("نصب شده", "Installed")
                  : f("نصب اپ", "Install app")}
              </span>
            </button>
          </div>
        </header>
        {!online && (
          <div className="offline-banner" role="status">
            {f(
              "آفلاینی. تاریخچه و راهنماها در دسترس‌اند؛ اسکن به اینترنت نیاز دارد.",
              "You’re offline. History and guides are available; scanning needs a connection.",
            )}
          </div>
        )}
        <main id="main-content">
          <AnimatePresence mode="wait" initial={false}>
            <TransitionSurface
              key={route}
              route
              reduced={reduced}
              onMount={() => {
                if (!focusDestination.current) return;
                document
                  .querySelector<HTMLElement>("#hero-title")
                  ?.focus({ preventScroll: true });
                focusDestination.current = false;
              }}
            >
              {guidePage ? (
                <GuidePage
                  all={all}
                  selected={guideId}
                  onSelect={setGuideId}
                  fa={fa}
                  notify={notify}
                  onBack={() => goPage(true)}
                  testHref={pagePath(lang, true)}
                />
              ) : testPage ? (
                <>
                  <section className="lab-intro">
                    <div>
                      <button
                        className="back-home"
                        onClick={() => goPage(false)}
                      >
                        <ArrowUpRight size={16} />
                        {f("برگشت به خانه", "Back to home")}
                      </button>
                      <h1 id="hero-title" tabIndex={-1}>
                        {f("اتصال خودت را تست کن.", "Test your connection.")}
                      </h1>
                      <p>
                        {f(
                          "شبکه و نوع تست را انتخاب کن؛ نتیجه‌ها همین‌جا، جلوی چشمت می‌آیند.",
                          "Choose your network and test settings. Watch the results arrive here.",
                        )}
                      </p>
                    </div>
                    <button
                      className="motion-control"
                      aria-pressed={reduced}
                      onClick={() => setReduced(!reduced)}
                    >
                      <span className={`toggle-track ${reduced ? "" : "on"}`} />
                      <span>
                        {reduced
                          ? f("حالت سبک", "Lite mode")
                          : f("حرکت فعال", "Motion on")}
                      </span>
                    </button>
                  </section>
                  <section
                    id="workspace"
                    ref={workspace}
                    className="workspace"
                    tabIndex={-1}
                    aria-label={f("ابزارهای DNS", "DNS tools")}
                  >
                    <nav
                      className="workspace-tabs"
                      aria-label={f("ابزارهای آزمایشگاه", "Laboratory tools")}
                    >
                      {tabs.map((t) => (
                        <button
                          key={t.id}
                          className={tab === t.id ? "active" : ""}
                          onClick={() => changeTab(t.id)}
                          aria-current={tab === t.id ? "page" : undefined}
                        >
                          {t.icon}
                          <span>{t.label}</span>
                          {t.id === "history" && history.length > 0 && (
                            <small>{history.length}</small>
                          )}
                        </button>
                      ))}
                    </nav>
                    <AnimatePresence mode="wait" initial={false}>
                      <TransitionSurface key={tab} reduced={reduced}>
                        {tab === "scan" && (
                          <>
                            <div className="purpose-row">
                              <span>
                                {f("برای چه کاری؟", "What matters to you?")}
                              </span>
                              <div className="purpose-options">
                                {purposes.map((p) => (
                                  <button
                                    key={p}
                                    className={purpose === p ? "active" : ""}
                                    disabled={running}
                                    aria-pressed={purpose === p}
                                    onClick={() => setPurpose(p)}
                                  >
                                    {purposeLabel(p)}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <p className="purpose-description">
                              {purposeDescription[purpose]}
                            </p>
                            {scanConfig}
                            <section
                              className="scan-progress"
                              ref={progressRef}
                              aria-label={f("وضعیت اسکن", "Scan progress")}
                            >
                              {running && (
                                <div className="live-scan-scene">
                                  <Suspense fallback={null}>
                                    <NetworkScene
                                      results={results}
                                      scanning
                                      reduced={reduced}
                                      light={theme === "light"}
                                      fa={fa}
                                    />
                                  </Suspense>
                                  <div className="live-scan-readout">
                                    <strong>
                                      {completed}
                                      <span> / {total}</span>
                                    </strong>
                                    <p>
                                      {f("مسیر بررسی شده", "routes checked")}
                                    </p>
                                    <span>
                                      {successCount}{" "}
                                      {f("پاسخ موفق", "responses received")} ·{" "}
                                      {elapsed}s
                                    </span>
                                  </div>
                                </div>
                              )}
                              {(running || results.length > 0 || cancelled) && (
                                <>
                                  <div className="section-heading">
                                    <div>
                                      <h2>
                                        {running
                                          ? f(
                                              "داریم مسیرها را می‌سنجیم…",
                                              "Finding your route…",
                                            )
                                          : cancelled
                                            ? f(
                                                "همین‌جا متوقف شد.",
                                                "Stopped right here.",
                                              )
                                            : f(
                                                "نتیجه اتصال تو.",
                                                "Your connection, measured.",
                                              )}
                                      </h2>
                                      <p className="muted" role="status">
                                        {running
                                          ? `${completed} / ${total} · ${current}`
                                          : `${successCount} ${f("پاسخ موفق از", "responded out of")} ${results.length} · ${elapsed}s`}
                                      </p>
                                    </div>
                                    {running ? (
                                      <button
                                        className="button secondary"
                                        onClick={() => {
                                          controller.current?.abort();
                                        }}
                                      >
                                        <Square size={15} />
                                        {f("توقف تست", "Stop scan")}
                                      </button>
                                    ) : (
                                      results.length > 0 && (
                                        <button
                                          className="button secondary"
                                          onClick={() => setModal("export")}
                                        >
                                          <Download size={17} />
                                          {f(
                                            "خروجی نتیجه‌ها",
                                            "Export results",
                                          )}
                                        </button>
                                      )
                                    )}
                                  </div>
                                  <div
                                    className="progress-track"
                                    role="progressbar"
                                    aria-label={f(
                                      "پیشرفت اسکن",
                                      "Scan completion",
                                    )}
                                    aria-valuemin={0}
                                    aria-valuemax={total || 1}
                                    aria-valuenow={completed}
                                  >
                                    <span
                                      style={{
                                        width: `${total ? (completed / total) * 100 : 0}%`,
                                      }}
                                    />
                                  </div>
                                  <div className="progress-meta">
                                    <span>
                                      {running
                                        ? `${elapsed}s`
                                        : f(
                                            "ذخیره محلی؛ بدون ارسال نام شبکه",
                                            "Saved locally; network label is not sent",
                                          )}
                                    </span>
                                    <span>
                                      {mode === "deep" ? "7" : "3"}{" "}
                                      {f(
                                        "نمونه برای هر DNS",
                                        "samples per resolver",
                                      )}
                                    </span>
                                  </div>
                                </>
                              )}
                              {scanError && (
                                <p className="notice" role="alert">
                                  {scanError}
                                </p>
                              )}
                              {!running && best && (
                                <div className="recommendation">
                                  <div className="recommendation-icon">
                                    <Check size={25} />
                                  </div>
                                  <div>
                                    <span>
                                      {f("پیشنهاد این تست", "This scan’s pick")}
                                    </span>
                                    <h3>{best.name}</h3>
                                    <p>
                                      {scanPurpose === "gaming"
                                        ? f(
                                            "با وزن بیشتر برای نوسان، در پاسخ‌های DoH این تست امتیاز بهتری گرفت.",
                                            "Scored best among this scan’s DoH responses, with more weight on variation.",
                                          )
                                        : f(
                                            "بر اساس زمان پاسخ، نوسان و موفقیت درخواست‌های DoH همین تست انتخاب شد.",
                                            "Selected using response time, variation and successful DoH requests from this scan.",
                                          )}
                                    </p>
                                  </div>
                                  <strong>
                                    {best.latency}
                                    <small> ms</small>
                                  </strong>
                                  <button
                                    className="button primary"
                                    onClick={() => openGuide(best)}
                                  >
                                    {f("تنظیمش کنم", "Set it up")}
                                    <ArrowUpRight size={18} />
                                  </button>
                                </div>
                              )}
                              {!running && results.length > 0 && !best && (
                                <p className="notice">
                                  {f(
                                    "پاسخ معتبر DoH برای پیشنهاد DNS نداریم. اتصال HTTPS به‌تنهایی کیفیت DNS را مشخص نمی‌کند؛ منبع تست یا شبکه را عوض کن.",
                                    "No valid DoH response is available for a DNS recommendation. HTTPS reachability alone does not establish DNS quality. Try another collection or connection.",
                                  )}
                                </p>
                              )}
                            </section>
                          </>
                        )}
                        {(tab === "scan" || tab === "collection") && (
                          <section className="resolver-section">
                            <div className="section-heading">
                              <div>
                                <h2>
                                  {tab === "collection"
                                    ? f(
                                        "یک مجموعه برای مسیرهای تو.",
                                        "A collection for your routes.",
                                      )
                                    : results.length || running
                                      ? f(
                                          "پاسخ‌ها، کنار هم.",
                                          "The responses, side by side.",
                                        )
                                      : f(
                                          "با این مسیرها آشنا شو.",
                                          "Meet your possible routes.",
                                        )}
                                </h2>
                                <p className="muted">
                                  {tab === "collection"
                                    ? f(
                                        "منابع واردشده، DNSهای شخصی و علاقه‌مندی‌ها؛ همه در یک جا.",
                                        "Imported sources, personal resolvers and favorites in one place.",
                                      )
                                    : !results.length && !running
                                      ? f(
                                          "این‌ها پیش‌نمایش مجموعه‌اند؛ هنوز اندازه‌گیری نشده‌اند.",
                                          "A preview of the collection. These entries have not been measured yet.",
                                        )
                                      : f(
                                          "DoH پاسخ واقعی DNS است؛ HTTPS فقط زمان اتصال است.",
                                          "DoH measures a DNS query. HTTPS measures a connection only.",
                                        )}
                                </p>
                              </div>
                              <button
                                className="button secondary"
                                onClick={() => setModal("custom")}
                              >
                                <Plus size={17} />
                                {f("DNS شخصی", "Add resolver")}
                              </button>
                            </div>
                            <div className="resolver-toolbar">
                              <label className="search-field">
                                <Search size={17} />
                                <input
                                  aria-label={f(
                                    "جست‌وجوی DNS",
                                    "Search resolvers",
                                  )}
                                  value={search}
                                  onChange={(e) => setSearch(e.target.value)}
                                  placeholder={f(
                                    "نام، آدرس یا ارائه‌دهنده…",
                                    "Name, address or provider…",
                                  )}
                                />
                              </label>
                              <label className="filter-select">
                                <span className="sr-only">
                                  {f("پروتکل", "Protocol")}
                                </span>
                                <SourceSelect
                                  value={protocol}
                                  onChange={setProtocol}
                                  fa={fa}
                                  label={f("پروتکل", "Protocol")}
                                  options={[
                                    {
                                      value: "all",
                                      label: f(
                                        "همه پروتکل‌ها",
                                        "All protocols",
                                      ),
                                    },
                                    ...[
                                      "plain",
                                      "doh",
                                      "dot",
                                      "dnscrypt",
                                      "odoh",
                                      "doh3",
                                      "doq",
                                      "unknown",
                                    ].map((p) => ({
                                      value: p,
                                      label:
                                        p === "plain"
                                          ? "DNS / IP"
                                          : p.toUpperCase(),
                                    })),
                                  ]}
                                />
                              </label>
                              <label className="filter-select">
                                <span className="sr-only">
                                  {f("مرتب‌سازی", "Sort")}
                                </span>
                                <SourceSelect
                                  value={sort}
                                  onChange={setSort}
                                  fa={fa}
                                  label={f("مرتب‌سازی", "Sort")}
                                  options={[
                                    {
                                      value: "recommended",
                                      label: f("پیشنهادی", "Recommended"),
                                    },
                                    { value: "name", label: f("نام", "Name") },
                                    {
                                      value: "success",
                                      label: f("موفقیت تست", "Test success"),
                                    },
                                  ]}
                                />
                              </label>
                              <button
                                className={`icon-button ${onlyFavorites ? "active" : ""}`}
                                aria-pressed={onlyFavorites}
                                aria-label={f(
                                  "فقط علاقه‌مندی‌ها",
                                  "Favorites only",
                                )}
                                onClick={() => setOnlyFavorites(!onlyFavorites)}
                              >
                                <Star
                                  size={18}
                                  fill={onlyFavorites ? "currentColor" : "none"}
                                />
                              </button>
                            </div>
                            <div className="resolver-list">
                              {list
                                .slice((page - 1) * 20, page * 20)
                                .map((d) => (
                                  <ResolverRow
                                    key={d.id}
                                    dns={d}
                                    result={
                                      tab === "scan"
                                        ? results.find((r) => r.id === d.id)
                                        : undefined
                                    }
                                    fa={fa}
                                    favorite={favorites.includes(d.id)}
                                    selected={selected.includes(d.id)}
                                    onFavorite={() => favorite(d.id)}
                                    onSelect={
                                      tab === "scan" &&
                                      (d as DnsResult).status === "success"
                                        ? () => select(d.id)
                                        : undefined
                                    }
                                    onGuide={() => openGuide(d)}
                                    notify={notify}
                                  />
                                ))}
                              {list.length === 0 && (
                                <div className="empty-state">
                                  <Search size={28} />
                                  <p>
                                    {running
                                      ? f(
                                          "منتظر اولین پاسخ هستیم…",
                                          "Waiting for the first response…",
                                        )
                                      : f(
                                          "چیزی با این فیلتر پیدا نشد. جست‌وجو یا فیلترها را عوض کن.",
                                          "No matching entries. Change your search or filters.",
                                        )}
                                  </p>
                                </div>
                              )}
                            </div>
                            {list.length > 20 && (
                              <div className="pagination">
                                <button
                                  className="button secondary"
                                  disabled={page <= 1}
                                  onClick={() => setPage((p) => p - 1)}
                                >
                                  {f("قبلی", "Previous")}
                                </button>
                                <span>
                                  {page} / {Math.ceil(list.length / 20)}
                                </span>
                                <button
                                  className="button secondary"
                                  disabled={page * 20 >= list.length}
                                  onClick={() => setPage((p) => p + 1)}
                                >
                                  {f("بعدی", "Next")}
                                </button>
                              </div>
                            )}
                            {tab === "collection" && (
                              <Collections
                                collections={collections}
                                favoriteIds={favorites}
                                fa={fa}
                                onSave={(item) => {
                                  const next = [...collections, item];
                                  setCollections(next);
                                  persist("collections", next);
                                  notify(
                                    f(
                                      "مجموعه ذخیره شد؛ از منبع تست هم قابل انتخاب است.",
                                      "Collection saved. It is also available in the scan source selector.",
                                    ),
                                  );
                                }}
                                onDelete={(id) => {
                                  const next = collections.filter(
                                    (c) => c.id !== id,
                                  );
                                  setCollections(next);
                                  persist("collections", next);
                                  if (scope === `collection:${id}`)
                                    setScope("recommended");
                                }}
                                onUse={(id) => {
                                  setScope(`collection:${id}`);
                                  changeTab("scan");
                                  setTimeout(
                                    () =>
                                      document
                                        .getElementById("scan-config-title")
                                        ?.scrollIntoView({
                                          behavior: reduced
                                            ? "instant"
                                            : "smooth",
                                          block: "center",
                                        }),
                                    50,
                                  );
                                }}
                              />
                            )}
                            {tab === "collection" && (
                              <CustomPanel
                                custom={custom}
                                existing={all}
                                fa={fa}
                                onAdd={(items) => {
                                  const next = [...custom, ...items];
                                  setCustom(next);
                                  persist("custom", next);
                                }}
                                onDelete={(id) => {
                                  const next = custom.filter(
                                    (d) => d.id !== id,
                                  );
                                  setCustom(next);
                                  persist("custom", next);
                                }}
                                notify={notify}
                              />
                            )}
                          </section>
                        )}
                        {tab === "history" && (
                          <HistoryPanel
                            history={history}
                            network={network}
                            fa={fa}
                            onOpen={openRecord}
                            onDelete={(id) => {
                              const next = history.filter((r) => r.id !== id);
                              setHistory(next);
                              persist("history", next);
                            }}
                            onClear={() => {
                              setHistory([]);
                              persist("history", []);
                            }}
                          />
                        )}
                        {tab === "domain" && <DomainPanel fa={fa} />}
                        {tab === "status" && <StatusPanel fa={fa} />}
                      </TransitionSurface>
                    </AnimatePresence>
                  </section>
                </>
              ) : (
                <HomePage
                  fa={fa}
                  light={theme === "light"}
                  reduced={reduced}
                  href={pagePath(lang, true)}
                  onStart={(intent) => {
                    if (intent?.purpose) setPurpose(intent.purpose);
                    if (intent?.tab === "guide") goPage("guide");
                    else {
                      setTab(intent?.tab || "scan");
                      goPage(true);
                    }
                  }}
                />
              )}
            </TransitionSurface>
          </AnimatePresence>
        </main>
        <footer className="site-footer">
          <div className="footer-top">
            <div>
              <a
                className="wordmark footer-wordmark"
                href={pagePath(lang)}
                onClick={(e) => {
                  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
                  e.preventDefault();
                  goPage(false);
                }}
              >
                PIMX PASS<span className="footer-dot">.</span>
              </a>
              <p>
                {f(
                  "برای روزهایی که اتصال، ساده پیش نمی‌رود.",
                  "For the days when connecting takes a little more care.",
                )}
              </p>
            </div>
            <div className="footer-links">
              <a
                href="https://github.com/MOHAMMADREZAABEDINPOOR/PIMX_PASS_DNS"
                target="_blank"
                rel="noreferrer"
              >
                GitHub
                <ArrowUpRight size={16} />
              </a>
              <a href="https://x.com/pimxpass" target="_blank" rel="noreferrer">
                PIMX
                <ArrowUpRight size={16} />
              </a>
              <button onClick={() => changeTab("status")}>
                {f("وضعیت سرویس‌ها", "Service health")}
              </button>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} PIMX</span>
            <span>
              {f(
                "با کنجکاوی تست کن. با آگاهی انتخاب کن.",
                "Stay curious. Choose with context.",
              )}
            </span>
            <a href="#hero-title">{f("برگشت به بالا", "Back to top")} ↑</a>
          </div>
        </footer>
        {testPage && selected.length > 0 && tab === "scan" && (
          <div className="comparison-tray">
            <span>
              {selected.length} {f("DNS انتخاب شده", "resolvers selected")}
            </span>
            <button
              className="button primary"
              disabled={selected.length < 2}
              onClick={() => setModal("compare")}
            >
              {f("مقایسه کنار هم", "Compare side by side")}
              <Layers3 size={17} />
            </button>
            <button
              className="icon-button"
              aria-label={f("پاک‌کردن انتخاب", "Clear selection")}
              onClick={() => setSelected([])}
            >
              <X size={19} />
            </button>
          </div>
        )}
        <div
          className={`toast ${toast ? "visible" : ""}`}
          role="status"
          aria-live="polite"
        >
          {toast && (
            <>
              <Check size={17} />
              <span>{toast}</span>
            </>
          )}
        </div>
        {modal === "compare" && (
          <Modal
            title={f(
              "کدام مسیر به تو می‌خورد؟",
              "Which route fits your connection?",
            )}
            wide
            onClose={() => setModal(null)}
          >
            <ComparePanel
              results={selectedResults}
              fa={fa}
              onRemove={(id) => {
                const next = selected.filter((s) => s !== id);
                setSelected(next);
                if (next.length < 2) setModal(null);
              }}
            />
          </Modal>
        )}
        {modal === "export" && (
          <Modal
            title={f("نتیجه‌ها را با خودت ببر.", "Take your results with you.")}
            onClose={() => setModal(null)}
          >
            <ExportPanel results={ranked} fa={fa} notify={notify} />
          </Modal>
        )}
        {modal === "custom" && (
          <Modal
            title={f("مجموعه شخصی تو", "Your personal collection")}
            onClose={() => setModal(null)}
          >
            <CustomPanel
              custom={custom}
              existing={all}
              fa={fa}
              notify={notify}
              onAdd={(items) => {
                const next = [...custom, ...items];
                setCustom(next);
                persist("custom", next);
              }}
              onDelete={(id) => {
                const next = custom.filter((d) => d.id !== id);
                setCustom(next);
                persist("custom", next);
              }}
            />
          </Modal>
        )}
        {modal === "install" && (
          <Modal
            title={f("آزمایشگاه، همیشه دم دست.", "Your lab, a tap away.")}
            onClose={() => setModal(null)}
          >
            <div className="install-content">
              <Smartphone size={42} />
              <p>
                {installed
                  ? f(
                      "برنامه روی این دستگاه نصب شده است.",
                      "The app is installed on this device.",
                    )
                  : f(
                      "سایت را به صفحه اصلی اضافه کن. بعد از اولین بارگذاری آنلاین، راهنماها و تاریخچه ذخیره‌شده آفلاین هم در دسترس‌اند.",
                      "Add the site to your home screen. After an online visit, guides and saved history are available offline.",
                    )}
              </p>
              {installEvent && !installed ? (
                <button
                  className="button primary"
                  onClick={async () => {
                    await installEvent.prompt();
                    const result = await installEvent.userChoice;
                    if (result.outcome === "accepted") setInstallEvent(null);
                  }}
                >
                  {f("نصب PIMX PASS", "Install PIMX PASS")}
                  <Download size={18} />
                </button>
              ) : (
                !installed && (
                  <p className="notice">
                    {f(
                      "در iPhone: منوی Share ← Add to Home Screen. در Android و دسکتاپ: منوی مرورگر ← Install app یا افزودن به صفحه اصلی. این گزینه باید توسط مرورگر پشتیبانی شود.",
                      "On iPhone: Share → Add to Home Screen. On Android and desktop: browser menu → Install app or Add to Home screen, when supported.",
                    )}
                  </p>
                )
              )}
            </div>
          </Modal>
        )}
        {modal === "command" && (
          <Modal
            title={f("دنبال چی می‌گردی؟", "What are you looking for?")}
            onClose={() => setModal(null)}
          >
            <label className="search-field command-search">
              <Search size={20} />
              <input
                autoFocus
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                placeholder={f(
                  "DNS، تاریخچه یا راهنما…",
                  "Resolver, history or guide…",
                )}
                aria-label={f("جست‌وجوی سریع", "Quick search")}
              />
            </label>
            <div className="command-results">
              {tabs
                .filter(
                  (t) =>
                    !command ||
                    `${t.label} ${t.id}`
                      .toLowerCase()
                      .includes(command.toLowerCase()),
                )
                .map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      changeTab(t.id);
                      setModal(null);
                    }}
                  >
                    {t.icon}
                    {t.label}
                    <ArrowUpRight size={16} />
                  </button>
                ))}
              {command &&
                all
                  .filter((d) =>
                    `${d.name} ${d.primary}`
                      .toLowerCase()
                      .includes(command.toLowerCase()),
                  )
                  .slice(0, 6)
                  .map((d) => (
                    <button
                      key={d.id}
                      onClick={() => {
                        openGuide(d);
                        setModal(null);
                      }}
                    >
                      <Globe2 size={17} />
                      <span dir="auto">{d.name}</span>
                      <ArrowUpRight size={16} />
                    </button>
                  ))}
            </div>
          </Modal>
        )}
      </div>
    </MotionConfig>
  );
}

export default function App() {
  const isAdmin = window.location.pathname
    .replace(/\/+$/, "")
    .endsWith("/pimxpassdnsadmin");
  useEffect(() => {
    if (isAdmin) {
      document
        .querySelector('meta[name="robots"]')
        ?.setAttribute("content", "noindex, nofollow, noarchive");
      document
        .querySelector('meta[name="googlebot"]')
        ?.setAttribute("content", "noindex, nofollow");
    }
  }, [isAdmin]);
  return isAdmin ? (
    <div className="legacy-admin">
      <Suspense fallback={<p>Loading…</p>}>
        <Admin />
      </Suspense>
    </div>
  ) : (
    <Laboratory />
  );
}
