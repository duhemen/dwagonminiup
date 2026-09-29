import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
});

// Dynamic edge path untuk region yang aktif
export function edgePath(suffix: string): string {
  const region = localStorage.getItem('dwagon_region') ?? 'jawa';
  return `/edge-${region}/${suffix}`;
}

// Edge path untuk region spesifik (untuk failover)
export function edgePathFor(region: string, suffix: string): string {
  return `/edge-${region}/${suffix}`;
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('dwagon_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('dwagon_token');
      localStorage.removeItem('dwagon_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);