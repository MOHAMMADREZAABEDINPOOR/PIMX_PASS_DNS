import React, { FormEvent, useEffect, useMemo, useState } from 'react';
import { useI18n } from '../i18n';
import { getAnalytics } from '../analytics';

const USERNAME = 'PIMX_PASS';
const PASSWORD = '123456789PIMX_PASS@#$%^&';

const ranges = [
  { key: '1m', ms: 1 * 60 * 1000, fa: '۱ دقیقه', en: '1 min' },
  { key: '3m', ms: 3 * 60 * 1000, fa: '۳ دقیقه', en: '3 min' },
  { key: '5m', ms: 5 * 60 * 1000, fa: '5 دقیقه', en: '5 min' },
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

type Visit = { t: number; device: string; location: string };
type Test = { t: number; dnsCount: number };
type AnalyticsPayload = { visits: Visit[]; tests: Test[] };

const bucketize = (events: Array<{ t: number; value?: number }>, rangeMs: number, buckets = 20) => {
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

const getStats = (data: number[]) => {
  const total = data.reduce((a, b) => a + b, 0);
  const max = Math.max(0, ...data);
  const min = data.length ? Math.min(...data) : 0;
  const avg = data.length ? total / data.length : 0;
  return { total, avg, max, min };
};

const Card: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="rounded-3xl border border-white/10 bg-black/35 backdrop-blur-xl p-5">
    <h3 className="text-xs uppercase tracking-[0.14em] font-bold text-slate-400 mb-3">{title}</h3>
    {children}
  </div>
);

const MetricCard: React.FC<{ title: string; value: string }> = ({ title, value }) => (
  <div className="rounded-3xl border border-white/10 bg-black/35 backdrop-blur-xl p-5">
    <p className="text-xs uppercase tracking-[0.14em] font-bold text-slate-400">{title}</p>
    <p className="mt-2 text-4xl font-black tracking-tight text-white">{value}</p>
  </div>
);

const LineChart: React.FC<{ data: number[]; numberFormat: (n: number) => string }> = ({ data, numberFormat }) => {
  if (!data.length) return <p className="text-slate-500 text-sm">No data to display</p>;
  const width = 620;
  const height = 240;
  const pad = 24;
  const max = Math.max(1, ...data);
  const points = data
    .map((value, i) => {
      const x = pad + (i * (width - pad * 2)) / Math.max(1, data.length - 1);
      const y = height - pad - (value / max) * (height - pad * 2);
      return { x, y, value };
    });
  const pointsText = points.map((p) => `${p.x},${p.y}`).join(' ');
  const stats = getStats(data);

  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[240px]">
        <polyline fill="none" stroke="rgba(148,163,184,0.25)" strokeWidth="1" points={`${pad},${height - pad} ${width - pad},${height - pad}`} />
        <polyline fill="none" stroke="rgba(129,140,248,0.95)" strokeWidth="3" points={pointsText} />
        {points.map((p, idx) => (
          <circle key={idx} cx={p.x} cy={p.y} r="2.6" fill="rgba(129,140,248,1)" />
        ))}
      </svg>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
        <div className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-slate-300">Total: <span className="font-black text-white">{numberFormat(stats.total)}</span></div>
        <div className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-slate-300">Avg: <span className="font-black text-white">{numberFormat(Math.round(stats.avg))}</span></div>
        <div className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-slate-300">Max: <span className="font-black text-white">{numberFormat(stats.max)}</span></div>
        <div className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-slate-300">Min: <span className="font-black text-white">{numberFormat(stats.min)}</span></div>
      </div>
    </div>
  );
};

const ShareRows: React.FC<{ rows: Array<{ label: string; value: number }> }> = ({ rows }) => {
  const total = rows.reduce((s, r) => s + r.value, 0) || 1;
  return (
    <div className="space-y-3">
      {rows.length === 0 && <p className="text-slate-500 text-sm">No data to display</p>}
      {rows.map((row, i) => {
        const pct = (row.value / total) * 100;
        const color = ['bg-indigo-400', 'bg-cyan-400', 'bg-emerald-400', 'bg-fuchsia-400', 'bg-orange-400', 'bg-rose-400', 'bg-slate-400'][i % 7];
        return (
          <div key={row.label}>
            <div className="flex items-center justify-between text-sm mb-1 gap-3">
              <span className="font-semibold text-slate-200 truncate">{row.label}</span>
              <span className="text-slate-400 whitespace-nowrap">{pct.toFixed(1)}% ({row.value})</span>
            </div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const AdminPanel: React.FC = () => {
  const { t, lang } = useI18n();
  const formatNumber = (value: number) => new Intl.NumberFormat(lang === 'fa' ? 'fa-IR' : 'en-US').format(value);

  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [authed, setAuthed] = useState(sessionStorage.getItem('pimxpassdns_admin') === '1');
  const [error, setError] = useState('');
  const [apiError, setApiError] = useState('');
  const [rangeKey, setRangeKey] = useState('1h');
  const [analytics, setAnalytics] = useState<AnalyticsPayload>({ visits: [], tests: [] });

  const range = ranges.find((r) => r.key === rangeKey) ?? ranges[0];
  const now = Date.now();
  const start = now - range.ms;

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const data = await getAnalytics(range.ms);
        if (!active) return;
        setAnalytics(data);
        setApiError('');
      } catch (err) {
        if (!active) return;
        setApiError(err instanceof Error ? err.message : 'Failed to load analytics');
      }
    };
    void load();
    const id = setInterval(() => void load(), 5000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, [range.ms]);

  const visits = useMemo(() => analytics.visits.filter((v) => v.t >= start), [analytics.visits, start]);
  const tests = useMemo(() => analytics.tests.filter((v) => v.t >= start), [analytics.tests, start]);

  const visitCount = visits.length;
  const testCount = tests.length;
  const dnsCount = tests.reduce((a, b) => a + b.dnsCount, 0);

  const visitSeries = useMemo(() => bucketize(visits.map((v) => ({ t: v.t })), range.ms), [visits, range.ms]);
  const testSeries = useMemo(() => bucketize(tests.map((v) => ({ t: v.t })), range.ms), [tests, range.ms]);
  const dnsSeries = useMemo(() => bucketize(tests.map((v) => ({ t: v.t, value: v.dnsCount })), range.ms), [tests, range.ms]);

  const deviceRows = useMemo(() => {
    const counts: Record<string, number> = {};
    visits.forEach((v) => {
      counts[v.device] = (counts[v.device] || 0) + 1;
    });
    const mapLabel = (key: string) => {
      if (key === 'mobile') return t('device.mobile');
      if (key === 'tablet') return t('device.tablet');
      if (key === 'desktop') return t('device.desktop');
      return key;
    };
    return Object.entries(counts).map(([label, value]) => ({ label: mapLabel(label), value })).sort((a, b) => b.value - a.value);
  }, [visits, t]);

  const locationRows = useMemo(() => {
    const counts: Record<string, number> = {};
    visits.forEach((v) => {
      counts[v.location] = (counts[v.location] || 0) + 1;
    });
    return Object.entries(counts).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value).slice(0, 10);
  }, [visits]);

  const onLogin = (e: FormEvent) => {
    e.preventDefault();
    if (user === USERNAME && pass === PASSWORD) {
      sessionStorage.setItem('pimxpassdns_admin', '1');
      setAuthed(true);
      setError('');
      return;
    }
    setError(t('admin.bad'));
  };

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <form onSubmit={onLogin} className="w-full max-w-md rounded-3xl border border-white/10 bg-black/35 backdrop-blur-xl p-8 space-y-5">
          <h1 className="text-3xl font-black tracking-tight text-white">{t('admin.login')}</h1>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-300">{t('admin.user')}</label>
            <input value={user} onChange={(e) => setUser(e.target.value)} className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-300">{t('admin.pass')}</label>
            <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white" />
          </div>
          {error && <p className="text-sm text-rose-400 font-semibold">{error}</p>}
          <button className="w-full rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-black py-3">{t('admin.signin')}</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-10 max-w-7xl mx-auto" dir={lang === 'fa' ? 'rtl' : 'ltr'}>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-5xl font-black tracking-tight text-white">{t('admin.title')}</h1>
        <div className="flex items-center gap-3">
          <label className="text-sm font-bold text-slate-300">{t('admin.range')}</label>
          <select
            value={rangeKey}
            onChange={(e) => setRangeKey(e.target.value)}
            className="rounded-xl border border-white/10 bg-black/45 px-3 py-2 font-semibold text-white"
          >
            {ranges.map((opt) => (
              <option key={opt.key} value={opt.key}>
                {lang === 'fa' ? opt.fa : opt.en}
              </option>
            ))}
          </select>
        </div>
      </div>

      {apiError && (
        <div className="mb-6 rounded-2xl border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-300">
          API Error: {apiError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <MetricCard title={t('admin.visits')} value={formatNumber(visitCount)} />
        <MetricCard title={t('admin.tests')} value={formatNumber(testCount)} />
        <MetricCard title={t('admin.dnsTested')} value={formatNumber(dnsCount)} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-4">
        <Card title={t('admin.visits')}>
          <LineChart data={visitSeries} numberFormat={formatNumber} />
        </Card>
        <Card title={t('admin.testsTrend')}>
          <LineChart data={testSeries} numberFormat={formatNumber} />
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-4">
        <Card title={t('admin.dnsTrend')}>
          <LineChart data={dnsSeries} numberFormat={formatNumber} />
        </Card>
        <Card title={t('admin.devices')}>
          <ShareRows rows={deviceRows} />
        </Card>
      </div>

      <Card title={t('admin.locations')}>
        <ShareRows rows={locationRows} />
      </Card>
    </div>
  );
};

