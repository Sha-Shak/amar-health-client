#!/usr/bin/env node
// Fetches every static decorative photo the app uses (onboarding screens,
// Explore tiles) from Unsplash as .webp into public/images/, self-hosted
// rather than hotlinked (see photos.ts for why). This is the one place to
// edit to swap a photo or add a new one: change/add an entry's `id` (the
// images.unsplash.com photo id — from a photo's page URL, the trailing
// `-<id>` segment) and/or `out` path, then run:
//
//   node scripts/fetch-photos.mjs
//
// Then update src/config/photos.ts to point at the new `out` path if it
// changed. Doctor/hospital photos are NOT here — those are real per-record
// data from the directory API, fetched live, never self-hosted.
//
// Before adding an id: open its Unsplash page and confirm it says
// "Free to use under the Unsplash License" (not Unsplash+).

const PHOTOS = [
  { id: "photo-1528726164383-33c4a223b78c", out: "public/images/onboarding/family.webp" },
  { id: "photo-1551721434-8b94ddff0e6d", out: "public/images/onboarding/phone-in-hand.webp" },
  { id: "photo-1563213126-a4273aed2016", out: "public/images/onboarding/reminder.webp" },

  { id: "photo-1777805865927-a6ee4c4eacb1", out: "public/images/tiles/vault.webp" },
  { id: "photo-1655313719493-16ebe4906441", out: "public/images/tiles/find-care.webp" },
  { id: "photo-1628771065518-0d82f1938462", out: "public/images/tiles/medicine.webp" },
  { id: "photo-1659352787906-f809a3b9e86e", out: "public/images/tiles/family.webp" },
  { id: "photo-1764885517847-79d62138cc58", out: "public/images/tiles/hospitals.webp" },
  { id: "photo-1639772823849-6efbd173043c", out: "public/images/tiles/tests.webp" },
  { id: "photo-1685485276914-6cefc2417c05", out: "public/images/tiles/health-tracker.webp" },
  { id: "photo-1633161308552-97bbe9dad686", out: "public/images/tiles/blood-donation.webp" },
  { id: "photo-1708379555190-1bce8c5bf79e", out: "public/images/tiles/cycle-tracking.webp", width: 1000, quality: 65 },
];

const DEFAULT_WIDTH = 1400;
const DEFAULT_QUALITY = 75;

async function fetchOne({ id, out, width = DEFAULT_WIDTH, quality = DEFAULT_QUALITY }) {
  const url = `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=${quality}&fm=webp`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${id}: ${res.status} ${res.statusText}`);
  const bytes = new Uint8Array(await res.arrayBuffer());
  const { writeFile, mkdir } = await import("node:fs/promises");
  const { dirname } = await import("node:path");
  await mkdir(dirname(out), { recursive: true });
  await writeFile(out, bytes);
  console.log(`wrote ${out} (${(bytes.length / 1024).toFixed(0)}K)`);
}

for (const photo of PHOTOS) {
  await fetchOne(photo);
}
