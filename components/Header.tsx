import React, { useState, useEffect } from 'react';
import { Terminal, Moon, Sun, Languages, Home } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useI18n } from '../i18n';

interface HeaderProps {
  isDark: boolean;
  toggleTheme: () => void;
  lang: 'fa' | 'en';
  setLang: (lang: 'fa' | 'en') => void;
  showHome?: boolean;
  onHome?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isDark, toggleTheme, lang, setLang, showHome, onHome }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { t } = useI18n();
  const textMain = isDark ? 'text-white' : 'text-slate-900';
  const textMuted = isDark ? 'text-slate-500' : 'text-slate-600';
  const panelBg = isDark ? 'bg-white/5 border-white/5' : 'bg-white/80 border-slate-200';
  const chipBg = isDark ? 'bg-white/10 border-white/10 text-white' : 'bg-slate-100 border-slate-200 text-slate-800';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? (isDark ? 'bg-black/40 backdrop-blur-xl border-b border-white/5 py-4' : 'bg-white/80 backdrop-blur-xl border-b border-slate-200 py-4')
          : 'bg-transparent py-6'
      }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        
        {/* Logo Section */}
        <div className="flex items-center gap-3 group cursor-default">
          <div className={`relative flex items-center justify-center w-10 h-10 rounded-xl group-hover:border-primary/50 transition-colors overflow-hidden ${
            isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-slate-200'
          }`}>
             <div className="absolute inset-0 bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
             <Terminal className={`w-5 h-5 relative z-10 ${textMain}`} />
          </div>
          <div className="flex flex-col">
            <h1 className={`text-xl font-black tracking-tighter font-mono leading-none ${textMain}`}>
              PIMX<span className="text-primary">PASS</span>
            </h1>
            <span className={`text-[9px] font-bold tracking-[0.3em] group-hover:text-primary/80 transition-colors ${textMuted}`}>
              {t('header.protocol')} V2
            </span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {showHome && onHome && (
            <button
              onClick={onHome}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg hover:border-primary/60 text-xs font-bold ${chipBg}`}
              aria-label={lang === 'fa' ? 'بازگشت به خانه' : 'Go Home'}
              title={lang === 'fa' ? 'بازگشت به خانه' : 'Go Home'}
            >
              <Home className="w-4 h-4" />
              <span className="hidden md:inline">{lang === 'fa' ? 'خانه' : 'Home'}</span>
            </button>
          )}
          <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg ${panelBg}`}>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className={`text-[10px] font-mono font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{t('header.status')}</span>
          </div>

          <button
            onClick={() => setLang(lang === 'fa' ? 'en' : 'fa')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg hover:border-primary/60 text-xs font-bold ${chipBg}`}
          >
            <Languages className="w-4 h-4" />
            {lang === 'fa' ? t('header.lang.en') : t('header.lang.fa')}
          </button>

          <button
            onClick={toggleTheme}
            className={`flex items-center justify-center px-3 py-2 rounded-lg hover:border-primary/60 text-xs font-bold ${chipBg}`}
            aria-label={isDark ? t('header.theme.light') : t('header.theme.dark')}
            title={isDark ? t('header.theme.light') : t('header.theme.dark')}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </motion.header>
  );
};
