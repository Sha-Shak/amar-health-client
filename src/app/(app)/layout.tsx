"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { BottomNav } from "@/components/layout/bottom-nav";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isLoading, hasToken } = useAuth();

  useEffect(() => {
    if (!hasToken) router.replace("/signup");
  }, [hasToken, router]);

  if (!hasToken || isLoading || !user) {
    return <div className="flex flex-1 items-center justify-center text-ink-700">Loading…</div>;
  }

  return (
    <div className="flex flex-1 flex-col pb-24">
      {children}
      <BottomNav />
    </div>
  );
}
