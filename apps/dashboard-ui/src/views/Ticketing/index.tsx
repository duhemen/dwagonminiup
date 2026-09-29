import { useEffect, useState } from 'react';
import TopBar from '../../components/TopBar';
import { getTickets, getTicketStats, createTicket, Ticket } from '../../api/final-batch';
import Modal from '../../components/Modal';

const STATUS_STYLES: Record<string, string> = {
  'Terbuka': 'bg-blue-100 text-blue-700',
  'Diproses': 'bg-yellow-100 text-yellow-700',
  'Selesai': 'bg-green-500 text-white',
  'Ditutup': 'bg-slate-100 text-slate-700',
};

const PRIORITY_STYLES: Record<string, string> = {
  'Rendah': 'bg-slate-100 text-slate-600',
  'Normal': 'bg-blue-100 text-blue-700',
  'Tinggi': 'bg-orange-100 text-orange-700',
  'Urgent': 'bg-red-100 text-red-700',
};

const KATEGORI = ['Jaringan', 'Hardware', 'Software', 'Email', 'Aplikasi', 'Printer', 'Lainnya'];

export default function Ticketing() {
  const [items, setItems] = useState<Ticket[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ judul: '', kategori: KATEGORI[0], deskripsi: '', prioritas: 'Normal' });
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([getTickets(), getTicketStats()])
      .then(([t, s]) => { setItems(t); setStats(s); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!form.judul || !form.deskripsi) return;
    setSubmitting(true);
    try {
      await createTicket(form);
      setShowNew(false);
      setForm({ judul: '', kategori: KATEGORI[0], deskripsi: '', prioritas: 'Normal' });
      load();
    } finally { setSubmitting(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <TopBar title="Ticketing DATIN" variant="blue" />
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Dashboard Ticketing</h1>
            <p className="text-sm text-slate-500 mt-1">Ringkasan performa dan daftar tiket aktif Anda.</p>
          </div>
          <button onClick={() => setShowNew(true)}
            className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium">
            + Buat Tiket Baru
          </button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {[
              { label: 'Total Tiket Saya', value: stats.total, color: 'text-blue-600', icon: '📋' },
              { label: 'Sedang Diproses', value: stats.proses, color: 'text-yellow-600', icon: '⏳' },
              { label: 'Tiket Selesai', value: stats.selesai, color: 'text-green-600', icon: '✅' },
              { label: 'Terbuka', value: stats.terbuka, color: 'text-orange-600', icon: '🔓' },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
                <div className="text-3xl">{s.icon}</div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wide">{s.label}</p>
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 px-5 py-3 border-b border-slate-200">
            <h2 className="font-semibold text-slate-800 text-sm">Tiket Dalam Proses</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-100 border-b border-slate-200">
                <tr>
                  <th className="px-3 py-3 text-left w-28">No Tiket</th>
                  <th className="px-3 py-3 text-left">Judul Tiket</th>
                  <th className="px-3 py-3 text-left w-24">Kategori</th>
                  <th className="px-3 py-3 text-center w-24">Prioritas</th>
                  <th className="px-3 py-3 text-center w-28">Status</th>
                  <th className="px-3 py-3 text-left w-32">Terakhir Update</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="py-8 text-center text-slate-400">Memuat...</td></tr>
                ) : items.length === 0 ? (
                  <tr><td colSpan={6} className="py-12 text-center">
                    <p className="text-3xl mb-2 opacity-30">🎫</p>
                    <p className="text-slate-500">Tidak ada tiket</p>
                  </td></tr>
                ) : (
                  items.map((t) => (
                    <tr key={t.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                      <td className="px-3 py-3 font-mono text-[10px] text-slate-500">{t.ticketNo}</td>
                      <td className="px-3 py-3">
                        <p className="font-medium text-slate-800">{t.judul}</p>
                        <p className="text-[10px] text-slate-500 line-clamp-1">{t.deskripsi}</p>
                      </td>
                      <td className="px-3 py-3 text-slate-600">{t.kategori}</td>
                      <td className="px-3 py-3 text-center">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${PRIORITY_STYLES[t.prioritas]}`}>{t.prioritas}</span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${STATUS_STYLES[t.status]}`}>{t.status.toUpperCase()}</span>
                      </td>
                      <td className="px-3 py-3 text-[10px] text-slate-500">
                        {new Date(t.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal open={showNew} onClose={() => setShowNew(false)} title="Buat Tiket Baru">
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-slate-700 mb-1 block">Judul Tiket</label>
            <input type="text" value={form.judul} onChange={(e) => setForm({ ...form, judul: e.target.value })}
              placeholder="Contoh: Laptop tidak bisa connect ke WiFi" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-700 mb-1 block">Kategori</label>
              <select value={form.kategori} onChange={(e) => setForm({ ...form, kategori: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
                {KATEGORI.map((k) => <option key={k}>{k}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 mb-1 block">Prioritas</label>
              <select value={form.prioritas} onChange={(e) => setForm({ ...form, prioritas: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
                {['Rendah', 'Normal', 'Tinggi', 'Urgent'].map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-700 mb-1 block">Deskripsi Masalah</label>
            <textarea value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
              rows={5} placeholder="Jelaskan detail masalah..." className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none" />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-slate-100">
          <button onClick={() => setShowNew(false)} className="px-4 py-2 text-sm rounded-lg border border-slate-300">Batal</button>
          <button onClick={handleCreate} disabled={submitting || !form.judul || !form.deskripsi}
            className="px-4 py-2 text-sm rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-medium">
            Kirim Tiket
          </button>
        </div>
      </Modal>
    </div>
  );
}