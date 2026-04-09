const VERSION = "9";
const CACHE_NAME = `autolink-cache-v${VERSION}`;

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME));
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => k !== CACHE_NAME ? caches.delete(k) : Promise.resolve()));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  event.respondWith((async () => {
    try {
      return await fetch(req, { cache: "no-store" });
    } catch (e) {
      const cached = await caches.match(req);
      return cached || new Response("", { status: 504 });
    }
  })());
});
