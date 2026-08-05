"use client";

import { useEffect, useState } from "react";
import { Camera, Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Header } from "@/components/layout/Header";

export default function ProfilePage() {
  const { 
  profile,
  updateProfile,
  uploadAvatar,
  uploadCompanyLogo
} = useAuth();

  const [saved, setSaved] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    full_name: profile?.full_name ?? "",
    company_name: profile?.company_name ?? "",
    phone: profile?.phone ?? "",
  });

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name ?? "",
        company_name: profile.company_name ?? "",
        phone: profile.phone ?? "",
      });
    }
  }, [profile]);

  const [saving, setSaving] = useState(false);

async function handleCompanyLogoChange(
  event: React.ChangeEvent<HTMLInputElement>
) {
  const file = event.target.files?.[0];

  if (!file) return;

  const error = await uploadCompanyLogo(file);

  if (error) {
    alert(error);
  }
}

  async function handleAvatarChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    setUploading(true);

    const error = await uploadAvatar(file);

    if (error) {
      alert(error);
    }

    setUploading(false);
  }

  async function handleSave() {
  setSaving(true);

  await updateProfile(form);

  setSaving(false);

  setSaved(true);

  setTimeout(() => {
    setSaved(false);
  }, 3000);
}

  return (
  <>
    <Header
      title="Perfil da empresa"
      className="border-b border-white/10 bg-[#050914]/80 backdrop-blur-xl"
    />

    <div className="mx-auto max-w-4xl space-y-6 p-6 pt-8">
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* CARD AVATAR */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <div className="flex flex-col items-center text-center">
            {/* AVATAR */}
            <div className="relative">
              <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-gradient-to-br from-[#0d1a35] to-[#071124] text-4xl font-bold text-[#fd6401]">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    className="h-full w-full object-cover"
                    alt="Avatar"
                  />
                ) : (
                  profile?.full_name?.charAt(0).toUpperCase()
                )}
              </div>

              <label className="absolute bottom-0 right-0 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-[#fd6401] text-white shadow-lg transition hover:scale-105">
                <Camera className="h-5 w-5" />

                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </label>
            </div>

            {/* LOGO DA EMPRESA */}
            <div className="mt-8 w-full border-t border-white/10 pt-6">
              <p className="mb-3 text-xs uppercase tracking-wider text-white/40">
                Logo da empresa
              </p>

              <div className="flex items-center justify-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/5">
                  {profile?.company_logo_url ? (
                    <img
                      src={profile.company_logo_url}
                      className="h-full w-full object-contain"
                      alt="Logo"
                    />
                  ) : (
                    <span className="text-xl text-white/30">+</span>
                  )}
                </div>

                <label className="cursor-pointer rounded-xl border border-white/10 px-4 py-2 text-sm text-white/70 transition hover:bg-white/5">
                  Alterar logo

                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleCompanyLogoChange}
                  />
                </label>
              </div>
            </div>

            <h2 className="mt-5 text-lg font-semibold text-white">
              {profile?.company_name}
            </h2>

            <p className="text-sm text-white/40">{profile?.full_name}</p>
          </div>
        </div>

        {/* FORM */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <h3 className="mb-5 text-lg font-semibold text-white">
            Informações
          </h3>

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm text-white/60">
                Nome
              </label>

              <Input
                value={form.full_name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    full_name: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-white/60">
                Empresa
              </label>

              <Input
                value={form.company_name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    company_name: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-white/60">
                Telefone
              </label>

              <Input
                value={form.phone}
                onChange={(e) =>
                  setForm({
                    ...form,
                    phone: e.target.value,
                  })
                }
              />
            </div>

            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full sm:w-auto rounded-xl bg-[#fd6401] px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#ff7b24] hover:shadow-lg hover:shadow-[#fd6401]/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Salvando..." : "Salvar alterações"}
            </Button>

            {saved && (
              <div className="flex items-center gap-2 text-sm text-green-400">
                <Check className="h-4 w-4" />
                Alterações salvas
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </>
);
}
