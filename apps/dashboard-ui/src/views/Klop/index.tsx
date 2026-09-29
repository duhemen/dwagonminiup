import { useEffect, useState } from 'react';
import TopBar from '../../components/TopBar';
import { getEnrollments, enroll, unenroll, Enrollment } from '../../api/klop';
import { getPelatihanList, Pelatihan } from '../../api/ehrd';
import { useAuth } from '../../contexts/AuthContext';

type TabKey = 'dashboard' | 'karya' | 'profil';

const NAV_MENU = ['Home', 'E-Knowledge', 'E-Learning', 'Talkshow', 'Ruang Diskusi', 'Jurnal', 'Komunitas'];

export default function Klop() {
  const { user } = useAuth();
  const [tab, setTab] = useState<TabKey>('dashboard');
  const [pelatihan, setPelatihan] = useState<Pelatihan[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    try {
      const [p, e] = await Promise.all([getPelatihanList(), getEnrollments()]);
      setPelatihan(p);
      setEnrollments(e);
      setError(null);
    } catch (e: any) {
      setError(e?.response?.data?.error ?? e?.message ?? 'Gagal memuat data');
    }
  };

  useEffect(() => { refresh(); }, []);

  const enrolledIds = enrollments.map((e) => e.pelatihanId);

  const toggleEnroll = async (p: Pelatihan) => {
    try {
      const existing = enrollments.find((e) => e.pelatihanId === p.id);
      if (existing) await unenroll(existing.id);
      else await enroll(p.id);
      await refresh();
    } catch (e: any) {
      alert(e?.response?.data?.error ?? 'Gagal');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Orange Navbar */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-orange-500 text-white flex items-center justify-center font-bold">
                K
              </div>
              <span className="font-bold text-slate-800">Klop</span>
            </div>
            <nav className="hidden md:flex items-center gap-6 text-sm">
              {NAV_MENU.map((m) => (
                <button key={m} className="text-slate-600 hover:text-orange-600 transition font-medium">
                  {m}
                  {m === 'Komunitas' && (
                    <span className="ml-1 text-[9px] bg-orange-500 text-white px-1.5 py-0.5 rounded-full">NEW</span>
                  )}
                </button>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-700">{user?.email?.split('@')[0]}</span>
            <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded font-medium">ID</span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-6 text-sm">{error}</div>
        )}

        {/* Banner */}
        <div className="bg-gradient-to-r from-orange-500 via-red-500 to-orange-400 rounded-2xl p-8 mb-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-48 h-48 bg-yellow-400/40 rounded-full -mr-16 -mt-16" />
          <div className="relative">
            <h1 className="text-3xl font-bold text-white mb-2">Halo, {user?.email?.split('@')[0] ?? 'emen'}!</h1>
            <p className="text-white/90 text-sm">Selamat datang di Klop, sarana terbaik untuk berkarya</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 border-b border-slate-200 mb-6">
          {[
            { key: 'dashboard', label: 'Dashboard' },
            { key: 'karya', label: 'Karya Anda' },
            { key: 'profil', label: 'Profil' },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as TabKey)}
              className={`pb-3 text-sm font-medium transition border-b-2 ${
                tab === t.key
                  ? 'border-orange-500 text-slate-800'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'dashboard' && (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
              {[
                { label: 'Kontribusi Individu', val: 0, icon: '👤' },
                { label: 'Komunitas', val: 0, icon: '👥' },
                { label: 'Medali Emas', val: 0, icon: '🥇' },
                { label: 'Medali Perak', val: 0, icon: '🥈' },
                { label: 'Medali Perunggu', val: 0, icon: '🥉' },
              ].map((s) => (
                <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col items-center">
                  <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center text-lg mb-2">
                    {s.icon}
                  </div>
                  <p className="text-2xl font-bold text-slate-800">{s.val}</p>
                  <p className="text-[10px] text-slate-500 text-center mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Notifikasi + Talkshow */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
              <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5">
                <h3 className="font-semibold text-orange-600 mb-3">Notifikasi</h3>
                <p className="text-sm text-slate-400">Tidak ada notifikasi</p>
              </div>
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-5 text-white flex flex-col items-center justify-center min-h-[120px]">
                <p className="text-4xl font-bold">1</p>
                <p className="text-xs mt-2 text-white/90">Total Talkshow Diikuti</p>
              </div>
            </div>

            {/* Talkshow Diikuti */}
            <h3 className="font-semibold text-orange-600 mb-3">Talkshow Diikuti</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition">
                <div className="h-40 bg-gradient-to-br from-slate-700 to-slate-900 relative flex items-center justify-center">
                  <span className="absolute top-2 right-2 text-[10px] bg-green-500 text-white px-2 py-0.5 rounded">Selesai</span>
                  <div className="text-center text-white px-4">
                    <p className="text-[10px] text-yellow-400 mb-1">TALKSHOW Episode 70</p>
                    <p className="text-sm font-bold">DAPUR KOMPETENSI:</p>
                    <p className="text-xs">Meracik SDM Unggul dari Resep Asta Cita</p>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-sm font-semibold text-slate-800">Dapur Kompetensi</p>
                  <p className="text-xs text-slate-500 mt-1">NARASUMBER - Talkshow Series</p>
                </div>
              </div>
            </div>

            {/* Katalog Pelatihan */}
            <h3 className="font-semibold text-orange-600 mt-8 mb-3">Katalog Pelatihan Tersedia</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pelatihan.slice(0, 6).map((p) => {
                const isEnrolled = enrolledIds.includes(p.id);
                return (
                  <div key={p.id} className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{p.kategori}</span>
                      <span className="text-xs text-yellow-600">★ {p.rating}</span>
                    </div>
                    <h4 className="font-semibold text-slate-800 mb-1 text-sm">{p.nama}</h4>
                    <p className="text-xs text-slate-500 mb-3">{p.jp} JP · {p.totalPeserta.toLocaleString()} peserta</p>
                    <button
                      onClick={() => toggleEnroll(p)}
                      className={`mt-auto w-full py-2 text-xs rounded-lg transition ${
                        isEnrolled
                          ? 'bg-green-100 text-green-700 hover:bg-red-100 hover:text-red-700'
                          : 'bg-orange-500 text-white hover:bg-orange-600'
                      }`}
                    >
                      {isEnrolled ? '✓ Terdaftar' : 'Daftar Kelas'}
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {tab === 'karya' && (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400">
            Belum ada karya. Mulai berkontribusi di komunitas!
          </div>
        )}

        {tab === 'profil' && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-xl">
            <h3 className="font-semibold text-slate-800 mb-4">Profil Saya</h3>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-slate-500 text-xs">Nama</dt>
                <dd className="font-medium">{user?.name}</dd>
              </div>
              <div>
                <dt className="text-slate-500 text-xs">Email</dt>
                <dd className="font-medium">{user?.email}</dd>
              </div>
              <div>
                <dt className="text-slate-500 text-xs">Role</dt>
                <dd className="font-medium capitalize">{user?.role}</dd>
              </div>
            </dl>
          </div>
        )}
      </div>
    </div>
  );
}