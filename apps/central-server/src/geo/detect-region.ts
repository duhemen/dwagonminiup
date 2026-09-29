export type Region =
  | 'sumatera' | 'jawa' | 'kalimantan' | 'bali-nusra'
  | 'sulawesi' | 'maluku' | 'papua';

export const ALL_REGIONS: Region[] = [
  'sumatera', 'jawa', 'kalimantan', 'bali-nusra', 'sulawesi', 'maluku', 'papua',
];

// Fallback chain: kalau primary down, coba region ini berurutan
export const FALLBACK_CHAIN: Record<Region, Region[]> = {
  'sumatera':   ['jawa', 'kalimantan'],
  'jawa':       ['sumatera', 'bali-nusra', 'kalimantan'],
  'kalimantan': ['jawa', 'sumatera', 'sulawesi'],
  'bali-nusra': ['jawa', 'sulawesi'],
  'sulawesi':   ['kalimantan', 'bali-nusra', 'maluku'],
  'maluku':     ['sulawesi', 'papua'],
  'papua':      ['maluku', 'sulawesi'],
};

// IP prefix → region (Telkom/Indosat/Telkomsel per wilayah)
const IP_PREFIX_MAP: Array<{ prefix: string; region: Region }> = [
  // Sumatera
  { prefix: '103.10.', region: 'sumatera' }, { prefix: '103.11.', region: 'sumatera' },
  { prefix: '103.20.', region: 'sumatera' }, { prefix: '114.79.', region: 'sumatera' },
  { prefix: '180.240.', region: 'sumatera' }, { prefix: '180.241.', region: 'sumatera' },
  // Jawa
  { prefix: '103.23.', region: 'jawa' }, { prefix: '103.24.', region: 'jawa' },
  { prefix: '103.28.', region: 'jawa' }, { prefix: '114.124.', region: 'jawa' },
  { prefix: '114.125.', region: 'jawa' }, { prefix: '125.160.', region: 'jawa' },
  { prefix: '180.250.', region: 'jawa' }, { prefix: '180.251.', region: 'jawa' },
  // Kalimantan
  { prefix: '103.12.', region: 'kalimantan' }, { prefix: '103.13.', region: 'kalimantan' },
  { prefix: '114.122.', region: 'kalimantan' },
  // Bali-Nusra
  { prefix: '103.14.', region: 'bali-nusra' }, { prefix: '103.15.', region: 'bali-nusra' },
  { prefix: '180.243.', region: 'bali-nusra' },
  // Sulawesi
  { prefix: '103.16.', region: 'sulawesi' }, { prefix: '103.17.', region: 'sulawesi' },
  { prefix: '180.244.', region: 'sulawesi' }, { prefix: '180.245.', region: 'sulawesi' },
  // Maluku
  { prefix: '103.18.', region: 'maluku' }, { prefix: '103.19.', region: 'maluku' },
  { prefix: '180.246.', region: 'maluku' },
  // Papua
  { prefix: '103.21.', region: 'papua' }, { prefix: '103.22.', region: 'papua' },
  { prefix: '180.247.', region: 'papua' }, { prefix: '180.248.', region: 'papua' },
];

export function isValidRegion(r: string): r is Region {
  return ALL_REGIONS.includes(r as Region);
}

export function detectRegionFromIP(ip: string | undefined): Region | null {
  if (!ip) return null;
  const clean = ip.replace(/^::ffff:/, '');
  // Private/localhost → cannot detect
  if (
    clean === '127.0.0.1' || clean === '::1' || clean === 'localhost' ||
    clean.startsWith('192.168.') || clean.startsWith('10.') ||
    /^172\.(1[6-9]|2[0-9]|3[01])\./.test(clean)
  ) return null;

  for (const { prefix, region } of IP_PREFIX_MAP) {
    if (clean.startsWith(prefix)) return region;
  }
  return null;
}

export function getFallbacks(region: Region): Region[] {
  return FALLBACK_CHAIN[region] ?? ['jawa'];
}