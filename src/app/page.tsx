"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const ONBOARDING_SEEN_KEY = "hv-onboarding-seen";

export default function SplashPage() {
  const router = useRouter();
  const { user, isLoading, hasToken } = useAuth();

  useEffect(() => {
    if (!hasToken) {
      const seenOnboarding = window.localStorage.getItem(ONBOARDING_SEEN_KEY);
      router.replace(seenOnboarding ? "/signup" : "/onboarding");
      return;
    }

    if (isLoading) return;

    if (!user) {
      // Token was present but invalid/expired — api-client already cleared it.
      router.replace("/signup");
      return;
    }

    router.replace(user.profileComplete ? "/home" : "/profile-setup");
  }, [hasToken, isLoading, user, router]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4">
      <div className="h-16 w-16 rounded-[var(--radius-sm)] bg-primary-600" />
    </div>
  );
}
