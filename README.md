<a id="readme-top"></a>

# PIMX_PASS_DNS 🚀🌐

[![Persian Description](https://img.shields.io/badge/Read-Persian%20Description-0A66C2?style=for-the-badge)](#persian-description)

PIMX_PASS_DNS is a modern bilingual (EN/FA) DNS scanner platform that helps users find faster and more stable DNS endpoints using smart tests, ranking logic, and analytics.  
It is designed for real-world speed, better reliability, and clean UX on both desktop and mobile. ⚡

## ✨ Core Features

- ⚡ Fast DNS scanning and ranking
- 🧠 Smart scan-size presets (`20 / 70 / 150 / 300 / ALL / Custom`)
- ⏹️ Stop scanning anytime and keep best-so-far results
- 💾 Save/recover latest scan result in browser
- 🌗 Persistent Light/Dark mode
- 🌐 Full bilingual UI (English / Persian)
- 📱 Responsive interface for mobile and desktop
- 📊 Admin analytics dashboard with charts and filters
- ☁️ Cloudflare backend support (Pages Functions + D1)

## 🤝 PIMX Ecosystem Bots

- **PIMX_PASS_DNS 🚀**  
  Smart DNS scanner + analytics system for better network performance.

- **PIMX_MOJI 🎨**  
  Bilingual image-to-art bot that converts photos to ASCII, Mosaic, and Emoji styles.

## 🛠️ Tech Stack

- React 19
- TypeScript
- Vite
- Framer Motion
- Cloudflare Pages Functions
- Cloudflare D1

## 🚀 Local Development

**Prerequisites:** Node.js 18+

1. Install dependencies  
   `npm install`
2. Start development server  
   `npm run dev`
3. Open  
   `http://localhost:5173`

## 🔐 Admin Panel

- Route: `/pimxpassdnsadmin`
- Default username: `PIMX_PASS`
- Default password: `123456789PIMX_PASS@#$%^&`

## ☁️ Cloudflare Deployment (D1 + Functions)

Main backend files:

- `functions/api/analytics.js`
- `cloudflare/d1-schema.sql`

Deployment flow:

1. Create a D1 database in Cloudflare.
2. Apply schema from `cloudflare/d1-schema.sql`.
3. Bind D1 database to Pages project as `DB`.
4. Deploy project to Cloudflare Pages.

## 📂 Project Structure

- `App.tsx` main app flow and states
- `components/` UI modules
- `services/pingService.ts` DNS test pipeline
- `analytics.ts` client-side analytics integration
- `functions/api/analytics.js` analytics API endpoint
- `cloudflare/d1-schema.sql` database schema

---

<a id="persian-description"></a>

# توضیحات فارسی 🇮🇷

[![Back to English](https://img.shields.io/badge/US-Back%20to%20English-002654?style=for-the-badge)](#readme-top)

## PIMX_PASS_DNS 🚀🌐

**PIMX_PASS_DNS** یک پلتفرم مدرن و دو‌زبانه (فارسی/انگلیسی) برای اسکن DNS است که با تست هوشمند، رتبه‌بندی دقیق و آنالیتیکس، بهترین DNSها را برای اتصال سریع‌تر و پایدارتر پیدا می‌کند.  
این پروژه برای استفاده واقعی، سرعت بالا و تجربه کاربری حرفه‌ای در دسکتاپ و موبایل ساخته شده است. ⚡

## ✨ قابلیت‌های اصلی

- ⚡ اسکن و رتبه‌بندی سریع DNS
- 🧠 پریست‌های هوشمند تعداد اسکن (`20 / 70 / 150 / 300 / ALL / Custom`)
- ⏹️ امکان توقف اسکن در هر لحظه همراه با نگهداری بهترین نتایج
- 💾 ذخیره و بازیابی آخرین نتیجه اسکن در مرورگر
- 🌗 تم روشن/تاریک با ذخیره دائمی تنظیمات
- 🌐 رابط کاربری کامل دو‌زبانه (فارسی/انگلیسی)
- 📱 طراحی واکنش‌گرا برای موبایل و دسکتاپ
- 📊 داشبورد تحلیل ادمین با نمودار و فیلتر زمانی
- ☁️ پشتیبانی از بک‌اند Cloudflare (Functions + D1)

## 🤝 بات‌های اکوسیستم PIMX

- **PIMX_PASS_DNS 🚀**  
  موتور هوشمند اسکن DNS همراه با سیستم آنالیتیکس مدیریتی.

- **PIMX_MOJI 🎨**  
  بات دو‌زبانه تبدیل تصویر به هنر متنی (ASCII، موزاییک و ایموجی).

## 🛠️ تکنولوژی‌ها

- React 19
- TypeScript
- Vite
- Framer Motion
- Cloudflare Pages Functions
- Cloudflare D1

## 🚀 اجرای لوکال

**پیش‌نیاز:** Node.js نسخه 18 یا بالاتر

1. نصب وابستگی‌ها  
   `npm install`
2. اجرای سرور توسعه  
   `npm run dev`
3. باز کردن آدرس  
   `http://localhost:5173`

## 🔐 پنل مدیریت

- مسیر: `/pimxpassdnsadmin`
- نام کاربری پیش‌فرض: `PIMX_PASS`
- رمز عبور پیش‌فرض: `123456789PIMX_PASS@#$%^&`

## ☁️ استقرار روی Cloudflare

فایل‌های اصلی بک‌اند:

- `functions/api/analytics.js`
- `cloudflare/d1-schema.sql`

مراحل استقرار:

1. یک دیتابیس D1 در Cloudflare بسازید.
2. اسکیمای `cloudflare/d1-schema.sql` را اعمال کنید.
3. دیتابیس را با نام `DB` به پروژه Pages متصل کنید.
4. پروژه را روی Cloudflare Pages دیپلوی کنید.
