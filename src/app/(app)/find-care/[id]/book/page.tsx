"use client";

import { AvatarPlaceholder } from "@/components/ui/avatar-placeholder";
import { Button } from "@/components/ui/button";
import { PhotoSlot } from "@/components/ui/photo-slot";
import { bookingApi } from "@/features/booking/api";
import type { Booking } from "@/features/booking/types";
import { directoryApi } from "@/features/directory/api";
import type { Chamber } from "@/features/directory/types";
import { specialtyLabel } from "@/features/directory/types";
import { errorMessage } from "@/lib/error-message";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { CalendarDays, CheckCircle2, ChevronLeft, MapPin } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function BookAppointmentPage() {
  const router = useRouter();
  const id = useParams<{ id: string }>().id;
  const queryClient = useQueryClient();

  const [chamberId, setChamberId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [visitType, setVisitType] = useState<string | null>(null);
  const [reasonForVisit, setReasonForVisit] = useState("");
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["doctors", "detail", id],
    queryFn: () => directoryApi.getDoctor(id),
  });

  const bookableChambers = (data?.chambers ?? []).filter((c) => c.isBookable);
  const chamber = bookableChambers.find((c) => c._id === chamberId) ?? bookableChambers[0] ?? null;

  const availabilityQuery = useQuery({
    queryKey: ["booking", "availability", chamber?._id],
    queryFn: () => bookingApi.getAvailability(chamber!._id),
    enabled: Boolean(chamber),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      bookingApi.createBooking({
        chamberId: chamber!._id,
        date: selectedDate!,
        visitType: visitType ?? undefined,
        reasonForVisit: reasonForVisit || undefined,
      }),
    onSuccess: (booking) => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      setConfirmedBooking(booking);
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  if (isLoading || !data) {
    return <div className="flex flex-1 items-center justify-center text-ink-700">Loading…</div>;
  }

  const { doctor } = data;

  if (confirmedBooking) {
    return (
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center justify-center px-6 py-8 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-50 text-primary-600">
          <CheckCircle2 size={32} aria-hidden="true" />
        </span>
        <h1 className="mt-4 text-xl font-bold">Appointment confirmed</h1>
        <p className="mt-1 text-sm text-ink-700">
          {doctor.name} · {chamber?.name}
        </p>
        <div className="glass-panel mt-6 w-full space-y-3 p-5 text-left">
          <Row label="Date" value={format(parseISO(selectedDate!), "EEEE, MMM d, yyyy")} />
          <Row label="Serial number" value={`#${confirmedBooking.serialNumber}`} />
          {confirmedBooking.visitType && <Row label="Visit type" value={confirmedBooking.visitType} />}
          <Row label="Fee" value={`৳${confirmedBooking.fee}`} />
        </div>
        <p className="mt-4 text-xs text-ink-500">
          A reminder will be sent before your visit — you can view or cancel this anytime from My Bookings.
        </p>
        <div className="mt-6 flex w-full gap-3">
          <Button variant="glass" className="flex-1" onClick={() => router.push("/find-care")}>
            Find more care
          </Button>
          <Link href="/bookings" className="flex-1">
            <Button className="w-full">My Bookings</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-sm px-5 pb-32 pt-8">
      <button
        type="button"
        onClick={() => router.back()}
        aria-label="Go back"
        className="tap-target -ml-2 mb-4 rounded-full text-ink-700"
      >
        <ChevronLeft size={22} aria-hidden="true" />
      </button>

      <div className="glass-panel flex items-center gap-3 p-4">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-primary-50">
          {doctor.photoUrl ? <PhotoSlot alt="" src={doctor.photoUrl} /> : <AvatarPlaceholder />}
        </div>
        <div className="min-w-0">
          <p className="truncate font-semibold">{doctor.name}</p>
          <p className="truncate text-sm text-ink-500">{doctor.specialties.map(specialtyLabel).join(", ")}</p>
        </div>
      </div>

      {bookableChambers.length === 0 ? (
        <p className="mt-6 text-center text-sm text-ink-500">
          This doctor has no chamber currently accepting online bookings.
        </p>
      ) : (
        <>
          {bookableChambers.length > 1 && (
            <div className="mt-5">
              <p className="mb-2 text-sm font-semibold text-ink-900">Choose a chamber</p>
              <div className="space-y-2">
                {bookableChambers.map((c) => (
                  <ChamberOption
                    key={c._id}
                    chamber={c}
                    selected={chamber?._id === c._id}
                    onSelect={() => {
                      setChamberId(c._id);
                      setSelectedDate(null);
                      setVisitType(null);
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {chamber && (
            <>
              <div className="mt-5">
                <div className="mb-2 flex items-center gap-1.5">
                  <CalendarDays size={15} className="text-primary-700" aria-hidden="true" />
                  <p className="text-sm font-semibold text-ink-900">Choose a date</p>
                </div>
                <p className="mb-2 text-xs text-ink-500">
                  Bookable up to 5 days ahead — only days this chamber is open show up below.
                </p>
                {availabilityQuery.isLoading && <p className="text-sm text-ink-500">Loading availability…</p>}
                {availabilityQuery.data && availabilityQuery.data.dates.length > 0 && (
                  <div className="grid grid-cols-5 gap-1.5">
                    {availabilityQuery.data.dates.map((d) => {
                      const full = d.remaining <= 0;
                      const active = selectedDate === d.date;
                      return (
                        <button
                          key={d.date}
                          type="button"
                          disabled={full}
                          onClick={() => setSelectedDate(d.date)}
                          className={`rounded-[var(--radius-sm)] border p-2 text-center text-xs transition-colors disabled:opacity-40 ${
                            active ? "border-primary-600 bg-primary-50 font-semibold" : "border-black/5 bg-surface-70"
                          }`}
                        >
                          <span className="block">{format(parseISO(d.date), "EEE")}</span>
                          <span className="block text-base font-semibold">{format(parseISO(d.date), "d")}</span>
                          <span className="block text-[10px] text-ink-500">
                            {full ? "Full" : `${d.remaining} left`}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
                {availabilityQuery.data?.dates.length === 0 && (
                  <p className="text-sm text-ink-500">
                    This chamber isn&apos;t scheduled to be open in the next 5 days.
                  </p>
                )}
              </div>

              {chamber.visitTypes && chamber.visitTypes.length > 1 && (
                <div className="mt-5">
                  <p className="mb-2 text-sm font-semibold text-ink-900">Visit type</p>
                  <div className="space-y-2">
                    {chamber.visitTypes.map((vt) => (
                      <button
                        key={vt.name}
                        type="button"
                        onClick={() => setVisitType(vt.name)}
                        className={`flex w-full items-center justify-between rounded-[var(--radius-sm)] border p-3 text-left text-sm ${
                          visitType === vt.name ? "border-primary-600 bg-primary-50" : "border-black/5 bg-surface-70"
                        }`}
                      >
                        <span className="font-medium">{vt.name}</span>
                        <span className="text-ink-500">৳{vt.fee}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-5 space-y-1.5">
                <label htmlFor="reason" className="text-sm font-semibold text-ink-900">
                  Reason for visit (optional)
                </label>
                <textarea
                  id="reason"
                  value={reasonForVisit}
                  onChange={(e) => setReasonForVisit(e.target.value)}
                  rows={2}
                  className="w-full rounded-[var(--radius-sm)] border border-primary-400/30 bg-surface-70 px-4 py-3 text-ink-900 outline-none focus:border-primary-600/40 focus:ring-2 focus:ring-primary-600/30"
                />
              </div>
            </>
          )}
        </>
      )}

      {chamber && (
        <div className="fixed inset-x-0 bottom-24 z-30 mx-auto w-full max-w-sm px-5">
          <Button
            className="w-full"
            disabled={
              !selectedDate ||
              createMutation.isPending ||
              (Boolean(chamber.visitTypes && chamber.visitTypes.length > 1) && !visitType)
            }
            onClick={() => createMutation.mutate()}
          >
            {createMutation.isPending ? "Booking…" : "Confirm booking"}
          </Button>
        </div>
      )}
    </div>
  );
}

function ChamberOption({
  chamber,
  selected,
  onSelect,
}: {
  chamber: Chamber;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full items-start gap-2 rounded-[var(--radius-sm)] border p-3 text-left ${
        selected ? "border-primary-600 bg-primary-50" : "border-black/5 bg-surface-70"
      }`}
    >
      <MapPin size={16} className="mt-0.5 shrink-0 text-ink-500" aria-hidden="true" />
      <span className="min-w-0">
        <span className="block text-sm font-medium">{chamber.name}</span>
        <span className="block truncate text-xs text-ink-500">{chamber.address}</span>
      </span>
    </button>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-black/5 pb-2 last:border-0 last:pb-0">
      <span className="text-sm text-ink-500">{label}</span>
      <span className="text-sm font-semibold text-ink-900">{value}</span>
    </div>
  );
}
