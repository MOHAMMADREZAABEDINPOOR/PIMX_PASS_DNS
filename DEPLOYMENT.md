# Deployment

Production: https://pimxpassdns.pages.dev

GitHub: https://github.com/MOHAMMADREZAABEDINPOOR/PIMX_PASS_DNS

Cloudflare Pages project `pimxpassdns` is connected to the repository's `main` branch. Its build command is `npm run build`, output directory is `dist`, and build Node.js version is22. Pushes to `main` trigger production deployment.

`wrangler.toml` retains the existing `DB` D1 database and binds `MONITOR_KV` for status data. Resource IDs in configuration identify resources; they are not credentials. Authentication uses the operator's Wrangler login and must remain outside source control.

For a manual Pages deployment after logging in:

```sh
npm ci
npx wrangler login
npm run deploy
```

The independent monitoring Worker uses `cloudflare/wrangler.monitor.toml`. Deploy changes to that Worker with:

```sh
npm run deploy:monitor
```

It checks four public DoH providers every five minutes and stores real edge observations in the shared KV namespace. The first request to the Worker's `/status` endpoint bootstraps an initial observation if the namespace is empty. Pages exposes those records through `/api/status`; these measurements describe Cloudflare's network, not the visitor's connection.

Updating Pages from GitHub does not independently redeploy the scheduled Worker; use `deploy:monitor` when its source changes. Existing analytics remain bound to the original database. No database reset or destructive migration is required.

Verify the six localized Home/Test/Guide routes, `/api/status`, `/api/analytics`, `/sw.js`, `/sitemap.xml` and `/pimxpassdnsadmin` after deployment. The app shell and guides work offline after the first successful load; new DNS scans require a connection.
