    const staticAssets = [
        '/',
        '/index.html',
        '/offline.html',
        '/styles.css',
        '/static/js/bundle.js'
    ];

    const staticCache = 'news-static-cache';
    const apiCache = "news-api-cache";

self.addEventListener('install', function(event) {
        console.info('Cache SW - Installing service worker');
        event.waitUntil(
            caches.open(staticCache)
                .then(function (cache) {
                    console.info('Cache SW - Pre-caching static content');
                    return cache.addAll(staticAssets);
                })
            // .then(function(){
            //    self.skipWaiting();
            // })
        );
    });

self.addEventListener('activate', function(event) {
        console.log('Cache SW - Activating');

        const whitelist = [staticCache, apiCache];

        event.waitUntil(
            caches.keys().then(function (cacheNames) {
                return Promise.all(
                    cacheNames.map(function (cacheName) {
                        if (whitelist.indexOf(cacheName) === -1) {
                            console.log('Cache SW - Deleting old cache "' + cacheName + '');
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            // .then(function(val){
            //    return self.clients.claim()
            // })
        );
    });

// Cache first, then network
self.addEventListener('fetch', function(event) {
        event.respondWith(
            caches.match(event.request)
                .then(function (response) {
                    if (response) {
                        console.log('Cache SW - Found ', event.request.url, ' in cache');
                        return response;
                    }

                    console.warn('Cache SW - Cache miss, network request for ', event.request.url);

                    return fetch(event.request)
                        .then(function (response) {
                            if (response.status === 404) {
                                return caches.match('/offline.html');
                            }

                            return response
                        });
                })
                .catch(function (error) {
                    console.error('Cache SW - Error while fetching ', event.request.url);
                    return caches.match('/offline.html');
                })
        );
    });
