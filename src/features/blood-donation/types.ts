export const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"] as const;
export type BloodGroup = (typeof BLOOD_GROUPS)[number];

export type RequestUrgency = "normal" | "urgent" | "critical";
export type RequestStatus = "open" | "fulfilled" | "cancelled";

export type BloodRequest = {
  _id: string;
  requesterId: string;
  bloodGroup: BloodGroup;
  unitsNeeded: number;
  unitsFulfilled: number;
  urgency: RequestUrgency;
  patientName?: string;
  hospitalName: string;
  location: string;
  contactPhone: string;
  note?: string;
  neededBy?: string;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
  interestCount?: number;
};

export type InterestedDonor = {
  _id: string;
  name?: string;
  phone?: string;
  bloodGroup?: BloodGroup;
  patientCode: string;
};

export type DonationRecord = {
  _id: string;
  requestId: string;
  donorId: { _id: string; name?: string; patientCode: string } | string;
  confirmedByUserId: string;
  donationDate: string;
  place: string;
  bags: number;
  pointsAwarded: number;
  createdAt: string;
};

export type BloodRequestDetail = {
  request: BloodRequest;
  isOwner: boolean;
  interestCount: number;
  hasExpressedInterest: boolean;
  interestedDonors: InterestedDonor[];
  donations: DonationRecord[];
};

export type DonorProfile = {
  bloodGroup?: BloodGroup;
  isAvailable: boolean;
  lastDonationDate?: string;
  totalDonations: number;
  totalBags: number;
  points: number;
  eligibleToDonateAgain: boolean;
};

export type PublicDonor = {
  _id: string;
  name?: string;
  avatarUrl?: string;
  bloodGroup?: BloodGroup;
  bloodDonor: { totalDonations: number; points: number };
};

export type DonorTier = { label: string; icon: "sprout" | "droplet" | "award" | "crown" };

export function donorTier(totalDonations: number): DonorTier {
  if (totalDonations >= 11) return { label: "Legend", icon: "crown" };
  if (totalDonations >= 6) return { label: "Blood Hero", icon: "award" };
  if (totalDonations >= 3) return { label: "Regular Donor", icon: "droplet" };
  if (totalDonations >= 1) return { label: "First Drop", icon: "sprout" };
  return { label: "New Donor", icon: "sprout" };
}

export function urgencyLabel(urgency: RequestUrgency): string {
  return urgency.charAt(0).toUpperCase() + urgency.slice(1);
}
