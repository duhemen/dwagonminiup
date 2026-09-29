import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { loginApi } from '../api/auth';

export interface AuthUser { id: string; email: string; name: string; role: string; }

export interface LoginResult {
  region: string;
  regionSource: string;
  regionLocked: boolean;
  ip?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  region: string | null;
  regionSource: string | null;
  regionLocked: boolean;
  login: (email: string, password: string, simulateRegion?: string) => Promise<LoginResult>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);
const TOKEN_KEY = 'dwagon_token';
const USER_KEY = 'dwagon_user';
const REGION_META_KEY = 'dwagon_region_meta';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState<string | null>(null);
  const [regionSource, setRegionSource] = useState<string | null>(null);
  const [regionLocked, setRegionLocked] = useState(false);

  useEffect(() => {
    try {
      const st = localStorage.getItem(TOKEN_KEY);
      const su = localStorage.getItem(USER_KEY);
      const sm = localStorage.getItem(REGION_META_KEY);
      if (st && su) { setToken(st); setUser(JSON.parse(su)); }
      if (sm) {
        const meta = JSON.parse(sm);
        setRegion(meta.region);
        setRegionSource(meta.source);
        setRegionLocked(meta.locked);
      }
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(REGION_META_KEY);
    }
    setLoading(false);
  }, []);

  async function login(email: string, password: string, simulateRegion?: string): Promise<LoginResult> {
    const data = await loginApi(email, password, simulateRegion);
    const authUser: AuthUser = {
      id: data.user.id,
      email: data.user.email,
      name: data.user.name ?? data.user.email.split('@')[0],
      role: data.user.role,
    };
    const meta = { region: data.region, source: data.regionSource, locked: data.regionLocked, ip: data.ip };

    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(authUser));
    localStorage.setItem(REGION_META_KEY, JSON.stringify(meta));
    localStorage.setItem('dwagon_region', data.region);

    setToken(data.token);
    setUser(authUser);
    setRegion(data.region);
    setRegionSource(data.regionSource);
    setRegionLocked(data.regionLocked);

    // Dispatch event untuk RegionContext
    window.dispatchEvent(new CustomEvent('dwagon:region-changed', {
      detail: { region: data.region, source: data.regionSource, locked: data.regionLocked },
    }));

    return { region: data.region, regionSource: data.regionSource, regionLocked: data.regionLocked, ip: data.ip };
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(REGION_META_KEY);
    setToken(null); setUser(null); setRegion(null); setRegionSource(null); setRegionLocked(false);
  }

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, loading, region, regionSource, regionLocked, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}