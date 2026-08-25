"use client";

import { cn } from "@/lib/cn";
import { FolderHeart, House, MessageCircle, Bell, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/home", label: "Home", icon: House },
  { href: "/vault", label: "Vault", icon: FolderHeart },
  { href: "/reminders", label: "Reminders", icon: Bell },
  { href: "/profile", label: "Profile", icon: User },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div className="pointer-events-auto">
        <nav className="nav-glass flex h-14 items-center gap-2 rounded-[var(--radius-pill)] px-4">
          {TABS.slice(0, 2).map((tab) => (
            <NavItem key={tab.href} {...tab} active={pathname.startsWith(tab.href)} />
          ))}

          <Link
            href="/chat"
            aria-label="Ask AI Assistant"
            className="tap-target flex items-center justify-center rounded-full"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-600 text-white">
              <MessageCircle size={16} aria-hidden="true" />
            </span>
          </Link>

          {TABS.slice(2).map((tab) => (
            <NavItem key={tab.href} {...tab} active={pathname.startsWith(tab.href)} />
          ))}
        </nav>
      </div>
    </div>
  );
}

function NavItem({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: typeof House;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className="tap-target flex items-center justify-center rounded-full"
    >
      <span
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-full transition-colors duration-200",
          active ? "bg-primary-100 text-primary-700" : "text-ink-500"
        )}
      >
        <Icon size={21} aria-hidden="true" />
      </span>
    </Link>
  );
}
