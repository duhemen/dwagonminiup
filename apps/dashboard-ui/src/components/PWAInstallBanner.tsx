import { useState } from 'react';
import { usePWA } from '../hooks/usePWA';

export default function PWAInstallBanner() {
  const { installPrompt, isInstalled, isOnline, install } = usePWA();
  const [dismissed, setDismissed] = useState(localStorage.getItem('dwagon_pwa_dismissed') === 'true');
  const [loading, setLoading] = useState(false);

  if (isInstalled || dismissed || !installPrompt) return null;

  async function handleInstall() {
    setLoading(true);
    try {
      const ok = await install();
      if (!ok) setDismissed(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4 mb-4 flex items-start gap-3">
      <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center text-xl flex-shrink-0">
        📱
      </div>
      <div className="flex-1">
        <p className="font-semibold text-slate-800 text-sm">Install DwagonMiniUp</p>
        <p className="text-xs text-slate-600 mt-0.5">
          Pasang di perangkat Anda untuk akses cepat tanpa browser — seperti aplikasi native.
        </p>
        <div className="flex gap-2 mt-3">
          <button onClick={handleInstall} disabled={loading}
            className="text-xs bg-purple-600 hover:bg-purple-700 text-white px-4 py-1.5 rounded-lg disabled:opacity-50">
            {loading ? 'Memasang...' : '📲 Install Sekarang'}
          </button>
          <button onClick={() => { setDismissed(true); localStorage.setItem('dwagon_pwa_dismissed', 'true'); }}
            className="text-xs bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-1.5 rounded-lg">
            Nanti Saja
          </button>
        </div>
      </div>
    </div>
  );
}