import { clearTokens, getAccessToken, getRefreshToken, setTokens } from "./auth-tokens";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://amar-health.onrender.com/api/v1";

type ApiErrorBody = {
  success: false;
  error: { code: string; message: string; details?: unknown };
};

export class ApiRequestError extends Error {
  code: string;
  status: number;
  details?: unknown;

  constructor(status: number, body: ApiErrorBody) {
    super(body.error.message);
    this.status = status;
    this.code = body.error.code;
    this.details = body.error.details;
  }
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  auth?: boolean; // attach the bearer access token — default true
};

// Access tokens are short-lived (15m default — see apps/api's JWT_ACCESS_TOKEN_TTL).
// On a 401 from an authed request, refresh once and retry — otherwise every
// request past the token's lifetime would silently fail. Single-flight so N
// concurrent 401s only trigger one refresh call, not N races.
let refreshInFlight: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/patient/auth/refresh-token`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });
        if (!res.ok) return false;
        const json = await res.json();
        setTokens(json.data);
        return true;
      } catch {
        return false;
      } finally {
        refreshInFlight = null;
      }
    })();
  }
  return refreshInFlight;
}

async function request<T>(
  path: string,
  options: RequestOptions = {},
  isRetry = false
): Promise<T> {
  const { body, auth = true, headers, ...rest } = options;

  const finalHeaders = new Headers(headers);
  if (body !== undefined) {
    finalHeaders.set("Content-Type", "application/json");
  }
  if (auth) {
    const token = getAccessToken();
    if (token) finalHeaders.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: finalHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    if (res.status === 401 && auth && !isRetry) {
      const refreshed = await refreshAccessToken();
      if (refreshed) return request<T>(path, options, true);
      clearTokens();
    }
    throw new ApiRequestError(res.status, json as ApiErrorBody);
  }

  return (json as { success: true; data: T }).data;
}

export type Paginated<T> = { items: T[]; nextCursor: string | null };

// Separate from `request` because paginated endpoints (§the paginated() helper
// in apps/api's lib/apiResponse.ts) wrap items in {success, data, pagination}
// instead of just {success, data} — the caller needs nextCursor, not just data.
async function requestPaginated<T>(
  path: string,
  options: Omit<RequestOptions, "body"> = {},
  isRetry = false
): Promise<Paginated<T>> {
  const { auth = true, headers, ...rest } = options;
  const finalHeaders = new Headers(headers);
  if (auth) {
    const token = getAccessToken();
    if (token) finalHeaders.set("Authorization", `Bearer ${token}`);
  }
  const res = await fetch(`${API_BASE_URL}${path}`, { ...rest, headers: finalHeaders });
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    if (res.status === 401 && auth && !isRetry) {
      const refreshed = await refreshAccessToken();
      if (refreshed) return requestPaginated<T>(path, options, true);
      clearTokens();
    }
    throw new ApiRequestError(res.status, json as ApiErrorBody);
  }
  return { items: json.data as T[], nextCursor: json.pagination?.nextCursor ?? null };
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "GET" }),
  getPaginated: <T>(path: string, options?: Omit<RequestOptions, "body">) =>
    requestPaginated<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "POST", body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "PATCH", body }),
  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "DELETE" }),
};
