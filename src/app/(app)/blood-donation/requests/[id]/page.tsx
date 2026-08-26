"use client";

import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { bloodDonationApi } from "@/features/blood-donation/api";
import { urgencyLabel } from "@/features/blood-donation/types";
import { errorMessage } from "@/lib/error-message";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  CheckCircle2,
  ChevronLeft,
  Droplets,
  MapPin,
  Phone,
  ShieldCheck,
  User,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const URGENCY_STYLES: Record<string, string> = {
  critical: "bg-coral-600 text-white",
  urgent: "bg-coral-100 text-coral-700",
  normal: "bg-primary-50 text-primary-700",
};

type ConfirmStep = "closed" | "ask-platform" | "platform-form" | "external-form";

export default function BloodRequestDetailPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = useParams<{ id: string }>().id;
  const [confirmStep, setConfirmStep] = useState<ConfirmStep>("closed");
  const [selectedDonorId, setSelectedDonorId] = useState("");
  const [donorName, setDonorName] = useState("");
  const [donorPhone, setDonorPhone] = useState("");
  const [donationDate, setDonationDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [place, setPlace] = useState("");
  const [bags, setBags] = useState("1");

  const { data, isLoading } = useQuery({
    queryKey: ["blood-requests", "detail", id],
    queryFn: () => bloodDonationApi.getRequest(id),
  });

  function invalidateAll() {
    queryClient.invalidateQueries({ queryKey: ["blood-requests"] });
  }

  function resetConfirmForm() {
    setConfirmStep("closed");
    setSelectedDonorId("");
    setDonorName("");
    setDonorPhone("");
    setPlace("");
  }

  const interestMutation = useMutation({
    mutationFn: (interested: boolean) =>
      interested ? bloodDonationApi.expressInterest(id) : bloodDonationApi.withdrawInterest(id),
    onSuccess: () => {
      invalidateAll();
      toast.success("Updated");
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  const confirmMutation = useMutation({
    mutationFn: () =>
      confirmStep === "platform-form"
        ? bloodDonationApi.confirmDonation(id, {
            fromPlatform: true,
            donorId: selectedDonorId,
            donationDate,
            place,
            bags: Number(bags),
          })
        : bloodDonationApi.confirmDonation(id, {
            fromPlatform: false,
            donorName,
            donorPhone,
            donationDate,
            place,
            bags: Number(bags),
          }),
    onSuccess: () => {
      invalidateAll();
      resetConfirmForm();
      toast.success("Donation confirmed");
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  if (isLoading || !data) {
    return <div className="flex flex-1 items-center justify-center text-ink-700">Loading…</div>;
  }

  const { request, isOwner, hasExpressedInterest, interestCount, interestedDonors, donations } = data;

  return (
    <div className="mx-auto w-full max-w-sm px-6 py-6 pb-28">
      <button
        type="button"
        onClick={() => router.back()}
        aria-label="Go back"
        className="tap-target -ml-2 mb-4 rounded-full text-ink-700"
      >
        <ChevronLeft size={22} aria-hidden="true" />
      </button>

      <div className="glass-panel space-y-4 p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-coral-50 text-2xl font-extrabold text-coral-600">
              {request.bloodGroup}
            </span>
            <div>
              <p className="text-lg font-bold">{request.patientName ?? "A patient"} needs blood</p>
              <p className="text-sm text-ink-500">
                {request.unitsFulfilled}/{request.unitsNeeded} units fulfilled
              </p>
            </div>
          </div>
          <span
            className={`shrink-0 rounded-[var(--radius-pill)] px-2.5 py-1 text-xs font-semibold ${URGENCY_STYLES[request.urgency]}`}
          >
            {urgencyLabel(request.urgency)}
          </span>
        </div>

        <div className="space-y-2 border-t border-black/5 pt-4">
          <p className="font-medium">{request.hospitalName}</p>
          <div className="flex items-start gap-2 text-sm text-ink-700">
            <MapPin size={16} className="mt-0.5 shrink-0 text-ink-500" aria-hidden="true" />
            <span>{request.location}</span>
          </div>
          <a href={`tel:${request.contactPhone}`} className="flex items-center gap-2 text-sm text-primary-700">
            <Phone size={16} aria-hidden="true" />
            {request.contactPhone}
          </a>
          {request.neededBy && (
            <p className="text-sm text-ink-700">Needed by {format(new Date(request.neededBy), "MMM d, yyyy")}</p>
          )}
          {request.note && <p className="text-sm text-ink-700">{request.note}</p>}
        </div>

        {request.status !== "open" && (
          <p className="rounded-[var(--radius-sm)] bg-primary-50 px-3 py-2 text-center text-sm font-medium text-primary-800">
            This request is {request.status}.
          </p>
        )}
      </div>

      {!isOwner && request.status === "open" && (
        <Button
          className={`mt-4 w-full ${hasExpressedInterest ? "!bg-ink-500" : "!bg-coral-600"}`}
          disabled={interestMutation.isPending}
          onClick={() => interestMutation.mutate(!hasExpressedInterest)}
        >
          {hasExpressedInterest ? "Withdraw interest" : "I can help — I'm interested"}
        </Button>
      )}

      {!isOwner && (
        <p className="mt-2 text-center text-xs text-ink-500">{interestCount} people interested so far</p>
      )}

      {isOwner && (
        <div className="mt-6">
          <h2 className="mb-2 text-lg font-semibold">Interested donors ({interestCount})</h2>
          {interestedDonors.length === 0 && (
            <p className="text-sm text-ink-500">No one has responded yet.</p>
          )}
          <div className="space-y-2">
            {interestedDonors.map((donor) => (
              <div key={donor._id} className="glass-panel flex items-center gap-3 p-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-700">
                  <User size={18} aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{donor.name ?? "Anonymous"}</p>
                  <p className="text-xs text-ink-500">{donor.bloodGroup ?? "—"}</p>
                </div>
                {donor.phone && (
                  <a
                    href={`tel:${donor.phone}`}
                    className="tap-target flex shrink-0 items-center gap-1.5 rounded-[var(--radius-pill)] bg-primary-50 px-3 py-1.5 text-sm font-semibold text-primary-700"
                  >
                    <Phone size={14} aria-hidden="true" />
                    Call
                  </a>
                )}
              </div>
            ))}
          </div>

          {donations.length > 0 && (
            <div className="mt-4 space-y-2">
              <h3 className="text-sm font-semibold text-ink-500">Confirmed donations</h3>
              {donations.map((d) => {
                const donor = typeof d.donorId === "object" ? d.donorId : null;
                return (
                  <div key={d._id} className="glass-panel flex items-center gap-3 p-3">
                    <CheckCircle2 size={18} className="shrink-0 text-primary-600" aria-hidden="true" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{donor?.name ?? d.donorName ?? "Donor"}</p>
                      <p className="text-xs text-ink-500">
                        {d.bags} bag{d.bags === 1 ? "" : "s"} · {d.place} ·{" "}
                        {format(new Date(d.donationDate), "MMM d, yyyy")}
                      </p>
                    </div>
                    {d.pointsAwarded > 0 && (
                      <span className="shrink-0 text-xs font-semibold text-coral-600">+{d.pointsAwarded} pts</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {confirmStep === "closed" && (
            <button
              type="button"
              onClick={() => setConfirmStep("ask-platform")}
              className="tap-target mt-4 flex w-full items-center justify-center gap-2 rounded-[var(--radius-pill)] bg-primary-600 py-3 font-semibold text-white"
            >
              <ShieldCheck size={18} aria-hidden="true" />
              Confirm a donation
            </button>
          )}

          {confirmStep === "ask-platform" && (
            <div className="glass-panel mt-4 space-y-4 p-5">
              <p className="text-sm text-ink-700">Was this donor from Amar Health?</p>
              <div className="flex gap-3">
                <Button
                  variant="glass"
                  className="flex-1"
                  onClick={() => setConfirmStep("external-form")}
                >
                  No
                </Button>
                <Button className="flex-1 !bg-primary-600" onClick={() => setConfirmStep("platform-form")}>
                  Yes
                </Button>
              </div>
              <button
                type="button"
                onClick={resetConfirmForm}
                className="w-full text-center text-sm text-ink-500"
              >
                Cancel
              </button>
            </div>
          )}

          {confirmStep === "platform-form" && (
            <div className="glass-panel mt-4 space-y-4 p-5">
              {interestedDonors.length === 0 ? (
                <p className="text-sm text-ink-700">
                  No one has expressed interest yet — go back and confirm as someone off the platform
                  instead.
                </p>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-ink-700">Select the donor</p>
                  {interestedDonors.map((donor) => (
                    <button
                      key={donor._id}
                      type="button"
                      onClick={() => setSelectedDonorId(donor._id)}
                      className={`flex w-full items-center gap-3 rounded-[var(--radius-sm)] border p-3 text-left transition-colors ${
                        selectedDonorId === donor._id
                          ? "border-primary-600 bg-primary-50"
                          : "border-black/5"
                      }`}
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-700">
                        <User size={16} aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{donor.name ?? "Anonymous"}</span>
                        <span className="block text-xs text-ink-500">{donor.bloodGroup ?? "—"}</span>
                      </span>
                    </button>
                  ))}
                </div>
              )}
              <TextField
                label="Donation date"
                name="donationDate"
                type="date"
                value={donationDate}
                onChange={(e) => setDonationDate(e.target.value)}
              />
              <TextField
                label="Place"
                name="place"
                placeholder="e.g. Square Hospital"
                value={place}
                onChange={(e) => setPlace(e.target.value)}
              />
              <TextField
                label="Bags"
                name="bags"
                type="number"
                min={1}
                value={bags}
                onChange={(e) => setBags(e.target.value)}
              />
              {confirmMutation.isError && (
                <p className="text-sm text-coral-600">{errorMessage(confirmMutation.error)}</p>
              )}
              <div className="flex gap-3">
                <Button variant="glass" className="flex-1" onClick={resetConfirmForm}>
                  Cancel
                </Button>
                <Button
                  className="flex-1 !bg-primary-600"
                  disabled={confirmMutation.isPending || !selectedDonorId || !place || !donationDate}
                  onClick={() => confirmMutation.mutate()}
                >
                  {confirmMutation.isPending ? "Confirming…" : "Confirm"}
                </Button>
              </div>
            </div>
          )}

          {confirmStep === "external-form" && (
            <div className="glass-panel mt-4 space-y-4 p-5">
              <p className="text-sm text-ink-700">
                Off-platform donations are still recorded here, but there&apos;s no Amar Health profile
                to award points to.
              </p>
              <TextField
                label="Donor's name"
                name="donorName"
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
              />
              <TextField
                label="Donor's phone number"
                name="donorPhone"
                type="tel"
                value={donorPhone}
                onChange={(e) => setDonorPhone(e.target.value)}
              />
              <TextField
                label="Donation date"
                name="donationDate"
                type="date"
                value={donationDate}
                onChange={(e) => setDonationDate(e.target.value)}
              />
              <TextField
                label="Place"
                name="place"
                placeholder="e.g. Square Hospital"
                value={place}
                onChange={(e) => setPlace(e.target.value)}
              />
              <TextField
                label="Bags"
                name="bags"
                type="number"
                min={1}
                value={bags}
                onChange={(e) => setBags(e.target.value)}
              />
              {confirmMutation.isError && (
                <p className="text-sm text-coral-600">{errorMessage(confirmMutation.error)}</p>
              )}
              <div className="flex gap-3">
                <Button variant="glass" className="flex-1" onClick={resetConfirmForm}>
                  Cancel
                </Button>
                <Button
                  className="flex-1 !bg-primary-600"
                  disabled={
                    confirmMutation.isPending || !donorName || !donorPhone || !place || !donationDate
                  }
                  onClick={() => confirmMutation.mutate()}
                >
                  {confirmMutation.isPending ? "Confirming…" : "Confirm"}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {donations.length > 0 && !isOwner && (
        <div className="mt-4 flex items-center gap-2 text-sm text-ink-500">
          <Droplets size={15} aria-hidden="true" />
          {donations.length} confirmed donation{donations.length === 1 ? "" : "s"} so far
        </div>
      )}
    </div>
  );
}
