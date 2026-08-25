import { User } from "lucide-react";

// Generic person-silhouette avatar — used wherever a doctor (or anyone else)
// has no real photo, instead of a stock photo standing in for a specific person.
export function AvatarPlaceholder({ className }: { className?: string }) {
  return (
    <div className={`flex h-full w-full items-center justify-center bg-primary-100 text-primary-600 ${className ?? ""}`}>
      <User className="h-[55%] w-[55%]" aria-hidden="true" />
    </div>
  );
}
