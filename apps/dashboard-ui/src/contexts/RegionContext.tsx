import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { lockRegion } from '../api/geo';

export type Region =
  | 'sumatera' | 'jawa' | 'kalimantan' | 'bali-nusra'
  | 'sulawesi' | 'maluku' | 'papua';

export interface RegionMeta {
  value: Region; label: string; port: number; path: string;
  color: string; flag: string; provinces: number; capital: string;
}

export const REGIONS: RegionMeta[] = [
  { value: 'sumatera',   label: 'Sumatera',   port: 4001, path: 'edge-sumatera',   color: 'text-amber-600',   flag: '🌴', provinces: 10, capital: 'Medan' },
  { value: 'jawa',       label: 'Jawa',       port: 4002, path: 'edge-jawa',       color: 'text-slate-700',   flag: '🏙️', provinces: 6,  capital: 'Jakarta' },
  { value: 'kalimantan', label: 'Kalimantan', port: 4003, path: 'edge-kalimantan', color: 'text-emerald-600', flag: '🌳', provinces: 5,  capital: 'Balikpapan' },
  { value: 'bali-nusra', label: 'Bali-Nusra', port: 4004, path: 'edge-bali-nusra', color: 'text-rose-600',    flag: '🏖️', provinces: 3,  capital: 'Denpasar' },
  { value: 'sulawesi',   label: 'Sulawesi',   port: 4005, path: 'edge-sulawesi',   color: 'text-fuchsia-600', flag: '🦋', provinces: 6,  capital: 'Makassar' },
  { value: 'maluku',     label: 'Maluku',     port: 4006, path: 'edge-maluku',     color: 'text-blue-600',    flag: '🐚', provinces: 2,  capital: 'Ambon' },
  { value: 'papua',      label: 'Papua',      port: 4007, path: 'edge-papua',      color: 'text-cyan-600',    flag: '🐦', provinces: 6,  capital: 'Jayapura' },
];

interface RegionContextType {
  region: Region;
  setRegion: (r: Region, options?: { lock?: boolean }) => Promise<void>;
  currentMeta: RegionMeta;
  locked: boolean;
  autoDetected: boolean;
  source: string | null;
}

const RegionContext = createContext<RegionContextType | null>(null);
const STORAGE_KEY = 'dwagon_region';
const LOCK_KEY = 'dwagon_region_locked';

export function RegionProvider({ children }: { children: ReactNode }) {
  const [region, setRegionState] = useState<Region>('jawa');
  const [locked, setLocked] = useState(false);
  const [autoDetected, setAutoDetected] = useState(false);
  const [source, setSource] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Region | null;
    const savedLocked = localStorage.getItem(LOCK_KEY) === 'true';
    if (saved && REGIONS.some((r) => r.value === saved)) setRegionState(saved);
    setLocked(savedLocked);
  }, []);

  useEffect(() => {
    function onAuthRegionChanged(e: Event) {
      const detail = (e as CustomEvent).detail;
      if (detail?.region && REGIONS.some((r) => r.value === detail.region)) {
        setRegionState(detail.region);
        setSource(detail.source);
        setAutoDetected(['ip', 'profile', 'default'].includes(detail.source));
        setLocked(!!detail.locked);
        localStorage.setItem(STORAGE_KEY, detail.region);
      }
    }
    window.addEventListener('dwagon:region-changed', onAuthRegionChanged);
    return () => window.removeEventListener('dwagon:region-changed', onAuthRegionChanged);
  }, []);

  async function setRegion(r: Region, options?: { lock?: boolean }) {
    setRegionState(r);
    localStorage.setItem(STORAGE_KEY, r);
    if (options?.lock) {
      try {
        await lockRegion(r);
        setLocked(true); setAutoDetected(false); setSource('locked');
        localStorage.setItem(LOCK_KEY, 'true');
      } catch { /* ignore */ }
    }
  }

  const currentMeta = REGIONS.find((r) => r.value === region)!;

  return (
    <RegionContext.Provider value={{ region, setRegion, currentMeta, locked, autoDetected, source }}>
      {children}
    </RegionContext.Provider>
  );
}

export function useRegion() {
  const ctx = useContext(RegionContext);
  if (!ctx) throw new Error('useRegion must be used within RegionProvider');
  return ctx;
}