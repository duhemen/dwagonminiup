import { api } from './client';

export interface ElearningCategory {
  id: string;
  slug: string;
  name: string;
  icon: string;
  courseCount: number;
}

export interface ElearningCourse {
  id: string;
  title: string;
  slug: string;
  description: string;
  type: string;
  accessType: string;
  status: string;
  poster: string | null;
  penyelenggara: string;
  totalJP: number;
  totalHours: number;
  startDate: string;
  endDate: string;
  year: number;
  kuota: number;
  enrolled: number;
  rating: number;
  category: { slug: string; name: string; icon: string };
  isEnrolled: boolean;
  userProgress: number;
  hasCert: boolean;
}

export interface ElearningStats {
  total: number;
  byStatus: Record<string, number>;
  byAccess: Record<string, number>;
}

export interface ElearningListResponse {
  items: ElearningCourse[];
  total: number;
  limit: number;
  offset: number;
}

export async function getElearningCategories(): Promise<ElearningCategory[]> {
  const { data } = await api.get<ElearningCategory[]>('/elearning/categories');
  return data;
}

export async function getCourses(params: {
  q?: string;
  category?: string;
  status?: string;
  accessType?: string;
  year?: string | number;
  penyelenggara?: string;
  sort?: string;
  tab?: 'elearning' | 'pelatihanku' | 'ehrd';
  limit?: number;
  offset?: number;
}): Promise<ElearningListResponse> {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') qs.append(k, String(v));
  });
  const { data } = await api.get<ElearningListResponse>(`/elearning/courses?${qs.toString()}`);
  return data;
}

export async function getElearningStats(tab: string = 'elearning'): Promise<ElearningStats> {
  const { data } = await api.get<ElearningStats>(`/elearning/stats?tab=${tab}`);
  return data;
}

export async function getYears(): Promise<number[]> {
  const { data } = await api.get<number[]>('/elearning/years');
  return data;
}

export async function getCourseDetail(id: string) {
  const { data } = await api.get(`/elearning/courses/${id}`);
  return data;
}

export async function enrollCourse(id: string) {
  const { data } = await api.post(`/elearning/courses/${id}/enroll`);
  return data;
}

export async function updateProgress(enrollmentId: string, progress: number) {
  const { data } = await api.patch(`/elearning/enrollments/${enrollmentId}/progress`, { progress });
  return data;
}

export async function getMyCourses() {
  const { data } = await api.get('/elearning/my-courses');
  return data;
}