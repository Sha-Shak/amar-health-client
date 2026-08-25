import type { LucideIcon } from "lucide-react";

export function StubScreen({
  icon: Icon,
  title,
  flow,
}: {
  icon: LucideIcon;
  title: string;
  flow: string;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="tap-target h-16 w-16 rounded-full bg-primary-50 text-primary-700">
        <Icon size={28} aria-hidden="true" className="m-auto" />
      </div>
      <h1 className="text-xl font-bold">{title}</h1>
      <p className="text-sm text-ink-700">{flow} hasn&apos;t been built yet.</p>
    </div>
  );
}
