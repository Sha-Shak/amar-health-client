"use client";

import { useEffect, useRef, useState } from "react";

const SWIPE_THRESHOLD_PX = 40;

// Shared pointer-drag + auto-advance mechanics behind both HomeCarousel (the
// hero) and the home widget carousel — swipe left/right to change slides,
// small movements fall through to a tap, and the auto-advance timer restarts
// on any index change (manual or automatic) so a swipe never gets
// immediately overridden by a stale timer.
export function useSwipeableCarousel(count: number, intervalMs: number, onTap: (index: number) => void) {
  const [index, setIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const dragStartX = useRef<number | null>(null);
  const dragDeltaX = useRef(0);

  useEffect(() => {
    if (count <= 1) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % count), intervalMs);
    return () => clearInterval(timer);
  }, [count, intervalMs, index]);

  function goTo(delta: number) {
    setIndex((i) => (i + delta + count) % count);
  }

  function onPointerDown(e: React.PointerEvent) {
    dragStartX.current = e.clientX;
    dragDeltaX.current = 0;
    (e.target as Element).setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (dragStartX.current === null) return;
    dragDeltaX.current = e.clientX - dragStartX.current;
    setDragOffset(dragDeltaX.current);
  }

  function onPointerUp() {
    const delta = dragDeltaX.current;
    dragStartX.current = null;
    setDragOffset(0);

    if (Math.abs(delta) > SWIPE_THRESHOLD_PX) {
      goTo(delta < 0 ? 1 : -1);
      return;
    }
    onTap(index);
  }

  function onPointerCancel() {
    dragStartX.current = null;
    setDragOffset(0);
  }

  return {
    index,
    setIndex,
    dragOffset,
    goTo,
    handlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel },
  };
}
