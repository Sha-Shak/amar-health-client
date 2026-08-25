"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { authApi } from "@/features/auth/api";
import { errorMessage } from "@/lib/error-message";
import { useMutation } from "@tanstack/react-query";
import { ChevronLeft, TriangleAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const CONFIRM_PHRASE = "DELETE";

export default function DeleteAccountPage() {
  const router = useRouter();
  const { logout } = useAuth();
  const [confirmText, setConfirmText] = useState("");

  const deleteMutation = useMutation({
    mutationFn: authApi.requestDeletion,
    onSuccess: () => {
      logout();
      router.replace("/signup");
    },
  });

  const canDelete = confirmText === CONFIRM_PHRASE;

  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col px-6 py-6">
      <button
        type="button"
        onClick={() => router.back()}
        aria-label="Go back"
        className="tap-target -ml-2 mb-2 self-start rounded-full text-ink-700"
      >
        <ChevronLeft size={22} aria-hidden="true" />
      </button>

      <div className="glass-panel-strong flex flex-col items-center gap-3 border-coral-500/40 bg-coral-50/70 p-6 text-center">
        <TriangleAlert size={28} className="text-coral-600" aria-hidden="true" />
        <h1 className="text-xl font-bold text-coral-900">Delete your account</h1>
        <p className="text-sm text-coral-900/80">
          This deactivates your account and cancels any upcoming bookings. Your vault
          documents and reminders stop being accessible. This can&apos;t be undone from the
          app — contact support if you change your mind.
        </p>
      </div>

      <div className="mt-6 space-y-4">
        <TextField
          label={`Type "${CONFIRM_PHRASE}" to confirm`}
          name="confirm"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          autoComplete="off"
        />

        {deleteMutation.isError && (
          <p className="text-sm text-coral-600">{errorMessage(deleteMutation.error)}</p>
        )}

        <Button
          className="w-full !bg-coral-600"
          disabled={!canDelete || deleteMutation.isPending}
          onClick={() => deleteMutation.mutate()}
        >
          {deleteMutation.isPending ? "Deleting…" : "Permanently delete my account"}
        </Button>
      </div>
    </div>
  );
}
