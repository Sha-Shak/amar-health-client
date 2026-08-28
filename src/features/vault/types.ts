export type DocumentType = "prescription" | "report" | "bill";

export type VaultDocument = {
  _id: string;
  userId: string;
  type: DocumentType;
  source: "manual_upload" | "system_generated";
  fileUrl?: string;
  tag?: string;
  doctorName?: string;
  doctorId?: string;
  prescriptionId?: string; // set on system-generated prescription documents
  placeOfTest?: string;
  note?: string;
  documentDate?: string;
  createdAt: string;
  updatedAt: string;
};

export type VaultSummary = {
  prescriptionCount: number;
  reportCount: number;
  billCount: number;
};

export type CreateDocumentInput = {
  fileKey: string;
  type: DocumentType;
  tag?: string;
  doctorId?: string;
  doctorName?: string;
  placeOfTest?: string;
  note?: string;
  documentDate?: string;
};
