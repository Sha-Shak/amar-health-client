"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { TagInput } from "@/components/ui/tag-input";
import { authApi, uploadFile } from "@/features/auth/api";
import { errorMessage } from "@/lib/error-message";
import { useMutation } from "@tanstack/react-query";
import imageCompression from "browser-image-compression";
import { ChevronLeft, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-", "unknown"] as const;
const TOTAL_STEPS = 4;
// Same shape the backend enforces (patient-auth.validation.ts's phoneSchema).
const PHONE_REGEX = /^(\+8801|01)[0-9]{9}$/;

export default function ProfileSetupPage() {
  const router = useRouter();
  const { user, refetch } = useAuth();
  const [step, setStep] = useState(1);

  // Step 1 — prefilled from whatever the signup step already saved (e.g. email
  // signup's name). `user` is already in the query cache by the time this page
  // mounts (applyAuthResult sets it synchronously before the redirect), so a
  // lazy initializer is enough — no effect needed for the common case.
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    () => user?.avatarUrl ?? null
  );
  const [name, setName] = useState(() => user?.name ?? "");
  const [dob, setDob] = useState(() => user?.dob?.slice(0, 10) ?? "");
  const [gender, setGender] = useState(() => user?.gender ?? "");
  // Phone is the account's one exclusive contact identifier (unique across all
  // users, enforced server-side by /patient/me/phone) — required here only when
  // the account doesn't already have one (e.g. email signup never collected it;
  // phone signup already has it and this field is skipped entirely).
  const [phone, setPhone] = useState("");

  // Step 2
  const [bloodGroup, setBloodGroup] = useState("");
  const [medicalConditions, setMedicalConditions] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);

  // Step 3
  const [contactName, setContactName] = useState("");
  const [contactRelationship, setContactRelationship] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  const [validationError, setValidationError] = useState<string>();

  const saveStep1 = useMutation({
    mutationFn: async () => {
      let avatarUrl: string | undefined;
      if (avatarFile) {
        // Avatars only ever render small (≤64px, a few multiples of that for
        // retina) — 512px/0.5MB is generous headroom, not a visible quality
        // cut, and shrinks a typical multi-MB phone-camera photo by 90%+.
        const compressed = await imageCompression(avatarFile, {
          maxSizeMB: 0.5,
          maxWidthOrHeight: 512,
          useWebWorker: true,
        });
        const { uploadUrl, fileKey } = await authApi.requestPresignedUrl(
          "avatar",
          compressed.type as "image/jpeg" | "image/png" | "image/webp"
        );
        await uploadFile(uploadUrl, compressed);
        avatarUrl = fileKey;
      }
      // Phone is set through its own endpoint (uniqueness + "can only be set
      // once" both live there — see patient-auth.service.ts's setPhone), not
      // through updateMe, which deliberately excludes phone entirely.
      if (!user?.phone && phone) {
        await authApi.setPhone(phone);
      }
      return authApi.updateMe({
        name,
        dob,
        ...(gender ? { gender } : {}),
        ...(avatarUrl ? { avatarUrl } : {}),
      });
    },
    onSuccess: () => {
      refetch();
      setStep(2);
    },
  });

  const saveStep2 = useMutation({
    mutationFn: () =>
      authApi.updateMe({
        ...(bloodGroup ? { bloodGroup } : {}),
        medicalConditions,
        allergies,
      }),
    onSuccess: () => setStep(3),
  });

  const saveStep3 = useMutation({
    mutationFn: () =>
      authApi.updateMe({
        emergencyContact: {
          name: contactName,
          relationship: contactRelationship,
          phone: contactPhone,
        },
      }),
    onSuccess: () => setStep(4),
  });

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  function handleStep1Submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !dob) {
      setValidationError("Name and date of birth are required.");
      return;
    }
    if (!user?.phone) {
      if (!phone.trim()) {
        setValidationError("Phone number is required.");
        return;
      }
      if (!PHONE_REGEX.test(phone.trim())) {
        setValidationError("Enter a valid phone number (e.g. 01XXXXXXXXX).");
        return;
      }
    }
    setValidationError(undefined);
    saveStep1.mutate();
  }

  function finish() {
    router.replace("/home");
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col px-6 py-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => (step > 1 ? setStep(step - 1) : router.back())}
          aria-label="Go back"
          className="tap-target -ml-2 rounded-full text-ink-700"
        >
          <ChevronLeft size={22} aria-hidden="true" />
        </button>
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/5">
          <div
            className="h-full rounded-full bg-primary-600 transition-all"
            style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-center gap-6 py-8">
        {step === 1 && (
          <>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">Tell us about you</h1>
              <p className="text-ink-700">This helps us personalize your vault.</p>
            </div>
            <form onSubmit={handleStep1Submit} className="glass-panel space-y-5 p-6">
              <div className="flex justify-center">
                <label className="tap-target relative h-24 w-24 cursor-pointer overflow-hidden rounded-full bg-primary-50 text-primary-700">
                  {avatarPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarPreview} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center">
                      <User size={32} aria-hidden="true" />
                    </span>
                  )}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleAvatarChange}
                    className="sr-only"
                    aria-label="Upload profile photo"
                  />
                </label>
              </div>
              <TextField
                label="Full name"
                name="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <TextField
                label="Date of birth"
                name="dob"
                type="date"
                required
                value={dob}
                onChange={(e) => setDob(e.target.value)}
              />
              {!user?.phone && (
                <TextField
                  label="Phone number"
                  name="phone"
                  type="tel"
                  required
                  placeholder="01XXXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              )}
              <div className="space-y-1.5">
                <label htmlFor="gender" className="text-sm font-medium text-ink-700">
                  Gender
                </label>
                <select
                  id="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full rounded-[var(--radius-sm)] border border-primary-400/30 bg-surface-70 px-4 py-3 text-ink-900 outline-none focus:border-primary-600/40 focus:ring-2 focus:ring-primary-600/30"
                >
                  <option value="">Prefer not to say</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </div>
              {(validationError || saveStep1.isError) && (
                <p className="text-sm text-coral-600">
                  {validationError ?? errorMessage(saveStep1.error)}
                </p>
              )}
              <Button type="submit" className="w-full" disabled={saveStep1.isPending}>
                {saveStep1.isPending ? "Saving…" : "Continue"}
              </Button>
            </form>
          </>
        )}

        {step === 2 && (
          <>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">Health basics</h1>
              <p className="text-ink-700">Optional, but helps in an emergency.</p>
            </div>
            <div className="glass-panel space-y-5 p-6">
              <div className="space-y-1.5">
                <label htmlFor="bloodGroup" className="text-sm font-medium text-ink-700">
                  Blood group
                </label>
                <select
                  id="bloodGroup"
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full rounded-[var(--radius-sm)] border border-primary-400/30 bg-surface-70 px-4 py-3 text-ink-900 outline-none focus:border-primary-600/40 focus:ring-2 focus:ring-primary-600/30"
                >
                  <option value="">Unknown</option>
                  {BLOOD_GROUPS.map((bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ))}
                </select>
              </div>
              <TagInput
                label="Medical conditions"
                values={medicalConditions}
                onChange={setMedicalConditions}
                placeholder="Type and press Enter"
              />
              <TagInput
                label="Allergies"
                values={allergies}
                onChange={setAllergies}
                placeholder="Type and press Enter"
              />
              {saveStep2.isError && (
                <p className="text-sm text-coral-600">{errorMessage(saveStep2.error)}</p>
              )}
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="glass"
                  className="flex-1"
                  onClick={() => setStep(3)}
                >
                  Skip
                </Button>
                <Button
                  type="button"
                  className="flex-1"
                  disabled={saveStep2.isPending}
                  onClick={() => saveStep2.mutate()}
                >
                  {saveStep2.isPending ? "Saving…" : "Continue"}
                </Button>
              </div>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">Emergency contact</h1>
              <p className="text-ink-700">Who should we reach in an emergency?</p>
            </div>
            <div className="glass-panel space-y-5 p-6">
              <TextField
                label="Name"
                name="contactName"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
              />
              <TextField
                label="Relationship"
                name="contactRelationship"
                placeholder="e.g. Spouse, Parent"
                value={contactRelationship}
                onChange={(e) => setContactRelationship(e.target.value)}
              />
              <TextField
                label="Phone"
                name="contactPhone"
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
              />
              {saveStep3.isError && (
                <p className="text-sm text-coral-600">{errorMessage(saveStep3.error)}</p>
              )}
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="glass"
                  className="flex-1"
                  onClick={() => setStep(4)}
                >
                  Skip
                </Button>
                <Button
                  type="button"
                  className="flex-1"
                  disabled={saveStep3.isPending}
                  onClick={() => saveStep3.mutate()}
                >
                  {saveStep3.isPending ? "Saving…" : "Continue"}
                </Button>
              </div>
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">Add your family</h1>
              <p className="text-ink-700">
                Manage records for parents, kids, or a partner from one account.
              </p>
            </div>
            <div className="glass-panel space-y-5 p-6">
              <p className="text-sm text-ink-700">
                You can invite family members any time from Settings once your vault is
                set up.
              </p>
              <Button type="button" className="w-full" onClick={finish}>
                Finish
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
