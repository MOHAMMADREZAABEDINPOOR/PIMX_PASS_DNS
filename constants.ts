import { DnsProvider } from './types';
import dnsveilSources from './dnsveil-sources.json';
import dnsveilUserData from './dnsveil-userdata.json';

export const TAGS_LIST = ['Anti-Sanction', 'Anti-Filter', 'Privacy', 'Security', 'Gaming', 'General'] as const;

export const TAG_LABELS: Record<string, string> = {
  'Gaming': 'گیمینگ',
  'Anti-Sanction': 'ضد تحریم',
  'Security': 'امنیت',
  'Privacy': 'حریم خصوصی',
  'Anti-Filter': 'ضد فیلتر',
  'General': 'عمومی'
};

const BASE_DNS_LIST: DnsProvider[] = [
  // --- IRANIAN SPECIALIZED (ANTI-SANCTION) ---
  {
    id: 'level3-fodey',
    name: 'Level3 + Fodey',
    provider: 'Custom',
    primary: '4.2.2.4',
    secondary: '5.200.200.200',
    tags: ['Anti-Sanction', 'Gaming', 'Anti-Filter'],
    description: 'ترکیب عالی برای کاهش پینگ و دور زدن تحریم‌های بازی‌ها و سرویس‌ها.',
    location: 'Global / Iran'
  },
  {
    id: 'dyn-anti-sanction',
    name: 'Dyn (Anti-Sanction)',
    provider: 'Oracle',
    primary: '216.146.35.35',
    secondary: '216.146.36.36',
    tags: ['Anti-Sanction', 'Anti-Filter'],
    description: 'دی‌ان‌اس قدرتمند برای دور زدن تحریم‌ها و فیلترینگ.',
    location: 'Global'
  },
  {
    id: 'dns-watch-anti-filter',
    name: 'DNS.Watch (Anti-Filter)',
    provider: 'DNS Watch',
    primary: '84.200.67.80',
    secondary: '84.200.70.40',
    tags: ['Anti-Filter', 'Privacy'],
    description: 'سرورهای بدون سانسور مناسب برای عبور از فیلترینگ.',
    location: 'Germany'
  },
  {
    id: 'uncensored-anti-filter',
    name: 'UncensoredDNS (Anti-Filter)',
    provider: 'UncensoredDNS',
    primary: '91.239.100.100',
    secondary: '91.239.100.101',
    tags: ['Anti-Filter', 'Privacy'],
    description: 'دی‌ان‌اس بدون سانسور برای دسترسی آزاد به اینترنت.',
    location: 'Denmark'
  },
  {
    id: 'shecan',
    name: 'Shecan (شکن)',
    provider: 'Bonyan',
    primary: '178.22.122.100',
    secondary: '185.51.200.2',
    tags: ['Anti-Sanction', 'General'],
    description: 'قدیمی‌ترین و محبوب‌ترین سرویس برای استفاده‌های عمومی و توسعه‌دهندگان.',
    location: 'Iran'
  },
  {
    id: 'electro',
    name: 'Electro (الکترو)',
    provider: 'Electro Team',
    primary: '78.157.42.100',
    secondary: '78.157.42.101',
    tags: ['Anti-Sanction', 'Gaming'],
    description: 'یکی از بهترین گزینه‌ها برای گیمرها و وب‌گردی با عملکرد بسیار پایدار.',
    location: 'Iran'
  },
  {
    id: 'radar',
    name: 'Radar Game (رادار)',
    provider: 'Radar',
    primary: '10.202.10.10',
    secondary: '10.202.10.11',
    tags: ['Gaming', 'Anti-Sanction'],
    description: 'مخصوص گیمرها؛ علاوه بر رفع تحریم بازی‌ها، پینگ را نیز کاهش می‌دهد.',
    location: 'Iran'
  },
  {
    id: '403',
    name: '403 Online',
    provider: '403',
    primary: '10.202.10.202',
    secondary: '10.202.10.102',
    tags: ['Anti-Sanction'],
    description: 'بسیار عالی برای برنامه‌نویسان و دسترسی به سرویس‌های گوگل و اندروید.',
    location: 'Iran'
  },
  {
    id: 'begzar',
    name: 'Begzar (بگذر)',
    provider: 'Begzar',
    primary: '185.55.226.26',
    secondary: '185.55.225.25',
    tags: ['Anti-Sanction'],
    description: 'یک سرویس جایگزین و سریع برای عبور از محدودیت‌های تحریمی.',
    location: 'Iran'
  },
  {
    id: 'vani',
    name: 'Vani DNS (وانی)',
    provider: 'Vani',
    primary: '185.231.182.126',
    secondary: '37.152.182.112',
    tags: ['Anti-Sanction', 'Gaming'],
    description: 'گزینه‌ای فوق‌العاده برای کاربران کنسول‌های پلی‌استیشن و ایکس‌باکس.',
    location: 'Iran'
  },
  {
    id: 'server-ir',
    name: 'Server.ir',
    provider: 'Server.ir',
    primary: '194.36.174.161',
    secondary: '178.22.122.100',
    tags: ['Anti-Sanction', 'General'],
    description: 'دی‌ان‌اس زیرساختی شرکت سرور دات آی آر با پایداری بالا.',
    location: 'Iran'
  },
  
  // --- GLOBAL GIANTS & INFRASTRUCTURE ---
  {
    id: 'cloudflare',
    name: 'Cloudflare',
    provider: 'Cloudflare',
    primary: '1.1.1.1',
    secondary: '1.0.0.1',
    tags: ['Privacy', 'Anti-Filter'],
    description: 'سریع‌ترین DNS جهان؛ عالی برای عبور از اختلالات موقت اینترنت.',
    location: 'Global / Anycast'
  },
  {
    id: 'google',
    name: 'Google Public DNS',
    provider: 'Google',
    primary: '8.8.8.8',
    secondary: '8.8.4.4',
    tags: ['General', 'Anti-Filter'],
    description: 'پایدارترین و معروف‌ترین DNS جهان با پشتیبانی گوگل.',
    location: 'Global / Anycast'
  },
  {
    id: 'level3-primary',
    name: 'Level3 (4.2.2.4)',
    provider: 'CenturyLink',
    primary: '4.2.2.4',
    secondary: '4.2.2.2',
    tags: ['General', 'Gaming'],
    description: 'بسیار محبوب در ایران برای کاهش پینگ و بهبود مسیریابی بین‌المللی.',
    location: 'USA / Global'
  },
  {
    id: 'verizon',
    name: 'Verizon (Alt Level3)',
    provider: 'Verizon',
    primary: '4.2.2.1',
    secondary: '4.2.2.3',
    tags: ['General'],
    description: 'آلترناتیو قدرتمند Level3 برای مسیرهای متفاوت اینترنتی.',
    location: 'USA / Global'
  },
  {
    id: 'opendns',
    name: 'OpenDNS (Cisco)',
    provider: 'Cisco',
    primary: '208.67.222.222',
    secondary: '208.67.220.220',
    tags: ['Security', 'Anti-Filter'],
    description: 'متعلق به شرکت سیسکو؛ پایداری بسیار بالا و فیلترینگ امنیتی.',
    location: 'Global'
  },
  {
    id: 'quad9',
    name: 'Quad9 Security',
    provider: 'Quad9',
    primary: '9.9.9.9',
    secondary: '149.112.112.112',
    tags: ['Security', 'Anti-Filter'],
    description: 'تمرکز بر امنیت و مسدودسازی سایت‌های مخرب و بدافزارها.',
    location: 'Global'
  },
  {
    id: 'quad9-no-sec',
    name: 'Quad9 (No Security)',
    provider: 'IBM',
    primary: '9.9.9.10',
    secondary: '149.112.112.10',
    tags: ['General'],
    description: 'نسخه بدون فیلتر امنیتی کواد ۹ برای حداکثر سرعت دسترسی.',
    location: 'Global'
  },

  // --- PRIVACY & SECURITY FOCUSED ---
  {
    id: 'adguard',
    name: 'AdGuard DNS',
    provider: 'AdGuard',
    primary: '94.140.14.14',
    secondary: '94.140.15.15',
    tags: ['Privacy', 'Security'],
    description: 'حذف تبلیغات مزاحم و ردیاب‌ها در سطح شبکه.',
    location: 'Global'
  },
  {
    id: 'mullvad',
    name: 'Mullvad DNS',
    provider: 'Mullvad',
    primary: '194.242.2.2',
    secondary: '194.242.2.3',
    tags: ['Privacy', 'Anti-Filter'],
    description: 'یکی از امن‌ترین و محرمانه‌ترین سرویس‌های دنیا (سوئد).',
    location: 'Sweden'
  },
  {
    id: 'dns-watch',
    name: 'DNS.Watch',
    provider: 'DNS Watch',
    primary: '84.200.69.80',
    secondary: '84.200.70.40',
    tags: ['Privacy', 'Anti-Filter'],
    description: 'سرورهای آلمانی بدون سانسور و با پینگ مناسب به ایران.',
    location: 'Germany'
  },
  {
    id: 'control-d',
    name: 'Control D',
    provider: 'Windscribe',
    primary: '76.76.2.0',
    secondary: '76.76.10.0',
    tags: ['Privacy', 'Security'],
    description: 'سرویس شرکت Windscribe برای مدیریت هوشمند ترافیک.',
    location: 'Global'
  },
  {
    id: 'libredns',
    name: 'LibreDNS',
    provider: 'LibreDNS',
    primary: '116.203.115.192',
    secondary: '116.203.115.192',
    tags: ['Privacy'],
    description: 'دی‌ان‌اس متمرکز بر آزادی اینترنت و عدم ثبت لاگ.',
    location: 'Europe'
  },
  {
    id: 'dns0-eu',
    name: 'dns0.eu',
    provider: 'European Union',
    primary: '193.110.81.0',
    secondary: '185.253.5.0',
    tags: ['Privacy', 'Security'],
    description: 'سرویس عمومی اتحادیه اروپا؛ بسیار امن و بهینه.',
    location: 'EU'
  },

  // --- ASIA & PACIFIC (GAMING NODES) ---
  {
    id: 'softbank',
    name: 'SoftBank (Japan)',
    provider: 'SoftBank',
    primary: '218.176.211.211',
    secondary: '202.179.2.2',
    tags: ['General', 'Gaming'],
    description: 'پینگ عالی برای اتصال به سرورهای شرق آسیا و ژاپن.',
    location: 'Japan'
  },
  {
    id: 'kt-korea',
    name: 'KT (Korea Telecom)',
    provider: 'KT',
    primary: '168.126.63.1',
    secondary: '168.126.63.2',
    tags: ['Gaming'],
    description: 'بهترین گزینه برای بازی‌های آسیایی مثل PUBG و پینگ ثابت به کره.',
    location: 'South Korea'
  },
  {
    id: '114dns',
    name: '114DNS (China)',
    provider: '114DNS',
    primary: '114.114.114.114',
    secondary: '114.114.115.115',
    tags: ['General'],
    description: 'دی‌ان‌اس بزرگ چین؛ فقط برای تست سرعت و پینگ آسیا پیشنهاد می‌شود.',
    location: 'China'
  },

  // --- INFRASTRUCTURE BACKBONES ---
  {
    id: 'sprint',
    name: 'Sprint DNS',
    provider: 'Sprint',
    primary: '204.117.214.10',
    secondary: '199.2.252.10',
    tags: ['General'],
    description: 'از بزرگترین ستون‌فقرات‌های اینترنت در آمریکا.',
    location: 'USA'
  },
  {
    id: 'centurylink',
    name: 'CenturyLink Infrastructure',
    provider: 'CenturyLink',
    primary: '209.81.23.6',
    secondary: '209.81.18.9',
    tags: ['General'],
    description: 'مسیریابی مستقیم و بدون واسطه در شبکه جهانی.',
    location: 'Global'
  },
  {
    id: 'ntt-global',
    name: 'NTT Global',
    provider: 'NTT',
    primary: '129.250.35.250',
    secondary: '129.250.35.251',
    tags: ['General'],
    description: 'یکی از بزرگترین شبکه‌های Tier-1 در جهان.',
    location: 'Japan / Global'
  },
  {
    id: 'comcast-xfinity',
    name: 'Comcast Xfinity',
    provider: 'Comcast',
    primary: '75.75.75.75',
    secondary: '75.75.76.76',
    tags: ['General'],
    description: 'سرویس اینترنت پرسرعت Xfinity.',
    location: 'USA'
  },

  // --- FAMILY & CONTENT FILTERING ---
  {
    id: 'cleanbrowsing',
    name: 'CleanBrowsing Family',
    provider: 'CleanBrowsing',
    primary: '185.228.168.9',
    secondary: '185.228.169.9',
    tags: ['Security'],
    description: 'فیلتر محتوای غیراخلاقی؛ مناسب برای محیط‌های خانوادگی.',
    location: 'Global'
  },
  {
    id: 'safesurfer',
    name: 'SafeSurfer',
    provider: 'SafeSurfer',
    primary: '104.197.28.121',
    secondary: '104.155.237.225',
    tags: ['Security'],
    description: 'حفاظت ویژه از کودکان در برابر محتوای نامناسب وب.',
    location: 'Global'
  },
  {
    id: 'flashstart',
    name: 'FlashStart',
    provider: 'FlashStart',
    primary: '185.236.104.104',
    secondary: '185.236.105.105',
    tags: ['Security'],
    description: 'دی‌ان‌اس ابری متمرکز بر امنیت فیلترینگ محتوا.',
    location: 'Global'
  },

  // --- ADDITIONAL PROVIDERS ---
  {
    id: 'yandex',
    name: 'Yandex.DNS',
    provider: 'Yandex',
    primary: '77.88.8.8',
    secondary: '77.88.8.1',
    tags: ['General', 'Anti-Filter'],
    description: 'سرورهای روسیه با مسیریابی متفاوت نسبت به اروپا.',
    location: 'Russia'
  },
  {
    id: 'comodo-sec',
    name: 'Comodo Secure',
    provider: 'Comodo',
    primary: '8.26.56.26',
    secondary: '8.20.247.20',
    tags: ['Security'],
    description: 'امنیت بسیار بالا و لایه‌های حفاظتی کومودو.',
    location: 'USA'
  },
  {
    id: 'verisign-sec',
    name: 'Verisign',
    provider: 'Verisign',
    primary: '64.6.64.6',
    secondary: '64.6.65.6',
    tags: ['Security'],
    description: 'پایداری ۱۰۰٪ تضمین شده توسط وری‌ساین.',
    location: 'Global'
  },
  {
    id: 'alternate-dns',
    name: 'Alternate DNS',
    provider: 'Alternate',
    primary: '76.76.19.19',
    secondary: '76.223.122.150',
    tags: ['Privacy'],
    description: 'مسدودکننده تبلیغات و ردیاب‌های وب.',
    location: 'Global'
  },
  {
    id: 'freenom-world',
    name: 'Freenom World',
    provider: 'Freenom',
    primary: '80.80.80.80',
    secondary: '80.80.81.81',
    tags: ['Privacy'],
    description: 'دی‌ان‌اس رایگان با تمرکز بر حفظ حریم خصوصی.',
    location: 'Netherlands'
  },
  {
    id: 'neustar-ultra',
    name: 'Neustar UltraDNS',
    provider: 'Neustar',
    primary: '156.154.70.1',
    secondary: '156.154.71.1',
    tags: ['General', 'Security'],
    description: 'دی‌ان‌اس سازمانی با پایداری جهانی.',
    location: 'Global'
  },
  {
    id: 'safedns-global',
    name: 'SafeDNS',
    provider: 'SafeDNS',
    primary: '195.46.39.39',
    secondary: '195.46.39.40',
    tags: ['Security'],
    description: 'سرویس ابری امنیتی SafeDNS.',
    location: 'Global'
  },
  {
    id: 'greenteam-dns',
    name: 'GreenTeam',
    provider: 'GreenTeam',
    primary: '81.218.119.11',
    secondary: '209.88.198.133',
    tags: ['Security'],
    description: 'تمرکز بر جلوگیری از اجرای بدافزارها.',
    location: 'Global'
  },
  {
    id: 'smartviper-dns',
    name: 'SmartViper',
    provider: 'SmartViper',
    primary: '208.76.50.50',
    secondary: '208.76.51.51',
    tags: ['General'],
    description: 'سرویس سریع اسمارت وایپر.',
    location: 'USA'
  },
  {
    id: 'dyn-oracle',
    name: 'Dyn DNS',
    provider: 'Oracle',
    primary: '216.146.35.35',
    secondary: '216.146.36.36',
    tags: ['General'],
    description: 'دی‌ان‌اس قدیمی و قدرتمند متعلق به شرکت Oracle.',
    location: 'Global'
  },
  {
    id: 'freedns-priv',
    name: 'FreeDNS (No Log)',
    provider: 'FreeDNS',
    primary: '37.235.1.174',
    secondary: '37.235.1.177',
    tags: ['Privacy'],
    description: 'دی‌ان‌اس بدون لاگ و ردیابی کاربران.',
    location: 'Austria'
  },
  {
    id: 'uncensored-dk',
    name: 'UncensoredDNS',
    provider: 'UncensoredDNS',
    primary: '91.239.100.100',
    secondary: '89.233.43.71',
    tags: ['Privacy'],
    description: 'دی‌ان‌اس بدون سانسور دانمارکی با پایداری عالی.',
    location: 'Denmark'
  },
  {
    id: 'hurricane-electric',
    name: 'Hurricane Electric',
    provider: 'HE.net',
    primary: '74.82.42.42',
    secondary: '74.82.42.42',
    tags: ['General'],
    description: 'زیرساخت قدرتمند HE برای مسیریابی اینترنت.',
    location: 'USA'
  },
  {
    id: 'fourth-estate-dns',
    name: 'Fourth Estate',
    provider: 'Fourth Estate',
    primary: '45.77.165.194',
    secondary: '45.32.36.36',
    tags: ['Privacy'],
    description: 'سرویس متمرکز بر آزادی مطبوعات و حریم خصوصی.',
    location: 'Global'
  },
  {
    id: 'cira-canada',
    name: 'CIRA Canadian Shield',
    provider: 'CIRA',
    primary: '149.112.121.10',
    secondary: '149.112.122.10',
    tags: ['Security', 'Privacy'],
    description: 'سپر امنیتی کانادا با حفاظت عالی در برابر تهدیدات.',
    location: 'Canada'
  },
  {
    id: 'opennic-fr',
    name: 'OpenNIC (France)',
    provider: 'OpenNIC',
    primary: '185.121.177.177',
    secondary: '169.239.202.202',
    tags: ['Privacy', 'Anti-Filter'],
    description: 'شبکه آزاد جهانی با سرورهای قدرتمند در فرانسه.',
    location: 'France'
  },
  {
    id: 'puntcat-es',
    name: 'PuntCAT',
    provider: 'PuntCAT',
    primary: '109.69.8.51',
    secondary: '109.69.8.51',
    tags: ['Privacy'],
    description: 'دی‌ان‌اس کاتالان با تمرکز بر حریم خصوصی و آزادی بیان.',
    location: 'Spain'
  },
  {
    id: 'sbc-global-dns',
    name: 'SBC Global',
    provider: 'SBC',
    primary: '68.94.156.1',
    secondary: '68.94.157.1',
    tags: ['General'],
    description: 'سرویس زیرساختی قدیمی SBC Global.',
    location: 'USA'
  }
];

const DNSVEIL_SOURCES = dnsveilSources as DnsProvider[];
const DNSVEIL_USERDATA = dnsveilUserData as DnsProvider[];

const sanitizeDnsValue = (raw?: string) => {
  if (!raw) return '';
  let value = raw.trim();
  if (!value) return '';

  // Keep only first endpoint when source contains notes/markdown.
  value = value.split('<br>')[0].trim();
  value = value.split('|')[0].trim();
  value = value.replace(/:heavy_check_mark:/g, '').trim();
  value = value.replace(/,+$/, '').trim();

  // Some imported stamps may miss the sdns:// prefix.
  if (!value.includes('://') && /^[A-Za-z0-9_-]{24,}$/.test(value) && /^A[gA-Za-z0-9]/.test(value)) {
    value = `sdns://${value}`;
  }

  return value;
};

const sanitizeProvider = (item: DnsProvider): DnsProvider => {
  const primary = sanitizeDnsValue(item.primary);
  const secondary = sanitizeDnsValue(item.secondary);
  const testTarget = sanitizeDnsValue(item.testTarget);

  return {
    ...item,
    primary,
    secondary,
    testTarget
  };
};

export const DNS_LIST: DnsProvider[] = [
  ...BASE_DNS_LIST,
  ...DNSVEIL_SOURCES,
  ...DNSVEIL_USERDATA
]
  .map(sanitizeProvider)
  .filter((item) => Boolean(item.primary));
