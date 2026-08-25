"use client";

import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { authApi } from "@/features/auth/api";
import { errorMessage } from "@/lib/error-message";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");

  const mutation = useMutation({
    mutationFn: () => authApi.forgotPassword(email),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    mutation.mutate();
  }

  if (mutation.isSuccess) {
    return (
      <AuthShell title="Check your email" subtitle="If that email exists, we've sent a reset link.">
        <p className="text-sm text-ink-700">
          Follow the link we sent to {email} to choose a new password.
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Reset your password" subtitle="We'll email you a link to reset it.">
      <form onSubmit={handleSubmit} className="space-y-5">
        <TextField
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          required
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={mutation.isError ? errorMessage(mutation.error) : undefined}
        />
        <Button type="submit" className="w-full" disabled={mutation.isPending}>
          {mutation.isPending ? "Sending…" : "Send reset link"}
        </Button>
      </form>
    </AuthShell>
  );
}
