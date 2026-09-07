<div align="center">

<!-- ============================================================================== -->
<!-- DYNAMIC ANIMATED CAPSULE HEADER                                                -->
<!-- ============================================================================== -->
<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=1,12,24,30&height=220&section=header&text=PIMX_PASS_DNS&fontSize=42&fontAlignY=35&desc=%E2%9A%A1%20High-Velocity%20DNS%20Benchmark%2C%20DoH%20Scanner%20%26%20Edge%20Telemetry&descFontSize=16&descAlignY=62" alt="PIMX_PASS_DNS Banner" width="100%" />

<!-- ============================================================================== -->
<!-- ANIMATED TYPING SVG TELEMETRY                                                 -->
<!-- ============================================================================== -->
<a href="https://github.com/MOHAMMADREZAABEDINPOOR/PIMX_PASS_DNS">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=20&duration=2800&pause=1000&color=00D2FF&center=true&vCenter=true&width=780&lines=High-Velocity+DNS-over-HTTPS+(DoH+RFC+8484)+Benchmarking;Real-Time+Latency%2C+Jitter+%26+Standard+Deviation+Calculations;Censorship%2C+Poisoning+%26+DNSSEC+Tamper+Diagnostics;Cloudflare+D1+Distributed+SQL+Database+Persistence;Secret+Token-Authenticated+Administrative+Telemetry+Console;Bilingual+Dark+Glassmorphism+Interface+(English+%26+Persian)" alt="Typing SVG" />
</a>

<br/>

<!-- ============================================================================== -->
<!-- BADGES MATRIX                                                                  -->
<!-- ============================================================================== -->
[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg?style=for-the-badge&logo=gnu)](https://www.gnu.org/licenses/agpl-3.0)
[![React: 18+](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Cloudflare D1](https://img.shields.io/badge/Database-Cloudflare_D1_SQL-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)](https://developers.cloudflare.com/d1/)
[![DoH RFC 8484](https://img.shields.io/badge/Protocol-DoH_RFC_8484-0052CC?style=for-the-badge)](https://tools.ietf.org/html/rfc8484)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Read in Persian](https://img.shields.io/badge/مطالعه_به_فارسی-Persian_README-008080?style=for-the-badge)](#-بخش-فوقالعاده-مفصل-و-جامع-به-زبان-فارسی-persian-documentation)

<p align="center">
  <b>PIMX_PASS_DNS</b> is a high-precision network intelligence utility and automated benchmark workstation engineered to evaluate, rank, and diagnose DNS resolvers worldwide. Leveraging encrypted DNS-over-HTTPS (DoH RFC 8484) protocols, statistical jitter analysis, and Cloudflare D1 distributed edge SQL logging, PIMX_PASS_DNS identifies ISP poisoning, unmasks transparent interception, and pinpoints the lowest-latency DNS for any connection.
</p>

<!-- ============================================================================== -->
<!-- QUICK NAVIGATION ANCHORS                                                       -->
<!-- ============================================================================== -->
[Project Overview](#-project-overview--problem-statement) •
[Directory Anatomy](#-exhaustive-directory--file-anatomy) •
[Benchmark Architecture](#-system-architecture--benchmark-dataflow) •
[DNS Engine Details](#-dns-over-https-engine--methodology) •
[Installation Guide](#-quick-start--local-development) •
[Cloudflare D1 Setup](#-cloudflare-d1-edge-database-setup) •
[توضیحات فارسی](#-بخش-فوقالعاده-مفصل-و-جامع-به-زبان-فارسی-persian-documentation) •
[Roadmap](#-strategic-engineering-roadmap) •
[License](#-copyleft-license--legal-attribution)

</div>

---

## ⚡ Project Overview & Problem Statement

> *"In the architecture of the modern internet, DNS is the primary compass. When internet providers poison or throttle this compass, connection speed and privacy disintegrate."*

### The Problem with Traditional DNS & Ping Tests
In heavily filtered or surveillance-heavy networks, Internet Service Providers (ISPs) actively manipulate the Domain Name System:
1. **Unencrypted UDP Port 53 Poisoning**: Standard DNS queries travel in plaintext over UDP port 53. Censorship firewalls intercept these packets and inject forged IP addresses, redirecting users to block pages or blackholes.
2. **Deceptive ICMP Ping Tests**: Standard network diagnostic tools use ICMP ping (`ping 1.1.1.1`). ICMP echo packets are given artificial priority by network routers and do NOT measure the actual computational lookup time required to resolve complex A, AAAA, and HTTPS records.
3. **Transparent Proxy Interception**: Some ISPs silently redirect UDP 53 packets to local caching resolvers without the user's consent, breaking DNSSEC security chains.

### The PIMX_PASS_DNS Solution
**PIMX_PASS_DNS** establishes an empirical, tamper-proof benchmarking framework:
- 🔒 **Authentic DoH Wire-Format Packets**: Dispatches genuine binary DNS queries over encrypted HTTPS channels (RFC 8484) directly from the client's browser.
- ⏱️ **Statistical Jitter & Standard Deviation**: Runs multiple sample iterations per resolver to compute minimum, maximum, mean latency, and standard deviation ($\sigma$) to detect unstable routes.
- 📊 **Distributed SQL Edge Telemetry**: Benchmarks are written asynchronously to Cloudflare D1 SQL databases, allowing network engineers to analyze nationwide ISP performance trends.
- 🛡️ **Bilingual Glassmorphic Interface**: Fully localized in English and Persian with custom Dark Glassmorphism aesthetics and radial SVG progress bars.

---

## 📂 Exhaustive Directory & File Anatomy

```
d:/code/PIMX_PASS_DNS/
│
├── App.tsx                          # Primary React benchmarking coordinator, state machine & sort engine
├── analytics.ts                     # Telemetry collector, local visit bucket manager & edge batcher
├── constants.ts                     # Comprehensive directory of global DNS resolvers and DoH endpoints
├── i18n.tsx                         # Native bilingual dictionary (English & Persian) with RTL support
├── index.html                       # HTML5 entrypoint with preconnect resource hints & responsive viewport
├── index.tsx                        # React 18 DOM mounting & application bootstrap
├── dnsveil-sources.json             # Seed database of DoH resolver URLs, server IPs & geographic locations
├── dnsveil-userdata.json            # User threshold preferences, timeout values & display toggles
├── package.json                     # Node.js dependencies (React, Vite, Lucide React, Tailwind CSS)
├── tsconfig.json                    # Strict TypeScript configuration ensuring end-to-end type safety
├── README.md                        # Master comprehensive bilingual documentation
│
├── components/                      # Modular UI Component System
│   ├── AdminPanel.tsx               # Token-protected telemetry console visualizing D1 historical stats
│   ├── Header.tsx                   # Top navigation bar, language toggle & active status indicator
│   ├── Hero.tsx                     # Hero section with benchmark launch CTA and system status badge
│   ├── Preloader.tsx                # High-contrast animated loading screen during initial hydration
│   ├── ResultCard.tsx               # Detailed card display for tested resolvers with latency bar gauges
│   ├── Scanning.tsx                 # Interactive real-time scanning radar animation with progress counter
│   └── Footer.tsx                   # System version credits and open-source licensing links
│
├── services/                        # Network & Core Testing Services
│   └── pingService.ts               # Async DoH resolution worker, timeout handler & jitter calculator
│
├── cloudflare/                      # Cloudflare Edge Infrastructure Config
│   └── d1-schema.sql                # SQL migration schema for benchmark results and analytics tables
│
├── functions/                       # Cloudflare Pages Serverless Edge API
│   └── api/
│       └── analytics.js             # Edge worker receiving anonymized test metrics and logging to D1
│
└── public/                          # Static Assets & PWA Descriptors
    ├── manifest.webmanifest         # Progressive Web App manifest enabling standalone home screen install
    ├── pimxpass-logo.png            # High-resolution brand vector logo
    ├── sitemap.xml                  # Search engine XML index for SEO optimization
    └── robots.txt                   # Search crawler directives
```

---

## 🏗️ System Architecture & Benchmark Dataflow

```
[ User Browser ]
       │
       ▼ (User clicks "Start Comprehensive Benchmark")
┌────────────────────────────────────────────────────────┐
│             services/pingService.ts                    │
│                                                        │
│ • Iterates through resolvers in constants.ts           │
│ • Dispatches RFC 8484 DNS-over-HTTPS wire packets      │
│ • Measures Time to First Byte (TTFB) & Total Duration  │
│ • Computes Jitter: J = |RTT_n - RTT_(n-1)|             │
└──────────────────────────┬─────────────────────────────┘
                           │
             ┌─────────────┴─────────────┐
             ▼                           ▼
┌──────────────────────────┐ ┌──────────────────────────┐
│  React 18 Reactive UI    │ │  functions/api/analytics │
│                          │ │                          │
│ • Sorts resolvers by RTT │ │ • Edge Worker API        │
│ • Renders ResultCard.tsx │ │ • Sanitizes user agent   │
│ • Displays latency chart │ │ • Writes to D1 SQL       │
└──────────────────────────┘ └────────────┬─────────────┘
                                          │
                                          ▼
                             ┌──────────────────────────┐
                             │    Cloudflare D1 SQL     │
                             │                          │
                             │ • test_logs table        │
                             │ • resolver_ranking table │
                             │ • isp_performance table │
                             └──────────────────────────┘
```

---

## 🔬 DNS-over-HTTPS Engine & Methodology

Unlike traditional tools that execute synthetic ping packets, `services/pingService.ts` queries live root and edge resolvers over encrypted HTTPS channels:

### 1. The Wire-Format Query Payload
A base64url-encoded binary DNS query payload is constructed adhering to RFC 1035 and RFC 8484:
- Header: Identification, Flags (Standard Query, Recursion Desired).
- Question: `example.com`, Type `A` (IPv4) or `AAAA` (IPv6), Class `IN` (Internet).

### 2. Statistical Metric Derivation
For each resolver, multiple packets are dispatched to compute:
- **Minimum Latency ($L_{min}$)**: Represents ideal routing under zero congestion.
- **Average Latency ($\mu$)**:
  $$\mu = \frac{1}{N} \sum_{i=1}^{N} L_i$$
- **Jitter Standard Deviation ($\sigma$)**:
  $$\sigma = \sqrt{\frac{1}{N} \sum_{i=1}^{N} (L_i - \mu)^2}$$
High standard deviation indicates packet loss or route instability.

---

## 🌐 Global Resolvers Included in Benchmark Suite

| Provider | Primary Anycast IP | DoH RFC 8484 Endpoint | Notable Characteristic |
| :--- | :--- | :--- | :--- |
| **Cloudflare** | `1.1.1.1` | `https://cloudflare-dns.com/dns-query` | Ultra-fast worldwide routing; zero logging policy. |
| **Google Public** | `8.8.8.8` | `https://dns.google/dns-query` | Massive global Anycast backbone infrastructure. |
| **Quad9** | `9.9.9.9` | `https://dns.quad9.net/dns-query` | Automatic threat intelligence; blocks malicious domains. |
| **AdGuard DNS** | `94.140.14.14` | `https://dns.adguard.com/dns-query` | Real-time advertising and tracker filtration. |
| **OpenDNS** | `208.67.222.222`| `https://doh.opendns.com/dns-query` | Enterprise content filtering by Cisco. |
| **Shecan (Iran)** | `178.22.122.100`| Domestic Endpoint | International sanctions bypass and Iranian local CDN cache. |

---

## 🚀 Quick Start & Local Development

### 1. Clone & Install
```bash
git clone https://github.com/MOHAMMADREZAABEDINPOOR/PIMX_PASS_DNS.git
cd PIMX_PASS_DNS

npm install
```

### 2. Launch Local Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### 3. Build for Production
```bash
npm run build
npm run preview
```

---

## 🗄️ Cloudflare D1 Edge Database Setup

To enable the distributed SQL telemetry backend:

```bash
# 1. Authenticate Wrangler CLI
wrangler login

# 2. Create the D1 SQL database
wrangler d1 create pimx-dns-db

# 3. Apply SQL schema migrations
wrangler d1 execute pimx-dns-db --file=./cloudflare/d1-schema.sql

# 4. Deploy Cloudflare Pages frontend and functions
npx wrangler pages deploy dist --project-name=pimx-pass-dns
```

---

## 🇮🇷 بخش فوق‌العاده مفصل و جامع به زبان فارسی (Persian Documentation)

### ۱. مقدمه و چرایی ساخت اسکنر تخصصی PIMX_PASS_DNS
پروژه **PIMX_PASS_DNS** یک سامانه تحلیلی و ابزار بنچمارک شبکه فوق‌العاده پیشرفته است که برای حل یکی از اصلی‌ترین مشکلات اینترنت در ایران و جهان طراحی شده است: **کندی، مسموم‌سازی کش و فیلترینگ در لایه دی‌ان‌اس (DNS)**.

بسیاری از کاربران تصور می‌کنند تنها راه بهبود سرعت اینترنت، خرید اشتراک‌های مختلف است، در حالی که در بیش از ۶۰ درصد مواقع، کندی بارگذاری صفحات وب و خطاهایی مانند `DNS_PROBE_FINISHED_NXDOMAIN` ناشی از پاسخ‌دهی کند یا دستکاری شدن بسته‌های DNS توسط ارائه‌دهنده اینترنت (ISP) است. پروتکل سنتی DNS روی پورت ۵۳ به صورت رمزگذاری‌نشده کار می‌کند و اپراتورها به راحتی بسته‌ها را دستکاری یا مسموم می‌کنند. 

پروژه **PIMX_PASS_DNS** با ارسال مستقیم بسته‌های رمزگذاری‌شده **DNS-over-HTTPS (DoH)** بر بستر امن HTTPS، پینگ، تأخیر و ثبات ده‌ها سرویس‌دهنده معتبر جهانی را اندازه گرفته و سریع‌ترین و امن‌ترین دی‌ان‌اس را به کاربر معرفی می‌کند.

---

### ۲. کالبدشکافی ساختار فایل‌های پروژه
- **`App.tsx`**: هسته اصلی برنامه که وظیفه مدیریت وضعیت اسکن، مرتب‌سازی سرورها بر اساس کمترین میلی‌ثانیه، و کنترل نمای دو زبانه را بر عهده دارد.
- **`services/pingService.ts`**: ماژول محاسباتی شبکه که به جای پینگ ساده، بسته‌های واقعی پروتکل DoH را به سرورهای مختلف ارسال کرده و زمان رفت‌وبرگشت (RTT)، زمان دریافت اولین بایت (TTFB) و پایداری سیگنال (Jitter) را اندازه‌گیری می‌کند.
- **`constants.ts`**: دایرکتوری جامع آدرس‌های DoH و IPهای سرورهای مطرح (کلودفلر، گوگل، کواد۹، شکن، ادگارد و غیره).
- **`components/ResultCard.tsx`**: کارت‌های گرافیکی نمایش نتیجه هر DNS با نوار وضعیت رنگی، حداقل و حداکثر پینگ و دکمه کپی سریع IPها.
- **`components/AdminPanel.tsx`**: پنل مدیریت تحت وب با دسترسی رمز عبور برای بررسی نمودارهای تحلیلی و مشاهده سریع‌ترین دی‌ان‌اس‌ها در اپراتورهای مختلف (همراه اول، ایرانسل، مخابرات).
- **`cloudflare/d1-schema.sql`**: ساختار پایگاه‌داده ابری توزیع‌شده Cloudflare D1 برای ثبت ناشناس لاگ‌های سرعت در سراسر کشور.

---

### ۳. امکانات برجسته:
1. **تست دقیق DoH به جای پینگ کاذب:**
   * ارسال کوئری واقعی نام دامنه در بستر امن پروتکل RFC 8484 و ثبت صدم میلی‌ثانیه‌ها.
2. **پایگاه‌داده ابری لبه شبکه (Cloudflare D1):**
   * ذخیره آمارها در یک دیتابیس بدون سرور SQL با بالاترین سرعت دسترسی.
3. **رابط کاربری شیک و تماماً فارسی:**
   * پشتیبانی ۱۰۰٪ از فونت‌های استاندارد فارسی، چیدمان راست‌چین و انیمیشن‌های تعاملی رادار.

---

## 🗺️ Strategic Engineering Roadmap

- [x] **v1.0**: Core React 18 DoH benchmarking engine, bilingual UI, and latency ranking.
- [x] **v1.5**: Cloudflare D1 SQL integration, admin telemetry dashboard, and Jitter statistical calculation.
- [ ] **v2.0**: Automated OS DNS flusher & one-click DNS changer utility for Windows and macOS.
- [ ] **v2.5**: DNSSEC cryptographic validation detector exposing ISP transparent proxies.
- [ ] **v3.0**: Decentralized community DNS latency map with crowd-sourced network health indicators.

---

## 📜 Copyleft License & Legal Attribution

Distributed under the **GNU Affero General Public License v3.0 (AGPL-3.0)**.  
Under this copyleft covenant, any derivative software, hosted web application, or commercial software-as-a-service (SaaS) utilizing components of this repository MUST make its complete corresponding source code freely accessible under identical AGPL-3.0 terms.

---

<div align="center">

<!-- ============================================================================== -->
<!-- ANIMATED CAPSULE FOOTER                                                        -->
<!-- ============================================================================== -->
<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=1,12,24,30&height=120&section=footer" alt="Footer" width="100%" />

<sub>Architected with precision by <a href="https://github.com/MOHAMMADREZAABEDINPOOR"><b>MOHAMMADREZA ABEDINPOOR</b></a>. If PIMX_PASS_DNS accelerates your connection, please leave a ⭐!</sub>

</div>
