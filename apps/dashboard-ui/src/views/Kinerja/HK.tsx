import { useEffect, useState } from 'react';
import { getHKList, createHK, submitHK, HKPengajuan } from '../../api/kinerja-ext';
import Modal from '../../components/Modal';

const STATUS_STYLES: Record<string, string> = {
  'Draft': 'bg-slate-100 text-slate-700',
  'Diajukan': 'bg-yellow-100 text-yellow-700',
  'Diproses': 'bg-blue-100 text-blue-700',
  'Selesai': 'bg-green-500 text-white',
  'Ditolak': 'bg-red-100 text-red-700',
};

const KATEGORI = ['Keterlambatan', 'Nilai Tidak Sesuai', 'Beban Berlebih', 'Lainnya'];

export default function HK() {
  const [items, setItems] = useState<HKPengajuan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ tahun: new Date().getFullYear(), periode: '01-01 s/d 31-12', kategori: KATEGORI[0], alasan: '' });
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    getHKList().then(setItems).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!form.alasan.trim()) { setErr('Alasan wajib diisi'); return; }
    setSubmitting(true); setErr(null);
    try {
      await createHK(form);
      setShowNew(false);
      setForm({ tahun: new Date().getFullYear(), periode: '01-01 s/d 31-12', kategori: KATEGORI[0], alasan: '' });
      load();
    } catch (e: any) { setErr(e?.response?.data?.error ?? 'Gagal'); }
    finally { setSubmitting(false); }
  };

  const handleSubmit = async (id: string) => {
    if (!confirm('Ajukan HK ini?')) return;
    try { await submitHK(id); load(); }
    catch { alert('Gagal submit'); }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mb-4">
        <div className="bg-blue-900 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-bold text-lg">📋 Pengajuan & Monitoring Hak Keberatan</h1>
            <p className="text-xs text-blue-200 mt-0.5">Batas waktu pengajuan: 14 hari kerja sejak penetapan evaluasi</p>
          </div>
          <button onClick={() => setShowNew(true)}
            className="text-xs bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium whitespace-nowrap">
            + Ajukan HK Baru
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {[
          { label: 'Total', value: items.length, color: 'text-slate-800' },
          { label: 'Diajukan', value: items.filter((h) => h.status === 'Diajukan').length, color: 'text-yellow-600' },
          { label: 'Selesai', value: items.filter((h) => h.status === 'Selesai').length, color: 'text-green-600' },
          { label: 'Draft', value: items.filter((h) => h.status === 'Draft').length, color: 'text-slate-400' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-3">
            <p className="text-[10px] text-slate-500 uppercase tracking-wide">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-slate-200 divide-y">
        {loading ? (
          <div className="py-12 text-center text-slate-500">Memuat...</div>
        ) : items.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-4xl mb-3 opacity-30">📋</p>
            <p className="text-slate-500">Belum ada pengajuan HK</p>
          </div>
        ) : (
          items.map((h) => (
            <div key={h.id} className="p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1">
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${STATUS_STYLES[h.status] ?? 'bg-slate-100'}`}>
                    {h.status.toUpperCase()}
                  </span>
                  <span className="text-[10px] ml-2 bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{h.kategori}</span>
                </div>
                <span className="text-[10px] text-slate-500">Tahun {h.tahun}</span>
              </div>
              <p className="text-sm text-slate-700 mb-2 line-clamp-2">{h.alasan}</p>
              <div className="flex items-center justify-between text-[10px] text-slate-500">
                <span>Periode: {h.periode}</span>
                {h.status === 'Selesai' && h.tanggapan && (
                  <span className="text-green-600">✓ Ditanggapi</span>
                )}
              </div>
              {h.tanggapan && (
                <div className="mt-2 bg-green-50 border border-green-200 rounded p-2">
                  <p className="text-[10px] text-green-700 font-medium">Tanggapan:</p>
                  <p className="text-[11px] text-green-800">{h.tanggapan}</p>
                </div>
              )}
              {h.status === 'Draft' && (
                <div className="mt-3 flex gap-2">
                  <button onClick={() => handleSubmit(h.id)}
                    className="text-[11px] bg-orange-500 hover:bg-orange-600 text-white px-4 py-1.5 rounded-lg font-medium">
                    Ajukan
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <Modal open={showNew} onClose={() => setShowNew(false)} title="Ajukan Hak Keberatan">
        {err && <div className="bg-red-50 border border-red-200 text-red-700 rounded p-2 mb-3 text-xs">{err}</div>}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-700 mb-1 block">Tahun</label>
              <input type="number" value={form.tahun} onChange={(e) => setForm({ ...form, tahun: Number(e.target.value) })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 mb-1 block">Periode</label>
              <input type="text" value={form.periode} onChange={(e) => setForm({ ...form, periode: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-700 mb-1 block">Kategori</label>
            <select value={form.kategori} onChange={(e) => setForm({ ...form, kategori: e.target.value })}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
              {KATEGORI.map((k) => <option key={k}>{k}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-700 mb-1 block">Alasan</label>
            <textarea value={form.alasan} onChange={(e) => setForm({ ...form, alasan: e.target.value })}
              rows={5} placeholder="Jelaskan alasan pengajuan HK..."
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none" />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-slate-100">
          <button onClick={() => setShowNew(false)} className="px-4 py-2 text-sm rounded-lg border border-slate-300">Batal</button>
          <button onClick={handleCreate} disabled={submitting || !form.alasan.trim()}
            className="px-4 py-2 text-sm rounded-lg bg-orange-500 hover:bg-orange-600 disabled:bg-slate-300 text-white font-medium">
            {submitting ? 'Menyimpan...' : 'Simpan Draft'}
          </button>
        </div>
      </Modal>
    </div>
  );
}