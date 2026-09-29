import { api } from './client';

export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function getVapidPublicKey(): Promise<string> {
  const { data } = await api.get<{ publicKey: string }>('/push/vapid-key');
  return data.publicKey;
}

export async function subscribeToPush(): Promise<{ ok: boolean }> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    throw new Error('Browser tidak support Web Push');
  }

  // 1. Register service worker
  const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
  await navigator.serviceWorker.ready;

  // 2. Cek permission
  let permission = Notification.permission;
  if (permission === 'default') {
    permission = await Notification.requestPermission();
  }
  if (permission !== 'granted') {
    throw new Error('Izin notifikasi ditolak');
  }

  // 3. Subscribe push
  const vapidKey = await getVapidPublicKey();
  const existingSub = await reg.pushManager.getSubscription();

  if (existingSub) {
    // Kirim ulang ke server (sync)
    await api.post('/push/subscribe', {
      endpoint: existingSub.endpoint,
      keys: existingSub.toJSON().keys,
      userAgent: navigator.userAgent,
    });
    return { ok: true };
  }

  const subscription = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidKey),
  });

  // 4. Kirim subscription ke server
  await api.post('/push/subscribe', {
    endpoint: subscription.endpoint,
    keys: subscription.toJSON().keys,
    userAgent: navigator.userAgent,
  });

  return { ok: true };
}

export async function unsubscribeFromPush(): Promise<{ ok: boolean }> {
  if (!('serviceWorker' in navigator)) return { ok: true };
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  if (sub) {
    await api.post('/push/unsubscribe', { endpoint: sub.endpoint }).catch(() => {});
    await sub.unsubscribe();
  }
  return { ok: true };
}

export async function getPushStatus(): Promise<{ subscribed: boolean; count: number }> {
  const { data } = await api.get('/push/status');
  return data;
}

export async function sendTestPush(): Promise<{ ok: boolean }> {
  const { data } = await api.post('/push/test').catch(() => ({ data: { ok: false } }));
  return data;
}