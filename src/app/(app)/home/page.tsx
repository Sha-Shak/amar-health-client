"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { FeatureTile } from "@/components/home/feature-tile";
import { HomeCarousel } from "@/components/home/home-carousel";
import { HomeWidgetCarousel } from "@/components/home/home-widget-carousel";
import { photos } from "@/config/photos";
import { bloodDonationApi } from "@/features/blood-donation/api";
import { bookingApi } from "@/features/booking/api";
import { cycleTrackingApi } from "@/features/cycle-tracking/api";
import { healthTrackerApi } from "@/features/health-tracker/api";
import { homeApi } from "@/features/home/api";
import { notificationsApi } from "@/features/notifications/api";
import { remindersApi } from "@/features/reminders/api";
import { startTour, useAutoTour } from "@/lib/tour";
import { useQuery } from "@tanstack/react-query";
import {
  Bell,
  Building2,
  CalendarHeart,
  Droplets,
  FlaskConical,
  FolderHeart,
  HeartPulse,
  HelpCircle,
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

  const unreadCountQuery = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: notificationsApi.getUnreadCount,
  });

  const myBloodRequestsQuery = useQuery({
    queryKey: ["blood-requests", "mine"],
    queryFn: () => bloodDonationApi.listRequests({ mine: true }),
  });

  const nextBookingQuery = useQuery({
    queryKey: ["bookings", "list", "confirmed"],
    queryFn: () => bookingApi.listBookings({ status: "confirmed" }),
  });

  const reminders = remindersQuery.data ?? [];
  const upcomingReminders = upcomingQuery.data?.items ?? [];
  const vaultSummary = vaultSummaryQuery.data;
  // listBookings sorts by creation order, not appointment date — re-sort by
  // the session's actual date to find what's genuinely coming up soonest.
  const nextBooking = [...(nextBookingQuery.data?.items ?? [])].sort((a, b) => {
    const aDate = typeof a.sessionId === "object" ? a.sessionId.date : "";
    const bDate = typeof b.sessionId === "object" ? b.sessionId.date : "";
    return aDate.localeCompare(bDate);
  })[0];

  const isLoading = remindersQuery.isLoading || vaultSummaryQuery.isLoading || upcomingQuery.isLoading;

  const firstName = (user?.name ?? "there").split(" ")[0];
  const featureCount = 8 + (showCycleTracker ? 1 : 0);

  const tourSteps = [
      {
        popover: {
          title: `Welcome to Amar Health, ${firstName}`,
          description: "Quick 30-second look at what's here before you dive in.",
        },
      },
      {
        element: '[data-tour="home-notifications"]',
        disableActiveInteraction: true,
        popover: {
          title: "Notifications",
          description: "Reminders, blood-request matches, and other updates land here — the dot means something's unread.",
        },
      },
      {
        element: '[data-tour="home-widgets"]',
        disableActiveInteraction: true,
        popover: {
          title: "Your quick glance",
          description: "Swipe through cards for Blood Donation, your Vault, Reminders, Health Tracker" + (showCycleTracker ? ", and Cycle Tracker" : "") + " — each shows what's due right now.",
        },
      },
      {
        element: '[data-tour="home-explore"]',
        disableActiveInteraction: true,
        popover: {
          title: `${featureCount} features, one tap away`,
          description: "Health Tracker, Vault, Blood Donation, Hospitals, Find Care, Medicine, Family, Tests" + (showCycleTracker ? ", and Cycle Tracker" : "") + " — tap any tile to open it.",
        },
      },
      {
        element: '[data-tour="home-profile"]',
        disableActiveInteraction: true,
        popover: {
          title: "Your profile",
          description: "Settings, notification preferences, dark mode, and account management live here.",
        },
      },
  ];

  useAutoTour("home-overview", tourSteps, !isLoading);

  return (
    <div className="mx-auto w-full max-w-sm px-5 pt-8">
      <header className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-sm text-ink-500">Welcome back</p>
          <h1 className="text-2xl font-bold">{firstName}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Replay app tour"
            onClick={() => startTour("home-overview", tourSteps)}
            className="tap-target rounded-full bg-primary-50 text-primary-700"
          >
            <HelpCircle size={20} aria-hidden="true" />
          </button>
          <Link
            href="/notifications"
            aria-label="Notifications"
            data-tour="home-notifications"
            className="tap-target relative rounded-full bg-primary-50 text-primary-700"
          >
            <Bell size={20} aria-hidden="true" />
            {(unreadCountQuery.data?.count ?? 0) > 0 && (
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-coral-500" />
            )}
          </Link>
          <Link
            href="/profile"
            aria-label="Profile"
            data-tour="home-profile"
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

      <div data-tour="home-widgets">
        <HomeWidgetCarousel
          vaultSummary={vaultSummary}
          todayReminders={reminders}
          upcomingReminders={upcomingReminders}
          myActiveBloodRequests={myBloodRequestsQuery.data?.items ?? []}
          nextBooking={nextBooking}
          cycleSummary={cycleSummaryQuery.data}
          showCycleTracker={showCycleTracker}
          healthInsights={healthInsightsQuery.data}
        />
      </div>

      <div data-tour="home-explore">
        <h2 className="mb-3 mt-3 text-lg font-semibold">Explore</h2>
        <ExploreGrid showCycleTracker={showCycleTracker} />
      </div>
    </div>
  );
}

function ExploreGrid({ showCycleTracker }: { showCycleTracker: boolean }) {
  // Split around Cycle Tracker deliberately, not just appended at the end —
  // it's the one tile that's only relevant to some users, so it gets its
  // own full-width row planted in the middle of the grid rather than
  // blending into the regular 2-up flow.
  const before = [
    { href: "/health-tracker", label: "Health Tracker", icon: HeartPulse, photo: photos.tiles.healthTracker },
    { href: "/vault", label: "Vault", icon: FolderHeart, photo: photos.tiles.vault },
    { href: "/blood-donation", label: "Blood Donation", icon: Droplets, photo: photos.tiles.bloodDonation },
    { href: "/hospitals", label: "Hospitals", icon: Building2, photo: photos.tiles.hospitals },
  ];
  const after = [
    { href: "/find-care", label: "Find Care", icon: Stethoscope, photo: photos.tiles.findCare },
    { href: "/medicine", label: "Medicine", icon: Pill, photo: photos.tiles.medicine },
    { href: "/family", label: "Family", icon: Users, photo: photos.tiles.family },
    { href: "/tests", label: "Tests", icon: FlaskConical, photo: photos.tiles.tests },
  ];

  // An odd tile count leaves a lone tile alone in its grid row with half the
  // row empty — stretch just that last tile across both columns instead, so
  // each half always ends flush regardless of how many tiles it has.
  const beforeSpansLast = before.length % 2 === 1;
  const afterSpansLast = after.length % 2 === 1;

  return (
    <div className="grid grid-cols-2 gap-3">
      {before.map((tile, i) => (
        <FeatureTile
          key={tile.href}
          {...tile}
          className={beforeSpansLast && i === before.length - 1 ? "col-span-2" : undefined}
        />
      ))}
      {showCycleTracker && (
        <FeatureTile
          href="/cycle-tracking"
          label="Cycle Tracker"
          icon={CalendarHeart}
          photo={photos.tiles.cycleTracking}
          className="col-span-2"
        />
      )}
      {after.map((tile, i) => (
        <FeatureTile
          key={tile.href}
          {...tile}
          className={afterSpansLast && i === after.length - 1 ? "col-span-2" : undefined}
        />
      ))}
    </div>
  );
}
