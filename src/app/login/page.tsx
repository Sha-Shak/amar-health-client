"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { authApi } from "@/features/auth/api";
import { errorMessage } from "@/lib/error-message";
import { useMutation } from "@tanstack/react-query";
import { Mail, Phone } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginChooseMethodPage() {
  const router = useRouter();
  const { applyAuthResult } = useAuth();

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
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="text-ink-700">Choose how you&apos;d like to log in</p>
      </div>

      <div className="space-y-3">
        <GoogleSignInButton
          onCredential={(idToken) => googleMutation.mutate(idToken)}
          onError={() => {}}
        />
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
          href="/login/phone"
          className="glass-panel tap-target flex items-center gap-4 px-5 py-4"
        >
          <span className="tap-target rounded-full bg-primary-50 text-primary-700">
            <Phone size={20} aria-hidden="true" />
          </span>
          <span className="text-left">
            <span className="block font-semibold">Continue with phone</span>
            <span className="block text-sm text-ink-500">Log in with phone &amp; password</span>
          </span>
        </Link>

        <Link
          href="/login/email"
          className="glass-panel tap-target flex items-center gap-4 px-5 py-4"
        >
          <span className="tap-target rounded-full bg-primary-50 text-primary-700">
            <Mail size={20} aria-hidden="true" />
          </span>
          <span className="text-left">
            <span className="block font-semibold">Continue with email</span>
            <span className="block text-sm text-ink-500">Log in with email &amp; password</span>
          </span>
        </Link>
      </div>

      <p className="text-center text-sm text-ink-700">
        New here?{" "}
        <Link href="/signup" className="font-semibold text-primary-700">
          Create an account
        </Link>
      </p>
    </div>
  );
}
