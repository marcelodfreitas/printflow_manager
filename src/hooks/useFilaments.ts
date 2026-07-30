"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { toCamelCase, toCamelCaseArray, toSnakeCase } from "@/lib/supabase/helpers";
import { getUserId } from "@/lib/supabase/auth";
import type { Filament } from "@/types";

export function useFilaments() {
  const supabase = createClient();
  const [filaments, setFilaments] = useState<Filament[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFilaments = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("filaments")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setFilaments(toCamelCaseArray<Filament>(data));
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchFilaments(); }, [fetchFilaments]);

  async function create(input: Omit<Filament, "id" | "createdAt">) {
    const userId = await getUserId();
    if (!userId) return null;
    const { data } = await supabase
      .from("filaments")
      .insert({ ...toSnakeCase(input as unknown as Record<string, unknown>), user_id: userId })
      .select()
      .single();
    if (data) {
      const created = toCamelCase<Filament>(data);
      setFilaments((prev) => [created, ...prev]);
      return created;
    }
    return null;
  }

  async function update(id: string, input: Partial<Filament>) {
    const { data } = await supabase
      .from("filaments")
      .update(toSnakeCase(input as unknown as Record<string, unknown>))
      .eq("id", id)
      .select()
      .single();
    if (data) {
      const updated = toCamelCase<Filament>(data);
      setFilaments((prev) => prev.map((f) => (f.id === id ? updated : f)));
      return updated;
    }
    return null;
  }

  async function remove(id: string) {
    await supabase.from("filaments").delete().eq("id", id);
    setFilaments((prev) => prev.filter((f) => f.id !== id));
  }

  return { filaments, loading, fetchFilaments, create, update, remove };
}
