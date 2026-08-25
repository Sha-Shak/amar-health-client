import { ChevronRight, type LucideIcon } from "lucide-react";
import Link from "next/link";

export function SettingsRow({
  href,
  icon: Icon,
  label,
  value,
  destructive,
  onClick,
}: {
  href?: string;
  icon: LucideIcon;
  label: string;
  value?: string;
  destructive?: boolean;
  onClick?: () => void;
}) {
  const content = (
    <>
      <span
        className={`tap-target rounded-full ${destructive ? "bg-coral-50 text-coral-600" : "bg-primary-50 text-primary-700"}`}
      >
        <Icon size={18} aria-hidden="true" />
      </span>
      <span className={`flex-1 font-medium ${destructive ? "text-coral-600" : "text-ink-900"}`}>
        {label}
      </span>
      {value && <span className="text-sm text-ink-500">{value}</span>}
      {href && <ChevronRight size={18} className="text-ink-500" aria-hidden="true" />}
    </>
  );

  const className =
    "tap-target flex w-full items-center gap-3 px-4 py-3.5 text-left first:rounded-t-[var(--radius-card)] last:rounded-b-[var(--radius-card)]";

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={className}>
      {content}
    </button>
  );
}
