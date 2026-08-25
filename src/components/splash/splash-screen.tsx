"use client";

import { HeartPulse, Pill, Stethoscope } from "lucide-react";
import { useEffect, useState } from "react";

// Three medical glyphs cycle quickly, then the wordmark lands and the whole
// screen fades away — ~700ms total, once per full page load. A route change
// doesn't remount this (it lives above the router in the provider tree), so
// it never re-appears on plain in-app navigation.
const ICONS = [Stethoscope, Pill, HeartPulse];
const ICON_STEP_MS = 220;
const HOLD_MS = 260;
const FADE_MS = 220;

export function SplashScreen() {
  const [iconIndex, setIconIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (iconIndex >= ICONS.length - 1) return;
    const timer = setTimeout(() => setIconIndex((i) => i + 1), ICON_STEP_MS);
    return () => clearTimeout(timer);
  }, [iconIndex]);

  useEffect(() => {
    const cycleDone = ICONS.length * ICON_STEP_MS;
    const fadeTimer = setTimeout(() => setFading(true), cycleDone + HOLD_MS);
    const hideTimer = setTimeout(() => setVisible(false), cycleDone + HOLD_MS + FADE_MS);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4"
      style={{
        background: `linear-gradient(to top left, var(--page-bg-from) 0%, var(--page-bg-via) 55%, var(--page-bg-to) 100%)`,
        opacity: fading ? 0 : 1,
        transition: `opacity ${FADE_MS}ms ease-out`,
        pointerEvents: fading ? "none" : "auto",
      }}
    >
      <div className="relative flex h-16 w-16 items-center justify-center">
        {ICONS.map((IconGlyph, i) => (
          <IconGlyph
            key={i}
            size={44}
            strokeWidth={1.75}
            className="absolute text-primary-600 transition-all duration-200 ease-out"
            style={{
              opacity: i === iconIndex ? 1 : 0,
              transform: i === iconIndex ? "scale(1)" : "scale(0.75)",
            }}
          />
        ))}
      </div>

      <p className="text-3xl font-bold tracking-tight">
        <span
          style={{
            color: "#ffffff",
            WebkitTextStroke: "1.4px var(--color-primary-600)",
            paintOrder: "stroke fill",
          }}
        >
          Amar
        </span>{" "}
        <span className="text-primary-600">Health</span>
      </p>
    </div>
  );
}
