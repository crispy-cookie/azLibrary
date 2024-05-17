const CACHE_NAME = 'my-cache';

const urlsToCache = [
  '/',
  'manifest.json',
  'sw.js',
  '/style.css'/*,
  '/logos/img.png'*/
];

const cacheResources = async () => {
  try {
    const cache = await caches.open(CACHE_NAME);
    for (const url of urlsToCache) {
      const response = await fetch(url);
      if (response.ok) {
        await cache.put(url, response);
        console.log(`${url} zum cache hinzugefügt`);
      } else {
        console.error(`${url} konnte nicht gecached werden`);
      }
    }
  } catch (error) {
    console.log('Fehler caching resources:', error);
  }
};

const fetchResource = async (event) => {
  try {
    const cachedResponse = await caches.match(event.request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const fetchResponse = await fetch(event.request);

    if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
      return fetchResponse;
    }

    const responseToCache = fetchResponse.clone();
    const cache = await caches.open(CACHE_NAME);
    await cache.put(event.request, responseToCache);

    return fetchResponse;
  } catch (error) {
    console.log('Fehler fetching resource:', error);
  }
};

self.addEventListener('install', async (event) => {
  console.log('Service worker installiert');
  event.waitUntil(cacheResources());
});

self.addEventListener('activate', (event) => {
  console.log('Service worker aktiviert');
});

self.addEventListener('fetch', async (event) => {
  event.respondWith(fetchResource(event));
});

