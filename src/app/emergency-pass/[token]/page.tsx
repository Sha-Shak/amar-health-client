"use client";

import { authApi } from "@/features/auth/api";
import { readEmergencyPass, type EmergencyPassData } from "@/lib/emergency-pass-store";
import { ShieldAlert, TriangleAlert } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type ViewState =
  | { status: "loading" }
  | { status: "found"; data: EmergencyPassData }
  | { status: "not-found" };

// Deliberately outside the (app) group and its glass/teal design language — per
// the Design System doc's own note, this is the one screen where "calm and
// atmospheric" is the wrong instinct. A first responder needs blood type and
// allergies legible in under a second: solid, high-contrast, no blur, no auth.
//
// Two read paths, per §6: on the patient's own device, the pass was written to
// IndexedDB the moment it was generated, so it renders with zero network call.
// On any other device (someone scanning a printed/saved QR), there's no local
// cache to read, so this falls through to the public GET endpoint instead.
export default function EmergencyPassPage() {
  const token = useParams<{ token: string }>().token;
  const [state, setState] = useState<ViewState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    readEmergencyPass()
      .then((cached) => {
        if (cancelled) return;
        if (cached && cached.shareToken === token) {
          setState({ status: "found", data: cached });
          return;
        }
        return authApi
          .getEmergencyPassByToken(token)
          .then((data) => {
            if (cancelled) return;
            setState({ status: "found", data: { ...data, shareToken: token, generatedAt: "" } });
          })
          .catch(() => {
            if (!cancelled) setState({ status: "not-found" });
          });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "not-found" });
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  if (state.status === "loading") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-black text-white">
        Loading…
      </div>
    );
  }

  if (state.status === "not-found") {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-black px-8 text-center text-white">
        <TriangleAlert size={32} aria-hidden="true" />
        <p className="text-lg font-bold">Pass not found</p>
        <p className="text-white/70">This emergency pass link is invalid or has expired.</p>
      </div>
    );
  }

  const { data } = state;

  return (
    <div className="min-h-dvh bg-black px-6 py-10 text-white">
      <div className="mx-auto w-full max-w-sm space-y-6">
        <div className="flex items-center gap-2 text-coral-400">
          <ShieldAlert size={22} aria-hidden="true" />
          <p className="text-sm font-bold uppercase tracking-wide">Emergency Health Pass</p>
        </div>

        <h1 className="text-3xl font-extrabold">{data.name ?? "Unknown"}</h1>

        <a
          href="tel:999"
          className="flex items-center justify-between rounded-2xl bg-coral-500 px-6 py-4 font-bold text-black"
        >
          <span>Call Bangladesh Emergency</span>
          <span className="text-2xl">999</span>
        </a>

        <div className="rounded-2xl border-2 border-coral-500 bg-coral-500/10 px-6 py-5">
          <p className="text-sm font-medium uppercase tracking-wide text-coral-400">Blood group</p>
          <p className="text-5xl font-extrabold">{data.bloodGroup ?? "Unknown"}</p>
        </div>

        <Section title="Allergies" items={data.allergies} emptyLabel="None recorded" />
        <Section title="Medical conditions" items={data.medicalConditions} emptyLabel="None recorded" />

        <div>
          <p className="mb-2 text-sm font-bold uppercase tracking-wide text-white/60">
            Emergency contact
          </p>
          {data.emergencyContact?.name ? (
            <div className="rounded-2xl border border-white/20 px-5 py-4">
              <p className="text-xl font-bold">{data.emergencyContact.name}</p>
              {data.emergencyContact.relationship && (
                <p className="text-white/70">{data.emergencyContact.relationship}</p>
              )}
              {data.emergencyContact.phone && (
                <a href={`tel:${data.emergencyContact.phone}`} className="mt-1 block text-xl font-bold">
                  {data.emergencyContact.phone}
                </a>
              )}
            </div>
          ) : (
            <p className="text-white/50">None recorded</p>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  items,
  emptyLabel,
}: {
  title: string;
  items?: string[];
  emptyLabel: string;
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-bold uppercase tracking-wide text-white/60">{title}</p>
      {items && items.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <span
              key={item}
              className="rounded-full border border-white/20 px-3 py-1.5 text-sm font-medium"
            >
              {item}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-white/50">{emptyLabel}</p>
      )}
    </div>
  );
}
