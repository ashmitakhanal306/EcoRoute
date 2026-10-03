/**
 * EcoRoute Service Worker — PWA Offline & Caching Support
 * SIH 2026 · Clean & Green Technology
 */

const CACHE_NAME = 'ecoroute-pwa-v1';
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/shared/theme.css',
  '/shared/auth.js',
  '/shared/supabaseClient.js',
  '/shared/wasteKnowledge.js',
  '/assets/icons/icon-192.png',
  '/assets/icons/icon-512.png',
  '/assets/icons/icon.svg',
  '/citizen/',
  '/citizen/index.html',
  '/driver/',
  '/driver/index.html',
  '/admin/',
  '/admin/index.html'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[EcoRoute SW] Pre-caching offline shell');
      return cache.addAll(PRECACHE_ASSETS).catch(err => {
        console.warn('[EcoRoute SW] Pre-cache partial warning:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);

  // Avoid caching Supabase API or external telemetry POSTs
  if (req.method !== 'GET' || url.pathname.includes('/rest/v1') || url.pathname.includes('/auth/v1')) {
    return;
  }

  // Network-first strategy with cache fallback
  event.respondWith(
    fetch(req)
      .then(networkRes => {
        if (networkRes && networkRes.status === 200 && networkRes.type === 'basic') {
          const resClone = networkRes.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, resClone));
        }
        return networkRes;
      })
      .catch(() => {
        return caches.match(req).then(cachedRes => {
          if (cachedRes) return cachedRes;
          // Fallback to offline index for navigations
          if (req.mode === 'navigate') {
            return caches.match('/');
          }
        });
      })
  );
});
