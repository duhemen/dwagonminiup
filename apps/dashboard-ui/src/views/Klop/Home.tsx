import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCategories, getKlopStats, KnowledgeCategory, KlopStats } from '../../api/klop';

export default function KlopHome() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<KnowledgeCategory[]>([]);
  const [stats, setStats] = useState<KlopStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    Promise.all([getCategories(), getKlopStats()])
      .then(([c, s]) => { setCategories(c); setStats(s); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/klop/knowledge?q=${encodeURIComponent(search.trim())}`);
    }
  };

  return (
    <div>
      {/* Hero Banner */}
      <div className="relative bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 rounded-2xl p-8 md:p-12 mb-8 overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-yellow-300/30 rounded-full -mr-24 -mt-24" />
        <div className="absolute right-20 bottom-0 w-40 h-40 bg-orange-600/30 rounded-full -mb-16" />

        <div className="relative z-10 max-w-2xl">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-3 leading-tight">
            Pengen Tahu Seputar PU? <br />
            di KLOP in aja!
          </h1>
          <p className="text-white/90 text-sm md:text-base mb-6">
            Pusat pengetahuan, pembelajaran, dan kolaborasi untuk seluruh pegawai Kementerian PUPR
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex gap-2 bg-white rounded-xl shadow-lg p-1.5 max-w-xl">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Masukkan keyword..."
              className="flex-1 px-4 py-2 text-sm focus:outline-none rounded-lg"
            />
            <button
              type="submit"
              className="bg-slate-800 hover:bg-slate-900 text-white px-5 py-2 rounded-lg text-sm font-medium transition"
            >
              Semua
            </button>
          </form>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-10">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse flex flex-col items-center gap-3">
              <div className="w-20 h-20 rounded-full bg-slate-200" />
              <div className="h-3 w-24 bg-slate-200 rounded" />
            </div>
          ))
        ) : (
          categories.map((c) => (
            <Link
              key={c.id}
              to={`/klop/knowledge?category=${c.slug}`}
              className="group flex flex-col items-center gap-3 p-4 rounded-xl hover:bg-white hover:shadow-lg transition-all duration-200"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 text-white flex items-center justify-center text-4xl shadow-md shadow-orange-500/20 group-hover:scale-110 transition-transform">
                {c.icon}
              </div>
              <p className="text-xs md:text-sm font-medium text-slate-700 text-center group-hover:text-orange-600 transition">
                {c.name}
              </p>
              <span className="text-[10px] text-slate-400">
                {c.itemCount} item
              </span>
            </Link>
          ))
        )}
      </div>

      {/* Manajemen Pengetahuan Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 mb-8 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-orange-500 mb-3">
          Manajemen Pengetahuan
        </h2>
        <p className="text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Informasi terpadu Kementerian PU seputar aset pengetahuan bidang{' '}
          <strong className="text-slate-800">Sumber Daya Air</strong>,{' '}
          <strong className="text-slate-800">Bina Marga</strong>,{' '}
          <strong className="text-slate-800">Cipta Karya</strong>,{' '}
          <strong className="text-slate-800">Bina Konstruksi</strong>,{' '}
          <strong className="text-slate-800">Prasarana Strategis</strong>, dan{' '}
          <strong className="text-slate-800">Manajemen</strong>
        </p>

        {/* Tabs */}
        <div className="flex justify-center gap-6 mt-6 border-b border-slate-100 pb-3">
          {['Terbaru', 'Banyak Diskusi', 'Banyak Dilihat'].map((tab, i) => (
            <button
              key={tab}
              onClick={() => navigate('/klop/knowledge')}
              className={`text-sm font-medium transition ${
                i === 0 ? 'text-slate-800 border-b-2 border-orange-500 pb-3 -mb-3' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Quick stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div>
              <p className="text-2xl font-bold text-orange-500">{stats.totalItems}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wide mt-1">Knowledge Item</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-500">{stats.totalCategories}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wide mt-1">Kategori</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-500">{stats.totalViews.toLocaleString('id-ID')}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wide mt-1">Total Views</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-500">{stats.totalLikes.toLocaleString('id-ID')}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wide mt-1">Total Likes</p>
            </div>
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="flex justify-center">
        <Link
          to="/klop/knowledge"
          className="text-sm bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-full font-medium transition shadow-md shadow-orange-500/30"
        >
          Jelajahi Knowledge Library →
        </Link>
      </div>
    </div>
  );
}