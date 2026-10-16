export interface DnsProvider {
  id: string;
  name: string;
  provider: string;
  primary: string;
  secondary: string;
  protocol?: 'plain' | 'doh' | 'dot' | 'dnscrypt' | 'odoh' | 'doh3' | 'doq' | 'unknown';
  testTarget?: string; // Host/IP used for browser latency checks
  source?: string; // Source URL or reference
  primaryIPv6?: string;
  secondaryIPv6?: string;
  tags: ('Gaming' | 'Anti-Sanction' | 'Security' | 'General' | 'Privacy' | 'Anti-Filter')[];
  description?: string;
  location?: string; // New: Server location/region
  doh?: string;
  dot?: string;
  family?: boolean;
  documented?: boolean;
  reviewedAt?: string;
  custom?: boolean;
}

export interface DnsResult extends DnsProvider {
  latency: number; // Average latency in ms
  jitter: number; // New: Latency variation
  successRate: number; // New: Percentage of successful pings (0-100)
  status: 'pending' | 'testing' | 'success' | 'failed' | 'unsupported';
  rawPings: number[]; // Store individual ping results
  variants?: DnsResult[]; // For grouped results
  method?: 'doh' | 'https' | 'unsupported';
  error?: string;
  attempted?: number;
}

export interface UserConnection {
  ip: string;
  isp: string;
  country: string;
  city: string;
}

export type AppState = 'home' | 'scanning' | 'results';
