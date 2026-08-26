"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { AvatarPlaceholder } from "@/components/ui/avatar-placeholder";
import { Button } from "@/components/ui/button";
import { TagInput } from "@/components/ui/tag-input";
import { TextField } from "@/components/ui/text-field";
import { authApi, uploadFile } from "@/features/auth/api";
import { errorMessage } from "@/lib/error-message";
import { useMutation } from "@tanstack/react-query";
import imageCompression from "browser-image-compression";
import { ChevronLeft, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-", "unknown"] as const;

export default function EditProfilePage() {
  const router = useRouter();
  const { user, refetch } = useAuth();

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(() => user?.avatarUrl ?? null);
  const [name, setName] = useState(() => user?.name ?? "");
  const [dob, setDob] = useState(() => user?.dob?.slice(0, 10) ?? "");
  const [gender, setGender] = useState(() => user?.gender ?? "");
  const [bloodGroup, setBloodGroup] = useState(() => user?.bloodGroup ?? "");
  const [nid, setNid] = useState(() => user?.nid ?? "");
  const [heightCm, setHeightCm] = useState(() => user?.heightCm?.toString() ?? "");
  const [weightKg, setWeightKg] = useState(() => user?.weightKg?.toString() ?? "");
  const [medicalConditions, setMedicalConditions] = useState<string[]>(
    () => user?.medicalConditions ?? []
  );
  const [allergies, setAllergies] = useState<string[]>(() => user?.allergies ?? []);
  const [contactName, setContactName] = useState(() => user?.emergencyContact?.name ?? "");
  const [contactRelationship, setContactRelationship] = useState(
    () => user?.emergencyContact?.relationship ?? ""
  );
  const [contactPhone, setContactPhone] = useState(() => user?.emergencyContact?.phone ?? "");

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  const saveMutation = useMutation({
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
      return authApi.updateMe({
        name,
        ...(dob ? { dob } : {}),
        ...(gender ? { gender } : {}),
        bloodGroup: bloodGroup || "unknown",
        nid,
        ...(heightCm ? { heightCm: Number(heightCm) } : {}),
        ...(weightKg ? { weightKg: Number(weightKg) } : {}),
        emergencyContact: {
          name: contactName,
          relationship: contactRelationship,
          phone: contactPhone,
        },
        medicalConditions,
        allergies,
        ...(avatarUrl ? { avatarUrl } : {}),
      });
    },
    onSuccess: () => {
      refetch();
      toast.success("Profile updated");
      router.back();
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  if (!user) return null;

  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col px-6 py-6">
      <button
        type="button"
        onClick={() => router.back()}
        aria-label="Go back"
        className="tap-target -ml-2 mb-2 self-start rounded-full text-ink-700"
      >
        <ChevronLeft size={22} aria-hidden="true" />
      </button>
      <h1 className="mb-6 text-2xl font-bold">Edit profile</h1>

      <div className="glass-panel space-y-5 p-6">
        <div className="flex justify-center">
          <label className="tap-target relative h-24 w-24 cursor-pointer overflow-hidden rounded-full">
            {avatarPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarPreview} alt="" className="h-full w-full object-cover" />
            ) : (
              <AvatarPlaceholder />
            )}
            <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-black/40 py-1 text-[11px] font-medium text-white">
              <User size={11} aria-hidden="true" /> Change
            </span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleAvatarChange}
              className="sr-only"
              aria-label="Upload profile photo"
            />
          </label>
        </div>

        <TextField label="Full name" name="name" value={name} onChange={(e) => setName(e.target.value)} />
        <TextField
          label="Date of birth"
          name="dob"
          type="date"
          value={dob}
          onChange={(e) => setDob(e.target.value)}
        />
        <SelectField
          label="Gender"
          value={gender}
          onChange={setGender}
          options={[
            { value: "", label: "Prefer not to say" },
            { value: "male", label: "Male" },
            { value: "female", label: "Female" },
            { value: "other", label: "Other" },
            { value: "prefer_not_to_say", label: "Prefer not to say" },
          ]}
        />
        <SelectField
          label="Blood group"
          value={bloodGroup}
          onChange={setBloodGroup}
          options={[
            { value: "", label: "Unknown" },
            ...BLOOD_GROUPS.map((bg) => ({ value: bg, label: bg })),
          ]}
        />
        <TextField label="NID (optional)" name="nid" value={nid} onChange={(e) => setNid(e.target.value)} />
        <div className="grid grid-cols-2 gap-3">
          <TextField
            label="Height (cm)"
            name="heightCm"
            type="number"
            min={50}
            max={250}
            value={heightCm}
            onChange={(e) => setHeightCm(e.target.value)}
          />
          <TextField
            label="Weight (kg)"
            name="weightKg"
            type="number"
            min={1}
            max={400}
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value)}
          />
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
      </div>

      <p className="mb-2 mt-6 px-1 text-sm font-medium text-ink-500">Emergency contact</p>
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
      </div>

      {saveMutation.isError && (
        <p className="mt-4 text-sm text-coral-600">{errorMessage(saveMutation.error)}</p>
      )}

      <Button
        className="mt-6 w-full"
        disabled={saveMutation.isPending}
        onClick={() => saveMutation.mutate()}
      >
        {saveMutation.isPending ? "Saving…" : "Save changes"}
      </Button>
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-ink-700">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-[var(--radius-sm)] border border-primary-400/30 bg-surface-70 px-4 py-3 text-ink-900 outline-none focus:border-primary-600/40 focus:ring-2 focus:ring-primary-600/30"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
