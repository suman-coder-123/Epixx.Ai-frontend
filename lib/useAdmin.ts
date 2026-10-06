"use client";

import { useCallback, useEffect, useState } from "react";
import { adminGet } from "./admin-client";

export interface Me {
  id: string;
  email: string;
  role: "SuperAdmin" | "ContentManager" | "Counselor";
}

// Repeated admin data-fetching lives here — never duplicate useEffect fetch logic per page.
export function useAdminFetch<T>(path: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    if (!path) return;
    setLoading(true);
    setError("");
    try {
      setData(await adminGet<T>(path));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [path]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { data, loading, error, reload };
}

export function useMe() {
  const { data, loading, reload } = useAdminFetch<Me>("/auth/me");
  return { me: data, loading, reload };
}
