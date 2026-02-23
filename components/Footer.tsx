import React from 'react';
import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';
import { useI18n } from '../i18n';

export const Footer: React.FC = () => {
  const { lang } = useI18n();
  const isFa = lang === 'fa';

  return (
    <footer className="mt-20 border-t border-white/10 bg-black/40 backdrop-blur-xl py-12">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-6 md:mb-0 text-center md:text-right" dir={isFa ? 'rtl' : 'ltr'}>
            <h2 className="text-2xl font-black tracking-tighter text-white font-mono leading-none">
              PIMX<span className="text-primary">PASS</span>
            </h2>
            <p className="text-slate-500 text-sm mt-2 font-medium">
              {isFa ? 'پلتفرم دسترسی آزاد و ضد سرکوب اینترنتی' : 'Open access and anti-blocking platform'}
            </p>
            <p className="text-slate-600 text-[10px] mt-1 font-mono uppercase tracking-widest">© 2026 PIMX ECOSYSTEM</p>
          </div>

          <div className="flex items-center gap-6">
            <motion.a
              href="https://x.com/pimxpass"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary/50 transition-all text-white font-bold shadow-lg"
            >
              <Globe className="w-5 h-5 text-primary" />
              <span>X (Twitter)</span>
            </motion.a>
          </div>
        </div>
      </div>
    </footer>
  );
};
