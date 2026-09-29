export interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
  region?: string;
}

export interface DashboardResponse {
  panels: string[];
  autoLogin: boolean;
  email: string;
}

export type PanelKey = 'KINERJA' | 'E-HRD' | 'AKREDITASI' | 'KARIR' | 'KLOP' | 'KARYA';