"use client";

import type { DoseSchedule, Slot } from "@/features/reminders/types";
import { useEffect, useRef } from "react";

const SLOTS: { key: Slot; label: string }[] = [
  { key: "morning", label: "Morning" },
  { key: "afternoon", label: "Afternoon" },
  { key: "night", label: "Night" },
];

const OPTIONS = [0, 1, 2, 3, 4, 5];
const ITEM_HEIGHT = 36;
const VISIBLE_ROWS = 3;
const SCROLL_SETTLE_MS = 120;

// Apple-alarm-style wheel picker — one scrollable column of 0-5 per slot, the
// centered number is the selected dose. Replaces the old +/- stepper row, which
// ran three full button pairs side by side and overflowed a narrow phone canvas.
export function DoseScheduleStepper({
  value,
  onChange,
}: {
  value: DoseSchedule;
  onChange: (value: DoseSchedule) => void;
}) {
  function setSlot(slot: Slot, next: number) {
    onChange({ ...value, [slot]: next });
  }

  const total = value.morning + value.afternoon + value.night;

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-ink-700">Dose schedule</p>

      <div className="mb-1 grid grid-cols-3 gap-2 text-center">
        {SLOTS.map(({ key, label }) => (
          <span key={key} className="text-xs font-medium text-ink-500">
            {label}
          </span>
        ))}
      </div>

      <div className="relative">
        <div
          className="pointer-events-none absolute inset-x-0 rounded-[var(--radius-sm)] bg-primary-50"
          style={{ top: ITEM_HEIGHT, height: ITEM_HEIGHT }}
          aria-hidden="true"
        />
        <div className="grid grid-cols-3 gap-2">
          {SLOTS.map(({ key, label }) => (
            <WheelColumn
              key={key}
              label={label}
              value={value[key]}
              onChange={(next) => setSlot(key, next)}
            />
          ))}
        </div>
      </div>

      <p className="mt-2 text-center text-sm text-ink-500">
        {total} dose{total === 1 ? "" : "s"} per day
      </p>
    </div>
  );
}

function WheelColumn({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (next: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const settleTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Sync scroll position on mount only (e.g. loading an existing reminder) —
  // after that, the user's own scrolling is the source of truth.
  useEffect(() => {
    ref.current?.scrollTo({ top: value * ITEM_HEIGHT });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleScroll() {
    if (settleTimer.current) clearTimeout(settleTimer.current);
    settleTimer.current = setTimeout(() => {
      const el = ref.current;
      if (!el) return;
      const index = Math.min(
        Math.max(Math.round(el.scrollTop / ITEM_HEIGHT), 0),
        OPTIONS.length - 1
      );
      el.scrollTo({ top: index * ITEM_HEIGHT, behavior: "smooth" });
      onChange(index);
    }, SCROLL_SETTLE_MS);
  }

  return (
    <div
      ref={ref}
      onScroll={handleScroll}
      role="slider"
      aria-label={`${label} dose`}
      aria-valuemin={0}
      aria-valuemax={5}
      aria-valuenow={value}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowUp") onChange(Math.max(value - 1, 0));
        if (e.key === "ArrowDown") onChange(Math.min(value + 1, 5));
      }}
      className="snap-y snap-mandatory overflow-y-scroll [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      style={{
        height: ITEM_HEIGHT * VISIBLE_ROWS,
        maskImage: "linear-gradient(to bottom, transparent, black 30%, black 70%, transparent)",
        WebkitMaskImage:
          "linear-gradient(to bottom, transparent, black 30%, black 70%, transparent)",
      }}
    >
      <div style={{ height: ITEM_HEIGHT }} aria-hidden="true" />
      {OPTIONS.map((n) => (
        <div
          key={n}
          className="flex snap-center items-center justify-center"
          style={{ height: ITEM_HEIGHT }}
        >
          <span className="text-lg font-semibold text-ink-900">{n}</span>
        </div>
      ))}
      <div style={{ height: ITEM_HEIGHT }} aria-hidden="true" />
    </div>
  );
}
