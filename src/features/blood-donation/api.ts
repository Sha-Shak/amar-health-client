import { api } from "@/lib/api-client";
import type {
  BloodGroup,
  BloodRequest,
  BloodRequestDetail,
  DonorProfile,
  PublicDonor,
  RequestStatus,
} from "./types";

export const bloodDonationApi = {
  listRequests: (params: { bloodGroup?: BloodGroup; status?: RequestStatus; mine?: boolean; cursor?: string | null }) => {
    const qs = new URLSearchParams();
    if (params.bloodGroup) qs.set("bloodGroup", params.bloodGroup);
    if (params.status) qs.set("status", params.status);
    if (params.mine) qs.set("mine", "true");
    if (params.cursor) qs.set("cursor", params.cursor);
    return api.getPaginated<BloodRequest>(`/blood-requests?${qs.toString()}`);
  },

  createRequest: (input: {
    bloodGroup: BloodGroup;
    unitsNeeded: number;
    urgency?: string;
    patientName?: string;
    hospitalName: string;
    location: string;
    contactPhone: string;
    note?: string;
    neededBy?: string;
  }) => api.post<BloodRequest>("/blood-requests", input),

  getRequest: (id: string) => api.get<BloodRequestDetail>(`/blood-requests/${id}`),

  updateRequest: (id: string, patch: Record<string, unknown>) =>
    api.patch<BloodRequest>(`/blood-requests/${id}`, patch),

  expressInterest: (id: string) => api.post<{ message: string }>(`/blood-requests/${id}/interest`),

  withdrawInterest: (id: string) => api.delete<{ message: string }>(`/blood-requests/${id}/interest`),

  confirmDonation: (
    id: string,
    input:
      | { fromPlatform: true; donorId: string; donationDate: string; place: string; bags: number }
      | { fromPlatform: false; donorName: string; donorPhone: string; donationDate: string; place: string; bags: number }
  ) => api.post(`/blood-requests/${id}/confirm-donation`, input),

  getMyDonorProfile: () => api.get<DonorProfile>("/blood-donors/me"),

  setAvailability: (isAvailable: boolean) =>
    api.patch<DonorProfile>("/blood-donors/me", { isAvailable }),

  listDonors: (params: { bloodGroup?: BloodGroup; cursor?: string | null }) => {
    const qs = new URLSearchParams();
    if (params.bloodGroup) qs.set("bloodGroup", params.bloodGroup);
    if (params.cursor) qs.set("cursor", params.cursor);
    return api.getPaginated<PublicDonor>(`/blood-donors?${qs.toString()}`);
  },

  getLeaderboard: () => api.get<PublicDonor[]>("/blood-donors/leaderboard"),
};
