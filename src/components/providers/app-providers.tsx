"use client";

import { Toaster } from "sonner";
import { AuthProvider } from "./auth-provider";
import { QueryProvider } from "./query-provider";
import { ThemeProvider } from "./theme-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <AuthProvider>
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              classNames: {
                toast: "glass-panel-strong !border-0 !shadow-none",
                title: "!text-ink-900 !font-medium",
              },
            }}
          />
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
