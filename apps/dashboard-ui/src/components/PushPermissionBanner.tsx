import { useState } from 'react';
import { usePushNotifications } from '../hooks/usePushNotifications';

export default function PushPermissionBanner() {
  const { status, subscribed, error, subscribe, unsubscribe } = usePushNotifications();
  const [dismissed, setDismissed] = useState(localStorage.getItem('dwagon_push_dismissed') === 'true');
  const [loading, setLoading] = useState(false);

  if (status === 'unsupported' || dismissed) return null;
  if (status === 'granted' && subscribed) return null;

  async function handleEnable() {
    setLoading(true);
    try { await subscribe(); } finally { setLoading(false); }
  }

  function handleDismiss() {
    setDismissed(true);
    localStorage.setItem('dwagon_push_dismissed', 'true');
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-4 mb-4 flex items-start gap-3">
      <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl flex-shrink-0">
        🔔
      </div>
      <div className="flex-1">
        <p className="font-semibold text-slate-800 text-sm">Aktifkan Notifikasi Push</p>
        <p className="text-xs text-slate-600 mt-0.5">
          Dapatkan notifikasi langsung di perangkat Anda — bahkan saat browser ditutup.
        </p>
        {error && <p className="text-xs text-red-600 mt-1">⚠️ {error}</p>}
        <div className="flex gap-2 mt-3">
          <button onClick={handleEnable} disabled={loading}
            className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg disabled:opacity-50">
            {loading ? 'Mengaktifkan...' : 'Aktifkan Sekarang'}
          </button>
          <button onClick={handleDismiss}
            className="text-xs bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-1.5 rounded-lg">
            Nanti Saja
          </button>
        </div>
      </div>
    </div>
  );
}