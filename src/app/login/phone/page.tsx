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

export default function LoginPhonePage() {
  const router = useRouter();
  const { applyAuthResult } = useAuth();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const mutation = useMutation({
    mutationFn: () => authApi.loginPhone({ phone, password }),
    onSuccess: (result) => {
      applyAuthResult(result);
      router.replace(result.profileComplete ? "/home" : "/profile-setup");
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    mutation.mutate();
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in with your phone number and password."
      footer={
        <p className="text-center text-sm text-ink-700">
          New here?{" "}
          <Link href="/signup" className="font-semibold text-primary-700">
            Create an account
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
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
        />
        <TextField
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={mutation.isError ? errorMessage(mutation.error) : undefined}
        />
        <Button type="submit" className="w-full" disabled={mutation.isPending}>
          {mutation.isPending ? "Logging in…" : "Log in"}
        </Button>
      </form>
    </AuthShell>
  );
}
