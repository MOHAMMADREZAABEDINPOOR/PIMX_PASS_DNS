import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Scanning } from './components/Scanning';
import { ResultCard } from './components/ResultCard';
import { Preloader } from './components/Preloader'; // Import Preloader
import { Footer } from './components/Footer'; // Import Footer
import { DNS_LIST } from './constants';
import { DnsResult, AppState, UserConnection } from './types';
import { RefreshCw, ArrowRight, Activity, Terminal } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { runBatchTest } from './services/pingService';
import { useI18n } from './i18n';
import { AdminPanel } from './components/AdminPanel';
import { normalizeLocation, recordTest, recordVisit } from './analytics';

const App: React.FC = () => {
  const LAST_RESULTS_KEY = 'pimxpassdns_last_results_v1';
  const [loading, setLoading] = useState(true); // Preloader state
  const [state, setState] = useState<AppState>('home');
  const [results, setResults] = useState<DnsResult[]>([]);
  const [progress, setProgress] = useState(0);
  const [currentTesting, setCurrentTesting] = useState('');
  const [connection, setConnection] = useState<UserConnection | null>(null);
  const [sampleSize, setSampleSize] = useState<number>(70);
  const [customSample, setCustomSample] = useState<string>('70');
  const [isCancelled, setIsCancelled] = useState(false);
  const cancelRef = useRef(false);
  const [showScanModal, setShowScanModal] = useState(false);
  const completedRef = useRef(0);
  const { t, lang, dir, setLang } = useI18n();
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const stored = localStorage.getItem('pimxpassdns_theme') as 'dark' | 'light' | null;
      if (stored === 'dark' || stored === 'light') return stored;
    } catch {
      // ignore
    }
    const hour = new Date().getHours();
    return hour >= 7 && hour < 19 ? 'light' : 'dark';
  });
  const [lastResults, setLastResults] = useState<{
    results: DnsResult[];
    connection: UserConnection | null;
    cancelled: boolean;
    sampleSize: number;
    timestamp: number;
  } | null>(null);
  const [useCached, setUseCached] = useState(false);
  
  // Theme Management - Force Dark for Cyberpunk theme
  const isDark = theme === 'dark';

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.classList.toggle('light', theme === 'light');
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    document.title = t('app.title');
  }, [lang, dir, t]);

  useEffect(() => {
    const pathname = window.location.pathname.replace(/\/+$/, '');
    const isAdminRoute = pathname.endsWith('/pimxpassdnsadmin');
    let robotsMeta = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    if (!robotsMeta) {
      robotsMeta = document.createElement('meta');
      robotsMeta.name = 'robots';
      document.head.appendChild(robotsMeta);
    }
    robotsMeta.content = isAdminRoute
      ? 'noindex, nofollow, noarchive'
      : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LAST_RESULTS_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!parsed || !Array.isArray(parsed.results)) return;
      setLastResults(parsed);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    // Advanced ISP Detection with WebRTC Leak Attempt
    const detectISP = async () => {
      // Helper to check if IP is public (not local)
      const isPublicIP = (ip: string) => {
        const parts = ip.split('.').map(Number);
        if (parts[0] === 10) return false;
        if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return false;
        if (parts[0] === 192 && parts[1] === 168) return false;
        if (parts[0] === 127) return false;
        return true;
      };

      let detectedRealIp = '';

      // 1. Try WebRTC to find real IP (Bypasses some VPN/Proxy configurations)
      try {
        const rtcPromise = new Promise<string>((resolve) => {
             const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
             pc.createDataChannel("");
             pc.createOffer().then(o => pc.setLocalDescription(o));
             
             let resolved = false;
             
             pc.onicecandidate = (ice) => {
                 if (!resolved && ice && ice.candidate && ice.candidate.candidate) {
                     const match = ice.candidate.candidate.match(/([0-9]{1,3}(\.[0-9]{1,3}){3})/);
                     if (match && isPublicIP(match[1])) {
                         resolved = true;
                         pc.close();
                         resolve(match[1]);
                     }
                 }
             };
             
             // Timeout after 1s
             setTimeout(() => {
                 if (!resolved) {
                    // Cleanup
                    try { pc.close(); } catch(e){}
                    resolve('');
                 }
             }, 1000);
        });
        detectedRealIp = await rtcPromise;
      } catch (e) {
        console.log('WebRTC detection blocked or failed', e);
      }

      // 2. Fallback Strategy for API Calls
      const apiSources = [
        // Strategy A: ipwho.is (Best data)
        async () => {
           const endpoint = detectedRealIp ? `https://ipwho.is/${detectedRealIp}` : 'https://ipwho.is/';
           const res = await fetch(endpoint);
           const data = await res.json();
           if (!data.success) throw new Error('API Success False');
           return {
             ip: data.ip,
             isp: data.connection?.isp || data.connection?.org || data.isp,
             country: data.country,
             city: data.city
           };
        },
        // Strategy B: ipapi.co (Reliable fallback)
        async () => {
           const res = await fetch('https://ipapi.co/json/');
           const data = await res.json();
           if (data.error) throw new Error('API Error');
           return {
             ip: data.ip,
             isp: data.org || data.asn,
             country: data.country_name,
             city: data.city
           };
        },
        // Strategy C: db-ip.com (Simple, no ISP usually but gets Location)
        async () => {
            const res = await fetch('https://api.db-ip.com/v2/free/self');
            const data = await res.json();
            return {
                ip: data.ipAddress,
                isp: 'Unknown ISP', 
                country: data.countryName,
                city: data.city
            };
        }
      ];

      // Execute Strategies Sequentially
      for (const strategy of apiSources) {
          try {
              const result = await strategy();
              setConnection(result);
              return; // Exit on first success
          } catch (e) {
              // Continue to next strategy
          }
      }

      // Final Fallback (If offline or all APIs blocked)
      console.warn("All ISP detection methods failed.");
      setConnection({
          ip: detectedRealIp || '127.0.0.1',
          isp: 'Network Unavailable',
          country: 'Unknown',
          city: 'Unknown'
      });
    };

    detectISP();
  }, []);

  const toggleTheme = () => {
    const next = isDark ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('pimxpassdns_theme', next);
  };

  const shuffleList = (list: DnsResult[] | any[]) => {
    const arr = [...list];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const buildDisplayResults = (items: DnsResult[]) => {
    const groups: Record<string, DnsResult[]> = {};
    items.forEach(item => {
      if (!groups[item.provider]) groups[item.provider] = [];
      groups[item.provider].push(item);
    });
    const finalDisplayList: DnsResult[] = [];
    Object.values(groups).forEach(group => {
      const sortedGroup = group.sort((a, b) => a.latency - b.latency);
      const best = sortedGroup[0];
      if (sortedGroup.length > 1) best.variants = sortedGroup.slice(1);
      finalDisplayList.push(best);
    });
    return finalDisplayList.sort((a, b) => {
      if (a.status !== 'success' && b.status === 'success') return 1;
      if (a.status === 'success' && b.status !== 'success') return -1;
      return a.latency - b.latency;
    });
  };

  const saveLastResults = (items: DnsResult[], cancelled: boolean) => {
    const display = buildDisplayResults(items).slice(0, 50);
    const payload = {
      results: display,
      connection,
      cancelled,
      sampleSize: Math.min(sampleSize, DNS_LIST.length),
      timestamp: Date.now()
    };
    localStorage.setItem(LAST_RESULTS_KEY, JSON.stringify(payload));
    setLastResults(payload);
  };

  const startScan = async () => {
    setShowScanModal(false);
    setState('scanning');
    setResults([]);
    setProgress(0);
    setIsCancelled(false);
    setUseCached(false);
    cancelRef.current = false;
    completedRef.current = 0;

    const tempResults: DnsResult[] = [];
    const total = Math.min(sampleSize, DNS_LIST.length);
    let completed = 0;

    const listToTest = shuffleList(DNS_LIST).slice(0, total);

    await runBatchTest(listToTest, (result) => {
      tempResults.push(result);
      setResults([...tempResults]);
      completed++;
      completedRef.current = completed;
      setProgress((completed / total) * 100);
      setCurrentTesting(result.primary);
    }, () => cancelRef.current);

    const sorted = tempResults.sort((a, b) => {
      // Prioritize success
      if (a.status !== 'success' && b.status === 'success') return 1;
      if (a.status === 'success' && b.status !== 'success') return -1;
      // Then latency
      return a.latency - b.latency;
    });

    setResults(sorted);
    recordTest(completedRef.current);
    saveLastResults(tempResults, false);
    setState('results');
  };

  const cancelScan = () => {
    const currentResults = results;
    cancelRef.current = true;
    setIsCancelled(true);
    setResults((prev) => [...prev].sort((a, b) => {
      if (a.status !== 'success' && b.status === 'success') return 1;
      if (a.status === 'success' && b.status !== 'success') return -1;
      return a.latency - b.latency;
    }));
    recordTest(completedRef.current);
    saveLastResults(currentResults, true);
    setState('results');
  };

  const handleRestart = () => {
    setState('home');
    setResults([]);
    setUseCached(false);
  };

  // Grouping Logic
  const processedResults = useMemo(() => buildDisplayResults(results), [results]);
  const displayResults = useMemo(() => {
    if (useCached && lastResults?.results?.length) return lastResults.results;
    return processedResults;
  }, [useCached, lastResults, processedResults]);

  const sampleOptions = [20, 70, 150, 300];

  const applyCustomSample = () => {
    const parsed = parseInt(customSample, 10);
    if (!Number.isFinite(parsed) || parsed <= 0) return;
    setSampleSize(Math.min(parsed, DNS_LIST.length));
  };

  const openScanModal = () => {
    setShowScanModal(true);
  };

  const openPreviousResults = () => {
    if (!lastResults) return;
    setUseCached(true);
    setIsCancelled(lastResults.cancelled);
    if (lastResults.connection) setConnection(lastResults.connection);
    setState('results');
  };

  useEffect(() => {
    const tick = () => {
      if (document.visibilityState !== 'visible') return;
      recordVisit(normalizeLocation(connection?.country, connection?.city));
    };
    tick();
    const id = setInterval(tick, 60 * 1000);
    const onVisible = () => {
      if (document.visibilityState === 'visible') tick();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [connection]);

  const pathname = window.location.pathname.replace(/\/+$/, '');
  const isAdminRoute = pathname.endsWith('/pimxpassdnsadmin');

  if (isAdminRoute) {
    return (
      <div className="min-h-screen text-slate-200">
        <Header
          isDark={isDark}
          toggleTheme={toggleTheme}
          lang={lang}
          setLang={setLang}
          showHome
          onHome={() => window.location.assign('/')}
        />
        <main className="container mx-auto pt-28 pb-10">
          <AdminPanel />
        </main>
      </div>
    );
  }

  return (
    <>
      <AnimatePresence>
        {loading && <Preloader onComplete={() => setLoading(false)} isDark={isDark} />}
      </AnimatePresence>

      {!loading && (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="min-h-screen text-slate-200"
        >
          <Header
            isDark={isDark}
            toggleTheme={toggleTheme}
            lang={lang}
            setLang={setLang}
            showHome={state !== 'home'}
            onHome={handleRestart}
          />

          {/* Scan Size Modal */}
          <AnimatePresence>
            {showScanModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm px-4 ${
                  isDark ? 'bg-black/70' : 'bg-white/70'
                }`}
              >
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 20, opacity: 0 }}
                  className={`w-full max-w-5xl rounded-3xl p-6 md:p-8 shadow-2xl ${
                    isDark
                      ? 'bg-white/5 border border-white/10'
                      : 'bg-white border border-slate-200 text-slate-900'
                  }`}
                >
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                    <div>
                      <h3 className={`text-sm font-black tracking-widest uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>{t('modal.title')}</h3>
                      <p className={`text-xs font-mono ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{t('modal.subtitle')}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {sampleOptions.map((count) => (
                        <button
                          key={count}
                          onClick={() => { setSampleSize(Math.min(count, DNS_LIST.length)); setCustomSample(String(count)); }}
                          className={`px-4 py-2 rounded-xl font-black text-xs tracking-wider border transition-all ${
                            sampleSize === Math.min(count, DNS_LIST.length)
                              ? (isDark ? 'bg-white text-black border-white' : 'bg-primary text-white border-primary')
                              : (isDark ? 'bg-white/10 text-white border-white/10 hover:border-primary/60' : 'bg-slate-100 text-slate-700 border-slate-200 hover:border-primary/60')
                          }`}
                        >
                          {count}
                        </button>
                      ))}
                      <button
                        onClick={() => { setSampleSize(DNS_LIST.length); setCustomSample(String(DNS_LIST.length)); }}
                        className={`px-4 py-2 rounded-xl font-black text-xs tracking-wider border transition-all ${
                          sampleSize === DNS_LIST.length
                            ? (isDark ? 'bg-white text-black border-white' : 'bg-primary text-white border-primary')
                            : (isDark ? 'bg-white/10 text-white border-white/10 hover:border-primary/60' : 'bg-slate-100 text-slate-700 border-slate-200 hover:border-primary/60')
                        }`}
                      >
                        ALL
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-500 font-mono">{t('modal.custom')}</span>
                      <input
                        value={customSample}
                        onChange={(e) => setCustomSample(e.target.value)}
                        onBlur={applyCustomSample}
                        className={`px-3 py-2 rounded-lg text-sm w-28 md:w-32 focus:outline-none focus:border-primary/60 ${
                          isDark
                            ? 'bg-black/40 border border-white/10 text-white'
                            : 'bg-white border border-slate-200 text-slate-900'
                        }`}
                        placeholder="e.g. 120"
                      />
                      <button
                        onClick={applyCustomSample}
                        className={`px-4 py-2 rounded-lg font-black text-xs tracking-wider transition-colors ${
                          isDark ? 'bg-primary text-black hover:bg-white' : 'bg-primary text-white hover:bg-indigo-500'
                        }`}
                      >
                        {t('modal.apply')}
                      </button>
                      <div className="text-xs text-slate-600 font-mono">/ {DNS_LIST.length} total</div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setShowScanModal(false)}
                        className={`px-4 py-2 rounded-xl font-black text-xs tracking-wider border ${
                          isDark ? 'bg-white/10 text-white border-white/10 hover:border-white/40' : 'bg-slate-100 text-slate-700 border-slate-200 hover:border-primary/60'
                        }`}
                      >
                        {t('modal.cancel')}
                      </button>
                      <button
                        onClick={startScan}
                        className={`px-5 py-2.5 rounded-xl font-black text-xs tracking-wider transition-colors ${
                          isDark
                            ? 'bg-white text-black hover:bg-primary shadow-[0_0_15px_rgba(255,255,255,0.2)]'
                            : 'bg-primary text-white hover:bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.3)]'
                        }`}
                      >
                        {t('modal.start')}
                      </button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <main className="container mx-auto pb-20 pt-28 relative">
            {state === 'home' && (
              <Hero
                onStart={openScanModal}
                connection={connection}
                isDark={isDark}
                onOpenPrevious={openPreviousResults}
                hasPrevious={!!lastResults?.results?.length}
              />
            )}

            {state === 'scanning' && (
              <>
                <Scanning progress={progress} currentDns={currentTesting} connection={connection} isDark={isDark} />
                <div className="max-w-5xl mx-auto px-4 mt-6">
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5 backdrop-blur-md flex items-center justify-between">
                    <div className="text-xs text-slate-500 font-mono">
                      {t('scan.count')} {Math.min(sampleSize, DNS_LIST.length)}
                    </div>
                    <button
                      onClick={cancelScan}
                      className="px-4 py-2 rounded-xl bg-white text-black font-black text-xs tracking-wider hover:bg-primary transition-colors"
                    >
                      {t('scan.stop')}
                    </button>
                  </div>
                </div>
              </>
            )}

            {state === 'results' && (
              <div className="max-w-5xl mx-auto px-4">
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4 bg-white/5 p-6 rounded-2xl border border-white/5 backdrop-blur-md"
                >
                  <div>
                    <h2 className="text-3xl font-black text-white mb-2 flex items-center gap-2">
                      <Terminal className="text-primary" />
                      {t('results.title')}
                    </h2>
                    <p className="text-slate-400 font-mono text-xs">
                       {t('results.optimized')}: <span className="text-emerald-400 font-bold">{connection?.isp || t('results.unknown')}</span>
                       {isCancelled && <span className="ml-2 text-rose-400">{t('results.stopped')}</span>}
                    </p>
                  </div>
                  <button 
                    onClick={handleRestart}
                    className="flex items-center gap-2 px-6 py-3 bg-white text-black font-black rounded-xl hover:bg-primary hover:text-white transition-all shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                  >
                    <RefreshCw className="w-4 h-4" />
                    {t('results.new')}
                  </button>
                </motion.div>

                {/* Staggered Results List */}
                <motion.div 
                    initial="hidden"
                    animate="visible"
                    variants={{
                        visible: { transition: { staggerChildren: 0.1 } }
                    }}
                    className="space-y-4"
                >
                  {displayResults.slice(0, 50).map((result, index) => (
                    <ResultCard 
                      key={result.id} 
                      data={result} 
                      rank={index + 1}
                      isDark={isDark}
                    />
                  ))}
                </motion.div>
                
                <div className="mt-16 text-center border-t border-white/10 pt-8">
                  <p className="text-slate-600 text-[10px] mb-4 font-mono tracking-[0.3em]">
                    SECURE CONNECTION ESTABLISHED
                  </p>
                  <button onClick={handleRestart} className="text-primary hover:text-white flex items-center justify-center gap-2 mx-auto font-bold transition-colors">
                    {t('results.footer')} <ArrowRight className="w-4 h-4 rotate-180" />
                  </button>
                </div>
              </div>
            )}
          </main>
          <Footer />
        </motion.div>
      )}
    </>
  );
};

export default App;
