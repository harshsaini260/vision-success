/* Vision Success Ledger: works offline once opened. */
const C = 'hearth-vsledger-9f1a1e33cf', SHELL = ["./","app.css","app.js","fonts/fraunces-italic.woff2","fonts/fraunces.woff2","icon-192.png","icon-512.png","icon-maskable-512.png","icon.svg","index.html","manifest.webmanifest","pip/cheer.webp","pip/courier.webp","pip/idle.webp","pip/think.webp","pip/wave.webp"]
self.addEventListener('install', e => { e.waitUntil(caches.open(C).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())) })
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('hearth-vsledger-') && k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim())) })
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return
  if (r.mode === 'navigate') { e.respondWith(fetch(r).then(res => { const copy = res.clone(); caches.open(C).then(c => c.put('index.html', copy)); return res }).catch(() => caches.match('index.html'))); return }
  e.respondWith(caches.match(r).then(hit => hit || fetch(r).then(res => { if (res.ok) { const copy = res.clone(); caches.open(C).then(c => c.put(r, copy)) } return res })))
})
