import { Building2 } from "lucide-react";

// Generic building icon — used wherever a hospital/clinic record has no real
// photo, instead of a stock photo standing in for a specific place.
export function HospitalPlaceholder({ className }: { className?: string }) {
  return (
    <div className={`flex h-full w-full items-center justify-center bg-coral-50 text-coral-600 ${className ?? ""}`}>
      <Building2 className="h-[50%] w-[50%]" aria-hidden="true" />
    </div>
  );
}
