"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { toCamelCase, toCamelCaseArray, toSnakeCase } from "@/lib/supabase/helpers";
import { getUserId } from "@/lib/supabase/auth";
import type { SubscriptionPlan } from "@/types";

export function useSubscriptionPlans() {
  const supabase = createClient();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("subscription_plans")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setPlans(toCamelCaseArray<SubscriptionPlan>(data));
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchPlans(); }, [fetchPlans]);

  async function create(input: Omit<SubscriptionPlan, "id" | "createdAt">) {
    const userId = await getUserId();
    if (!userId) return null;
    const { data } = await supabase
      .from("subscription_plans")
      .insert({ ...toSnakeCase(input as unknown as Record<string, unknown>), user_id: userId })
      .select()
      .single();
    if (data) {
      const created = toCamelCase<SubscriptionPlan>(data);
      setPlans((prev) => [created, ...prev]);
      return created;
    }
    return null;
  }

  async function update(id: string, input: Partial<SubscriptionPlan>) {
    const { data } = await supabase
      .from("subscription_plans")
      .update(toSnakeCase(input as unknown as Record<string, unknown>))
      .eq("id", id)
      .select()
      .single();
    if (data) {
      const updated = toCamelCase<SubscriptionPlan>(data);
      setPlans((prev) => prev.map((p) => (p.id === id ? updated : p)));
      return updated;
    }
    return null;
  }

  async function remove(id: string) {
    await supabase.from("subscription_plans").delete().eq("id", id);
    setPlans((prev) => prev.filter((p) => p.id !== id));
  }

  return { plans, loading, fetchPlans, create, update, remove };
}
