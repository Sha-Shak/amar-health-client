import { api } from "@/lib/api-client";
import type { Booking, BookingStatus, ChamberAvailability } from "./types";

export const bookingApi = {
  // No requirePatientAuth server-side — public, same as directoryApi's doctor/hospital reads.
  getAvailability: (chamberId: string, fromDate?: string) => {
    const qs = new URLSearchParams();
    if (fromDate) qs.set("fromDate", fromDate);
    const query = qs.toString();
    return api.get<ChamberAvailability>(`/chambers/${chamberId}/availability${query ? `?${query}` : ""}`, {
      auth: false,
    });
  },

  createBooking: (input: {
    chamberId: string;
    date: string;
    reasonForVisit?: string;
    visitType?: string;
    onBehalfOfUserId?: string;
  }) => api.post<Booking>("/bookings", input),

  listBookings: (params: { status?: BookingStatus; cursor?: string | null }) => {
    const qs = new URLSearchParams();
    if (params.status) qs.set("status", params.status);
    if (params.cursor) qs.set("cursor", params.cursor);
    const query = qs.toString();
    return api.getPaginated<Booking>(`/bookings${query ? `?${query}` : ""}`);
  },

  cancelBooking: (id: string) => api.patch<Booking>(`/bookings/${id}/cancel`),
};
