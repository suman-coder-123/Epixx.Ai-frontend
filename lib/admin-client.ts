import { SITE } from "@/config/site";

// Client-side admin fetch helpers: no-store, httpOnly JWT cookie attached.
// Server Components keep using lib/api.ts — these are for "use client" admin screens.
async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${SITE.apiUrl}${path}`, {
    ...init,
    credentials: "include",
    cache: "no-store",
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const json = (await res.json().catch(() => null)) as {
    success?: boolean;
    data?: T;
    message?: string;
  } | null;
  if (!res.ok || !json?.success) {
    throw new Error(json?.message ?? `Request failed (${res.status})`);
  }
  return json.data as T;
}

export const adminGet = <T>(path: string) => req<T>(path);
export const adminPost = <T>(path: string, body: unknown) =>
  req<T>(path, { method: "POST", body: JSON.stringify(body) });
export const adminPatch = <T>(path: string, body: unknown) =>
  req<T>(path, { method: "PATCH", body: JSON.stringify(body) });
export const adminPut = <T>(path: string, body: unknown) =>
  req<T>(path, { method: "PUT", body: JSON.stringify(body) });
export const adminDel = (path: string) =>
  req<null>(path, { method: "DELETE" });

export function downloadCsv(filename: string, rows: Array<Record<string, unknown>>) {
  if (!rows.length) return;
  const heads = Object.keys(rows[0] as object);
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = [heads.join(","), ...rows.map((r) => heads.map((h) => esc(r[h])).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// Ask Next.js to drop cached public pages after an admin save.
// Same-origin call — works on localhost and on hosting. Never throws;
// a revalidation failure must not fail the save itself.
export async function revalidatePaths(paths: string[]): Promise<void> {
  try {
    await fetch("/api/revalidate", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paths }),
    });
  } catch {
    // ignore — pages still refresh via the ISR window
  }
}
