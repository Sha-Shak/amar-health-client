"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { AvatarPlaceholder } from "@/components/ui/avatar-placeholder";
import { Button } from "@/components/ui/button";
import { familyApi } from "@/features/family/api";
import { errorMessage } from "@/lib/error-message";
import { useMutation, useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export default function FamilyInvitationPage() {
  const router = useRouter();
  const token = useParams<{ token: string }>().token;
  const { hasToken } = useAuth();

  const { data: context, isLoading, isError, error } = useQuery({
    queryKey: ["family", "invitation", token],
    queryFn: () => familyApi.getInvitationContext(token),
    retry: false,
  });

  const acceptMutation = useMutation({
    mutationFn: () => familyApi.acceptInvitation(token),
    onSuccess: () => router.replace("/family"),
  });

  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-6 py-10">
      <div className="glass-panel space-y-5 p-6 text-center">
        {isLoading && <p className="py-6 text-sm text-ink-500">Loading invitation…</p>}

        {isError && (
          <p className="py-6 text-sm text-coral-600">{errorMessage(error)}</p>
        )}

        {context && (
          <>
            <div className="relative mx-auto h-16 w-16 overflow-hidden rounded-full">
              {context.owner?.avatarUrl ? (
                <Image src={context.owner.avatarUrl} alt="" fill sizes="64px" className="object-cover" />
              ) : (
                <AvatarPlaceholder />
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold">
                {context.owner?.name ?? "Someone"} invited you to their family group
              </h1>
              <p className="mt-1 text-sm text-ink-500">
                Expires {format(new Date(context.expiresAt), "MMM d, yyyy")}
              </p>
            </div>

            {hasToken ? (
              <>
                {acceptMutation.isError && (
                  <p className="text-sm text-coral-600">{errorMessage(acceptMutation.error)}</p>
                )}
                <Button
                  className="w-full"
                  disabled={acceptMutation.isPending}
                  onClick={() => acceptMutation.mutate()}
                >
                  {acceptMutation.isPending ? "Joining…" : "Accept invitation"}
                </Button>
              </>
            ) : (
              <>
                <p className="text-sm text-ink-700">Log in to accept this invitation.</p>
                <Link href="/login">
                  <Button className="w-full">Log in</Button>
                </Link>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
