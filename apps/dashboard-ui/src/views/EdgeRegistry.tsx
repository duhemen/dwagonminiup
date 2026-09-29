import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import { getEdgeRegistry, EdgeNode } from '../api/edge-registry';

const REGION_META: Record<string, { flag: string; label: string }> = {
  'sumatera':   { flag: '🌴', label: 'Sumatera' },
  'jawa':       { flag: '🏙️', label: 'Jawa' },
  'kalimantan': { flag: '🌳', label: 'Kalimantan' },
  'bali-nusra': { flag: '🏖️', label: 'Bali-Nusra' },
  'sulawesi':   { flag: '🦋', label: 'Sulawesi' },
  'maluku':     { flag: '🐚', label: 'Maluku' },
  'papua':      { flag: '🐦', label: 'Papua' },
};

export default function EdgeRegistry() {
  const navigate = useNavigate();
  const [edges, setEdges] = useState<EdgeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  async function load() {
    try {
      setError(null);
      const data = await getEdgeRegistry();
      setEdges(data);
    } catch (e: any) {
      setError(e?.response?.data?.error ?? e?.message ?? 'Gagal memuat registry');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    if (!autoRefresh) return;
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, [autoRefresh]);

  const onlineCount = edges.filter((e) => e.isOnline).length;
  const totalJobs = edges.reduce((a, b) => a + b.totalSyncJobs, 0);
  const totalFailed = edges.reduce((a, b) => a + b.totalSyncFailed, 0);

  return (
    <div className="min-h-screen bg-slate-50">
      <TopBar title="Edge Registry" variant="blue" />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <button onClick={() => navigate('/')} className="text-sm text-slate-500 hover:text-blue-600 mb-4">
          ← Kembali ke Dashboard
        </button>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Edge Node Registry</h1>
            <p className="text-sm text-slate-500 mt-1">
              Daftar edge node + public key + fingerprint (Ed25519)
            </p>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
              <input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} className="rounded" />
              Auto 5s
            </label>
            <button onClick={load} className="text-xs bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-6 text-sm">{error}</div>
        )}

        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-[10px] text-slate-500 uppercase tracking-wide">Online</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{onlineCount}<span className="text-sm text-slate-400">/{edges.length}</span></p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-[10px] text-slate-500 uppercase tracking-wide">Total Jobs Synced</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{totalJobs}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-[10px] text-slate-500 uppercase tracking-wide">Jobs Failed</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{totalFailed}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-[10px] text-slate-500 uppercase tracking-wide">Algorithm</p>
            <p className="text-sm font-bold text-purple-600 mt-2">Ed25519</p>
          </div>
        </div>

        {/* Registry Table */}
        {loading && edges.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm">Loading...</div>
        ) : edges.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <p className="text-4xl mb-3">🔑</p>
            <p className="font-semibold text-slate-700">Belum ada edge terdaftar</p>
            <p className="text-sm text-slate-500 mt-1">Edge akan auto-register saat startup.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-left text-[11px] text-slate-500 uppercase tracking-wide">
                  <th className="px-4 py-3">Region</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Fingerprint</th>
                  <th className="px-4 py-3">Endpoint</th>
                  <th className="px-4 py-3 text-right">Synced</th>
                  <th className="px-4 py-3 text-right">Failed</th>
                  <th className="px-4 py-3">Last Heartbeat</th>
                </tr>
              </thead>
              <tbody>
                {edges.map((e) => {
                  const meta = REGION_META[e.region];
                  return (
                    <tr key={e.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{meta?.flag}</span>
                          <span className="font-medium text-slate-800 capitalize">{e.region}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {e.isOnline ? (
                          <span className="inline-flex items-center gap-1 text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded border border-green-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            Online
                          </span>
                        ) : (
                          <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded border border-red-300">✕ Offline</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <code className="text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-1 rounded">
                          {e.fingerprint}
                        </code>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500 font-mono">{e.endpoint ?? '-'}</td>
                      <td className="px-4 py-3 text-right font-medium text-green-600">{e.totalSyncJobs}</td>
                      <td className="px-4 py-3 text-right font-medium text-red-600">{e.totalSyncFailed}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {new Date(e.lastHeartbeat).toLocaleTimeString('id-ID')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Info */}
        <div className="mt-6 bg-purple-50 border border-purple-200 rounded-xl p-4">
          <h3 className="font-semibold text-purple-900 mb-2 text-sm">🔐 Crypto Signing Ed25519</h3>
          <ol className="text-xs text-purple-800 space-y-1 list-decimal list-inside">
            <li>Setiap edge generate <strong>keypair Ed25519</strong> saat pertama kali startup (disimpan di <code className="bg-purple-100 px-1 rounded">.keys/edge-&lt;region&gt;.json</code>)</li>
            <li>Public key di-register ke Central via <code className="bg-purple-100 px-1 rounded">POST /api/edge-registry/register</code></li>
            <li>Setiap job sync yang dikirim edge ke BullMQ <strong>ditandatangani</strong> dengan private key</li>
            <li>Central worker <strong>verifikasi signature</strong> dengan public key edge sebelum tulis ke database</li>
            <li>Jika signature tidak valid → data <strong>ditolak</strong> + counter <code className="bg-purple-100 px-1 rounded">totalSyncFailed</code> naik</li>
          </ol>
          <p className="text-xs text-purple-700 mt-2">
            💡 <strong>Fingerprint</strong> = hash SHA-256 dari public key. Ini identitas unik tiap edge (seperti SSH fingerprint).
          </p>
        </div>
      </div>
    </div>
  );
}