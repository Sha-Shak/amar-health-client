"use client";

import { PhotoSlot } from "@/components/ui/photo-slot";
import { photos } from "@/config/photos";
import { useRouter } from "next/navigation";
import { useState } from "react";

const ONBOARDING_SEEN_KEY = "hv-onboarding-seen";

const panels = [
  {
    title: "All your health records, safe in one place",
    body: "Scan prescriptions, lab reports, and vaccine cards — searchable, always with you.",
    src: photos.onboarding.family,
    gradient: "from-primary-700 via-primary-800 to-ink-900",
  },
  {
    title: "Book doctors and pharmacies in a tap",
    body: "Find verified doctors nearby and hold your spot with real-time chamber availability.",
    src: photos.onboarding.phoneInHand,
    gradient: "from-primary-600 via-primary-800 to-ink-900",
  },
  {
    title: "Never miss a dose or an appointment",
    body: "Gentle reminders for medicine, checkups, and follow-ups — for you and your family.",
    src: photos.onboarding.reminder,
    gradient: "from-coral-600 via-primary-800 to-ink-900",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const isLast = index === panels.length - 1;

  function finish() {
    window.localStorage.setItem(ONBOARDING_SEEN_KEY, "1");
    router.push("/signup");
  }

  const panel = panels[index];

  return (
    <div className="relative flex-1 overflow-hidden">
      <PhotoSlot alt="" src={panel.src} gradient={panel.gradient} priority />
      <div className="photo-scrim absolute inset-0" />

      <button
        type="button"
        onClick={finish}
        className="glass-on-photo tap-target absolute right-4 top-[max(1rem,env(safe-area-inset-top))] rounded-[var(--radius-pill)] px-5 text-sm font-medium"
      >
        Skip
      </button>

      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-6 p-8 pb-[max(2rem,env(safe-area-inset-bottom))]">
        <div className="flex justify-center gap-2">
          {panels.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-6 bg-white" : "w-1.5 bg-white/40"
              }`}
            />
          ))}
        </div>

        <div className="space-y-2 text-center text-white">
          <h1 className="text-2xl font-bold">{panel.title}</h1>
          <p className="text-white/85">{panel.body}</p>
        </div>

        {isLast ? (
          <button
            type="button"
            onClick={finish}
            className="tap-target rounded-[var(--radius-pill)] bg-primary-600 px-6 py-4 font-semibold text-white shadow-[0_0_0_8px_rgb(13_148_136/0.2),0_16px_32px_-10px_rgb(13_148_136/0.7)]"
          >
            Get Started
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setIndex((i) => i + 1)}
            className="tap-target rounded-[var(--radius-pill)] bg-white px-6 py-4 font-semibold text-ink-900"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
}
