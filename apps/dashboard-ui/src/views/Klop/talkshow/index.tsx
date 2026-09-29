import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getTalkshowList, getTalkshowCategories, TalkshowEpisode } from '../../../api/talkshow';

const SORTS = [
  { key: 'recent', label: 'Terbaru' },
  { key: 'viewed', label: 'Banyak Dilihat' },
  { key: 'liked',  label: 'Banyak Disukai' },
];

function EpisodeCard({ ep }: { ep: TalkshowEpisode }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg hover:border-orange-300 transition group flex flex-col">
      {/* Poster */}
      <div className="aspect-[16/10] bg-gradient-to-br from-slate-700 to-slate-900 relative flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.3), transparent 40%), radial-gradient(circle at 70% 80%, rgba(255,200,100,0.3), transparent 40%)',
        }} />
        <div className="relative z-10 text-center text-white px-4">
          <div className="inline-flex items-center gap-2 bg-yellow-500/90 text-slate-900 text-[10px] px-2 py-0.5 rounded-full font-bold mb-3">
            <span>🎙️</span>
            <span>TALKSHOW</span>
            <span>EPISODE {ep.episodeNo}</span>
          </div>
          <p className="text-sm font-bold line-clamp-3 leading-snug">
            {ep.title}
          </p>
        </div>
        {/* Play button overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center">
            <span className="text-2xl ml-1">▶️</span>
          </div>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        {/* Meta */}
        <div className="flex items-center gap-2 text-[10px] text-slate-500 mb-2">
          <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
            {ep.category ?? 'Umum'}
          </span>
          {ep.duration && <span>⏱ {ep.duration}</span>}
        </div>

        <h3 className="font-semibold text-sm text-slate-800 line-clamp-2 mb-2 group-hover:text-orange-600 transition">
          {ep.title}
        </h3>

        <p className="text-[11px] text-slate-500 line-clamp-2 mb-3">
          {ep.description}
        </p>

        {/* Narasumber */}
        {ep.narasumber.length > 0 && (
          <div className="text-[10px] text-slate-500 mb-3">
            <p className="font-medium text-slate-600 mb-0.5">Narasumber:</p>
            {ep.narasumber.slice(0, 2).map((n, i) => (
              <p key={i} className="truncate">• {n}</p>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-3 mt-auto pt-3 border-t border-slate-100 text-[10px] text-slate-500">
          <span className="flex items-center gap-1"><span>👁️</span> {ep.views.toLocaleString('id-ID')}</span>
          <span className="flex items-center gap-1"><span>👍</span> {ep.likes}</span>
          <span className="flex items-center gap-1"><span>💬</span> {ep.commentsCount}</span>
          <span className="ml-auto text-slate-400">
            {new Date(ep.airedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function TalkshowPage() {
  const [params, setParams] = useSearchParams();
  const [items, setItems] = useState<TalkshowEpisode[]>([]);
  const [categories, setCategories] = useState<{ name: string | null; count: number }[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState(params.get('q') ?? '');
  const [category, setCategory] = useState(params.get('category') ?? 'all');
  const [sort, setSort] = useState(params.get('sort') ?? 'recent');

  useEffect(() => {
    getTalkshowCategories().then(setCategories).catch(() => {});
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getTalkshowList({
        q: search, category: category === 'all' ? undefined : category, sort, limit: 24,
      });
      setItems(res.items);
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

  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-orange-400 rounded-2xl p-6 md:p-10 mb-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-40 h-40 bg-yellow-300/30 rounded-full -mr-16 -mt-16" />
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Talkshow
          </h1>
          <p className="text-white/90 text-sm">
            Informasi terpadu Kementerian PU seputar Pembangunan sipil, tata bangunan dan teknologi di Indonesia
          </p>

          {/* Search */}
          <div className="flex gap-2 bg-white rounded-xl shadow-lg p-1.5 max-w-xl mt-5">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Masukkan keyword..."
              className="flex-1 px-4 py-2 text-sm focus:outline-none rounded-lg"
            />
            <button className="bg-slate-800 hover:bg-slate-900 text-white px-5 py-2 rounded-lg text-sm font-medium transition">
              Cari
            </button>
          </div>
        </div>
      </div>

      {/* Category pills + sort */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <button
          onClick={() => setCategory('all')}
          className={`px-3 py-1.5 text-xs font-medium rounded-full transition ${
            category === 'all' ? 'bg-orange-500 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:border-orange-300'
          }`}
        >
          Semua
        </button>
        {categories.map((c) => (
          <button
            key={c.name}
            onClick={() => setCategory(c.name ?? 'all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition flex items-center gap-1.5 ${
              category === c.name ? 'bg-orange-500 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:border-orange-300'
            }`}
          >
            <span>{c.name}</span>
            <span className="text-[9px] opacity-70">({c.count})</span>
          </button>
        ))}

        <div className="ml-auto flex gap-4 border-b border-transparent">
          {SORTS.map((s) => (
            <button
              key={s.key}
              onClick={() => setSort(s.key)}
              className={`text-xs font-medium transition pb-1 ${
                sort === s.key ? 'text-orange-500 border-b-2 border-orange-500' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Result */}
      <p className="text-xs text-slate-500 mb-4">
        {loading ? 'Memuat...' : `${total} episode`}
      </p>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 overflow-hidden animate-pulse">
              <div className="aspect-[16/10] bg-slate-200" />
              <div className="p-4 space-y-2">
                <div className="h-3 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <p className="text-4xl mb-3">🎙️</p>
          <p className="font-semibold text-slate-700 mb-1">Belum ada talkshow</p>
          <p className="text-sm text-slate-500">Coba ubah filter atau kata kunci.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((ep) => <EpisodeCard key={ep.id} ep={ep} />)}
        </div>
      )}
    </div>
  );
}