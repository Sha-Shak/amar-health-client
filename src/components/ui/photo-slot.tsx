import { cn } from "@/lib/cn";
import Image from "next/image";

// Hosts that need special handling to load at all. img.sasthyaseba.com
// (bulk-imported doctor/hospital photos) implements Referer-based hotlink
// protection: any request with a Referer header pointing at a different site
// gets a 403, but the exact same URL with no Referer (or Referer: sasthyaseba
// itself) returns 200 — confirmed directly against their CDN. A real
// `<img>`/`fill` Image always sends the page's Referer on a cross-origin
// request, which is exactly what trips this; `referrerPolicy="no-referrer"`
// stops the browser from sending one at all. `unoptimized` matters too: Next's
// own server-side image optimizer would otherwise fetch the source itself
// (with its own Referer) and cache a 403 permanently regardless of what the
// eventual browser request does.
const REFERRER_PROTECTED_HOSTS = ["img.sasthyaseba.com"];

function needsReferrerWorkaround(src: string): boolean {
  try {
    return REFERRER_PROTECTED_HOSTS.includes(new URL(src).hostname);
  } catch {
    return false;
  }
}

/**
 * Renders a real photo when `src` is provided (see src/config/photos.ts),
 * otherwise a tasteful gradient placeholder so layout/scrim/glass work can
 * proceed without blocking on photo sourcing.
 */
export function PhotoSlot({
  src,
  alt,
  className,
  gradient = "from-primary-700 via-primary-800 to-ink-900",
  // Defaults to the old blanket "100vw" for any call site that doesn't pass
  // one — but that means Next.js requests a viewport-width image for even a
  // 64px avatar circle. Pass the actual rendered width (e.g. "192px", or a
  // media-query string) wherever a photo isn't genuinely full-bleed, so the
  // generated srcset — and what actually gets downloaded — matches what's on
  // screen instead of over-fetching by 3-5x.
  sizes = "100vw",
  priority,
}: {
  src?: string;
  alt: string;
  className?: string;
  gradient?: string;
  sizes?: string;
  priority?: boolean;
}) {
  if (src) {
    const workaround = needsReferrerWorkaround(src);
    return (
      <Image
        src={src}
        alt={alt}
        fill
        className={cn("object-cover", className)}
        sizes={sizes}
        priority={priority}
        unoptimized={workaround}
        referrerPolicy={workaround ? "no-referrer" : undefined}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={alt}
      className={cn("absolute inset-0 bg-gradient-to-br", gradient, className)}
    />
  );
}
