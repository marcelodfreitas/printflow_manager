"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { toCamelCase, toCamelCaseArray, toSnakeCase } from "@/lib/supabase/helpers";
import { getUserId } from "@/lib/supabase/auth";
import type { Quote, QuoteItem } from "@/types";

export function useQuotes() {
  const supabase = createClient();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQuotes = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("quotes")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) {
      const rows = toCamelCaseArray<Quote>(data);
      const withItems = await Promise.all(
        rows.map(async (quote) => {
          const { data: items } = await supabase
            .from("quote_items")
            .select("*")
            .eq("quote_id", quote.id);
          return {
            ...quote,
            items: items
              ? toCamelCaseArray<QuoteItem>(items)
              : [],
          } as Quote;
        }),
      );
      setQuotes(withItems);
    }
    setLoading(false);
  }, [supabase]);

  async function create(input: {
    clientId: string;
    clientName: string;
    status: Quote["status"];
    notes?: string;
    validUntil: string;
    items: Omit<QuoteItem, "id">[];
    subtotal: number;
    tax: number;
    total: number;
  }) {
    const userId = await getUserId();
    if (!userId) return null;
    const { clientId, clientName, status, notes, validUntil, items, subtotal, tax, total } = input;
    const { data: quoteData } = await supabase
      .from("quotes")
      .insert({
        client_id: clientId,
        client_name: clientName,
        status,
        notes: notes || null,
        valid_until: validUntil,
        subtotal,
        tax,
        total,
        user_id: userId,
      })
      .select()
      .single();

    if (quoteData) {
      const quoteId = quoteData.id;
      const { data: itemData } = await supabase
        .from("quote_items")
        .insert(
          items.map((item) => ({
            quote_id: quoteId,
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unitPrice,
            total: item.total,
          })),
        )
        .select();

      const created = toCamelCase<Quote>(quoteData);
      created.items = itemData ? toCamelCaseArray<QuoteItem>(itemData) : [];
      setQuotes((prev) => [created, ...prev]);
      return created;
    }
    return null;
  }

  async function update(
    id: string,
    input: {
      clientId?: string;
      clientName?: string;
      status?: Quote["status"];
      notes?: string;
      validUntil?: string;
      items?: Omit<QuoteItem, "id">[];
      subtotal?: number;
      tax?: number;
      total?: number;
    },
  ) {
    const updateData: Record<string, unknown> = {};
    if (input.clientId !== undefined) updateData.client_id = input.clientId;
    if (input.clientName !== undefined) updateData.client_name = input.clientName;
    if (input.status !== undefined) updateData.status = input.status;
    if (input.notes !== undefined) updateData.notes = input.notes;
    if (input.validUntil !== undefined) updateData.valid_until = input.validUntil;
    if (input.subtotal !== undefined) updateData.subtotal = input.subtotal;
    if (input.tax !== undefined) updateData.tax = input.tax;
    if (input.total !== undefined) updateData.total = input.total;

    const { data: quoteData } = await supabase
      .from("quotes")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (quoteData) {
      if (input.items) {
        await supabase.from("quote_items").delete().eq("quote_id", id);
        await supabase.from("quote_items").insert(
          input.items.map((item) => ({
            quote_id: id,
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unitPrice,
            total: item.total,
          })),
        );
      }

      const { data: itemData } = await supabase
        .from("quote_items")
        .select("*")
        .eq("quote_id", id);

      const updated = toCamelCase<Quote>(quoteData);
      updated.items = itemData ? toCamelCaseArray<QuoteItem>(itemData) : [];
      setQuotes((prev) => prev.map((q) => (q.id === id ? updated : q)));
      return updated;
    }
    return null;
  }

  async function remove(id: string) {
    await supabase.from("quote_items").delete().eq("quote_id", id);
    await supabase.from("quotes").delete().eq("id", id);
    setQuotes((prev) => prev.filter((q) => q.id !== id));
  }

  return { quotes, loading, fetchQuotes, create, update, remove };
}
