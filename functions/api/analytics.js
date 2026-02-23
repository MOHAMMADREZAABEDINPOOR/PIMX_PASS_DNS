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

export const onRequestOptions = async () => new Response(null, { status: 204, headers: CORS_HEADERS });

export const onRequestPost = async (context) => {
  const db = context.env?.DB;
  if (!db) return json({ error: 'D1 binding "DB" is not configured' }, 500);

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
    await db
      .prepare(
        `INSERT OR IGNORE INTO visits (client_id, bucket, ts, location, device)
         VALUES (?1, ?2, ?3, ?4, ?5)`
      )
      .bind(clientId, bucket, ts, location, device)
      .run();

    return json({ ok: true });
  }

  if (type === 'test') {
    const dnsCount = Number(payload?.dnsCount || 0);
    if (!Number.isFinite(dnsCount) || dnsCount < 0) return badRequest('invalid dnsCount');

    await db
      .prepare(
        `INSERT INTO tests (client_id, ts, dns_count)
         VALUES (?1, ?2, ?3)`
      )
      .bind(clientId, ts, dnsCount)
      .run();

    return json({ ok: true });
  }

  return badRequest('invalid event type');
};

export const onRequestGet = async (context) => {
  const db = context.env?.DB;
  if (!db) return json({ error: 'D1 binding "DB" is not configured' }, 500);

  const url = new URL(context.request.url);
  const from = Number(url.searchParams.get('from') || Date.now() - 10 * 24 * 60 * 60 * 1000);
  const safeFrom = Number.isFinite(from) ? from : Date.now() - 10 * 24 * 60 * 60 * 1000;

  const visitRows = await db
    .prepare(
      `SELECT ts, device, location
       FROM visits
       WHERE ts >= ?1
       ORDER BY ts ASC
       LIMIT 20000`
    )
    .bind(safeFrom)
    .all();

  const testRows = await db
    .prepare(
      `SELECT ts, dns_count
       FROM tests
       WHERE ts >= ?1
       ORDER BY ts ASC
       LIMIT 20000`
    )
    .bind(safeFrom)
    .all();

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

