import { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getJurnalList, getJurnalBidang, getJurnalYears, Jurnal } from '../../../api/jurnal';

function JurnalCard({ j }: { j: Jurnal }) {
  return (
    <Link to={`/klop/jurnal/${j.id}`} className="group block bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg hover:border-orange-300 transition">
      {/* Cover */}
      <div className="aspect-[3/4] relative overflow-hidden flex flex-col items-center justify-center p-4 text-white"
           style={{ backgroundColor: j.coverColor }}>
        <div className="absolute top-2 left-2 text-[9px] font-mono opacity-70">{j.issn ? `ISSN ${j.issn}` : ''}</div>
        <div className="absolute top-2 right-2 text-[9px] font-mono opacity-70">{j.eissn ? `E-ISSN ${j.eissn}` : ''}</div>
        <div className="text-center px-2">
          <p className="text-[10px] uppercase tracking-widest opacity-80 mb-1">JURNAL</p>
          <p className="text-xl font-serif font-bold leading-tight">{j.title.replace('Jurnal ', '')}</p>
          <div className="w-12 h-px bg-white/60 mx-auto my-3" />
          <p className="text-[10px] opacity-90">{j.volume} {j.edition}</p>
          <p className="text-[10px] opacity-70 mt-1">{j.year}</p>
        </div>
        <div className="absolute bottom-2 left-2 right-2 text-[9px] text-center opacity-70 truncate">
          {j.publisher}
        </div>
      </div>
      {/* Meta */}
      <div className="p-3 text-center bg-orange-500 group-hover:bg-orange-600 transition">
        <p className="text-xs font-semibold text-white">{j.title}</p>
      </div>
    </Link>
  );
}

export default function JurnalPage() {
  const [params, setParams] = useSearchParams();
  const [items, setItems] = useState<Jurnal[]>([]);
  const [bidang, setBidang] = useState<{ name: string; count: number }[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(params.get('q') ?? '');
  const [selectedBidang, setSelectedBidang] = useState(params.get('bidang') ?? 'all');
  const [year, setYear] = useState(params.get('year') ?? 'Semua');

  useEffect(() => {
    Promise.all([getJurnalBidang(), getJurnalYears()]).then(([b, y]) => { setBidang(b); setYears(y); }).catch(() => {});
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getJurnalList({ q: search, bidang: selectedBidang, year, limit: 24 });
      setItems(res.items);
      setTotal(res.total);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [search, selectedBidang, year]);

  useEffect(() => { refresh(); }, [refresh]);

  return (
    <div>
      {/* Hero pink */}
      <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-orange-400 rounded-2xl p-8 md:p-10 mb-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-40 h-40 bg-yellow-300/30 rounded-full -mr-16 -mt-16" />
        <div className="relative z-10 max-w-2xl">
          <p className="text-white/95 text-base italic mb-1">"Dengan ilmu kita menuju kemuliaan."</p>
          <p className="text-white/80 text-xs">— Ki Hajar Dewantara</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-5">
        <div className="relative mb-3">
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari jurnal..." className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setSelectedBidang('all')} className={`px-3 py-1.5 text-xs rounded-full font-medium ${selectedBidang === 'all' ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-600'}`}>Semua Bidang</button>
          {bidang.map((b) => (
            <button key={b.name} onClick={() => setSelectedBidang(b.name)} className={`px-3 py-1.5 text-xs rounded-full font-medium flex items-center gap-1 ${selectedBidang === b.name ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-600'}`}>
              {b.name} <span className="text-[9px] opacity-70">({b.count})</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-3">
          <label className="text-xs text-slate-500 font-medium">Tahun:</label>
          <select value={year} onChange={(e) => setYear(e.target.value)} className="text-xs border border-slate-200 rounded-lg px-3 py-1.5">
            <option value="Semua">Semua Tahun</option>
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <span className="text-xs text-slate-500 ml-auto">{loading ? 'Memuat...' : `${total} jurnal`}</span>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[3/4] bg-slate-200 rounded-xl" />
              <div className="h-8 bg-slate-200 rounded mt-2" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <p className="text-4xl mb-3">📚</p>
          <p className="font-semibold text-slate-700 mb-1">Belum ada jurnal</p>
          <p className="text-sm text-slate-500">Coba ubah filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((j) => <JurnalCard key={j.id} j={j} />)}
        </div>
      )}
    </div>
  );
}