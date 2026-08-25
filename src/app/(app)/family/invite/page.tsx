"use client";

import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { familyApi } from "@/features/family/api";
import { errorMessage } from "@/lib/error-message";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function InviteFamilyMemberPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [phoneOrEmail, setPhoneOrEmail] = useState("");

  const mutation = useMutation({
    mutationFn: () => familyApi.invite(phoneOrEmail),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["family", "me"] });
      toast.success("Invitation sent");
      router.replace("/family");
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    mutation.mutate();
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col px-6 py-6">
      <button
        type="button"
        onClick={() => router.back()}
        aria-label="Go back"
        className="tap-target -ml-2 mb-4 self-start rounded-full text-ink-700"
      >
        <ChevronLeft size={22} aria-hidden="true" />
      </button>

      <h1 className="mb-1 text-2xl font-bold">Invite a family member</h1>
      <p className="mb-6 text-ink-700">
        They&apos;ll need an existing Smart Health Vault account to accept.
      </p>

      <form onSubmit={handleSubmit} className="glass-panel space-y-5 p-6">
        <TextField
          label="Phone number or email"
          name="phoneOrEmail"
          autoComplete="off"
          autoFocus
          required
          value={phoneOrEmail}
          onChange={(e) => setPhoneOrEmail(e.target.value)}
          error={mutation.isError ? errorMessage(mutation.error) : undefined}
        />
        <Button type="submit" className="w-full" disabled={mutation.isPending}>
          {mutation.isPending ? "Sending invite…" : "Send invite"}
        </Button>
      </form>
    </div>
  );
}
