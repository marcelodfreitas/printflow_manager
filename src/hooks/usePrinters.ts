"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { toCamelCase, toCamelCaseArray, toSnakeCase } from "@/lib/supabase/helpers";
import { getUserId } from "@/lib/supabase/auth";
import type { Printer } from "@/types";

export function usePrinters() {
  const supabase = createClient();
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPrinters = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from("printers")
        .select("*")
        .order("created_at", { ascending: false });
      if (data) setPrinters(toCamelCaseArray<Printer>(data));
    } catch (err) {
      console.error("Erro ao buscar impressoras:", err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => { fetchPrinters(); }, [fetchPrinters]);

  async function create(input: Omit<Printer, "id" | "createdAt">) {
    try {
      const userId = await getUserId();
      if (!userId) return null;
      const { data } = await supabase
        .from("printers")
        .insert({ ...toSnakeCase(input as unknown as Record<string, unknown>), user_id: userId })
        .select()
        .single();
      if (data) {
        const created = toCamelCase<Printer>(data);
        setPrinters((prev) => [created, ...prev]);
        return created;
      }
    } catch (err) {
      console.error("Erro ao criar impressora:", err);
    }
    return null;
  }

  async function update(id: string, input: Partial<Printer>) {
    try {
      const { data } = await supabase
        .from("printers")
        .update(toSnakeCase(input as unknown as Record<string, unknown>))
        .eq("id", id)
        .select()
        .single();
      if (data) {
        const updated = toCamelCase<Printer>(data);
        setPrinters((prev) => prev.map((p) => (p.id === id ? updated : p)));
        return updated;
      }
    } catch (err) {
      console.error("Erro ao atualizar impressora:", err);
    }
    return null;
  }

  async function remove(id: string) {
    try {
      await supabase.from("printers").delete().eq("id", id);
      setPrinters((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Erro ao excluir impressora:", err);
    }
  }

  return { printers, loading, fetchPrinters, create, update, remove };
}
