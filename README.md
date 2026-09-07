<div align="center">

# 🚀 PIMX_PASS_DNS ⚡🔍
### High-Velocity DNS Benchmark, DoH Latency Scanner & Security Intelligence Dashboard

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg?style=for-the-badge)](https://www.gnu.org/licenses/agpl-3.0)
[![React: 18+](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Cloudflare D1](https://img.shields.io/badge/Database-Cloudflare_D1_SQL-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)](https://developers.cloudflare.com/d1/)
[![DNS over HTTPS](https://img.shields.io/badge/Protocol-DoH_RFC_8484-0052CC?style=for-the-badge)](https://tools.ietf.org/html/rfc8484)
[![Read in Persian](https://img.shields.io/badge/مطالعه_به_فارسی-Persian_README-008080?style=for-the-badge)](#-توضیحات-کامل-فارسی-persian-documentation)

<p align="center">
  A high-precision network utility engineered to benchmark, analyze, and diagnose DNS resolvers worldwide. Evaluates round-trip times (RTT), DNS-over-HTTPS (DoH) latency, DNSSEC validation, and packet jitter with Cloudflare D1 SQL persistence and a real-time administrative telemetry dashboard.
</p>

[Features](#-key-features) •
[Architecture](#-system-architecture) •
[Quick Start](#-quick-start) •
[توضیحات فارسی](#-توضیحات-کامل-فارسی-persian-documentation) •
[License](#-license)

</div>

---

## ⚡ Key Features

- 🏎️ **Multi-Protocol Speed Benchmarking**:
  - Concurrently benchmarks major global DNS providers (Cloudflare 1.1.1.1, Google 8.8.8.8, Quad9 9.9.9.9, AdGuard, OpenDNS, Shecan).
  - Measures DNS resolution time across standard queries (`A`, `AAAA`, `HTTPS`, `TXT`).
- 🔒 **Security & Censorship Diagnostics**:
  - Identifies DNS poisoning, spoofing, and ISP transparent proxy interception.
  - Verifies DNSSEC cryptographic signatures to protect against man-in-the-middle tampering.
- 📊 **Cloudflare D1 Database Logging**:
  - Stores historical latency telemetry inside a distributed serverless SQLite database on Cloudflare edge.
- 🎨 **Bilingual Dark Glassmorphism Interface**:
  - Modern, responsive React dashboard with real-time latency bar charts, sortable data tables, and Persian RTL support.

---

## 🏗️ System Architecture

```
[ Browser / Client ]
         │ (DoH Resolution / RTT Ping)
         ▼
┌──────────────────────────────────────────────┐
│          React 18 + TypeScript UI            │
│  - Concurrent Async Benchmark Worker         │
│  - Statistical Jitter & Standard Deviation   │
└──────────────────────┬───────────────────────┘
                       │
                       ▼ (Telemetry Log)
┌──────────────────────────────────────────────┐
│        Cloudflare Worker Backend             │
│  - REST API & Admin Endpoint                 │
│  - Token Authentication                      │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│       Cloudflare D1 SQL Database             │
│  - Resolver Latency History Table            │
│  - Country & ISP Performance Analytics       │
└──────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### 1. Installation
```bash
git clone https://github.com/MOHAMMADREZAABEDINPOOR/PIMX_PASS_DNS.git
cd PIMX_PASS_DNS

npm install
```

### 2. Local Development
```bash
npm run dev
```
Open `http://localhost:5173` to test DNS resolvers locally.

### 3. Deploy Cloudflare D1 Backend
```bash
# Authenticate wrangler
npx wrangler login

# Create D1 database
npx wrangler d1 create pimx-dns-db

# Execute schema migrations
npx wrangler d1 execute pimx-dns-db --file=./schema.sql

# Deploy edge worker
npx wrangler deploy
```

---

## 🇮🇷 توضیحات کامل فارسی (Persian Documentation)

### معرفی پروژه اسکنر و بنچمارک DNS اختصاصی PIMX_PASS_DNS
پروژه **PIMX_PASS_DNS** یک ابزار پیشرفته، سریع و تخصصی برای تست و اندازه‌گیری سرعت پاسخ‌دهی (Latency)، کیفیت و امنیت سرورهای DNS در سراسر جهان است. این ابزار به کاربران و مدیران شبکه کمک می‌کند تا بهترین و سریع‌ترین دی‌ان‌اس را برای اینترنت خود پیدا کرده و از عدم دستکاری، تحریم یا فیلترینگ ترافیک اینترنت خود اطمینان حاصل نمایند.

### قابلیت‌های برجسته:
1. **تست همزمان ده‌ها سرویس‌دهنده جهانی:**
   * تست و مقایسه ریل‌تایم کلودفلر، گوگل، کواد۹، ادگارد، شکن و دی‌ان‌اس‌های شخصی.
2. **پشتیبانی از پروتکل رمزگذاری‌شده DoH (DNS-over-HTTPS):**
   * ارسال کوئری‌ها بر روی بستر امن HTTPS جهت جلوگیری از شنود، مسموم‌سازی کش (DNS Poisoning) و دستکاری توسط ارائه‌دهندگان اینترنت.
3. **دیتابیس ابری Cloudflare D1:**
   * ذخیره سوابق پینگ و عملکرد دی‌ان‌اس‌ها در پایگاه‌داده توزیع‌شده SQL کلودفلر برای تحلیل ترندهای هفتگی.
4. **پنل مدیریت و داشبورد آمار:**
   * رابط کاربری مدرن با نمودارهای تفکیکی، محاسبه حداقل، حداکثر و میانگین زمان تاخیر به همراه رتبه‌بندی خودکار.

---

## 📜 License

Licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)**.  
Free and open-source for community inspection and security auditing.

---

<div align="center">
  <sub>Created by <a href="https://github.com/MOHAMMADREZAABEDINPOOR">MOHAMMADREZA ABEDINPOOR</a>. If this helped improve your network speed, leave a ⭐!</sub>
</div>
