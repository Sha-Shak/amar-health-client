import { AvatarPlaceholder } from "@/components/ui/avatar-placeholder";
import { X } from "lucide-react";
import Image from "next/image";

export function FamilyMemberRow({
  name,
  avatarUrl,
  phone,
  email,
  badge,
  onRemove,
  removing,
}: {
  name: string;
  avatarUrl?: string;
  phone?: string;
  email?: string;
  badge: string;
  onRemove?: () => void;
  removing?: boolean;
}) {
  return (
    <div className="glass-panel flex items-center gap-3 p-3">
      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full">
        {avatarUrl ? (
          <Image src={avatarUrl} alt="" fill sizes="44px" className="object-cover" />
        ) : (
          <AvatarPlaceholder />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{name}</p>
        {phone && <p className="truncate text-sm text-ink-500">{phone}</p>}
        {email && <p className="truncate text-sm text-ink-500">{email}</p>}
      </div>
      <span className="shrink-0 rounded-full bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-700">
        {badge}
      </span>
      {onRemove && (
        <button
          type="button"
          aria-label={`Remove ${name}`}
          onClick={onRemove}
          disabled={removing}
          className="tap-target shrink-0 rounded-full text-ink-500 disabled:opacity-50"
        >
          <X size={18} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
