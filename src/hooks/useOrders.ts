"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { toCamelCase, toCamelCaseArray, toSnakeCase } from "@/lib/supabase/helpers";
import { getUserId } from "@/lib/supabase/auth";
import type { Order } from "@/types";

export function useOrders() {
  const supabase = createClient();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (data) setOrders(toCamelCaseArray<Order>(data));
    } catch (err) {
      console.error("Erro ao buscar pedidos:", err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  async function create(input: Omit<Order, "id" | "createdAt">) {
    try {
      const userId = await getUserId();
      if (!userId) return null;
      const { data } = await supabase
        .from("orders")
        .insert({ ...toSnakeCase(input as unknown as Record<string, unknown>), user_id: userId })
        .select()
        .single();
      if (data) {
        const created = toCamelCase<Order>(data);
        setOrders((prev) => [created, ...prev]);
        return created;
      }
    } catch (err) {
      console.error("Erro ao criar pedido:", err);
    }
    return null;
  }

  async function update(id: string, input: Partial<Order>) {
    try {
      const { data } = await supabase
        .from("orders")
        .update(toSnakeCase(input as unknown as Record<string, unknown>))
        .eq("id", id)
        .select()
        .single();
      if (data) {
        const updated = toCamelCase<Order>(data);
        setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
        return updated;
      }
    } catch (err) {
      console.error("Erro ao atualizar pedido:", err);
    }
    return null;
  }

  async function remove(id: string) {
    try {
      await supabase.from("orders").delete().eq("id", id);
      setOrders((prev) => prev.filter((o) => o.id !== id));
    } catch (err) {
      console.error("Erro ao excluir pedido:", err);
    }
  }

  return { orders, loading, fetchOrders, create, update, remove };
}
