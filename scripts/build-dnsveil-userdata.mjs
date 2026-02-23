import fs from 'fs';
import path from 'path';

const INPUT_SUBS = 'C:/Users/PIMX_ELTEX/AppData/Local/SecureDNSClient/UserData/BuiltInServers_Subscription.txt';
const INPUT_WORKING = 'C:/Users/PIMX_ELTEX/AppData/Local/SecureDNSClient/UserData/CustomServers_Working.txt';
const INPUT_MAL = 'C:/Users/PIMX_ELTEX/AppData/Local/SecureDNSClient/UserData/BuiltInServers_Malicious.txt';

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const readLines = (p) => fs.readFileSync(p, 'utf8').split(/\r?\n/).map(l => l.trim()).filter(Boolean);

const isIPv4 = (s) => /^\d{1,3}(?:\.\d{1,3}){3}$/.test(s);
const isIPv6 = (s) => /^[0-9a-fA-F:]+$/.test(s) && s.includes(':');

const getHost = (url) => {
  try {
    return new URL(url).host;
  } catch {
    return '';
  }
};

const shouldKeepUrl = (url) => {
  try {
    const u = new URL(url);
    const host = u.host.toLowerCase();
    const path = u.pathname.toLowerCase();
    if (path.includes('dns-query') || path.includes('/dns') || path.includes('doh')) return true;
    if (host.startsWith('dns.') || host.includes('dns')) return true;
    return false;
  } catch {
    return false;
  }
};

const loadMalicious = () => {
  if (!fs.existsSync(INPUT_MAL)) return [];
  return readLines(INPUT_MAL)
    .filter((l) => !l.startsWith('//'))
    .map((l) => l.toLowerCase());
};

const isMaliciousHost = (host, malicious) => {
  if (!host) return false;
  const h = host.toLowerCase();
  return malicious.some((m) => h === m || h.endsWith(`.${m}`));
};

const build = () => {
  const malicious = loadMalicious();

  const subs = fs.existsSync(INPUT_SUBS) ? readLines(INPUT_SUBS) : [];
  const working = fs.existsSync(INPUT_WORKING) ? readLines(INPUT_WORKING) : [];

  const items = [];

  for (const line of subs) {
    if (line.startsWith('//') || line.startsWith('#')) continue;

    if (line.startsWith('sdns://')) {
      items.push({
        id: `dnscrypt-${slug(line)}`.slice(0, 120),
        name: 'DNSCrypt Resolver',
        provider: 'Unknown',
        primary: line,
        secondary: '',
        protocol: 'dnscrypt',
        tags: ['General'],
        description: 'Imported from SecureDNSClient subscription',
        source: INPUT_SUBS
      });
      continue;
    }

    if (line.startsWith('https://') || line.startsWith('http://')) {
      if (!shouldKeepUrl(line)) continue;
      const host = getHost(line);
      if (isMaliciousHost(host, malicious)) continue;
      items.push({
        id: `doh-${slug(line)}`.slice(0, 120),
        name: 'DoH Resolver',
        provider: host || 'Unknown',
        primary: line,
        secondary: '',
        protocol: 'doh',
        testTarget: host || undefined,
        tags: ['General'],
        description: 'Imported from SecureDNSClient subscription',
        source: INPUT_SUBS
      });
    }
  }

  for (const line of working) {
    if (isIPv4(line) || isIPv6(line)) {
      items.push({
        id: `plain-${slug(line)}`.slice(0, 120),
        name: 'Plain DNS',
        provider: 'Custom',
        primary: line,
        secondary: '',
        protocol: 'plain',
        testTarget: line,
        tags: ['General'],
        description: 'Imported from SecureDNSClient working list',
        source: INPUT_WORKING
      });
    }
  }

  const seen = new Set();
  const deduped = [];
  for (const item of items) {
    if (seen.has(item.primary)) continue;
    seen.add(item.primary);
    deduped.push(item);
  }

  const outPath = path.resolve('dnsveil-userdata.json');
  fs.writeFileSync(outPath, JSON.stringify(deduped, null, 2));
  console.log(`Wrote ${deduped.length} entries to ${outPath}`);
};

build();
