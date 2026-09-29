import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getSKPList, submitSKP, SKP } from '../../api/kinerja';

const STATUS_STYLES: Record<string, string> = {
  'Draft': 'bg-slate-100 text-slate-700',
  'Diajukan': 'bg-yellow-100 text-yellow-700',
  'Disetujui': 'bg-cyan-500 text-white',
  'Ditolak': 'bg-red-100 text-red-700',
};

const PREDIKAT_STYLES: Record<string, string> = {
  'Sangat Baik': 'bg-emerald-500 text-white',
  'Baik': 'bg-cyan-500 text-white',
  'Butuh Perbaikan': 'bg-yellow-500 text-white',
  'Kurang': 'bg-orange-500 text-white',
  'Sangat Kurang': 'bg-red-500 text-white',
};

export default function SKPList() {
  const navigate = useNavigate();
  const [items, setItems] = useState<SKP[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ tahun: 'Semua', status: 'Semua' });

  const refresh = async () => {
    setLoading(true);
    try {
      const res = await getSKPList(filter);
      setItems(res);
    } finally { setLoading(false); }
  };

  useEffect(() => { refresh(); }, [filter]);

  const handleSubmit = async (id: string) => {
    if (!confirm('Ajukan SKP ini untuk persetujuan?')) return;
    try {
      await submitSKP(id);
      await refresh();
    } catch (e: any) {
      alert(e?.response?.data?.error ?? 'Gagal submit');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 mb-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-800">Daftar SKP</h1>
          <p className="text-xs text-slate-500 mt-0.5">Sasaran Kinerja Pegawai Anda</p>
        </div>
        <div className="flex gap-2">
          <select value={filter.tahun} onChange={(e) => setFilter({ ...filter, tahun: e.target.value })}
            className="text-xs border border-slate-300 rounded-lg px-3 py-2">
            <option value="Semua">Semua Tahun</option>
            {[2026, 2025, 2024].map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <select value={filter.status} onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            className="text-xs border border-slate-300 rounded-lg px-3 py-2">
            <option value="Semua">Semua Status</option>
            {['Draft', 'Diajukan', 'Disetujui', 'Ditolak'].map((s) => <option key={s}>{s}</option>)}
          </select>
          <Link to="/kinerja/skp/new" className="text-xs bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium whitespace-nowrap">
            + Buat SKP Baru
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-blue-900 text-white">
              <tr>
                <th className="px-3 py-3 text-left">No</th>
                <th className="px-3 py-3 text-left">Jabatan</th>
                <th className="px-3 py-3 text-center">Tahun</th>
                <th className="px-3 py-3 text-left">Periode</th>
                <th className="px-3 py-3 text-center">TW 1</th>
                <th className="px-3 py-3 text-center">TW 2</th>
                <th className="px-3 py-3 text-center">TW 3</th>
                <th className="px-3 py-3 text-center">Status Akhir</th>
                <th className="px-3 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="py-8 text-center text-slate-400">Memuat...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={9} className="py-12 text-center">
                  <p className="text-3xl mb-2 opacity-30">🎯</p>
                  <p className="text-slate-500">Belum ada SKP</p>
                  <Link to="/kinerja/skp/new" className="text-orange-500 hover:underline mt-2 inline-block">Buat SKP pertama →</Link>
                </td></tr>
              ) : (
                items.map((s, i) => (
                  <tr key={s.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="px-3 py-3 text-slate-500">{i + 1}</td>
                    <td className="px-3 py-3 text-slate-700 leading-tight max-w-[300px]">
                      {s.jabatan}, {s.unitKerja}
                    </td>
                    <td className="px-3 py-3 text-center font-medium">{s.tahun}</td>
                    <td className="px-3 py-3 text-[10px] whitespace-nowrap text-slate-500">
                      {new Date(s.periodeMulai).toLocaleDateString('id-ID')} s/d {new Date(s.periodeSelesai).toLocaleDateString('id-ID')}
                    </td>
                    {[1, 2, 3].map((tw) => {
                      const ev = s.evaluasi.find((e) => e.triwulan === tw);
                      return (
                        <td key={tw} className="px-3 py-3 text-center">
                          {ev?.predikat ? (
                            <span className={`text-[9px] px-2 py-0.5 rounded font-bold ${PREDIKAT_STYLES[ev.predikat] ?? 'bg-slate-400 text-white'}`}>
                              {ev.predikat.toUpperCase()}
                            </span>
                          ) : <span className="text-slate-300">-</span>}
                        </td>
                      );
                    })}
                    <td className="px-3 py-3 text-center">
                      <span className={`text-[9px] px-2 py-0.5 rounded font-bold ${STATUS_STYLES[s.status] ?? 'bg-slate-100'}`}>
                        {s.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <div className="flex gap-1 justify-center">
                        <button onClick={() => navigate(`/kinerja/skp/${s.id}`)}
                          className="text-[10px] bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded font-medium">
                          Detail
                        </button>
                        {s.status === 'Draft' && (
                          <button onClick={() => handleSubmit(s.id)}
                            className="text-[10px] bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded font-medium">
                            Ajukan
                          </button>
                        )}
                      </div>
                    </td>
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