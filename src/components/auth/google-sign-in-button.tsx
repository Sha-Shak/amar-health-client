"use client";

import { loadGoogleIdentity } from "@/lib/google-identity-loader";
import { useEffect, useRef, useState } from "react";

export function GoogleSignInButton({
  onCredential,
  onError,
}: {
  onCredential: (idToken: string) => void;
  onError?: (message: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId || !containerRef.current) return;

    let cancelled = false;
    loadGoogleIdentity()
      .then((google) => {
        if (cancelled || !containerRef.current) return;
        google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => onCredential(response.credential),
        });
        google.accounts.id.renderButton(containerRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          shape: "pill",
          width: 327,
        });
        setReady(true);
      })
      .catch((err) => onError?.(err instanceof Error ? err.message : "Couldn't load Google sign-in"));

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) return null;

  return (
    <div className="relative flex justify-center">
      {!ready && (
        <div
          className="absolute inset-0 animate-pulse rounded-full bg-black/5"
          aria-hidden="true"
        />
      )}
      <div ref={containerRef} />
    </div>
  );
}
