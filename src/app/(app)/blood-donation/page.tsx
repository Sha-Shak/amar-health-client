"use client";

import { TierBadge } from "@/components/blood-donation/tier-badge";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/components/providers/auth-provider";
import { bloodDonationApi } from "@/features/blood-donation/api";
import { errorMessage } from "@/lib/error-message";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Droplets, ListChecks, Plus, Trophy, Users } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function BloodDonationHubPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ["blood-donation", "me"],
    queryFn: bloodDonationApi.getMyDonorProfile,
  });

  const availabilityMutation = useMutation({
    mutationFn: bloodDonationApi.setAvailability,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["blood-donation", "me"] }),
    onError: (error) => toast.error(errorMessage(error)),
  });

  const hasBloodGroup = Boolean(user?.bloodGroup && user.bloodGroup !== "unknown");
  const showEligibleBanner = Boolean(
    profile?.lastDonationDate && profile.eligibleToDonateAgain && !profile.isAvailable
  );

  return (
    <div className="mx-auto w-full max-w-sm px-5 pt-8 pb-6">
      <div className="mb-1 flex items-center gap-2">
        <Droplets size={22} className="text-coral-600" aria-hidden="true" />
        <h1 className="text-2xl font-bold">Blood Donation</h1>
      </div>
      <p className="mb-6 text-sm text-ink-700">
        Find blood when you need it, or step up when someone else does.
      </p>

      {showEligibleBanner && (
        <div className="glass-panel mb-4 flex items-center justify-between gap-3 border border-coral-200 bg-coral-50/60 p-4">
          <div className="min-w-0">
            <p className="font-semibold text-coral-700">You&apos;re eligible to donate again</p>
            <p className="text-xs text-ink-600">It&apos;s been a while since your last donation — ready to help again?</p>
          </div>
          <button
            type="button"
            onClick={() => availabilityMutation.mutate(true)}
            disabled={availabilityMutation.isPending}
            className="shrink-0 rounded-[var(--radius-pill)] bg-coral-600 px-3 py-2 text-xs font-semibold text-white"
          >
            I&apos;m available
          </button>
        </div>
      )}

      <div className="glass-panel space-y-4 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-ink-500">Your blood group</p>
            <p className="text-2xl font-extrabold text-coral-600">{user?.bloodGroup ?? "—"}</p>
          </div>
          {profile && <TierBadge totalDonations={profile.totalDonations} />}
        </div>

        {profile && (
          <div className="flex items-center justify-around border-t border-black/5 pt-4 text-center">
            <div>
              <p className="text-xl font-bold">{profile.totalDonations}</p>
              <p className="text-xs text-ink-500">Donations</p>
            </div>
            <div>
              <p className="text-xl font-bold">{profile.totalBags}</p>
              <p className="text-xs text-ink-500">Bags given</p>
            </div>
            <div>
              <p className="text-xl font-bold">{profile.points}</p>
              <p className="text-xs text-ink-500">Points</p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-black/5 pt-4">
          <div className="min-w-0 pr-3">
            <p className="font-medium">Available to donate</p>
            <p className="text-xs text-ink-500">
              {hasBloodGroup
                ? "Show up when someone nearby needs your blood group"
                : "Set your blood group in Edit profile first"}
            </p>
          </div>
          <Switch
            checked={profile?.isAvailable ?? false}
            onChange={(checked) => availabilityMutation.mutate(checked)}
            label="Available to donate"
          />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <NavCard href="/blood-donation/requests" icon={ListChecks} label="Requests" />
        <NavCard href="/blood-donation/donors" icon={Users} label="Donors" />
        <NavCard href="/blood-donation/leaderboard" icon={Trophy} label="Leaderboard" />
      </div>

      <Link
        href="/blood-donation/requests/new"
        className="tap-target mt-4 flex w-full items-center justify-center gap-2 rounded-[var(--radius-pill)] bg-coral-600 py-3.5 font-semibold text-white"
      >
        <Plus size={18} aria-hidden="true" />
        Post a blood request
      </Link>
    </div>
  );
}

function NavCard({ href, icon: Icon, label }: { href: string; icon: typeof Users; label: string }) {
  return (
    <Link href={href} className="glass-panel flex flex-col items-center gap-2 py-4 text-center">
      <Icon size={20} className="text-coral-600" aria-hidden="true" />
      <span className="text-xs font-medium">{label}</span>
    </Link>
  );
}
