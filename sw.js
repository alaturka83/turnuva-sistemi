// Turnuva Merkezi — servis çalışanı: sayfa çevrimdışıyken de açılabilsin diye son sürümü saklar.
// Veriler Firebase'den canlı gelir; burada yalnızca uygulama kabuğu tutulur.
const ONBELLEK = 'turnuva-v1';
const KABUK = ['./', './index.html', './icon-192.png', './icon-512.png', './favicon.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(ONBELLEK).then(c => c.addAll(KABUK)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== ONBELLEK).map(x => caches.delete(x)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  // Önce ağ: her zaman en güncel sürüm; bağlantı yoksa saklanan sürüm
  e.respondWith(fetch(r).then(y => {
    if (y.ok) { const k = y.clone(); caches.open(ONBELLEK).then(c => c.put(r, k)); }
    return y;
  }).catch(() => caches.match(r).then(x => x || (r.mode === 'navigate' ? caches.match('./index.html') : undefined))));
});
