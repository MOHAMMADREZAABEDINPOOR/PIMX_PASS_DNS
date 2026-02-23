import React, { useMemo, useState } from 'react';
import { Copy, Check, Server, Globe, ChevronDown, Info, BookOpen, Smartphone, Monitor, X } from 'lucide-react';
import { DnsResult } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '../i18n';

interface ResultCardProps {
  data: DnsResult;
  rank: number;
}

export const ResultCard: React.FC<ResultCardProps> = ({ data, rank }) => {
  const [copied, setCopied] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const { t, lang } = useI18n();

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const isTopRank = rank <= 3;
  const rankColors = {
      1: 'from-yellow-500 to-orange-500',
      2: 'from-slate-300 to-slate-400',
      3: 'from-orange-700 to-amber-800'
  };

  const getLatencyColor = (ms: number) => {
      if (ms < 50) return 'text-emerald-400';
      if (ms < 100) return 'text-emerald-200';
      if (ms < 180) return 'text-yellow-400';
      return 'text-rose-400';
  };

  const latencySupported = data.protocol !== 'dnscrypt';
  const latencyLabel = latencySupported ? `${data.latency}ms` : (lang === 'fa' ? 'ناموجود' : 'N/A');
  const variantsToShow = useMemo(() => data.variants?.slice(0, 5) ?? [], [data.variants]);
  const moreVariants = data.variants && data.variants.length > 5 ? data.variants.length - 5 : 0;

  const extractHost = (value: string) => {
    try {
      if (value.startsWith('http://') || value.startsWith('https://')) {
        return new URL(value).hostname;
      }
      if (value.includes('://')) {
        const asUrl = new URL(value);
        return asUrl.hostname;
      }
    } catch {
      // ignore
    }
    return value.replace(/^tls:\/\//, '').trim();
  };

  const isIPv4 = (value: string) => /^\d{1,3}(\.\d{1,3}){3}$/.test(value);
  const host = extractHost(data.primary);
  const isDoH = data.protocol === 'doh' || data.protocol === 'doh3' || data.primary.startsWith('https://');
  const phonePrivateDns = !isIPv4(host) && !host.startsWith('sdns://') ? host : t('guide.notSupported');
  const phoneCustomDoH = isDoH ? data.primary : host;
  const pcDnsValue = isIPv4(data.primary) ? data.primary : t('guide.useUrl');
  const browserValue = isDoH ? data.primary : host;

  return (
    <>
      <motion.div
        layout
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 }
        }}
        whileHover={{ y: -2, transition: { duration: 0.2 } }}
        className={`relative rounded-2xl overflow-hidden group border border-white/5 bg-[#0F0F0F]/80 backdrop-blur-sm`}
      >
        {/* Glow Effect on Hover */}
        <div className="absolute -inset-px bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-30 transition-opacity duration-500 blur-sm rounded-2xl pointer-events-none"></div>

        {/* Top Rank Highlight Line */}
        {isTopRank && (
            <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${rankColors[rank as keyof typeof rankColors]} opacity-80`}></div>
        )}

        <div className="p-5 relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                
                {/* Left: Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-lg font-black font-mono text-sm ${isTopRank ? 'bg-white text-black' : 'bg-white/10 text-white'}`}>
                            #{rank}
                        </div>
                        <h3 className="text-xl font-bold text-white truncate">{data.name}</h3>
                        {data.location && (
                             <span className="hidden sm:inline-flex px-2 py-0.5 rounded text-[10px] bg-white/5 text-slate-400 border border-white/5 uppercase tracking-wide">
                                 {data.location}
                             </span>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-2 pl-11">
                         {data.tags.slice(0, 3).map(tag => (
                             <span key={tag} className="text-[10px] text-slate-400 font-mono bg-white/5 px-1.5 py-0.5 rounded">
                                 {tag}
                             </span>
                         ))}
                         {data.protocol && (
                             <span className="text-[10px] text-slate-300 font-mono bg-white/10 px-1.5 py-0.5 rounded uppercase">
                                 {data.protocol}
                             </span>
                         )}
                    </div>
                </div>

                {/* Center: Metrics */}
                <div className="flex items-center gap-4 pl-11 md:pl-0">
                    <div className="text-right">
                        <div className={`text-2xl font-black font-mono leading-none ${latencySupported ? getLatencyColor(data.latency) : 'text-slate-500'}`}>
                            {latencyLabel}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">{t('card.latency')}</div>
                    </div>
                    <div className="w-px h-8 bg-white/10"></div>
                    <div className="text-right">
                        <div className="text-lg font-bold font-mono text-slate-300 leading-none">
                            {data.jitter}<span className="text-xs ml-1 opacity-50">ms</span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">{t('card.jitter')}</div>
                    </div>
                </div>

                {/* Right: Copy IPs (Compact) */}
                <div className="flex flex-col gap-2 w-full md:w-auto">
                    <div className="flex items-center gap-2 bg-black/40 rounded-lg p-1 pr-3 border border-white/5 hover:border-white/20 transition-colors">
                         <button 
                            onClick={() => handleCopy(data.primary, 'primary')} 
                            className="p-1.5 rounded bg-white/10 hover:bg-emerald-500 hover:text-black text-slate-400 transition-colors"
                         >
                            {copied === 'primary' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                         </button>
                         <code className="font-mono text-sm text-slate-300 truncate max-w-[200px] md:max-w-[260px]" title={data.primary}>{data.primary}</code>
                         <span className="text-[10px] text-slate-600 ml-auto font-mono">{t('card.primary')}</span>
                    </div>
                    {data.secondary && (
                        <div className="flex items-center gap-2 bg-black/40 rounded-lg p-1 pr-3 border border-white/5 hover:border-white/20 transition-colors">
                             <button 
                                onClick={() => handleCopy(data.secondary, 'secondary')} 
                                className="p-1.5 rounded bg-white/10 hover:bg-emerald-500 hover:text-black text-slate-400 transition-colors"
                             >
                                {copied === 'secondary' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                             </button>
                             <code className="font-mono text-sm text-slate-300 truncate max-w-[200px] md:max-w-[260px]" title={data.secondary}>{data.secondary}</code>
                             <span className="text-[10px] text-slate-600 ml-auto font-mono">{t('card.secondary')}</span>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Description & Expansion Trigger */}
            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                <p className="text-xs text-slate-500 line-clamp-1 flex-1 pr-4">
                    {data.description || t('card.noDesc')}
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowGuide(true)}
                    className="text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
                  >
                    <BookOpen className="w-3 h-3" />
                    {t('guide.open')}
                  </button>
                  <button
                      onClick={() => setExpanded(!expanded)}
                      className="text-xs font-bold text-primary hover:text-white transition-colors flex items-center gap-1"
                  >
                      {expanded ? t('card.less') : t('card.more')} <ChevronDown className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                  </button>
                </div>
            </div>
        </div>

        {/* Expanded Content */}
        <AnimatePresence>
            {expanded && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="bg-black/20 border-t border-white/5"
                >
                    <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* IPv6 */}
                        <div>
                            <h4 className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Globe className="w-3 h-3" /> {t('card.ipv6')}
                            </h4>
                            {data.primaryIPv6 ? (
                                <div className="space-y-2">
                                    <div onClick={() => handleCopy(data.primaryIPv6!, 'v6p')} className="cursor-pointer group/v6 p-2 rounded border border-dashed border-slate-700 hover:border-emerald-500/50 transition-colors">
                                        <div className="text-[10px] text-slate-500 mb-1">{t('card.ipv6.primary')}</div>
                                        <code className="text-xs text-slate-300 font-mono break-all">{data.primaryIPv6}</code>
                                    </div>
                                    {data.secondaryIPv6 && (
                                        <div onClick={() => handleCopy(data.secondaryIPv6!, 'v6s')} className="cursor-pointer group/v6 p-2 rounded border border-dashed border-slate-700 hover:border-emerald-500/50 transition-colors">
                                            <div className="text-[10px] text-slate-500 mb-1">{t('card.ipv6.secondary')}</div>
                                            <code className="text-xs text-slate-300 font-mono break-all">{data.secondaryIPv6}</code>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-xs text-slate-600 italic">{t('card.ipv6.none')}</div>
                            )}
                        </div>

                        {/* Variants */}
                        <div>
                            <h4 className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Server className="w-3 h-3" /> {t('card.alt')}
                            </h4>
                            <div className="text-[10px] text-slate-500 mb-3">{t('card.alt.help')}</div>
                            {variantsToShow.length > 0 ? (
                                <div className="space-y-2">
                                    {variantsToShow.map((v, i) => (
                                        <div key={i} className="flex items-center justify-between p-2 bg-white/5 rounded">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-1.5 h-1.5 rounded-full ${v.latency < 150 ? 'bg-emerald-500' : 'bg-yellow-500'}`}></div>
                                                <span className="text-xs text-slate-300 font-bold">{v.name}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs font-mono text-slate-400">{v.latency}ms</span>
                                                <button onClick={() => handleCopy(v.primary, `v${i}`)} className="text-[10px] px-2 py-1 bg-white/10 rounded hover:bg-primary hover:text-white transition-colors">
                                                    {t('card.copy')}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {moreVariants > 0 && (
                                      <div className="text-[10px] text-slate-500">
                                        {lang === 'fa' ? `+${moreVariants} ${t('card.more.count')}` : `+${moreVariants} ${t('card.more.count')}`}
                                      </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-xs text-slate-600 italic">{t('card.alt.none')}</div>
                            )}
                        </div>

                        {/* Source */}
                        <div className="md:col-span-2">
                            <h4 className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Info className="w-3 h-3" /> {t('card.source')}
                            </h4>
                            <div className="text-xs text-slate-600 break-all">
                                {data.source || t('card.local')}
                            </div>
                        </div>

                        {/* Quick Setup Values */}
                        <div className="md:col-span-2">
                            <h4 className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-3">
                              {t('guide.for')}
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                              <div className="bg-white/5 rounded p-2 border border-white/10">
                                <div className="text-[10px] text-slate-500 mb-1">{t('guide.phone')}</div>
                                <code className="text-xs text-slate-300 break-all" title={phonePrivateDns}>{phonePrivateDns}</code>
                              </div>
                              <div className="bg-white/5 rounded p-2 border border-white/10">
                                <div className="text-[10px] text-slate-500 mb-1">{t('guide.pc')}</div>
                                <code className="text-xs text-slate-300 break-all" title={pcDnsValue}>{pcDnsValue}</code>
                              </div>
                              <div className="bg-white/5 rounded p-2 border border-white/10">
                                <div className="text-[10px] text-slate-500 mb-1">{t('guide.browser')}</div>
                                <code className="text-xs text-slate-300 break-all" title={browserValue}>{browserValue}</code>
                              </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {showGuide && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center px-4"
            onClick={() => setShowGuide(false)}
          >
            <motion.div
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 16, opacity: 0 }}
              className="w-full max-w-2xl rounded-2xl bg-[#0f1117] border border-white/10 p-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-black text-white">{t('guide.title')}</h3>
                  <p className="text-xs text-slate-400">{data.name}</p>
                </div>
                <button onClick={() => setShowGuide(false)} className="p-2 rounded bg-white/10 hover:bg-white/20 text-slate-300">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="text-sm font-bold text-white mb-2 flex items-center gap-2"><Smartphone className="w-4 h-4 text-emerald-400" /> {t('guide.phone')}</div>
                  <div className="text-xs text-slate-400 mb-1">{t('guide.privateDns')}</div>
                  <div className="flex items-center gap-2">
                    <code className="text-xs text-slate-200 break-all flex-1">{phonePrivateDns}</code>
                    <button onClick={() => handleCopy(phonePrivateDns, 'phone')} className="text-[10px] px-2 py-1 rounded bg-white/10 hover:bg-primary">{t('guide.copy')}</button>
                  </div>
                  <div className="text-xs text-slate-400 mt-2">{t('guide.customDoh')}</div>
                  <div className="flex items-center gap-2">
                    <code className="text-xs text-slate-200 break-all flex-1">{phoneCustomDoH}</code>
                    <button onClick={() => handleCopy(phoneCustomDoH, 'phoneDoh')} className="text-[10px] px-2 py-1 rounded bg-white/10 hover:bg-primary">{t('guide.copy')}</button>
                  </div>
                  <div className="text-xs text-emerald-400 mt-2">{t('guide.androidApp')}: {t('guide.androidApp.value')}</div>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="text-sm font-bold text-white mb-2 flex items-center gap-2"><Monitor className="w-4 h-4 text-cyan-400" /> {t('guide.pc')}</div>
                  <div className="text-xs text-slate-400 mb-1">{t('guide.windows')}</div>
                  <div className="flex items-center gap-2">
                    <code className="text-xs text-slate-200 break-all flex-1">{pcDnsValue}</code>
                    <button onClick={() => handleCopy(pcDnsValue, 'pc')} className="text-[10px] px-2 py-1 rounded bg-white/10 hover:bg-primary">{t('guide.copy')}</button>
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="text-sm font-bold text-white mb-2 flex items-center gap-2"><Globe className="w-4 h-4 text-indigo-400" /> {t('guide.browser')}</div>
                  <div className="text-xs text-slate-400 mb-1">{t('guide.customDoh')}</div>
                  <div className="flex items-center gap-2">
                    <code className="text-xs text-slate-200 break-all flex-1">{browserValue}</code>
                    <button onClick={() => handleCopy(browserValue, 'browser')} className="text-[10px] px-2 py-1 rounded bg-white/10 hover:bg-primary">{t('guide.copy')}</button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
