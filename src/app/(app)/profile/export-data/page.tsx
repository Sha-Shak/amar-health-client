"use client";

import { Button } from "@/components/ui/button";
import { authApi } from "@/features/auth/api";
import { errorMessage } from "@/lib/error-message";
import { useMutation } from "@tanstack/react-query";
import { ChevronLeft, Download } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ExportDataPage() {
  const router = useRouter();

  const exportMutation = useMutation({
    mutationFn: authApi.exportData,
    onSuccess: (data) => {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `smart-health-vault-export-${data.generatedAt.slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    },
  });

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
      <h1 className="mb-2 text-2xl font-bold">Export my data</h1>
      <p className="mb-6 text-ink-700">
        Download a copy of your profile, vault documents, reminders, and bookings as a JSON file.
      </p>

      <div className="glass-panel flex flex-col items-center gap-4 p-8 text-center">
        <span className="tap-target rounded-full bg-primary-50 text-primary-700">
          <Download size={24} aria-hidden="true" />
        </span>
        <p className="text-sm text-ink-500">
          This creates a file you can save or share — it doesn&apos;t change or delete anything
          in your account.
        </p>
        {exportMutation.isError && (
          <p className="text-sm text-coral-600">{errorMessage(exportMutation.error)}</p>
        )}
        {exportMutation.isSuccess && (
          <p className="text-sm font-medium text-primary-700">Your download has started.</p>
        )}
        <Button
          className="w-full"
          disabled={exportMutation.isPending}
          onClick={() => exportMutation.mutate()}
        >
          {exportMutation.isPending ? "Preparing…" : "Download my data"}
        </Button>
      </div>
    </div>
  );
}
