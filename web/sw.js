const CACHE_NAME = 'r-challenge-v1';
const ASSETS = [
    './',
    './index.html',
    './404.html',
    './style.css',
    './js/app.js',
    './js/data.js',
    'https://fonts.googleapis.com/css2?family=Play:wght@400;700&display=swap'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => response || fetch(event.request))
    );
});
