"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { FeatureTile } from "@/components/home/feature-tile";
import { HomeCarousel } from "@/components/home/home-carousel";
import { HomeWidgetCarousel } from "@/components/home/home-widget-carousel";
import { photos } from "@/config/photos";
import { cycleTrackingApi } from "@/features/cycle-tracking/api";
import { healthTrackerApi } from "@/features/health-tracker/api";
import { homeApi } from "@/features/home/api";
import { remindersApi } from "@/features/reminders/api";
import { useQuery } from "@tanstack/react-query";
import {
  Bell,
  Building2,
  CalendarHeart,
  FlaskConical,
  FolderHeart,
  HeartPulse,
  Pill,
  Stethoscope,
  Users,
} from "lucide-react";
import Link from "next/link";

export default function HomeDashboardPage() {
  const { user } = useAuth();

  const remindersQuery = useQuery({
    queryKey: ["reminders", "today"],
    queryFn: homeApi.getTodayReminders,
  });

  const upcomingQuery = useQuery({
    queryKey: ["reminders", "upcoming-preview"],
    queryFn: () => remindersApi.list({ range: "upcoming" }),
  });

  const vaultSummaryQuery = useQuery({
    queryKey: ["vault", "summary"],
    queryFn: homeApi.getVaultSummary,
  });

  const showCycleTracker = user?.gender === "female";
  const cycleSummaryQuery = useQuery({
    queryKey: ["cycle-summary"],
    queryFn: cycleTrackingApi.getSummary,
    enabled: showCycleTracker,
  });

  const healthInsightsQuery = useQuery({
    queryKey: ["health-insights"],
    queryFn: healthTrackerApi.getInsights,
  });

  const reminders = remindersQuery.data ?? [];
  const upcomingReminders = upcomingQuery.data?.items ?? [];
  const vaultSummary = vaultSummaryQuery.data;

  const isLoading = remindersQuery.isLoading || vaultSummaryQuery.isLoading || upcomingQuery.isLoading;

  const firstName = (user?.name ?? "there").split(" ")[0];

  return (
    <div className="mx-auto w-full max-w-sm px-5 pt-8">
      <header className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-sm text-ink-500">Welcome back</p>
          <h1 className="text-2xl font-bold">{firstName}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/reminders"
            aria-label="Reminders"
            className="tap-target relative rounded-full bg-primary-50 text-primary-700"
          >
            <Bell size={20} aria-hidden="true" />
            {reminders.length > 0 && (
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-coral-500" />
            )}
          </Link>
          <Link
            href="/profile"
            aria-label="Profile"
            className="tap-target h-11 w-11 overflow-hidden rounded-full bg-primary-50 text-primary-700"
          >
            {user?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center font-semibold">
                {firstName[0]?.toUpperCase()}
              </span>
            )}
          </Link>
        </div>
      </header>

      {isLoading ? (
        <div className="mb-6 h-56 animate-pulse rounded-[var(--radius-card)] bg-black/5" />
      ) : (
        <HomeCarousel todayReminders={reminders} upcomingReminders={upcomingReminders} />
      )}

      <HomeWidgetCarousel
        vaultSummary={vaultSummary}
        todayReminders={reminders}
        upcomingReminders={upcomingReminders}
        cycleSummary={cycleSummaryQuery.data}
        showCycleTracker={showCycleTracker}
        healthInsights={healthInsightsQuery.data}
      />

      <h2 className="mb-3 mt-3 text-lg font-semibold">Explore</h2>
      <ExploreGrid showCycleTracker={showCycleTracker} />
    </div>
  );
}

function ExploreGrid({ showCycleTracker }: { showCycleTracker: boolean }) {
  const tiles = [
    { href: "/health-tracker", label: "Health Tracker", icon: HeartPulse, photo: photos.tiles.healthTracker },
    { href: "/vault", label: "Vault", icon: FolderHeart, photo: photos.tiles.vault },
    { href: "/hospitals", label: "Hospitals", icon: Building2, photo: photos.tiles.hospitals },
    { href: "/find-care", label: "Find Care", icon: Stethoscope, photo: photos.tiles.findCare },
    { href: "/medicine", label: "Medicine", icon: Pill, photo: photos.tiles.medicine },
    { href: "/family", label: "Family", icon: Users, photo: photos.tiles.family },
    { href: "/tests", label: "Tests", icon: FlaskConical, photo: photos.tiles.tests },
    ...(showCycleTracker
      ? [{ href: "/cycle-tracking", label: "Cycle Tracker", icon: CalendarHeart, photo: photos.tiles.cycleTracking }]
      : []),
  ];

  // An odd tile count leaves a lone tile alone in the grid's last row with
  // half the row empty — stretch just that last tile across both columns
  // instead, so the grid always ends flush.
  const isOdd = tiles.length % 2 === 1;

  return (
    <div className="grid grid-cols-2 gap-3">
      {tiles.map((tile, i) => (
        <FeatureTile key={tile.href} {...tile} className={isOdd && i === tiles.length - 1 ? "col-span-2" : undefined} />
      ))}
    </div>
  );
}
