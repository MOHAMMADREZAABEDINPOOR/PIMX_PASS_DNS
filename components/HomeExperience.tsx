import React, { useId, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useInView,
  useScroll,
  useTransform,
} from "framer-motion";
import {
  ArrowUpRight,
  Download,
  Gamepad2,
  Globe2,
  History,
  Layers3,
  Monitor,
  ShieldCheck,
  SlidersHorizontal,
  Smartphone,
  Users,
  Wifi,
} from "lucide-react";
import type { Purpose } from "../services/catalog";
import "../home-experience.css";

export type HomeIntent = {
  purpose?: Purpose;
  tab?: "scan" | "history" | "collection" | "guide";
};
type Props = {
  fa: boolean;
  reduced: boolean;
  href: string;
  onStart: (intent?: HomeIntent) => void;
};
const ease = [0.22, 1, 0.36, 1] as const;

function OpenLab({
  href,
  onStart,
  intent,
  children,
}: Props & { intent?: HomeIntent; children: React.ReactNode }) {
  return (
    <a
      className="experience-link"
      href={
        intent?.tab === "guide" ? href.replace(/\/test\/?$/, "/guide/") : href
      }
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey || e.button !== 0)
          return;
        e.preventDefault();
        onStart(intent);
      }}
    >
      {children}
      <ArrowUpRight size={19} />
    </a>
  );
}

export function SignalJourney({ fa, reduced }: Pick<Props, "fa" | "reduced">) {
  const [step, setStep] = useState(0);
  const root = useRef<HTMLElement>(null);
  const visible = useInView(root, { amount: 0.15 });
  const f = (a: string, b: string) => (fa ? a : b);
  const id = useId().replaceAll(":", "");
  const steps = [
    {
      icon: Monitor,
      title: f("از دستگاه تو", "From your device"),
      body: f(
        "نام یک سایت را وارد می‌کنی. مرورگر برای رسیدن به آن، به آدرس IP نیاز دارد. اگر پاسخ در حافظه نباشد، درخواست DNS شروع می‌شود.",
        "You enter a website name. Your browser needs its IP address to reach it. If there is no cached answer, a DNS request begins.",
      ),
      label: f(
        "پرسش: آدرس این سایت چیست؟",
        "Question: what is this site's address?",
      ),
    },
    {
      icon: Layers3,
      title: f("تا سرور DNS", "To the DNS resolver"),
      body: f(
        "سرور DNS دنبال پاسخ می‌گردد؛ گاهی آن را از حافظه برمی‌گرداند و گاهی از سرورهای دیگر می‌پرسد. مسیر شبکه و همین جست‌وجو روی زمان پاسخ اثر دارند.",
        "The resolver looks for the answer, either in its cache or by asking other servers. Both the network route and that lookup affect the response time.",
      ),
      label: f("جست‌وجو و برگرداندن آدرس", "Look up and return the address"),
    },
    {
      icon: Globe2,
      title: f("و بعد، خود سایت", "Then, the website"),
      body: f(
        "با دریافت آدرس، مرورگر می‌تواند به سایت وصل شود. تست ما زمان پاسخ DNS را بررسی می‌کند؛ بارگذاری کامل سایت و سرعت دانلود اندازه‌گیری جداگانه‌ای دارند.",
        "Once it has the address, your browser can connect to the website. Our DNS test measures the DNS response; full page loading and download speed need separate measurements.",
      ),
      label: f(
        "حالا مرورگر مقصد را می‌شناسد",
        "Now your browser knows the destination",
      ),
    },
  ];
  return (
    <section
      ref={root}
      className={`home-signal home-exp-section ${visible && !reduced ? "is-viewing" : ""}`}
      aria-labelledby="signal-title"
    >
      <div className="experience-heading">
        <h2 id="signal-title">
          {f("پشت هر آدرس،", "Behind every address,")}
          <br />
          {f("یک رفت‌وبرگشت هست.", "there is a round trip.")}
        </h2>
        <p>
          {f(
            "روی هر بخش بزن و مسیر را دنبال کن. این تصویر، روند کار را توضیح می‌دهد؛ تست زنده نیست.",
            "Choose a stop and follow the request. This is an explanation of the process, not a live test.",
          )}
        </p>
      </div>
      <div className="signal-stage" data-step={step} aria-hidden="true">
        <svg viewBox="0 0 960 310" fill="none" className="signal-diagram">
          <defs>
            <path id={`${id}-out`} d="M175 160 C270 160 300 125 414 125" />
            <path id={`${id}-back`} d="M414 165 C300 165 270 160 175 160" />
            <path id={`${id}-web`} d="M546 155 C660 155 690 155 790 155" />
          </defs>
          <motion.circle
            className="signal-focus"
            initial={false}
            animate={{
              cx: [123, 480, 845][step],
              cy: [145, 140, 150][step],
              r: step === 1 ? 88 : 73,
            }}
            transition={{ duration: reduced ? 0 : 0.7, ease }}
          />
          <path
            d="M175 160 C270 160 300 125 414 125 M414 165 C300 165 270 160 175 160 M546 155 H790"
            className="signal-wire"
          />
          <path
            d="M175 160 C270 160 300 125 414 125 M414 165 C300 165 270 160 175 160 M546 155 H790"
            className="signal-flow"
          />
          {visible &&
            !reduced &&
            ["out", "back", "web"].map((route, i) => (
              <circle key={route} r="4" className="signal-packet">
                <animateMotion dur={`${3 + i * 0.5}s`} repeatCount="indefinite">
                  <mpath href={`#${id}-${route}`} />
                </animateMotion>
              </circle>
            ))}
          <g className={`signal-node ${step === 0 ? "active" : ""}`}>
            <rect x="70" y="104" width="105" height="76" rx="10" />
            <path d="M122 180 V199 M100 200 H145" />
            <rect
              x="83"
              y="118"
              width="79"
              height="47"
              rx="3"
              className="signal-screen"
            />
            <path d="m110 137 7 7-7 7 M127 151 H140" />
          </g>
          <g
            className={`signal-node signal-resolver ${step === 1 ? "active" : ""}`}
          >
            <path d="m480 64 66 38v76l-66 38-66-38v-76z" />
            <path d="m414 102 66 38 66-38 M480 140v76" />
            <path d="m480 90 43 25-43 25-43-25z" className="signal-core-face" />
            <circle cx="480" cy="115" r="8" className="signal-core-dot" />
          </g>
          <g className={`signal-node ${step === 2 ? "active" : ""}`}>
            <rect x="790" y="102" width="110" height="91" rx="10" />
            <path d="M790 122H900" />
            <circle cx="803" cy="112" r="2" />
            <circle cx="811" cy="112" r="2" />
            <circle cx="819" cy="112" r="2" />
            <circle cx="845" cy="157" r="22" />
            <ellipse cx="845" cy="157" rx="10" ry="22" />
            <path d="M823 157h44" />
          </g>
          <text x="123" y="248">
            {f("دستگاه تو", "Your device")}
          </text>
          <text x="480" y="248">
            DNS resolver
          </text>
          <text x="845" y="248">
            {f("سایت مقصد", "The website")}
          </text>
        </svg>
        <div className="signal-caption">
          <span className="signal-live-dot" />
          {steps[step].label}
        </div>
      </div>
      <div className="signal-explanation">
        <div
          className="signal-controls"
          role="group"
          aria-label={f("مراحل مسیر DNS", "DNS journey stops")}
        >
          {steps.map((item, i) => {
            const Icon = item.icon;
            return (
              <button
                key={i}
                aria-pressed={step === i}
                onClick={() => setStep(i)}
              >
                <Icon size={20} />
                <span>{item.title}</span>
                <span className="signal-step">
                  {fa ? ["۱", "۲", "۳"][i] : i + 1}
                </span>
              </button>
            );
          })}
        </div>
        <motion.div
          layout
          className="signal-detail"
          aria-live="polite"
          transition={{ duration: reduced ? 0 : 0.32, ease }}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step}
              initial={reduced ? false : { opacity: 0, y: 7 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: reduced ? 0 : 0.2, ease }}
            >
              <h3>{steps[step].title}</h3>
              <p>{steps[step].body}</p>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}

export function PurposeExplorer(props: Props) {
  const { fa, reduced } = props;
  const [purpose, setPurpose] = useState<Purpose>("daily");
  const root = useRef<HTMLElement>(null);
  const visible = useInView(root, { amount: 0.15 });
  const { scrollYProgress } = useScroll({
    target: root,
    offset: ["start end", "end start"],
  });
  const rotateX = useTransform(scrollYProgress, [0, 1], [16, -5]);
  const rotateY = useTransform(scrollYProgress, [0, 1], [-12, 8]);
  const f = (a: string, b: string) => (fa ? a : b);
  const options = [
    {
      value: "daily" as const,
      icon: Wifi,
      label: f("روزمره", "Everyday"),
      title: f(
        "برای کارهایی که هر روز داری.",
        "For the things you do every day.",
      ),
      body: f(
        "وقتی بین کار، درس و وب‌گردی جابه‌جا می‌شوی، پاسخ سریع و یکنواخت هر دو مهم‌اند. این حالت زمان پاسخ، نوسان و تعداد پاسخ‌های موفق را کنار هم می‌سنجد.",
        "Between work, study and browsing, both quick and consistent responses matter. This mode weighs response time, variation and successful requests together.",
      ),
      focus: f(
        "سرعت و پایداری در کنار هم",
        "Response time and consistency together",
      ),
      boundary: f(
        "نتیجه مربوط به همین شبکه و زمان تست است.",
        "A result describes this network at the time of the test.",
      ),
    },
    {
      value: "gaming" as const,
      icon: Gamepad2,
      label: f("بازی", "Gaming"),
      title: f(
        "وقتی نوسان برایت مهم‌تر است.",
        "When consistency matters most.",
      ),
      body: f(
        "این حالت به یکنواختی پاسخ‌ها وزن بیشتری می‌دهد. DNSها را روی اتصال خودت مقایسه کن و ببین کدام پاسخ منظم‌تری دارد.",
        "This mode gives more weight to consistent responses. Compare resolvers on your connection to see which responds more steadily.",
      ),
      focus: f("توجه بیشتر به نوسان پاسخ", "More weight on response variation"),
      boundary: f(
        "تغییر DNS، کاهش پینگ داخل بازی را تضمین نمی‌کند.",
        "Changing DNS does not guarantee lower in-game latency.",
      ),
    },
    {
      value: "privacy" as const,
      icon: ShieldCheck,
      label: f("حریم خصوصی", "Privacy"),
      title: f(
        "اول، سیاست ارائه‌دهنده را بخوان.",
        "Start with the provider's policy.",
      ),
      body: f(
        "فهرست به گزینه‌های دارای برچسب حریم خصوصی محدود می‌شود. نتیجهٔ سرعت را همراه با منبع اطلاعات و سیاست نگهداری دادهٔ هر ارائه‌دهنده بخوان.",
        "The list is narrowed to entries tagged for privacy. Read the speed result alongside the source and the provider's data-retention policy.",
      ),
      focus: f(
        "فیلتر بر اساس اطلاعات فهرست",
        "Filter by the catalog's privacy tags",
      ),
      boundary: f(
        "این برچسب‌ها تأیید مستقل سیاست حریم خصوصی نیستند.",
        "Catalog tags are not an independent privacy audit.",
      ),
    },
    {
      value: "family" as const,
      icon: Users,
      label: f("خانواده", "Family"),
      title: f(
        "گزینه‌هایی با حالت خانواده.",
        "Options with a family-filtering mode.",
      ),
      body: f(
        "فقط نسخه‌هایی وارد تست می‌شوند که حالت خانوادهٔ آن‌ها در منابع مشخص شده است. جزئیات فیلتر هر سرویس را قبل از تنظیم ببین.",
        "Only variants documented as family-filtering options enter the test. Check what each provider filters before setting it up.",
      ),
      focus: f(
        "نسخه‌های مشخص‌شده برای خانواده",
        "Documented family-filtering variants",
      ),
      boundary: f(
        "فیلتر DNS جای همراهی و تنظیمات ایمنی دستگاه را نمی‌گیرد.",
        "DNS filtering is one part of a device's family-safety settings.",
      ),
    },
  ];
  const selected = options.find((o) => o.value === purpose)!;
  const SelectedIcon = selected.icon;
  return (
    <section
      ref={root}
      className={`home-purpose home-exp-section ${visible && !reduced ? "is-viewing" : ""}`}
      aria-labelledby="purpose-title"
    >
      <div className="purpose-copy">
        <h2 id="purpose-title">
          {f("اینترنت تو،", "Your connection,")}
          <br />
          {f("اولویت تو.", "your priorities.")}
        </h2>
        <p className="purpose-intro">
          {f(
            "قرار نیست یک گزینه برای همه بهترین باشد. از چیزی شروع کن که برای خودت مهم است.",
            "There is no single pick for everyone. Start with what matters to you.",
          )}
        </p>
        <div
          className="purpose-switch"
          role="group"
          aria-label={f("انتخاب هدف تست", "Choose a test purpose")}
        >
          {options.map((o) => {
            const Icon = o.icon;
            return (
              <button
                key={o.value}
                onClick={() => setPurpose(o.value)}
                aria-pressed={purpose === o.value}
              >
                <Icon size={19} />
                {o.label}
              </button>
            );
          })}
        </div>
        <motion.div
          layout
          className="purpose-description"
          aria-live="polite"
          transition={{ duration: reduced ? 0 : 0.32, ease }}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={purpose}
              initial={reduced ? false : { opacity: 0, y: 7 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: reduced ? 0 : 0.2, ease }}
            >
              <h3>{selected.title}</h3>
              <p>{selected.body}</p>
            </motion.div>
          </AnimatePresence>
        </motion.div>
        <OpenLab {...props} intent={{ purpose }}>
          {f("تست با همین اولویت", "Test with this priority")}
        </OpenLab>
      </div>
      <div className="purpose-instrument">
        <div className="purpose-perspective" aria-hidden="true">
          <motion.div
            className="purpose-deck"
            style={reduced ? {} : { rotateX, rotateY }}
          >
            <div className="instrument-float">
              <div className="instrument-plane plane-back">
                <span />
                <span />
                <span />
              </div>
              <div className="instrument-plane plane-middle">
                <svg viewBox="0 0 320 240" fill="none">
                  <path d="M30 120h70l24-50 36 95 31-73 24 28h75" />
                  <circle cx="160" cy="120" r="78" />
                  <circle cx="160" cy="120" r="104" strokeDasharray="3 12" />
                </svg>
              </div>
              <div className={`instrument-face face-${purpose}`}>
                <div className="instrument-orbit" />
                <div className="instrument-emblem">
                  <AnimatePresence initial={false} mode="sync">
                    <motion.span
                      key={purpose}
                      initial={
                        reduced
                          ? false
                          : { opacity: 0, scale: 0.85, rotate: -12 }
                      }
                      animate={{ opacity: 1, scale: 1, rotate: 0 }}
                      exit={{ opacity: 0, scale: 0.85, rotate: 12 }}
                      transition={{ duration: reduced ? 0 : 0.3, ease }}
                    >
                      <SelectedIcon size={48} strokeWidth={1.2} />
                    </motion.span>
                  </AnimatePresence>
                </div>
                <span className="instrument-name">{selected.label}</span>
                <span className="instrument-brand">PIMX / DNS LAB</span>
              </div>
            </div>
          </motion.div>
        </div>
        <div className="purpose-instrument-caption">
          <span>
            <SelectedIcon size={18} />
            {selected.focus}
          </span>
          <p>{selected.boundary}</p>
        </div>
      </div>
    </section>
  );
}

export function ToolkitTour(props: Props) {
  const { fa, reduced } = props;
  const [active, setActive] = useState(0);
  const root = useRef<HTMLElement>(null);
  const visible = useInView(root, { amount: 0.15 });
  const f = (a: string, b: string) => (fa ? a : b);
  const tools = [
    {
      icon: SlidersHorizontal,
      name: f("مقایسه", "Compare"),
      title: f("قبل از انتخاب، کنار هم ببین.", "See the options side by side."),
      body: f(
        "تا چهار نتیجه را انتخاب کن. زمان پاسخ، نوسان و موفقیت درخواست‌ها کنار هم دیده می‌شوند تا انتخابت فقط بر اساس یک عدد نباشد.",
        "Select up to four results. Compare response time, variation and successful requests alongside each other.",
      ),
      action: f("شروع تست و مقایسه", "Start a test and compare"),
      tab: "scan" as const,
    },
    {
      icon: History,
      name: f("تاریخچه", "History"),
      title: f(
        "امروز را با دفعهٔ قبل بسنج.",
        "Compare today with your last test.",
      ),
      body: f(
        "برای شبکه‌ات یک نام بگذار. نتیجه‌ها در همین مرورگر می‌مانند و می‌توانی دو تست را انتخاب کنی تا تغییرات اتصال را ببینی.",
        "Give your network a name. Results stay in this browser; choose two saved tests to compare changes in your connection.",
      ),
      action: f("بازکردن تاریخچه", "Open your history"),
      tab: "history" as const,
    },
    {
      icon: Download,
      name: f("خروجی", "Export"),
      title: f("نتیجه‌ای که با خودت می‌بری.", "Take the results with you."),
      body: f(
        "بعد از تست، گزارش JSON، CSV، TXT یا تصویر بگیر؛ یا آدرس DNS انتخاب‌شده را با QR منتقل کن. گزارش اشتراکی، نام شبکه و IP شخصی‌ات را ندارد.",
        "After a scan, export JSON, CSV, TXT or an image, or transfer the chosen resolver address with a QR code. Shared reports omit your network label and personal IP.",
      ),
      action: f("تست و ساخت گزارش", "Test and create a report"),
      tab: "scan" as const,
    },
    {
      icon: Smartphone,
      name: f("راهنمای تنظیم", "Device setup"),
      title: f("از نتیجه تا تنظیم دستگاه.", "From a result to your device."),
      body: f(
        "راهنمای ویندوز، اندروید، آیفون، مک و مرورگر را باز کن. مقدار مناسب هر دستگاه و روش برگشت به تنظیم قبلی، همان‌جا توضیح داده شده است.",
        "Open a guide for Windows, Android, iPhone, Mac or your browser. Each guide explains the compatible setting and how to return to your previous configuration.",
      ),
      action: f("دیدن راهنمای دستگاه‌ها", "Explore device guides"),
      tab: "guide" as const,
    },
  ];
  const tool = tools[active];
  const Icon = tool.icon;
  return (
    <section
      ref={root}
      className={`home-toolkit home-exp-section ${visible && !reduced ? "is-viewing" : ""}`}
      aria-labelledby="toolkit-title"
    >
      <div className="experience-heading">
        <h2 id="toolkit-title">
          {f("تست، تازه شروع ماجراست.", "A test is just the beginning.")}
        </h2>
        <p>
          {f(
            "نتیجه را بخوان، نگه دار و وقتی آماده بودی، روی دستگاهت تنظیم کن.",
            "Read the result, keep a copy and follow a setup guide when you are ready.",
          )}
        </p>
      </div>
      <div className="toolkit-layout">
        <div
          className="toolkit-switch"
          role="group"
          aria-label={f("امکانات آزمایشگاه", "Laboratory features")}
        >
          {tools.map((t, i) => {
            const ToolIcon = t.icon;
            return (
              <button
                key={t.name}
                aria-pressed={active === i}
                onClick={() => setActive(i)}
              >
                <ToolIcon size={23} />
                <span>{t.name}</span>
                <ArrowUpRight size={18} />
              </button>
            );
          })}
        </div>
        <div className="toolkit-display">
          <div
            className={`toolkit-art toolkit-art-${active}`}
            aria-hidden="true"
          >
            <svg viewBox="0 0 540 200" fill="none">
              <path
                className="toolkit-art-track"
                d="M25 170H515 M25 110H515 M25 50H515"
              />
              {active === 0 ? (
                <>
                  {[75, 130, 185].map((x, i) => (
                    <g key={x} className={`toolkit-column column-${i}`}>
                      <rect
                        x={x * 2 - 70}
                        y={40 + i * 20}
                        width="70"
                        height={130 - i * 20}
                        rx="9"
                      />
                      <path
                        d={`M${x * 2 - 52} ${75 + i * 20}h34 M${x * 2 - 52} ${92 + i * 20}h22`}
                      />
                    </g>
                  ))}
                </>
              ) : active === 1 ? (
                <>
                  <path
                    className="toolkit-trace trace-back"
                    d="M25 125Q75 40 120 100T215 75T310 110T405 60T515 100"
                  />
                  <path
                    className="toolkit-trace"
                    d="M25 150Q75 80 120 135T215 110T310 140T405 90T515 125"
                  />
                  <circle cx="310" cy="140" r="6" className="toolkit-point" />
                </>
              ) : active === 2 ? (
                <>
                  {[0, 1, 2].map((i) => (
                    <g
                      key={i}
                      className={`toolkit-file file-${i}`}
                      transform={`translate(${105 + i * 125} ${32 + Math.abs(1 - i) * 14})`}
                    >
                      <path d="M0 0h53l24 24v107H0z" />
                      <path d="M53 0v24h24 M17 57h42 M17 74h42 M17 91h24" />
                      <text x="38" y="150">
                        {["JSON", "CSV", "TXT"][i]}
                      </text>
                    </g>
                  ))}
                </>
              ) : (
                <>
                  <rect x="95" y="25" width="200" height="122" rx="10" />
                  <path d="M195 147v26 M160 173h70 M110 42h170 M140 75h75 M140 94h110 M140 113h55" />
                  <rect x="335" y="47" width="70" height="130" rx="12" />
                  <path d="M356 60h28 M352 87h36 M352 105h28 M352 123h33" />
                  <path className="toolkit-trace" d="M295 100h40" />
                </>
              )}
            </svg>
            <span className="toolkit-example">
              {f(
                "نمای توضیحی امکانات؛ دادهٔ تست نیست",
                "Feature illustration, not test data",
              )}
            </span>
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={active}
              className="toolkit-description"
              initial={reduced ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduced ? 0 : 0.18, ease }}
              aria-live="polite"
            >
              <Icon size={26} />
              <h3>{tool.title}</h3>
              <p>{tool.body}</p>
              <OpenLab {...props} intent={{ tab: tool.tab }}>
                {tool.action}
              </OpenLab>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
