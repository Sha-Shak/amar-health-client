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

export default function SignupEmailPage() {
  const router = useRouter();
  const { applyAuthResult } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const mutation = useMutation({
    mutationFn: () => authApi.signupEmail({ name: name || undefined, email, password }),
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
      title="Create your account"
      subtitle="Sign up with your email and a password."
      footer={
        <p className="text-center text-sm text-ink-700">
          Already have an account?{" "}
          <Link href="/login/email" className="font-semibold text-primary-700">
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
