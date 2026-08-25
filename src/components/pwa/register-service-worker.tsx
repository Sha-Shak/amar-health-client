"use client";

import { useEffect } from "react";

export function RegisterServiceWorker() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Installability is a nice-to-have, not a hard requirement — a failed
      // registration (e.g. unsupported browser quirk) shouldn't break the app.
    });
  }, []);

  return null;
}
