import { useEffect, useState } from 'react';
import { subscribeToPush, unsubscribeFromPush, getPushStatus } from '../api/push';
import { useAuth } from '../contexts/AuthContext';

type Status = 'unsupported' | 'default' | 'granted' | 'denied' | 'loading';

export function usePushNotifications() {
  const { isAuthenticated } = useAuth();
  const [status, setStatus] = useState<Status>('loading');
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    async function init() {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        setStatus('unsupported');
        return;
      }

      const perm = Notification.permission;
      setStatus(perm as Status);

      if (perm === 'granted') {
        try {
          const s = await getPushStatus();
          setSubscribed(s.subscribed);
        } catch { /* ignore */ }
      }
    }
    init();
  }, [isAuthenticated]);

  async function subscribe() {
    try {
      setError(null);
      setStatus('loading');
      await subscribeToPush();
      setSubscribed(true);
      setStatus('granted');
    } catch (e: any) {
      setError(e?.message ?? 'Gagal subscribe');
      setStatus(Notification.permission as Status);
    }
  }

  async function unsubscribe() {
    try {
      setError(null);
      await unsubscribeFromPush();
      setSubscribed(false);
    } catch (e: any) {
      setError(e?.message ?? 'Gagal unsubscribe');
    }
  }

  async function requestPermission() {
    if (!('Notification' in window)) return;
    const p = await Notification.requestPermission();
    setStatus(p as Status);
    if (p === 'granted') await subscribe();
  }

  return { status, subscribed, error, subscribe, unsubscribe, requestPermission };
}