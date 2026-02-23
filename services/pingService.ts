import { DnsProvider, DnsResult } from "../types";

// Helper to calculate standard deviation for Jitter
const calculateJitter = (arr: number[]): number => {
  if (arr.length < 2) return 0;
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  const variance = arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / arr.length;
  return Math.round(Math.sqrt(variance));
};

const getPingTarget = (dns: DnsProvider): string | null => {
  if (dns.testTarget && dns.testTarget.trim()) return dns.testTarget.trim();
  const value = dns.primary?.trim();
  if (!value) return null;

  if (value.startsWith('https://') || value.startsWith('http://')) {
    try {
      return new URL(value).host;
    } catch {
      return null;
    }
  }

  if (value.startsWith('tls://') || value.startsWith('tcp://') || value.startsWith('udp://')) {
    const noScheme = value.replace(/^(tls|tcp|udp):\/\//, '');
    const host = noScheme.split('/')[0]?.split(':')[0];
    return host || null;
  }

  if (value.startsWith('sdns://')) {
    return null; // DNSCrypt stamps are not directly pingable from the browser
  }

  return value;
};

export const measureLatency = async (host: string): Promise<number> => {
  const start = performance.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2000); // 2s timeout per ping

  try {
    // Attempt HTTPS fetch with no-cors to bypass browser security blocks for timing
    // Random query param prevents caching
    await fetch(`https://${host}/?_=${Math.random()}`, { 
      mode: 'no-cors', 
      signal: controller.signal,
      cache: 'no-store',
      // We accept that we can't read the body, we just want the round-trip time
    });
    
    clearTimeout(timeoutId);
    return Math.round(performance.now() - start);
  } catch (error: any) {
    // A fetch error (like connection refused) still means the packet traveled.
    // However, a timeout (AbortError) means packet loss or extreme lag.
    if (error.name === 'AbortError') return 9999;
    
    // If it's a network error (e.g. Protocol Error), likely the server exists but rejected the specific HTTPS request.
    // For DNS testing in browser, this is the closest we get to "Ping".
    // We treat immediate rejection as "Alive but low latency" vs Timeout.
    // To be conservative, if it fails, we return a high number unless we are sure.
    // For this specific logic, we'll allow fast failures to count if they were fast, 
    // but penalize them slightly to prefer open HTTPS servers (like Cloudflare/Google).
    return 9999; 
  }
};

export const runBatchTest = async (
  list: DnsProvider[], 
  onProgress: (result: DnsResult) => void,
  shouldCancel?: () => boolean
) => {
  // Batch size restricted to prevent browser network throttling
  const BATCH_SIZE = 4;
  const PINGS_PER_SERVER = 3; // Ping 3 times for accuracy

  for (let i = 0; i < list.length; i += BATCH_SIZE) {
    if (shouldCancel?.()) break;
    const batch = list.slice(i, i + BATCH_SIZE);
    
    const promises = batch.map(async (dns) => {
      if (shouldCancel?.()) return;
      const target = getPingTarget(dns);
      const pings: number[] = [];
      let successCount = 0;

      if (!target) {
        const result: DnsResult = {
          ...dns,
          latency: 9999,
          jitter: 0,
          successRate: 0,
          rawPings: [],
          status: 'failed'
        };
        onProgress(result);
        return;
      }

      // Run multiple pings
      for (let j = 0; j < PINGS_PER_SERVER; j++) {
        if (shouldCancel?.()) break;
        const latency = await measureLatency(target);
        if (latency < 3000) {
          pings.push(latency);
          successCount++;
        }
        // Small delay between pings to simulate real interval
        await new Promise(r => setTimeout(r, 50));
      }

      // Calculate stats
      const avgLatency = pings.length > 0 
        ? Math.round(pings.reduce((a, b) => a + b, 0) / pings.length) 
        : 9999;
      
      const jitter = calculateJitter(pings);
      const successRate = (successCount / PINGS_PER_SERVER) * 100;

      const result: DnsResult = {
        ...dns,
        latency: avgLatency,
        jitter: jitter,
        successRate: successRate,
        rawPings: pings,
        status: avgLatency < 3000 && successRate > 0 ? 'success' : 'failed'
      };
      
      onProgress(result);
    });

    await Promise.all(promises);
    if (shouldCancel?.()) break;
    await new Promise(r => setTimeout(r, 150)); // Cooldown between batches
  }
};
