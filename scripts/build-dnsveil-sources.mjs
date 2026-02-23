import fs from 'fs';
import path from 'path';

const SOURCES = [
  {
    name: 'dnscrypt-public-resolvers',
    url: 'https://raw.githubusercontent.com/DNSCrypt/dnscrypt-resolvers/master/v3/public-resolvers.md',
    type: 'dnscrypt'
  },
  {
    name: 'curl-doh-wiki',
    url: 'https://raw.githubusercontent.com/wiki/curl/curl/DNS-over-HTTPS.md',
    type: 'doh'
  }
];

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const unique = (arr) => Array.from(new Set(arr));

const parseDnscrypt = (text) => {
  const matches = text.match(/sdns:\/\/[^\s]+/g) || [];
  return unique(matches);
};

const parseDoh = (text) => {
  const matches = text.match(/https?:\/\/[^\s)]+/g) || [];
  // The curl wiki includes examples and links; filter to likely DoH endpoints
  return unique(matches.filter((u) => u.includes('/dns-query') || u.includes('dns-query') || u.includes('doh') || u.includes('dns-over-https') || u.includes('resolver')));
};

const build = async () => {
  const all = [];

  for (const src of SOURCES) {
    const res = await fetch(src.url);
    if (!res.ok) {
      throw new Error(`Failed to fetch ${src.url}: ${res.status}`);
    }
    const text = await res.text();

    let items = [];
    if (src.type === 'dnscrypt') items = parseDnscrypt(text);
    if (src.type === 'doh') items = parseDoh(text);

    for (const item of items) {
      const idBase = `${src.type}-${slug(item)}`.slice(0, 120);
      const host = (() => {
        try {
          if (item.startsWith('https://') || item.startsWith('http://')) return new URL(item).host;
          return '';
        } catch {
          return '';
        }
      })();

      all.push({
        id: idBase,
        name: src.type === 'dnscrypt' ? `DNSCrypt Resolver` : `DoH Resolver`,
        provider: host || 'Unknown',
        primary: item,
        secondary: '',
        protocol: src.type === 'dnscrypt' ? 'dnscrypt' : 'doh',
        testTarget: host || undefined,
        tags: ['General'],
        description: `Imported from ${src.name}`,
        source: src.url
      });
    }
  }

  // De-dupe by primary
  const seen = new Set();
  const deduped = [];
  for (const item of all) {
    if (seen.has(item.primary)) continue;
    seen.add(item.primary);
    deduped.push(item);
  }

  const outPath = path.resolve('dnsveil-sources.json');
  fs.writeFileSync(outPath, JSON.stringify(deduped, null, 2));
  console.log(`Wrote ${deduped.length} entries to ${outPath}`);
};

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
