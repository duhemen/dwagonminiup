import { useEffect, useState } from 'react';
import { useNotifications, Notification } from '../contexts/NotificationContext';

const COLORS: Record<string, string> = {
  'usulan:created': 'border-blue-300 bg-blue-50 text-blue-900',
  'usulan:approved': 'border-green-300 bg-green-50 text-green-900',
  'usulan:rejected': 'border-red-300 bg-red-50 text-red-900',
  'usulan:completed': 'border-emerald-300 bg-emerald-50 text-emerald-900',
  'info': 'border-slate-300 bg-slate-50 text-slate-900',
};

const ICONS: Record<string, string> = {
  'usulan:created': '📬',
  'usulan:approved': '✅',
  'usulan:rejected': '❌',
  'usulan:completed': '🎉',
  'info': 'ℹ️',
};

function ToastItem({ notif, onDismiss }: { notif: Notification; onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 6000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div className={`pointer-events-auto border-2 rounded-lg shadow-lg p-3 w-80 animate-slide-in ${COLORS[notif.type] ?? COLORS.info}`}>
      <div className="flex items-start gap-2">
        <span className="text-xl flex-shrink-0">{ICONS[notif.type]}</span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">{notif.title}</p>
          <p className="text-xs mt-0.5 break-words">{notif.message}</p>
          {notif.detail && <p className="text-[10px] opacity-75 mt-1">{notif.detail}</p>}
        </div>
        <button onClick={onDismiss} className="text-slate-400 hover:text-slate-700 text-lg leading-none flex-shrink-0">×</button>
      </div>
    </div>
  );
}

export default function ToastContainer() {
  const { notifications } = useNotifications();
  const [visible, setVisible] = useState<Notification[]>([]);
  const [seen, setSeen] = useState<Set<string>>(new Set());

  useEffect(() => {
    const newOnes = notifications.filter((n) => !seen.has(n.id));
    if (newOnes.length > 0) {
      setVisible((prev) => [...newOnes, ...prev].slice(0, 3));
      setSeen((prev) => {
        const next = new Set(prev);
        newOnes.forEach((n) => next.add(n.id));
        return next;
      });
    }
  }, [notifications, seen]);

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      {visible.map((n) => (
        <ToastItem key={n.id} notif={n} onDismiss={() => setVisible((v) => v.filter((x) => x.id !== n.id))} />
      ))}
      <style>{`
        @keyframes slide-in {
          from { transform: translateX(120%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in { animation: slide-in 0.3s ease-out; }
      `}</style>
    </div>
  );
}