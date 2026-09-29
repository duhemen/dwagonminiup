import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNotifications } from '../contexts/NotificationContext';

const ICONS: Record<string, string> = {
  'usulan:created': '📬', 'usulan:approved': '✅', 'usulan:rejected': '❌',
  'usulan:completed': '🎉', 'info': 'ℹ️', 'notification:new': '🔔',
};

export default function NotificationBell() {
  const { notifications, unread, markAllRead, markRead, clear, connected } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-lg hover:bg-slate-100 transition"
        title={connected ? 'Live connected' : 'Reconnecting...'}>
        <span className="text-lg">🔔</span>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold px-1.5 min-w-[16px] h-4 rounded-full flex items-center justify-center">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
        <span className={`absolute bottom-1 right-1 w-2 h-2 rounded-full border border-white ${connected ? 'bg-green-500' : 'bg-red-400'}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <div>
              <p className="font-semibold text-sm text-slate-800">Notifikasi</p>
              <p className="text-[10px] text-slate-500">
                {connected ? '🟢 Live' : '🔴 Reconnecting'} · {notifications.length} tersimpan
              </p>
            </div>
            <div className="flex gap-2">
              {unread > 0 && <button onClick={markAllRead} className="text-[10px] text-blue-600 hover:underline">Tandai semua</button>}
              {notifications.length > 0 && <button onClick={clear} className="text-[10px] text-red-600 hover:underline">Hapus</button>}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <p className="text-3xl mb-2">🔕</p>
                <p className="text-xs">Belum ada notifikasi</p>
              </div>
            ) : (
              notifications.slice(0, 20).map((n) => (
                <button key={n.id} onClick={() => markRead(n.id)}
                  className={`w-full text-left px-4 py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50 ${!n.read ? 'bg-blue-50/50' : ''}`}>
                  <div className="flex gap-2">
                    <span className="text-lg flex-shrink-0">{ICONS[n.type] ?? 'ℹ️'}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-semibold text-slate-800">{n.title}</p>
                        {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />}
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5 break-words">{n.message}</p>
                      {n.detail && <p className="text-[10px] text-slate-400 mt-1">{n.detail}</p>}
                      <p className="text-[10px] text-slate-400 mt-1">{new Date(n.timestamp).toLocaleString('id-ID')}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          <Link to="/notifications" onClick={() => setOpen(false)}
            className="block text-center text-xs text-blue-600 hover:bg-blue-50 py-2.5 border-t border-slate-100 font-medium">
            Lihat semua notifikasi →
          </Link>
        </div>
      )}
    </div>
  );
}