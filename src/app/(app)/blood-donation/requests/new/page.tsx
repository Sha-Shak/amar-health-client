"use client";

import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { bloodDonationApi } from "@/features/blood-donation/api";
import { BLOOD_GROUPS, type BloodGroup } from "@/features/blood-donation/types";
import { errorMessage } from "@/lib/error-message";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewBloodRequestPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [bloodGroup, setBloodGroup] = useState<BloodGroup>("A+");
  const [unitsNeeded, setUnitsNeeded] = useState("1");
  const [urgency, setUrgency] = useState("normal");
  const [patientName, setPatientName] = useState("");
  const [hospitalName, setHospitalName] = useState("");
  const [location, setLocation] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [note, setNote] = useState("");
  const [neededBy, setNeededBy] = useState("");

  const createMutation = useMutation({
    mutationFn: () =>
      bloodDonationApi.createRequest({
        bloodGroup,
        unitsNeeded: Number(unitsNeeded),
        urgency,
        patientName: patientName || undefined,
        hospitalName,
        location,
        contactPhone,
        note: note || undefined,
        neededBy: neededBy || undefined,
      }),
    onSuccess: (request) => {
      queryClient.invalidateQueries({ queryKey: ["blood-requests"] });
      router.replace(`/blood-donation/requests/${request._id}`);
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    createMutation.mutate();
  }

  return (
    <div className="mx-auto w-full max-w-sm px-6 py-6">
      <button
        type="button"
        onClick={() => router.back()}
        aria-label="Go back"
        className="tap-target -ml-2 mb-2 self-start rounded-full text-ink-700"
      >
        <ChevronLeft size={22} aria-hidden="true" />
      </button>
      <h1 className="mb-6 text-2xl font-bold">Post a blood request</h1>

      <form onSubmit={handleSubmit} className="glass-panel space-y-5 p-6">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-ink-700">Blood group needed</label>
          <div className="grid grid-cols-4 gap-2">
            {BLOOD_GROUPS.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setBloodGroup(g)}
                className={`tap-target rounded-[var(--radius-sm)] py-2 text-sm font-bold ${
                  bloodGroup === g ? "bg-coral-600 text-white" : "bg-white/70 text-ink-700"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        <TextField
          label="Units needed (bags)"
          name="unitsNeeded"
          type="number"
          min={1}
          required
          value={unitsNeeded}
          onChange={(e) => setUnitsNeeded(e.target.value)}
        />

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-ink-700">Urgency</label>
          <div className="flex gap-2">
            {["normal", "urgent", "critical"].map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => setUrgency(u)}
                className={`tap-target flex-1 rounded-[var(--radius-pill)] px-3 text-sm font-medium capitalize ${
                  urgency === u ? "bg-coral-600 text-white" : "bg-white/70 text-ink-700"
                }`}
              >
                {u}
              </button>
            ))}
          </div>
        </div>

        <TextField
          label="Patient name (optional)"
          name="patientName"
          value={patientName}
          onChange={(e) => setPatientName(e.target.value)}
        />
        <TextField
          label="Hospital / clinic"
          name="hospitalName"
          required
          value={hospitalName}
          onChange={(e) => setHospitalName(e.target.value)}
        />
        <TextField
          label="Location"
          name="location"
          placeholder="e.g. Dhanmondi, Dhaka"
          required
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <TextField
          label="Contact phone"
          name="contactPhone"
          type="tel"
          required
          value={contactPhone}
          onChange={(e) => setContactPhone(e.target.value)}
        />
        <TextField
          label="Needed by (optional)"
          name="neededBy"
          type="date"
          value={neededBy}
          onChange={(e) => setNeededBy(e.target.value)}
        />
        <TextField
          label="Note (optional)"
          name="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        {createMutation.isError && (
          <p className="text-sm text-coral-600">{errorMessage(createMutation.error)}</p>
        )}

        <Button className="w-full !bg-coral-600" disabled={createMutation.isPending}>
          {createMutation.isPending ? "Posting…" : "Post request"}
        </Button>
      </form>
    </div>
  );
}
