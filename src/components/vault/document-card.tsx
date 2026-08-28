import type { VaultDocument } from "@/features/vault/types";
import { format } from "date-fns";
import { BadgeCheck, FileText, Pill, Receipt } from "lucide-react";
import Link from "next/link";

const TYPE_ICON = { prescription: Pill, report: FileText, bill: Receipt } as const;
const TYPE_LABEL = { prescription: "Prescription", report: "Lab Report", bill: "Bill" } as const;

export function DocumentCard({ document }: { document: VaultDocument }) {
  const Icon = TYPE_ICON[document.type];
  // A prescription issued by an Amar Health doctor from the portal — no scanned
  // image, so show a recognisable "verified e-prescription" tile instead.
  const isPlatformRx =
    document.source === "system_generated" || Boolean(document.prescriptionId);
  const isImage = Boolean(document.fileUrl) && !/\.pdf($|\?)/i.test(document.fileUrl ?? "");

  return (
    <Link href={`/vault/documents/${document._id}`} className="glass-panel flex gap-3 p-3">
      <div className="h-16 w-14 shrink-0 overflow-hidden rounded-[var(--radius-sm)] bg-ink-900/5">
        {isPlatformRx ? (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-gradient-to-br from-primary-500 to-primary-700 text-white">
            <BadgeCheck size={20} aria-hidden="true" />
            <span className="text-[8px] font-bold uppercase tracking-wide">e-Rx</span>
          </div>
        ) : isImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={document.fileUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-ink-500">
            <Icon size={20} aria-hidden="true" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1 py-0.5">
        <div className="flex items-center gap-1.5">
          <p className="truncate font-semibold">{document.tag || TYPE_LABEL[document.type]}</p>
          {isPlatformRx && (
            <span className="shrink-0 rounded-full bg-primary-50 px-1.5 py-0.5 text-[10px] font-semibold text-primary-700">
              Amar Health
            </span>
          )}
        </div>
        <p className="truncate text-sm text-ink-500">
          {document.doctorName || document.placeOfTest || TYPE_LABEL[document.type]}
        </p>
        <p className="mt-1 text-xs text-ink-500">
          {document.documentDate
            ? format(new Date(document.documentDate), "MMM d, yyyy")
            : format(new Date(document.createdAt), "MMM d, yyyy")}
        </p>
      </div>
    </Link>
  );
}
