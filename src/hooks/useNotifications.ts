"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { getUserId } from "@/lib/supabase/auth";
import { toCamelCaseArray } from "@/lib/supabase/helpers";
import { usePrinters } from "@/hooks/usePrinters";
import type { AppNotification } from "@/types";

const MAINTENANCE_DAYS = 30;

export function useNotifications() {
  const supabase = createClient();
  const { printers, loading: printersLoading } = usePrinters();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const attemptedMaintenance = useRef<Set<string>>(new Set());

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (data) setNotifications(toCamelCaseArray<AppNotification>(data));
    } catch (err) {
      console.error("Erro ao buscar notificações:", err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    const interval = setInterval(() => fetchNotifications(), 30_000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    if (printersLoading || !printers.length) return;

    const overdue = printers.filter((printer) => {
      const last = new Date(printer.lastMaintenance);
      if (Number.isNaN(last.getTime())) return false;
      const days = (Date.now() - last.getTime()) / 86_400_000;
      return days > MAINTENANCE_DAYS;
    });

    overdue.forEach(async (printer) => {
      const key = `maintenance:${printer.id}`;
      if (attemptedMaintenance.current.has(key)) return;

      const exists = notifications.some(
        (n) =>
          n.type === "maintenance" && n.referenceId === printer.id,
      );
      if (exists) {
        attemptedMaintenance.current.add(key);
        return;
      }

      attemptedMaintenance.current.add(key);
      const userId = await getUserId();
      if (!userId) return;

      const { error } = await supabase.from("notifications").insert({
        user_id: userId,
        type: "maintenance",
        reference_id: printer.id,
        title: "Manutenção atrasada",
        description: `${printer.name} está há mais de ${MAINTENANCE_DAYS} dias sem manutenção (última em ${new Date(
          printer.lastMaintenance,
        ).toLocaleDateString("pt-BR")}).`,
        read: false,
      });

      if (!error) fetchNotifications();
    });
  }, [printers, printersLoading, notifications, supabase, fetchNotifications]);

  async function markAllRead() {
    const userId = await getUserId();
    if (!userId) return;
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", userId)
      .eq("read", false);
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true })),
    );
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return { notifications, loading, unreadCount, refresh: fetchNotifications, markAllRead };
}
