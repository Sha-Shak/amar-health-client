"use client";

import { CaptureCamera } from "@/components/vault/capture-camera";
import { CornerAdjuster } from "@/components/vault/corner-adjuster";
import { TagForm, type TagFormValues } from "@/components/vault/tag-form";
import { Button } from "@/components/ui/button";
import { defaultCorners, extractDocument } from "@/lib/document-scanner/extract-document";
import type { CornerPoints } from "@/lib/document-scanner/types";
import { vaultApi, uploadDocumentFile } from "@/features/vault/api";
import { useAuth } from "@/components/providers/auth-provider";
import { withTimeout } from "@/lib/with-timeout";
import { useMutation } from "@tanstack/react-query";
import imageCompression from "browser-image-compression";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type Step =
  | { name: "capture" }
  | {
      name: "adjust";
      blob: Blob;
      imageUrl: string;
      naturalWidth: number;
      naturalHeight: number;
      corners: CornerPoints;
    }
  | { name: "tag"; thumbnailUrl: string; blob: Blob };

async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const res = await fetch(dataUrl);
  return res.blob();
}

export default function AddDocumentPage() {
  const router = useRouter();
  const { hasToken } = useAuth();
  const [step, setStep] = useState<Step>({ name: "capture" });
  const [extracting, setExtracting] = useState(false);

  useEffect(() => {
    if (!hasToken) router.replace("/signup");
  }, [hasToken, router]);

  const saveMutation = useMutation({
    mutationFn: async (values: TagFormValues) => {
      if (step.name !== "tag") throw new Error("Nothing to save");
      const compressed = await imageCompression(
        new File([step.blob], "document.jpg", { type: "image/jpeg" }),
        { maxSizeMB: 1, maxWidthOrHeight: 2000, useWebWorker: true }
      );
      const { uploadUrl, fileKey } = await vaultApi.requestPresignedUrl("image/jpeg");
      await uploadDocumentFile(uploadUrl, compressed, "image/jpeg");
      return vaultApi.createDocument({
        fileKey,
        type: values.type,
        tag: values.tag || undefined,
        doctorName: values.doctorName || undefined,
        placeOfTest: values.placeOfTest || undefined,
        note: values.note || undefined,
        documentDate: values.documentDate || undefined,
      });
    },
    onSuccess: (doc) => {
      toast.success("Saved to your vault");
      router.replace(`/vault/documents/${doc._id}`);
    },
    onError: () => toast.error("Couldn't save that document — try again"),
  });

  async function handleCaptured(
    dataUrl: string,
    corners: CornerPoints | null,
    width: number,
    height: number
  ) {
    const blob = await dataUrlToBlob(dataUrl);
    setStep({
      name: "adjust",
      blob,
      imageUrl: URL.createObjectURL(blob),
      naturalWidth: width,
      naturalHeight: height,
      corners: corners ?? defaultCorners(width, height),
    });
  }

  async function handleFileChosen(file: File) {
    try {
      const bitmap = await withTimeout(createImageBitmap(file), 15_000, "Couldn't read that image");
      const { width, height } = bitmap;
      bitmap.close();
      setStep({
        name: "adjust",
        blob: file,
        imageUrl: URL.createObjectURL(file),
        naturalWidth: width,
        naturalHeight: height,
        corners: defaultCorners(width, height),
      });
    } catch {
      toast.error("Couldn't read that image — try a different photo");
    }
  }

  async function handleConfirmAdjust() {
    if (step.name !== "adjust") return;
    setExtracting(true);
    try {
      const blob = await withTimeout(
        extractDocument(step.blob, step.corners),
        15_000,
        "Processing took too long"
      );
      setStep({ name: "tag", thumbnailUrl: URL.createObjectURL(blob), blob });
    } catch {
      toast.error("Couldn't process that photo — try adjusting the corners or retake it");
    } finally {
      setExtracting(false);
    }
  }

  if (step.name === "capture") {
    return (
      <CaptureCamera
        onCapture={handleCaptured}
        onUploadInstead={handleFileChosen}
        onClose={() => router.back()}
      />
    );
  }

  if (step.name === "adjust") {
    return (
      <div className="flex min-h-dvh flex-col bg-ink-900 text-white">
        <div className="flex items-center gap-3 p-4">
          <button
            type="button"
            onClick={() => setStep({ name: "capture" })}
            aria-label="Retake photo"
            className="tap-target -ml-2 rounded-full"
          >
            <ChevronLeft size={22} aria-hidden="true" />
          </button>
          <p className="font-medium">Adjust the corners</p>
        </div>

        <div className="flex flex-1 items-center justify-center px-4">
          <CornerAdjuster
            imageUrl={step.imageUrl}
            naturalWidth={step.naturalWidth}
            naturalHeight={step.naturalHeight}
            corners={step.corners}
            onChange={(corners) => setStep({ ...step, corners })}
          />
        </div>

        <div className="p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <Button className="w-full" onClick={handleConfirmAdjust} disabled={extracting}>
            {extracting ? "Processing…" : "Use Photo"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <TagForm
      thumbnailUrl={step.thumbnailUrl}
      isSaving={saveMutation.isPending}
      error={saveMutation.isError ? "Couldn't save — check your connection and try again" : undefined}
      onSubmit={(values) => saveMutation.mutate(values)}
    />
  );
}
