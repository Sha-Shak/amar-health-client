"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { authApi } from "@/features/auth/api";
import { errorMessage } from "@/lib/error-message";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const PHONE_REGEX = /^(\+8801|01)[0-9]{9}$/;

export default function SignupPhonePage() {
  const router = useRouter();
  const { applyAuthResult } = useAuth();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [validationError, setValidationError] = useState<string>();

  const mutation = useMutation({
    mutationFn: () => authApi.signupPhone({ name: name || undefined, phone, password }),
    onSuccess: (result) => {
      applyAuthResult(result);
      router.replace(result.profileComplete ? "/home" : "/profile-setup");
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!PHONE_REGEX.test(phone)) {
      setValidationError("Enter a valid Bangladeshi number, e.g. 01XXXXXXXXX");
      return;
    }
    setValidationError(undefined);
    mutation.mutate();
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Sign up with your phone number and a password."
      footer={
        <p className="text-center text-sm text-ink-700">
          Already have an account?{" "}
          <Link href="/login/phone" className="font-semibold text-primary-700">
            Log in
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <TextField
          label="Name"
          name="name"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          label="Phone number"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="01XXXXXXXXX"
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          error={validationError}
        />
        <TextField
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={mutation.isError ? errorMessage(mutation.error) : undefined}
        />
        <Button type="submit" className="w-full" disabled={mutation.isPending}>
          {mutation.isPending ? "Creating account…" : "Create account"}
        </Button>
      </form>
    </AuthShell>
  );
}
