import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCurrentSKP, getRekap, getKinerjaStats, SKP, RekapItem, KinerjaStats } from '../../api/kinerja';

const PREDIKAT_STYLES: Record<string, string> = {
  'Sangat Baik': 'bg-emerald-500 text-white',
  'Baik': 'bg-cyan-500 text-white',
  'Butuh Perbaikan': 'bg-yellow-500 text-white',
  'Kurang': 'bg-orange-500 text-white',
  'Sangat Kurang': 'bg-red-500 text-white',
};

function PredikatBadge({ v }: { v: string | null }) {
  if (!v) return <span className="text-slate-300">-</span>;
  return (
    <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${PREDIKAT_STYLES[v] ?? 'bg-slate-500 text-white'}`}>
      {v}
    </span>
  );
}

export default function KinerjaHome() {
  const [current, setCurrent] = useState<SKP | null>(null);
  const [rekap, setRekap] = useState<RekapItem[]>([]);
  const [stats, setStats] = useState<KinerjaStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTw, setActiveTw] = useState(1);

  useEffect(() => {
    Promise.all([getCurrentSKP(), getRekap(), getKinerjaStats()])
      .then(([c, r, s]) => { setCurrent(c); setRekap(r); setStats(s); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-12 text-center text-slate-500">Memuat...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 mb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Pilih SKP</p>
            <p className="text-sm font-medium text-slate-800">
              January 1, {new Date().getFullYear()} s/d December 31, {new Date().getFullYear()} — {current?.jabatan}, {current?.unitKerja}
            </p>
          </div>
          <Link to="/kinerja/skp/new" className="text-xs bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium">
            + Buat SKP Baru
          </Link>
        </div>
      </div>

      {/* Row 1: SKP + Rekap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* SKP Saya */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="bg-blue-900 text-white text-center py-2.5 font-semibold text-sm">SKP Saya</div>
          <div className="p-4">
            <div className="flex gap-2 mb-4">
              <button className="flex-1 py-2 text-xs font-bold bg-blue-700 text-white rounded">SKP</button>
              <button className="flex-1 py-2 text-xs font-medium bg-slate-100 text-slate-600 rounded">Rencana Aksi</button>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-3 py-1 bg-cyan-500 text-white rounded text-[10px] font-bold">
                {current?.status === 'Disetujui' ? 'Disetujui ✓' : current?.status ?? 'Draft'}
              </span>
              {[1, 2, 3, 4].map((tw) => {
                const ev = current?.evaluasi.find((e) => e.triwulan === tw);
                const isActive = activeTw === tw;
                return (
                  <button
                    key={tw}
                    onClick={() => setActiveTw(tw)}
                    className={`px-2 py-1 rounded text-[10px] font-medium transition ${
                      isActive ? 'bg-orange-500 text-white' : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                    }`}
                  >
                    TRIWULAN {['I','II','III','IV'][tw-1]}
                  </button>
                );
              })}
            </div>

            <div className="bg-blue-900 text-white text-center py-2 font-semibold text-xs mb-2">
              Cascading Rencana Hasil Kerja Saya
            </div>

            <table className="w-full text-xs">
              <thead className="border-b border-slate-200">
                <tr>
                  <th className="text-left py-2 font-semibold text-slate-700">Rencana Hasil Kerja</th>
                  <th className="text-right py-2 font-semibold text-slate-700">Jumlah Cascading</th>
                </tr>
              </thead>
              <tbody>
                {current?.rhkList.length === 0 ? (
                  <tr><td colSpan={2} className="py-4 text-center text-slate-400">Belum ada RHK</td></tr>
                ) : (
                  current?.rhkList.map((r) => (
                    <tr key={r.id} className="border-b border-slate-100 last:border-0">
                      <td className="py-2 pr-4 text-slate-700">{r.rencanaHasilKerja}</td>
                      <td className="py-2 text-right text-slate-600">{r.cascading} ⚙️</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Rekapitulasi Nilai */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="bg-blue-900 text-white text-center py-2.5 font-semibold text-sm">Rekapitulasi Nilai Kinerja</div>
          <div className="overflow-x-auto">
            <table className="w-full text-[10px]">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-2 py-2 text-left">No</th>
                  <th className="px-2 py-2 text-left">Jabatan</th>
                  <th className="px-2 py-2 text-left">Tahun</th>
                  <th className="px-2 py-2 text-left">Periode SKP</th>
                  <th className="px-2 py-2 text-center" colSpan={4}>Predikat</th>
                </tr>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th></th><th></th><th></th><th></th>
                  <th className="px-2 py-1.5 text-center">Triwulan 1</th>
                  <th className="px-2 py-1.5 text-center">Triwulan 2</th>
                  <th className="px-2 py-1.5 text-center">Triwulan 3</th>
                  <th className="px-2 py-1.5 text-center">Akhir Tahun</th>
                </tr>
              </thead>
              <tbody>
                {rekap.length === 0 ? (
                  <tr><td colSpan={8} className="py-6 text-center text-slate-400">Belum ada data</td></tr>
                ) : (
                  rekap.map((r, i) => (
                    <tr key={r.id} className="border-b border-slate-100 last:border-0">
                      <td className="px-2 py-3">{i + 1}</td>
                      <td className="px-2 py-3 text-slate-700 leading-tight">{r.jabatan}</td>
                      <td className="px-2 py-3">{r.tahun}</td>
                      <td className="px-2 py-3 whitespace-nowrap text-[9px]">{r.periode}</td>
                      <td className="px-2 py-3 text-center"><PredikatBadge v={r.tw1} /></td>
                      <td className="px-2 py-3 text-center"><PredikatBadge v={r.tw2} /></td>
                      <td className="px-2 py-3 text-center"><PredikatBadge v={r.tw3} /></td>
                      <td className="px-2 py-3 text-center"><PredikatBadge v={r.akhir} /></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Row 2: Pembinaan + Capaian */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="bg-blue-900 text-white text-center py-2.5 font-semibold text-sm">Pembinaan Kinerja</div>
          <div className="p-4 grid grid-cols-2 gap-3">
            <Link to="/kinerja/pembinaan" className="py-3 bg-blue-900 hover:bg-blue-800 text-white rounded font-semibold text-sm text-center transition">
              Bimbingan Kinerja
            </Link>
            <Link to="/kinerja/pembinaan" className="py-3 bg-blue-900 hover:bg-blue-800 text-white rounded font-semibold text-sm text-center transition">
              Konseling Kinerja
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="bg-blue-900 text-white text-center py-2.5 font-semibold text-sm">Capaian Kinerja Unit Kerja</div>
          <div className="p-4">
            <label className="text-xs font-semibold text-slate-700 block mb-2">Pilih Periode</label>
            <select className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm mb-4">
              <option>Triwulan 3</option>
              <option>Triwulan 2</option>
              <option>Triwulan 1</option>
            </select>

            <div className="flex gap-4 justify-center mb-3 text-[10px]">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-red-500" /> Referensi Kurva Kinerja</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-blue-500" /> Kinerja Pegawai</span>
            </div>

            <div className="flex gap-2">
              <div className="flex flex-col justify-between text-[9px] text-slate-500 py-1">
                {[27, 25, 20, 15, 10, 5, 0].map((n) => <span key={n}>{n}</span>)}
              </div>
              <div className="flex-1 border-l border-b border-slate-300 relative h-40">
                <svg viewBox="0 0 300 160" className="w-full h-full" preserveAspectRatio="none">
                  {[0, 32, 64, 96, 128, 160].map((y) => (
                    <line key={y} x1="0" y1={y} x2="300" y2={y} stroke="#e2e8f0" strokeWidth="1" />
                  ))}
                  <polyline points="0,20 60,60 120,90 180,110 240,125 300,140" fill="none" stroke="#ef4444" strokeWidth="2" />
                  <polyline points="0,150 60,150 120,150 180,150 240,150 300,150" fill="none" stroke="#3b82f6" strokeWidth="2" />
                </svg>
              </div>
            </div>
            <div className="flex justify-between text-[9px] text-slate-500 mt-1 pl-8">
              <span>Sangat Kurang</span>
              <span>Kurang</span>
              <span>Butuh Perbaikan</span>
              <span>Baik</span>
              <span>Sangat Baik</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats footer */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4">
          <div className="bg-white rounded-lg border border-slate-200 p-3">
            <p className="text-[10px] text-slate-500 uppercase tracking-wide">Total SKP</p>
            <p className="text-2xl font-bold text-blue-900 mt-1">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-3">
            <p className="text-[10px] text-slate-500 uppercase tracking-wide">Disetujui</p>
            <p className="text-2xl font-bold text-cyan-600 mt-1">{stats.disetujui}</p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-3">
            <p className="text-[10px] text-slate-500 uppercase tracking-wide">Diajukan</p>
            <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.diajukan}</p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-3">
            <p className="text-[10px] text-slate-500 uppercase tracking-wide">Draft</p>
            <p className="text-2xl font-bold text-slate-500 mt-1">{stats.draft}</p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-3">
            <p className="text-[10px] text-slate-500 uppercase tracking-wide">Nilai Rata-rata</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.avgNilai.toFixed(1)}</p>
          </div>
        </div>
      )}
    </div>
  );
}