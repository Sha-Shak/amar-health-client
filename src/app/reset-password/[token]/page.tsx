"use client";

import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { authApi } from "@/features/auth/api";
import { errorMessage } from "@/lib/error-message";
import { useMutation } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const token = useParams<{ token: string }>().token;
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validationError, setValidationError] = useState<string>();

  const mutation = useMutation({
    mutationFn: () => authApi.resetPassword(token, password),
    onSuccess: () => router.replace("/login/email"),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      setValidationError("Passwords don't match");
      return;
    }
    setValidationError(undefined);
    mutation.mutate();
  }

  return (
    <AuthShell title="Choose a new password" subtitle="Make it at least 8 characters.">
      <form onSubmit={handleSubmit} className="space-y-5">
        <TextField
          label="New password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <TextField
          label="Confirm new password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={
            validationError ?? (mutation.isError ? errorMessage(mutation.error) : undefined)
          }
        />
        <Button type="submit" className="w-full" disabled={mutation.isPending}>
          {mutation.isPending ? "Updating…" : "Update password"}
        </Button>
      </form>
    </AuthShell>
  );
}
