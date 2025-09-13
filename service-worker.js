const CACHE_NAME = 'random-episode-cache-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  // Assuming these icon files exist at the root, as per manifest.json
  '/icon-192.png',
  '/icon-512.png',

  // Core scripts
  '/index.tsx',
  '/App.tsx',
  '/types.ts',
  '/constants.ts',
  '/services/geminiService.ts',
  
  // All components
  '/components/WaveBackground.tsx',
  '/components/EpisodeCard.tsx',
  '/components/LoadingSpinner.tsx',
  '/components/FavoritesSidebar.tsx',
  '/components/ConfirmationModal.tsx',
  '/components/Toast.tsx',

  // All icons
  '/components/icons/ShuffleIcon.tsx',
  '/components/icons/ReRollIcon.tsx',
  '/components/icons/FavoriteStarIcon.tsx',
  '/components/icons/TrashIcon.tsx',
  '/components/icons/StarIcon.tsx',
  '/components/icons/ImdbIcon.tsx',
  '/components/icons/CloseIcon.tsx',
];

// Install event: fires when the service worker is first installed.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache. Caching app shell.');
        // addAll() is atomic: if one file fails, the whole operation fails.
        // By removing external URLs, we reduce the chance of failure due to CORS.
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        // Force the waiting service worker to become the active service worker.
        return self.skipWaiting();
      })
  );
});

// Activate event: fires when the service worker becomes active.
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // Delete old caches.
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Take control of all clients (open pages) at once.
      console.log('Service worker claimed clients.');
      return self.clients.claim();
    })
  );
});

// Fetch event: fires for every network request.
self.addEventListener('fetch', event => {
    // Don't cache API requests to TVMaze. Always fetch from the network.
    if (event.request.url.includes('api.tvmaze.com')) {
        event.respondWith(fetch(event.request));
        return;
    }

    // For all other requests, use a "Cache first, then network" strategy.
    event.respondWith(
        caches.match(event.request).then(response => {
            // If we have a cached response, return it.
            // Otherwise, fetch from the network.
            return response || fetch(event.request);
        })
    );
});
