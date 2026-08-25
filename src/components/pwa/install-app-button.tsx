"use client";

import { Download, Share } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari's own flag for "launched from home screen".
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

// Whether there's anything useful this button could do right now — false
// on first render (SSR/pre-hydration) and on a desktop browser that never
// fires an install prompt, so the caller can skip rendering the section
// entirely instead of showing a heading over an empty/dead button.
export function useInstallPrompt() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [ios, setIos] = useState(false);

  useEffect(() => {
    // Reads browser-only APIs (matchMedia, navigator.standalone) that don't
    // exist during SSR — deferring to an effect (rather than a lazy useState
    // initializer) keeps the first client render matching the SSR markup,
    // avoiding a hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setInstalled(isStandalone());
    setIos(isIOS());

    function onPrompt(e: Event) {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
    }
    function onInstalled() {
      setInstalled(true);
      setInstallEvent(null);
    }

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const available = !installed && (installEvent !== null || ios);

  async function promptInstall() {
    if (installEvent) {
      await installEvent.prompt();
      const { outcome } = await installEvent.userChoice;
      if (outcome === "accepted") setInstalled(true);
      setInstallEvent(null);
      return;
    }
    if (ios) {
      toast("Tap the Share icon, then \"Add to Home Screen\".", {
        icon: <Share size={16} aria-hidden="true" />,
      });
    }
  }

  return { available, promptInstall };
}

export function InstallAppButton() {
  const { available, promptInstall } = useInstallPrompt();
  if (!available) return null;

  return (
    <button
      type="button"
      onClick={promptInstall}
      className="glass-panel flex w-full items-center gap-3 px-4 py-3.5 text-left"
    >
      <span className="tap-target rounded-full bg-primary-50 text-primary-700">
        <Download size={18} aria-hidden="true" />
      </span>
      <span className="flex-1">
        <span className="block font-medium text-ink-900">Install app</span>
        <span className="block text-sm text-ink-500">Add Amar Health to your home screen</span>
      </span>
    </button>
  );
}
