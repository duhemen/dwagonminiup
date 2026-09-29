import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getJurnalDetail, Jurnal } from '../../../api/jurnal';

export default function JurnalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<Jurnal | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getJurnalDetail(id).then(setData).catch(() => navigate('/klop/jurnal')).finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return <div className="text-center py-16"><div className="inline-block w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" /></div>;
  if (!data) return null;

  return (
    <div className="max-w-5xl mx-auto">
      <button onClick={() => navigate('/klop/jurnal')} className="text-sm text-slate-500 hover:text-orange-500 mb-4">← Kembali ke Jurnal</button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cover */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <div className="aspect-[3/4] rounded-2xl shadow-xl flex flex-col items-center justify-center p-6 text-white" style={{ backgroundColor: data.coverColor }}>
              <p className="text-[10px] uppercase tracking-widest opacity-80 mb-2">JURNAL</p>
              <p className="text-2xl font-serif font-bold text-center leading-tight mb-4">{data.title.replace('Jurnal ', '')}</p>
              <div className="w-16 h-px bg-white/60 mb-3" />
              <p className="text-xs opacity-90">{data.volume} {data.edition}</p>
              <p className="text-xs opacity-70 mt-1">{data.year}</p>
            </div>
            <div className="mt-4 bg-white rounded-xl border border-slate-200 p-4 text-xs space-y-2">
              <div className="flex justify-between"><span className="text-slate-500">ISSN</span><span className="font-mono">{data.issn ?? '-'}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">E-ISSN</span><span className="font-mono">{data.eissn ?? '-'}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Frekuensi</span><span>{data.frequency ?? '-'}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Views</span><span>{data.views.toLocaleString('id-ID')}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Downloads</span><span>{data.downloads.toLocaleString('id-ID')}</span></div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-2">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">{data.title}</h1>
          <p className="text-sm text-slate-500 mb-4">{data.publisher}</p>
          <p className="text-sm text-slate-700 mb-6 leading-relaxed">{data.description}</p>

          <h2 className="font-semibold text-slate-800 mb-3">Artikel ({data.articles?.length ?? 0})</h2>
          <div className="space-y-3">
            {data.articles?.map((a, i) => (
              <div key={a.id} className="bg-white rounded-xl border border-slate-200 p-4 hover:border-orange-300 transition">
                <p className="text-[10px] text-orange-500 font-medium mb-1">Artikel #{i + 1} · hal. {a.pages}</p>
                <h3 className="font-semibold text-sm text-slate-800 mb-2">{a.title}</h3>
                <p className="text-[11px] text-slate-500 mb-2">{a.authors.join(', ')}</p>
                <p className="text-xs text-slate-600 line-clamp-3 mb-3">{a.abstract}</p>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {a.keywords.map((k) => <span key={k} className="text-[9px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">#{k}</span>)}
                </div>
                <div className="flex items-center gap-3 text-[10px] text-slate-500 pt-2 border-t border-slate-100">
                  <span>👁️ {a.views}</span>
                  <span>📥 {a.downloads}</span>
                  {a.doi && <span className="font-mono truncate ml-auto">DOI: {a.doi}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}