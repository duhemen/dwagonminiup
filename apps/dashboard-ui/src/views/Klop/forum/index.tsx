import { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import {
  getForumTopics, getForumStats, getForumCategories,
  createForumTopic, ForumTopic,
} from '../../../api/forum';
import Modal from '../../../components/Modal';

const SORTS = [
  { key: 'recent',  label: 'Terbaru' },
  { key: 'popular', label: 'Populer' },
  { key: 'viewed',  label: 'Banyak Dilihat' },
];

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'baru saja';
  if (min < 60) return `${min} menit lalu`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} jam lalu`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day} hari lalu`;
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function ForumPage() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const [topics, setTopics] = useState<ForumTopic[]>([]);
  const [stats, setStats] = useState<{ topics: number; replies: number; totalViews: number } | null>(null);
  const [categories, setCategories] = useState<{ name: string | null; count: number }[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState(params.get('q') ?? '');
  const [category, setCategory] = useState(params.get('category') ?? 'all');
  const [sort, setSort] = useState(params.get('sort') ?? 'recent');

  // New topic modal
  const [showNew, setShowNew] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('Umum');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getForumStats(), getForumCategories()])
      .then(([s, c]) => { setStats(s); setCategories(c); })
      .catch(() => {});
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getForumTopics({
        q: search, category: category === 'all' ? undefined : category, sort, limit: 30,
      });
      setTopics(res.items);
      setTotal(res.total);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [search, category, sort]);

  useEffect(() => { refresh(); }, [refresh]);
  useEffect(() => {
    const next = new URLSearchParams();
    if (search.trim()) next.set('q', search.trim());
    if (category !== 'all') next.set('category', category);
    if (sort !== 'recent') next.set('sort', sort);
    setParams(next, { replace: true });
  }, [search, category, sort, setParams]);

  const handleCreate = async () => {
    if (!newTitle.trim() || !newContent.trim()) {
      setError('Judul dan konten wajib diisi');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const topic = await createForumTopic(newTitle, newContent, newCategory);
      setShowNew(false);
      setNewTitle(''); setNewContent('');
      navigate(`/klop/forum/${topic.id}`);
    } catch (e: any) {
      setError(e?.response?.data?.error ?? 'Gagal membuat topik');
    } finally { setSubmitting(false); }
  };

  const popular = [...topics].sort((a, b) => b.repliesCount - a.repliesCount).slice(0, 3);

  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500 rounded-2xl p-6 md:p-10 mb-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-40 h-40 bg-purple-300/30 rounded-full -mr-16 -mt-16" />
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-xl md:text-2xl font-bold text-white mb-2 leading-tight">
            Sarana berdiskusi berbagai hal seputar Pembangunan sipil, tata bangunan dan teknologi di Indonesia.
          </h1>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4">
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Masukkan keyword..."
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
        </div>
        <button className="text-xs text-slate-500 hover:text-blue-500 font-medium mt-2">
          Pencarian Lanjutan ▾
        </button>
      </div>

      {/* Header: title + create button */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-4 border-b border-slate-200 pb-3 flex-1">
          {SORTS.map((s) => (
            <button
              key={s.key}
              onClick={() => setSort(s.key)}
              className={`text-sm font-medium transition pb-1 border-b-2 -mb-4 ${
                sort === s.key ? 'text-blue-600 border-blue-600' : 'text-slate-500 border-transparent hover:text-slate-700'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white text-sm px-4 py-2 rounded-lg font-medium transition flex items-center gap-1.5 ml-4"
        >
          <span>+</span> Buat Forum Baru
        </button>
      </div>

      {/* Categories pills */}
      <div className="flex flex-wrap gap-2 mb-5">
        <button
          onClick={() => setCategory('all')}
          className={`px-3 py-1.5 text-xs font-medium rounded-full ${
            category === 'all' ? 'bg-blue-500 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300'
          }`}
        >
          Semua
        </button>
        {categories.map((c) => (
          <button
            key={c.name}
            onClick={() => setCategory(c.name ?? 'all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-full flex items-center gap-1.5 ${
              category === c.name ? 'bg-blue-500 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300'
            }`}
          >
            <span>{c.name}</span>
            <span className="text-[9px] opacity-70">({c.count})</span>
          </button>
        ))}
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-white rounded-xl border border-slate-200 p-3">
            <p className="text-[10px] text-slate-500 uppercase tracking-wide">Topik</p>
            <p className="text-xl font-bold text-blue-600 mt-1">{stats.topics}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-3">
            <p className="text-[10px] text-slate-500 uppercase tracking-wide">Balasan</p>
            <p className="text-xl font-bold text-emerald-600 mt-1">{stats.replies}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-3">
            <p className="text-[10px] text-slate-500 uppercase tracking-wide">Total Views</p>
            <p className="text-xl font-bold text-purple-600 mt-1">{stats.totalViews.toLocaleString('id-ID')}</p>
          </div>
        </div>
      )}

      {/* Topics List */}
      <div className="bg-white rounded-xl border border-slate-200 divide-y">
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-sm">Memuat...</div>
        ) : topics.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-4xl mb-3">💬</p>
            <p className="font-semibold text-slate-700 mb-1">Belum ada diskusi</p>
            <p className="text-sm text-slate-500">Jadilah yang pertama membuat topik!</p>
          </div>
        ) : (
          topics.map((t) => (
            <Link
              key={t.id}
              to={`/klop/forum/${t.id}`}
              className="block p-4 hover:bg-slate-50 transition group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-slate-800 group-hover:text-blue-600 transition mb-1">
                    {t.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-1 mb-2">{t.content}</p>
                  <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-400">
                    {t.category && (
                      <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded">
                        {t.category}
                      </span>
                    )}
                    <span>oleh {t.authorName ?? '-'}</span>
                    <span>•</span>
                    <span>{timeAgo(t.createdAt)}</span>
                    <span>•</span>
                    <span className="text-slate-500">
                      Balasan terakhir {t.lastReplyAt ? timeAgo(t.lastReplyAt) : '-'}
                    </span>
                  </div>
                </div>
                <div className="text-right text-[10px] text-slate-500 whitespace-nowrap">
                  <div className="flex items-center gap-2 mb-1">
                    <span>👁️ {t.views.toLocaleString('id-ID')}</span>
                    <span>👍 {t.likes}</span>
                  </div>
                  <div className="flex items-center gap-1 text-blue-600 font-medium">
                    💬 {t.repliesCount} balasan
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* New topic modal */}
      <Modal open={showNew} onClose={() => setShowNew(false)} title="Buat Forum Baru">
        {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded p-2 mb-3 text-xs">{error}</div>}
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-slate-700 mb-1 block">Judul Topik</label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Tulis judul topik yang jelas dan spesifik"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-700 mb-1 block">Kategori</label>
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {['Umum', 'Manajemen', 'Bina Konstruksi', 'Bina Marga', 'Sumber Daya Air', 'Cipta Karya', 'Prasarana Strategis', 'Pengembangan Infrastruktur Wilayah'].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-700 mb-1 block">Isi Diskusi</label>
            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              rows={5}
              placeholder="Jelaskan topik diskusi Anda secara detail..."
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-slate-100">
          <button
            onClick={() => setShowNew(false)}
            disabled={submitting}
            className="px-4 py-2 text-sm rounded-lg border border-slate-300 hover:bg-slate-50"
          >
            Batal
          </button>
          <button
            onClick={handleCreate}
            disabled={submitting || !newTitle.trim() || !newContent.trim()}
            className="px-4 py-2 text-sm rounded-lg bg-orange-500 hover:bg-orange-600 disabled:bg-slate-300 text-white font-medium"
          >
            {submitting ? 'Membuat...' : 'Buat Topik'}
          </button>
        </div>
      </Modal>
    </div>
  );
}