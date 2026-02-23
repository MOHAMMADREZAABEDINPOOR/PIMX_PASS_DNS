import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';

type Lang = 'fa' | 'en';

type Dict = Record<string, string>;

const fa: Dict = {
  'app.title': 'PIMXPASS | ضد سرکوب اینترنتی',
  'header.status': 'وضعیت سرور: آنلاین',
  'header.protocol': 'نسخه پروتکل',
  'header.lang': 'زبان',
  'header.theme': 'تم',
  'header.theme.dark': 'دارک',
  'header.theme.light': 'لایت',
  'header.lang.fa': 'فارسی',
  'header.lang.en': 'English',
  'hero.badge': 'اسکنر DNS نسل جدید',
  'hero.sub': 'ابزار حرفه‌ای عبور از تحریم و کاهش پینگ. شناسایی هوشمند بهترین DNS بر اساس اینترنت شما.',
  'hero.start': 'شروع اسکن',
  'modal.title': 'انتخاب تعداد اسکن',
  'modal.subtitle': 'تعداد DNSهایی که می‌خواهید تست شوند را انتخاب کنید',
  'modal.custom': 'تعداد دلخواه',
  'modal.apply': 'اعمال',
  'modal.cancel': 'انصراف',
  'modal.start': 'شروع اسکن',
  'scan.scanning': 'در حال اسکن',
  'scan.current': 'هدف فعلی',
  'scan.wait': 'در انتظار...',
  'scan.stop': 'توقف و نمایش برترین‌ها',
  'scan.count': 'در حال اسکن',
  'scan.step.resolver': 'حل‌گر DNS',
  'scan.step.latency': 'تست تأخیر',
  'scan.step.packet': 'افت پکت',
  'scan.step.route': 'ردیابی مسیر',
  'scan.network': 'تشخیص وضعیت شبکه',
  'results.title': 'گزارش سیستم',
  'results.optimized': 'بهینه برای',
  'results.new': 'اسکن جدید',
  'results.footer': 'بازگشت',
  'results.stopped': 'اسکن متوقف شد',
  'results.unknown': 'شبکه نامشخص',
  'card.latency': 'تأخیر',
  'card.jitter': 'نوسان',
  'card.more': 'اطلاعات بیشتر',
  'card.less': 'کمتر',
  'card.copy': 'کپی',
  'card.primary': 'اصلی',
  'card.secondary': 'ثانویه',
  'card.ipv6': 'IPv6',
  'card.alt': 'گره‌های جایگزین',
  'card.alt.none': 'گره جایگزین ندارد',
  'card.alt.help': 'گره‌های جایگزین نسخه‌های دیگر همین سرویس DNS هستند.',
  'card.source': 'منبع',
  'card.local': 'لیست محلی',
  'card.noDesc': 'توضیحی برای این DNS ثبت نشده است',
  'card.ipv6.primary': 'IPv6 اصلی',
  'card.ipv6.secondary': 'IPv6 ثانویه',
  'card.ipv6.none': 'IPv6 موجود نیست',
  'card.more.count': 'مورد بیشتر',
  'device.mobile': 'موبایل',
  'device.tablet': 'تبلت',
  'device.desktop': 'دسکتاپ',
  'admin.title': 'پنل مدیریت',
  'admin.login': 'ورود مدیر',
  'admin.user': 'نام کاربری',
  'admin.pass': 'رمز عبور',
  'admin.signin': 'ورود',
  'admin.bad': 'نام کاربری یا رمز عبور اشتباه است',
  'admin.range': 'بازه زمانی',
  'admin.visits': 'بازدیدها',
  'admin.tests': 'تست‌ها',
  'admin.dnsTested': 'تعداد DNS تست‌شده',
  'admin.devices': 'درصد دستگاه‌ها',
  'admin.locations': 'لوکیشن کاربران',
  'admin.testsTrend': 'روند تست‌ها',
  'admin.dnsTrend': 'روند DNSهای تست‌شده',
  'admin.noData': 'داده‌ای برای نمایش وجود ندارد',
  'admin.total': 'کل',
  'admin.avg': 'میانگین',
  'admin.max': 'بیشینه',
  'admin.min': 'کمینه',
  'footer.tagline': 'پلتفرم دسترسی آزاد و ضد سرکوب اینترنتی',
  'footer.copy': '© 2026 زیست‌بوم PIMX',
  'footer.social': 'صفحه رسمی'
};

const en: Dict = {
  'app.title': 'PIMXPASS | Anti-Block DNS Scanner',
  'header.status': 'SERVER STATUS: ONLINE',
  'header.protocol': 'PROTOCOL VERSION',
  'header.lang': 'Language',
  'header.theme': 'Theme',
  'header.theme.dark': 'Dark',
  'header.theme.light': 'Light',
  'header.lang.fa': 'فارسی',
  'header.lang.en': 'English',
  'hero.badge': 'NEXT GEN DNS SCANNER',
  'hero.sub': 'A professional tool to reduce ping and bypass restrictions. Smart detection of the best DNS for your network.',
  'hero.start': 'START SCAN',
  'modal.title': 'Scan Size',
  'modal.subtitle': 'Choose how many DNS servers to test',
  'modal.custom': 'Custom count',
  'modal.apply': 'APPLY',
  'modal.cancel': 'CANCEL',
  'modal.start': 'START SCAN',
  'scan.scanning': 'SCANNING',
  'scan.current': 'Current Target',
  'scan.wait': 'WAITING...',
  'scan.stop': 'STOP & SHOW BEST',
  'scan.count': 'Scanning',
  'scan.step.resolver': 'DNS RESOLVER',
  'scan.step.latency': 'LATENCY TEST',
  'scan.step.packet': 'PACKET LOSS',
  'scan.step.route': 'ROUTE TRACE',
  'scan.network': 'Network Status',
  'results.title': 'SYSTEM REPORT',
  'results.optimized': 'OPTIMIZED FOR',
  'results.new': 'NEW SCAN',
  'results.footer': 'RETURN',
  'results.stopped': 'SCAN STOPPED',
  'results.unknown': 'UNKNOWN NETWORK',
  'card.latency': 'Latency',
  'card.jitter': 'Jitter',
  'card.more': 'MORE INFO',
  'card.less': 'LESS',
  'card.copy': 'COPY',
  'card.primary': 'PRIMARY',
  'card.secondary': 'SECONDARY',
  'card.ipv6': 'IPv6',
  'card.alt': 'Alternative Nodes',
  'card.alt.none': 'No alternative nodes',
  'card.alt.help': 'Alternative nodes are other endpoints for the same DNS service.',
  'card.source': 'Source',
  'card.local': 'Local list',
  'card.noDesc': 'No description available for this server',
  'card.ipv6.primary': 'Primary IPv6',
  'card.ipv6.secondary': 'Secondary IPv6',
  'card.ipv6.none': 'No IPv6 available',
  'card.more.count': 'more',
  'device.mobile': 'Mobile',
  'device.tablet': 'Tablet',
  'device.desktop': 'Desktop',
  'admin.title': 'Admin Panel',
  'admin.login': 'Admin Login',
  'admin.user': 'Username',
  'admin.pass': 'Password',
  'admin.signin': 'Sign In',
  'admin.bad': 'Invalid username or password',
  'admin.range': 'Time Range',
  'admin.visits': 'Visits',
  'admin.tests': 'Tests',
  'admin.dnsTested': 'DNS Tested',
  'admin.devices': 'Device Share',
  'admin.locations': 'User Locations',
  'admin.testsTrend': 'Tests Trend',
  'admin.dnsTrend': 'DNS Tested Trend',
  'admin.noData': 'No data to display',
  'admin.total': 'Total',
  'admin.avg': 'Average',
  'admin.max': 'Max',
  'admin.min': 'Min',
  'footer.tagline': 'Open access and anti-blocking platform',
  'footer.copy': '© 2026 PIMX ECOSYSTEM',
  'footer.social': 'Official Page'
};

const dict: Record<Lang, Dict> = { fa, en };

interface I18nContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
  dir: 'rtl' | 'ltr';
}

const I18nContext = createContext<I18nContextValue | null>(null);

const STORAGE_KEY = 'pimxpassdns_lang';

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Lang>('fa');

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Lang | null;
    if (stored === 'fa' || stored === 'en') {
      setLangState(stored);
      return;
    }
    const browser = navigator.language.toLowerCase();
    if (browser.startsWith('fa')) {
      setLangState('fa');
    } else {
      setLangState('en');
    }
  }, []);

  const setLang = (next: Lang) => {
    setLangState(next);
    localStorage.setItem(STORAGE_KEY, next);
  };

  const t = (key: string) => dict[lang][key] ?? key;
  const dir = lang === 'fa' ? 'rtl' : 'ltr';

  const value = useMemo(() => ({ lang, setLang, t, dir }), [lang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
};
