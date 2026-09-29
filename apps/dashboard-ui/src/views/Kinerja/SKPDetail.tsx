import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getSKPDetail, submitSKP, SKP } from '../../api/kinerja';

const STATUS_STYLES: Record<string, string> = {
  'Draft': 'bg-slate-100 text-slate-700',
  'Diajukan': 'bg-yellow-100 text-yellow-700',
  'Disetujui': 'bg-green-500 text-white',
  'Ditolak': 'bg-red-100 text-red-700',
};

const PREDIKAT_STYLES: Record<string, string> = {
  'Sangat Baik': 'bg-emerald-500 text-white',
  'Baik': 'bg-cyan-500 text-white',
  'Butuh Perbaikan': 'bg-yellow-500 text-white',
  'Kurang': 'bg-orange-500 text-white',
  'Sangat Kurang': 'bg-red-500 text-white',
};

export default function SKPDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<SKP | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getSKPDetail(id).then(setData).catch(() => navigate('/kinerja/skp')).finally(() => setLoading(false));
  }, [id, navigate]);

  const handleSubmit = async () => {
    if (!id || !confirm('Ajukan SKP ini?')) return;
    setSubmitting(true);
    try {
      const updated = await submitSKP(id);
      setData(updated);
    } catch (e: any) {
      alert(e?.response?.data?.error ?? 'Gagal');
    } finally { setSubmitting(false); }
  };

  if (loading) return <div className="p-12 text-center text-slate-500">Memuat...</div>;
  if (!data) return null;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <button onClick={() => navigate('/kinerja/skp')} className="text-sm text-slate-500 hover:text-blue-600 mb-4">← Kembali ke Daftar SKP</button>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mb-4">
        <div className="bg-blue-900 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-blue-200 uppercase tracking-wide">SKP Tahun {data.tahun}</p>
            <h1 className="font-bold text-lg mt-0.5">{data.jabatan}</h1>
            <p className="text-xs text-blue-200">{data.unitKerja}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-3 py-1 rounded-lg font-bold ${STATUS_STYLES[data.status] ?? 'bg-slate-100'}`}>
              {data.status}
            </span>
            {data.status === 'Draft' && (
              <button onClick={handleSubmit} disabled={submitting}
                className="text-xs bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium disabled:bg-slate-500">
                {submitting ? 'Mengajukan...' : 'Ajukan'}
              </button>
            )}
          </div>
        </div>

        {/* Metadata */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm border-b border-slate-100">
          <div>
            <p className="text-[10px] text-slate-500 uppercase">Periode</p>
            <p className="font-medium">
              {new Date(data.periodeMulai).toLocaleDateString('id-ID')} — {new Date(data.periodeSelesai).toLocaleDateString('id-ID')}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase">Atasan Langsung</p>
            <p className="font-medium">{data.atasanNama ?? '-'}</p>
            <p className="text-[10px] text-slate-500">{data.atasanNip}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase">Pejabat Penandatangan</p>
            <p className="font-medium">{data.pejabatNama ?? '-'}</p>
            <p className="text-[10px] text-slate-500">{data.pejabatNip}</p>
          </div>
        </div>

        {/* RHK */}
        <div className="p-6">
          <h2 className="font-bold text-slate-800 text-sm mb-3">🎯 Rencana Hasil Kerja ({data.rhkList.length})</h2>
          <div className="space-y-2">
            {data.rhkList.map((r, i) => (
              <div key={r.id} className="border border-slate-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <span className="text-xs font-bold text-blue-900 bg-blue-100 w-6 h-6 rounded flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm text-slate-800 font-medium">{r.rencanaHasilKerja}</p>
                    {r.indikator.length > 0 && (
                      <div className="mt-2 space-y-0.5">
                        {r.indikator.map((ind, j) => (
                          <p key={j} className="text-[11px] text-slate-500">• {ind}</p>
                        ))}
                      </div>
                    )}
                    {(r.target || r.satuan) && (
                      <p className="text-[11px] text-slate-500 mt-1">
                        Target: <span className="font-medium text-slate-700">{r.target} {r.satuan}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Evaluasi */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="bg-blue-900 text-white px-6 py-3">
          <h2 className="font-bold text-sm">📊 Evaluasi Triwulan</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {data.evaluasi.map((ev) => (
            <div key={ev.id} className="border border-slate-200 rounded-lg p-3">
              <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-2">Triwulan {ev.triwulan}</p>
              {ev.status === 'sudah' && ev.predikat ? (
                <>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${PREDIKAT_STYLES[ev.predikat] ?? 'bg-slate-400'}`}>
                    {ev.predikat.toUpperCase()}
                  </span>
                  {ev.nilai !== null && <p className="text-lg font-bold text-slate-800 mt-1.5">{ev.nilai.toFixed(1)}</p>}
                  {ev.catatan && <p className="text-[10px] text-slate-500 mt-1 italic">"{ev.catatan}"</p>}
                </>
              ) : ev.status === 'menunggu' ? (
                <span className="text-[10px] px-2 py-0.5 rounded bg-yellow-100 text-yellow-700 font-medium">Menunggu Penilaian</span>
              ) : (
                <span className="text-[10px] text-slate-400">Belum dievaluasi</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}