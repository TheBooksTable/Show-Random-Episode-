const CACHE_NAME = 'random-episode-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/index.tsx',
  '/App.tsx',
  '/types.ts',
  '/constants.ts',
  '/services/geminiService.ts',
  '/components/WaveBackground.tsx',
  '/components/EpisodeCard.tsx',
  '/components/LoadingSpinner.tsx',
  '/components/FavoritesSidebar.tsx',
  '/components/icons/ShuffleIcon.tsx',
  '/components/icons/ReRollIcon.tsx',
  '/components/icons/FavoriteStarIcon.tsx',
  '/components/icons/TrashIcon.tsx',
  '/components/icons/StarIcon.tsx',
  '/components/icons/ImdbIcon.tsx',
  'https://cdn.tailwindcss.com',
  'https://aistudiocdn.com/react@^19.1.1/',
  'https://aistudiocdn.com/react@^19.1.1',
  'https://aistudiocdn.com/react-dom@^19.1.1/'
];

// Install event: opens a cache and adds the app shell files to it.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event: serves requests from the cache first, falling back to the network.
// API requests to TVMaze are always fetched from the network.
self.addEventListener('fetch', event => {
    if (event.request.url.includes('api.tvmaze.com')) {
        event.respondWith(fetch(event.request));
        return;
    }

    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});

// Activate event: removes old caches to ensure the app stays up-to-date.
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
