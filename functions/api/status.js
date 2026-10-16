export async function onRequestGet({ env }) {
  if (!env.MONITOR_KV)
    return Response.json({ error: "monitor_unconfigured" }, { status: 503 });
  const data = await env.MONITOR_KV.get("pimx-monitor-v1", "json");
  return Response.json(data || { error: "no_checks_yet" }, {
    status: data ? 200 : 503,
    headers: { "cache-control": "no-store" },
  });
}
