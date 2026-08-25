"use client";

import { DocumentList } from "@/components/vault/document-list";
import type { DocumentType } from "@/features/vault/types";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const TABS: { value: DocumentType | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "prescription", label: "Prescriptions" },
  { value: "report", label: "Reports" },
  { value: "bill", label: "Bills" },
];

export default function VaultHomePage() {
  const [tab, setTab] = useState<DocumentType | "all">("all");

  return (
    <div className="relative flex-1">
      <div className="mx-auto w-full max-w-sm px-5 pt-8">
        <h1 className="mb-4 text-2xl font-bold">Vault</h1>

        <div className="glass-panel mb-5 flex gap-1 p-1">
          {TABS.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setTab(t.value)}
              className={`flex-1 rounded-[var(--radius-pill)] px-2 py-2 text-sm font-semibold transition-colors ${
                tab === t.value ? "bg-primary-600 text-white" : "text-ink-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <DocumentList type={tab === "all" ? undefined : tab} />

      <Link
        href="/vault/add"
        aria-label="Add document"
        className="tap-target fixed bottom-28 right-5 z-30 h-14 w-14 rounded-full bg-primary-600 text-white shadow-[0_12px_28px_-8px_rgb(13_148_136/0.7)]"
      >
        <Plus size={24} className="mx-auto" aria-hidden="true" />
      </Link>
    </div>
  );
}
