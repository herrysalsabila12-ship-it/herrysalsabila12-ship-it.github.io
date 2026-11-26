/* ArtKu Studio — service worker: simpan rangka aplikasi agar cepat dibuka & tetap tampil tanpa internet.
   Gambar AI selalu diambil segar dari internet dan tidak disimpan di cache. */
var CACHE = 'artku-v1';
var RANGKA = ['./', './index.html', './manifest.webmanifest', './icon.svg'];

self.addEventListener('install', function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(RANGKA); }).then(function(){ return self.skipWaiting(); }));
});
self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.map(function(k){ return k === CACHE ? null : caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});
self.addEventListener('fetch', function(e){
  var url = new URL(e.request.url);
  if(url.hostname.indexOf('pollinations.ai') !== -1) return; // gambar AI: selalu dari jaringan
  e.respondWith(
    caches.match(e.request).then(function(ada){
      if(ada) return ada;
      return fetch(e.request).then(function(res){
        var salin = res.clone();
        caches.open(CACHE).then(function(c){ c.put(e.request, salin); });
        return res;
      }).catch(function(){ return caches.match('./index.html'); });
    })
  );
});
