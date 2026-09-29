import { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  getCategories, getKnowledgeList,
  KnowledgeCategory, KnowledgeItem,
} from '../../api/klop';

const TYPES = ['Semua', 'Dokumen', 'Video', 'Foto', 'YouTube'];
const SORTS = [
  { key: 'recent',    label: 'Terbaru' },
  { key: 'popular',   label: 'Banyak Diskusi' },
  { key: 'viewed',    label: 'Banyak Dilihat' },
];

const TYPE_COLORS: Record<string, string> = {
  'Dokumen': 'bg-blue-100 text-blue-700',
  'Video':   'bg-red-100 text-red-700',
  'Foto':    'bg-emerald-100 text-emerald-700',
  'YouTube': 'bg-red-100 text-red-700',
};

function formatNumber(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return String(n);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

function ItemCard({ item }: { item: KnowledgeItem }) {
  return (
    <Link
      to={`/klop/knowledge/${item.id}`}
      className="block bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg hover:border-orange-300 transition group"
    >
      {/* Thumbnail */}
      <div className="aspect-[16/10] bg-gradient-to-br from-slate-100 to-slate-200 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl opacity-30">
            {item.type === 'Video' || item.type === 'YouTube' ? '🎬' : item.type === 'Foto' ? '🖼️' : '📄'}
          </span>
        </div>
        {/* Type badge */}
        <span className={`absolute top-3 left-3 text-[10px] px-2 py-1 rounded-md font-semibold ${TYPE_COLORS[item.type] ?? 'bg-slate-100 text-slate-700'}`}>
          {item.type}
        </span>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-sm text-slate-800 line-clamp-2 mb-2 group-hover:text-orange-600 transition">
          {item.title}
        </h3>
        <p className="text-[10px] text-orange-500 font-medium mb-1">
          {item.category.name}
        </p>
        <p className="text-[11px] text-slate-500 line-clamp-1">
          Penulis: {item.author.name ?? '-'}
        </p>
        <p className="text-[10px] text-slate-400 mt-1">{formatDate(item.publishedAt)}</p>

        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-100 text-[10px] text-slate-500">
          <span className="flex items-center gap-1">
            <span>👁️</span> {formatNumber(item.views)}
          </span>
          <span className="flex items-center gap-1">
            <span>👍</span> {formatNumber(item.likes)}
          </span>
          <span className="flex items-center gap-1">
            <span>💬</span> {formatNumber(item.commentsCount)}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function KlopKnowledge() {
  const [params, setParams] = useSearchParams();
  const [categories, setCategories] = useState<KnowledgeCategory[]>([]);
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState(params.get('q') ?? '');
  const [category, setCategory] = useState(params.get('category') ?? 'all');
  const [type, setType] = useState(params.get('type') ?? 'Semua');
  const [sort, setSort] = useState(params.get('sort') ?? 'recent');

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getKnowledgeList({
        q: search,
        category: category === 'all' ? undefined : category,
        type: type === 'Semua' ? undefined : type,
        sort,
        limit: 24,
      });
      setItems(res.items);
      setTotal(res.total);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [search, category, type, sort]);

  useEffect(() => { refresh(); }, [refresh]);

  // Update URL when filter changes
  useEffect(() => {
    const next = new URLSearchParams();
    if (search.trim()) next.set('q', search.trim());
    if (category !== 'all') next.set('category', category);
    if (type !== 'Semua') next.set('type', type);
    if (sort !== 'recent') next.set('sort', sort);
    setParams(next, { replace: true });
  }, [search, category, type, sort, setParams]);

  const activeCategory = categories.find((c) => c.slug === category);

  return (
    <div>
      {/* Search Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-5">
        <div className="flex flex-wrap gap-3 mb-3">
          <div className="flex-1 min-w-[240px] relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Masukkan keyword..."
              className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
          </div>
          <div className="flex gap-2">
            {TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`px-3 py-2 text-xs font-medium rounded-lg transition ${
                  type === t
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <button className="text-xs text-slate-500 hover:text-orange-500 font-medium flex items-center gap-1">
          Pencarian Lanjutan ▾
        </button>
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setCategory('all')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
            category === 'all' ? 'bg-orange-500 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:border-orange-300'
          }`}
        >
          Semua Kategori
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategory(c.slug)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition flex items-center gap-1.5 ${
              category === c.slug ? 'bg-orange-500 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:border-orange-300'
            }`}
          >
            <span>{c.icon}</span>
            <span className="hidden sm:inline">{c.name}</span>
            <span className="text-[10px] opacity-70">({c.itemCount})</span>
          </button>
        ))}
      </div>

      {/* Sort tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 mb-5">
        <div className="flex gap-6">
          {SORTS.map((s) => (
            <button
              key={s.key}
              onClick={() => setSort(s.key)}
              className={`pb-3 text-sm font-medium transition border-b-2 -mb-px ${
                sort === s.key
                  ? 'border-orange-500 text-slate-800'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-500 mb-3">
          {loading ? 'Memuat...' : `${total} item${activeCategory ? ` di ${activeCategory.name}` : ''}`}
        </p>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 overflow-hidden animate-pulse">
              <div className="aspect-[16/10] bg-slate-200" />
              <div className="p-4 space-y-2">
                <div className="h-3 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-200 rounded w-1/2" />
                <div className="h-2 bg-slate-200 rounded w-2/3 mt-3" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <p className="text-4xl mb-3">🔍</p>
          <p className="font-semibold text-slate-700 mb-1">Tidak ada hasil</p>
          <p className="text-sm text-slate-500">Coba ubah filter atau kata kunci pencarian.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((item) => <ItemCard key={item.id} item={item} />)}
        </div>
      )}
    </div>
  );
}