/**
 * Real photography, per the Design System doc (§2): warm, candid, naturally-lit
 * images — never illustration. Each entry was individually verified as
 * "Unsplash License" (free), not Unsplash+, via the photo's own license page.
 * This is the one file to edit to swap any of these for a different photo —
 * nothing else changes.
 */

function unsplash(id: string) {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&q=80`;
}

export const photos = {
  onboarding: {
    // A real village in Bangladesh, not a generic stock family.
    family: unsplash("photo-1528726164383-33c4a223b78c"),
    phoneInHand: unsplash("photo-1551721434-8b94ddff0e6d"),
    reminder: unsplash("photo-1563213126-a4273aed2016"),
  },
  tiles: {
    vault: unsplash("photo-1777805865927-a6ee4c4eacb1"),
    findCare: unsplash("photo-1655313719493-16ebe4906441"),
    medicine: unsplash("photo-1628771065518-0d82f1938462"),
    family: unsplash("photo-1659352787906-f809a3b9e86e"),
    hospitals: unsplash("photo-1764885517847-79d62138cc58"),
    tests: unsplash("photo-1639772823849-6efbd173043c"),
  },
};
