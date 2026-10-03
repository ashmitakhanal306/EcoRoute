/**
 * EcoRoute Service Worker — PWA Offline & Caching Support
 * SIH 2026 · Clean & Green Technology
 *
 * Uses RELATIVE paths so it works at any subpath (GitHub Pages, Vercel, localhost).
 * The SW scope is set by the registration call in index.html using ./sw.js.
 */

const CACHE_NAME = 'ecoroute-pwa-v3';  // bumped: v1 had stale 404s, v2 had abs paths

// All paths are relative to the SW scope (the app root).
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './config.js',
  './shared/theme.css',
  './shared/auth.js',
  './shared/paths.js',
  './shared/supabaseClient.js',
  './shared/wasteKnowledge.js',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/icon.svg',
  './citizen/',
  './citizen/index.html',
  './driver/',
  './driver/index.html',
  './admin/',
  './admin/index.html',
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

  // Never intercept Supabase API calls or non-GET requests
  if (
    req.method !== 'GET' ||
    url.pathname.includes('/rest/v1') ||
    url.pathname.includes('/auth/v1') ||
    url.pathname.includes('/storage/v1') ||
    url.hostname.includes('supabase.co')
  ) {
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
          // Fallback to root shell for navigation requests
          if (req.mode === 'navigate') {
            return caches.match('./') || caches.match('./index.html');
          }
        });
      })
  );
});
