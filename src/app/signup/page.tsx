"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { authApi } from "@/features/auth/api";
import { errorMessage } from "@/lib/error-message";
import { useMutation } from "@tanstack/react-query";
import { Mail, Phone } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ChooseMethodPage() {
  const router = useRouter();
  const { applyAuthResult } = useAuth();
  const [googleLoadError, setGoogleLoadError] = useState<string | null>(null);

  const googleMutation = useMutation({
    mutationFn: (idToken: string) => authApi.googleAuth(idToken),
    onSuccess: (result) => {
      applyAuthResult(result);
      router.replace(result.profileComplete ? "/home" : "/profile-setup");
    },
  });

  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-8 px-6 py-10">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">Welcome to Amar Health</h1>
        <p className="text-ink-700">Choose how you&apos;d like to continue</p>
      </div>

      <div className="space-y-3">
        <GoogleSignInButton
          onCredential={(idToken) => googleMutation.mutate(idToken)}
          onError={setGoogleLoadError}
        />
        {googleLoadError && (
          <p className="text-center text-sm text-coral-600">{googleLoadError}</p>
        )}
        {googleMutation.isError && (
          <p className="text-center text-sm text-coral-600">
            {errorMessage(googleMutation.error)}
          </p>
        )}

        <div className="flex items-center gap-3 py-1 text-xs text-ink-500">
          <span className="h-px flex-1 bg-black/10" />
          or
          <span className="h-px flex-1 bg-black/10" />
        </div>

        <Link
          href="/signup/phone"
          className="glass-panel tap-target flex items-center justify-start gap-4 px-5 py-4"
        >
          <span className="tap-target rounded-full bg-primary-50 text-primary-700">
            <Phone size={20} aria-hidden="true" />
          </span>
          <span className="text-left">
            <span className="block font-semibold">Continue with phone</span>
            <span className="block text-sm text-ink-500">Sign up with phone &amp; password</span>
          </span>
        </Link>

        <Link
          href="/signup/email"
          className="glass-panel tap-target flex items-center justify-start gap-4 px-5 py-4"
        >
          <span className="tap-target rounded-full bg-primary-50 text-primary-700">
            <Mail size={20} aria-hidden="true" />
          </span>
          <span className="text-left">
            <span className="block font-semibold">Continue with email</span>
            <span className="block text-sm text-ink-500">Sign up with email &amp; password</span>
          </span>
        </Link>
      </div>

      <p className="text-center text-sm text-ink-700">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-primary-700">
          Log in
        </Link>
      </p>
    </div>
  );
}
