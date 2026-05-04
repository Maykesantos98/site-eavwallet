const CACHE = "eav-wallet-v3";
const ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./script.js",
  "./lucide.min.js",
  "./manifest.json",
  "./favicon.svg",
  "./og-image.jpg",
  "./i18n.json",
  "./fonts/InterVariable.woff2",
  "./wallet/logo.png",
  "./wallet/eav-token.png",
  "./wallet/eav-trade.jpg",
  "./wallet/1.jpeg",
  "./wallet/2.jpeg",
  "./wallet/3.jpeg",
  "./wallet/5.jpeg",
  "./wallet/6.jpeg",
  "./wallet/8.jpeg",
  "./wallet/icons/apple.svg",
  "./wallet/icons/bitcoin.svg",
  "./wallet/icons/check-token.svg",
  "./wallet/icons/ethereum.svg",
  "./wallet/icons/google-play.svg",
  "./wallet/icons/pix.svg",
  "./wallet/icons/solana.svg",
  "./wallet/icons/visa.svg",
];

// Network-first for code/markup, cache-first for static assets.
const NETWORK_FIRST = /\.(html|css|js|json)$|\/$/i;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      cache.addAll(ASSETS).catch(() => Promise.resolve())
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Network-first for HTML/CSS/JS/JSON — ensures users always get latest code.
  if (NETWORK_FIRST.test(url.pathname)) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((cache) => cache.put(req, copy));
          }
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // Cache-first for images, fonts and other static assets.
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(req, copy));
        }
        return res;
      });
    })
  );
});
