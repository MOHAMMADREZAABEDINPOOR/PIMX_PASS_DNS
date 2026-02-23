import React from 'react';
import { Zap, ShieldAlert, Bot, Send, ChevronRight, Play, Smartphone, Music } from 'lucide-react';
import { motion } from 'framer-motion';
import { UserConnection } from '../types';
import { useI18n } from '../i18n';

interface HeroProps {
  onStart: () => void;
  connection: UserConnection | null;
  isDark: boolean;
  hasPrevious?: boolean;
  onOpenPrevious?: () => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
};

export const Hero: React.FC<HeroProps> = ({ onStart, isDark, hasPrevious, onOpenPrevious }) => {
  const { t, lang } = useI18n();
  const isFa = lang === 'fa';

  const heroSub = isFa
    ? 'ابزار حرفه‌ای عبور از تحریم و کاهش پینگ. شناسایی هوشمند بهترین DNS بر اساس اینترنت شما.'
    : 'A professional tool to reduce ping and bypass restrictions. Smart detection of the best DNS for your network.';

  const botIntro = isFa
    ? 'بات PIMX PASS مجموعه‌ای از سرویس‌ها و تونل‌های اتصال را در اختیار شما می‌گذارد.'
    : 'The PIMX PASS bot provides a full set of connection services and tunnels.';
  const botOldTitle = isFa ? 'روش‌های ارتباطی' : 'Connection Methods';
  const botOldList = isFa
    ? ['پروکسی‌های تلگرام', 'سرورهای V2Ray']
    : ['Telegram proxies', 'V2Ray servers'];
  const botNewTitle = isFa ? 'سرویس‌ها و تونل‌ها' : 'Services & Tunnels';
  const botNewList = isFa
    ? ['OpenVPN', 'HA Tunnel Plus', 'NPV Tunnel', 'HTTP Custom', 'HTTP Injector']
    : ['OpenVPN', 'HA Tunnel Plus', 'NPV Tunnel', 'HTTP Custom', 'HTTP Injector'];
  const botOutro = isFa
    ? 'چندین نوع سرور و تانل مختلف برای انتخاب راحت‌تر و اتصال پایدار.'
    : 'Multiple server and tunnel types for easier selection and stable connections.';

  const playTitle = isFa ? 'دانلود مستقیم با' : 'Direct Download with';
  const playDesc = isFa
    ? 'وقتی اینترنت کند یا دچار اختلال است، دریافت اپ‌ها سخت می‌شود. PIMXPLAY داخل تلگرام آخرین نسخه اپ‌ها را مستقیم می‌دهد.'
    : 'When the internet is slow or unstable, getting apps becomes hard. PIMXPLAY delivers the latest apps directly inside Telegram.';
  const playFeatures = isFa
    ? ['جستجوی هوشمند: فقط اسم برنامه', 'پشتیبانی از لینک گوگل‌پلی', 'دریافت APK: نصب سریع و راحت', 'فایل‌های مطمئن و تست‌شده']
    : ['Smart search: just the app name', 'Google Play link support', 'APK delivery: fast install', 'Verified, tested files'];

  const sonicTitle = isFa ? 'لذت موسیقی با' : 'Enjoy Music with';
  const sonicDesc = isFa
    ? 'برای وقتی که اینترنت قطع یا ضعیف است. PIMXSONIC کمک می‌کند موسیقی را بدون محدودیت تجربه کنید.'
    : 'For times when the internet is down or weak. PIMXSONIC lets you enjoy music without limits.';
  const sonicCta = isFa ? 'ورود به بات PIMXSONIC' : 'Open PIMXSONIC Bot';

  return (
    <div className="relative min-h-screen flex flex-col items-center pt-32 pb-20 px-4 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="perspective-grid opacity-20"></div>
      </div>

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-7xl w-full mx-auto relative z-10 space-y-20">
        <div className="text-center space-y-8">
          <motion.div variants={itemVariants} className="inline-flex items-center justify-center">
            <div className="px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-md text-primary text-xs font-mono font-bold tracking-widest shadow-[0_0_20px_rgba(99,102,241,0.2)]">
              {t('hero.badge')}
            </div>
          </motion.div>

          <motion.h1 variants={itemVariants} className="text-6xl md:text-8xl lg:text-9xl font-black text-white tracking-tighter leading-[0.9]">
            <span className="block hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-white hover:via-slate-200 hover:to-slate-400 transition-all duration-500 cursor-default">
              PIMX
            </span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-400 to-cyan-300 animate-gradient-x">
              PASS
            </span>
          </motion.h1>

          <motion.p variants={itemVariants} className="max-w-2xl mx-auto text-lg md:text-xl text-slate-400 font-light leading-relaxed">
            {heroSub}
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={onStart}
              className="group relative w-full sm:w-auto px-10 py-5 bg-primary text-white rounded-xl font-black text-lg overflow-hidden tracking-tight hover:scale-105 transition-transform duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 via-cyan-400 to-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 mix-blend-screen"></div>
              <span className="relative flex items-center justify-center gap-3">
                {t('hero.start')}
                <Play className="w-4 h-4 fill-white" />
              </span>
            </button>
            {hasPrevious && onOpenPrevious && (
              <button
                onClick={onOpenPrevious}
                className={`w-full sm:w-auto px-8 py-5 rounded-xl font-black text-lg border transition-all ${
                  isDark
                    ? 'bg-white/10 text-white border-white/10 hover:border-primary/60'
                    : 'bg-white text-slate-900 border-slate-200 hover:border-primary/60'
                }`}
              >
                {isFa ? 'نتایج اسکن قبلی' : 'Previous Scan Results'}
              </button>
            )}
          </motion.div>
        </div>

        <motion.div
          variants={itemVariants}
          className={`relative w-full rounded-[2.5rem] overflow-hidden mb-12 ${
            isDark
              ? 'bg-[#050505] border border-white/10'
              : 'bg-white border border-slate-200 shadow-[0_25px_80px_rgba(15,23,42,0.12)]'
          }`}
        >
          <div className={`absolute inset-0 ${
            isDark
              ? 'bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#050505] to-[#050505]'
              : 'bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-200/60 via-white to-white'
          }`}></div>
          <div className="relative flex flex-col md:flex-row p-8 md:p-12 gap-12 items-center">
            <div className="w-full md:w-1/3 flex justify-center">
              <div className="relative w-64 h-64 flex items-center justify-center">
                <div className="absolute w-full h-full border border-primary/20 rounded-full animate-[spin_10s_linear_infinite]"></div>
                <div className="absolute w-3/4 h-3/4 border border-indigo-400/20 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>
                <div className={`w-32 h-32 rounded-3xl flex items-center justify-center relative overflow-hidden group ${
                  isDark
                    ? 'bg-[#0A0A0A] border border-white/10 shadow-[0_0_50px_rgba(99,102,241,0.2)]'
                    : 'bg-white border border-slate-200 shadow-[0_0_35px_rgba(99,102,241,0.2)]'
                }`}>
                  <ShieldAlert className="w-16 h-16 text-primary relative z-10" />
                  <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <div className="absolute top-0 left-1/2 w-3 h-3 bg-primary rounded-full shadow-[0_0_15px_#6366f1] animate-pulse"></div>
              </div>
            </div>

            <div className="flex-1" dir={isFa ? 'rtl' : 'ltr'}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold tracking-wider mb-4">
                <Zap className="w-3 h-3" />
                {isFa ? 'ویژگی‌های بات' : 'BOT FEATURES'}
              </div>

              <h2 className={`text-4xl md:text-5xl font-black mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {isFa ? 'بات' : 'BOT'} <span className="text-transparent bg-clip-text bg-gradient-to-l from-primary to-indigo-300">PIMX PASS</span>
              </h2>

              <div className={`space-y-4 leading-8 mb-8 text-lg font-light ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                <p className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{botIntro}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                  <div className={`p-4 rounded-2xl border ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                    <h4 className={`font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{botOldTitle}</h4>
                    <ul className="text-sm space-y-1">
                      {botOldList.map((item) => (
                        <li key={item}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-primary/10 p-4 rounded-2xl border border-primary/20">
                    <h4 className="text-primary font-bold mb-2">{botNewTitle}</h4>
                    <ul className={`text-sm space-y-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      {botNewList.map((item) => (
                        <li key={item}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <p className="mt-4 text-sm">{botOutro}</p>
              </div>

              <div className="flex flex-wrap gap-4">
                <a
                  href="https://t.me/PIMX_PASS_BOT"
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 md:flex-none px-8 py-4 rounded-2xl bg-primary hover:bg-indigo-500 text-white font-bold transition-all shadow-lg hover:shadow-primary/30 flex items-center justify-center gap-3 group"
                >
                  <Bot className="w-5 h-5" />
                  {isFa ? 'ورود به بات' : 'Open Bot'}
                  <ChevronRight className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                </a>
                <a
                  href="https://t.me/PIMX_PASS"
                  target="_blank"
                  rel="noreferrer"
                  className={`flex-1 md:flex-none px-8 py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-3 ${
                    isDark
                      ? 'bg-[#0A0A0A] border border-white/10 text-white hover:bg-white/5'
                      : 'bg-white border border-slate-200 text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Send className="w-5 h-5 text-primary" />
                  {isFa ? 'عضویت کانال' : 'Join Channel'}
                </a>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className={`relative w-full rounded-[2.5rem] overflow-hidden mb-12 ${
            isDark
              ? 'bg-[#050505] border border-white/10'
              : 'bg-white border border-slate-200 shadow-[0_25px_80px_rgba(15,23,42,0.12)]'
          }`}
        >
          <div className={`absolute inset-0 ${
            isDark
              ? 'bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-emerald-900/20 via-[#050505] to-[#050505]'
              : 'bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-emerald-200/50 via-white to-white'
          }`}></div>
          <div className="relative flex flex-col md:flex-row-reverse p-8 md:p-12 gap-12 items-center">
            <div className="w-full md:w-1/3 flex justify-center">
              <div className="relative w-64 h-64 flex items-center justify-center">
                <div className="absolute w-full h-full border border-emerald-500/20 rounded-full animate-[spin_12s_linear_infinite]"></div>
                <div className={`w-32 h-32 rounded-3xl flex items-center justify-center relative overflow-hidden group ${
                  isDark
                    ? 'bg-[#0A0A0A] border border-white/10 shadow-[0_0_50px_rgba(16,185,129,0.2)]'
                    : 'bg-white border border-slate-200 shadow-[0_0_35px_rgba(16,185,129,0.2)]'
                }`}>
                  <Smartphone className="w-16 h-16 text-emerald-500 relative z-10" />
                  <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
              </div>
            </div>

            <div className="flex-1" dir={isFa ? 'rtl' : 'ltr'}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold tracking-wider mb-4">
                <Smartphone className="w-3 h-3" />
                {isFa ? 'شکارچی اپ اندروید' : 'ANDROID APP HUNTER'}
              </div>

              <h2 className={`text-4xl md:text-5xl font-black mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {playTitle} <span className="text-transparent bg-clip-text bg-gradient-to-l from-emerald-400 to-teal-300">PIMXPLAY</span>
              </h2>

              <p className={`leading-8 mb-8 text-lg font-light ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {playDesc}
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                {playFeatures.map((f) => (
                  <div key={f} className={`flex items-center gap-2 text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    <ChevronRight className="w-4 h-4 text-emerald-500" />
                    {f}
                  </div>
                ))}
              </div>

              <a
                href="https://t.me/PIMX_SONIC_BOT"
                target="_blank"
                rel="noreferrer"
                className="inline-flex px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-lg hover:shadow-emerald-600/30 items-center justify-center gap-3 group"
              >
                <Bot className="w-5 h-5" />
                {isFa ? 'شروع دانلود اپلیکیشن' : 'Start App Download'}
              </a>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className={`relative w-full rounded-[2.5rem] overflow-hidden mb-20 ${
            isDark
              ? 'bg-[#050505] border border-white/10'
              : 'bg-white border border-slate-200 shadow-[0_25px_80px_rgba(15,23,42,0.12)]'
          }`}
        >
          <div className={`absolute inset-0 ${
            isDark
              ? 'bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-rose-900/20 via-[#050505] to-[#050505]'
              : 'bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-rose-200/50 via-white to-white'
          }`}></div>
          <div className="relative flex flex-col md:flex-row p-8 md:p-12 gap-12 items-center">
            <div className="w-full md:w-1/3 flex justify-center">
              <div className="relative w-64 h-64 flex items-center justify-center">
                <div className="absolute w-full h-full border border-rose-500/20 rounded-full animate-pulse"></div>
                <div className={`w-32 h-32 rounded-3xl flex items-center justify-center relative overflow-hidden group ${
                  isDark
                    ? 'bg-[#0A0A0A] border border-white/10 shadow-[0_0_50px_rgba(244,63,94,0.2)]'
                    : 'bg-white border border-slate-200 shadow-[0_0_35px_rgba(244,63,94,0.2)]'
                }`}>
                  <Music className="w-16 h-16 text-rose-500 relative z-10" />
                  <div className="absolute inset-0 bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
              </div>
            </div>

            <div className="flex-1" dir={isFa ? 'rtl' : 'ltr'}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-bold tracking-wider mb-4">
                <Music className="w-3 h-3" />
                {isFa ? 'پخش‌کننده موسیقی آفلاین' : 'OFFLINE MUSIC PLAYER'}
              </div>

              <h2 className={`text-4xl md:text-5xl font-black mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {sonicTitle} <span className="text-transparent bg-clip-text bg-gradient-to-l from-rose-400 to-orange-300">PIMXSONIC</span>
              </h2>

              <p className={`leading-8 mb-8 text-lg font-light ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {sonicDesc}
              </p>

              <a
                href="https://t.me/PIMX_SONIC_BOT"
                target="_blank"
                rel="noreferrer"
                className={`inline-flex px-8 py-4 rounded-2xl font-bold transition-all items-center justify-center gap-3 group ${
                  isDark
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg hover:shadow-rose-600/30'
                    : 'bg-rose-500 hover:bg-rose-600 text-white shadow-lg hover:shadow-rose-500/30'
                }`}
              >
                <Bot className="w-5 h-5" />
                {sonicCta}
              </a>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};
