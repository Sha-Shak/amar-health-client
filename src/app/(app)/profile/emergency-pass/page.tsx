"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { authApi } from "@/features/auth/api";
import { saveEmergencyPass } from "@/lib/emergency-pass-store";
import { errorMessage } from "@/lib/error-message";
import { useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { ChevronLeft, Copy, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { toast } from "sonner";

export default function EmergencyPassSettingsPage() {
  const router = useRouter();
  const { user, refetch } = useAuth();
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [confirmingRegenerate, setConfirmingRegenerate] = useState(false);

  const shareToken = user?.emergencyPass?.shareToken;
  const shareUrl =
    shareToken && typeof window !== "undefined"
      ? `${window.location.origin}/emergency-pass/${shareToken}`
      : null;

  useEffect(() => {
    if (!shareUrl) return;
    let cancelled = false;
    QRCode.toDataURL(shareUrl, { margin: 1, width: 240 })
      .then((url) => {
        if (!cancelled) setQrDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setQrDataUrl(null);
      });
    return () => {
      cancelled = true;
    };
  }, [shareUrl]);

  const generateMutation = useMutation({
    mutationFn: authApi.generateEmergencyPass,
    onSuccess: async (pass) => {
      // Written straight to IndexedDB, not the normal query cache — this is the
      // one local write that has to survive being read with zero network later
      // (§6/Design System §6), which the TanStack Query cache alone can't promise.
      await saveEmergencyPass({
        shareToken: pass.shareToken,
        name: user?.name,
        bloodGroup: user?.bloodGroup,
        allergies: user?.allergies,
        medicalConditions: user?.medicalConditions,
        emergencyContact: user?.emergencyContact,
        generatedAt: pass.generatedAt,
      });
      refetch();
      setConfirmingRegenerate(false);
      toast.success("Emergency pass ready");
    },
    onError: () => toast.error("Couldn't generate your pass — try again"),
  });

  if (!user) return null;

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
      <h1 className="mb-1 text-2xl font-bold">Emergency Health Pass</h1>
      <p className="mb-6 text-ink-700">
        A QR code a first responder or new doctor can scan to see your blood group, allergies,
        conditions, and emergency contact — nothing else from your account.
      </p>

      {!shareToken ? (
        <div className="glass-panel flex flex-col items-center gap-4 p-8 text-center">
          <span className="tap-target rounded-full bg-primary-50 text-primary-700">
            <ShieldAlert size={24} aria-hidden="true" />
          </span>
          <p className="text-sm text-ink-500">You haven&apos;t created one yet.</p>
          {generateMutation.isError && (
            <p className="text-sm text-coral-600">{errorMessage(generateMutation.error)}</p>
          )}
          <Button
            className="w-full"
            disabled={generateMutation.isPending}
            onClick={() => generateMutation.mutate()}
          >
            {generateMutation.isPending ? "Generating…" : "Generate my pass"}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="glass-panel flex flex-col items-center gap-4 p-6">
            {qrDataUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qrDataUrl} alt="Emergency pass QR code" className="h-48 w-48" />
            )}
            <p className="break-all text-center text-xs text-ink-500">{shareUrl}</p>
            <button
              type="button"
              onClick={() => {
                if (shareUrl) navigator.clipboard.writeText(shareUrl);
                toast.success("Link copied");
              }}
              className="tap-target flex items-center gap-2 rounded-[var(--radius-pill)] bg-primary-50 px-4 py-2 text-sm font-medium text-primary-700"
            >
              <Copy size={14} aria-hidden="true" /> Copy link
            </button>
            {user.emergencyPass?.generatedAt && (
              <p className="text-xs text-ink-500">
                Generated {format(new Date(user.emergencyPass.generatedAt), "MMM d, yyyy")}
              </p>
            )}
          </div>

          {!confirmingRegenerate ? (
            <button
              type="button"
              onClick={() => setConfirmingRegenerate(true)}
              className="tap-target w-full text-center text-sm font-medium text-coral-600"
            >
              Regenerate pass
            </button>
          ) : (
            <div className="glass-panel space-y-3 p-4 text-center">
              <p className="text-sm font-medium">
                This invalidates the QR code above immediately — anyone who scanned it before
                won&apos;t see your info anymore. Only do this if your profile changed or the
                old code was compromised.
              </p>
              <div className="flex gap-3">
                <Button variant="glass" className="flex-1" onClick={() => setConfirmingRegenerate(false)}>
                  Cancel
                </Button>
                <Button
                  className="flex-1 !bg-coral-600"
                  disabled={generateMutation.isPending}
                  onClick={() => generateMutation.mutate()}
                >
                  {generateMutation.isPending ? "Regenerating…" : "Regenerate"}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
