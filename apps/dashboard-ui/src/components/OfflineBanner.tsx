import { usePWA } from '../hooks/usePWA';

export default function OfflineBanner() {
  const { isOnline } = usePWA();
  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-amber-500 text-white px-4 py-2 text-center text-sm font-medium shadow-lg">
      📡 Anda sedang offline — beberapa fitur mungkin tidak tersedia
    </div>
  );
}