import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Cpu, Wifi, ShieldCheck } from 'lucide-react';
import { useI18n } from '../i18n';

interface PreloaderProps {
  onComplete: () => void;
  isDark: boolean;
}

export const Preloader: React.FC<PreloaderProps> = ({ onComplete, isDark }) => {
  const [msgIndex, setMsgIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const { lang } = useI18n();
  const messages = lang === 'fa' ? [
    'در حال راه‌اندازی هسته PIMX...',
    'عبور از فایروال‌های منطقه‌ای...',
    'برقراری دست‌داد امن...',
    'بهینه‌سازی مسیرها...',
    'سیستم آماده است.'
  ] : [
    'INITIALIZING PIMX KERNEL...',
    'BYPASSING REGIONAL FIREWALLS...',
    'ESTABLISHING SECURE HANDSHAKE...',
    'OPTIMIZING ROUTE TABLES...',
    'SYSTEM READY.'
  ];

  useEffect(() => {
    // Simulate Progress
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        // Random increment for realistic feel
        return prev + Math.floor(Math.random() * 5) + 1; 
      });
    }, 50);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Cycle messages based on progress
    if (progress < 30) setMsgIndex(0);
    else if (progress < 50) setMsgIndex(1);
    else if (progress < 70) setMsgIndex(2);
    else if (progress < 90) setMsgIndex(3);
    else setMsgIndex(4);

    if (progress >= 100) {
      setTimeout(onComplete, 800); // Small delay before closing
    }
  }, [progress, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className={`fixed inset-0 z-[100] font-mono flex flex-col items-center justify-center overflow-hidden ${
        isDark ? 'bg-black text-slate-200' : 'bg-white text-slate-800'
      }`}
    >
      {/* Background Matrix Effect (Simplified) */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-scanline"></div>
        <div
          className={`w-full h-full ${
            isDark
              ? 'bg-[linear-gradient(rgba(18,18,18,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]'
              : 'bg-[linear-gradient(rgba(248,250,252,0)_50%,rgba(148,163,184,0.12)_50%),linear-gradient(90deg,rgba(99,102,241,0.06),rgba(16,185,129,0.04),rgba(14,165,233,0.06))] bg-[length:100%_2px,3px_100%]'
          }`}
        ></div>
      </div>

      <div className="relative z-10 max-w-md w-full px-8 space-y-8">
        
        {/* Logo/Icon Animation */}
        <div className="flex justify-center mb-8">
           <div className="relative">
             <motion.div 
               animate={{ rotate: 360 }}
               transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
               className="absolute inset-0 rounded-full border-t-2 border-primary border-r-2 border-r-transparent w-20 h-20"
             />
             <motion.div 
               animate={{ rotate: -180 }}
               transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
               className="absolute inset-2 rounded-full border-b-2 border-accent border-l-2 border-l-transparent w-16 h-16"
             />
             <div className="w-20 h-20 flex items-center justify-center">
               <Cpu className={`w-8 h-8 ${isDark ? 'text-white' : 'text-slate-900'}`} />
             </div>
           </div>
        </div>

        {/* Text Terminal */}
        <div className="space-y-2 h-16">
          <motion.p 
            key={msgIndex}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-primary font-bold text-sm md:text-base flex items-center gap-2"
          >
            <span className="text-accent">{">"}</span> {messages[msgIndex]}
            <span className="animate-pulse">_</span>
          </motion.p>
          <div className={`flex gap-4 text-[10px] uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
            <span className="flex items-center gap-1"><Wifi className="w-3 h-3" /> {lang === 'fa' ? 'شبکه: در حال شناسایی' : 'NET: DETECTING'}</span>
            <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> {lang === 'fa' ? 'امنیت: بالا' : 'SEC: HIGH'}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
            <div className={`flex justify-between text-xs font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                <span>{lang === 'fa' ? 'در حال بارگذاری' : 'LOADING ASSETS'}</span>
                <span>{Math.min(100, progress)}%</span>
            </div>
            <div className={`h-1 w-full rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-primary shadow-[0_0_15px_rgba(99,102,241,0.8)]"
                />
            </div>
        </div>

      </div>
      
      {/* Bottom info */}
      <div className={`absolute bottom-8 text-[10px] font-bold tracking-[0.2em] ${isDark ? 'text-slate-600' : 'text-slate-500'}`}>
        {lang === 'fa' ? 'پروتکل امنیتی PIMXPASS نسخه ۲.۴' : 'PIMXPASS SECURITY PROTOCOL V2.4'}
      </div>

    </motion.div>
  );
};
