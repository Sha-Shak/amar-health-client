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

self.addEventListener("push", (event) => {
  if (!event.data) return;
  let payload;
  try {
    payload = event.data.json();
  } catch {
    return;
  }
  const { title, body, url } = payload;
  event.waitUntil(
    self.registration.showNotification(title ?? "Amar Health", {
      body,
      icon: "/icons/icon-192.png",
      data: { url: url ?? "/notifications" },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? "/notifications";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(url) && "focus" in client) return client.focus();
      }
      if (clientList.length > 0 && "focus" in clientList[0]) {
        clientList[0].navigate(url);
        return clientList[0].focus();
      }
      return self.clients.openWindow(url);
    })
  );
});
