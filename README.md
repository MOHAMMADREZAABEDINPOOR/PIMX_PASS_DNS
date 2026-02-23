<a id="readme-top"></a>

# 🚀 PIMXPASS DNS

[![READ](https://img.shields.io/badge/READ-3a3f4b?style=for-the-badge&labelColor=3a3f4b&color=3a3f4b)](#readme-top)
[![PERSIAN DESCRIPTION](https://img.shields.io/badge/PERSIAN_DESCRIPTION-0b5fb3?style=for-the-badge&labelColor=0b5fb3&color=0b5fb3)](#persian-description)

**PIMXPASS DNS** is a modern, bilingual DNS scanner platform that helps users find the best DNS endpoints for their network with fast testing, smart ranking, strong UX, and Cloudflare-powered analytics.

## 🌍 Languages

- 🇺🇸 **Primary:** English
- 🇮🇷 **Secondary:** Persian (فارسی)

---

## ✨ Highlights

- ⚡ High-speed DNS scan and ranking
- 🧠 Smart scan size selection (`20 / 70 / 150 / 300 / ALL / Custom`)
- ⏹️ Stop scan mid-process and show best-so-far results
- 💾 Save last scan results in browser (recoverable if user leaves page)
- 🌗 Light/Dark theme with persistent settings
- 🌐 Fully bilingual UI (`FA/EN`)
- 📱 Responsive design for desktop and mobile
- 🧩 PWA-ready setup (`manifest`, app icon)
- 📊 Admin analytics dashboard with charts and time-range filters
- ☁️ Cloudflare backend support (Pages Functions + D1)

---

## 🧱 Tech Stack

- `React 19`
- `TypeScript`
- `Vite`
- `Framer Motion`
- `Cloudflare Pages Functions`
- `Cloudflare D1`

---

## 🛠️ Local Development

### Prerequisites

- `Node.js 18+`

### Run

1. Install dependencies:
   `npm install`
2. Start dev server:
   `npm run dev`
3. Open:
   `http://localhost:5173`

---

## 🔐 Admin Panel

- Route: `/pimxpassdnsadmin`
- Username: `PIMX_PASS`
- Password: `123456789PIMX_PASS@#$%^&`

---

## ☁️ Cloudflare Deployment (D1 + Functions)

This project includes a server-side analytics API:

- `functions/api/analytics.js`

And the D1 schema:

- `cloudflare/d1-schema.sql`

### Setup Steps

1. Create a `D1` database in Cloudflare.
2. Apply `cloudflare/d1-schema.sql`.
3. In Cloudflare Pages project settings, add D1 binding:
   - `Variable = DB`
   - `Target = your D1 database`
4. Deploy the project to Cloudflare Pages.

After deployment, frontend events are sent to `/api/analytics` and admin charts read from the same endpoint.

---

## 📈 Analytics Model

- Each browser gets a local `clientId`.
- Visits are counted in **10-minute buckets**.
- One user can generate at most one visit per bucket.
- Example:
  - 0-10 min => 1 visit
  - 10-20 min => 2 visits
  - 20-30 min => 3 visits
- DNS test events store the number of tested DNS records.

---

## 📂 Project Structure

- `App.tsx` => main app flow and state
- `components/` => UI modules (`Header`, `Hero`, `Scanning`, `ResultCard`, `AdminPanel`, ...)
- `services/pingService.ts` => DNS testing pipeline
- `analytics.ts` => client analytics + API integration
- `functions/api/analytics.js` => Cloudflare API endpoint
- `cloudflare/d1-schema.sql` => database schema
- `public/manifest.webmanifest` => PWA metadata

---

## 🔎 Notes

- For high traffic, add Cloudflare cache/rate-limit policies.
- For production security, protect admin route behind Cloudflare Access / Zero Trust.

---

<a id="persian-description"></a>

# 🇮🇷 راهنمای فارسی (ترجمه کامل)

[![US](https://img.shields.io/badge/US-3a3f4b?style=for-the-badge&labelColor=3a3f4b&color=3a3f4b)](#readme-top)
[![BACK TO ENGLISH](https://img.shields.io/badge/BACK_TO_ENGLISH-003a70?style=for-the-badge&labelColor=003a70&color=003a70)](#readme-top)

**PIMXPASS DNS** یک پلتفرم مدرن و دو‌زبانه برای اسکن DNS است که با تست سریع، رتبه‌بندی هوشمند، تجربه کاربری قوی و آنالیتیکس مبتنی بر Cloudflare به کاربران کمک می‌کند بهترین DNS را برای شبکه خود پیدا کنند.

## 🌍 زبان‌ها

- 🇺🇸 **اصلی:** انگلیسی
- 🇮🇷 **ثانویه:** فارسی

---

## ✨ ویژگی‌های برجسته

- ⚡ اسکن و رتبه‌بندی پرسرعت DNS
- 🧠 انتخاب هوشمند تعداد اسکن (`20 / 70 / 150 / 300 / ALL / Custom`)
- ⏹️ توقف اسکن در میانه مسیر و نمایش بهترین نتایج تا همان لحظه
- 💾 ذخیره آخرین نتایج اسکن در مرورگر (قابل بازیابی اگر کاربر از صفحه خارج شود)
- 🌗 تم روشن/تاریک با ذخیره پایدار تنظیمات
- 🌐 رابط کاربری کاملاً دو‌زبانه (`FA/EN`)
- 📱 طراحی ریسپانسیو برای دسکتاپ و موبایل
- 🧩 آماده برای PWA (دارای `manifest` و آیکن اپ)
- 📊 پنل مدیریت آنالیتیکس با نمودارها و فیلتر بازه‌های زمانی
- ☁️ پشتیبانی بک‌اند Cloudflare (Pages Functions + D1)

---

## 🧱 تکنولوژی‌ها

- `React 19`
- `TypeScript`
- `Vite`
- `Framer Motion`
- `Cloudflare Pages Functions`
- `Cloudflare D1`

---

## 🛠️ اجرای محلی

### پیش‌نیازها

- `Node.js 18+`

### اجرا

1. نصب وابستگی‌ها:
   `npm install`
2. اجرای سرور توسعه:
   `npm run dev`
3. باز کردن آدرس:
   `http://localhost:5173`

---

## 🔐 پنل مدیریت

- مسیر: `/pimxpassdnsadmin`
- نام کاربری: `PIMX_PASS`
- رمز عبور: `123456789PIMX_PASS@#$%^&`

---

## ☁️ استقرار روی Cloudflare (D1 + Functions)

این پروژه یک API سمت سرور برای آنالیتیکس دارد:

- `functions/api/analytics.js`

و همچنین اسکیما دیتابیس D1:

- `cloudflare/d1-schema.sql`

### مراحل تنظیم

1. یک دیتابیس `D1` در Cloudflare بسازید.
2. فایل `cloudflare/d1-schema.sql` را اعمال کنید.
3. در تنظیمات پروژه Cloudflare Pages، بایندینگ D1 را اضافه کنید:
   - `Variable = DB`
   - `Target = your D1 database`
4. پروژه را روی Cloudflare Pages دیپلوی کنید.

بعد از دیپلوی، رخدادهای فرانت‌اند به `/api/analytics` ارسال می‌شوند و نمودارهای پنل ادمین از همین endpoint خوانده می‌شوند.

---

## 📈 مدل آنالیتیکس

- هر مرورگر یک `clientId` محلی دریافت می‌کند.
- بازدیدها در **باکت‌های ۱۰ دقیقه‌ای** شمارش می‌شوند.
- هر کاربر در هر باکت فقط یک بازدید ثبت می‌کند.
- مثال:
  - 0-10 دقیقه => 1 بازدید
  - 10-20 دقیقه => 2 بازدید
  - 20-30 دقیقه => 3 بازدید
- رخدادهای تست DNS تعداد DNSهای تست‌شده را ذخیره می‌کنند.

---

## 📂 ساختار پروژه

- `App.tsx` => جریان اصلی اپ و مدیریت state
- `components/` => ماژول‌های رابط کاربری (`Header`, `Hero`, `Scanning`, `ResultCard`, `AdminPanel`, ...)
- `services/pingService.ts` => پایپ‌لاین تست DNS
- `analytics.ts` => آنالیتیکس کلاینت + اتصال API
- `functions/api/analytics.js` => endpoint آنالیتیکس در Cloudflare
- `cloudflare/d1-schema.sql` => اسکیما دیتابیس
- `public/manifest.webmanifest` => متادیتای PWA

---

## 🔎 نکات

- برای ترافیک بالا، سیاست‌های cache/rate-limit در Cloudflare اضافه کنید.
- برای امنیت پروداکشن، مسیر ادمین را پشت Cloudflare Access / Zero Trust قرار دهید.
