"use client";

import { PhotoSlot } from "@/components/ui/photo-slot";
import { AvatarPlaceholder } from "@/components/ui/avatar-placeholder";
import { HospitalPlaceholder } from "@/components/ui/hospital-placeholder";
import { LocationMap } from "@/components/ui/location-map-dynamic";
import { directoryApi } from "@/features/directory/api";
import { hospitalTypeLabel, mapsLinkFor, specialtyLabel } from "@/features/directory/types";
import { geocodeAddress } from "@/lib/geocode";
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

  const rawCoords = data?.hospital.location?.coordinates; // [lng, lat]

  // Bulk-imported hospitals almost never have real lat/lng, only an address —
  // geocode it client-side so the map isn't just permanently absent.
  const geocodeQuery = useQuery({
    queryKey: ["geocode", data?.hospital._id],
    queryFn: () => geocodeAddress(`${data!.hospital.name}, ${data!.hospital.address}`),
    enabled: Boolean(data && !rawCoords),
    staleTime: Infinity,
  });

  if (isLoading || !data) {
    return <div className="flex flex-1 items-center justify-center text-ink-700">Loading…</div>;
  }

  const { hospital, doctors } = data;
  const coords = rawCoords
    ? { lat: rawCoords[1], lng: rawCoords[0] }
    : geocodeQuery.data ?? null;

  return (
    <div className="flex flex-1 flex-col pb-24">
      <div className="mx-auto w-full max-w-sm px-5 pt-8">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Go back"
          className="tap-target -ml-2 mb-4 rounded-full text-ink-700"
        >
          <ChevronLeft size={22} aria-hidden="true" />
        </button>

        <div className="glass-panel flex items-start gap-4 p-5">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-coral-50">
            {hospital.photoUrl ? <PhotoSlot alt="" src={hospital.photoUrl} /> : <HospitalPlaceholder />}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-bold leading-tight">{hospital.name}</h1>
            <p className="text-sm text-ink-500">
              {hospitalTypeLabel(hospital.type)}
              {hospital.yearsInService !== undefined ? ` · ${hospital.yearsInService} yrs in service` : ""}
            </p>
          </div>
        </div>

        <div className="mt-3 space-y-3">
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
          <div className="mt-6 h-48 overflow-hidden rounded-[var(--radius-card)]">
            <LocationMap markers={[{ ...coords, label: hospital.name }]} className="h-full w-full" />
          </div>
        )}

        {hospital.services && hospital.services.length > 0 && (
          <div className="mt-6">
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
          <div className="mt-6 space-y-2">
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
    </div>
  );
}
