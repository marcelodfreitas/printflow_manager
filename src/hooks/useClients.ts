"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { toCamelCase, toCamelCaseArray, toSnakeCase } from "@/lib/supabase/helpers";
import { getUserId } from "@/lib/supabase/auth";
import type { Client } from "@/types";

export function useClients() {
  const supabase = createClient();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("clients")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setClients(toCamelCaseArray<Client>(data));
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchClients(); }, [fetchClients]);

  async function create(input: Omit<Client, "id" | "createdAt">) {
    const userId = await getUserId();
    if (!userId) return null;
    const { data } = await supabase
      .from("clients")
      .insert({ ...toSnakeCase(input as unknown as Record<string, unknown>), user_id: userId })
      .select()
      .single();
    if (data) {
      const created = toCamelCase<Client>(data);
      setClients((prev) => [created, ...prev]);
      return created;
    }
    return null;
  }

  async function update(id: string, input: Partial<Client>) {
    const { data } = await supabase
      .from("clients")
      .update(toSnakeCase(input as unknown as Record<string, unknown>))
      .eq("id", id)
      .select()
      .single();
    if (data) {
      const updated = toCamelCase<Client>(data);
      setClients((prev) => prev.map((c) => (c.id === id ? updated : c)));
      return updated;
    }
    return null;
  }

  async function remove(id: string) {
    await supabase.from("clients").delete().eq("id", id);
    setClients((prev) => prev.filter((c) => c.id !== id));
  }

  return { clients, loading, fetchClients, create, update, remove };
}
