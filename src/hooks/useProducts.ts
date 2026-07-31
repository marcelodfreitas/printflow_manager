"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { toCamelCase, toCamelCaseArray, toSnakeCase } from "@/lib/supabase/helpers";
import { getUserId } from "@/lib/supabase/auth";
import type { Product } from "@/types";

export function useProducts() {
  const supabase = createClient();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
      if (data) setProducts(toCamelCaseArray<Product>(data));
    } catch (err) {
      console.error("Erro ao buscar produtos:", err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  async function create(input: Omit<Product, "id" | "createdAt">) {
    try {
      const userId = await getUserId();
      if (!userId) return null;
      const { data } = await supabase
        .from("products")
        .insert({ ...toSnakeCase(input as unknown as Record<string, unknown>), user_id: userId })
        .select()
        .single();
      if (data) {
        const created = toCamelCase<Product>(data);
        setProducts((prev) => [created, ...prev]);
        return created;
      }
    } catch (err) {
      console.error("Erro ao criar produto:", err);
    }
    return null;
  }

  async function update(id: string, input: Partial<Product>) {
    try {
      const { data } = await supabase
        .from("products")
        .update(toSnakeCase(input as unknown as Record<string, unknown>))
        .eq("id", id)
        .select()
        .single();
      if (data) {
        const updated = toCamelCase<Product>(data);
        setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
        return updated;
      }
    } catch (err) {
      console.error("Erro ao atualizar produto:", err);
    }
    return null;
  }

  async function remove(id: string) {
    try {
      await supabase.from("products").delete().eq("id", id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Erro ao excluir produto:", err);
    }
  }

  return { products, loading, fetchProducts, create, update, remove };
}
