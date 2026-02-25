type DeviceType = 'mobile' | 'tablet' | 'desktop';

export type VisitEvent = {
  t: number;
  device: DeviceType;
  location: string;
};

export type TestEvent = {
  t: number;
  dnsCount: number;
};

type AnalyticsStore = {
  visits: VisitEvent[];
  tests: TestEvent[];
};

const STORAGE_KEY = 'pimxpassdns_analytics_v1';
const CLIENT_ID_KEY = 'pimxpassdns_client_id';
const LAST_VISIT_TS_KEY = 'pimxpassdns_last_visit_ts';
const MAX_EVENTS = 10000;
const VISIT_BUCKET_MS = 10 * 60 * 1000;
const API_PATH = '/api/analytics';

const emptyStore: AnalyticsStore = { visits: [], tests: [] };

const loadStore = (): AnalyticsStore => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...emptyStore };
    const parsed = JSON.parse(raw) as AnalyticsStore;
    return {
      visits: Array.isArray(parsed.visits) ? parsed.visits : [],
      tests: Array.isArray(parsed.tests) ? parsed.tests : []
    };
  } catch {
    return { ...emptyStore };
  }
};

const saveStore = (store: AnalyticsStore) => {
  const trimmed: AnalyticsStore = {
    visits: store.visits.slice(-MAX_EVENTS),
    tests: store.tests.slice(-MAX_EVENTS)
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
};

const getClientId = () => {
  const stored = localStorage.getItem(CLIENT_ID_KEY);
  if (stored) return stored;
  const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  localStorage.setItem(CLIENT_ID_KEY, id);
  return id;
};

const postEvent = async (payload: Record<string, unknown>) => {
  try {
    await fetch(API_PATH, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch {
    // silent fallback to local analytics
  }
};

export const getDeviceType = (): DeviceType => {
  const w = window.innerWidth;
  const ua = navigator.userAgent.toLowerCase();
  if (/ipad|tablet/.test(ua) || (w >= 768 && w <= 1024)) return 'tablet';
  if (/mobile|android|iphone|ipod/.test(ua) || w < 768) return 'mobile';
  return 'desktop';
};

export const normalizeLocation = (country?: string, city?: string) => {
  if (!country && !city) return 'Unknown';
  if (country && city) return `${country} / ${city}`;
  return country || city || 'Unknown';
};

export const recordVisit = (location: string) => {
  const timestamp = Date.now();
  const lastVisitRaw = localStorage.getItem(LAST_VISIT_TS_KEY);
  const lastVisit = lastVisitRaw ? Number(lastVisitRaw) : 0;
  if (Number.isFinite(lastVisit) && timestamp - lastVisit < VISIT_BUCKET_MS) return;
  localStorage.setItem(LAST_VISIT_TS_KEY, String(timestamp));

  const device = getDeviceType();
  const clientId = getClientId();
  const bucket = Math.floor(timestamp / VISIT_BUCKET_MS);

  const store = loadStore();
  store.visits.push({
    t: timestamp,
    device,
    location
  });
  saveStore(store);

  void postEvent({
    type: 'visit',
    t: timestamp,
    bucket,
    device,
    location,
    clientId
  });
};

export const recordTest = (dnsCount: number) => {
  const timestamp = Date.now();
  const clientId = getClientId();

  const store = loadStore();
  store.tests.push({
    t: timestamp,
    dnsCount
  });
  saveStore(store);

  void postEvent({
    type: 'test',
    t: timestamp,
    dnsCount,
    clientId
  });
};

export const getAnalytics = async (rangeMs?: number) => {
  const from = Date.now() - (rangeMs || 10 * 24 * 60 * 60 * 1000);
  const res = await fetch(`${API_PATH}?from=${from}`, {
    method: 'GET',
    headers: { accept: 'application/json' }
  });
  if (!res.ok) {
    let details = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      if (body?.error) {
        details = body.details ? `${body.error}: ${body.details}` : body.error;
      }
    } catch {
      // keep default details
    }
    throw new Error(details);
  }
  const data = (await res.json()) as AnalyticsStore;
  return {
    visits: Array.isArray(data.visits) ? data.visits : [],
    tests: Array.isArray(data.tests) ? data.tests : []
  };
};

