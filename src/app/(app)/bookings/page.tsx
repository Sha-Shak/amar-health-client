"use client";

import { AvatarPlaceholder } from "@/components/ui/avatar-placeholder";
import { PhotoSlot } from "@/components/ui/photo-slot";
import { bookingApi } from "@/features/booking/api";
import { statusLabel, type Booking, type BookingStatus } from "@/features/booking/types";
import { errorMessage } from "@/lib/error-message";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { CalendarClock, ChevronLeft, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const TABS: { value: BookingStatus | "all"; label: string }[] = [
  { value: "confirmed", label: "Upcoming" },
  { value: "all", label: "All" },
  { value: "cancelled", label: "Cancelled" },
];

const STATUS_STYLES: Record<BookingStatus, string> = {
  confirmed: "bg-primary-50 text-primary-700",
  in_progress: "bg-amber-100 text-amber-800",
  completed: "bg-surface-70 text-ink-700",
  cancelled: "bg-coral-50 text-coral-600",
  no_show: "bg-coral-50 text-coral-600",
};

export default function MyBookingsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<BookingStatus | "all">("confirmed");
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const resultsQuery = useInfiniteQuery({
    queryKey: ["bookings", "list", tab],
    queryFn: ({ pageParam }) =>
      bookingApi.listBookings({ status: tab === "all" ? undefined : tab, cursor: pageParam }),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => last.nextCursor,
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => bookingApi.cancelBooking(id),
    onMutate: (id) => setCancellingId(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      toast.success("Appointment cancelled");
    },
    onError: (error) => toast.error(errorMessage(error)),
    onSettled: () => setCancellingId(null),
  });

  const bookings = resultsQuery.data?.pages.flatMap((p) => p.items) ?? [];

  return (
    <div className="mx-auto w-full max-w-sm px-5 pt-8 pb-6">
      <div className="mb-4 flex items-center gap-2">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Go back"
          className="tap-target -ml-2 rounded-full text-ink-700"
        >
          <ChevronLeft size={22} aria-hidden="true" />
        </button>
        <h1 className="text-2xl font-bold">My Bookings</h1>
      </div>

      <div className="glass-panel mb-4 flex gap-1 p-1">
        {TABS.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setTab(t.value)}
            className={`flex-1 rounded-[var(--radius-pill)] px-2 py-2 text-sm font-semibold transition-colors ${
              tab === t.value ? "bg-primary-600 text-white" : "text-ink-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {resultsQuery.isLoading && <p className="py-12 text-center text-sm text-ink-500">Loading…</p>}

      {!resultsQuery.isLoading && bookings.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-12 text-center">
          <CalendarClock size={28} className="text-ink-500" aria-hidden="true" />
          <p className="text-sm text-ink-500">No bookings here yet.</p>
        </div>
      )}

      <div className="space-y-2 pb-6">
        {bookings.map((booking) => (
          <BookingRow
            key={booking._id}
            booking={booking}
            onCancel={() => cancelMutation.mutate(booking._id)}
            cancelling={cancellingId === booking._id && cancelMutation.isPending}
          />
        ))}

        {resultsQuery.hasNextPage && (
          <button
            type="button"
            onClick={() => resultsQuery.fetchNextPage()}
            disabled={resultsQuery.isFetchingNextPage}
            className="tap-target w-full rounded-[var(--radius-pill)] bg-surface-60 text-sm font-medium text-ink-700"
          >
            {resultsQuery.isFetchingNextPage ? "Loading…" : "Load more"}
          </button>
        )}
      </div>
    </div>
  );
}

function BookingRow({
  booking,
  onCancel,
  cancelling,
}: {
  booking: Booking;
  onCancel: () => void;
  cancelling: boolean;
}) {
  const doctor = typeof booking.doctorId === "object" ? booking.doctorId : null;
  const chamber = typeof booking.chamberId === "object" ? booking.chamberId : null;
  const session = typeof booking.sessionId === "object" ? booking.sessionId : null;

  return (
    <div className="glass-panel space-y-3 p-4">
      <div className="flex items-start gap-3">
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-primary-50">
          {doctor?.photoUrl ? <PhotoSlot alt="" src={doctor.photoUrl} /> : <AvatarPlaceholder />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{doctor?.name ?? "Doctor"}</p>
          {session && (
            <p className="text-xs font-medium text-primary-700">
              {format(parseISO(session.date), "EEE, MMM d, yyyy")}
            </p>
          )}
          {chamber && (
            <p className="flex items-center gap-1 truncate text-xs text-ink-500">
              <MapPin size={11} className="shrink-0" aria-hidden="true" />
              {chamber.name}
            </p>
          )}
        </div>
        <span
          className={`shrink-0 rounded-[var(--radius-pill)] px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[booking.status]}`}
        >
          {statusLabel(booking.status)}
        </span>
      </div>

      <div className="flex items-center justify-between border-t border-black/5 pt-3 text-sm">
        <span className="text-ink-700">
          Serial <span className="font-semibold">#{booking.serialNumber}</span>
          {booking.visitType && <span className="text-ink-500"> · {booking.visitType}</span>}
        </span>
        <span className="font-semibold text-primary-700">৳{booking.fee}</span>
      </div>

      {booking.status === "confirmed" && (
        <button
          type="button"
          onClick={onCancel}
          disabled={cancelling}
          className="tap-target w-full rounded-[var(--radius-pill)] border border-coral-200 py-2.5 text-sm font-semibold text-coral-600 disabled:opacity-50"
        >
          {cancelling ? "Cancelling…" : "Cancel appointment"}
        </button>
      )}
    </div>
  );
}
