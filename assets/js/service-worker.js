const CACHE_NAME = "kuda-sebet-app-v11";
const APP_SHELL = [
  "./index.html",
  "./personal-builder.html",
  "./product.html",
  "./app.html",
  "./site.webmanifest",
  "./build/css/personal-builder.css",
  "./build/css/personal-builder-fixes.css",
  "./build/js/google-sheet-catalog.js",
  "./build/js/personal-builder.js",
  "./kuda-sebet-products.xlsx",
  "./kuda-podskazki.html",
  "./assets/css/site.css",
  "./assets/js/site.js",
  "./assets/js/home.js",
  "./assets/js/product.js",
  "./assets/css/webapp.css",
  "./assets/js/webapp.js",
  "./assets/icons/app-icon.svg",
  "./assets/icons/app-icon-192.png",
  "./assets/icons/app-icon-512.png",
  "./assets/img/cards/kuda_sebet_s-removebg-preview_square.png",
  "./assets/img/hero-girl.jpg",
  "./assets/img/stories/story-combo.webp",
  "./assets/img/stories/story-kyrgyz.webp",
  "./assets/img/stories/story-mar8.webp"
];
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith("kuda-sebet-app-") && key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    if (response.ok && response.type === "basic") {
      const copy = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
    }
    return response;
  }).catch(() => event.request.mode === "navigate" ? caches.match("./app.html") : Response.error())));
});
