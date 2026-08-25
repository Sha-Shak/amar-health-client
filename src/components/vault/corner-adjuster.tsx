"use client";

import type { CornerPoints } from "@/lib/document-scanner/types";
import { useRef, useState } from "react";

type HandleKey = keyof CornerPoints;
const HANDLES: HandleKey[] = [
  "topLeftCorner",
  "topRightCorner",
  "bottomRightCorner",
  "bottomLeftCorner",
];

// Draggable-quad corner adjustment over the captured photo. Coordinates are in
// the image's natural pixel space throughout — the SVG's viewBox matches
// naturalWidth/naturalHeight exactly, so screen<->image coordinate conversion
// is just the SVG CTM, not manual math.
export function CornerAdjuster({
  imageUrl,
  naturalWidth,
  naturalHeight,
  corners,
  onChange,
}: {
  imageUrl: string;
  naturalWidth: number;
  naturalHeight: number;
  corners: CornerPoints;
  onChange: (corners: CornerPoints) => void;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragging, setDragging] = useState<HandleKey | null>(null);

  function toSvgPoint(clientX: number, clientY: number) {
    const svg = svgRef.current;
    if (!svg) return null;
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return null;
    return pt.matrixTransform(ctm.inverse());
  }

  function handlePointerDown(key: HandleKey) {
    return (e: React.PointerEvent) => {
      e.preventDefault();
      (e.target as Element).setPointerCapture(e.pointerId);
      setDragging(key);
    };
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!dragging) return;
    const p = toSvgPoint(e.clientX, e.clientY);
    if (!p) return;
    onChange({
      ...corners,
      [dragging]: {
        x: Math.min(Math.max(p.x, 0), naturalWidth),
        y: Math.min(Math.max(p.y, 0), naturalHeight),
      },
    });
  }

  const path = `M ${corners.topLeftCorner.x},${corners.topLeftCorner.y}
    L ${corners.topRightCorner.x},${corners.topRightCorner.y}
    L ${corners.bottomRightCorner.x},${corners.bottomRightCorner.y}
    L ${corners.bottomLeftCorner.x},${corners.bottomLeftCorner.y} Z`;

  return (
    <div
      className="relative mx-auto w-full max-w-md select-none"
      style={{ aspectRatio: `${naturalWidth} / ${naturalHeight}` }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={imageUrl} alt="Captured document" className="absolute inset-0 h-full w-full" />
      <svg
        ref={svgRef}
        viewBox={`0 0 ${naturalWidth} ${naturalHeight}`}
        className="absolute inset-0 h-full w-full touch-none"
        onPointerMove={handlePointerMove}
        onPointerUp={() => setDragging(null)}
      >
        <path d={path} fill="rgb(13 148 136 / 0.25)" stroke="#0d9488" strokeWidth={naturalWidth / 180} />
        {HANDLES.map((key) => (
          <circle
            key={key}
            cx={corners[key].x}
            cy={corners[key].y}
            r={naturalWidth / 45}
            fill="white"
            stroke="#0d9488"
            strokeWidth={naturalWidth / 220}
            onPointerDown={handlePointerDown(key)}
            style={{ cursor: "grab" }}
          />
        ))}
      </svg>
    </div>
  );
}
