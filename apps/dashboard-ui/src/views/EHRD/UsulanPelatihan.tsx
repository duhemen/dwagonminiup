import { useMemo, useState } from 'react';
import Modal from '../../components/Modal';
import { createUsulan, Pelatihan } from '../../api/ehrd';
import { getEdgeUsulanStatus, EdgeUsulanStatus } from '../../api/sync';

interface Props {
  kategoriFilter: '10' | '20' | '70';
  pelatihan: Pelatihan[];
  onCreated: () => void;
}

export default function UsulanPelatihan({ kategoriFilter, pelatihan, onCreated }: Props) {
  const [search, setSearch] = useState('');
  const [kategori, setKategori] = useState('Semua Kategori');
  const [selected, setSelected] = useState<Pelatihan | null>(null);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [syncModal, setSyncModal] = useState(false);
  const [edgeDoc, setEdgeDoc] = useState<EdgeUsulanStatus | null>(null);
  const [failoverInfo, setFailoverInfo] = useState<{ used: boolean; original?: string } | null>(null);

  const filtered = useMemo(() => {
    let list = pelatihan;
    if (kategoriFilter === '20') list = list.filter((p) => ['Coaching', 'Benchmarking'].includes(p.kategori));
    else if (kategoriFilter === '70') list = [];
    else list = list.filter((p) => ['Pelatihan Teknis', 'E-Learning', 'Blended Learning', 'Pelatihan di Kelas'].includes(p.kategori));

    return list.filter((p) => {
      const m1 = p.nama.toLowerCase().includes(search.toLowerCase());
      const m2 = kategori === 'Semua Kategori' || p.kategori === kategori;
      return m1 && m2;
    });
  }, [search, kategori, kategoriFilter, pelatihan]);

  const kategoriOptions = ['Semua Kategori', ...Array.from(new Set(pelatihan.map((p) => p.kategori)))];

  const handleSave = async () => {
    if (!selected) return;
    try {
      setSaving(true); setErrorMsg(null);
      const res = await createUsulan(selected.id, kategoriFilter);
      setSelected(null);
      setFailoverInfo({ used: !!res.usedFallback, original: res.originalRegion });
      setSyncModal(true);

      const edgeId = res.edgeId;
      const region = res.region;
      let attempt = 0;
      const poll = setInterval(async () => {
        attempt++;
        try {
          const doc = await getEdgeUsulanStatus(edgeId, region);
          setEdgeDoc(doc);
          if (doc.syncStatus === 'synced' || doc.syncStatus === 'failed' || attempt > 15) {
            clearInterval(poll); onCreated();
          }
        } catch {
          if (attempt > 15) clearInterval(poll);
        }
      }, 1000);
    } catch (e: any) {
      setErrorMsg(e?.response?.data?.error ?? e?.message ?? 'Gagal menyimpan usulan');
    } finally { setSaving(false); }
  };

  if (kategoriFilter === '70') {
    return (
      <div className="bg-white rounded-xl shadow border p-12 text-center">
        <div className="text-4xl mb-3">📋</div>
        <p className="text-slate-500">Tidak ada data pelatihan dan SIBANGKOM.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white rounded-xl shadow border p-4 mb-4">
        <div className="flex flex-wrap gap-3">
          <input type="text" placeholder="Cari pelatihan..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[240px] border border-slate-300 rounded-lg px-3 py-2 text-sm" />
          <select value={kategori} onChange={(e) => setKategori(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm">
            {kategoriOptions.map((o) => <option key={o}>{o}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow border divide-y">
        {filtered.length === 0 && <div className="p-8 text-center text-slate-500 text-sm">Tidak ada pelatihan yang cocok.</div>}
        {filtered.map((p) => (
          <div key={p.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
            <div className="flex-1">
              <p className="font-medium text-slate-800">{p.nama}</p>
              <p className="text-xs text-slate-500 mt-1">{p.kategori} · {p.jp} JP · {p.penyelenggara}</p>
            </div>
            <button onClick={() => setSelected(p)}
              className="px-4 py-1.5 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700">Pilih</button>
          </div>
        ))}
      </div>

      <Modal open={!!selected} onClose={() => setSelected(null)} title="Pilih Pelatihan Ini?">
        <p className="text-sm text-slate-600 mb-2">Anda akan memilih:</p>
        <p className="font-semibold text-slate-800 mb-4">{selected?.nama}</p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-xs text-blue-700">
          ℹ️ Usulan akan dikirim ke <strong>Edge Node regional Anda</strong> (dengan auto-failover ke edge terdekat jika down).
        </div>
        {errorMsg && <div className="bg-red-50 border border-red-200 text-red-700 rounded p-2 mb-3 text-xs">{errorMsg}</div>}
        <div className="flex gap-2 justify-end">
          <button onClick={() => setSelected(null)} disabled={saving}
            className="px-4 py-2 text-sm rounded-lg border border-slate-300 hover:bg-slate-100">Cancel</button>
          <button onClick={handleSave} disabled={saving}
            className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">
            {saving ? 'Mengirim...' : 'Ya, Simpan'}
          </button>
        </div>
      </Modal>

      <Modal open={syncModal} onClose={() => { setSyncModal(false); setEdgeDoc(null); setFailoverInfo(null); }} title="Sinkronisasi ke Pusat">
        <div className="py-4">
          {!edgeDoc ? (
            <div className="text-center py-6">
              <div className="inline-block w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3" />
              <p className="text-sm text-slate-600">Menghubungi edge node...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {failoverInfo?.used && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-3 text-xs">
                  ⚠️ <strong>Auto-failover:</strong> Edge <span className="font-mono">{failoverInfo.original}</span> tidak merespon, dialihkan ke edge <span className="font-mono">{edgeDoc.region}</span>
                </div>
              )}
              <div className="flex justify-between"><span className="text-sm text-slate-600">Edge ID</span>
                <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded">{edgeDoc.edgeId}</span></div>
              <div className="flex justify-between"><span className="text-sm text-slate-600">Region</span>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded capitalize">{edgeDoc.region}</span></div>
              <div className="flex justify-between"><span className="text-sm text-slate-600">Status Sync</span>
                {edgeDoc.syncStatus === 'pending' && (
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" /> Pending
                  </span>
                )}
                {edgeDoc.syncStatus === 'synced' && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">✓ Synced</span>}
                {edgeDoc.syncStatus === 'failed' && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">✕ Failed</span>}
              </div>
              {edgeDoc.centralId && (
                <div className="flex justify-between"><span className="text-sm text-slate-600">Central ID</span>
                  <span className="text-xs font-mono bg-green-100 text-green-700 px-2 py-1 rounded">{edgeDoc.centralId.substring(0, 12)}...</span></div>
              )}
              {edgeDoc.syncError && <div className="bg-red-50 border border-red-200 text-red-700 rounded p-2 text-xs">Error: {edgeDoc.syncError}</div>}
            </div>
          )}
        </div>
        <div className="flex justify-end mt-4 pt-4 border-t border-slate-100">
          <button onClick={() => { setSyncModal(false); setEdgeDoc(null); setFailoverInfo(null); }}
            className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700">Tutup</button>
        </div>
      </Modal>
    </div>
  );
}