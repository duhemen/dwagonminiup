import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { connectSocket, disconnectSocket } from '../api/socket';
import { useAuth } from './AuthContext';
import {
  getNotifications, getUnreadCount, markRead as apiMarkRead,
  markAllRead as apiMarkAllRead, clearNotifications as apiClear,
  NotificationRecord,
} from '../api/notifications';

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  detail?: string;
  timestamp: string;
  read: boolean;
  data?: any;
}

interface NotificationContextType {
  notifications: Notification[];
  unread: number;
  connected: boolean;
  markAllRead: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  clear: () => Promise<void>;
  refresh: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

function fromRecord(r: NotificationRecord): Notification {
  return {
    id: r.id,
    type: r.type,
    title: r.title,
    message: r.message,
    detail: r.detail ?? undefined,
    timestamp: r.createdAt,
    read: r.read,
    data: r.dataJson ? JSON.parse(r.dataJson) : undefined,
  };
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, token } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [connected, setConnected] = useState(false);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const list = await getNotifications(80);
      setNotifications(list.map(fromRecord));
    } catch { /* ignore */ }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      disconnectSocket();
      setConnected(false);
      setNotifications([]);
      return;
    }

    refresh();

    const s = connectSocket();
    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    // Live event: server kirim notif baru via WS
    const onNewNotif = (data: any) => {
      setNotifications((prev) => {
        if (prev.find((n) => n.id === data.id)) return prev;
        return [{
          id: data.id,
          type: data.type,
          title: data.title,
          message: data.message,
          detail: data.detail,
          timestamp: data.timestamp,
          read: false,
          data: data.data,
        }, ...prev].slice(0, 100);
      });
    };

    // Fallback: refresh dari DB saat ada event (untuk sinkron)
    const onUsulanCreated = () => setTimeout(refresh, 800);
    const onApproved = () => setTimeout(refresh, 800);
    const onRejected = () => setTimeout(refresh, 800);
    const onCompleted = () => setTimeout(refresh, 800);

    s.on('connect', onConnect);
    s.on('disconnect', onDisconnect);
    s.on('notification:new', onNewNotif);
    s.on('usulan:created', onUsulanCreated);
    s.on('usulan:approved', onApproved);
    s.on('usulan:rejected', onRejected);
    s.on('usulan:completed', onCompleted);

    if (s.connected) setConnected(true);

    return () => {
      s.off('connect', onConnect);
      s.off('disconnect', onDisconnect);
      s.off('notification:new', onNewNotif);
      s.off('usulan:created', onUsulanCreated);
      s.off('usulan:approved', onApproved);
      s.off('usulan:rejected', onRejected);
      s.off('usulan:completed', onCompleted);
    };
  }, [isAuthenticated, token, refresh]);

  const markAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try { await apiMarkAllRead(); } catch { /* ignore */ }
  };

  const markRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    try { await apiMarkRead(id); } catch { /* ignore */ }
  };

  const clear = async () => {
    setNotifications([]);
    try { await apiClear(); } catch { /* ignore */ }
  };

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider value={{ notifications, unread, connected, markAllRead, markRead, clear, refresh }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}