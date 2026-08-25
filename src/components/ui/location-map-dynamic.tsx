"use client";

// Leaflet touches `window` at module-eval time — it can't be server-rendered,
// so this dynamic import with ssr:false is the actual usage point, not
// location-map.tsx itself.
import dynamic from "next/dynamic";

export const LocationMap = dynamic(
  () => import("./location-map").then((m) => m.LocationMap),
  {
    ssr: false,
    loading: () => <div className="h-full w-full animate-pulse bg-black/5" />,
  }
);
