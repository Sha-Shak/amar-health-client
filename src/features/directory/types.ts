// Curated UI list, copied from apps/api/src/modules/directory/specialty.ts.
// Not a DB enum — Doctor.specialties is free text, so this is a best-effort
// filter set, not a guaranteed-exhaustive one (backend has no distinct-values
// endpoint for specialties the way it does for test categories).
export const SPECIALTIES = [
  "cardiology",
  "dermatology",
  "endocrinology",
  "gastroenterology",
  "general_medicine",
  "general_surgery",
  "gynecology",
  "neurology",
  "nephrology",
  "oncology",
  "ophthalmology",
  "orthopedics",
  "otolaryngology_ent",
  "pediatrics",
  "psychiatry",
  "pulmonology",
  "radiology",
  "rheumatology",
  "urology",
  "dentistry",
  "physical_medicine",
] as const;

export type Specialty = (typeof SPECIALTIES)[number];

// The actual query string sent as `specialty` — the backend now does a
// case-insensitive substring/regex match (not exact), but real bulk-imported
// data is inconsistent enough ("cardiologist" vs "cardiology" vs "cardiac
// surgeon") that the curated label itself is often a weak substring match.
// These are short common roots calibrated against the real distinct-value
// list (GET /doctors/specialties) so a chip actually returns real doctors.
export const SPECIALTY_SEARCH_TERM: Record<Specialty, string> = {
  cardiology: "cardio|cardiac",
  dermatology: "dermat",
  endocrinology: "endocrin|diabet",
  gastroenterology: "gastro|hepat",
  general_medicine: "internal medicine|general physician|medicine specialist|family medicine",
  general_surgery: "general surgeon|laparoscop|surgical oncol",
  gynecology: "gynec|gynaec|obstetric",
  neurology: "neuro",
  nephrology: "nephro|renal",
  oncology: "oncol",
  ophthalmology: "ophthalm",
  orthopedics: "ortho",
  otolaryngology_ent: "otolaryng|\\bent\\b",
  pediatrics: "pediatric",
  psychiatry: "psychiatr",
  pulmonology: "pulmo|chest|respiratory",
  radiology: "radiolog|sonolog",
  rheumatology: "rheumat",
  urology: "urolog",
  dentistry: "dent",
  physical_medicine: "physical medicine|physiotherap|rehabilitation",
};

export function specialtyLabel(specialty: string): string {
  return specialty
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace("Ent", "(ENT)");
}

export type Tier = "tier1" | "tier2";

export type Doctor = {
  _id: string;
  name: string;
  gender?: string;
  specialties: string[];
  degrees?: string[];
  registrationNumber?: string;
  bio?: string;
  photoUrl?: string;
  awards?: string[];
  achievements?: string[];
  publications?: string[];
  expertise?: string[];
  workExperience?: string[];
  experienceYears?: number;
  education?: string[];
  contactPhone?: string;
  tier: Tier;
  status: "verified" | "pending_review";
};

export type VisitingHour = { day?: string; startTime?: string; endTime?: string };

export type GeoPoint = { type: "Point"; coordinates: [number, number] }; // [lng, lat]

export type VisitType = { name: string; fee: number };

export type Chamber = {
  _id: string;
  doctorId: string;
  hospitalId?: { _id: string; name: string; address: string; type: string } | string | null;
  name: string;
  address: string;
  location?: GeoPoint;
  mapLink?: string;
  visitingHours?: VisitingHour[];
  visitingHoursRaw?: string;
  visitTypes?: VisitType[];
  consultationFee?: number;
  contactPhone?: string;
  isBookable: boolean;
  patientsPerHour: number;
};

// Google Maps deep link — prefers coordinates when available, falls back to a
// text-address search. No API key needed for a plain search-intent link.
export function mapsLinkFor(opts: { mapLink?: string; location?: GeoPoint; address: string }): string {
  if (opts.mapLink) return opts.mapLink;
  if (opts.location?.coordinates) {
    const [lng, lat] = opts.location.coordinates;
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(opts.address)}`;
}

export type DoctorDetail = {
  doctor: Doctor;
  chambers: Chamber[];
};

export const HOSPITAL_TYPES = ["public", "private", "diagnostic_center", "clinic"] as const;
export type HospitalType = (typeof HOSPITAL_TYPES)[number];

export function hospitalTypeLabel(type: string): string {
  return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export type Hospital = {
  _id: string;
  name: string;
  about?: string;
  mission?: string;
  vision?: string;
  address: string;
  location?: GeoPoint;
  mapLink?: string;
  type: HospitalType;
  emergency24_7: boolean;
  contactPhone?: string;
  services?: string[];
  photoUrl?: string;
  yearsInService?: number;
  feeRange?: string;
  doctorsCount: number;
  specialtyBreakdown?: { specialty?: string; doctorCount?: number }[];
};

export type HospitalDoctorSummary = Pick<Doctor, "_id" | "name" | "specialties" | "tier" | "photoUrl">;

export type HospitalDetail = {
  hospital: Hospital;
  doctors: HospitalDoctorSummary[];
};
