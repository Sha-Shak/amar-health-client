"use client";

import type { BloodRequest } from "@/features/blood-donation/types";
import type { CycleSummary } from "@/features/cycle-tracking/types";
import { phaseLabel } from "@/features/cycle-tracking/types";
import type { HealthInsights } from "@/features/health-tracker/types";
import type { VaultSummary } from "@/features/home/types";
import type { Reminder } from "@/features/reminders/types";
import { useSwipeableCarousel } from "@/hooks/use-swipeable-carousel";
import { Bell, CalendarHeart, ChevronLeft, ChevronRight, Droplets, FolderHeart, HeartPulse } from "lucide-react";
import { useRouter } from "next/navigation";

const INTERVAL_MS = 5500;

type Widget = {
  key: string;
  href: string;
  panelClass: string;
  iconBadgeClass: string;
  icon: React.ElementType;
  label: string;
  render: () => React.ReactNode;
};

export function HomeWidgetCarousel({
  vaultSummary,
  todayReminders,
  upcomingReminders,
  myActiveBloodRequests,
  cycleSummary,
  showCycleTracker,
  healthInsights,
}: {
  vaultSummary: VaultSummary | undefined;
  todayReminders: Reminder[];
  upcomingReminders: Reminder[];
  myActiveBloodRequests: BloodRequest[];
  cycleSummary: CycleSummary | undefined;
  showCycleTracker: boolean;
  healthInsights: HealthInsights | undefined;
}) {
  const router = useRouter();

  const widgets: Widget[] = [
    {
      key: "blood-donation",
      href: "/blood-donation",
      panelClass: "glass-panel",
      iconBadgeClass: "bg-coral-50 text-coral-600",
      icon: Droplets,
      label: "Blood Donation",
      render: () => (
        <p className="text-sm text-ink-500">
          {myActiveBloodRequests.length > 0
            ? `You have ${myActiveBloodRequests.length} active request${myActiveBloodRequests.length === 1 ? "" : "s"} — ${myActiveBloodRequests.reduce((sum, r) => sum + (r.interestCount ?? 0), 0)} interested`
            : "Find or offer blood in your community"}
        </p>
      ),
    },
    {
      key: "vault",
      href: "/vault",
      panelClass: "glass-panel",
      iconBadgeClass: "bg-primary-50 text-primary-700",
      icon: FolderHeart,
      label: "Your Vault",
      render: () => {
        const total = vaultSummary
          ? vaultSummary.prescriptionCount + vaultSummary.reportCount + vaultSummary.billCount
          : 0;
        return (
          <p className="text-sm text-ink-500">
            {total > 0
              ? `${vaultSummary!.prescriptionCount} prescriptions · ${vaultSummary!.reportCount} reports · ${vaultSummary!.billCount} bills`
              : "Scan a prescription or report to get started"}
          </p>
        );
      },
    },
    {
      key: "reminders",
      href: "/reminders",
      panelClass: "glass-panel",
      iconBadgeClass: "bg-primary-50 text-primary-700",
      icon: Bell,
      label: "Reminders",
      render: () => {
        if (todayReminders.length > 0) {
          return (
            <p className="text-sm text-ink-500">
              {todayReminders.length} thing{todayReminders.length === 1 ? "" : "s"} to do today
            </p>
          );
        }
        if (upcomingReminders.length > 0) {
          return <p className="text-sm text-ink-500">Next: {upcomingReminders[0].title}</p>;
        }
        return <p className="text-sm text-ink-500">Nothing scheduled — add a reminder</p>;
      },
    },
    {
      key: "health-tracker",
      href: "/health-tracker",
      panelClass: "glass-panel",
      iconBadgeClass: "bg-primary-50 text-primary-700",
      icon: HeartPulse,
      label: "Health Tracker",
      render: () => (
        <p className="text-sm text-ink-500">
          {healthInsights && healthInsights.totalLogged > 0
            ? `${healthInsights.totalLogged} check-in${healthInsights.totalLogged === 1 ? "" : "s"} logged`
            : "Track weight, mood, BP, and more"}
        </p>
      ),
    },
    ...(showCycleTracker
      ? [
          {
            key: "cycle-tracking",
            href: "/cycle-tracking",
            panelClass: "glass-panel",
            iconBadgeClass: "bg-rose-50 text-rose-600",
            icon: CalendarHeart,
            label: "Cycle Tracker",
            render: () => (
              <p className="text-sm text-ink-500">
                {cycleSummary?.currentCycleDay != null
                  ? `${phaseLabel(cycleSummary.phase)} · Day ${cycleSummary.currentCycleDay}`
                  : "Log a period day to start tracking"}
              </p>
            ),
          } satisfies Widget,
        ]
      : []),
  ];

  const { index, setIndex, dragOffset, goTo, handlers } = useSwipeableCarousel(
    widgets.length,
    INTERVAL_MS,
    (i) => router.push(widgets[i].href),
  );

  const widget = widgets[index];
  const Icon = widget.icon;
  const hasMultiple = widgets.length > 1;

  return (
    <div className="mb-3">
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter") router.push(widget.href);
          if (e.key === "ArrowLeft") goTo(-1);
          if (e.key === "ArrowRight") goTo(1);
        }}
        {...handlers}
        className={`${widget.panelClass} flex touch-pan-y select-none items-center gap-2 p-4`}
        style={{
          transform: dragOffset ? `translateX(${dragOffset * 0.3}px)` : undefined,
          transition: dragOffset ? "none" : "transform 200ms ease-out",
        }}
      >
        {/* Plain translucent chevrons, in the card's own flex row rather
            than overlaid on top of it — swipe alone isn't discoverable, so
            these give the same navigation a visible affordance without
            reading as a separate control (stopPropagation keeps a tap here
            from also registering as a tap on the card itself). */}
        {hasMultiple && (
          <button
            type="button"
            aria-label="Previous"
            onPointerDown={(e) => e.stopPropagation()}
            onPointerUp={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              goTo(-1);
            }}
            className="tap-target -mx-2 shrink-0 text-ink-500/40"
          >
            <ChevronLeft size={18} aria-hidden="true" />
          </button>
        )}
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${widget.iconBadgeClass}`}>
          <Icon size={20} aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-semibold text-ink-900">{widget.label}</span>
          {widget.render()}
        </span>
        {hasMultiple ? (
          <button
            type="button"
            aria-label="Next"
            onPointerDown={(e) => e.stopPropagation()}
            onPointerUp={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              goTo(1);
            }}
            className="tap-target -mx-2 shrink-0 text-ink-500/40"
          >
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        ) : (
          <ChevronRight size={18} className="shrink-0 text-ink-500" aria-hidden="true" />
        )}
      </div>

      {hasMultiple && (
        <div className="mt-2 flex justify-center gap-1.5">
          {widgets.map((w, i) => (
            <button
              key={w.key}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Go to ${w.label}`}
              className="tap-target -m-2.5 flex items-center justify-center"
            >
              <span
                className={`h-1 rounded-full transition-all ${
                  i === index ? "w-3.5 bg-primary-600" : "w-1 bg-ink-500/25"
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
