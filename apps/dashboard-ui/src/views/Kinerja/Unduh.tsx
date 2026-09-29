import { useEffect, useState } from 'react';
import { getDownloadDocs, downloadFile, DownloadDoc } from '../../api/kinerja-ext';

const CATS = ['Semua', 'Panduan', 'Form', 'Peraturan'];

export default function Unduh() {
  const [items, setItems] = useState<DownloadDoc[]>([]);
  const [cat, setCat] = useState('Semua');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getDownloadDocs(cat).then(setItems).catch(() => {}).finally(() => setLoading(false));
  }, [cat]);

  const handleDownload = async (id: string, title: string, fileName: string) => {
    await downloadFile(id);
    alert(`📥 Download: ${title}\nFile: ${fileName}\n\n(simulasi)`);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="bg-blue-900 text-white rounded-t-2xl px-6 py-4">
        <h1 className="font-bold text-lg text-center">📥 Unduh Dokumen</h1>
      </div>
      <div className="bg-white rounded-b-2xl border border-slate-200 border-t-0 overflow-hidden">
        <div className="p-4 flex flex-wrap gap-2 border-b border-slate-100">
          {CATS.map((c) => (
            <button key={c} onClick={() => setCat(c)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg ${
                cat === c ? 'bg-blue-900 text-white' : 'bg-slate-100 text-slate-600'
              }`}>{c}</button>
          ))}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-3 py-3 text-left w-12">No</th>
                <th className="px-3 py-3 text-left">Judul Dokumen</th>
                <th className="px-3 py-3 text-center w-16">Tahun</th>
                <th className="px-3 py-3 text-center w-24">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="py-8 text-center text-slate-400">Memuat...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={4} className="py-12 text-center text-slate-400">Belum ada dokumen</td></tr>
              ) : (
                items.map((d, i) => (
                  <tr key={d.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="px-3 py-3 text-slate-500">{i + 1}</td>
                    <td className="px-3 py-3">
                      <p className="text-sm text-slate-800">{d.title}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{d.category} · {d.fileSize} · {d.downloads} kali diunduh</p>
                    </td>
                    <td className="px-3 py-3 text-center">{d.year ?? '-'}</td>
                    <td className="px-3 py-3 text-center">
                      <button onClick={() => handleDownload(d.id, d.title, d.fileName)}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded text-[10px] font-medium">
                        ⬇️
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}