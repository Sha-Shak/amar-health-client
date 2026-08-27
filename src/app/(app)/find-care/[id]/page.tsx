"use client";

import { PhotoSlot } from "@/components/ui/photo-slot";
import { AvatarPlaceholder } from "@/components/ui/avatar-placeholder";
import { Button } from "@/components/ui/button";
import { LocationMap } from "@/components/ui/location-map-dynamic";
import { directoryApi } from "@/features/directory/api";
import { mapsLinkFor, specialtyLabel, type Chamber } from "@/features/directory/types";
import { geocodeAddress } from "@/lib/geocode";
import { useQuery } from "@tanstack/react-query";
import {
  Award,
  BadgeCheck,
  BookOpen,
  Briefcase,
  ChevronLeft,
  Clock,
  ExternalLink,
  GraduationCap,
  MapPin,
  Phone,
  Sparkles,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

export default function DoctorDetailPage() {
  const router = useRouter();
  const id = useParams<{ id: string }>().id;

  const { data, isLoading } = useQuery({
    queryKey: ["doctors", "detail", id],
    queryFn: () => directoryApi.getDoctor(id),
  });

  // One chamber = one pin. Chambers rarely have real lat/lng (same bulk-import
  // gap as hospitals), so this resolves each one in parallel via the same
  // geocoding fallback the hospital detail page uses — parallel across
  // chambers, not chained, so a doctor with 4 chambers still resolves in
  // roughly one round-trip's worth of time, not four.
  const markersQuery = useQuery({
    queryKey: ["doctors", "chamber-markers", id, data?.chambers.map((c) => c._id).join(",")],
    queryFn: async () => {
      const chambers = data!.chambers;
      const resolved = await Promise.all(
        chambers.map(async (chamber) => {
          const coords = chamber.location?.coordinates;
          const point = coords
            ? { lat: coords[1], lng: coords[0] }
            : await geocodeAddress(`${chamber.name}, ${chamber.address}`);
          return point ? { ...point, label: chamber.name } : null;
        })
      );
      return resolved.filter((m): m is NonNullable<typeof m> => m !== null);
    },
    enabled: Boolean(data && data.chambers.length > 0),
    staleTime: Infinity,
  });

  if (isLoading || !data) {
    return <div className="flex flex-1 items-center justify-center text-ink-700">Loading…</div>;
  }

  const { doctor, chambers } = data;
  const chamberMarkers = markersQuery.data ?? [];

  return (
    <div className="flex flex-1 flex-col pb-28">
      <div className="mx-auto w-full max-w-sm px-5 pt-8">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Go back"
          className="tap-target -ml-2 mb-4 rounded-full text-ink-700"
        >
          <ChevronLeft size={22} aria-hidden="true" />
        </button>

        <div
          className={`glass-panel flex items-start gap-4 p-5 ${doctor.tier === "tier2" ? "platform-doctor-card" : ""}`}
        >
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-primary-50">
            {doctor.photoUrl ? <PhotoSlot alt="" src={doctor.photoUrl} /> : <AvatarPlaceholder />}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h1 className="text-lg font-bold leading-tight">{doctor.name}</h1>
              {doctor.status === "verified" && (
                <BadgeCheck size={16} className="shrink-0 text-primary-600" aria-hidden="true" />
              )}
            </div>
            <p className="text-sm text-ink-500">{doctor.specialties.map(specialtyLabel).join(", ")}</p>
            {doctor.degrees && doctor.degrees.length > 0 && (
              <p className="mt-1 text-sm text-ink-700">{doctor.degrees.join(", ")}</p>
            )}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {doctor.tier !== "tier2" && <Pill label="Directory Listing" />}
          {doctor.experienceYears !== undefined && <Pill label={`${doctor.experienceYears} yrs experience`} />}
          {doctor.registrationNumber && <Pill label={`Reg. ${doctor.registrationNumber}`} />}
        </div>

        {doctor.bio && <p className="mt-4 text-sm text-ink-700">{doctor.bio}</p>}

        {doctor.contactPhone && (
          <a
            href={`tel:${doctor.contactPhone}`}
            className="mt-4 flex items-center gap-2 text-sm text-primary-700"
          >
            <Phone size={15} aria-hidden="true" />
            {doctor.contactPhone}
          </a>
        )}

        <InfoList icon={GraduationCap} title="Education" items={doctor.education} />

        <div className="mt-6 space-y-3">
          <h2 className="text-lg font-semibold">Chambers</h2>
          {chambers.length === 0 && <p className="text-sm text-ink-500">No chamber information available.</p>}
          {chambers.map((chamber) => (
            <ChamberCard key={chamber._id} chamber={chamber} />
          ))}
        </div>

        {chamberMarkers.length > 0 && (
          <div className="mt-4 h-48 overflow-hidden rounded-[var(--radius-card)]">
            <LocationMap markers={chamberMarkers} className="h-full w-full" />
          </div>
        )}

        <InfoList icon={Sparkles} title="Areas of expertise" items={doctor.expertise} />
        <InfoList icon={Briefcase} title="Work experience" items={doctor.workExperience} />
        <InfoList icon={Award} title="Awards & achievements" items={[...(doctor.awards ?? []), ...(doctor.achievements ?? [])]} />
        <InfoList icon={BookOpen} title="Publications" items={doctor.publications} />
      </div>

      <div className="fixed inset-x-0 bottom-24 z-30 mx-auto w-full max-w-sm px-5">
        {doctor.tier === "tier2" ? (
          <Button className="w-full" onClick={() => toast("Booking isn't built yet — coming in Flow 9")}>
            Book Now
          </Button>
        ) : (
          <div className="glass-panel px-4 py-3 text-center text-sm text-ink-500">
            Online booking isn&apos;t available for this listing — contact the chamber directly.
          </div>
        )}
      </div>
    </div>
  );
}

function ChamberCard({ chamber }: { chamber: Chamber }) {
  return (
    <div className="glass-panel space-y-2 p-4">
      <p className="font-semibold">{chamber.name}</p>
      <a
        href={mapsLinkFor({ mapLink: chamber.mapLink, location: chamber.location, address: chamber.address })}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-start gap-2 text-sm text-primary-700"
      >
        <MapPin size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
        <span className="underline">{chamber.address}</span>
        <ExternalLink size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
      </a>
      {chamber.visitingHoursRaw && (
        <div className="flex items-start gap-2 text-sm text-ink-700">
          <Clock size={16} className="mt-0.5 shrink-0 text-ink-500" aria-hidden="true" />
          <span>{chamber.visitingHoursRaw}</span>
        </div>
      )}
      {chamber.contactPhone && (
        <a href={`tel:${chamber.contactPhone}`} className="flex items-start gap-2 text-sm text-ink-700">
          <Phone size={16} className="mt-0.5 shrink-0 text-ink-500" aria-hidden="true" />
          <span>{chamber.contactPhone}</span>
        </a>
      )}
      {chamber.consultationFee !== undefined && (
        <p className="text-sm font-semibold text-primary-700">৳{chamber.consultationFee} fee</p>
      )}
    </div>
  );
}

function InfoList({
  icon: Icon,
  title,
  items,
}: {
  icon: typeof GraduationCap;
  title: string;
  items?: string[];
}) {
  if (!items || items.length === 0) return null;
  return (
    <div className="mt-4">
      <div className="mb-2 flex items-center gap-2">
        <Icon size={16} className="text-primary-700" aria-hidden="true" />
        <h3 className="font-semibold">{title}</h3>
      </div>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="text-sm text-ink-700">
            • {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Pill({ label }: { label: string }) {
  return (
    <span className="rounded-[var(--radius-pill)] bg-primary-50 px-3 py-1 text-sm font-medium text-primary-800">
      {label}
    </span>
  );
}
