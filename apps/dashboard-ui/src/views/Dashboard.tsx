import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import TopBar from '../components/TopBar';
import ServiceCard from '../components/ServiceCard';
import PushPermissionBanner from '../components/PushPermissionBanner';
import { useAuth } from '../contexts/AuthContext';
import { useApprovalBadge } from '../hooks/useApprovalBadge';

const SERVICES = [
  { title: 'E-HRD', description: 'Sistem manajemen sumber daya manusia elektronik terpadu', icon: '👥', path: '/ehrd', color: 'bg-blue-100 text-blue-600', category: 'SDM' },
  { title: 'KARIR', description: 'Portal pengembangan karir dan jalur promosi pegawai', icon: '🏆', path: '/karir', color: 'bg-orange-100 text-orange-600', category: 'SDM' },
  { title: 'KINERJA', description: 'Platform evaluasi dan monitoring kinerja pegawai secara komprehensif', icon: '📊', path: '/kinerja', color: 'bg-purple-100 text-purple-600', category: 'Akademik' },
  { title: 'KLOP', description: 'Kelas Online Pembelajaran untuk meningkatkan kompetensi pegawai', icon: '🎓', path: '/klop', color: 'bg-emerald-100 text-emerald-600', category: 'Akademik' },
  { title: 'AKREDITASI', description: 'Portal akreditasi dan sertifikasi lembaga pendidikan dan pelatihan', icon: '🏅', path: '/akreditasi', color: 'bg-rose-100 text-rose-600', category: 'Sertifikasi' },
  { title: 'KARYA', description: 'Sistem Informasi Manajemen Karya dan Inovasi Pegawai', icon: '💡', path: '/karya', color: 'bg-cyan-100 text-cyan-600', category: 'Akademik' },
];

const FILTERS = ['Semua Layanan', 'Terhubung', 'Belum Terhubung', 'Akademik', 'SDM', 'Sertifikasi'];

export default function Dashboard() {
  const { user } = useAuth();
  const { isApprover, stats } = useApprovalBadge();
  const [filter, setFilter] = useState('Semua Layanan');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return SERVICES.filter((s) => {
      const m1 = s.title.toLowerCase().includes(search.toLowerCase()) || s.description.toLowerCase().includes(search.toLowerCase());
      const m2 = filter === 'Semua Layanan' || filter === 'Terhubung' || s.category === filter;
      return m1 && m2;
    });
  }, [search, filter]);

  return (
    <div className="min-h-screen bg-slate-50">
      <TopBar title="DwaraDay" variant="blue" />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <PushPermissionBanner />

        <div className="bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200 rounded-2xl p-8 mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Welcome back, {user?.name?.split(',')[0] ?? 'Pengguna'}!
          </h1>
          <p className="text-slate-500">Selamat datang di DwagonMiniUp - Portal terpadu untuk pengembangan sumber daya manusia</p>
        </div>

        {isApprover && stats && stats.pending > 0 && (
          <Link to="/approval" className="block bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-300 rounded-xl p-5 mb-6 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-yellow-500 text-white flex items-center justify-center text-xl">📬</div>
                <div>
                  <p className="font-semibold text-slate-800">{stats.pending} usulan menunggu persetujuan Anda</p>
                  <p className="text-xs text-slate-500">Klik untuk melihat daftar usulan yang perlu diproses</p>
                </div>
              </div>
              <span className="text-yellow-700 font-semibold text-sm">Buka →</span>
            </div>
          </Link>
        )}

        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Layanan DwagonMiniUp</h2>
            <p className="text-sm text-slate-500 mt-1">Akses semua layanan digital dengan auto-login yang aman dan mudah</p>
          </div>
          <Link to="/live-dashboard" className="text-xs text-blue-600 border border-blue-300 bg-white hover:bg-blue-50 px-4 py-2 rounded-lg font-medium transition">
            📈 Live Metrics
          </Link>
        </div>

        <div className="flex flex-wrap gap-3 mb-4">
          <input type="text" placeholder="Cari layanan..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[240px] px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <select className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm">
            <option>Urutkan berdasarkan Nama</option>
            <option>Urutkan berdasarkan Kategori</option>
          </select>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition ${
                filter === f ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300'
              }`}>{f}</button>
          ))}
        </div>

        <div className="mb-4 flex items-center gap-2 text-sm">
          <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
          <span className="font-semibold text-slate-700">Layanan Terhubung ({filtered.length})</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((s) => <ServiceCard key={s.title} {...s} nip="198108272025211024" />)}
        </div>
      </div>
    </div>
  );
}