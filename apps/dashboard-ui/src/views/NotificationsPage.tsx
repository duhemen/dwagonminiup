import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import { useNotifications } from '../contexts/NotificationContext';
import { getActivity, ActivityRecord } from '../api/notifications';

const ICONS: Record<string, string> = {
  'usulan:created': '📬', 'usulan:approved': '✅', 'usulan:rejected': '❌',
  'usulan:completed': '🎉', 'info': 'ℹ️',
};

const ACTION_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  login: { label: 'Login', icon: '🔓', color: 'bg-blue-100 text-blue-700' },
  submit_usulan: { label: 'Submit Usulan', icon: '📤', color: 'bg-purple-100 text-purple-700' },
  approval_setujui: { label: 'Setujui Usulan', icon: '✅', color: 'bg-green-100 text-green-700' },
  approval_tolak: { label: 'Tolak Usulan', icon: '❌', color: 'bg-red-100 text-red-700' },
  change_password: { label: 'Ganti Password', icon: '🔑', color: 'bg-amber-100 text-amber-700' },
};

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { notifications, unread, markAllRead, markRead, clear, refresh } = useNotifications();
  const [tab, setTab] = useState<'notifs' | 'activity'>('notifs');
  const [activity, setActivity] = useState<ActivityRecord[]>([]);
  const [loadingAct, setLoadingAct] = useState(false);

  useEffect(() => { refresh(); }, [refresh]);

  useEffect(() => {
    if (tab === 'activity') {
      setLoadingAct(true);
      getActivity(100).then(setActivity).finally(() => setLoadingAct(false));
    }
  }, [tab]);

  return (
    <div className="min-h-screen bg-slate-50">
      <TopBar title="Notifikasi & Aktivitas" variant="blue" />
      <div className="max-w-5xl mx-auto px-6 py-8">
        <button onClick={() => navigate('/')} className="text-sm text-slate-500 hover:text-blue-600 mb-4">← Kembali ke Dashboard</button>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Notifikasi & Aktivitas</h1>
            <p className="text-sm text-slate-500 mt-1">Riwayat lengkap semua notifikasi dan aktivitas akun Anda</p>
          </div>
          <div className="flex gap-2">
            {unread > 0 && <button onClick={markAllRead} className="text-xs bg-white border border-slate-300 px-3 py-1.5 rounded-lg hover:bg-slate-50">Tandai semua</button>}
            {notifications.length > 0 && <button onClick={clear} className="text-xs bg-white border border-red-300 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50">Hapus semua</button>}
          </div>
        </div>

        <div className="flex gap-2 border-b border-slate-200 mb-4">
          {[
            { key: 'notifs', label: `Notifikasi (${notifications.length})${unread > 0 ? ` · ${unread} baru` : ''}` },
            { key: 'activity', label: `Aktivitas (${activity.length})` },
          ].map((t) => (
            <button key={t.key} onClick={() => setTab(t.key as any)}
              className={`px-4 py-2 text-sm font-medium -mb-px border-b-2 ${
                tab === t.key ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}>{t.label}</button>
          ))}
        </div>

        {tab === 'notifs' && (
          <div className="bg-white rounded-xl border border-slate-200 divide-y">
            {notifications.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <p className="text-4xl mb-3">🔕</p>
                <p className="text-sm">Belum ada notifikasi</p>
              </div>
            ) : (
              notifications.map((n) => (
                <button key={n.id} onClick={() => markRead(n.id)}
                  className={`w-full text-left p-4 hover:bg-slate-50 flex gap-3 ${!n.read ? 'bg-blue-50/40' : ''}`}>
                  <span className="text-2xl flex-shrink-0">{ICONS[n.type] ?? 'ℹ️'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-sm text-slate-800">{n.title}</p>
                      {!n.read && <span className="text-[10px] bg-blue-500 text-white px-2 py-0.5 rounded-full">BARU</span>}
                    </div>
                    <p className="text-sm text-slate-600 mt-1">{n.message}</p>
                    {n.detail && <p className="text-xs text-slate-400 mt-1">{n.detail}</p>}
                    <p className="text-xs text-slate-400 mt-2">{new Date(n.timestamp).toLocaleString('id-ID')}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        )}

        {tab === 'activity' && (
          <div className="bg-white rounded-xl border border-slate-200 divide-y">
            {loadingAct ? (
              <div className="p-8 text-center text-slate-500 text-sm">Loading...</div>
            ) : activity.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <p className="text-4xl mb-3">📋</p>
                <p className="text-sm">Belum ada aktivitas</p>
              </div>
            ) : (
              activity.map((a) => {
                const meta = ACTION_LABELS[a.action] ?? { label: a.action, icon: '•', color: 'bg-slate-100 text-slate-700' };
                return (
                  <div key={a.id} className="p-4 flex gap-3 items-start">
                    <span className="text-2xl flex-shrink-0">{meta.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${meta.color}`}>{meta.label}</span>
                        <span className="text-xs text-slate-400">{new Date(a.createdAt).toLocaleString('id-ID')}</span>
                      </div>
                      {a.metaJson && (
                        <p className="text-xs text-slate-500 mt-1 font-mono break-words">{a.metaJson}</p>
                      )}
                      {a.ip && <p className="text-[10px] text-slate-400 mt-1 font-mono">IP: {a.ip}</p>}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}