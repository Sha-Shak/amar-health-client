"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type BrightnessStatus = "checking" | "too-dark" | "ok";

const SAMPLE_INTERVAL_MS = 500;
const DARK_THRESHOLD = 60; // 0-255 average luminance
const SAMPLE_SIZE = 120; // small downsample — this only needs a rough average

// Cheap, dependency-free "is the frame too dark" check — plain Canvas 2D pixel
// sampling, nothing more. This replaced a live OpenCV.js contour-detection loop
// that ran every 350ms; that loop was the actual source of the camera-freeze/
// crash bug (WASM Mat objects leaking off the JS-visible heap on every tick).
// Brightness sampling alone is cheap enough to keep running live without that
// risk, so the capture screen still gives real-time lighting feedback even
// though document-edge detection is now a manual, post-capture step.
export function useBrightness(videoRef: React.RefObject<HTMLVideoElement | null>) {
  const [status, setStatus] = useState<BrightnessStatus>("checking");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const sample = useCallback(() => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return;

    if (!canvasRef.current) canvasRef.current = document.createElement("canvas");
    const canvas = canvasRef.current;
    canvas.width = SAMPLE_SIZE;
    canvas.height = SAMPLE_SIZE;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
    const { data } = ctx.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE);

    let total = 0;
    let count = 0;
    for (let i = 0; i < data.length; i += 40) {
      total += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      count++;
    }
    const brightness = count ? total / count : 255;
    setStatus(brightness < DARK_THRESHOLD ? "too-dark" : "ok");
  }, [videoRef]);

  useEffect(() => {
    const timer = setInterval(sample, SAMPLE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [sample]);

  return status;
}
