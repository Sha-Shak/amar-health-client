// Google Identity Services' ID-token flow: a client-side script renders the
// button and returns a signed JWT credential directly, no redirect — verified
// server-side in patient-auth.service.ts's googleAuth(). Loaded lazily, only
// when a sign-in screen actually mounts.

declare global {
  interface Window {
    google?: GoogleIdentity;
  }
}

interface GoogleIdentity {
  accounts: {
    id: {
      initialize: (config: {
        client_id: string;
        callback: (response: { credential: string }) => void;
      }) => void;
      renderButton: (
        parent: HTMLElement,
        options: {
          type?: "standard" | "icon";
          theme?: "outline" | "filled_blue" | "filled_black";
          size?: "large" | "medium" | "small";
          shape?: "rectangular" | "pill" | "circle" | "square";
          width?: number;
        }
      ) => void;
    };
  };
}

let loadPromise: Promise<GoogleIdentity> | null = null;

export function loadGoogleIdentity(): Promise<GoogleIdentity> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("loadGoogleIdentity can only run in the browser"));
  }
  if (window.google?.accounts?.id) return Promise.resolve(window.google);
  if (loadPromise) return loadPromise;

  loadPromise = new Promise<GoogleIdentity>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google?.accounts?.id) resolve(window.google);
      else reject(new Error("Couldn't load Google sign-in"));
    };
    script.onerror = () => reject(new Error("Couldn't load Google sign-in"));
    document.body.appendChild(script);
  });

  return loadPromise;
}
