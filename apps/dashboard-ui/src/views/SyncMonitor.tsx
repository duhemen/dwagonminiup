import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import { getAllRegionStats, getQueueStats, QueueStats, QueueJob } from '../api/sync';

const JOB_STATE_COLOR: Record<string, string> = {
  completed: 'bg-green-100 text-green-700 border-green-300',
  active: 'bg-blue-100 text-blue-700 border-blue-300',
  waiting: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  failed: 'bg-red-100 text-red-700 border-red-300',
  delayed: 'bg-slate-100 text-slate-600 border-slate-300',
};

const REGION_META: Record<string, { flag: string; port: number; label: string; provinces: number }> = {
  'sumatera':   { flag: '🌴', port: 4001, label: 'Sumatera',   provinces: 10 },
  'jawa':       { flag: '🏙️', port: 4002, label: 'Jawa',       provinces: 6 },
  'kalimantan': { flag: '🌳', port: 4003, label: 'Kalimantan', provinces: 5 },
  'bali-nusra': { flag: '🏖️', port: 4004, label: 'Bali-Nusra', provinces: 3 },
  'sulawesi':   { flag: '🦋', port: 4005, label: 'Sulawesi',   provinces: 6 },
  'maluku':     { flag: '🐚', port: 4006, label: 'Maluku',     provinces: 2 },
  'papua':      { flag: '🐦', port: 4007, label: 'Papua',      provinces: 6 },
};

function CountCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white rounded border border-slate-200 py-1.5 px-1 text-center">
      <p className="text-[8px] text-slate-400 uppercase tracking-wider font-semibold">{label}</p>
      <p className={`text-sm font-bold ${color}`}>{value}</p>
    </div>
  );
}

function JobRow({ job }: { job: QueueJob }) {
  const stateClass = JOB_STATE_COLOR[job.state] ?? 'bg-slate-100 text-slate-600 border-slate-300';
  return (
    <div className="border-b border-slate-100 last:border-0 py-1.5 flex items-start justify-between gap-2">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className={`text-[9px] px-1.5 py-0.5 rounded border ${stateClass}`}>{job.state}</span>
          <span className="text-[9px] font-mono text-slate-400">#{job.id}</span>
        </div>
        <p className="text-[10px] text-slate-600 font-mono truncate mt-0.5">
          {job.data.edgeId ?? job.data.centralId ?? '-'}
        </p>
      </div>
    </div>
  );
}

export default function SyncMonitor() {
  const navigate = useNavigate();
  const [allRegions, setAllRegions] = useState<{ region: string; stats: QueueStats | null; error?: string }[]>([]);
  const [myRegion, setMyRegion] = useState<QueueStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setError(null);
      const [all, mine] = await Promise.all([getAllRegionStats(), getQueueStats()]);
      setAllRegions(all);
      setMyRegion(mine);
    } catch (e: any) {
      setError(e?.response?.data?.error ?? e?.message ?? 'Gagal memuat queue stats');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    if (!autoRefresh) return;
    const t = setInterval(load, 3000);
    return () => clearInterval(t);
  }, [autoRefresh]);

  const onlineCount = allRegions.filter((r) => r.stats).length;
  const totalJobs = allRegions.reduce((a, b) => a + (b.stats?.queues.sync.completed ?? 0), 0);

  return (
    <div className="min-h-screen bg-slate-50">
      <TopBar title="Sync Monitor" variant="blue" />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <button onClick={() => navigate('/')} className="text-sm text-slate-500 hover:text-blue-600 mb-4">
          ← Kembali ke Dashboard
        </button>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Sync Monitor — 7 Region Indonesia</h1>
            <p className="text-sm text-slate-500 mt-1">
              Monitoring real-time {onlineCount}/7 edge node online · {totalJobs} job tersinkron
            </p>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded"
              />
              Auto 3s
            </label>
            <button onClick={load} className="text-xs bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-6 text-sm">{error}</div>
        )}

        {/* Summary Bar */}
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-4 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wide">Region Online</p>
              <p className="text-2xl font-bold text-green-600">{onlineCount}<span className="text-sm text-slate-400">/7</span></p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wide">Total Jobs</p>
              <p className="text-2xl font-bold text-blue-600">{totalJobs}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wide">Total Provinsi</p>
              <p className="text-2xl font-bold text-purple-600">38</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wide">Central</p>
              <p className="text-sm font-bold text-slate-700 mt-1">Jakarta :4000</p>
            </div>
          </div>
        </div>

        {/* 7 Region Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
          {allRegions.map(({ region, stats, error }) => {
            const meta = REGION_META[region];
            const unreachable = !stats;

            return (
              <div key={region} className={`bg-white rounded-xl border-2 p-4 ${
                unreachable ? 'border-red-200 bg-red-50' : 'border-slate-200'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{meta?.flag}</span>
                    <div>
                      <p className="font-semibold text-slate-800 text-xs">{meta?.label ?? region}</p>
                      <p className="text-[9px] text-slate-400">{meta?.provinces ?? '?'} prov · :{meta?.port}</p>
                    </div>
                  </div>
                  {unreachable ? (
                    <span className="text-[9px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded border border-red-300">
                      ✕ Off
                    </span>
                  ) : (
                    <span className="text-[9px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded border border-green-300 flex items-center gap-0.5">
                      <span className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                      On
                    </span>
                  )}
                </div>

                {unreachable ? (
                  <p className="text-[10px] text-red-600 py-3 text-center">{error ?? 'Unreachable'}</p>
                ) : (
                  <>
                    <div className="grid grid-cols-5 gap-1 mb-2">
                      <CountCard label="W" value={stats!.queues.sync.waiting ?? 0} color="text-yellow-600" />
                      <CountCard label="A" value={stats!.queues.sync.active ?? 0} color="text-blue-600" />
                      <CountCard label="D" value={stats!.queues.sync.completed ?? 0} color="text-green-600" />
                      <CountCard label="F" value={stats!.queues.sync.failed ?? 0} color="text-red-600" />
                      <CountCard label="R" value={stats!.queues.result.completed ?? 0} color="text-emerald-600" />
                    </div>
                    {stats!.recentSync.length > 0 && (
                      <div className="max-h-24 overflow-y-auto border-t border-slate-100 pt-1">
                        {stats!.recentSync.slice(0, 2).map((j) => <JobRow key={j.id} job={j} />)}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* My Region Detail */}
        {myRegion && (
          <div className="bg-white rounded-xl border-2 border-blue-200 p-5 mb-6">
            <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2 text-sm">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              Region Aktif: <span className="capitalize text-blue-600">{myRegion.region}</span>
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500 mb-2">usulan-sync</p>
                <div className="grid grid-cols-5 gap-1">
                  <CountCard label="Wait" value={myRegion.queues.sync.waiting ?? 0} color="text-yellow-600" />
                  <CountCard label="Active" value={myRegion.queues.sync.active ?? 0} color="text-blue-600" />
                  <CountCard label="Done" value={myRegion.queues.sync.completed ?? 0} color="text-green-600" />
                  <CountCard label="Fail" value={myRegion.queues.sync.failed ?? 0} color="text-red-600" />
                  <CountCard label="Delay" value={myRegion.queues.sync.delayed ?? 0} color="text-slate-500" />
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-2">usulan-sync-result</p>
                <div className="grid grid-cols-5 gap-1">
                  <CountCard label="Wait" value={myRegion.queues.result.waiting ?? 0} color="text-yellow-600" />
                  <CountCard label="Active" value={myRegion.queues.result.active ?? 0} color="text-blue-600" />
                  <CountCard label="Done" value={myRegion.queues.result.completed ?? 0} color="text-green-600" />
                  <CountCard label="Fail" value={myRegion.queues.result.failed ?? 0} color="text-red-600" />
                  <CountCard label="Delay" value={myRegion.queues.result.delayed ?? 0} color="text-slate-500" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h3 className="font-semibold text-blue-900 mb-2 text-sm">🗺️ 7 Region Indonesia</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-blue-800 mb-3">
            {Object.entries(REGION_META).map(([k, v]) => (
              <div key={k} className="flex items-center gap-1.5">
                <span>{v.flag}</span>
                <span className="font-medium">{v.label}</span>
                <span className="text-blue-500">({v.provinces})</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-blue-700">
            💡 Klik dropdown di TopBar untuk switch region. Submit usulan → tercatat di edge region tersebut → sync ke Central Jakarta.
          </p>
        </div>
      </div>
    </div>
  );
}