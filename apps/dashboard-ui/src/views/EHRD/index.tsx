import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../../components/TopBar';
import Modal from '../../components/Modal';
import {
  getProfile,
  getPelatihanList,
  getUsulanList,
  UserProfile,
  Pelatihan,
  Usulan,
} from '../../api/ehrd';
import UsulanPelatihan from './UsulanPelatihan';
import RiwayatUsulan from './RiwayatUsulan';
import { hasilAsesmen } from './data';
import { useAuth } from '../../contexts/AuthContext';

type TabKey = 'dashboard' | 'asesmen' | 'k10' | 'k20' | 'k70';

const riwayatPelatihan = [
  { no: 1, nama: 'Webinar Series Kepahaman Intern dan Tata Kelola Bina Konstruksi (KITABina) dengan tema Membangun Ekosistem Anti Suap Melalui Penerapan Sistem Manajemen Anti Penyuapan (SMAP)', penyelenggara: 'Jakarta', tanggal: '2026-05-12 s/d 2026-05-12', tempat: 'Jakarta' },
  { no: 2, nama: 'KORPRI', penyelenggara: 'Denpasar', tanggal: '2026-03-27 s/d 2026-03-27', tempat: 'Denpasar' },
  { no: 3, nama: 'Manajemen Talenta', penyelenggara: 'Online', tanggal: '2026-03-27 s/d 2026-03-27', tempat: 'Online' },
  { no: 4, nama: 'Pengadaan PPPK', penyelenggara: 'Online', tanggal: '2026-03-26 s/d 2026-03-26', tempat: 'Online' },
  { no: 5, nama: 'Penggajian dan Tunjangan PPPK', penyelenggara: 'Denpasar', tanggal: '2026-03-26 s/d 2026-03-26', tempat: 'Denpasar' },
  { no: 6, nama: 'Penghargaan PPPK', penyelenggara: 'Online', tanggal: '2026-03-26 s/d 2026-03-26', tempat: 'Online' },
  { no: 7, nama: 'Umum', penyelenggara: 'Denpasar', tanggal: '2025-12-26 s/d 2025-12-26', tempat: 'Denpasar' },
  { no: 8, nama: 'E-learning #JadiPaham Gratifikasi Itu Bukan Rezeki', penyelenggara: 'Jakarta', tanggal: '2025-12-25 s/d 2025-12-25', tempat: 'Jakarta' },
  { no: 9, nama: 'E-Learning #JadiPaham Konflik Kepentingan', penyelenggara: 'Jakarta', tanggal: '2025-12-25 s/d 2025-12-25', tempat: 'Jakarta' },
];

export default function EHRD() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [tab, setTab] = useState<TabKey>('dashboard');
  const [showAsesmen, setShowAsesmen] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [pelatihan, setPelatihan] = useState<Pelatihan[]>([]);
  const [usulan, setUsulan] = useState<Usulan[]>([]);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [p, pel, us] = await Promise.all([
        getProfile(),
        getPelatihanList(),
        getUsulanList(),
      ]);
      setProfile(p);
      setPelatihan(pel);
      setUsulan(us);
      setError(null);
    } catch (e: any) {
      setError(e?.response?.data?.error ?? e?.message ?? 'Gagal memuat data');
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const avgNilai = Math.round(hasilAsesmen.reduce((a, b) => a + b.nilai, 0) / hasilAsesmen.length);
  const k10Count = pelatihan.filter((p) => ['Pelatihan Teknis', 'E-Learning', 'Blended Learning', 'Pelatihan di Kelas'].includes(p.kategori)).length;
  const k20Count = pelatihan.filter((p) => ['Coaching', 'Benchmarking'].includes(p.kategori)).length;

  return (
    <div className="min-h-screen bg-slate-50">
      <TopBar title="E-HRD" variant="blue" />

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-56px)] p-5 hidden md:block">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Menu Pribadi</p>
          <nav className="space-y-1">
            {[
              { label: 'Dashboard', icon: '🏠', key: 'dashboard' },
              { label: 'Nilai Kompetensi', icon: '📈', key: 'asesmen' },
              { label: 'Pengembangan Kompetensi Pribadi', icon: '🎯', key: 'k10' },
            ].map((m) => (
              <button
                key={m.key}
                onClick={() => setTab(m.key as TabKey)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition text-left ${
                  tab === m.key
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>{m.icon}</span>
                <span>{m.label}</span>
              </button>
            ))}
          </nav>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="mt-6 w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition"
          >
            🚪 Keluar
          </button>
        </aside>

        {/* Main */}
        <main className="flex-1 p-6 md:p-8 max-w-6xl">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-6 text-sm">
              {error}
            </div>
          )}

          {/* Profile Info */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-slate-400 mb-1">Jabatan</p>
                <p className="text-sm font-semibold text-slate-800">{profile?.jabatan ?? '-'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Pendidikan</p>
                <p className="text-sm font-semibold text-slate-800">{profile?.pendidikan ?? '-'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Atasan Langsung</p>
                <p className="text-sm font-semibold text-slate-800">{profile?.unitKerja ?? '-'}</p>
              </div>
            </div>

            {/* Tab Buttons */}
            <div className="flex flex-wrap gap-2 mt-6">
              <button
                onClick={() => setShowAsesmen(true)}
                className="px-4 py-2 bg-white border border-blue-300 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-50 transition"
              >
                Hasil Asesmen
              </button>
              {(['k10', 'k20', 'k70'] as const).map((k, i) => (
                <button
                  key={k}
                  onClick={() => setTab(k)}
                  className={`px-4 py-2 rounded-lg text-xs font-medium transition ${
                    tab === k
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-blue-300 text-blue-700 hover:bg-blue-50'
                  }`}
                >
                  Kompetensi {[10, 20, 70][i]}
                </button>
              ))}
            </div>
          </div>

          {/* Two Big Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <p className="text-xs text-slate-500 mb-2">Total Pelatihan yang Telah Diikuti</p>
              <p className="text-3xl font-bold text-slate-800">
                {riwayatPelatihan.length} <span className="text-lg font-medium">Pelatihan</span>
              </p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <p className="text-xs text-slate-500 mb-2">Total JP Bangkom Tahun 2026</p>
              <p className="text-3xl font-bold text-slate-800">
                13 <span className="text-lg font-medium">JP</span>
              </p>
            </div>
          </div>

          {/* Content by Tab */}
          {tab === 'dashboard' && (
            <>
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-6">
                <div className="px-6 py-4 border-b border-slate-100">
                  <h2 className="font-semibold text-slate-800">Riwayat Pelatihan</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Daftar riwayat pelatihan yang tercatat dalam sistem Sibangkoman.
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wide">
                      <tr>
                        <th className="px-4 py-3 text-left w-10">No.</th>
                        <th className="px-4 py-3 text-left">Nama Pelatihan</th>
                        <th className="px-4 py-3 text-left">Penyelenggara</th>
                        <th className="px-4 py-3 text-left">Tanggal</th>
                        <th className="px-4 py-3 text-left">Tempat</th>
                      </tr>
                    </thead>
                    <tbody>
                      {riwayatPelatihan.map((r) => (
                        <tr key={r.no} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="px-4 py-3 text-slate-500">{r.no}</td>
                          <td className="px-4 py-3 font-medium text-slate-800">{r.nama}</td>
                          <td className="px-4 py-3 text-slate-600">{r.penyelenggara}</td>
                          <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{r.tanggal}</td>
                          <td className="px-4 py-3">
                            <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">
                              {r.tempat}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <RiwayatUsulan usulan={usulan} />
            </>
          )}

          {tab === 'asesmen' && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="font-semibold text-slate-800 mb-4">Hasil Asesmen Kompetensi</h2>
              <div className="space-y-3">
                {hasilAsesmen.map((h) => (
                  <div key={h.kompetensi} className="flex items-center gap-4">
                    <div className="w-48 text-sm font-medium">{h.kompetensi}</div>
                    <div className="flex-1 bg-slate-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full ${h.nilai >= 85 ? 'bg-green-500' : h.nilai >= 75 ? 'bg-blue-500' : 'bg-yellow-500'}`}
                        style={{ width: `${h.nilai}%` }}
                      />
                    </div>
                    <div className="w-10 text-sm font-bold text-right">{h.nilai}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'k10' && <UsulanPelatihan kategoriFilter="10" pelatihan={pelatihan} onCreated={refresh} />}
          {tab === 'k20' && <UsulanPelatihan kategoriFilter="20" pelatihan={pelatihan} onCreated={refresh} />}
          {tab === 'k70' && <UsulanPelatihan kategoriFilter="70" pelatihan={pelatihan} onCreated={refresh} />}
        </main>
      </div>

      <Modal open={showAsesmen} onClose={() => setShowAsesmen(false)} title="Rincian Hasil Asesmen">
        <p className="text-sm text-slate-600 mb-4">
          Rata-rata nilai Anda adalah <span className="font-bold text-blue-600">{avgNilai}</span>.
        </p>
        <ul className="text-sm space-y-2 max-h-64 overflow-y-auto">
          {hasilAsesmen.map((h) => (
            <li key={h.kompetensi} className="flex justify-between border-b last:border-0 py-1">
              <span>{h.kompetensi}</span>
              <span className="font-medium">{h.nilai}</span>
            </li>
          ))}
        </ul>
      </Modal>
    </div>
  );
}