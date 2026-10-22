/* FocusGrove service worker.
 * The build step (vite.config.js) replaces the two placeholders below with the
 * hashed asset list and a content version. In dev the fallbacks are used.
 */
const BUILD_URLS = self.__PRECACHE_URLS__
const CACHE = 'focusgrove-__CACHE_VERSION__'
// Relative to this worker's URL, so the app works under any base path (e.g. /erdo/ on GitHub Pages).
const STATIC = ['./manifest.json', './icons/icon.svg', './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png']
const PRECACHE = [...(Array.isArray(BUILD_URLS) ? BUILD_URLS : ['./']), ...STATIC]
const SHELL = new URL('./', self.location).href

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)))
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('focusgrove-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return

  // App navigations: try the network, fall back to the cached shell when offline.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone()
          caches.open(CACHE).then((c) => c.put(SHELL, copy))
          return res
        })
        .catch(() => caches.match(SHELL)),
    )
    return
  }

  // Everything else: cache first (assets are content-hashed), then network.
  event.respondWith(
    caches.match(request).then(
      (hit) =>
        hit ||
        fetch(request).then((res) => {
          if (res.ok) {
            const copy = res.clone()
            caches.open(CACHE).then((c) => c.put(request, copy))
          }
          return res
        }),
    ),
  )
})
