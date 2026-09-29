import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  getElearningCategories, getCourses, getElearningStats, getYears, enrollCourse,
  ElearningCategory, ElearningCourse, ElearningStats,
} from '../../../api/elearning';
import CourseCard from './CourseCard';
import EHRDTab from './EHRDTab';

type Tab = 'pelatihanku' | 'ehrd' | 'elearning';

const STATUS_FILTERS = ['Semua', 'Dibuka', 'Dimulai', 'Akan Datang', 'Sudah Berakhir'];
const ACCESS_FILTERS = ['Semua', 'Terbuka', 'Pengajuan', 'Undangan'];

export default function KlopElearning() {
  const [params, setParams] = useSearchParams();
  const [tab, setTab] = useState<Tab>('pelatihanku');
  const [categories, setCategories] = useState<ElearningCategory[]>([]);
  const [courses, setCourses] = useState<ElearningCourse[]>([]);
  const [stats, setStats] = useState<ElearningStats | null>(null);
  const [years, setYears] = useState<number[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState(params.get('q') ?? '');
  const [status, setStatus] = useState(params.get('status') ?? 'Semua');
  const [accessType, setAccessType] = useState(params.get('accessType') ?? 'Semua');
  const [category, setCategory] = useState(params.get('category') ?? 'all');
  const [year, setYear] = useState(params.get('year') ?? 'Semua');
  const [bidang, setBidang] = useState('');
  const [penyelenggara, setPenyelenggara] = useState('');
  const [sort, setSort] = useState('recent');

  // Fetch categories + years
  useEffect(() => {
    Promise.all([getElearningCategories(), getYears()])
      .then(([c, y]) => { setCategories(c); setYears(y); })
      .catch(() => {});
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const apiTab = tab === 'pelatihanku' ? 'pelatihanku' : 'elearning';
      const [list, s] = await Promise.all([
        getCourses({
          q: search, category: category === 'all' ? undefined : category,
          status: status === 'Semua' ? undefined : status,
          accessType: accessType === 'Semua' ? undefined : accessType,
          year: year === 'Semua' ? undefined : year,
          penyelenggara: penyelenggara || undefined,
          sort, tab: apiTab as any, limit: 24,
        }),
        getElearningStats(apiTab),
      ]);
      setCourses(list.items);
      setTotal(list.total);
      setStats(s);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [search, status, accessType, category, year, penyelenggara, sort, tab]);

  useEffect(() => { refresh(); }, [refresh]);

  // Sync URL
  useEffect(() => {
    const next = new URLSearchParams();
    if (search.trim()) next.set('q', search.trim());
    if (status !== 'Semua') next.set('status', status);
    if (accessType !== 'Semua') next.set('accessType', accessType);
    if (category !== 'all') next.set('category', category);
    if (year !== 'Semua') next.set('year', String(year));
    setParams(next, { replace: true });
  }, [search, status, accessType, category, year, setParams]);

  const handleEnroll = async (id: string) => {
    try {
      await enrollCourse(id);
      await refresh();
    } catch (e: any) {
      alert(e?.response?.data?.error ?? 'Gagal mendaftar');
    }
  };

  const activeCat = categories.find((c) => c.slug === category);

  return (
    <div>
      {/* Hero banner */}
      <div className="relative bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-400 rounded-2xl p-6 md:p-8 mb-6 overflow-hidden">
        <div className="absolute right-0 top-0 w-40 h-40 bg-yellow-300/30 rounded-full -mr-16 -mt-16" />
        <div className="relative z-10 max-w-2xl">
          <p className="text-white/95 text-sm md:text-base italic mb-1">
            "Keberhasilan bukanlah milik orang yang pintar. Keberhasilan adalah kepunyaan mereka yang senantiasa berusaha."
          </p>
          <p className="text-white/80 text-xs">— B.J. Habibie</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-5">
        {[
          { key: 'pelatihanku', label: 'Pelatihanku',      color: 'orange' },
          { key: 'ehrd',        label: 'e-HRD',            color: 'orange' },
          { key: 'elearning',   label: 'e-learning',       color: 'orange' },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as Tab)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition ${
              tab === t.key
                ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/30'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-orange-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'ehrd' ? (
        <EHRDTab />
      ) : (
        <>
          {/* Section Title */}
          <div className="mb-4">
            <h1 className="text-xl md:text-2xl font-bold text-slate-800 mb-1">
              {tab === 'pelatihanku' ? 'Pelatihanku' : 'e-Learning'}
            </h1>
            {tab === 'elearning' && stats && (
              <p className="text-xs text-slate-500">
                {stats.total} course tersedia dari berbagai penyelenggara
              </p>
            )}
          </div>

          {/* Filters (hanya di tab elearning) */}
          {tab === 'elearning' && (
            <div className="bg-white rounded-xl border border-slate-200 p-4 mb-5 space-y-4">
              {/* Top row: Bidang / Unit / Tahun */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1">Pilih Bidang</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="all">Semua Bidang</option>
                    {categories.map((c) => (
                      <option key={c.slug} value={c.slug}>{c.icon} {c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1">Unit Penyelenggara</label>
                  <input
                    type="text"
                    value={penyelenggara}
                    onChange={(e) => setPenyelenggara(e.target.value)}
                    placeholder="Semua Unit Penyelenggara"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1">Pilih Tahun</label>
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="Semua">Semua Tahun</option>
                    {years.map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>

              {/* Status filter */}
              <div>
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-2">Filter berdasarkan status:</p>
                <div className="flex flex-wrap gap-2">
                  {STATUS_FILTERS.map((s) => {
                    const count = s === 'Semua' ? stats?.total : stats?.byStatus[s as keyof typeof stats.byStatus];
                    return (
                      <button
                        key={s}
                        onClick={() => setStatus(s)}
                        className={`px-3 py-1.5 text-[11px] font-medium rounded-full transition flex items-center gap-1.5 ${
                          status === s
                            ? 'bg-orange-500 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <span>{s.toUpperCase()}</span>
                        {count !== undefined && (
                          <span className={`text-[9px] px-1.5 rounded-full font-bold ${
                            status === s ? 'bg-white/20' : 'bg-white'
                          }`}>{count}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tipe Kelas filter */}
              <div>
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                  <span>⚙️</span> Tipe Kelas
                </p>
                <div className="flex flex-wrap gap-2">
                  {ACCESS_FILTERS.map((a) => {
                    const count = a === 'Semua' ? stats?.total : stats?.byAccess[a as keyof typeof stats.byAccess];
                    return (
                      <button
                        key={a}
                        onClick={() => setAccessType(a)}
                        className={`px-3 py-1.5 text-[11px] font-medium rounded-lg transition flex items-center gap-1.5 border ${
                          accessType === a
                            ? 'bg-blue-500 text-white border-blue-500'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
                        }`}
                      >
                        <span>{a === 'Terbuka' ? '🌐' : a === 'Pengajuan' ? '📝' : a === 'Undangan' ? '✉️' : '📚'}</span>
                        <span>{a}</span>
                        {count !== undefined && <span className="text-[9px] opacity-70">{count}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Search */}
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1">Cari e-Learning</label>
                <div className="relative">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari e-Learning"
                    className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                </div>
              </div>
            </div>
          )}

          {/* Pelatihanku: search only */}
          {tab === 'pelatihanku' && (
            <div className="bg-white rounded-xl border border-slate-200 p-4 mb-5 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1">Filter Tahun</label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="Semua">Semua Tahun</option>
                  {years.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1">Cari Pelatihanku</label>
                <div className="relative">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari Pelatihanku"
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                </div>
              </div>
            </div>
          )}

          {/* Result count */}
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-slate-500">
              {loading ? 'Memuat...' : `${total} course${activeCat ? ` · ${activeCat.name}` : ''}`}
            </p>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="recent">Terbaru</option>
              <option value="popular">Paling Populer</option>
              <option value="rating">Rating Tertinggi</option>
            </select>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-slate-200 overflow-hidden animate-pulse">
                  <div className="aspect-[16/10] bg-slate-200" />
                  <div className="p-4 space-y-2">
                    <div className="h-3 bg-slate-200 rounded w-3/4" />
                    <div className="h-3 bg-slate-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : courses.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <p className="text-4xl mb-3">📚</p>
              <p className="font-semibold text-slate-700 mb-1">
                {tab === 'pelatihanku' ? 'Belum ada pelatihan yang diikuti' : 'Tidak ada course ditemukan'}
              </p>
              <p className="text-sm text-slate-500">
                {tab === 'pelatihanku' ? 'Buka tab e-learning untuk mencari dan mendaftar course.' : 'Coba ubah filter atau kata kunci.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {courses.map((c) => <CourseCard key={c.id} course={c} onEnroll={handleEnroll} />)}
            </div>
          )}
        </>
      )}
    </div>
  );
}