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

export default function LoginEmailPage() {
  const router = useRouter();
  const { applyAuthResult } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const mutation = useMutation({
    mutationFn: () => authApi.loginEmail({ email, password }),
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
      subtitle="Log in with your email and password."
      footer={
        <p className="text-center text-sm text-ink-700">
          Prefer phone?{" "}
          <Link href="/login/phone" className="font-semibold text-primary-700">
            Log in with phone
          </Link>{" "}
          &middot; New here?{" "}
          <Link href="/signup" className="font-semibold text-primary-700">
            Create an account
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <TextField
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
        <div className="text-right">
          <Link href="/forgot-password" className="text-sm font-medium text-primary-700">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" className="w-full" disabled={mutation.isPending}>
          {mutation.isPending ? "Logging in…" : "Log in"}
        </Button>
      </form>
    </AuthShell>
  );
}
