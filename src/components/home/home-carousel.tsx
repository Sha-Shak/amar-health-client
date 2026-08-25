"use client";

import { PhotoSlot } from "@/components/ui/photo-slot";
import { photos } from "@/config/photos";
import { reminderSubtitle } from "@/features/home/format";
import type { Reminder } from "@/features/reminders/types";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type Slide = { key: string; href: string; photo: string; title: string; body: string };

const INTERVAL_MS = 4500;
const SWIPE_THRESHOLD_PX = 40;

export function HomeCarousel({
  todayReminders,
  upcomingReminders,
}: {
  todayReminders: Reminder[];
  upcomingReminders: Reminder[];
}) {
  const router = useRouter();
  // Always exactly 5 slides — only their content is dynamic (the reminders
  // slide's copy), so the index never needs re-clamping as data loads in.
  const slides = buildSlides(todayReminders, upcomingReminders);
  const [index, setIndex] = useState(0);

  const dragStartX = useRef<number | null>(null);
  const dragDeltaX = useRef(0);
  const [dragOffset, setDragOffset] = useState(0);

  // Manual navigation (swipe) restarts the auto-advance clock rather than
  // letting a stale timer fire again a moment later — otherwise a swipe could
  // immediately get overridden by an auto-advance that was already halfway
  // through its interval.
  useEffect(() => {
    const timer = setInterval(() => setIndex((i) => (i + 1) % slides.length), INTERVAL_MS);
    return () => clearInterval(timer);
  }, [slides.length, index]);

  const slide = slides[index] ?? slides[0];

  function goTo(delta: number) {
    setIndex((i) => (i + delta + slides.length) % slides.length);
  }

  function handlePointerDown(e: React.PointerEvent) {
    dragStartX.current = e.clientX;
    dragDeltaX.current = 0;
    (e.target as Element).setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (dragStartX.current === null) return;
    dragDeltaX.current = e.clientX - dragStartX.current;
    setDragOffset(dragDeltaX.current);
  }

  function handlePointerUp() {
    const delta = dragDeltaX.current;
    dragStartX.current = null;
    setDragOffset(0);

    if (Math.abs(delta) > SWIPE_THRESHOLD_PX) {
      goTo(delta < 0 ? 1 : -1);
      return;
    }
    // Not a real swipe — treat it as a tap and navigate, same as the card
    // being a plain link (it can't be an actual <Link> anymore since a drag
    // gesture and a tap both start as the same pointerdown on the same
    // element).
    router.push(slide.href);
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") router.push(slide.href);
        if (e.key === "ArrowLeft") goTo(-1);
        if (e.key === "ArrowRight") goTo(1);
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => {
        dragStartX.current = null;
        setDragOffset(0);
      }}
      className="relative mb-6 block h-56 touch-pan-y select-none overflow-hidden rounded-[var(--radius-card)]"
      style={{
        transform: dragOffset ? `translateX(${dragOffset * 0.3}px)` : undefined,
        transition: dragOffset ? "none" : "transform 200ms ease-out",
      }}
    >
      {/* This card caps out at max-w-sm (384px) — never truly viewport-width —
          and it's always the first thing rendered on Home, so it's also worth
          loading eagerly rather than waiting on the lazy-load threshold. */}
      <PhotoSlot alt="" src={slide.photo} gradient="from-primary-700 to-ink-900" sizes="384px" priority />
      {/* Plain gradient scrim, not backdrop-filter — see feature-tile.tsx's
          comment: backdrop-filter inside an overflow-hidden rounded card is
          known to render far too strongly on iOS Safari, to the point of
          hiding the photo underneath entirely. */}
      <div className="photo-scrim absolute inset-0 rounded-[var(--radius-card)]" />
      <div
        className="pointer-events-none absolute inset-0 flex flex-col justify-end gap-2 p-5 text-white"
        style={{ filter: "drop-shadow(0 1px 4px rgb(0 0 0 / 0.55))" }}
      >
        <p className="text-lg font-semibold">{slide.title}</p>
        <p className="text-sm text-white/85">{slide.body}</p>
        <div className="flex justify-center gap-1 pt-1">
          {slides.map((s, i) => (
            <span
              key={s.key}
              className={`h-1 rounded-full transition-all ${
                i === index ? "w-3.5 bg-white/80" : "w-1 bg-white/35"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function buildSlides(todayReminders: Reminder[], upcomingReminders: Reminder[]): Slide[] {
  return [
    reminderSlide(todayReminders, upcomingReminders),
    {
      key: "vault",
      href: "/vault",
      photo: photos.tiles.vault,
      title: "Every record, in one place",
      body: "Scan a prescription or report in seconds — searchable, always with you.",
    },
    {
      key: "find-care",
      href: "/find-care",
      photo: photos.tiles.findCare,
      title: "Find a doctor nearby",
      body: "Browse verified doctors by specialty and see real chamber hours.",
    },
    {
      key: "medicine",
      href: "/medicine",
      photo: photos.tiles.medicine,
      title: "Look up any medicine",
      body: "Dosage, indications, and side effects — in plain language.",
    },
    {
      key: "hospitals",
      href: "/hospitals",
      photo: photos.tiles.hospitals,
      title: "Browse hospitals near you",
      body: "Services, emergency care, and real locations on the map.",
    },
  ];
}

function reminderSlide(todayReminders: Reminder[], upcomingReminders: Reminder[]): Slide {
  const photo = photos.onboarding.reminder;

  if (todayReminders.length > 0) {
    const body = todayReminders.map((r) => r.title).join(", ");
    return {
      key: "reminders",
      href: "/reminders",
      photo,
      title: `${todayReminders.length} thing${todayReminders.length === 1 ? "" : "s"} to do today`,
      body,
    };
  }

  if (upcomingReminders.length > 0) {
    const next = upcomingReminders[0];
    return {
      key: "reminders",
      href: "/reminders",
      photo,
      title: `Coming up: ${next.title}`,
      body: reminderSubtitle(next),
    };
  }

  return {
    key: "reminders",
    href: "/reminders",
    photo,
    title: "Never miss a dose",
    body: "Set reminders for medicine, checkups, and follow-ups.",
  };
}
