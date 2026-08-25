"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
  onBack,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  onBack?: () => void;
}) {
  const router = useRouter();

  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col px-6 py-6">
      <button
        type="button"
        onClick={onBack ?? (() => router.back())}
        aria-label="Go back"
        className="tap-target -ml-2 self-start rounded-full text-ink-700"
      >
        <ChevronLeft size={22} aria-hidden="true" />
      </button>

      <div className="flex flex-1 flex-col justify-center gap-6 pb-10">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">{title}</h1>
          {subtitle && <p className="text-ink-700">{subtitle}</p>}
        </div>

        <div className="glass-panel space-y-5 p-6">{children}</div>
        {footer && <div className="mt-2">{footer}</div>}
      </div>
    </div>
  );
}
