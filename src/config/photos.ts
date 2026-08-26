/**
 * Real photography, per the Design System doc (§2): warm, candid, naturally-lit
 * images — never illustration. Each entry was individually verified as
 * "Unsplash License" (free), not Unsplash+, via the photo's own license page,
 * then downloaded once as .webp into public/images/ — self-hosted rather
 * than hotlinked, so there's no extra DNS/TLS/fetch round-trip to Unsplash's
 * CDN on every load. Doctor/hospital photos are a different thing entirely
 * (real per-record data from the directory API/DB) and stay remote — this
 * file is only for the app's own static decorative photography. This is the
 * one file to edit to swap any of these for a different photo — download the
 * replacement as .webp into public/images/ and point the entry at it.
 */

export const photos = {
  onboarding: {
    // A real village in Bangladesh, not a generic stock family.
    family: "/images/onboarding/family.webp",
    phoneInHand: "/images/onboarding/phone-in-hand.webp",
    reminder: "/images/onboarding/reminder.webp",
  },
  tiles: {
    vault: "/images/tiles/vault.webp",
    findCare: "/images/tiles/find-care.webp",
    medicine: "/images/tiles/medicine.webp",
    family: "/images/tiles/family.webp",
    hospitals: "/images/tiles/hospitals.webp",
    tests: "/images/tiles/tests.webp",
    cycleTracking: "/images/tiles/cycle-tracking.webp",
    healthTracker: "/images/tiles/health-tracker.webp",
  },
};
