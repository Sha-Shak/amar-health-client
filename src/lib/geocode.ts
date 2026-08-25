// Free, no-API-key geocoding via OpenStreetMap's Nominatim — same "no API key"
// approach already used for the maps themselves (leaflet + OSM tiles). Only
// needed as a fallback: most bulk-imported hospitals have an address but no
// lat/lng, so the detail page's map would otherwise just never render.
async function search(query: string): Promise<{ lat: number; lng: number } | null> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`
  );
  if (!res.ok) return null;
  const results: { lat: string; lon: string }[] = await res.json();
  const first = results[0];
  if (!first) return null;
  return { lat: parseFloat(first.lat), lng: parseFloat(first.lon) };
}

// Real bulk-imported addresses are often too specific for a free-text geocoder
// to resolve exactly ("67, Charpara (Opposite of Medical College Hospital Main
// Gate), Mymensingh-2200" has no match) — but the broader area almost always
// does. Progressively drop the leading comma-separated segment (the most
// specific part) and retry, so the map still centers on the right city/area
// instead of just staying absent.
export async function geocodeAddress(query: string): Promise<{ lat: number; lng: number } | null> {
  const segments = query.split(",").map((s) => s.trim()).filter(Boolean);
  for (let i = 0; i < segments.length; i++) {
    const attempt = segments.slice(i).join(", ");
    const result = await search(attempt);
    if (result) return result;
  }
  return null;
}
