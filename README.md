<div align="center">

# 🚀 PIMX_PASS_DNS ⚡🔍
### High-Velocity DNS Benchmark, DoH Latency Scanner & Edge Intelligence Telemetry

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg?style=for-the-badge)](https://www.gnu.org/licenses/agpl-3.0)
[![React: 18+](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Cloudflare D1](https://img.shields.io/badge/Database-Cloudflare_D1_SQL-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)](https://developers.cloudflare.com/d1/)
[![DNS over HTTPS](https://img.shields.io/badge/Protocol-DoH_RFC_8484-0052CC?style=for-the-badge)](https://tools.ietf.org/html/rfc8484)
[![Read in Persian](https://img.shields.io/badge/مطالعه_به_فارسی-Persian_README-008080?style=for-the-badge)](#-توضیحات-فوقالعاده-جامع-فارسی-persian-documentation)

<p align="center">
  A high-precision network utility engineered to benchmark, analyze, and diagnose DNS resolvers worldwide. Evaluates round-trip times (RTT), DNS-over-HTTPS (DoH) latency, DNSSEC validation, and packet jitter with Cloudflare D1 SQL persistence and a real-time administrative telemetry dashboard.
</p>

[Project Overview](#-project-overview--problem-statement) •
[Directory Structure](#-directory--file-structure) •
[Architecture & Data Flow](#-system-architecture--data-flow) •
[Core Modules](#-core-features--diagnostics) •
[Quick Start](#-quick-start) •
[توضیحات فارسی](#-توضیحات-فوقالعاده-جامع-فارسی-persian-documentation) •
[License](#-license)

</div>

---

## 🎯 Project Overview & Problem Statement

Internet service providers often manipulate, slow down, or hijack traditional unencrypted DNS queries (UDP port 53), leading to artificial latency, DNS poisoning, and domain blocking. Standard ping tests measure ICMP packet return times, which do NOT accurately reflect DNS lookup speeds.

**PIMX_PASS_DNS** solves this by performing authentic, browser-level DNS-over-HTTPS (DoH) resolution queries:
- **True Resolution Speed**: Measures the exact millisecond latency required to resolve hostnames via RFC 8484 wire-format packets.
- **Poisoning & Hijack Detection**: Verifies returned IP records against authenticated root DNSSEC signatures to expose ISP tampering.
- **Edge SQL Telemetry**: Stores anonymized diagnostic benchmarks inside Cloudflare D1 distributed SQL database to track nationwide network trends.

---

## 📂 Directory & File Structure

```
PIMX_PASS_DNS/
│
├── App.tsx                          # Primary React benchmarking orchestrator & state machine
├── analytics.ts                     # Telemetry collector, visit bucket store & event batcher
├── constants.ts                     # Directory of global DNS resolvers (Cloudflare, Google, Quad9, etc.)
├── i18n.tsx                         # Bilingual translation dictionary with RTL support
├── index.html                       # HTML5 entrypoint with pre-connect resource hints
├── index.tsx                        # React DOM mounting & application bootstrap
├── dnsveil-sources.json             # Seed database of DoH endpoints and validation hostnames
├── dnsveil-userdata.json            # User preference defaults & benchmark threshold configurations
│
├── components/                      # Modular UI component system
│   ├── AdminPanel.tsx               # Password-protected telemetry dashboard with D1 stats
│   ├── Header.tsx                   # Top navigation bar, language switcher & status badge
│   ├── Hero.tsx                     # Main interactive hero section with quick benchmark button
│   ├── Preloader.tsx                # High-contrast animated loading screen
│   ├── ResultCard.tsx               # Detailed card display for tested DNS with latency graphs
│   ├── Scanning.tsx                 # Real-time scan animation with progress indicators
│   └── Footer.tsx                   # System build version and project credits
│
├── services/                        # Network & test business logic
│   └── pingService.ts               # Web Worker and async DoH fetch engine with timeout handling
│
├── cloudflare/                      # Edge database configuration
│   └── d1-schema.sql                # SQL schema for benchmark records, latency logs & user telemetry
│
├── functions/                       # Cloudflare Pages Serverless Edge API
│   └── api/
│       └── analytics.js             # Edge endpoint writing benchmark metrics to Cloudflare D1
│
└── public/                          # Static assets, web manifest & brand icons
    ├── manifest.webmanifest         # Progressive Web App (PWA) installation descriptor
    ├── pimxpass-logo.png            # High-resolution application brand vector
    └── robots.txt                   # Search engine index directives
```

---

## 🏗️ System Architecture & Data Flow

```
[ User Browser ]
       │
       ▼ (Runs Benchmarking Suite)
┌────────────────────────────────────────────────────────┐
│             services/pingService.ts                    │
│  - Sends RFC 8484 DNS-over-HTTPS queries               │
│  - Measures TTFB (Time to First Byte) & Parsing Time   │
│  - Calculates standard deviation and jitter            │
└──────────────────────────┬─────────────────────────────┘
                           │
             ┌─────────────┴─────────────┐
             ▼                           ▼
┌──────────────────────────┐ ┌──────────────────────────┐
│  React 18 Dashboard      │ │  functions/api/analytics │
│  - Sorts by Latency      │ │  - Cloudflare Edge API   │
│  - Renders Bar Charts    │ │  - Validates Auth Token  │
└──────────────────────────┘ └────────────┬─────────────┘
                                          │
                                          ▼
                             ┌──────────────────────────┐
                             │    Cloudflare D1 SQL     │
                             │  - resolver_tests table  │
                             │  - global_analytics      │
                             └──────────────────────────┘
```

---

## ⚡ Core Features & Diagnostics

### 1. 🏎️ Global Resolvers Benchmarked
- **Cloudflare** (`1.1.1.1` - Fast, privacy-oriented)
- **Google Public DNS** (`8.8.8.8` - High-availability global backbone)
- **Quad9** (`9.9.9.9` - Automated threat intelligence & malware blocking)
- **AdGuard DNS** (Ad-blocking and anti-tracker filtration)
- **Shecan & Domestic Resolvers** (Sanctions bypass and localized caching)

### 2. 🛡️ Secret Admin Telemetry (`AdminPanel.tsx`)
- Protected by token authentication.
- Visualizes aggregated benchmark logs stored across Cloudflare D1.
- Analyzes which internet service providers (ISPs) suffer from elevated latency or packet drop rates.

---

## 🚀 Quick Start

### 1. Installation
```bash
git clone https://github.com/MOHAMMADREZAABEDINPOOR/PIMX_PASS_DNS.git
cd PIMX_PASS_DNS

npm install
```

### 2. Run Locally
```bash
npm run dev
```
Open `http://localhost:5173` to test resolvers from your own connection.

### 3. Deploy Cloudflare D1 Backend
```bash
# Authenticate Wrangler
npx wrangler login

# Create D1 database
npx wrangler d1 create pimx-dns-db

# Execute schema migrations
npx wrangler d1 execute pimx-dns-db --file=./cloudflare/d1-schema.sql

# Deploy Pages
npx wrangler pages deploy dist
```

---

## 🇮🇷 توضیحات فوق‌العاده جامع فارسی (Persian Documentation)

### ۱. معرفی پروژه اسکنر DNS اختصاصی PIMX_PASS_DNS
پروژه **PIMX_PASS_DNS** یک نرم‌افزار تحلیلی، سریع و پیشرفته تحت وب است که با هدف سنجش دقیق سرعت، پایداری و امنیت سرویس‌دهنده‌های DNS در سراسر جهان طراحی شده است. بسیاری از کندی‌ها، باز نشدن سایت‌ها و خطاهای اینترنت در ایران ناشی از اختلال یا مسموم‌سازی در پروتکل سنتی DNS (پورت ۵۳) است. این ابزار به کاربران کمک می‌کند تا در چند ثانیه بهترین، امن‌ترین و سریع‌ترین DNS رمزگذاری‌شده را برای اینترنت خود پیدا کنند.

---

### ۲. تشریح ساختار فایل‌های پروژه
- **`App.tsx`**: هسته اصلی برنامه که وظیفه هدایت فرایند اسکن، محاسبه رتبه‌بندی سرورها و سوئیچ بین نماها را دارد.
- **`services/pingService.ts`**: ماژول تخصصی شبکه که درخواست‌های DoH (DNS over HTTPS) را با بسته‌های واقعی به سرورهای مختلف ارسال کرده و زمان دقیق رفت‌وبرگشت (RTT) را تا صدم میلی‌ثانیه می‌سنجد.
- **`analytics.ts`**: سیستم جمع‌آوری اطلاعات آماری بدون ثبت اطلاعات هویتی، برای تحلیل ترند سرعت اینترنت در اپراتورهای مختلف.
- **`cloudflare/d1-schema.sql`**: ساختار پایگاه‌داده ابری Cloudflare D1 برای ذخیره نتایج تست‌های هزاران کاربر در لبه شبکه.
- **`components/AdminPanel.tsx`**: داشبورد مدیریت اختصاصی برای بررسی نمودارهای کلی سرعت اینترنت و سرورهای پرطرفدار.

---

### ۳. ویژگی‌های کلیدی:
1. **تست واقعی DoH به جای پینگ ساده:**
   * ارسال بسته‌های واقعی درخواست آدرس IP بر بستر پروتکل امن HTTPS جهت جلوگیری از دور زدن فیلترینگ یا دستکاری ISP.
2. **پایگاه داده توزیع‌شده Cloudflare D1:**
   * ذخیره لاگ‌ها در یک دیتابیس ابری سبک و پرسرعت SQL.
3. **رابط کاربری شیک و دو زبانه:**
   * طراحی Dark Mode با نمودارهای تعاملی مقایسه سرعت، بدون نیاز به نصب هیچ نرم‌افزار اضافی.

---

## 📜 License

Distributed under the **GNU Affero General Public License v3.0 (AGPL-3.0)**.

---

<div align="center">
  <sub>Developed by <a href="https://github.com/MOHAMMADREZAABEDINPOOR">MOHAMMADREZA ABEDINPOOR</a>. Star ⭐ this repo to support open internet speed benchmarks!</sub>
</div>
