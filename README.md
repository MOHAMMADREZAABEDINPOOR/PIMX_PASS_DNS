# PIMXPASS DNS

پلتفرم تست و انتخاب DNS با رابط مدرن، اسکن سریع، نتایج قابل ذخیره در مرورگر، پنل ادمین، دو زبانه (`FA/EN`)، تم روشن/تاریک، و بک‌اند آنالیتیکس روی Cloudflare.

## What This Project Does

- تست تعداد زیادی DNS و رتبه‌بندی بر اساس کیفیت اتصال
- نمایش برترین DNSها با اطلاعات کامل (Latency/Jitter/Variants)
- توقف اسکن در میانه مسیر و نمایش بهترین نتایج تا همان لحظه
- انتخاب اندازه اسکن (`20/70/150/300/ALL/Custom`)
- ذخیره آخرین نتایج اسکن در مرورگر کاربر
- پنل ادمین با نمودارها و بازه‌های زمانی مختلف
- ثبت آنالیتیکس روی Cloudflare D1

## Key Features

- `Bilingual UI`: فارسی و انگلیسی
- `Theme System`: لایت/دارک با ذخیره در `localStorage`
- `Responsive`: بهینه برای دسکتاپ و موبایل
- `PWA Ready`: دارای `manifest` و آیکن اپ
- `Cloudflare Backend`: API در `functions/api/analytics.js`
- `D1 Schema`: در `cloudflare/d1-schema.sql`
- `Client Safety`: در صورت قطع API، fallback محلی برای عدم از دست رفتن داده

## Tech Stack

- `React 19` + `TypeScript`
- `Vite`
- `Framer Motion`
- `Cloudflare Pages Functions`
- `Cloudflare D1`

## Local Development

**Prerequisites**

- `Node.js 18+`

**Run**

1. `npm install`
2. `npm run dev`
3. Open: `http://localhost:5173`

## Admin Panel

- Route: `/pimxpassdnsadmin`
- Username: `PIMX_PASS`
- Password: `123456789PIMX_PASS@#$%^&`

## Cloudflare Deploy (D1 + Functions)

1. Create a `D1` database in Cloudflare dashboard.
2. Apply schema from `cloudflare/d1-schema.sql`.
3. In Cloudflare Pages project settings, add D1 binding with:
`Variable = DB`
`Target = your D1 database`
4. Deploy project to Cloudflare Pages.

بعد از دیپلوی، فرانت‌اند داده‌ها را به `/api/analytics` ارسال می‌کند و پنل ادمین همان داده را از دیتابیس می‌خواند.

## Analytics Logic

- هر کاربر یک `clientId` محلی دارد.
- بازدید در بازه‌های ۱۰ دقیقه‌ای محاسبه می‌شود.
- هر `clientId` در هر `10-minute bucket` فقط یک بازدید ثبت می‌کند.
- تست‌ها همراه تعداد DNS تست‌شده ذخیره می‌شوند.

## Project Structure

- `App.tsx`: flow اصلی اپ
- `components/`: UI blocks (Header, Hero, Scanning, ResultCard, AdminPanel, ...)
- `services/pingService.ts`: منطق تست DNS
- `analytics.ts`: کلاینت آنالیتیکس و API integration
- `functions/api/analytics.js`: Cloudflare API endpoint
- `cloudflare/d1-schema.sql`: اسکیما دیتابیس
- `public/manifest.webmanifest`: پشتیبانی PWA

## Notes

- این پروژه برای محیط‌های پرترافیک نیاز به cache policy و limit policy در سطح Cloudflare دارد.
- برای production بهتر است مسیر ادمین پشت Access/Zero Trust قرار بگیرد.
