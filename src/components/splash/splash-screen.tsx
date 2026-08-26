"use client";

import { Droplets, FolderHeart, Pill, Stethoscope } from "lucide-react";
import { useEffect, useState } from "react";

// A two-beat launch sequence, once per full page load (this lives above the
// router in the provider tree, so an in-app navigation never remounts it):
// the app's feature icons wave in a row, then they hand off to the wordmark
// growing in, then the whole thing fades. ~1.6s total.
const FEATURE_ICONS = [Stethoscope, Pill, FolderHeart, Droplets];
const ICON_STAGGER_MS = 90;
const ICON_PHASE_MS = 820;
const TITLE_GROW_MS = 420;
const HOLD_MS = 320;
const FADE_MS = 240;

type Phase = "icons" | "title" | "fading";

export function SplashScreen() {
  const [phase, setPhase] = useState<Phase>("icons");
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const toTitle = setTimeout(() => setPhase("title"), ICON_PHASE_MS);
    const toFading = setTimeout(() => setPhase("fading"), ICON_PHASE_MS + TITLE_GROW_MS + HOLD_MS);
    const toHidden = setTimeout(
      () => setVisible(false),
      ICON_PHASE_MS + TITLE_GROW_MS + HOLD_MS + FADE_MS,
    );
    return () => {
      clearTimeout(toTitle);
      clearTimeout(toFading);
      clearTimeout(toHidden);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      className="splash-bg fixed inset-0 z-[100] flex items-center justify-center"
      style={{
        opacity: phase === "fading" ? 0 : 1,
        transition: `opacity ${FADE_MS}ms ease-out`,
      }}
    >
      {phase === "icons" ? (
        <div className="flex items-center gap-5">
          {FEATURE_ICONS.map((Icon, i) => (
            <Icon
              key={i}
              size={34}
              strokeWidth={1.75}
              className="text-primary-600"
              style={{
                animation: "splash-icon-wave 620ms ease-in-out",
                animationDelay: `${i * ICON_STAGGER_MS}ms`,
                animationFillMode: "both",
              }}
            />
          ))}
        </div>
      ) : (
        <p
          className="whitespace-nowrap text-4xl font-bold tracking-tight"
          style={{ animation: `splash-title-grow ${TITLE_GROW_MS}ms cubic-bezier(0.22, 1, 0.36, 1) both` }}
        >
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
      )}
    </div>
  );
}
