"use client";

import { useBrightness } from "@/lib/document-scanner/use-brightness";
import type { CornerPoints } from "@/lib/document-scanner/types";
import { ImageIcon, SunDim, X } from "lucide-react";
import { useRef, useState } from "react";
import Webcam from "react-webcam";

const STATUS_COPY: Record<string, { label: string; color: string }> = {
  checking: { label: "Line up the document inside the frame", color: "white" },
  ok: { label: "Line up the document inside the frame", color: "white" },
  "too-dark": { label: "Too dark — find better light", color: "#ff6b5b" },
};

export function CaptureCamera({
  onCapture,
  onClose,
  onUploadInstead,
}: {
  onCapture: (dataUrl: string, corners: CornerPoints | null, width: number, height: number) => void;
  onClose: () => void;
  onUploadInstead: (file: File) => void;
}) {
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const [cameraError, setCameraError] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const brightness = useBrightness(videoRef);
  const copy = STATUS_COPY[brightness];

  function handleCapture() {
    const webcam = webcamRef.current;
    if (!webcam || !dimensions) return;
    const dataUrl = webcam.getScreenshot({ width: dimensions.width, height: dimensions.height });
    // Corner detection is now a manual step on the next screen (no live
    // auto-detected quad), so this is always null — kept in the callback
    // signature so the caller's defaultCorners() fallback path is the only path.
    if (dataUrl) onCapture(dataUrl, null, dimensions.width, dimensions.height);
  }

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {!cameraError ? (
        <div
          className="absolute left-1/2 top-1/2 w-full max-h-full -translate-x-1/2 -translate-y-1/2"
          style={dimensions ? { aspectRatio: `${dimensions.width} / ${dimensions.height}` } : undefined}
        >
          <Webcam
            ref={(el) => {
              webcamRef.current = el;
              videoRef.current = el?.video ?? null;
            }}
            audio={false}
            screenshotFormat="image/jpeg"
            screenshotQuality={0.95}
            videoConstraints={{ facingMode: "environment" }}
            className="h-full w-full object-contain"
            onUserMedia={(stream) => {
              const track = stream.getVideoTracks()[0];
              const settings = track?.getSettings();
              if (settings?.width && settings.height) {
                setDimensions({ width: settings.width, height: settings.height });
              }
            }}
            onUserMediaError={() => setCameraError(true)}
          />

          {dimensions && (
            <svg
              viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
              className="pointer-events-none absolute inset-0 h-full w-full"
            >
              <FrameBrackets width={dimensions.width} height={dimensions.height} color={copy.color} />
            </svg>
          )}
        </div>
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center text-white">
          <SunDim size={32} aria-hidden="true" />
          <p className="font-medium">Camera unavailable</p>
          <p className="text-sm text-white/70">
            We couldn&apos;t access your camera. Upload a photo instead.
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={onClose}
        aria-label="Close camera"
        className="glass-on-photo tap-target absolute right-4 top-[max(1rem,env(safe-area-inset-top))] rounded-full"
      >
        <X size={20} aria-hidden="true" />
      </button>

      {!cameraError && (
        <div
          className="glass-on-photo absolute left-1/2 top-[max(1rem,env(safe-area-inset-top))] -translate-x-1/2 rounded-[var(--radius-pill)] px-4 py-2 text-sm font-medium"
          style={{ color: copy.color }}
        >
          {copy.label}
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-8 p-8 pb-[max(2rem,env(safe-area-inset-bottom))]">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          aria-label="Upload from gallery"
          className="tap-target glass-on-photo rounded-full"
        >
          <ImageIcon size={20} aria-hidden="true" />
        </button>

        {!cameraError && (
          <button
            type="button"
            onClick={handleCapture}
            disabled={!dimensions}
            aria-label="Capture photo"
            className="h-16 w-16 rounded-full border-4 border-white bg-white/30 disabled:opacity-50"
          />
        )}

        <span className="w-11" aria-hidden="true" />
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onUploadInstead(file);
        }}
      />
    </div>
  );
}

function FrameBrackets({ width, height, color }: { width: number; height: number; color: string }) {
  const m = Math.min(width, height) * 0.08; // margin
  const len = Math.min(width, height) * 0.12; // bracket arm length
  const corners = [
    { x: m, y: m, dx: 1, dy: 1 },
    { x: width - m, y: m, dx: -1, dy: 1 },
    { x: m, y: height - m, dx: 1, dy: -1 },
    { x: width - m, y: height - m, dx: -1, dy: -1 },
  ];
  return (
    <>
      {corners.map((c, i) => (
        <path
          key={i}
          d={`M ${c.x},${c.y + len * c.dy} L ${c.x},${c.y} L ${c.x + len * c.dx},${c.y}`}
          fill="none"
          stroke={color}
          strokeWidth={width / 130}
          strokeLinecap="round"
        />
      ))}
    </>
  );
}
