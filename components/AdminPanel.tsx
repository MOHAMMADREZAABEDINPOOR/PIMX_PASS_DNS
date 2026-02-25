import React, { useMemo, useState, useEffect, useId } from 'react';
import { useI18n } from '../i18n';
import { getAnalytics } from '../analytics';

const USERNAME = 'PIMX_PASS';
const PASSWORD = '123456789PIMX_PASS@#$%^&';

const ranges = [
  { key: '1m', ms: 1 * 60 * 1000, fa: '۱ دقیقه', en: '1 min' },
  { key: '3m', ms: 3 * 60 * 1000, fa: '۳ دقیقه', en: '3 min' },
  { key: '5m', ms: 5 * 60 * 1000, fa: '۵ دقیقه', en: '5 min' },
  { key: '7m', ms: 7 * 60 * 1000, fa: '۷ دقیقه', en: '7 min' },
  { key: '10m', ms: 10 * 60 * 1000, fa: '۱۰ دقیقه', en: '10 min' },
  { key: '30m', ms: 30 * 60 * 1000, fa: '۳۰ دقیقه', en: '30 min' },
  { key: '1h', ms: 1 * 60 * 60 * 1000, fa: '۱ ساعت', en: '1 hour' },
  { key: '2h', ms: 2 * 60 * 60 * 1000, fa: '۲ ساعت', en: '2 hours' },
  { key: '3h', ms: 3 * 60 * 60 * 1000, fa: '۳ ساعت', en: '3 hours' },
  { key: '5h', ms: 5 * 60 * 60 * 1000, fa: '۵ ساعت', en: '5 hours' },
  { key: '10h', ms: 10 * 60 * 60 * 1000, fa: '۱۰ ساعت', en: '10 hours' },
  { key: '17h', ms: 17 * 60 * 60 * 1000, fa: '۱۷ ساعت', en: '17 hours' },
  { key: '22h', ms: 22 * 60 * 60 * 1000, fa: '۲۲ ساعت', en: '22 hours' },
  { key: '1d', ms: 1 * 24 * 60 * 60 * 1000, fa: '۱ روز', en: '1 day' },
  { key: '2d', ms: 2 * 24 * 60 * 60 * 1000, fa: '۲ روز', en: '2 days' },
  { key: '3d', ms: 3 * 24 * 60 * 60 * 1000, fa: '۳ روز', en: '3 days' },
  { key: '5d', ms: 5 * 24 * 60 * 60 * 1000, fa: '۵ روز', en: '5 days' },
  { key: '7d', ms: 7 * 24 * 60 * 60 * 1000, fa: '۷ روز', en: '7 days' },
  { key: '9d', ms: 9 * 24 * 60 * 60 * 1000, fa: '۹ روز', en: '9 days' },
  { key: '10d', ms: 10 * 24 * 60 * 60 * 1000, fa: '۱۰ روز', en: '10 days' }
];

const bucketize = (events: { t: number; value?: number }[], rangeMs: number, buckets = 12) => {
  const now = Date.now();
  const start = now - rangeMs;
  const size = Math.max(1, Math.floor(rangeMs / buckets));
  const data = new Array(buckets).fill(0);

  for (const e of events) {
    if (e.t < start) continue;
    const idx = Math.min(buckets - 1, Math.floor((e.t - start) / size));
    data[idx] += e.value ?? 1;
  }

  return data;
};

type FormatFn = (value: number) => string;

const getStats = (data: number[]) => {
  const total = data.reduce((a, b) => a + b, 0);
  const max = Math.max(0, ...data);
  const min = data.length ? Math.min(...data) : 0;
  const avg = data.length ? total / data.length : 0;
  return { total, max, min, avg };
};

const ChartMeta: React.FC<{ data: number[]; format: FormatFn; labels: { total: string; avg: string; max: string; min: string } }> = ({ data, format, labels }) => {
  const stats = getStats(data);
  return (
    <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px] text-slate-500">
      <div className="flex items-center justify-between gap-2 bg-white/5 border border-white/10 rounded-lg px-2 py-1">
        <span>{labels.total}</span>
        <span className="font-bold text-[11px]" style={{ color: 'var(--chart-text)' }}>{format(stats.total)}</span>
      </div>
      <div className="flex items-center justify-between gap-2 bg-white/5 border border-white/10 rounded-lg px-2 py-1">
        <span>{labels.avg}</span>
        <span className="font-bold text-[11px]" style={{ color: 'var(--chart-text)' }}>{format(Math.round(stats.avg))}</span>
      </div>
      <div className="flex items-center justify-between gap-2 bg-white/5 border border-white/10 rounded-lg px-2 py-1">
        <span>{labels.max}</span>
        <span className="font-bold text-[11px]" style={{ color: 'var(--chart-text)' }}>{format(stats.max)}</span>
      </div>
      <div className="flex items-center justify-between gap-2 bg-white/5 border border-white/10 rounded-lg px-2 py-1">
        <span>{labels.min}</span>
        <span className="font-bold text-[11px]" style={{ color: 'var(--chart-text)' }}>{format(stats.min)}</span>
      </div>
    </div>
  );
};

const LineChart: React.FC<{ data: number[]; format: FormatFn }> = ({ data, format }) => {
  const id = useId();
  const max = Math.max(1, ...data);
  const points = data.map((v, i) => {
    const x = data.length === 1 ? 50 : (i / (data.length - 1)) * 100;
    const y = 92 - (v / max) * 70;
    return { x, y, v };
  });
  const linePoints = points.map(p => `${p.x},${p.y}`).join(' ');
  const areaPoints = `0,92 ${linePoints} 100,92`;
  const last = points[points.length - 1];

  return (
    <svg viewBox="0 0 100 100" className="w-full h-44">
      <defs>
        <linearGradient id={`lineFill-${id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--chart-fill)" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>
      <g>
        {[20, 50, 80].map((y) => (
          <line key={y} x1="0" x2="100" y1={y} y2={y} stroke="var(--chart-grid)" strokeWidth="0.6" />
        ))}
      </g>
      <polygon points={areaPoints} fill={`url(#lineFill-${id})`} />
      <polyline points={linePoints} fill="none" stroke="var(--chart-line)" strokeWidth="2" />
      {points.map((p, idx) => (
        <circle key={idx} cx={p.x} cy={p.y} r="1.8" fill="var(--chart-line)" />
      ))}
      {last && (
        <>
          <circle cx={last.x} cy={last.y} r="3" fill="var(--chart-accent-2)" />
          <text x={Math.min(96, last.x + 3)} y={Math.max(8, last.y - 4)} fontSize="5" fill="var(--chart-text)">
            {format(last.v)}
          </text>
        </>
      )}
    </svg>
  );
};

const BarChart: React.FC<{ data: number[]; format: FormatFn }> = ({ data, format }) => {
  const max = Math.max(1, ...data);
  return (
    <div className="flex items-end gap-2 h-44">
      {data.map((v, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div className="text-[9px] text-slate-500">{format(v)}</div>
          <div className="w-full bg-white/10 rounded-sm overflow-hidden h-32 flex items-end">
            <div
              className="w-full rounded-sm"
              style={{
                height: `${(v / max) * 100}%`,
                background: 'linear-gradient(180deg, var(--chart-accent-1), var(--chart-accent-4))'
              }}
              title={format(v)}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

const Donut: React.FC<{ data: { label: string; value: number }[]; format: FormatFn }> = ({ data, format }) => {
  const total = data.reduce((a, b) => a + b.value, 0) || 1;
  let acc = 0;
  const colors = ['var(--chart-accent-1)', 'var(--chart-accent-2)', 'var(--chart-accent-3)', 'var(--chart-accent-4)'];
  return (
    <div className="flex flex-col md:flex-row items-center gap-6">
      <svg viewBox="0 0 36 36" className="w-40 h-40">
        {data.map((d, i) => {
          const start = (acc / total) * 100;
          const value = (d.value / total) * 100;
          acc += d.value;
          const color = colors[i % colors.length];
          return (
            <circle
              key={d.label}
              r="15.9"
              cx="18"
              cy="18"
              fill="transparent"
              stroke={color}
              strokeWidth="4"
              strokeDasharray={`${value} ${100 - value}`}
              strokeDashoffset={-start}
            />
          );
        })}
        <circle r="11" cx="18" cy="18" fill="currentColor" className="text-black/70" />
        <text x="18" y="20" textAnchor="middle" fontSize="6" fill="var(--chart-text)" fontWeight="bold">
          {format(total)}
        </text>
      </svg>
      <div className="space-y-2 text-xs w-full">
        {data.map((d, i) => {
          const percent = (d.value / total) * 100;
          return (
            <div key={d.label} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ background: colors[i % colors.length] }} />
                <span className="truncate max-w-[140px]" title={d.label}>{d.label}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-500">
                <span>{percent.toFixed(1)}%</span>
                <span className="font-bold" style={{ color: 'var(--chart-text)' }}>{format(d.value)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const TopList: React.FC<{ items: { label: string; value: number }[]; format: FormatFn }> = ({ items, format }) => {
  const max = Math.max(1, ...items.map(i => i.value));
  const total = items.reduce((a, b) => a + b.value, 0) || 1;
  return (
    <div className="space-y-2">
      {items.map((i) => {
        const percent = (i.value / total) * 100;
        return (
          <div key={i.label} className="flex items-center gap-3 text-xs">
            <div className="w-36 truncate" title={i.label}>{i.label}</div>
            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-primary" style={{ width: `${(i.value / max) * 100}%` }} />
            </div>
            <div className="w-14 text-right">{percent.toFixed(1)}%</div>
            <div className="w-12 text-right font-bold">{format(i.value)}</div>
          </div>
        );
      })}
    </div>
  );
};

export const AdminPanel: React.FC = () => {
  const { t, lang } = useI18n();
  const formatNumber: FormatFn = (value) => new Intl.NumberFormat(lang === 'fa' ? 'fa-IR' : 'en-US').format(value);
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [authed, setAuthed] = useState(sessionStorage.getItem('pimxpassdns_admin') === '1');
  const [error, setError] = useState('');
  const [rangeKey, setRangeKey] = useState('1h');
  const [apiError, setApiError] = useState('');

  const range = ranges.find(r => r.key === rangeKey) ?? ranges[0];

  const [analytics, setAnalytics] = useState<{ visits: { t: number; device: string; location: string }[]; tests: { t: number; dnsCount: number }[] }>({
    visits: [],
    tests: []
  });
  useEffect(() => {
    let alive = true;
    const update = async () => {
      try {
        const data = await getAnalytics(range.ms);
        if (!alive) return;
        setAnalytics(data);
        setApiError('');
      } catch (err) {
        if (!alive) return;
        setApiError(err instanceof Error ? err.message : 'Failed to load analytics');
      }
    };
    void update();
    const id = setInterval(() => {
      void update();
    }, 5000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [range.ms]);
  const now = Date.now();
  const start = now - range.ms;

  const visits = analytics.visits.filter(v => v.t >= start);
  const tests = analytics.tests.filter(v => v.t >= start);
  const visitCount = visits.length;
  const testCount = tests.length;
  const dnsCount = tests.reduce((a, b) => a + b.dnsCount, 0);

  const visitSeries = bucketize(visits.map(v => ({ t: v.t })), range.ms);
  const testSeries = bucketize(tests.map(t => ({ t: t.t })), range.ms);
  const dnsSeries = bucketize(tests.map(t => ({ t: t.t, value: t.dnsCount })), range.ms);

  const deviceData = useMemo(() => {
    const counts: Record<string, number> = {};
    visits.forEach(v => { counts[v.device] = (counts[v.device] || 0) + 1; });
    const mapLabel = (d: string) => {
      if (d === 'mobile') return t('device.mobile');
      if (d === 'tablet') return t('device.tablet');
      if (d === 'desktop') return t('device.desktop');
      return d;
    };
    return Object.entries(counts).map(([label, value]) => ({ label: mapLabel(label), value }));
  }, [visits, t]);

  const locationData = useMemo(() => {
    const counts: Record<string, number> = {};
    visits.forEach(v => { counts[v.location] = (counts[v.location] || 0) + 1; });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([label, value]) => ({ label, value }));
  }, [visits]);

  const handleLogin = () => {
    if (user === USERNAME && pass === PASSWORD) {
      sessionStorage.setItem('pimxpassdns_admin', '1');
      setAuthed(true);
      setError('');
    } else {
      setError(t('admin.bad'));
    }
  };

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-2xl p-6 admin-card">
          <h1 className="text-xl font-black mb-4">{t('admin.login')}</h1>
          <div className="space-y-3">
            <input
              value={user}
              onChange={(e) => setUser(e.target.value)}
              placeholder={t('admin.user')}
              className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white"
            />
            <input
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              placeholder={t('admin.pass')}
              type="password"
              className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white"
            />
            {error && <div className="text-rose-400 text-xs">{error}</div>}
            <button onClick={handleLogin} className="w-full px-4 py-2 rounded-lg bg-white text-black font-black">
              {t('admin.signin')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-10 max-w-6xl mx-auto" dir={lang === 'fa' ? 'rtl' : 'ltr'}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-black">{t('admin.title')}</h1>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">{t('admin.range')}</span>
          <select
            value={rangeKey}
            onChange={(e) => setRangeKey(e.target.value)}
            className="px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-xs"
          >
            {ranges.map(r => (
              <option key={r.key} value={r.key}>
                {lang === 'fa' ? r.fa : r.en}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 admin-card">
          <div className="text-xs text-slate-500 mb-1">{t('admin.visits')}</div>
          <div className="text-2xl font-black">{formatNumber(visitCount)}</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 admin-card">
          <div className="text-xs text-slate-500 mb-1">{t('admin.tests')}</div>
          <div className="text-2xl font-black">{formatNumber(testCount)}</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 admin-card">
          <div className="text-xs text-slate-500 mb-1">{t('admin.dnsTested')}</div>
          <div className="text-2xl font-black">{formatNumber(dnsCount)}</div>
        </div>
      </div>

      {apiError && (
        <div className="mb-4 rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-xs font-semibold text-rose-300">
          API Error: {apiError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 admin-card">
          <div className="text-xs text-slate-500 mb-2">{t('admin.visits')}</div>
          {visits.length ? (
            <>
              <LineChart data={visitSeries} format={formatNumber} />
              <ChartMeta data={visitSeries} format={formatNumber} labels={{ total: t('admin.total'), avg: t('admin.avg'), max: t('admin.max'), min: t('admin.min') }} />
            </>
          ) : (
            <div className="text-xs text-slate-500">{t('admin.noData')}</div>
          )}
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 admin-card">
          <div className="text-xs text-slate-500 mb-2">{t('admin.testsTrend')}</div>
          {tests.length ? (
            <>
              <LineChart data={testSeries} format={formatNumber} />
              <ChartMeta data={testSeries} format={formatNumber} labels={{ total: t('admin.total'), avg: t('admin.avg'), max: t('admin.max'), min: t('admin.min') }} />
            </>
          ) : (
            <div className="text-xs text-slate-500">{t('admin.noData')}</div>
          )}
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 admin-card">
          <div className="text-xs text-slate-500 mb-2">{t('admin.dnsTrend')}</div>
          {tests.length ? (
            <>
              <BarChart data={dnsSeries} format={formatNumber} />
              <ChartMeta data={dnsSeries} format={formatNumber} labels={{ total: t('admin.total'), avg: t('admin.avg'), max: t('admin.max'), min: t('admin.min') }} />
            </>
          ) : (
            <div className="text-xs text-slate-500">{t('admin.noData')}</div>
          )}
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center admin-card">
          <div className="text-xs text-slate-500 mb-2 w-full">{t('admin.devices')}</div>
          {deviceData.length ? <Donut data={deviceData} format={formatNumber} /> : <div className="text-xs text-slate-500">{t('admin.noData')}</div>}
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 md:col-span-2 admin-card">
          <div className="text-xs text-slate-500 mb-2">{t('admin.locations')}</div>
          {locationData.length ? <TopList items={locationData} format={formatNumber} /> : <div className="text-xs text-slate-500">{t('admin.noData')}</div>}
        </div>
      </div>
    </div>
  );
};
