import { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  getKomunitasList, getKomunitasStats, createKomunitas, submitKomunitas, deleteKomunitas,
  CommunityWork, KomunitasStats,
} from '../../../api/komunitas';
import Modal from '../../../components/Modal';

const TABS = ['Draft', 'Menunggu Validasi', 'Published', 'Undangan'];
const TYPES = ['Semua', 'Dokumen', 'Video', 'Foto', 'YouTube'];

const TYPE_COLORS: Record<string, string> = {
  'Dokumen': 'bg-blue-100 text-blue-700',
  'Video':   'bg-red-100 text-red-700',
  'Foto':    'bg-emerald-100 text-emerald-700',
  'YouTube': 'bg-red-100 text-red-700',
};

function WorkCard({ w, onDelete, onSubmit }: { w: CommunityWork; onDelete: (id: string) => void; onSubmit: (id: string) => void }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition group flex flex-col">
      <Link to={`/klop/komunitas/${w.id}`} className="block aspect-[16/10] bg-gradient-to-br from-purple-100 to-orange-100 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl opacity-40">{w.type === 'Video' || w.type === 'YouTube' ? '🎬' : w.type === 'Foto' ? '🖼️' : '📄'}</span>
        </div>
        <span className={`absolute top-3 left-3 text-[10px] px-2 py-1 rounded font-semibold ${TYPE_COLORS[w.type] ?? 'bg-slate-100'}`}>
          {w.type}
        </span>
        {w.status === 'Published' && (
          <span className="absolute top-3 right-3 text-[10px] bg-green-500 text-white px-2 py-1 rounded font-semibold">✓ Published</span>
        )}
        {w.status === 'Menunggu Validasi' && (
          <span className="absolute top-3 right-3 text-[10px] bg-amber-500 text-white px-2 py-1 rounded font-semibold">⏳ Validasi</span>
        )}
      </Link>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-sm text-slate-800 line-clamp-2 mb-2">{w.title}</h3>
        <p className="text-[11px] text-slate-500 line-clamp-2 mb-3">{w.description}</p>
        {w.category && <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded self-start mb-2">{w.category}</span>}
        <div className="flex items-center gap-3 mt-auto pt-3 border-t border-slate-100 text-[10px] text-slate-500">
          <span>👁️ {w.views}</span>
          <span>👍 {w.likes}</span>
          <span className="ml-auto">{w.publishedAt ? new Date(w.publishedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Belum publish'}</span>
        </div>
        {w.status === 'Draft' && (
          <div className="flex gap-2 mt-3">
            <button onClick={() => onSubmit(w.id)} className="flex-1 text-[11px] bg-blue-500 hover:bg-blue-600 text-white py-1.5 rounded-lg font-medium">Ajukan Validasi</button>
            <button onClick={() => onDelete(w.id)} className="text-[11px] bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg">Hapus</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function KomunitasPage() {
  const [params, setParams] = useSearchParams();
  const [tab, setTab] = useState<string>(params.get('tab') ?? 'Draft');
  const [items, setItems] = useState<CommunityWork[]>([]);
  const [stats, setStats] = useState<KomunitasStats | null>(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('Semua');

  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', type: 'Dokumen', category: 'Umum', content: '' });
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [list, s] = await Promise.all([
        getKomunitasList({ q: search, status: tab, type: type === 'Semua' ? undefined : type, limit: 30 }),
        getKomunitasStats(),
      ]);
      setItems(list.items);
      setTotal(list.total);
      setStats(s);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [search, tab, type]);

  useEffect(() => { refresh(); }, [refresh]);

  const handleCreate = async () => {
    if (!form.title.trim() || !form.description.trim()) { setErr('Judul dan deskripsi wajib'); return; }
    setSubmitting(true); setErr(null);
    try {
      await createKomunitas(form);
      setShowNew(false);
      setForm({ title: '', description: '', type: 'Dokumen', category: 'Umum', content: '' });
      await refresh();
    } catch (e: any) { setErr(e?.response?.data?.error ?? 'Gagal membuat'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus karya ini?')) return;
    await deleteKomunitas(id); await refresh();
  };
  const handleSubmit = async (id: string) => {
    await submitKomunitas(id); await refresh();
  };

  const tabCount = (t: string): number => {
    if (!stats) return 0;
    if (t === 'Draft') return stats.draft;
    if (t === 'Menunggu Validasi') return stats.validasi;
    if (t === 'Published') return stats.published;
    if (t === 'Undangan') return stats.undangan;
    return 0;
  };

  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-r from-orange-400 via-amber-500 to-orange-500 rounded-2xl p-6 md:p-8 mb-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-40 h-40 bg-purple-500/30 rounded-full -mr-16 -mt-16" />
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-xl md:text-2xl font-bold text-white mb-1">
            Mau Bikin Karya Bareng Temen?
          </h1>
          <p className="text-white/90 text-sm">Komunitas Klop Solusinya!</p>
        </div>
      </div>

      {/* Header buttons */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 text-xs rounded-full font-medium transition ${
                tab === t ? 'bg-orange-500 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:border-orange-300'
              }`}>
              {t} <span className="text-[9px] opacity-70 ml-1">({tabCount(t)})</span>
            </button>
          ))}
        </div>
        <button onClick={() => setShowNew(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white text-sm px-4 py-2 rounded-lg font-medium flex items-center gap-1.5">
          + Buat Karya Komunitas Baru
        </button>
      </div>

      {/* Search + type */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-5">
        <div className="flex flex-wrap gap-2">
          <div className="flex-1 min-w-[240px] relative">
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Masukkan keyword..." className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
          </div>
          <div className="flex gap-1.5">
            {TYPES.map((t) => (
              <button key={t} onClick={() => setType(t)}
                className={`px-3 py-2 text-xs rounded-lg font-medium transition ${type === t ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'}`}>
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-12 text-slate-500 text-sm">Memuat...</div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <p className="text-4xl mb-3">📭</p>
          <p className="font-semibold text-slate-700 mb-1">Tidak ada data</p>
          <p className="text-sm text-slate-500">Belum ada karya di kategori "{tab}".</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((w) => <WorkCard key={w.id} w={w} onDelete={handleDelete} onSubmit={handleSubmit} />)}
        </div>
      )}

      {/* Modal new */}
      <Modal open={showNew} onClose={() => setShowNew(false)} title="Buat Karya Komunitas Baru">
        {err && <div className="bg-red-50 border border-red-200 text-red-700 rounded p-2 mb-3 text-xs">{err}</div>}
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-slate-700 mb-1 block">Judul Karya</label>
            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Judul karya Anda" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-700 mb-1 block">Tipe</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
                {['Dokumen', 'Video', 'Foto', 'YouTube'].map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 mb-1 block">Kategori</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
                {['Umum', 'Manajemen', 'Bina Konstruksi', 'Bina Marga', 'Sumber Daya Air', 'Cipta Karya', 'Prasarana Strategis', 'Pengembangan Infrastruktur Wilayah'].map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-700 mb-1 block">Deskripsi Singkat</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3} placeholder="Ringkasan karya..." className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-700 mb-1 block">Konten Lengkap (opsional)</label>
            <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })}
              rows={4} placeholder="Detail konten..." className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none" />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-slate-100">
          <button onClick={() => setShowNew(false)} disabled={submitting} className="px-4 py-2 text-sm rounded-lg border border-slate-300 hover:bg-slate-50">Batal</button>
          <button onClick={handleCreate} disabled={submitting || !form.title.trim() || !form.description.trim()}
            className="px-4 py-2 text-sm rounded-lg bg-orange-500 hover:bg-orange-600 disabled:bg-slate-300 text-white font-medium">
            {submitting ? 'Membuat...' : 'Buat Draft'}
          </button>
        </div>
      </Modal>
    </div>
  );
}