import { cn } from "@/lib/cn";
import Image from "next/image";

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
}: {
  src?: string;
  alt: string;
  className?: string;
  gradient?: string;
}) {
  if (src) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        className={cn("object-cover", className)}
        sizes="100vw"
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
