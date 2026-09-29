import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getKomunitasDetail, CommunityWork } from '../../../api/komunitas';

const STATUS_STYLES: Record<string, string> = {
  'Draft': 'bg-slate-100 text-slate-600',
  'Menunggu Validasi': 'bg-amber-100 text-amber-700',
  'Published': 'bg-green-100 text-green-700',
  'Undangan': 'bg-purple-100 text-purple-700',
};

export default function KaryaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<CommunityWork | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getKomunitasDetail(id).then(setData).catch(() => navigate('/klop/komunitas')).finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return <div className="text-center py-16"><div className="inline-block w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" /></div>;
  if (!data) return null;

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={() => navigate('/klop/komunitas')} className="text-sm text-slate-500 hover:text-orange-500 mb-4">← Kembali ke Komunitas</button>

      <article className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 mb-4">
        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`text-[10px] px-2.5 py-1 rounded-md font-bold ${STATUS_STYLES[data.status] ?? 'bg-slate-100'}`}>{data.status}</span>
          <span className="text-[10px] bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md font-medium">{data.type}</span>
          {data.category && <span className="text-[10px] bg-orange-100 text-orange-700 px-2.5 py-1 rounded-md font-medium">{data.category}</span>}
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-3">{data.title}</h1>

        <div className="flex items-center gap-3 py-4 border-y border-slate-100 mb-6">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 text-white flex items-center justify-center font-bold">
            {(data.authorName ?? 'U').charAt(0)}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">{data.authorName ?? '-'}</p>
            <p className="text-[11px] text-slate-500">{data.authorUnit ?? '-'}</p>
          </div>
        </div>

        <p className="text-sm text-slate-700 leading-relaxed mb-6">{data.description}</p>

        {data.content && (
          <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap mb-6 border-t border-slate-100 pt-6">
            {data.content}
          </div>
        )}

        <div className="flex items-center gap-4 pt-4 border-t border-slate-100 text-sm">
          <span className="flex items-center gap-1.5 text-slate-500"><span>👍</span> {data.likes}</span>
          <span className="flex items-center gap-1.5 text-slate-500"><span>💬</span> {data.commentsCount} komentar</span>
          <span className="flex items-center gap-1.5 text-slate-500 ml-auto"><span>👁️</span> {data.views} views</span>
        </div>
      </article>
    </div>
  );
}