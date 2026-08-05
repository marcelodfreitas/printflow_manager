"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export type Profile = {
  id: string;
  full_name: string | null;
  company_name: string | null;
  avatar_url: string | null;
  phone: string | null;
};

export function useProfile(userId?: string) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchProfile() {
    if (!userId) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Erro buscando perfil:", error);
    }

    setProfile(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  return {
    profile,
    loading,
    refreshProfile: fetchProfile,
  };
}