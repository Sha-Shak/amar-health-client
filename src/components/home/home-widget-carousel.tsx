"use client";

import type { CycleSummary } from "@/features/cycle-tracking/types";
import { phaseLabel } from "@/features/cycle-tracking/types";
import type { VaultSummary } from "@/features/home/types";
import type { Reminder } from "@/features/reminders/types";
import { useSwipeableCarousel } from "@/hooks/use-swipeable-carousel";
import { Bell, CalendarHeart, ChevronRight, Droplets, FolderHeart } from "lucide-react";
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
  cycleSummary,
  showCycleTracker,
}: {
  vaultSummary: VaultSummary | undefined;
  todayReminders: Reminder[];
  upcomingReminders: Reminder[];
  cycleSummary: CycleSummary | undefined;
  showCycleTracker: boolean;
}) {
  const router = useRouter();

  const widgets: Widget[] = [
    {
      key: "blood-donation",
      href: "/blood-donation",
      panelClass: "glass-panel-accent",
      iconBadgeClass: "bg-coral-50 text-coral-600",
      icon: Droplets,
      label: "Blood Donation",
      render: () => (
        <p className="text-sm text-ink-500">Find or offer blood in your community</p>
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
    ...(showCycleTracker
      ? [
          {
            key: "cycle-tracking",
            href: "/cycle-tracking",
            panelClass: "glass-panel-rose",
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

  const { index, dragOffset, handlers } = useSwipeableCarousel(widgets.length, INTERVAL_MS, (i) =>
    router.push(widgets[i].href),
  );

  const widget = widgets[index];
  const Icon = widget.icon;

  return (
    <div className="mb-3">
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter") router.push(widget.href);
        }}
        {...handlers}
        className={`${widget.panelClass} flex touch-pan-y select-none items-center gap-3 p-4`}
        style={{
          transform: dragOffset ? `translateX(${dragOffset * 0.3}px)` : undefined,
          transition: dragOffset ? "none" : "transform 200ms ease-out",
        }}
      >
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${widget.iconBadgeClass}`}>
          <Icon size={20} aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-semibold text-ink-900">{widget.label}</span>
          {widget.render()}
        </span>
        <ChevronRight size={18} className="shrink-0 text-ink-500" aria-hidden="true" />
      </div>
      {widgets.length > 1 && (
        <div className="mt-2 flex justify-center gap-1">
          {widgets.map((w, i) => (
            <span
              key={w.key}
              className={`h-1 rounded-full transition-all ${
                i === index ? "w-3.5 bg-primary-600" : "w-1 bg-ink-500/25"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
