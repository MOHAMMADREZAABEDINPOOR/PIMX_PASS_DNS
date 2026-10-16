import React, { lazy, Suspense, useId, useState } from "react";
import { motion } from "framer-motion";
import {
  SignalJourney,
  PurposeExplorer,
  ToolkitTour,
  type HomeIntent,
} from "./HomeExperience";
import {
  Activity,
  ArrowDown,
  ArrowUpRight,
  Check,
  ChevronDown,
  CircleHelp,
  Fingerprint,
  Globe2,
  Layers3,
  LockKeyhole,
  Radio,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
const NetworkScene = lazy(() => import("./NetworkScene"));
const ease = [0.22, 1, 0.36, 1] as const;

export function FAQ({ fa }: { fa: boolean }) {
  const [opened, setOpened] = useState<number | null>(0);
  const prefix = useId().replaceAll(":", "");
  const f = (a: string, b: string) => (fa ? a : b);
  const items = [
    {
      icon: SlidersHorizontal,
      question: f(
        "این سایت DNS دستگاه را عوض می‌کند؟",
        "Does this site change my device DNS?",
      ),
      answer: f(
        "نه؛ اینجا فقط تست می‌کنی و نتیجه‌ها را می‌بینی. اگر خواستی DNS را عوض کنی، راهنمای مخصوص گوشی یا کامپیوترت را باز کن. مراحل تنظیم و برگشت به حالت قبل، هر دو داخل راهنما هستند.",
        "No. You run a test and read the results here. To change your DNS, open the guide for your phone or computer. It includes both setup and how to undo the change.",
      ),
    },
    {
      icon: Radio,
      question: f(
        "چرا بعضی DNSها جواب نمی‌دهند؟",
        "Why do some resolvers not respond?",
      ),
      answer: f(
        "ممکن است آدرس قدیمی شده باشد، شبکه به آن دسترسی نداشته باشد یا مرورگر جلوی درخواست را بگیرد. ما این حالت را «پاسخ دریافت نشد» نشان می‌دهیم؛ از یک تست ناموفق نمی‌شود نتیجه گرفت کل سرویس قطع است.",
        "An address may be outdated, unreachable on your network, or blocked by browser policy. We show “no response received”; a failed browser request alone does not establish a service outage.",
      ),
    },
    {
      icon: LockKeyhole,
      question: f(
        "اطلاعات تست‌ها کجا می‌ماند؟",
        "Where are my results stored?",
      ),
      answer: f(
        "تاریخچه، نامی که برای شبکه می‌گذاری و علاقه‌مندی‌ها داخل همین مرورگر می‌مانند. خودِ درخواست تست به ارائه‌دهنده DNS ارسال می‌شود. فایل گزارشی که خروجی می‌گیری، نام شبکه و IP شخصی تو را ندارد.",
        "Your history, network labels and favorites stay in this browser. The test query itself goes to the DNS provider. Exported reports omit your network label and personal IP.",
      ),
    },
    {
      icon: Activity,
      question: f(
        "برای بازی کدام DNS بهتر است؟",
        "Which DNS is best for gaming?",
      ),
      answer: f(
        "جواب برای همه یکسان نیست. حالت بازی در رتبه‌بندی به نوسان پاسخ وزن بیشتری می‌دهد. اما پینگ داخل بازی به مسیر سرور بازی هم بستگی دارد؛ این تست آن مسیر را اندازه نمی‌گیرد و کاهش پینگ را تضمین نمی‌کند.",
        "There is no single answer for every connection. Gaming mode gives response variation more weight. In-game latency also depends on the game-server route, which this test does not measure. Lower game ping is not guaranteed.",
      ),
    },
  ];
  return (
    <section className="home-faq" id="questions" aria-labelledby="faq-heading">
      <div className="faq-intro">
        <CircleHelp size={34} />
        <h2 id="faq-heading">
          {f("قبل از شروع،", "Before you begin,")}
          <br />
          {f("این‌ها را بدان.", "a few things to know.")}
        </h2>
        <p>
          {f(
            "اگر قرار است تنظیمی را عوض کنی، بهتر است اول بدانی این تست چه چیزی به تو می‌گوید.",
            "A clearer idea of the test makes it easier to decide what to change.",
          )}
        </p>
        <a href="#how-it-works">
          {f("بیشتر درباره روش تست", "More about the test")}
          <ArrowDown size={17} />
        </a>
      </div>
      <div className="faq-disclosures">
        {items.map((item, i) => {
          const Icon = item.icon;
          const expanded = opened === i;
          return (
            <article
              className={`faq-disclosure ${expanded ? "is-expanded" : ""}`}
              key={item.question}
            >
              <h3>
                <button
                  aria-expanded={expanded}
                  aria-controls={`${prefix}-answer-${i}`}
                  id={`${prefix}-question-${i}`}
                  onClick={() => setOpened(expanded ? null : i)}
                >
                  <span className="faq-question-icon">
                    <Icon size={20} />
                  </span>
                  <span>{item.question}</span>
                  <span className="faq-expander">
                    <ChevronDown size={18} />
                  </span>
                </button>
              </h3>
              <div
                className="faq-answer-grid"
                aria-hidden={!expanded}
                inert={!expanded ? true : undefined}
              >
                <div>
                  <div
                    className="faq-answer"
                    id={`${prefix}-answer-${i}`}
                    role="region"
                    aria-labelledby={`${prefix}-question-${i}`}
                  >
                    <p>{item.answer}</p>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export function HomePage({
  fa,
  light,
  reduced,
  href,
  onStart,
}: {
  fa: boolean;
  light: boolean;
  reduced: boolean;
  href: string;
  onStart: (intent?: HomeIntent) => void;
}) {
  const f = (a: string, b: string) => (fa ? a : b);
  const start = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0)
      return;
    e.preventDefault();
    onStart();
  };
  return (
    <>
      <section className="home-hero" aria-labelledby="hero-title">
        <div className="home-hero-copy">
          <h1 id="hero-title" tabIndex={-1}>
            <span>{f("DNS را با", "Your internet.")}</span>
            <span>{f("اینترنتت بسنج.", "Your DNS.")}</span>
          </h1>
          <p className="home-lead">
            {f(
              "یک DNS روی اینترنت دوستت خوب جواب می‌دهد؛ روی اینترنت تو شاید نه. اینجا چند گزینه را با اتصال خودت تست می‌کنی و با دیدن نتیجه‌ها تصمیم می‌گیری.",
              "A DNS that works well for someone else may feel different on your connection. Test a few options on your own internet, then choose with the results in front of you.",
            )}
          </p>
          <div className="home-hero-actions">
            <a
              href={href}
              onClick={start}
              className="button primary home-start"
            >
              <span>{f("شروع تست DNS", "Start DNS test")}</span>
              <ArrowUpRight size={21} />
            </a>
            <a href="#how-it-works" className="home-secondary-link">
              {f("تست چطور کار می‌کند؟", "How does the test work?")}
              <ArrowDown size={17} />
            </a>
          </div>
          <p className="home-privacy-note">
            <ShieldCheck size={17} />
            {f(
              "بدون ثبت‌نام؛ تنظیمات دستگاهت هم دست نمی‌خورد.",
              "No account needed. Your device settings stay as they are.",
            )}
          </p>
        </div>
        <div className="home-hero-scene">
          <Suspense
            fallback={
              <div className="scene-placeholder" role="status">
                <span className="mini-orbit" />
                {f("آماده‌کردن نمای اتصال…", "Preparing your connection view…")}
              </div>
            }
          >
            <NetworkScene
              results={[]}
              scanning={false}
              reduced={reduced}
              light={light}
              fa={fa}
            />
          </Suspense>
          <div className="scene-signature">
            <span>PIMX</span>
            <span>PASS</span>
          </div>
        </div>
      </section>
      <div className="home-proof-strip">
        <span>
          <Radio size={18} />
          {f("درخواست واقعی DNS با DoH", "Real DNS queries over DoH")}
        </span>
        <span>
          <Layers3 size={18} />
          {f("مقایسه نتیجه‌ها کنار هم", "Compare results side by side")}
        </span>
        <span>
          <Fingerprint size={18} />
          {f("تاریخچه روی دستگاه خودت", "History stays on your device")}
        </span>
      </div>
      <section className="home-explainer" id="how-it-works">
        <div className="home-explainer-intro">
          <h2>
            {f("یک اسم می‌نویسی.", "You type a name.")}
            <br />
            {f("DNS آدرسش را پیدا می‌کند.", "DNS finds the address.")}
          </h2>
          <p>
            {f(
              "وقتی نام یک سایت را وارد می‌کنی، DNS کمک می‌کند مرورگر آدرس آن را پیدا کند. زمان و یکنواختی این پاسخ‌ها را می‌شود مقایسه کرد. PIMX PASS همین کار را روی اینترنت خودت انجام می‌دهد.",
              "When you enter a website name, DNS helps your browser find its address. The response time and consistency can be compared. PIMX PASS measures those on your own connection.",
            )}
          </p>
          <div
            className="dns-journey"
            role="img"
            aria-label={f(
              "نام سایت به درخواست DNS و سپس آدرس تبدیل می‌شود",
              "A website name becomes a DNS query and then an address",
            )}
          >
            <span>example.com</span>
            <i aria-hidden="true" />
            <span className="journey-resolver">DNS</span>
            <i aria-hidden="true" />
            <span>93.184.216.34</span>
          </div>
          <p className="journey-caption">
            {f(
              "فقط یک مثال برای توضیح مسیر؛ نتیجه تست نیست.",
              "An example of the process, not a measured result.",
            )}
          </p>
        </div>
        <ol className="home-process">
          {[
            {
              icon: Globe2,
              title: f("اتصالت را مشخص کن", "Choose your connection"),
              body: f(
                "برای شبکه یک نام بگذار؛ مثلاً وای‌فای خانه. بعد انتخاب کن سرعت، نوسان یا حالت خانواده برایت مهم‌تر است.",
                "Give the network a name, such as Home Wi-Fi. Choose whether response time, consistency or a family-filtering option matters to you.",
              ),
            },
            {
              icon: Activity,
              title: f("تست را اجرا کن", "Run the test"),
              body: f(
                "تست سریع برای هر DNS سه نمونه می‌گیرد. برای دیدن نمونه‌های بیشتر، حالت دقیق را انتخاب کن. هر وقت خواستی می‌توانی تست را متوقف کنی.",
                "Quick mode takes three samples per resolver. Deep mode collects more. You can stop the scan whenever you need to.",
              ),
            },
            {
              icon: Check,
              title: f("نتیجه‌ها را بخوان", "Make sense of the results"),
              body: f(
                "زمان پاسخ را کنار نوسان و تعداد پاسخ‌های موفق ببین. گزینه‌ها را مقایسه کن، خروجی بگیر یا راهنمای تنظیم دستگاهت را باز کن.",
                "Read response time alongside variation and successful requests. Compare options, export a report or open your device’s setup guide.",
              ),
            },
          ].map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.li
                key={step.title}
                initial={false}
                whileInView={{ y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: reduced ? 0 : 0.6, ease }}
              >
                <span className="process-icon">
                  <Icon size={23} />
                </span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </div>
              </motion.li>
            );
          })}
        </ol>
      </section>
      <SignalJourney fa={fa} reduced={reduced} />
      <section className="home-measurement">
        <div>
          <h2>
            {f("عدد کمتر،", "A smaller number")}
            <br />
            {f("همه ماجرا نیست.", "is part of the story.")}
          </h2>
          <p>
            {f(
              "روش اندازه‌گیری کنار هر نتیجه نوشته می‌شود تا بدانی دقیقاً چه چیزی را مقایسه می‌کنی.",
              "Each result shows its measurement method so you know exactly what you are comparing.",
            )}
          </p>
        </div>
        <div className="measurement-notes">
          <article>
            <h3>
              <span className="method-indicator" />
              DNS over HTTPS
            </h3>
            <p>
              {f(
                "یک درخواست DNS ارسال می‌کنیم و زمان دریافت پاسخ معتبر را می‌سنجیم. زمان اتصال HTTPS و مسیر شبکه هم در این عدد سهم دارند.",
                "We send a DNS query and time the valid response. The HTTPS connection and network route contribute to the measurement.",
              )}
            </p>
          </article>
          <article>
            <h3>
              <span className="method-indicator secondary" />
              HTTPS connection
            </h3>
            <p>
              {f(
                "فقط زمان برقراری اتصال به مقصد است. این عدد به‌تنهایی، سرعت پاسخ DNS یا پینگ داخل بازی را نشان نمی‌دهد.",
                "This times a connection to the destination. It does not, on its own, measure DNS response speed or in-game latency.",
              )}
            </p>
          </article>
          <p className="measurement-boundary">
            {f(
              "UDP، DoT، DoQ، DNSCrypt و ODoH از مرورگر مستقیماً تست نمی‌شوند؛ آدرس‌ها و تنظیمات سازگارشان در مجموعه و راهنما قابل مشاهده است.",
              "UDP, DoT, DoQ, DNSCrypt and ODoH are not directly testable from the browser. Their catalog entries and compatible setup values remain available.",
            )}
          </p>
        </div>
      </section>
      <PurposeExplorer
        fa={fa}
        reduced={reduced}
        href={href}
        onStart={onStart}
      />
      <ToolkitTour fa={fa} reduced={reduced} href={href} onStart={onStart} />
      <FAQ fa={fa} />
      <section className="home-final">
        <div>
          <h2>{f("حالا نوبت اینترنت توست.", "Now, try your connection.")}</h2>
          <p>
            {f(
              "تنظیمی را تغییر نمی‌دهیم. از یک تست شروع کن.",
              "Nothing on your device is changed. Begin with a test.",
            )}
          </p>
        </div>
        <a href={href} onClick={start} className="button primary home-start">
          {f("رفتن به آزمایشگاه", "Open the laboratory")}
          <ArrowUpRight size={21} />
        </a>
      </section>
    </>
  );
}
