export type Medicine = {
  _id: string;
  brandName: string;
  type?: string;
  strength?: string;
  packageContainer?: string;
  packageSize?: string;
  dosageFormId: string;
  dosageFormName?: string;
  manufacturerId: string;
  manufacturerName?: string;
  genericId: string;
  genericName?: string;
};

export type MedicineAutocompleteItem = {
  _id: string;
  brandName: string;
  strength?: string;
  dosageFormName?: string;
  manufacturerName?: string;
  genericId: string;
  genericName?: string;
};

export type Generic = {
  _id: string;
  name: string;
  drugClass?: string;
  therapeuticClass?: string;
  patientSummary?: {
    indication?: string;
    dosage?: string;
    sideEffects?: string;
    storageConditions?: string;
  };
  clinicalDetail?: {
    pharmacology?: string;
    administration?: string;
    interaction?: string;
    contraindications?: string;
    pregnancyAndLactation?: string;
    precautions?: string;
    pediatricUsage?: string;
    overdoseEffects?: string;
    durationOfTreatment?: string;
    reconstitution?: string;
  };
};

export type MedicineDetail = {
  medicine: Medicine;
  generic: Generic | null;
  genericDetailUnavailable: boolean;
};
