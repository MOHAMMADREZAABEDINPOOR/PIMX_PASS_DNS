const CORS_HEADERS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET,POST,OPTIONS',
  'access-control-allow-headers': 'content-type'
};

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...CORS_HEADERS,
      'content-type': 'application/json; charset=utf-8'
    }
  });

const badRequest = (message) => json({ error: message }, 400);
const serverError = (message, details) => json({ error: message, details }, 500);

const ensureSchema = async (db) => {
  await db.batch([
    db.prepare(
      `CREATE TABLE IF NOT EXISTS visits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_id TEXT NOT NULL,
        bucket INTEGER NOT NULL,
        ts INTEGER NOT NULL,
        location TEXT NOT NULL,
        device TEXT NOT NULL
      )`
    ),
    db.prepare(
      `CREATE TABLE IF NOT EXISTS tests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_id TEXT NOT NULL,
        ts INTEGER NOT NULL,
        dns_count INTEGER NOT NULL
      )`
    ),
    db.prepare(`CREATE UNIQUE INDEX IF NOT EXISTS idx_visits_client_bucket ON visits (client_id, bucket)`),
    db.prepare(`CREATE INDEX IF NOT EXISTS idx_visits_ts ON visits (ts)`),
    db.prepare(`CREATE INDEX IF NOT EXISTS idx_tests_ts ON tests (ts)`),
  ]);
};

export const onRequestOptions = async () => new Response(null, { status: 204, headers: CORS_HEADERS });

export const onRequestPost = async (context) => {
  const db = context.env?.DB;
  if (!db) return json({ error: 'D1 binding "DB" is not configured' }, 500);
  await ensureSchema(db);

  let payload = null;
  try {
    payload = await context.request.json();
  } catch {
    return badRequest('invalid json');
  }

  const type = payload?.type;
  const ts = Number(payload?.t || Date.now());
  const clientId = String(payload?.clientId || '').slice(0, 128);
  if (!clientId) return badRequest('clientId is required');

  if (type === 'visit') {
    const bucket = Number(payload?.bucket);
    const location = String(payload?.location || 'Unknown').slice(0, 160);
    const device = String(payload?.device || 'desktop').slice(0, 20);
    if (!Number.isFinite(bucket)) return badRequest('invalid bucket');

    // One visit per user per 10-minute bucket.
    try {
      await db
        .prepare(
          `INSERT OR IGNORE INTO visits (client_id, bucket, ts, location, device)
           VALUES (?1, ?2, ?3, ?4, ?5)`
        )
        .bind(clientId, bucket, ts, location, device)
        .run();
    } catch (err) {
      return serverError('failed to insert visit', err instanceof Error ? err.message : String(err));
    }

    return json({ ok: true });
  }

  if (type === 'test') {
    const dnsCount = Number(payload?.dnsCount || 0);
    if (!Number.isFinite(dnsCount) || dnsCount < 0) return badRequest('invalid dnsCount');

    try {
      await db
        .prepare(
          `INSERT INTO tests (client_id, ts, dns_count)
           VALUES (?1, ?2, ?3)`
        )
        .bind(clientId, ts, dnsCount)
        .run();
    } catch (err) {
      return serverError('failed to insert test', err instanceof Error ? err.message : String(err));
    }

    return json({ ok: true });
  }

  return badRequest('invalid event type');
};

export const onRequestGet = async (context) => {
  const db = context.env?.DB;
  if (!db) return json({ error: 'D1 binding "DB" is not configured' }, 500);
  await ensureSchema(db);

  const url = new URL(context.request.url);
  const from = Number(url.searchParams.get('from') || Date.now() - 10 * 24 * 60 * 60 * 1000);
  const safeFrom = Number.isFinite(from) ? from : Date.now() - 10 * 24 * 60 * 60 * 1000;

  let visitRows;
  let testRows;
  try {
    visitRows = await db
      .prepare(
        `SELECT ts, device, location
         FROM visits
         WHERE ts >= ?1
         ORDER BY ts ASC
         LIMIT 20000`
      )
      .bind(safeFrom)
      .all();

    testRows = await db
      .prepare(
        `SELECT ts, dns_count
         FROM tests
         WHERE ts >= ?1
         ORDER BY ts ASC
         LIMIT 20000`
      )
      .bind(safeFrom)
      .all();
  } catch (err) {
    return serverError('failed to read analytics', err instanceof Error ? err.message : String(err));
  }

  const visits = (visitRows.results || []).map((row) => ({
    t: Number(row.ts),
    device: String(row.device || 'desktop'),
    location: String(row.location || 'Unknown')
  }));

  const tests = (testRows.results || []).map((row) => ({
    t: Number(row.ts),
    dnsCount: Number(row.dns_count || 0)
  }));

  return json({ visits, tests });
};

