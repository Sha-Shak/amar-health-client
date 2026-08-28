export type MealTiming = "before_meal" | "after_meal" | "with_meal" | "none";
export type DoseSchedule = { morning: number; afternoon: number; night: number };

export type PrescriptionMedicine = {
  medicineId?: { _id: string; brandName: string; genericName?: string; strength?: string } | string | null;
  freeTextName?: string;
  dosage: string;
  doseSchedule: DoseSchedule;
  mealTiming: MealTiming;
  durationDays?: number | string;
  route?: string;
  frequencyCode?: string;
  quantity?: number;
  instructionText?: string;
};

type ClinicalItem = {
  symptomId?: { _id: string; name: string } | string | null;
  findingId?: { _id: string; name: string } | string | null;
  freeText?: string;
};

export type PatientPrescription = {
  _id: string;
  status: "draft" | "finalized";
  finalizedAt?: string;
  createdAt: string;
  pdfUrl?: string;
  doctorId: {
    _id: string;
    name: string;
    degrees?: string[];
    specialties?: string[];
    registrationNumber?: string;
    photoUrl?: string;
  };
  patientId: { _id: string; name?: string; dob?: string; gender?: string; patientCode: string };
  chamberSnapshot?: {
    name?: string;
    hospitalName?: string;
    address?: string;
    contactPhone?: string;
  };
  vitals?: Record<string, number | string | undefined>;
  symptoms?: { items?: ClinicalItem[]; notes?: string };
  examinationFindings?: { items?: ClinicalItem[]; notes?: string };
  diagnosis?: string;
  medicines?: PrescriptionMedicine[];
  medicinesNotes?: string;
  testsRecommended?: {
    testId?: { _id: string; test_name: string } | string | null;
    freeTextName?: string;
    notes?: string;
  }[];
  testsNotes?: string;
  followUp?: { date?: string; relativeDescription?: string; instructions?: string };
  additionalNotes?: string;
};

export type PrescriptionListItem = {
  _id: string;
  status: "draft" | "finalized";
  finalizedAt?: string;
  createdAt: string;
  diagnosis?: string;
  pdfUrl?: string;
  doctorId?: { _id: string; name: string; specialties?: string[] } | null;
};
