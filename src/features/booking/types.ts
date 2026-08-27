export type BookingStatus = "confirmed" | "in_progress" | "cancelled" | "completed" | "no_show";

export type AvailabilityDate = { date: string; capacity: number; remaining: number };

export type ChamberAvailability = { isBookable: boolean; dates: AvailabilityDate[] };

export type BookingDoctorSummary = { _id: string; name: string; specialties: string[]; photoUrl?: string };
export type BookingChamberSummary = { _id: string; name: string; address?: string };
export type BookingSessionSummary = { _id: string; date: string };

export type Booking = {
  _id: string;
  userId: string;
  bookedByUserId: string;
  doctorId: BookingDoctorSummary | string;
  chamberId: BookingChamberSummary | string;
  sessionId: BookingSessionSummary | string;
  serialNumber: number;
  queuePosition?: number;
  visitType?: string;
  status: BookingStatus;
  reasonForVisit?: string;
  fee: number;
  cancelledAt?: string;
  paymentStatus: "unpaid" | "paid";
  paidAt?: string;
  paymentMethod?: string;
  createdAt: string;
  updatedAt: string;
};

export function statusLabel(status: BookingStatus): string {
  switch (status) {
    case "confirmed":
      return "Confirmed";
    case "in_progress":
      return "In progress";
    case "cancelled":
      return "Cancelled";
    case "completed":
      return "Completed";
    case "no_show":
      return "No-show";
  }
}
