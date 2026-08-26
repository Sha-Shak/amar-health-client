"use client";

import { RegisterServiceWorker } from "@/components/pwa/register-service-worker";
import { SplashScreen } from "@/components/splash/splash-screen";
import { Toaster } from "sonner";
import { AuthProvider } from "./auth-provider";
import { BrandColorsProvider } from "./brand-colors-provider";
import { QueryProvider } from "./query-provider";
import { ThemeProvider, useTheme } from "./theme-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <BrandColorsProvider>
        <QueryProvider>
          <AuthProvider>
            <SplashScreen />
            <RegisterServiceWorker />
            {children}
            <ThemedToaster />
          </AuthProvider>
        </QueryProvider>
      </BrandColorsProvider>
    </ThemeProvider>
  );
}

// Sonner's own default styling assumes a light theme unless told otherwise —
// without passing `theme`, its toast used a light background/border baked
// in regardless of our glass-panel-strong override, which is exactly why it
// went unreadable (near-invisible) in dark mode. Needs its own component so
// useTheme() runs inside ThemeProvider's tree, not in AppProviders itself
// (which renders ThemeProvider, so it sits outside that context).
function ThemedToaster() {
  const { theme } = useTheme();
  return (
    <Toaster
      position="top-center"
      theme={theme}
      toastOptions={{
        classNames: {
          toast: "glass-panel-strong !border-0 !shadow-none",
          title: "!text-ink-900 !font-medium",
          description: "!text-ink-700",
        },
      }}
    />
  );
}
