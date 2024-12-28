self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open('beuone-v1').then(function(cache) {
      return cache.addAll([
        '/',
        '/notes',
        '/papers',
        '/studymode',
        '/voices',
        '/offline.html'
      ]);
    })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        return response || fetch(event.request);
      })
      .catch(function() {
        return caches.match('/offline.html');
      })
  );
}); 