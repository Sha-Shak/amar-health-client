// The backend uses bearer JWTs (access + refresh), not session cookies —
// see apps/api/src/middleware/auth.ts. Tokens are kept in localStorage and
// attached as `Authorization: Bearer <token>` by the API client below.

const ACCESS_KEY = "hv-access-token";
const REFRESH_KEY = "hv-refresh-token";

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(REFRESH_KEY);
}

export function setTokens(tokens: { accessToken: string; refreshToken: string }) {
  window.localStorage.setItem(ACCESS_KEY, tokens.accessToken);
  window.localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
}

export function clearTokens() {
  window.localStorage.removeItem(ACCESS_KEY);
  window.localStorage.removeItem(REFRESH_KEY);
}
