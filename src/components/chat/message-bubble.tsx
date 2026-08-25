import { specialtyLabel } from "@/features/directory/types";
import type { ChatMessage } from "@/features/chat/types";
import { AlertTriangle, Stethoscope } from "lucide-react";
import Link from "next/link";

export function MessageBubble({ message }: { message: ChatMessage }) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-[var(--radius-card)] rounded-br-md bg-primary-600 px-4 py-2.5 text-white">
          <p className="text-[15px] leading-snug">{message.content}</p>
        </div>
      </div>
    );
  }

  if (message.isEmergencyFlag) {
    return (
      <div className="flex justify-start">
        <div className="glass-panel-strong max-w-[85%] rounded-[var(--radius-card)] rounded-bl-md border-coral-500/40 bg-coral-50/70 px-4 py-3">
          <div className="mb-1.5 flex items-center gap-2 text-coral-700">
            <AlertTriangle size={18} aria-hidden="true" />
            <span className="text-sm font-bold uppercase tracking-wide">Possible emergency</span>
          </div>
          <p className="text-[15px] font-medium leading-snug text-coral-900">{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] space-y-2.5">
        <div className="glass-panel rounded-[var(--radius-card)] rounded-bl-md px-4 py-2.5">
          <p className="text-[15px] leading-snug">{message.content}</p>
        </div>
        {message.suggestedSpecialty && (
          <Link
            href={`/find-care?specialty=${message.suggestedSpecialty}`}
            className="tap-target flex w-fit items-center gap-2 rounded-full bg-primary-50 px-3.5 py-2 text-sm font-semibold text-primary-700"
          >
            <Stethoscope size={16} aria-hidden="true" />
            Find a {specialtyLabel(message.suggestedSpecialty)} doctor
          </Link>
        )}
      </div>
    </div>
  );
}
