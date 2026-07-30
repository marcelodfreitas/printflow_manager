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
    const { data } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setOrders(toCamelCaseArray<Order>(data));
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  async function create(input: Omit<Order, "id" | "createdAt">) {
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
    return null;
  }

  async function update(id: string, input: Partial<Order>) {
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
    return null;
  }

  async function remove(id: string) {
    await supabase.from("orders").delete().eq("id", id);
    setOrders((prev) => prev.filter((o) => o.id !== id));
  }

  return { orders, loading, fetchOrders, create, update, remove };
}
