import { useCallback, useEffect, useState } from 'react';
import TopBar from '../../components/TopBar';
import { getPendingApprovals, getApprovalHistory, getApprovalStats, UsulanApproval, ApprovalStats, STAGE_LABELS } from '../../api/approval';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import ApprovalCard from './ApprovalCard';
import ApprovalModal from './ApprovalModal';

type TabKey = 'pending' | 'history';

export default function Approval() {
  const { user } = useAuth();
  const { connected } = useNotifications();
  const [tab, setTab] = useState<TabKey>('pending');
  const [pending, setPending] = useState<UsulanApproval[]>([]);
  const [history, setHistory] = useState<UsulanApproval[]>([]);
  const [stats, setStats] = useState<ApprovalStats | null>(null);
  const [selected, setSelected] = useState<UsulanApproval | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const [p, h, s] = await Promise.all([getPendingApprovals(), getApprovalHistory(), getApprovalStats()]);
      setPending(p); setHistory(h); setStats(s); setError(null);
    } catch (e: any) {
      setError(e?.response?.data?.error ?? e?.message ?? 'Gagal memuat data');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  // Auto-refresh ketika ada notifikasi WebSocket
  useEffect(() => {
    const socket = (window as any).__dwagon_socket;
    // Cara simpel: pakai event listener dari NotificationContext yang bikin toast,
    // tapi kita juga bisa refresh list
    const handler = () => refresh();
    window.addEventListener('dwagon:usulan-changed', handler);
    return () => window.removeEventListener('dwagon:usulan-changed', handler);
  }, [refresh]);

  const myStage = user?.role ?? '';
  const stageLabel = STAGE_LABELS[myStage] ?? 'Approver';

  if (!user || !['pimpinan', 'upt', 'kepegawaian', 'admin'].includes(user.role)) {
    return (
      <div className="min-h-screen bg-slate-50">
        <TopBar title="Persetujuan" variant="blue" />
        <div className="max-w-3xl mx-auto px-6 py-12 text-center">
          <p className="text-4xl mb-4">🔒</p>
          <h1 className="text-xl font-bold text-slate-800 mb-2">Akses Terbatas</h1>
          <p className="text-sm text-slate-500">Halaman ini hanya untuk role Pimpinan, Admin UPT, dan Kepegawaian.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <TopBar title="Persetujuan Usulan" variant="blue" />
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Persetujuan Usulan Pelatihan</h1>
            <p className="text-sm text-slate-500 mt-1">
              Anda login sebagai <span className="font-semibold text-slate-700">{stageLabel}</span>
              {connected && <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">🟢 Live</span>}
            </p>
          </div>
          <button onClick={refresh} className="text-xs bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Refresh</button>
        </div>

        {stats && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-xs text-slate-500">Menunggu</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-xs text-slate-500">Disetujui</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.approved}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-xs text-slate-500">Ditolak</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{stats.rejected}</p>
            </div>
          </div>
        )}

        <div className="flex gap-2 border-b border-slate-200 mb-4">
          {[
            { key: 'pending', label: `Menunggu (${pending.length})` },
            { key: 'history', label: `Riwayat (${history.length})` },
          ].map((t) => (
            <button key={t.key} onClick={() => setTab(t.key as TabKey)}
              className={`px-4 py-2 text-sm font-medium -mb-px border-b-2 transition ${
                tab === t.key ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}>{t.label}</button>
          ))}
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">{error}</div>}

        {loading ? (
          <div className="text-center py-12 text-slate-500 text-sm">Loading...</div>
        ) : (
          <>
            {tab === 'pending' && (
              pending.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                  <p className="text-4xl mb-3">🎉</p>
                  <p className="font-semibold text-slate-700">Tidak ada usulan menunggu</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pending.map((u) => <ApprovalCard key={u.id} usulan={u} myStage={myStage} onClick={() => setSelected(u)} />)}
                </div>
              )
            )}
            {tab === 'history' && (
              history.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                  <p className="text-sm text-slate-500">Belum ada riwayat approval.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {history.map((u) => <ApprovalCard key={u.id} usulan={u} myStage={myStage} onClick={() => setSelected(u)} />)}
                </div>
              )
            )}
          </>
        )}
      </div>
      <ApprovalModal usulan={selected} myStage={myStage} onClose={() => setSelected(null)} onDone={refresh} />
    </div>
  );
}