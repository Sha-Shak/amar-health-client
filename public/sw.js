// Minimal service worker — exists mainly so the app meets Chrome's PWA
// installability criteria (an active SW with a fetch handler). Deliberately
// does NOT cache anything: this app's data changes constantly (records,
// reminders, chat), and a caching SW is exactly what causes the "my fix
// isn't showing up" stale-PWA problem. Every request just passes straight
// through to the network.
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", () => {
  // No-op: let the browser handle the request normally.
});
