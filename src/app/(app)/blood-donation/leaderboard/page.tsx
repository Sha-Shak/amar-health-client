"use client";

import { TierBadge } from "@/components/blood-donation/tier-badge";
import { AvatarPlaceholder } from "@/components/ui/avatar-placeholder";
import { PhotoSlot } from "@/components/ui/photo-slot";
import { bloodDonationApi } from "@/features/blood-donation/api";
import { useAuth } from "@/components/providers/auth-provider";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, Trophy } from "lucide-react";
import { useRouter } from "next/navigation";

const RANK_STYLES: Record<number, string> = {
  1: "bg-amber-400 text-amber-950",
  2: "bg-zinc-300 text-zinc-900",
  3: "bg-amber-700 text-amber-50",
};

export default function BloodLeaderboardPage() {
  const router = useRouter();
  const { user } = useAuth();

  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ["blood-donors", "leaderboard"],
    queryFn: bloodDonationApi.getLeaderboard,
  });

  return (
    <div className="mx-auto w-full max-w-sm px-5 pt-8">
      <div className="mb-1 flex items-center gap-2">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Go back"
          className="tap-target -ml-2 rounded-full text-ink-700"
        >
          <ChevronLeft size={22} aria-hidden="true" />
        </button>
        <h1 className="text-2xl font-bold">Leaderboard</h1>
      </div>
      <p className="mb-6 text-sm text-ink-700">Top donors, ranked by confirmed donations.</p>

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
                  RANK_STYLES[rank] ?? "bg-white/70 text-ink-700"
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
