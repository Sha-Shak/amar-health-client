"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

// Leaflet's default marker icons reference image files by relative path, which
// breaks under a bundler (webpack/turbopack rewrites asset URLs) — the standard
// fix is pointing the default icon at CDN-hosted copies of the same images.
const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export type MapMarker = { lat: number; lng: number; label: string };

export function LocationMap({
  markers,
  className,
}: {
  markers: MapMarker[];
  className?: string;
}) {
  if (markers.length === 0) return null;

  // A single marker gets a fixed, tight zoom — appropriate for "here's the
  // one address". Multiple markers can be spread across different cities
  // (a doctor's chambers, say), so a fixed center+zoom risked leaving some
  // pins off-screen entirely; `bounds` instead fits the viewport to whatever
  // box actually contains all of them.
  const single = markers.length === 1;
  const bounds: [[number, number], [number, number]] | undefined = single
    ? undefined
    : [
        [Math.min(...markers.map((m) => m.lat)), Math.min(...markers.map((m) => m.lng))],
        [Math.max(...markers.map((m) => m.lat)), Math.max(...markers.map((m) => m.lng))],
      ];

  return (
    <div className={className}>
      <MapContainer
        {...(single
          ? { center: [markers[0].lat, markers[0].lng] as [number, number], zoom: 15 }
          : { bounds, boundsOptions: { padding: [24, 24] } })}
        scrollWheelZoom={false}
        className="h-full w-full"
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        {markers.map((marker, i) => (
          <Marker key={i} position={[marker.lat, marker.lng]} icon={markerIcon}>
            <Popup>{marker.label}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
