"use client";

import { useState, useEffect, useCallback } from "react";
import { toCamelCaseArray } from "@/lib/supabase/helpers";
import type { PlatformUser } from "@/types";

export function useAdminUsers(enabled = true) {
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.error ?? "Erro ao buscar usuários.");
        return;
      }

      setUsers(toCamelCaseArray<PlatformUser>(data?.users ?? []));
    } catch (err) {
      console.error("Erro ao buscar usuários:", err);
      setError("Erro ao buscar usuários.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (enabled) fetchUsers();
  }, [enabled, fetchUsers]);

  return { users, loading, error, fetchUsers };
}
