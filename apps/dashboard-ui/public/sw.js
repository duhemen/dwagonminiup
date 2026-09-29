// ============================================================
// DwagonMiniUp Service Worker — PWA + Push Notification
// ============================================================

const SW_VERSION = 'v2.0.0';
const STATIC_CACHE = `dwagon-static-${SW_VERSION}`;
const RUNTIME_CACHE = `dwagon-runtime-${SW_VERSION}`;
const API_CACHE = `dwagon-api-${SW_VERSION}`;

// Asset yang di-cache saat install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icon-192.png',
  '/icon-512.png',
];

// API yang TIDAK boleh di-cache (selalu network)
const API_NO_CACHE = [
  '/api/auth/',
  '/api/geo/',
  '/api/push/',
  '/api/edge-registry/',
];

// ============ INSTALL ============
self.addEventListener('install', (event) => {
  console.log(`[sw] Installing ${SW_VERSION}`);
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[sw] Precache partial fail:', err);
      });
    })
  );
  self.skipWaiting();
});

// ============ ACTIVATE ============
self.addEventListener('activate', (event) => {
  console.log(`[sw] Activating ${SW_VERSION}`);
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => !key.endsWith(SW_VERSION))
          .map((key) => {
            console.log('[sw] Deleting old cache:', key);
            return caches.delete(key);
          })
      )
    )
  );
  self.clients.claim();
});

// ============ FETCH STRATEGY ============
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET
  if (request.method !== 'GET') return;

  // Skip cross-origin
  if (url.origin !== self.location.origin) return;

  // Skip websocket
  if (url.pathname.startsWith('/socket.io')) return;

  // Skip API yang no-cache
  if (API_NO_CACHE.some((path) => url.pathname.startsWith(path))) {
    event.respondWith(fetch(request));
    return;
  }

  // API → Network first, fallback cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(API_CACHE).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Static assets → Cache first
  if (/\.(js|css|png|jpg|jpeg|gif|svg|woff2?|ttf|eot|webp|ico)$/.test(url.pathname)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          const clone = response.clone();
          caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
          return response;
        });
      })
    );
    return;
  }

  // HTML / navigation → Network first, fallback cache, fallback offline
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match('/index.html')))
    );
    return;
  }

  // Default: network
  event.respondWith(
    fetch(request)
      .then((response) => {
        const clone = response.clone();
        caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, clone));
        return response;
      })
      .catch(() => caches.match(request))
  );
});

// ============ PUSH NOTIFICATION ============
self.addEventListener('push', (event) => {
  console.log('[sw] Push received');
  let payload = {
    title: 'DwagonMiniUp',
    body: 'Ada notifikasi baru',
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    url: '/notifications',
    tag: 'dwagon',
    data: {},
  };

  try {
    if (event.data) {
      const data = event.data.json();
      payload = { ...payload, ...data };
    }
  } catch (e) {
    console.warn('[sw] Parse error:', e);
  }

  const options = {
    body: payload.body,
    icon: payload.icon,
    badge: payload.badge,
    tag: payload.tag,
    data: { url: payload.url, ...payload.data },
    vibrate: [200, 100, 200],
    requireInteraction: false,
    silent: false,
    actions: [
      { action: 'open', title: 'Buka' },
      { action: 'close', title: 'Tutup' },
    ],
  };

  event.waitUntil(self.registration.showNotification(payload.title, options));
});

// ============ NOTIFICATION CLICK ============
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'close') return;

  const url = event.notification.data?.url || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});

// ============ BACKGROUND SYNC ============
self.addEventListener('sync', (event) => {
  console.log('[sw] Background sync:', event.tag);
  if (event.tag === 'sync-usulan') {
    event.waitUntil(notifyClients('dwagon:bg-sync', { tag: event.tag }));
  }
});

// ============ PERIODIC SYNC (Chrome only) ============
self.addEventListener('periodicsync', (event) => {
  console.log('[sw] Periodic sync:', event.tag);
  if (event.tag === 'fetch-notifications') {
    event.waitUntil(notifyClients('dwagon:periodic-sync', { tag: event.tag }));
  }
});

// ============ MESSAGE FROM CLIENT ============
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
  if (event.data?.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(RUNTIME_CACHE).then((cache) => cache.addAll(event.data.urls))
    );
  }
});

async function notifyClients(type, data) {
  const clients = await self.clients.matchAll({ includeUncontrolled: true });
  clients.forEach((client) => client.postMessage({ type, data }));
}