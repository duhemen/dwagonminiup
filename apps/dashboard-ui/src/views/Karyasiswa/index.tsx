import { useEffect, useState } from 'react';
import TopBar from '../../components/TopBar';
import { getKaryasiswa, createKaryasiswa, submitKaryasiswa, KaryasiswaItem } from '../../api/final-batch';
import Modal from '../../components/Modal';

const STATUS_STYLES: Record<string, string> = {
  'Draft': 'bg-slate-100 text-slate-700',
  'Menunggu Validasi': 'bg-yellow-100 text-yellow-700',
  'Disetujui': 'bg-green-500 text-white',
  'Ditolak': 'bg-red-100 text-red-700',
};

const TABS = ['Semua', 'Draft', 'Menunggu Validasi', 'Disetujui', 'Ditolak'];

export default function Karyasiswa() {
  const [tab, setTab] = useState('Semua');
  const [items, setItems] = useState<KaryasiswaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({
    program: '', universitas: '', jenjang: 'S2', lokasiStudi: '',
    durasi: '', catatan: '', isBeasiswa: true,
  });
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    getKaryasiswa(tab).then(setItems).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, [tab]);

  const handleCreate = async () => {
    if (!form.program || !form.universitas) return;
    setSubmitting(true);
    try {
      await createKaryasiswa(form);
      setShowNew(false);
      setForm({ program: '', universitas: '', jenjang: 'S2', lokasiStudi: '', durasi: '', catatan: '', isBeasiswa: true });
      load();
    } finally { setSubmitting(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <TopBar title="Karyasiswa" variant="blue" />
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl p-6 mb-6">
          <h1 className="text-2xl font-bold mb-1">Program Karyasiswa</h1>
          <p className="text-sm text-blue-100">Rekomendasi studi lanjut dan program beasiswa</p>
        </div>

        <div className="flex gap-2 mb-4 flex-wrap">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 text-xs rounded-lg font-medium transition ${
                tab === t ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200'
              }`}>{t}</button>
          ))}
          <button onClick={() => setShowNew(true)}
            className="ml-auto text-xs bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium">
            + Ajukan Rekomendasi Studi
          </button>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200 py-12 text-center text-slate-500">Memuat...</div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 py-16 text-center">
            <p className="text-4xl mb-3 opacity-30">🎓</p>
            <p className="text-slate-500">Belum ada pengajuan rekomendasi</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-slate-100 border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-3 text-left">Tanggal Pengajuan</th>
                    <th className="px-3 py-3 text-left">Program</th>
                    <th className="px-3 py-3 text-left">Universitas</th>
                    <th className="px-3 py-3 text-left">Lokasi Studi</th>
                    <th className="px-3 py-3 text-center">Status</th>
                    <th className="px-3 py-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((k) => (
                    <tr key={k.id} className="border-b border-slate-100 last:border-0">
                      <td className="px-3 py-3 text-slate-600">{new Date(k.tanggalPengajuan).toLocaleDateString('id-ID')}</td>
                      <td className="px-3 py-3">
                        <p className="font-medium text-slate-800">{k.program}</p>
                        <p className="text-[10px] text-slate-500">{k.jenjang} · {k.durasi ?? '-'}</p>
                      </td>
                      <td className="px-3 py-3 text-slate-700">{k.universitas}</td>
                      <td className="px-3 py-3 text-slate-600">{k.lokasiStudi}</td>
                      <td className="px-3 py-3 text-center">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${STATUS_STYLES[k.status]}`}>
                          {k.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        {k.status === 'Draft' && (
                          <button onClick={() => submitKaryasiswa(k.id).then(load)}
                            className="text-[10px] bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded font-medium">
                            Ajukan
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <Modal open={showNew} onClose={() => setShowNew(false)} title="Ajukan Rekomendasi Studi">
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-slate-700 mb-1 block">Program Studi</label>
            <input type="text" value={form.program} onChange={(e) => setForm({ ...form, program: e.target.value })}
              placeholder="Magister Teknik Sipil" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-700 mb-1 block">Universitas</label>
            <input type="text" value={form.universitas} onChange={(e) => setForm({ ...form, universitas: e.target.value })}
              placeholder="Institut Teknologi Bandung" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-700 mb-1 block">Jenjang</label>
              <select value={form.jenjang} onChange={(e) => setForm({ ...form, jenjang: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
                {['D3', 'S1', 'S2', 'S3', 'Non-Gelar'].map((j) => <option key={j}>{j}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 mb-1 block">Lokasi Studi</label>
              <input type="text" value={form.lokasiStudi} onChange={(e) => setForm({ ...form, lokasiStudi: e.target.value })}
                placeholder="Bandung" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-700 mb-1 block">Durasi</label>
            <input type="text" value={form.durasi} onChange={(e) => setForm({ ...form, durasi: e.target.value })}
              placeholder="2 tahun" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
          </div>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.isBeasiswa} onChange={(e) => setForm({ ...form, isBeasiswa: e.target.checked })}
              className="rounded text-blue-600" />
            <span className="text-sm text-slate-700">Ajukan dengan beasiswa</span>
          </label>
        </div>
        <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-slate-100">
          <button onClick={() => setShowNew(false)} className="px-4 py-2 text-sm rounded-lg border border-slate-300">Batal</button>
          <button onClick={handleCreate} disabled={submitting || !form.program || !form.universitas}
            className="px-4 py-2 text-sm rounded-lg bg-orange-500 hover:bg-orange-600 disabled:bg-slate-300 text-white font-medium">
            Simpan Draft
          </button>
        </div>
      </Modal>
    </div>
  );
}