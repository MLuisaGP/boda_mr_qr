/**
 * Service Worker — Boda Michelle & René (PWA)
 * Caché inteligente de interfaz para experiencia tipo app nativa.
 * Nunca intercepta peticiones dinámicas de /api/* ni /uploads/*.
 */
const CACHE_NAME = 'boda-mr-pwa-v3';
const SHELL_ASSETS = [
  '/',
  '/camara',
  '/galeria',
  '/firmas',
  '/manifest.json',
  '/assets/css/app.css',
  '/assets/js/app.js',
  '/assets/img/hero-portrait.jpg',
  '/assets/img/hero-widescreen.jpg',
  '/assets/img/pwa-icon-192.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.allSettled(SHELL_ASSETS.map((url) => cache.add(url)));
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Nunca cachear API, admin ni subidas dinámicas
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/uploads/') || url.pathname.startsWith('/admin')) {
    return;
  }

  // Navegación HTML y CSS/JS: Network-first con respaldo en caché
  if (req.mode === 'navigate' || url.pathname.endsWith('.css') || url.pathname.endsWith('.js')) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res && res.status === 200) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          }
          return res;
        })
        .catch(() => caches.match(req).then((cached) => cached || caches.match('/')))
    );
    return;
  }

  // Imágenes estáticas: Cache-first con actualización en segundo plano
  event.respondWith(
    caches.match(req).then((cached) => {
      const networkFetch = fetch(req).then((res) => {
        if (res && res.status === 200) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
        }
        return res;
      }).catch(() => cached);
      return cached || networkFetch;
    })
  );
});
