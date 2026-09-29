import { useEffect, useState } from 'react';
import { getSKPDocuments, downloadDocument, SKPDocument } from '../../api/kinerja-ext';

const CATS = ['Semua', 'Perencanaan', 'Pelaksanaan', 'Evaluasi'];

const CAT_ICONS: Record<string, string> = {
  'Perencanaan': '📋', 'Pelaksanaan': '⚡', 'Evaluasi': '📊',
};

export default function Cetak() {
  const [items, setItems] = useState<SKPDocument[]>([]);
  const [cat, setCat] = useState('Semua');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getSKPDocuments(cat).then(setItems).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, [cat]);

  const handleDownload = async (id: string, title: string) => {
    try {
      await downloadDocument(id);
      alert(`📥 Download: ${title}\n\nFile simulasi (PDF). Di production file asli akan di-stream.`);
    } catch { alert('Gagal download'); }
  };

  // Group by kategori
  const grouped = items.reduce((acc, d) => {
    if (!acc[d.kategori]) acc[d.kategori] = [];
    acc[d.kategori].push(d);
    return acc;
  }, {} as Record<string, SKPDocument[]>);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mb-4">
        <div className="bg-blue-900 text-white px-6 py-4">
          <h1 className="font-bold text-lg">🖨️ Cetak & Unggah Dokumen</h1>
          <p className="text-xs text-blue-200 mt-0.5">Download dokumen SKP dalam format PDF</p>
        </div>
        <div className="p-4 flex flex-wrap gap-2 border-b border-slate-100">
          {CATS.map((c) => (
            <button key={c} onClick={() => setCat(c)}
              className={`px-4 py-2 text-xs font-medium rounded-lg transition ${
                cat === c ? 'bg-blue-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}>
              {CAT_ICONS[c] ?? ''} {c}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500">Memuat...</div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <p className="text-4xl mb-3">📁</p>
          <p className="text-slate-500">Belum ada dokumen</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([kategori, docs]) => (
            <div key={kategori} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex items-center gap-2">
                <span className="text-lg">{CAT_ICONS[kategori]}</span>
                <h2 className="font-semibold text-slate-800 text-sm">{kategori}</h2>
                <span className="text-xs text-slate-500">({docs.length} dokumen)</span>
              </div>
              <div className="divide-y divide-slate-100">
                {docs.map((d) => (
                  <div key={d.id} className="p-4 flex items-center gap-3 hover:bg-slate-50">
                    <div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center font-bold flex-shrink-0">
                      PDF
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{d.title}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {d.fileName} · {d.fileSize} {d.subKategori && `· ${d.subKategori}`}
                      </p>
                    </div>
                    <button onClick={() => handleDownload(d.id, d.title)}
                      className="text-xs bg-blue-900 hover:bg-blue-800 text-white px-4 py-2 rounded-lg font-medium">
                      📥 Download
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}