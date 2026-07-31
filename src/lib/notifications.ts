import { createClient } from "@/lib/supabase/client";
import { getUserId } from "@/lib/supabase/auth";
import { toCamelCase } from "@/lib/supabase/helpers";
import type { AppNotification } from "@/types";

export async function createNotification(input: {
  type: AppNotification["type"];
  referenceId?: string;
  title: string;
  description?: string;
}): Promise<AppNotification | null> {
  const supabase = createClient();
  const userId = await getUserId();
  if (!userId) return null;

  const { data, error } = await supabase
    .from("notifications")
    .insert({
      user_id: userId,
      type: input.type,
      reference_id: input.referenceId || null,
      title: input.title,
      description: input.description || "",
      read: false,
    })
    .select()
    .single();

  if (error) {
    console.error("Erro ao criar notificação:", error);
    return null;
  }

  return data ? toCamelCase<AppNotification>(data) : null;
}
