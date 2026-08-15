"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getUserId } from "@/lib/supabase/auth";

export interface UserSettings {
  id: string;
  userId: string;

  // NOTIFICAÇÕES
  notificationsSystem: boolean;
  notificationsNewOrder: boolean;
  notificationsOrderUpdate: boolean;
  notificationsPrinterOffline: boolean;
  notificationsPrintFailed: boolean;
  notificationsPrintCompleted: boolean;
  notificationsLowStock: boolean;
  notificationsEmail: boolean;

  // APARÊNCIA
  theme: "dark" | "light" | "system";
  accent: "orange" | "green" | "blue" | "purple";
  animations: boolean;

  // SISTEMA
  language: string;
  dateFormat: string;
  unit: string;
  currency: string;
  weightUnit: string;

  automaticCost: boolean;
  wasteEnabled: boolean;
  wastePercentage: number;

  confirmDelete: boolean;
  autoSave: boolean;
  successNotifications: boolean;

  createdAt: string;
  updatedAt: string;
}

function mapSettings(data: any): UserSettings {
  return {
    id: data.id,
    userId: data.user_id,

    notificationsSystem: data.notifications_system,
    notificationsNewOrder: data.notifications_new_order,
    notificationsOrderUpdate: data.notifications_order_update,
    notificationsPrinterOffline: data.notifications_printer_offline,
    notificationsPrintFailed: data.notifications_print_failed,
    notificationsPrintCompleted: data.notifications_print_completed,
    notificationsLowStock: data.notifications_low_stock,
    notificationsEmail: data.notifications_email,

    theme: data.theme,
    accent: data.accent,
    animations: data.animations,

    language: data.language,
    dateFormat: data.date_format,
    unit: data.unit,
    currency: data.currency,
    weightUnit: data.weight_unit,

    automaticCost: data.automatic_cost,
    wasteEnabled: data.waste_enabled,
    wastePercentage: Number(data.waste_percentage),

    confirmDelete: data.confirm_delete,
    autoSave: data.auto_save,
    successNotifications: data.success_notifications,

    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export function useUserSettings() {
  const supabase = createClient();

  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    setLoading(true);

    try {
      const userId = await getUserId();

      if (!userId) {
        setSettings(null);
        return;
      }

      const { data, error } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        console.error("Erro ao buscar configurações:", error);
        return;
      }

      // Se ainda não existir configuração para o usuário,
      // cria uma com os valores padrão do banco.
      if (!data) {
        const { data: created, error: createError } = await supabase
          .from("user_settings")
          .insert({
            user_id: userId,
          })
          .select()
          .single();

        if (createError) {
          console.error(
            "Erro ao criar configurações:",
            createError
          );
          return;
        }

        setSettings(mapSettings(created));
        return;
      }

      setSettings(mapSettings(data));
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSettings = useCallback(
    async (updates: Record<string, unknown>) => {
      if (!settings) return false;

      try {
        const { data, error } = await supabase
          .from("user_settings")
          .update(updates)
          .eq("id", settings.id)
          .select()
          .single();

        if (error) {
          console.error(
            "Erro ao atualizar configurações:",
            error
          );

          return false;
        }

        setSettings(mapSettings(data));

        return true;
      } catch (error) {
        console.error(
          "Erro ao atualizar configurações:",
          error
        );

        return false;
      }
    },
    [settings, supabase]
  );

  return {
    settings,
    loading,
    fetchSettings,
    updateSettings,
  };
}