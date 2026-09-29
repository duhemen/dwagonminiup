import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import { getSystemHealth, SystemHealth as SH } from '../api/system';

export default function SystemHealth() {
  const navigate = useNavigate();
  const [data, setData] = useState<SH | null>(null);
  const [loading, setLoading] = useState(true);
  const [auto, setAuto] = useState(true);

  async function load() {
    try { setData(await getSystemHealth()); } catch { /* ignore */ }
    finally { setLoading(false); }
  }

  useEffect(() => {
    load();
    if (!auto) return;
    const t = setInterval(load, 4000);
    return () => clearInterval(t);
  }, [auto]);

  return (
    <div className="min-h-screen bg-slate-50">
      <TopBar title="System Health" variant="blue" />
      <div className="max-w-6xl mx-auto px-6 py-8">
        <button onClick={() => navigate('/')} className="text-sm text-slate-500 hover:text-blue-600 mb-4">← Kembali</button>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">System Health Monitor</h1>
            <p className="text-sm text-slate-500 mt-1">Monitoring real-time seluruh komponen sistem</p>
          </div>
          <div className="flex gap-3">
            <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
              <input type="checkbox" checked={auto} onChange={(e) => setAuto(e.target.checked)} className="rounded" />
              Auto 4s
            </label>
            <button onClick={load} className="text-xs bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Refresh</button>
          </div>
        </div>

        {loading && !data && <div className="text-center py-12 text-slate-500">Loading...</div>}

        {data && (
          <>
            {/* Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <p className="text-[10px] text-slate-500 uppercase tracking-wide">Central Server</p>
                <p className="text-xl font-bold text-green-600 mt-1 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Online
                </p>
                <p className="text-[10px] text-slate-400 mt-1">Uptime: {Math.floor(data.central.uptime)}s</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <p className="text-[10px] text-slate-500 uppercase tracking-wide">Database</p>
                <p className={`text-xl font-bold mt-1 ${data.database.ok ? 'text-green-600' : 'text-red-600'}`}>
                  {data.database.ok ? '✓ Healthy' : '✕ Down'}
                </p>
                <p className="text-[10px] text-slate-400 mt-1">{data.database.provider} · {data.database.latency}ms</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <p className="text-[10px] text-slate-500 uppercase tracking-wide">WebSocket</p>
                <p className="text-xl font-bold text-blue-600 mt-1">{data.websocket.connected}</p>
                <p className="text-[10px] text-slate-400 mt-1">koneksi aktif</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <p className="text-[10px] text-slate-500 uppercase tracking-wide">Edge Nodes</p>
                <p className={`text-xl font-bold mt-1 ${data.edges.online === data.edges.total ? 'text-green-600' : 'text-yellow-600'}`}>
                  {data.edges.online}/{data.edges.total}
                </p>
                <p className="text-[10px] text-slate-400 mt-1">online</p>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
              <h2 className="font-semibold text-slate-800 mb-4 text-sm">📊 Data Statistics</h2>
              <div className="grid grid-cols-5 gap-3 text-center">
                <div><p className="text-[10px] text-slate-500 uppercase">Users</p><p className="text-2xl font-bold text-slate-800">{data.stats.userCount}</p></div>
                <div><p className="text-[10px] text-slate-500 uppercase">Pelatihan</p><p className="text-2xl font-bold text-slate-800">{data.stats.pelatihanCount}</p></div>
                <div><p className="text-[10px] text-slate-500 uppercase">Usulan</p><p className="text-2xl font-bold text-slate-800">{data.stats.usulanCount}</p></div>
                <div><p className="text-[10px] text-slate-500 uppercase">Pending</p><p className="text-2xl font-bold text-yellow-600">{data.stats.pendingApprovals}</p></div>
                <div><p className="text-[10px] text-slate-500 uppercase">Edge Nodes</p><p className="text-2xl font-bold text-blue-600">{data.stats.edgeCount}</p></div>
              </div>
            </div>

            {/* Edge List */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
              <h2 className="font-semibold text-slate-800 mb-4 text-sm">🌐 Edge Nodes ({data.edges.online}/{data.edges.total})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {data.edges.list.map((e) => (
                  <div key={e.region} className={`rounded-lg border p-3 ${e.ok ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{e.flag}</span>
                        <div>
                          <p className="text-xs font-semibold text-slate-800">{e.label}</p>
                          <p className="text-[9px] text-slate-500">:{e.port}</p>
                        </div>
                      </div>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded ${e.ok ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                        {e.ok ? 'Online' : 'Offline'}
                      </span>
                    </div>
                    {e.ok && (
                      <>
                        <p className="text-[9px] font-mono text-slate-500 truncate">{e.fingerprint?.substring(0, 24)}...</p>
                        <p className="text-[9px] text-slate-500 mt-1">Latency: {e.latency}ms</p>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <p className="text-xs text-slate-400 text-center">
              Total query time: {data.totalLatencyMs}ms · Update: {new Date(data.timestamp).toLocaleTimeString('id-ID')}
            </p>
          </>
        )}
      </div>
    </div>
  );
}