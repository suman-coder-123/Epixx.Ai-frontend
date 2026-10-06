import { SITE } from "@/config/site";
import type { ApiResponse } from "@/lib/shared";

// Single fetch wrapper: base URL, cookies, typed responses, normalized errors.
// Never scatter raw fetch calls through components — import apiGet/apiPost.
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${SITE.apiUrl}${path}`, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    next: { revalidate: 120 },
  });
  const json = (await res.json().catch(() => null)) as ApiResponse<T> | null;
  if (!res.ok || !json?.success) {
    throw new Error(json?.message ?? `Request failed (${res.status})`);
  }
  return json.data as T;
}

export const apiGet = <T>(path: string, init?: RequestInit) => request<T>(path, init);
export const apiPost = <T>(path: string, body: unknown) =>
  request<T>(path, { method: "POST", body: JSON.stringify(body) });
