"use client";

import { TierBadge } from "@/components/blood-donation/tier-badge";
import { FilterChips } from "@/components/search/filter-chips";
import { AvatarPlaceholder } from "@/components/ui/avatar-placeholder";
import { Button } from "@/components/ui/button";
import { PhotoSlot } from "@/components/ui/photo-slot";
import { Switch } from "@/components/ui/switch";
import { TextField } from "@/components/ui/text-field";
import { useAuth } from "@/components/providers/auth-provider";
import { authApi } from "@/features/auth/api";
import { bloodDonationApi } from "@/features/blood-donation/api";
import { BLOOD_GROUPS, urgencyLabel, type BloodGroup, type BloodRequest } from "@/features/blood-donation/types";
import { errorMessage } from "@/lib/error-message";
import { startTour, useAutoTour } from "@/lib/tour";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Droplets, HelpCircle, ListChecks, MapPin, Plus, Trophy, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

const GROUP_OPTIONS = BLOOD_GROUPS.map((g) => ({ value: g, label: g }));

const URGENCY_STYLES: Record<string, string> = {
  critical: "bg-coral-600 text-white",
  urgent: "bg-coral-100 text-coral-700",
  normal: "bg-primary-50 text-primary-700",
};

const RANK_STYLES: Record<number, string> = {
  1: "bg-amber-400 text-amber-950",
  2: "bg-zinc-300 text-zinc-900",
  3: "bg-amber-700 text-amber-50",
};

const TABS = [
  { value: "requests", label: "Requests", icon: ListChecks },
  { value: "donors", label: "Donors", icon: Users },
  { value: "leaderboard", label: "Leaderboard", icon: Trophy },
] as const;

type Tab = (typeof TABS)[number]["value"];

export default function BloodDonationHubPage() {
  const { user, refetch: refetchUser } = useAuth();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>("requests");
  const [showPhonePrompt, setShowPhonePrompt] = useState(false);
  const [phoneInput, setPhoneInput] = useState("");

  const { data: profile } = useQuery({
    queryKey: ["blood-donation", "me"],
    queryFn: bloodDonationApi.getMyDonorProfile,
  });

  const myRequestsQuery = useQuery({
    queryKey: ["blood-requests", "mine"],
    queryFn: () => bloodDonationApi.listRequests({ mine: true }),
  });

  const availabilityMutation = useMutation({
    mutationFn: bloodDonationApi.setAvailability,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["blood-donation", "me"] }),
    onError: (error) => toast.error(errorMessage(error)),
  });

  const setPhoneMutation = useMutation({
    mutationFn: authApi.setPhone,
    onSuccess: async () => {
      await refetchUser();
      setShowPhonePrompt(false);
      setPhoneInput("");
      availabilityMutation.mutate(true);
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  function handleAvailabilityChange(checked: boolean) {
    if (checked && !user?.phone) {
      setShowPhonePrompt(true);
      return;
    }
    availabilityMutation.mutate(checked);
  }

  const hasBloodGroup = Boolean(user?.bloodGroup && user.bloodGroup !== "unknown");
  const showEligibleBanner = Boolean(
    profile?.lastDonationDate && profile.eligibleToDonateAgain && !profile.isAvailable
  );
  const myRequests = myRequestsQuery.data?.items ?? [];

  const tourSteps = [
      {
        popover: {
          title: "Blood Donation, in short",
          description: "Post a request when you need blood, or make yourself available to help someone else.",
        },
      },
      {
        element: '[data-tour="bd-card"]',
        disableActiveInteraction: true,
        popover: {
          title: "Your donor profile",
          description: "Your blood group, donation stats, and a switch to mark yourself available to donate.",
        },
      },
      {
        element: '[data-tour="bd-post"]',
        disableActiveInteraction: true,
        popover: {
          title: "Need blood?",
          description: "Post a request here — matching available donors get notified automatically.",
        },
      },
      {
        element: '[data-tour="bd-tabs"]',
        disableActiveInteraction: true,
        popover: {
          title: "Requests, donors, leaderboard",
          description: "Open requests near you, available donors by blood group, and top donors — all in one place.",
        },
      },
  ];

  useAutoTour("blood-donation-overview", tourSteps, !myRequestsQuery.isLoading);

  return (
    <div className="mx-auto w-full max-w-sm px-5 pt-8 pb-6">
      <div className="mb-1 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Droplets size={22} className="text-coral-600" aria-hidden="true" />
          <h1 className="text-2xl font-bold">Blood Donation</h1>
        </div>
        <button
          type="button"
          aria-label="Replay tour"
          onClick={() => startTour("blood-donation-overview", tourSteps)}
          className="tap-target rounded-full text-ink-500"
        >
          <HelpCircle size={20} aria-hidden="true" />
        </button>
      </div>
      <p className="mb-6 text-sm text-ink-700">
        Find blood when you need it, or step up when someone else does.
      </p>

      {myRequests.length > 0 && (
        <div className="mb-4">
          <h2 className="mb-2 text-sm font-semibold text-ink-500">Your active requests</h2>
          <div className="space-y-2">
            {myRequests.map((request) => (
              <RequestRow key={request._id} request={request} />
            ))}
          </div>
        </div>
      )}

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

      <div className="glass-panel space-y-4 p-5" data-tour="bd-card">
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
            onChange={handleAvailabilityChange}
            label="Available to donate"
          />
        </div>

        {showPhonePrompt && (
          <div className="space-y-3 border-t border-black/5 pt-4">
            <p className="text-sm text-ink-700">
              Donors need a phone number so requesters can reach you — add yours to continue.
            </p>
            <TextField
              label="Phone number"
              name="phone"
              type="tel"
              placeholder="01XXXXXXXXX"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              error={setPhoneMutation.isError ? errorMessage(setPhoneMutation.error) : undefined}
            />
            <div className="flex gap-3">
              <Button
                variant="glass"
                className="flex-1"
                onClick={() => {
                  setShowPhonePrompt(false);
                  setPhoneInput("");
                }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 !bg-primary-600"
                disabled={setPhoneMutation.isPending || !phoneInput}
                onClick={() => setPhoneMutation.mutate(phoneInput)}
              >
                {setPhoneMutation.isPending ? "Saving…" : "Save & continue"}
              </Button>
            </div>
          </div>
        )}

        <Link
          href="/blood-donation/requests/new"
          data-tour="bd-post"
          className="tap-target flex w-full items-center justify-center gap-2 rounded-[var(--radius-pill)] bg-coral-600 py-3.5 font-semibold text-white"
        >
          <Plus size={18} aria-hidden="true" />
          Post a blood request
        </Link>
      </div>

      <div className="glass-panel mt-5 mb-4 flex gap-1 p-1" data-tour="bd-tabs">
        {TABS.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setTab(t.value)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-[var(--radius-pill)] px-2 py-2 text-sm font-semibold transition-colors ${
              tab === t.value ? "bg-primary-600 text-white" : "text-ink-700"
            }`}
          >
            <t.icon size={15} aria-hidden="true" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === "requests" && <RequestsTab />}
      {tab === "donors" && <DonorsTab />}
      {tab === "leaderboard" && <LeaderboardTab />}
    </div>
  );
}

function RequestRow({ request }: { request: BloodRequest }) {
  return (
    <Link href={`/blood-donation/requests/${request._id}`} className="glass-panel block p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-coral-50 text-lg font-extrabold text-coral-600">
            {request.bloodGroup}
          </span>
          <div className="min-w-0">
            <p className="font-semibold">{request.hospitalName}</p>
            <div className="flex items-center gap-1 text-sm text-ink-500">
              <MapPin size={12} className="shrink-0" aria-hidden="true" />
              <span className="truncate">{request.location}</span>
            </div>
          </div>
        </div>
        <span
          className={`shrink-0 rounded-[var(--radius-pill)] px-2.5 py-1 text-xs font-semibold ${URGENCY_STYLES[request.urgency]}`}
        >
          {urgencyLabel(request.urgency)}
        </span>
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-ink-500">
        <span>
          {request.unitsFulfilled}/{request.unitsNeeded} units · {request.interestCount ?? 0} interested
        </span>
        <span>{formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}</span>
      </div>
    </Link>
  );
}

function RequestsTab() {
  const [bloodGroup, setBloodGroup] = useState<BloodGroup | null>(null);

  const resultsQuery = useInfiniteQuery({
    queryKey: ["blood-requests", "list", bloodGroup],
    queryFn: ({ pageParam }) =>
      bloodDonationApi.listRequests({ bloodGroup: bloodGroup ?? undefined, cursor: pageParam }),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => last.nextCursor,
  });

  const requests = resultsQuery.data?.pages.flatMap((p) => p.items) ?? [];

  return (
    <div>
      <div className="mb-3">
        <FilterChips options={GROUP_OPTIONS} value={bloodGroup} onChange={setBloodGroup} allLabel="All" />
      </div>

      {resultsQuery.isLoading && <p className="py-12 text-center text-sm text-ink-500">Loading…</p>}

      {!resultsQuery.isLoading && requests.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-12 text-center">
          <Droplets size={28} className="text-ink-500" aria-hidden="true" />
          <p className="text-sm text-ink-500">No open requests right now.</p>
        </div>
      )}

      <div className="space-y-2 pb-6">
        {requests.map((request) => (
          <RequestRow key={request._id} request={request} />
        ))}

        {resultsQuery.hasNextPage && (
          <button
            type="button"
            onClick={() => resultsQuery.fetchNextPage()}
            disabled={resultsQuery.isFetchingNextPage}
            className="tap-target w-full rounded-[var(--radius-pill)] bg-surface-60 text-sm font-medium text-ink-700"
          >
            {resultsQuery.isFetchingNextPage ? "Loading…" : "Load more"}
          </button>
        )}
      </div>
    </div>
  );
}

function DonorsTab() {
  const [bloodGroup, setBloodGroup] = useState<BloodGroup | null>(null);

  const resultsQuery = useInfiniteQuery({
    queryKey: ["blood-donors", "list", bloodGroup],
    queryFn: ({ pageParam }) =>
      bloodDonationApi.listDonors({ bloodGroup: bloodGroup ?? undefined, cursor: pageParam }),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => last.nextCursor,
  });

  const donors = resultsQuery.data?.pages.flatMap((p) => p.items) ?? [];

  return (
    <div>
      <div className="mb-3">
        <FilterChips options={GROUP_OPTIONS} value={bloodGroup} onChange={setBloodGroup} allLabel="All" />
      </div>

      {resultsQuery.isLoading && <p className="py-12 text-center text-sm text-ink-500">Loading…</p>}

      {!resultsQuery.isLoading && donors.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-12 text-center">
          <Users size={28} className="text-ink-500" aria-hidden="true" />
          <p className="text-sm text-ink-500">No available donors for this group yet.</p>
        </div>
      )}

      <div className="space-y-2 pb-6">
        {donors.map((donor) => (
          <div key={donor._id} className="glass-panel flex items-center gap-3 p-3">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-primary-50">
              {donor.avatarUrl ? <PhotoSlot alt="" src={donor.avatarUrl} /> : <AvatarPlaceholder />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{donor.name ?? "Anonymous"}</p>
              <TierBadge totalDonations={donor.bloodDonor.totalDonations} />
            </div>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-coral-50 text-sm font-bold text-coral-600">
              {donor.bloodGroup}
            </span>
          </div>
        ))}

        {resultsQuery.hasNextPage && (
          <button
            type="button"
            onClick={() => resultsQuery.fetchNextPage()}
            disabled={resultsQuery.isFetchingNextPage}
            className="tap-target w-full rounded-[var(--radius-pill)] bg-surface-60 text-sm font-medium text-ink-700"
          >
            {resultsQuery.isFetchingNextPage ? "Loading…" : "Load more"}
          </button>
        )}
      </div>
    </div>
  );
}

function LeaderboardTab() {
  const { user } = useAuth();

  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ["blood-donors", "leaderboard"],
    queryFn: bloodDonationApi.getLeaderboard,
  });

  return (
    <div>
      {isLoading && <p className="py-12 text-center text-sm text-ink-500">Loading…</p>}

      {!isLoading && leaderboard?.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-12 text-center">
          <Trophy size={28} className="text-ink-500" aria-hidden="true" />
          <p className="text-sm text-ink-500">No confirmed donations yet — be the first.</p>
        </div>
      )}

      <div className="space-y-2 pb-6">
        {leaderboard?.map((donor, i) => {
          const rank = i + 1;
          const isMe = donor._id === user?._id;
          return (
            <div
              key={donor._id}
              className={`glass-panel flex items-center gap-3 p-3 ${isMe ? "ring-2 ring-primary-600/40" : ""}`}
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  RANK_STYLES[rank] ?? "bg-surface-70 text-ink-700"
                }`}
              >
                {rank}
              </span>
              <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-primary-50">
                {donor.avatarUrl ? <PhotoSlot alt="" src={donor.avatarUrl} /> : <AvatarPlaceholder />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">
                  {donor.name ?? "Anonymous"} {isMe && <span className="text-primary-700">(You)</span>}
                </p>
                <TierBadge totalDonations={donor.bloodDonor.totalDonations} />
              </div>
              <div className="shrink-0 text-right">
                <p className="text-lg font-extrabold text-coral-600">{donor.bloodDonor.points}</p>
                <p className="text-[11px] text-ink-500">points</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
