import { useEffect, useState } from 'react';
import { api } from '../../api/client';

interface RekapItem {
  id: string;
  uraian: string;
  sumberData: string;
  tglMulai: string | null;
  tglSelesai: string | null;
  jumlahJP: number;
  noSertifikat: string | null;
  lokasi: string | null;
  tahun: number;
}

interface RekapStats {
  total: number;
  totalJP: number;
  perYear: { tahun: number; jp: number }[];
}

export default function Rekap() {
  const [items, setItems] = useState<RekapItem[]>([]);
  const [stats, setStats] = useState<RekapStats | null>(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get<RekapItem[]>(`/kinerja/rekap-kompetensi?tahun=${year}`).then((r) => r.data),
      api.get<RekapStats>('/kinerja/rekap-kompetensi/stats').then((r) => r.data),
    ])
      .then(([i, s]) => { setItems(i); setStats(s); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [year]);

  const targetJP = 20;
  const currentJP = stats?.perYear.find((p) => p.tahun === year)?.jp ?? 0;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mb-4">
        <div className="bg-blue-900 text-white px-6 py-4">
          <h1 className="font-bold text-lg text-center">Rekapitulasi Pengembangan Kompetensi</h1>
        </div>

        {/* Summary Row */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card total JP */}
          <div className="bg-blue-800 text-white rounded-xl p-5 flex flex-col items-center justify-center">
            <p className="text-xs opacity-80">Total JP Tahun {year}</p>
            <p className="text-4xl font-bold mt-2">{currentJP}</p>
          </div>

          {/* Year picker */}
          <div className="border border-slate-200 rounded-xl p-5 flex flex-col justify-center">
            <p className="text-xs text-slate-500 mb-3">Pilih Tahun</p>
            <div className="flex gap-2">
              {[year - 1, year].map((y) => (
                <button
                  key={y}
                  onClick={() => setYear(y)}
                  className={`px-4 py-2 text-xs rounded-lg font-medium transition ${
                    year === y ? 'bg-blue-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {y}
                </button>
              ))}
            </div>
          </div>

          {/* Sync info */}
          <div className="border border-blue-200 bg-blue-50 rounded-xl p-5">
            <p className="text-xs text-blue-700 font-semibold">Sinkronisasi E-HRM</p>
            <p className="text-[10px] text-blue-600 mt-1 leading-relaxed">
              Data pengembangan kompetensi disinkronkan otomatis dari E-HRM.
            </p>
            <button className="mt-3 text-xs bg-blue-900 hover:bg-blue-800 text-white px-3 py-1.5 rounded-lg font-medium">
              Sinkronkan Manual
            </button>
          </div>
        </div>

        {/* Chart */}
        <div className="px-6 pb-6">
          <p className="text-xs font-semibold text-slate-600 mb-4 text-center">
            Grafik Perbandingan Total JP per Tahun
          </p>
          <div className="flex items-end gap-6 h-40 px-8 border-b border-slate-200">
            {stats?.perYear.map((p) => {
              const heightPct = Math.min((p.jp / targetJP) * 100, 100);
              return (
                <div key={p.tahun} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-xs font-bold text-slate-700">{p.jp} JP</span>
                  <div className="w-full relative" style={{ height: '80px' }}>
                    {/* Target marker */}
                    <div className="absolute left-0 right-0 border-t border-dashed border-orange-500"
                      style={{ bottom: '100%', top: 'auto', transform: 'translateY(-80px)' }} />
                    {/* Bar */}
                    <div className="absolute bottom-0 left-0 right-0 bg-pink-400 rounded-t-sm transition-all duration-500"
                      style={{ height: `${heightPct}%` }} />
                  </div>
                  <span className="text-[10px] text-slate-500">{p.tahun}</span>
                </div>
              );
            })}
          </div>
          <div className="text-[10px] text-slate-500 text-center mt-4 flex justify-center gap-6">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-4 h-3 bg-pink-400 rounded-sm" />
              Total JP per Tahun
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-4 h-0 border-t-2 border-dashed border-orange-500" />
              Target {targetJP} JP
            </span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-100 border-b border-slate-200">
              <tr>
                <th className="px-3 py-3 text-left w-12">No</th>
                <th className="px-3 py-3 text-left">Uraian Diklat / Pengembangan Kompetensi</th>
                <th className="px-3 py-3 text-left w-24">Sumber Data</th>
                <th className="px-3 py-3 text-left w-28">Tanggal Mulai</th>
                <th className="px-3 py-3 text-left w-28">Tanggal Selesai</th>
                <th className="px-3 py-3 text-center w-16">JP</th>
                <th className="px-3 py-3 text-left w-40">No. Sertifikat</th>
                <th className="px-3 py-3 text-left w-24">Lokasi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">Memuat...</td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <p className="text-sm text-slate-500">Belum ada data untuk tahun {year}</p>
                    <p className="text-xs text-slate-400 mt-1">Coba ubah filter tahun atau lakukan sinkronisasi E-HRM</p>
                  </td>
                </tr>
              ) : (
                items.map((r, i) => (
                  <tr key={r.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="px-3 py-3 text-slate-500">{i + 1}</td>
                    <td className="px-3 py-3 text-slate-800">{r.uraian}</td>
                    <td className="px-3 py-3">
                      <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-medium">
                        {r.sumberData}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-slate-600 whitespace-nowrap">
                      {r.tglMulai ? new Date(r.tglMulai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                    </td>
                    <td className="px-3 py-3 text-slate-600 whitespace-nowrap">
                      {r.tglSelesai ? new Date(r.tglSelesai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                    </td>
                    <td className="px-3 py-3 text-center font-bold text-slate-800">{r.jumlahJP}</td>
                    <td className="px-3 py-3 text-[10px] font-mono text-slate-600">
                      {r.noSertifikat ?? '-'}
                    </td>
                    <td className="px-3 py-3 text-slate-600">{r.lokasi ?? '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}