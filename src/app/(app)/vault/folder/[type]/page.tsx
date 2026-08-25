"use client";

import { DocumentList } from "@/components/vault/document-list";
import type { DocumentType } from "@/features/vault/types";
import { ChevronLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

const TYPE_LABEL: Record<DocumentType, string> = {
  prescription: "Prescriptions",
  report: "Lab Reports",
  bill: "Bills",
};

export default function FolderDetailPage() {
  const router = useRouter();
  const type = useParams<{ type: string }>().type as DocumentType;
  const label = TYPE_LABEL[type] ?? "Documents";

  return (
    <div className="flex-1">
      <div className="mx-auto flex w-full max-w-sm items-center gap-3 px-5 pt-8 pb-4">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Go back"
          className="tap-target -ml-2 rounded-full text-ink-700"
        >
          <ChevronLeft size={22} aria-hidden="true" />
        </button>
        <h1 className="text-2xl font-bold">{label}</h1>
      </div>
      <DocumentList type={type} />
    </div>
  );
}
