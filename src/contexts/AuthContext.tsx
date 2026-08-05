"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  updateProfile: (
  data: Partial<Profile>
) => Promise<void>;
  uploadAvatar: (file: File) => Promise<string | null>;
  uploadCompanyLogo: (file: File) => Promise<string | null>;
  register: (name: string, email: string, password: string) => Promise<string | null>;
  logout: () => Promise<void>;
}

interface Profile {
  id: string;
  full_name: string | null;
  company_name: string | null;
  avatar_url: string | null;
  company_logo_url: string | null;
  phone: string | null;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser()
  .then(({ data: { user } }) => {
    setUser(user);

    if (user) {
      loadProfile(user.id);
    }

    setLoading(false);
  })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

async function updateProfile(
  data: Partial<Profile>
) {
  if (!user) return;

  const { error } = await supabase
    .from("profiles")
    .update(data)
    .eq("id", user.id);

  if (error) {
    console.error("Erro atualizando perfil:", error);
    return;
  }

  setProfile((prev) =>
    prev
      ? {
          ...prev,
          ...data,
        }
      : prev
  );
}

async function uploadCompanyLogo(file: File): Promise<string | null> {
  if (!user) return "Usuário não autenticado";

  const fileExt = file.name.split(".").pop();

  const filePath = `${user.id}/logo.${fileExt}`;


  const { error: uploadError } = await supabase.storage
    .from("company-logos")
    .upload(filePath, file, {
      upsert: true,
    });


  if (uploadError) {
    console.error("Erro upload logo:", uploadError);
    return uploadError.message;
  }


  const {
    data: { publicUrl },
  } = supabase.storage
    .from("company-logos")
    .getPublicUrl(filePath);


  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      company_logo_url: publicUrl,
    })
    .eq("id", user.id);


  if (updateError) {
    console.error("Erro salvando logo:", updateError);
    return updateError.message;
  }


  setProfile((prev) =>
    prev
      ? {
          ...prev,
          company_logo_url: publicUrl,
        }
      : prev
  );


  return null;
}

  async function uploadAvatar(file: File): Promise<string | null> {
  if (!user) return "Usuário não autenticado";

  const fileExt = file.name.split(".").pop();

  const filePath = `${user.id}/avatar.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(filePath, file, {
      upsert: true,
    });

  if (uploadError) {
    console.error("Erro upload avatar:", uploadError);
    return uploadError.message;
  }


  const {
    data: { publicUrl },
  } = supabase.storage
    .from("avatars")
    .getPublicUrl(filePath);


  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      avatar_url: publicUrl,
    })
    .eq("id", user.id);


  if (updateError) {
    console.error("Erro atualizando avatar:", updateError);
    return updateError.message;
  }


  setProfile((prev) =>
    prev
      ? {
          ...prev,
          avatar_url: publicUrl,
        }
      : prev
  );


  return null;
}

  async function loadProfile(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Erro carregando profile:", error);
    return;
  }

  setProfile(data);
}

  async function login(email: string, password: string): Promise<string | null> {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json().catch(() => ({}));

    if (data?.error) return data.error;

    const {
      data: { user: loggedUser },
    } = await supabase.auth.getUser();
    
    if (loggedUser) {
  setUser(loggedUser);
  await loadProfile(loggedUser.id);
}
    return null;
  }

  async function register(name: string, email: string, password: string): Promise<string | null> {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json().catch(() => ({}));

    if (data?.error) return data.error;

    const {
      data: { user: registeredUser },
    } = await supabase.auth.getUser();
    
    if (registeredUser) {
  setUser(registeredUser);
  await loadProfile(registeredUser.id);
}
    return null;
  }

  async function logout() {
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider
 value={{
   user,
   profile,
   isAuthenticated: !!user,
   loading,
   login,
   register,
   logout,
   updateProfile,
   uploadAvatar,
   uploadCompanyLogo,
 }}
>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
