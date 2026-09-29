import { useEffect, useState, useRef } from 'react';
import { getTTEList, createTTE, TTEDocument } from '../../api/kinerja-ext';

const STATUS_STYLES: Record<string, string> = {
  'Signed': 'bg-green-500 text-white',
  'Unsigned': 'bg-slate-100 text-slate-700',
  'Failed': 'bg-red-100 text-red-700',
};

export default function TTE() {
  const [items, setItems] = useState<TTEDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'single' | 'bulk'>('single');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [tab, setTab] = useState<'form' | 'riwayat'>('form');
  const fileRef = useRef<HTMLInputElement>(null);

  const load = () => {
    setLoading(true);
    getTTEList().then(setItems).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFileName(f.name);
      setFileSize(`${(f.size / 1024).toFixed(1)} KB`);
    }
  };

  const handleSubmit = async () => {
    if (!fileName) { alert('Pilih file PDF dulu'); return; }
    if (passphrase.length < 4) { alert('Passphrase minimal 4 karakter'); return; }
    setSubmitting(true);
    try {
      await createTTE({ fileName, fileSize, mode, passphrase });
      setFileName(''); setFileSize(''); setPassphrase('');
      if (fileRef.current) fileRef.current.value = '';
      await load();
      setTab('riwayat');
    } catch (e: any) {
      alert(e?.response?.data?.error ?? 'Gagal');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="bg-blue-900 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-bold text-lg">✍️ Tanda Tangan Elektronik</h1>
            <p className="text-xs text-blue-200 mt-0.5">Tanda tangani dokumen SKP dengan BSrE</p>
          </div>
          <div className="flex bg-blue-800 rounded-lg p-0.5">
            <button onClick={() => setTab('form')} className={`text-xs px-3 py-1.5 rounded font-medium ${tab === 'form' ? 'bg-white text-blue-900' : 'text-blue-200'}`}>Form TTE</button>
            <button onClick={() => setTab('riwayat')} className={`text-xs px-3 py-1.5 rounded font-medium ${tab === 'riwayat' ? 'bg-white text-blue-900' : 'text-blue-200'}`}>Riwayat</button>
          </div>
        </div>

        {tab === 'form' ? (
          <div className="p-6">
            {/* Panduan banner */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
              <p className="text-xs text-amber-800">
                <strong>Petunjuk:</strong> Upload dokumen (bisa lebih dari satu jika mode Banyak Dokumen). Maksimal ukuran 1 MB. Jika terlalu besar, kompres dulu.
              </p>
            </div>

            {/* Mode selector */}
            <div className="flex gap-4 mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" checked={mode === 'single'} onChange={() => setMode('single')} className="text-blue-900" />
                <span className="text-sm font-medium text-slate-700">Satu Dokumen</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" checked={mode === 'bulk'} onChange={() => setMode('bulk')} className="text-blue-900" />
                <span className="text-sm font-medium text-slate-700">Banyak Dokumen</span>
              </label>
            </div>

            {/* Upload zone */}
            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center bg-slate-50 hover:border-blue-400 transition cursor-pointer mb-4"
              onClick={() => fileRef.current?.click()}>
              <input ref={fileRef} type="file" accept=".pdf" onChange={handleFile} className="hidden" multiple={mode === 'bulk'} />
              <div className="text-4xl mb-3 opacity-40">☁️</div>
              <p className="text-sm font-medium text-slate-700 mb-1">Tarik & Lepas file PDF di sini</p>
              <p className="text-xs text-slate-500">Atau klik untuk memilih file dari perangkat</p>
              {fileName && (
                <div className="mt-3 inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg">
                  <span className="text-xs font-medium">📄 {fileName}</span>
                  <span className="text-[10px] opacity-70">({fileSize})</span>
                </div>
              )}
            </div>

            {/* Passphrase */}
            <div className="mb-4">
              <label className="text-xs font-medium text-slate-700 mb-1 block">Passphrase TTE</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} value={passphrase} onChange={(e) => setPassphrase(e.target.value)}
                  placeholder="Masukkan passphrase BSrE Anda"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button onClick={handleSubmit} disabled={submitting || !fileName}
              className="w-full bg-blue-900 hover:bg-blue-800 disabled:bg-slate-300 text-white font-medium py-3 rounded-lg transition flex items-center justify-center gap-2">
              <span>✍️</span>
              {submitting ? 'Memproses...' : 'Tambahkan TTE'}
            </button>
          </div>
        ) : (
          <div className="p-6">
            {loading ? (
              <div className="text-center py-8 text-slate-500">Memuat...</div>
            ) : items.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-4xl mb-3 opacity-30">📝</p>
                <p className="text-slate-500">Belum ada dokumen TTE</p>
              </div>
            ) : (
              <div className="space-y-2">
                {items.map((d) => (
                  <div key={d.id} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-800">📄 {d.fileName}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{d.fileSize} · {d.mode === 'bulk' ? 'Banyak Dokumen' : 'Satu Dokumen'}</p>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${STATUS_STYLES[d.status]}`}>{d.status.toUpperCase()}</span>
                    </div>
                    {d.certificate && (
                      <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 pt-2 border-t border-slate-100">
                        <div><span className="block">Certificate</span><span className="font-mono text-slate-700">{d.certificate}</span></div>
                        <div><span className="block">Signed At</span><span className="font-medium text-slate-700">{d.signedAt ? new Date(d.signedAt).toLocaleString('id-ID') : '-'}</span></div>
                      </div>
                    )}
                    {d.docHash && (
                      <p className="text-[9px] font-mono text-slate-400 mt-1 truncate">SHA-256: {d.docHash}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}