"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { toCamelCase, toCamelCaseArray } from "@/lib/supabase/helpers";
import { getUserId } from "@/lib/supabase/auth";
import type { Quote, QuoteItem } from "@/types";

type QuoteItemInput = Omit<QuoteItem, "id">;

type QuoteInput = {
  productId?: string | null;
  productName?: string;
  clientId?: string | null;
  clientName: string;
  status: Quote["status"];
  notes?: string;
  validUntil: string;
  items: QuoteItemInput[];
  subtotal: number;
  tax: number;
  total: number;
};

export function useQuotes() {
  const supabase = createClient();

  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQuotes = useCallback(async () => {
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("quotes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data) {
        const rows = toCamelCaseArray<Quote>(data);

        const withItems = await Promise.all(
          rows.map(async (quote) => {
            const { data: items, error: itemsError } = await supabase
              .from("quote_items")
              .select("*")
              .eq("quote_id", quote.id);

            if (itemsError) throw itemsError;

            return {
              ...quote,
              items: items
                ? toCamelCaseArray<QuoteItem>(items)
                : [],
            };
          }),
        );

        setQuotes(withItems);
      }
    } catch (err) {
      console.error("Erro ao buscar orçamentos:", err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);

  async function create(input: QuoteInput) {
    try {
      const userId = await getUserId();

      if (!userId) return null;

      const { data: quoteData, error: quoteError } = await supabase
        .from("quotes")
        .insert({
          product_id: input.productId || null,
          product_name: input.productName || null,
          client_id: input.clientId || null,
          client_name: input.clientName,
          status: input.status,
          notes: input.notes || null,
          valid_until: input.validUntil,
          subtotal: input.subtotal,
          tax: input.tax,
          total: input.total,
          user_id: userId,
        })
        .select()
        .single();

      if (quoteError) throw quoteError;
      if (!quoteData) return null;

      const quoteId = quoteData.id;

      if (input.items.length > 0) {
        const { error: itemsError } = await supabase
          .from("quote_items")
          .insert(
            input.items.map((item) => ({
              quote_id: quoteId,
              description: item.description,
              quantity: item.quantity,
              unit_price: item.unitPrice,
              total: item.total,

              material: item.material || null,
              weight_grams: item.weightGrams,
              print_time_hours: item.printTimeHours,

              filament_cost: item.filamentCost,
              energy_cost: item.energyCost,
              printer_cost: item.printerCost,
              labor_cost: item.laborCost,
              other_cost: item.otherCost,

              production_cost: item.productionCost,
              margin_percent: item.marginPercent,
            })),
          );

        if (itemsError) throw itemsError;
      }

      const { data: itemData, error: fetchItemsError } = await supabase
        .from("quote_items")
        .select("*")
        .eq("quote_id", quoteId);

      if (fetchItemsError) throw fetchItemsError;

      const created = toCamelCase<Quote>(quoteData);
      created.items = itemData
        ? toCamelCaseArray<QuoteItem>(itemData)
        : [];

      setQuotes((prev) => [created, ...prev]);

      return created;
    } catch (err) {
      console.error("Erro ao criar orçamento:", err);
      return null;
    }
  }

  async function update(
    id: string,
    input: Partial<QuoteInput>,
  ) {
    try {
      const updateData: Record<string, unknown> = {};

      if (input.productId !== undefined) {
        updateData.product_id = input.productId || null;
      }

      if (input.productName !== undefined) {
        updateData.product_name = input.productName || null;
      }

      if (input.clientId !== undefined) {
        updateData.client_id = input.clientId || null;
      }

      if (input.clientName !== undefined) {
        updateData.client_name = input.clientName;
      }

      if (input.status !== undefined) {
        updateData.status = input.status;
      }

      if (input.notes !== undefined) {
        updateData.notes = input.notes || null;
      }

      if (input.validUntil !== undefined) {
        updateData.valid_until = input.validUntil;
      }

      if (input.subtotal !== undefined) {
        updateData.subtotal = input.subtotal;
      }

      if (input.tax !== undefined) {
        updateData.tax = input.tax;
      }

      if (input.total !== undefined) {
        updateData.total = input.total;
      }

      const { data: quoteData, error: quoteError } = await supabase
        .from("quotes")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (quoteError) throw quoteError;
      if (!quoteData) return null;

      if (input.items !== undefined) {
        const { error: deleteError } = await supabase
          .from("quote_items")
          .delete()
          .eq("quote_id", id);

        if (deleteError) throw deleteError;

        if (input.items.length > 0) {
          const { error: insertError } = await supabase
            .from("quote_items")
            .insert(
              input.items.map((item) => ({
                quote_id: id,
                description: item.description,
                quantity: item.quantity,
                unit_price: item.unitPrice,
                total: item.total,

                material: item.material || null,
                weight_grams: item.weightGrams,
                print_time_hours: item.printTimeHours,

                filament_cost: item.filamentCost,
                energy_cost: item.energyCost,
                printer_cost: item.printerCost,
                labor_cost: item.laborCost,
                other_cost: item.otherCost,

                production_cost: item.productionCost,
                margin_percent: item.marginPercent,
              })),
            );

          if (insertError) throw insertError;
        }
      }

      const { data: itemData, error: itemsError } = await supabase
        .from("quote_items")
        .select("*")
        .eq("quote_id", id);

      if (itemsError) throw itemsError;

      const updated = toCamelCase<Quote>(quoteData);
      updated.items = itemData
        ? toCamelCaseArray<QuoteItem>(itemData)
        : [];

      setQuotes((prev) =>
        prev.map((quote) => (quote.id === id ? updated : quote)),
      );

      return updated;
    } catch (err) {
      console.error("Erro ao atualizar orçamento:", err);
      return null;
    }
  }

  async function remove(id: string) {
    try {
      const { error: itemsError } = await supabase
        .from("quote_items")
        .delete()
        .eq("quote_id", id);

      if (itemsError) throw itemsError;

      const { error: quoteError } = await supabase
        .from("quotes")
        .delete()
        .eq("id", id);

      if (quoteError) throw quoteError;

      setQuotes((prev) => prev.filter((quote) => quote.id !== id));
    } catch (err) {
      console.error("Erro ao excluir orçamento:", err);
    }
  }

  return {
    quotes,
    loading,
    fetchQuotes,
    create,
    update,
    remove,
  };
}