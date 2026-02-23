import React from 'react';
import { motion } from 'framer-motion';
import { Radar, Database, Wifi, Activity, Aperture, Globe, Lock } from 'lucide-react';
import { UserConnection } from '../types';
import { useI18n } from '../i18n';

interface ScanningProps {
  progress: number;
  currentDns: string;
  connection: UserConnection | null;
  isDark: boolean;
}

export const Scanning: React.FC<ScanningProps> = ({ progress, currentDns, connection, isDark }) => {
  const { t } = useI18n();
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 w-full relative pt-6 md:pt-0">
      
      {/* Sci-Fi HUD Container */}
      <div className="relative w-[240px] h-[240px] sm:w-[320px] sm:h-[320px] md:w-[450px] md:h-[450px] flex items-center justify-center mb-10 md:mb-12">
        
        {/* Rotating Outer Rings */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className={`absolute inset-0 rounded-full border border-dashed ${isDark ? 'border-slate-800' : 'border-slate-300'}`}
        ></motion.div>
        
        <motion.div 
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute inset-8 rounded-full border border-primary/10 border-t-transparent border-l-transparent"
        ></motion.div>

        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-primary/5 to-transparent z-0"
        />

        {/* Orbiting Icons */}
        <motion.div 
            className="absolute inset-0"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        >
             <div className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-3 p-2 rounded-full shadow-xl ${
               isDark ? 'bg-[#050505] border border-white/5' : 'bg-white border border-slate-200'
             }`}>
                 <Wifi className="w-4 h-4 text-primary" />
             </div>
        </motion.div>
        
        <motion.div 
            className="absolute inset-0"
            animate={{ rotate: -360 }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        >
             <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-3 p-2 rounded-full shadow-xl ${
               isDark ? 'bg-[#050505] border border-white/5' : 'bg-white border border-slate-200'
             }`}>
                 <Lock className="w-4 h-4 text-cyan-400" />
             </div>
        </motion.div>

        {/* Central Core */}
        <div className={`relative z-10 w-36 h-36 sm:w-44 sm:h-44 md:w-48 md:h-48 rounded-full backdrop-blur-xl flex flex-col items-center justify-center shadow-2xl overflow-hidden ${
          isDark ? 'bg-black/60 border border-white/10' : 'bg-white border border-slate-200'
        }`}>
            {/* Subtle Inner Scan Line - REFINED */}
            <motion.div 
                animate={{ top: ['0%', '100%', '0%'] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 right-0 h-px bg-primary/30 blur-[2px] w-full z-0"
            />
            
            <div className="relative z-10 flex flex-col items-center">
                <span className={`text-5xl sm:text-6xl font-black font-mono tracking-tighter tabular-nums ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {Math.round(progress)}<span className="text-base sm:text-lg text-primary">%</span>
                </span>
                <span className="text-[10px] text-slate-500 mt-2 font-mono tracking-[0.3em] animate-pulse">{t('scan.scanning')}</span>
            </div>
        </div>
      </div>

      {/* Info Panel */}
      <div className={`w-full max-w-2xl relative z-10 rounded-[2rem] p-6 md:p-8 backdrop-blur-xl shadow-2xl ${
        isDark ? 'bg-[#0A0A0A] border border-white/5' : 'bg-white border border-slate-200'
      }`}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4 text-right" dir="rtl">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
                    <Activity className="w-6 h-6 text-primary animate-pulse" />
                </div>
                <div>
                    <h3 className={`font-black text-lg tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{t('scan.network')}</h3>
                    <p className="text-[10px] text-slate-500 font-mono tracking-widest">{connection ? `ISP: ${connection.isp.toUpperCase()}` : t('scan.wait')}</p>
                </div>
            </div>
            <div className="text-left">
                <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mb-1">{t('scan.current')}</p>
                <p
                  className="text-sm font-bold text-emerald-400 font-mono truncate max-w-[220px] md:max-w-[320px]"
                  title={currentDns || t('scan.wait')}
                >
                  {currentDns || t('scan.wait')}
                </p>
            </div>
        </div>
        
        {/* Progress Bar - CLEANED (No White Shimmer) */}
        <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden mb-8">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-gradient-to-r from-primary via-indigo-500 to-cyan-400 relative shadow-[0_0_15px_rgba(99,102,241,0.3)]"
          />
        </div>
        
        {/* Status Blocks */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-[9px] uppercase tracking-widest">
          {[
            { step: t('scan.step.resolver'), status: progress > 10 ? 'OK' : '...' },
            { step: t('scan.step.latency'), status: progress > 30 ? 'OK' : '...' },
            { step: t('scan.step.packet'), status: progress > 60 ? 'OK' : '...' },
            { step: t('scan.step.route'), status: progress > 85 ? 'OK' : '...' },
          ].map((item, i) => (
             <div key={i} className={`flex justify-between items-center p-3 rounded-xl border transition-all duration-500 ${
                 item.status === 'OK' 
                 ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400 shadow-[inset_0_0_10px_rgba(16,185,129,0.05)]' 
                 : 'bg-white/5 border-white/5 text-slate-600'
             }`}>
                <span className="font-bold">{item.step}</span>
                <span className={`font-black ${item.status === 'OK' ? 'animate-pulse' : ''}`}>{item.status}</span>
             </div>
          ))}
        </div>
      </div>
    </div>
  );
};
