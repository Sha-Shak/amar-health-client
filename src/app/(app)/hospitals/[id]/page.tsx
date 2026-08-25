"use client";

import { PhotoSlot } from "@/components/ui/photo-slot";
import { AvatarPlaceholder } from "@/components/ui/avatar-placeholder";
import { LocationMap } from "@/components/ui/location-map-dynamic";
import { photos } from "@/config/photos";
import { directoryApi } from "@/features/directory/api";
import { hospitalTypeLabel, mapsLinkFor, specialtyLabel } from "@/features/directory/types";
import { useQuery } from "@tanstack/react-query";
import { BadgeCheck, ChevronLeft, ExternalLink, MapPin, Phone, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export default function HospitalDetailPage() {
  const router = useRouter();
  const id = useParams<{ id: string }>().id;

  const { data, isLoading } = useQuery({
    queryKey: ["hospitals", "detail", id],
    queryFn: () => directoryApi.getHospital(id),
  });

  if (isLoading || !data) {
    return <div className="flex flex-1 items-center justify-center text-ink-700">Loading…</div>;
  }

  const { hospital, doctors } = data;
  const coords = hospital.location?.coordinates; // [lng, lat]

  return (
    <div className="flex flex-1 flex-col pb-24">
      <div className="relative h-56 shrink-0">
        <PhotoSlot alt="" src={hospital.photoUrl || photos.tiles.hospitals} gradient="from-coral-600 to-ink-900" />
        <div className="photo-scrim absolute inset-0" />
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Go back"
          className="glass-on-photo tap-target absolute left-4 top-[max(1rem,env(safe-area-inset-top))] rounded-full"
        >
          <ChevronLeft size={20} aria-hidden="true" />
        </button>
      </div>

      <div className="glass-panel-strong -mt-8 mx-4 space-y-3 p-5">
        <div>
          <h1 className="text-xl font-bold">{hospital.name}</h1>
          <p className="text-sm text-ink-500">
            {hospitalTypeLabel(hospital.type)}
            {hospital.yearsInService !== undefined ? ` · ${hospital.yearsInService} yrs in service` : ""}
          </p>
        </div>

        <a
          href={mapsLinkFor({ mapLink: hospital.mapLink, location: hospital.location, address: hospital.address })}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-start gap-2 text-sm text-primary-700"
        >
          <MapPin size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
          <span className="underline">{hospital.address}</span>
          <ExternalLink size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
        </a>
        {hospital.contactPhone && (
          <a href={`tel:${hospital.contactPhone}`} className="flex items-start gap-2 text-sm text-ink-700">
            <Phone size={16} className="mt-0.5 shrink-0 text-ink-500" aria-hidden="true" />
            <span>{hospital.contactPhone}</span>
          </a>
        )}
        {hospital.emergency24_7 && (
          <div className="flex items-center gap-2 text-sm font-medium text-coral-600">
            <ShieldCheck size={16} aria-hidden="true" />
            24/7 Emergency
          </div>
        )}
        {hospital.feeRange && <p className="text-sm text-ink-700">Fee range: {hospital.feeRange}</p>}
        {hospital.about && <p className="text-sm text-ink-700">{hospital.about}</p>}
        {hospital.mission && (
          <div>
            <p className="text-xs font-semibold text-ink-500">Mission</p>
            <p className="text-sm text-ink-700">{hospital.mission}</p>
          </div>
        )}
      </div>

      {coords && (
        <div className="mx-4 mt-6 h-48 overflow-hidden rounded-[var(--radius-card)]">
          <LocationMap lat={coords[1]} lng={coords[0]} label={hospital.name} className="h-full w-full" />
        </div>
      )}

      {hospital.services && hospital.services.length > 0 && (
        <div className="mx-4 mt-6">
          <h2 className="mb-2 text-lg font-semibold">Services</h2>
          <div className="flex flex-wrap gap-2">
            {hospital.services.map((service) => (
              <span
                key={service}
                className="rounded-[var(--radius-pill)] bg-primary-50 px-3 py-1 text-sm font-medium text-primary-800"
              >
                {service}
              </span>
            ))}
          </div>
        </div>
      )}

      {doctors.length > 0 && (
        <div className="mx-4 mt-6 space-y-2">
          <h2 className="text-lg font-semibold">Doctors here</h2>
          {doctors.map((doctor) => (
            <Link key={doctor._id} href={`/find-care/${doctor._id}`} className="glass-panel flex gap-3 p-3">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-primary-50">
                {doctor.photoUrl ? <PhotoSlot alt="" src={doctor.photoUrl} /> : <AvatarPlaceholder />}
              </div>
              <div className="min-w-0 flex-1 py-0.5">
                <div className="flex items-center gap-1">
                  <p className="truncate font-medium">{doctor.name}</p>
                  <BadgeCheck size={13} className="shrink-0 text-primary-600" aria-hidden="true" />
                </div>
                <p className="truncate text-xs text-ink-500">
                  {doctor.specialties.map(specialtyLabel).join(", ")}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
