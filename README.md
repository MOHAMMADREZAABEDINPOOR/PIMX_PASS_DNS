# 🚀 PIMXPASS DNS

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

## 🇮🇷 توضیحات فارسی

**PIMXPASS DNS** یک پلتفرم مدرن برای اسکن و انتخاب DNS است که با رابط دو‌زبانه، تم روشن/تاریک، اسکن سریع، ذخیره نتیجه اسکن و پنل مدیریت کامل طراحی شده است.

### قابلیت‌ها

- اسکن تعداد زیاد DNS و رتبه‌بندی براساس کیفیت اتصال
- انتخاب سایز اسکن (`20 / 70 / 150 / 300 / ALL / Custom`)
- توقف اسکن و نمایش بهترین نتایج تا همان لحظه
- ذخیره نتایج اسکن قبلی در مرورگر کاربر
- پنل ادمین با نمودارها و بازه‌های زمانی متنوع
- بک‌اند آنالیتیکس روی Cloudflare D1

### اجرا

1. `npm install`
2. `npm run dev`
3. آدرس: `http://localhost:5173`

### پنل مدیریت

- مسیر: `/pimxpassdnsadmin`
- نام کاربری: `PIMX_PASS`
- رمز عبور: `123456789PIMX_PASS@#$%^&`

