"use client";

import { PhotoSlot } from "@/components/ui/photo-slot";
import { photos } from "@/config/photos";
import { reminderSubtitle } from "@/features/home/format";
import type { Reminder } from "@/features/reminders/types";
import Link from "next/link";
import { useEffect, useState } from "react";

type Slide = { key: string; href: string; photo: string; title: string; body: string };

const INTERVAL_MS = 4500;

export function HomeCarousel({
  todayReminders,
  upcomingReminders,
}: {
  todayReminders: Reminder[];
  upcomingReminders: Reminder[];
}) {
  // Always exactly 5 slides — only their content is dynamic (the reminders
  // slide's copy), so the index never needs re-clamping as data loads in.
  const slides = buildSlides(todayReminders, upcomingReminders);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setIndex((i) => (i + 1) % slides.length), INTERVAL_MS);
    return () => clearInterval(timer);
  }, [slides.length]);

  const slide = slides[index] ?? slides[0];

  return (
    <Link
      href={slide.href}
      className="relative mb-6 block h-56 overflow-hidden rounded-[var(--radius-card)]"
    >
      <PhotoSlot alt="" src={slide.photo} gradient="from-primary-700 to-ink-900" />
      <div className="glass-on-photo absolute inset-0 flex flex-col justify-end gap-2 rounded-[var(--radius-card)] p-5">
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
    </Link>
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
