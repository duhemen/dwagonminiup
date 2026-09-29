import { api } from './client';

export interface LoginResponse {
  token: string;
  user: { id: string; email: string; name: string; role: string };
  region: string;
  regionSource: 'ip' | 'assigned' | 'profile' | 'locked' | 'default' | 'simulate';
  regionLocked: boolean;
  ip?: string;
  fallbacks?: string[];
}

export interface ProfileResponse {
  id: string; email: string; name: string | null; nip: string | null;
  jabatan: string | null; unitKerja: string | null; pendidikan: string | null;
  role: string; region: string | null; assignedRegion: string | null;
  regionLocked: boolean; lastIP: string | null; lastLoginAt: string | null;
  createdAt: string;
}

export async function loginApi(email: string, password: string, simulateRegion?: string): Promise<LoginResponse> {
  const url = simulateRegion ? `/auth/login?simulate_region=${simulateRegion}` : '/auth/login';
  const { data } = await api.post<LoginResponse>(url, { email, password });
  return data;
}

export async function getMe(): Promise<ProfileResponse> {
  const { data } = await api.get<ProfileResponse>('/auth/me');
  return data;
}

export async function changePassword(oldPassword: string, newPassword: string) {
  const { data } = await api.post('/auth/change-password', { oldPassword, newPassword });
  return data;
}

export async function getDashboard() {
  const { data } = await api.get('/dashboard');
  return data;
}