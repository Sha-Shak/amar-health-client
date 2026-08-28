"use client";

import { Button } from "@/components/ui/button";
import { DoctorAutocomplete } from "@/components/ui/doctor-autocomplete";
import { TextField } from "@/components/ui/text-field";
import { useAuth } from "@/components/providers/auth-provider";
import { prescriptionsApi } from "@/features/prescriptions/api";
import { PrescriptionView } from "@/features/prescriptions/prescription-view";
import { vaultApi } from "@/features/vault/api";
import { errorMessage } from "@/lib/error-message";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ChevronLeft, Pencil, Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const TYPE_LABEL = { prescription: "Prescription", report: "Lab Report", bill: "Bill" } as const;

export default function DocumentDetailPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = useParams<{ id: string }>().id;
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const { data: doc, isLoading } = useQuery({
    queryKey: ["vault", "documents", "detail", id],
    queryFn: () => vaultApi.getDocument(id),
  });

  const [tag, setTag] = useState("");
  const [doctorId, setDoctorId] = useState<string | undefined>();
  const [doctorName, setDoctorName] = useState("");
  const [placeOfTest, setPlaceOfTest] = useState("");
  const [note, setNote] = useState("");
  const [documentDate, setDocumentDate] = useState("");

  function startEditing() {
    if (!doc) return;
    setTag(doc.tag ?? "");
    setDoctorId(doc.doctorId);
    setDoctorName(doc.doctorName ?? "");
    setPlaceOfTest(doc.placeOfTest ?? "");
    setNote(doc.note ?? "");
    setDocumentDate(doc.documentDate ? doc.documentDate.slice(0, 10) : "");
    setEditing(true);
  }

  const updateMutation = useMutation({
    mutationFn: () =>
      vaultApi.updateDocument(id, { tag, doctorId, doctorName, placeOfTest, note, documentDate }),
    onSuccess: (updated) => {
      queryClient.setQueryData(["vault", "documents", "detail", id], updated);
      queryClient.invalidateQueries({ queryKey: ["vault", "documents"] });
      setEditing(false);
      toast.success("Updated");
    },
    onError: () => toast.error("Couldn't save changes"),
  });

  const deleteMutation = useMutation({
    mutationFn: () => vaultApi.deleteDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vault", "documents"] });
      queryClient.invalidateQueries({ queryKey: ["vault", "summary"] });
      toast.success("Document deleted");
      router.replace("/vault");
    },
    onError: () => toast.error("Couldn't delete that document"),
  });

  const { user } = useAuth();
  const rxQuery = useQuery({
    queryKey: ["patient", "prescription", doc?.prescriptionId],
    queryFn: () => prescriptionsApi.get(doc!.prescriptionId as string),
    enabled: Boolean(doc?.prescriptionId),
  });

  if (isLoading || !doc) {
    return <div className="flex flex-1 items-center justify-center text-ink-700">Loading…</div>;
  }

  // System-generated prescription — render the structured, in-app view instead of
  // a flat image hero.
  if (doc.prescriptionId) {
    return (
      <div className="mx-auto w-full max-w-md flex-1 space-y-4 px-5 py-6">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Go back"
          className="tap-target -ml-2 rounded-full text-ink-700"
        >
          <ChevronLeft size={22} aria-hidden="true" />
        </button>
        {rxQuery.isLoading && <p className="text-sm text-ink-500">Loading prescription…</p>}
        {rxQuery.isError && (
          <p className="text-sm text-coral-600">{errorMessage(rxQuery.error)}</p>
        )}
        {rxQuery.data && (
          <PrescriptionView p={rxQuery.data} lang={user?.preferredLanguage ?? "en"} />
        )}
        {!confirmingDelete ? (
          <button
            type="button"
            onClick={() => setConfirmingDelete(true)}
            className="tap-target flex w-full items-center justify-center gap-2 text-sm font-medium text-coral-600"
          >
            <Trash2 size={16} aria-hidden="true" />
            Remove from vault
          </button>
        ) : (
          <div className="glass-panel space-y-3 p-4 text-center">
            <p className="text-sm font-medium">
              Remove this prescription from your vault? The record stays with your doctor.
            </p>
            <div className="flex gap-3">
              <Button variant="glass" className="flex-1" onClick={() => setConfirmingDelete(false)}>
                Cancel
              </Button>
              <Button
                className="flex-1 !bg-coral-600"
                disabled={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate()}
              >
                {deleteMutation.isPending ? "Removing…" : "Remove"}
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="relative bg-ink-900" style={{ aspectRatio: "3 / 4" }}>
        {doc.fileUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={doc.fileUrl} alt="" className="h-full w-full object-contain" />
        )}
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Go back"
          className="glass-on-photo tap-target absolute left-4 top-[max(1rem,env(safe-area-inset-top))] rounded-full"
        >
          <ChevronLeft size={20} aria-hidden="true" />
        </button>
        {!editing && (
          <button
            type="button"
            onClick={startEditing}
            aria-label="Edit details"
            className="glass-on-photo tap-target absolute right-4 top-[max(1rem,env(safe-area-inset-top))] rounded-full"
          >
            <Pencil size={18} aria-hidden="true" />
          </button>
        )}
      </div>

      <div className="mx-auto w-full max-w-sm flex-1 space-y-5 px-5 py-6">
        {editing ? (
          <div className="glass-panel space-y-4 p-5">
            <TextField label="Label" name="tag" value={tag} onChange={(e) => setTag(e.target.value)} />
            <DoctorAutocomplete
              label="Doctor name"
              name={doctorName}
              doctorId={doctorId}
              onChange={({ name, doctorId }) => {
                setDoctorName(name);
                setDoctorId(doctorId);
              }}
            />
            <TextField
              label="Place"
              name="placeOfTest"
              value={placeOfTest}
              onChange={(e) => setPlaceOfTest(e.target.value)}
            />
            <TextField
              label="Date"
              name="documentDate"
              type="date"
              value={documentDate}
              onChange={(e) => setDocumentDate(e.target.value)}
            />
            <TextField label="Note" name="note" value={note} onChange={(e) => setNote(e.target.value)} />
            {updateMutation.isError && (
              <p className="text-sm text-coral-600">{errorMessage(updateMutation.error)}</p>
            )}
            <div className="flex gap-3">
              <Button variant="glass" className="flex-1" onClick={() => setEditing(false)}>
                Cancel
              </Button>
              <Button className="flex-1" disabled={updateMutation.isPending} onClick={() => updateMutation.mutate()}>
                {updateMutation.isPending ? "Saving…" : "Save"}
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div>
              <p className="text-sm text-ink-500">{TYPE_LABEL[doc.type]}</p>
              <h1 className="text-xl font-bold">{doc.tag || TYPE_LABEL[doc.type]}</h1>
            </div>

            <div className="glass-panel divide-y divide-black/5 p-1">
              <DetailRow label="Doctor" value={doc.doctorName} />
              <DetailRow label="Place" value={doc.placeOfTest} />
              <DetailRow
                label="Date"
                value={doc.documentDate ? format(new Date(doc.documentDate), "MMMM d, yyyy") : undefined}
              />
              <DetailRow label="Note" value={doc.note} />
            </div>

            {!confirmingDelete ? (
              <button
                type="button"
                onClick={() => setConfirmingDelete(true)}
                className="tap-target flex w-full items-center justify-center gap-2 text-sm font-medium text-coral-600"
              >
                <Trash2 size={16} aria-hidden="true" />
                Delete document
              </button>
            ) : (
              <div className="glass-panel space-y-3 p-4 text-center">
                <p className="text-sm font-medium">Delete this document? This can&apos;t be undone.</p>
                <div className="flex gap-3">
                  <Button variant="glass" className="flex-1" onClick={() => setConfirmingDelete(false)}>
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 !bg-coral-600"
                    disabled={deleteMutation.isPending}
                    onClick={() => deleteMutation.mutate()}
                  >
                    {deleteMutation.isPending ? "Deleting…" : "Delete"}
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="px-4 py-3">
      <p className="text-xs text-ink-500">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
