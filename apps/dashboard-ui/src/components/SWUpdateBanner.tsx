import { usePWA } from '../hooks/usePWA';

export default function SWUpdateBanner() {
  const { swUpdate, applyUpdate } = usePWA();
  if (!swUpdate) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] bg-blue-600 text-white rounded-xl shadow-2xl p-4 max-w-sm flex items-start gap-3">
      <span className="text-2xl">🔄</span>
      <div className="flex-1">
        <p className="font-semibold text-sm">Update Tersedia</p>
        <p className="text-xs text-blue-100 mt-0.5">Versi baru DwagonMiniUp siap dipasang.</p>
        <button onClick={applyUpdate}
          className="mt-2 text-xs bg-white text-blue-600 px-3 py-1.5 rounded-lg font-medium hover:bg-blue-50">
          Muat Ulang Sekarang
        </button>
      </div>
    </div>
  );
}