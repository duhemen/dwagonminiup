import { useEffect, useState } from 'react';
import { autoLogin, getDashboard, DashboardResponse } from '../api/auth';

interface AuthState {
  user: { email: string; name: string } | null;
  dashboard: DashboardResponse | null;
  loading: boolean;
  error: string | null;
}

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    user: null,
    dashboard: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      try {
        let token = localStorage.getItem('dwagon_token');

        if (!token) {
          const login = await autoLogin();
          localStorage.setItem('dwagon_token', login.token);
          token = login.token;
          if (!cancelled) {
            setState((s) => ({ ...s, user: login.user }));
          }
        }

        const dash = await getDashboard();
        if (!cancelled) {
          setState({
            user: { email: dash.email, name: 'Emen' },
            dashboard: dash,
            loading: false,
            error: null,
          });
        }
      } catch (e: any) {
        if (!cancelled) {
          setState((s) => ({
            ...s,
            loading: false,
            error: e?.message ?? 'Gagal terhubung ke server',
          }));
        }
      }
    }

    boot();
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}