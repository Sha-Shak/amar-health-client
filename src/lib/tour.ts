"use client";

import { driver, type DriveStep } from "driver.js";
import "driver.js/dist/driver.css";
import { useEffect } from "react";

const SEEN_KEY_PREFIX = "amar-health:tour-seen:";

function storageAvailable(): boolean {
  return typeof window !== "undefined";
}

export function hasSeenTour(tourId: string): boolean {
  if (!storageAvailable()) return true;
  return localStorage.getItem(SEEN_KEY_PREFIX + tourId) === "1";
}

function markTourSeen(tourId: string) {
  if (!storageAvailable()) return;
  localStorage.setItem(SEEN_KEY_PREFIX + tourId, "1");
}

// Device-local (localStorage), not per-account on the backend — a product
// tour is a "have you seen this UI" hint, not data worth syncing across
// devices or worth a schema migration for.
export function startTour(tourId: string, steps: DriveStep[]) {
  const driverObj = driver({
    showProgress: steps.length > 1,
    animate: true,
    overlayColor: "#0f172a",
    stagePadding: 6,
    stageRadius: 12,
    popoverClass: "amar-tour-popover",
    nextBtnText: "Next",
    prevBtnText: "Back",
    doneBtnText: "Got it",
    onDestroyed: () => markTourSeen(tourId),
    steps,
  });
  driverObj.drive();
  return driverObj;
}

// Runs a tour once per device, the first time `ready` is true (e.g. once the
// data a tour's target elements depend on has actually loaded) — never
// re-runs after the user has seen or dismissed it. Call `startTour` directly
// for a manual "replay this tour" affordance.
export function useAutoTour(tourId: string, steps: DriveStep[], ready: boolean) {
  useEffect(() => {
    if (!ready || hasSeenTour(tourId)) return;
    // Give the just-mounted DOM a frame to paint before driver.js queries
    // its step selectors — otherwise a step can silently no-op if its
    // target isn't attached yet.
    const timer = setTimeout(() => startTour(tourId, steps), 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, tourId]);
}
