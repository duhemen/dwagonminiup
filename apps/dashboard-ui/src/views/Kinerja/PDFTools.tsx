import { useState } from 'react';

export default function PDFTools() {
  const [tab, setTab] = useState<'merge' | 'compress'>('merge');
  const [files, setFiles] = useState<File[]>([]);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = Array.from(e.target.files ?? []);
    setFiles((prev) => [...prev, ...f]);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="flex border-b border-slate-200">
          <button onClick={() => setTab('merge')}
            className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition ${
              tab === 'merge' ? 'bg-green-100 text-green-800 border-b-2 border-green-500' : 'text-slate-500 hover:bg-slate-50'
            }`}>
            <span>🔗</span> GABUNG PDF
          </button>
          <button onClick={() => setTab('compress')}
            className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition ${
              tab === 'compress' ? 'bg-green-100 text-green-800 border-b-2 border-green-500' : 'text-slate-500 hover:bg-slate-50'
            }`}>
            <span>📉</span> KOMPRES PDF
          </button>
        </div>

        <div className="p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-2">
            {tab === 'merge' ? 'Gabung Beberapa File PDF' : 'Kompres File PDF'}
          </h2>
          <p className="text-xs text-slate-500 mb-5">
            {tab === 'merge'
              ? 'Pilih file sesuai urutan yang diinginkan untuk digabungkan menjadi satu dokumen.'
              : 'Perkecil ukuran file PDF dengan mengurangi kualitas gambar.'}
          </p>

          {/* Upload */}
          <label className="flex items-center gap-3 mb-4 cursor-pointer">
            <div className="bg-blue-900 hover:bg-blue-800 text-white text-xs px-4 py-2.5 rounded-lg font-medium flex items-center gap-2">
              <span>☁️</span> PILIH FILES
            </div>
            <span className="text-xs text-slate-500 flex-1">
              {files.length === 0 ? 'Upload file-file PDF' : `${files.length} file dipilih`}
            </span>
            <input type="file" accept=".pdf" multiple onChange={handleFiles} className="hidden" />
          </label>

          {/* File list */}
          {files.length > 0 && (
            <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 mb-4">
              {files.map((f, i) => (
                <div key={i} className="p-3 flex items-center gap-3">
                  <span className="w-6 h-6 rounded bg-slate-100 text-slate-600 flex items-center justify-center text-[10px] font-bold">{i + 1}</span>
                  <span className="flex-1 text-xs text-slate-700 truncate">📄 {f.name}</span>
                  <span className="text-[10px] text-slate-500">{(f.size / 1024).toFixed(1)} KB</span>
                  <button onClick={() => setFiles(files.filter((_, idx) => idx !== i))}
                    className="text-red-500 hover:text-red-700 text-xs">✕</button>
                </div>
              ))}
            </div>
          )}

          <button disabled={files.length === 0}
            onClick={() => alert(tab === 'merge' ? `🔗 ${files.length} file akan digabung (simulasi)` : `📉 ${files.length} file akan dikompres (simulasi)`)}
            className="w-full bg-blue-900 hover:bg-blue-800 disabled:bg-slate-300 text-white py-3 rounded-lg font-medium text-sm transition">
            {tab === 'merge' ? 'Gabungkan Sekarang' : 'Kompres Sekarang'}
          </button>
        </div>
      </div>
    </div>
  );
}