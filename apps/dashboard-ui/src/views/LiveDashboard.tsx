import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { getSocket } from '../api/socket';

interface MetricPoint {
  timestamp: number;
  wsConnections: number;
  syncQueueDepth: number;
  resultQueueDepth: number;
  syncJobsCompleted: number;
  syncJobsFailed: number;
  usulanTotal: number;
  latencyByRegion: Record<string, number>;
  edgeOnline: number;
}

const MAX_POINTS = 60;

const REGION_META: Record<string, { flag: string; label: string; color: string }> = {
  'sumatera':   { flag: '🌴', label: 'Sumatera',   color: '#f59e0b' },
  'jawa':       { flag: '🏙️', label: 'Jawa',       color: '#64748b' },
  'kalimantan': { flag: '🌳', label: 'Kalimantan', color: '#10b981' },
  'bali-nusra': { flag: '🏖️', label: 'Bali-Nusra', color: '#f43f5e' },
  'sulawesi':   { flag: '🦋', label: 'Sulawesi',   color: '#d946ef' },
  'maluku':     { flag: '🐚', label: 'Maluku',     color: '#3b82f6' },
  'papua':      { flag: '🐦', label: 'Papua',      color: '#06b6d4' },
};

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function StatCard({ label, value, color, subtitle }: { label: string; value: string | number; color: string; subtitle?: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <p className="text-[10px] text-slate-500 uppercase tracking-wide">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
      {subtitle && <p className="text-[10px] text-slate-400 mt-1">{subtitle}</p>}
    </div>
  );
}

export default function LiveDashboard() {
  const navigate = useNavigate();
  const [points, setPoints] = useState<MetricPoint[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) {
      // belum login? atau belum connect
      navigate('/');
      return;
    }

    const onSnapshot = (data: MetricPoint[]) => setPoints(data ?? []);
    const onUpdate = (m: MetricPoint) => {
      setPoints((prev) => {
        const next = [...prev, m];
        return next.length > MAX_POINTS ? next.slice(-MAX_POINTS) : next;
      });
    };
    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    socket.on('metrics:snapshot', onSnapshot);
    socket.on('metrics:update', onUpdate);
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    setConnected(socket.connected);

    return () => {
      socket.off('metrics:snapshot', onSnapshot);
      socket.off('metrics:update', onUpdate);
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, [navigate]);

  const latest = points[points.length - 1];
  const prev = points[points.length - 2];
  const deltaJobs = latest && prev ? latest.syncJobsCompleted - prev.syncJobsCompleted : 0;
  const deltaUsulan = latest && prev ? latest.usulanTotal - prev.usulanTotal : 0;

  // Data untuk line chart (jobs over time)
  const lineData = points.map((p) => ({
    time: formatTime(p.timestamp),
    jobsCompleted: p.syncJobsCompleted,
    jobsFailed: p.syncJobsFailed,
    ws: p.wsConnections,
    queue: p.syncQueueDepth + p.resultQueueDepth,
  }));

  // Bar chart latency per region (dari point terakhir)
  const latencyData = latest
    ? Object.entries(latest.latencyByRegion).map(([region, latency]) => ({
        region: REGION_META[region]?.label ?? region,
        flag: REGION_META[region]?.flag ?? '📍',
        latency,
        fill: REGION_META[region]?.color ?? '#64748b',
      }))
    : [];

  return (
    <div className="min-h-screen bg-slate-50">
      <TopBar title="Live Dashboard" variant="blue" />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <button onClick={() => navigate('/')} className="text-sm text-slate-500 hover:text-blue-600 mb-4">← Kembali</button>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              Live Metrics Dashboard
              <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${
                connected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                {connected ? 'LIVE' : 'DISCONNECTED'}
              </span>
            </h1>
            <p className="text-sm text-slate-500 mt-1">Real-time metrics via WebSocket · update tiap 2 detik</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-slate-400 uppercase tracking-wide">Data Points</p>
            <p className="text-xl font-bold text-slate-700">{points.length}</p>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <StatCard label="WS Connections" value={latest?.wsConnections ?? 0} color="text-blue-600" subtitle="active users" />
          <StatCard label="Jobs / tick" value={`+${deltaJobs}`} color="text-green-600" subtitle="2s window" />
          <StatCard label="Queue Depth" value={(latest?.syncQueueDepth ?? 0) + (latest?.resultQueueDepth ?? 0)} color="text-yellow-600" subtitle="pending jobs" />
          <StatCard label="Edge Online" value={`${latest?.edgeOnline ?? 0}/7`} color="text-purple-600" subtitle="regions" />
          <StatCard label="Usulan Baru" value={`+${deltaUsulan}`} color="text-rose-600" subtitle="since last tick" />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          {/* Chart 1: Jobs over time */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h3 className="font-semibold text-slate-800 mb-3 text-sm">📈 Sync Jobs (Cumulative)</h3>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={lineData}>
                <defs>
                  <linearGradient id="colorJobs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="colorFailed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="jobsCompleted" name="Completed" stroke="#10b981" fill="url(#colorJobs)" />
                <Area type="monotone" dataKey="jobsFailed" name="Failed" stroke="#ef4444" fill="url(#colorFailed)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Chart 2: Latency per region */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h3 className="font-semibold text-slate-800 mb-3 text-sm">⚡ Latency per Region (ms)</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={latencyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="region" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} label={{ value: 'ms', angle: -90, position: 'insideLeft', style: { fontSize: 10 } }} />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Bar dataKey="latency" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                  {latencyData.map((entry, idx) => (
                    <Bar key={idx} dataKey="latency" fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Chart 3: WS + Queue */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h3 className="font-semibold text-slate-800 mb-3 text-sm">🔗 WS Connections & Queue Depth</h3>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="ws" name="WS Conn" stroke="#3b82f6" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="queue" name="Queue" stroke="#f59e0b" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Chart 4: Edge status */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h3 className="font-semibold text-slate-800 mb-3 text-sm">🌐 Region Latency (current)</h3>
            <div className="space-y-2">
              {latencyData.map((r) => (
                <div key={r.region} className="flex items-center gap-3">
                  <span className="text-lg w-6">{r.flag}</span>
                  <span className="text-xs font-medium text-slate-700 w-24">{r.region}</span>
                  <div className="flex-1 bg-slate-100 rounded-full h-4 relative overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((r.latency / 50) * 100, 100)}%`, backgroundColor: r.fill }}
                    />
                  </div>
                  <span className="text-xs font-mono font-bold w-12 text-right" style={{ color: r.fill }}>
                    {r.latency}ms
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h3 className="font-semibold text-blue-900 mb-2 text-sm">📊 Cara Kerja Live Metrics</h3>
          <ol className="text-xs text-blue-800 space-y-1 list-decimal list-inside">
            <li>Server collect metrics setiap <strong>2 detik</strong> (background job)</li>
            <li>Metrics disimpan di <strong>ring buffer</strong> (max 60 titik = 2 menit history)</li>
            <li>Broadcast via WebSocket event <code className="bg-blue-100 px-1 rounded">metrics:update</code></li>
            <li>Frontend subscribe dan update chart <strong>secara real-time</strong></li>
            <li>Buka di banyak tab → semua sinkron otomatis</li>
          </ol>
        </div>
      </div>
    </div>
  );
}