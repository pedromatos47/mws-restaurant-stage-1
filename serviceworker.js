var staticCacheName = 'mws-stage1-static-v1';
var contentImgsCache = 'mws-stage1-imgs';
var allCaches = [
  staticCacheName,
  contentImgsCache
];

this.addEventListener('install', event => {
  event.waitUntil(
    caches.open(staticCacheName).then(cache => (
      cache.addAll([
        '/',
        'js/main.js',
        'js/restaurant_info.js',
        'js/dbhelper.js',
        'data/restaurants.json',
        'css/styles.css',
        'css/responsiveness.css'
      ])
    ))
  );
});

this.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
          .then(cacheNames => (
            Promise.all(
              cacheNames.filter(cacheName => cacheName.startsWith('mws-stage1') && !allCaches.includes(cacheName))
                        .map(cacheName => caches.delete(cacheName))
              )
          ))
  );
})

this.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url);

  if (
    requestUrl.origin === location.origin &&
    requestUrl.pathname.startsWith('/img/')
  ) {
    event.respondWith(servePhoto(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
});

servePhoto = request => {
  var storageUrl = request.url.replace(/.jpg$/, '');

  return caches.open(contentImgsCache)
               .then(cache =>
                  cache.match(storageUrl)
                       .then(response => {
                         if (response) return response;

                         return fetch(request).then(networkResponse => {
                           cache.put(storageUrl, networkResponse.clone());
                           return networkResponse;
                         });
                       })
               )
}