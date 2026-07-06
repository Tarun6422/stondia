const API_BASE = import.meta.env.VITE_API_URL ?? "";

export class ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

let refreshPromise: Promise<{ accessToken: string }> | null = null;

async function refreshTokens(): Promise<{ accessToken: string }> {
  const res = await fetch(`${API_BASE}/api/auth/refresh`, {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) throw new ApiError("Session expired", 401);
  return res.json();
}

async function request<T>(
  method: string,
  path: string,
  body?: Record<string, unknown>,
  options?: { signal?: AbortSignal },
): Promise<T> {
  const attempt = async (): Promise<T> => {
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      credentials: "include",
      body: body ? JSON.stringify(body) : undefined,
      signal: options?.signal,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new ApiError(
        data.message ?? `Request failed (${res.status})`,
        res.status,
        data.errors,
      );
    }

    return data as T;
  };

  try {
    return await attempt();
  } catch (err) {
    // Auto-refresh on 401 for non-auth routes
    if (err instanceof ApiError && err.status === 401 && !path.startsWith("/api/auth/")) {
      if (!refreshPromise) {
        refreshPromise = refreshTokens().finally(() => { refreshPromise = null; });
      }

      try {
        await refreshPromise;
        return await attempt(); // Retry original request with new cookie
      } catch {
        // Refresh failed — clear session
        refreshPromise = null;
        throw err;
      }
    }
    throw err;
  }
}

export const api = {
  get: <T>(path: string, options?: { signal?: AbortSignal }) =>
    request<T>("GET", path, undefined, options),

  post: <T>(path: string, body?: Record<string, unknown>) =>
    request<T>("POST", path, body),

  put: <T>(path: string, body?: Record<string, unknown>) =>
    request<T>("PUT", path, body),

  delete: <T>(path: string) => request<T>("DELETE", path),
};
