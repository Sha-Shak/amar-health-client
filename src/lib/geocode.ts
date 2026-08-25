// Free, no-API-key geocoding via OpenStreetMap's Nominatim — same "no API key"
// approach already used for the maps themselves (leaflet + OSM tiles). Only
// needed as a fallback: most bulk-imported hospitals have an address but no
// lat/lng, so the detail page's map would otherwise just never render.
const SEARCH_TIMEOUT_MS = 3000;

async function search(query: string): Promise<{ lat: number; lng: number } | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SEARCH_TIMEOUT_MS);
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`,
      { signal: controller.signal }
    );
    if (!res.ok) return null;
    const results: { lat: string; lon: string }[] = await res.json();
    const first = results[0];
    if (!first) return null;
    return { lat: parseFloat(first.lat), lng: parseFloat(first.lon) };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

// Real bulk-imported addresses are often too specific for a free-text geocoder
// to resolve exactly ("67, Charpara (Opposite of Medical College Hospital Main
// Gate), Mymensingh-2200" has no match) — but the broader area almost always
// does. Trying every comma segment one at a time (5+ sequential round-trips
// for a noisy address) was the actual cause of the map feeling slow to load —
// each Nominatim round-trip is a few hundred ms, and they were fully
// sequential. This keeps the common case to 1-2 round-trips:
//   1. the full string (best case, exact match)
//   2. the last two comma segments — usually resolves it, since it's the
//      *specific* leading segments that are too noisy to match, not the
//      city/country tail ("Mymensingh-2200, Bangladesh" matched;
//      "67, Charpara (...), Mymensingh-2200, Bangladesh" did not)
//   3. last resort: just the final word (typically the city — chamber
//      addresses are often a single comma-less string like "Popular
//      Diagnostic Centre Ltd. Tangail", where step 2 is a no-op since
//      there's nothing to split), with ", Bangladesh" appended since
//      that's the one thing genuinely safe to assume app-wide here.
export async function geocodeAddress(query: string): Promise<{ lat: number; lng: number } | null> {
  const segments = query.split(",").map((s) => s.trim()).filter(Boolean);
  const words = segments.join(" ").split(/\s+/).filter(Boolean);
  const lastWord = words[words.length - 1];

  const attempts = new Set<string>([
    segments.join(", "),
    segments.slice(-2).join(", "),
    ...(lastWord ? [`${lastWord}, Bangladesh`] : []),
  ]);

  for (const attempt of attempts) {
    const result = await search(attempt);
    if (result) return result;
  }
  return null;
}
