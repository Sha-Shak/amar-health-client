"use client";

import { authApi } from "@/features/auth/api";
import type { AuthResult, User } from "@/features/auth/types";
import { clearTokens, getAccessToken, setTokens } from "@/lib/auth-tokens";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, useCallback, useContext } from "react";

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  hasToken: boolean;
  applyAuthResult: (result: AuthResult) => void;
  logout: () => void;
  refetch: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const hasToken = typeof window !== "undefined" && Boolean(getAccessToken());

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["patient", "me"],
    queryFn: authApi.getMe,
    enabled: hasToken,
    retry: false,
  });

  const applyAuthResult = useCallback(
    (result: AuthResult) => {
      setTokens({ accessToken: result.accessToken, refreshToken: result.refreshToken });
      queryClient.setQueryData(["patient", "me"], result.user);
    },
    [queryClient]
  );

  const logout = useCallback(() => {
    clearTokens();
    queryClient.setQueryData(["patient", "me"], null);
  }, [queryClient]);

  return (
    <AuthContext.Provider
      value={{
        user: data ?? null,
        isLoading: hasToken && isLoading,
        hasToken,
        applyAuthResult,
        logout,
        refetch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
