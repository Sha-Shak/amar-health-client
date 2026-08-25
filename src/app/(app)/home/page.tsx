"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { FeatureTile } from "@/components/home/feature-tile";
import { HomeCarousel } from "@/components/home/home-carousel";
import { WideTile } from "@/components/home/wide-tile";
import { photos } from "@/config/photos";
import { homeApi } from "@/features/home/api";
import { remindersApi } from "@/features/reminders/api";
import { useQuery } from "@tanstack/react-query";
import { Bell, Building2, Droplets, FlaskConical, FolderHeart, Pill, Stethoscope, Users } from "lucide-react";
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

  const reminders = remindersQuery.data ?? [];
  const upcomingReminders = upcomingQuery.data?.items ?? [];
  const vaultSummary = vaultSummaryQuery.data;
  const vaultTotal = vaultSummary
    ? vaultSummary.prescriptionCount + vaultSummary.reportCount + vaultSummary.billCount
    : undefined;

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

      <h2 className="mb-3 text-lg font-semibold">Explore</h2>
      <div className="grid grid-cols-2 gap-3">
        <FeatureTile href="/vault" label="Vault" icon={FolderHeart} photo={photos.tiles.vault} />
        <FeatureTile href="/find-care" label="Find Care" icon={Stethoscope} photo={photos.tiles.findCare} />
        <FeatureTile href="/medicine" label="Medicine" icon={Pill} photo={photos.tiles.medicine} />
        <FeatureTile href="/tests" label="Tests" icon={FlaskConical} photo={photos.tiles.tests} />
        <FeatureTile href="/hospitals" label="Hospitals" icon={Building2} photo={photos.tiles.hospitals} />
        <FeatureTile href="/family" label="Family" icon={Users} photo={photos.tiles.family} />
      </div>

      <div className="mt-3">
        <WideTile
          href="/blood-donation"
          label="Blood Donation"
          description="Find or offer blood in your community"
          icon={Droplets}
        />
      </div>

      {vaultSummary && vaultTotal !== undefined && vaultTotal > 0 && (
        <>
          <h2 className="mb-3 mt-6 text-lg font-semibold">Your vault</h2>
          <div className="glass-panel flex items-center justify-around p-4 text-center">
            <VaultStat href="/vault/folder/prescription" label="Prescriptions" count={vaultSummary.prescriptionCount} />
            <VaultStat href="/vault/folder/report" label="Reports" count={vaultSummary.reportCount} />
            <VaultStat href="/vault/folder/bill" label="Bills" count={vaultSummary.billCount} />
          </div>
        </>
      )}
    </div>
  );
}

function VaultStat({ href, label, count }: { href: string; label: string; count: number }) {
  return (
    <Link href={href}>
      <p className="text-xl font-bold text-primary-700">{count}</p>
      <p className="text-xs text-ink-500">{label}</p>
    </Link>
  );
}
