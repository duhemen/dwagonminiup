import { api } from './client';

export interface RekapKompetensi {
  id: string; uraian: string; sumberData: string;
  tglMulai: string | null; tglSelesai: string | null;
  jumlahJP: number; noSertifikat: string | null; lokasi: string | null;
  tahun: number; tglUpdate: string;
}

export interface KaryasiswaItem {
  id: string; program: string; universitas: string; jenjang: string;
  lokasiStudi: string; tanggalPengajuan: string; status: string;
  tahunAkademik: number; durasi: string | null; catatan: string | null;
  isBeasiswa: boolean; pengirim: string | null;
}

export interface Venue {
  id: string; nama: string; slug: string; tipe: string; unitId: string;
  kapasitas: number; deskripsi: string; harga: string; fasilitas: string[]; lokasi: string | null;
  isAvailable: boolean;
}

export interface VenueBooking {
  id: string; venueId: string; tanggalMulai: string; tanggalSelesai: string;
  keperluan: string; jumlahOrang: number; status: string;
  createdAt: string;
  venue: { nama: string; tipe: string; lokasi: string | null };
}

export interface Ticket {
  id: string; ticketNo: string; judul: string; kategori: string;
  deskripsi: string; prioritas: string; status: string;
  resolvedAt: string | null; createdAt: string;
}

export const getRekapKompetensi = (tahun?: string) =>
  api.get<RekapKompetensi[]>(`/kinerja/rekap-kompetensi${tahun && tahun !== 'Semua' ? `?tahun=${tahun}` : ''}`).then((r) => r.data);

export const getRekapStats = () =>
  api.get<{ total: number; totalJP: number; perYear: { tahun: number; jp: number }[] }>('/kinerja/rekap-kompetensi/stats').then((r) => r.data);

export const getKaryasiswa = (status?: string) =>
  api.get<KaryasiswaItem[]>(`/karyasiswa${status && status !== 'Semua' ? `?status=${status}` : ''}`).then((r) => r.data);

export const createKaryasiswa = (p: any) => api.post<KaryasiswaItem>('/karyasiswa', p).then((r) => r.data);
export const submitKaryasiswa = (id: string) => api.post(`/karyasiswa/${id}/submit`).then((r) => r.data);

export const getVenues = (tipe?: string) =>
  api.get<Venue[]>(`/spasi/venues${tipe && tipe !== 'Semua' ? `?tipe=${tipe}` : ''}`).then((r) => r.data);

export const getVenueDetail = (id: string) => api.get<Venue>(`/spasi/venues/${id}`).then((r) => r.data);
export const getMyBookings = () => api.get<VenueBooking[]>('/spasi/bookings').then((r) => r.data);
export const createBooking = (p: any) => api.post<VenueBooking>('/spasi/bookings', p).then((r) => r.data);

export const getTickets = (status?: string) =>
  api.get<Ticket[]>(`/ticketing${status && status !== 'Semua' ? `?status=${status}` : ''}`).then((r) => r.data);

export const getTicketStats = () =>
  api.get<{ total: number; proses: number; selesai: number; terbuka: number }>('/ticketing/stats').then((r) => r.data);

export const createTicket = (p: any) => api.post<Ticket>('/ticketing', p).then((r) => r.data);