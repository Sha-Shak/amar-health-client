"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { FamilyMemberRow } from "@/components/family/family-member-row";
import { Button } from "@/components/ui/button";
import { PhotoSlot } from "@/components/ui/photo-slot";
import { photos } from "@/config/photos";
import { familyApi } from "@/features/family/api";
import { errorMessage } from "@/lib/error-message";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

export default function FamilyPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [removingId, setRemovingId] = useState<string | null>(null);

  const { data: myGroup, isLoading } = useQuery({
    queryKey: ["family", "me"],
    queryFn: familyApi.getMyGroup,
  });

  const createMutation = useMutation({
    mutationFn: familyApi.createGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["family", "me"] });
      toast.success("Family group created");
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  const removeMutation = useMutation({
    mutationFn: (memberId: string) => familyApi.removeMember(memberId),
    onMutate: (memberId) => setRemovingId(memberId),
    onSuccess: (_data, memberId) => {
      const isSelf = myGroup?.members.find((m) => m._id === memberId)?.userId._id === user?._id;
      queryClient.invalidateQueries({ queryKey: ["family", "me"] });
      toast.success(isSelf ? "You left the family group" : "Member removed");
    },
    onError: (err) => toast.error(errorMessage(err)),
    onSettled: () => setRemovingId(null),
  });

  const leaveMutation = useMutation({
    mutationFn: familyApi.leaveGroup,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["family", "me"] });
      toast.success(result.groupDeleted ? "Family group deleted — everyone's free to join another" : "You left the family group");
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  function handleLeave() {
    const message = myGroup?.isOwner
      ? "You created this group — leaving will delete it for everyone. Continue?"
      : "Leave this family group?";
    if (window.confirm(message)) leaveMutation.mutate();
  }

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-sm px-5 pt-8">
        <div className="h-56 animate-pulse rounded-[var(--radius-card)] bg-black/5" />
      </div>
    );
  }

  if (!myGroup) {
    return (
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col px-5 pt-8">
        <h1 className="mb-4 text-2xl font-bold">Family</h1>
        <div className="relative h-48 overflow-hidden rounded-[var(--radius-card)]">
          <PhotoSlot alt="" src={photos.tiles.family} sizes="384px" />
          <div className="photo-scrim absolute inset-0 rounded-[var(--radius-card)]" />
          <div
            className="absolute inset-0 flex flex-col justify-end p-4 text-white"
            style={{ filter: "drop-shadow(0 1px 4px rgb(0 0 0 / 0.55))" }}
          >
            <Users size={28} strokeWidth={1.6} className="mb-2" aria-hidden="true" />
            <p className="font-semibold">Keep your family&apos;s health organized together</p>
          </div>
        </div>
        <p className="mt-4 text-sm text-ink-700">
          Create a family group to invite relatives and keep everyone&apos;s records and
          reminders connected.
        </p>
        <Button
          className="mt-5 w-full"
          disabled={createMutation.isPending}
          onClick={() => createMutation.mutate()}
        >
          {createMutation.isPending ? "Creating…" : "Create a family group"}
        </Button>
      </div>
    );
  }

  const selfMember = myGroup.members.find((m) => m.userId._id === user?._id);

  return (
    <div className="mx-auto w-full max-w-sm px-5 pt-8">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Family</h1>
        {myGroup.isOwner && (
          <Link
            href="/family/invite"
            aria-label="Invite family member"
            className="tap-target flex items-center gap-1.5 rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white"
          >
            <Plus size={16} aria-hidden="true" />
            Invite
          </Link>
        )}
      </div>

      <div className="space-y-2 pb-6">
        {myGroup.owner && (
          <FamilyMemberRow
            name={myGroup.isOwner ? `${myGroup.owner.name ?? "You"} (You)` : myGroup.owner.name ?? "Owner"}
            avatarUrl={myGroup.owner.avatarUrl}
            phone={myGroup.owner.phone}
            email={myGroup.owner.email}
            badge="Owner"
          />
        )}

        {myGroup.members.map((member) => {
          const isSelf = member.userId._id === user?._id;
          return (
            <FamilyMemberRow
              key={member._id}
              name={isSelf ? `${member.userId.name ?? "You"} (You)` : member.userId.name ?? "Member"}
              avatarUrl={member.userId.avatarUrl}
              phone={member.userId.phone}
              email={member.userId.email}
              badge="Member"
              onRemove={
                myGroup.isOwner && !isSelf ? () => removeMutation.mutate(member._id) : undefined
              }
              removing={removingId === member._id && removeMutation.isPending}
            />
          );
        })}
      </div>

      {myGroup.isOwner && myGroup.pendingInvites.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-2 text-sm font-semibold text-ink-700">Pending invites</h2>
          <div className="space-y-2">
            {myGroup.pendingInvites.map((invite) => (
              <FamilyMemberRow
                key={invite._id}
                name={invite.userId.name ?? "Invited"}
                avatarUrl={invite.userId.avatarUrl}
                phone={invite.userId.phone}
                email={invite.userId.email}
                badge="Pending"
              />
            ))}
          </div>
        </div>
      )}

      {(myGroup.isOwner || selfMember) && (
        <button
          type="button"
          onClick={handleLeave}
          disabled={leaveMutation.isPending}
          className="tap-target mb-6 w-full rounded-[var(--radius-pill)] border border-coral-200 py-3 text-sm font-semibold text-coral-600 disabled:opacity-50"
        >
          {leaveMutation.isPending
            ? "Leaving…"
            : myGroup.isOwner
              ? "Delete family group"
              : "Leave family group"}
        </button>
      )}
    </div>
  );
}
