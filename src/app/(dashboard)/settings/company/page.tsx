"use client";

import { useEffect, useState } from "react";
import { Building2, Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function CompanyPage() {
  const { profile, updateProfile, uploadCompanyLogo } = useAuth();

  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    company_name: profile?.company_name ?? "",
    cnpj: profile?.cnpj ?? "",
    whatsapp: profile?.whatsapp ?? "",
    website: profile?.website ?? "",
    instagram: profile?.instagram ?? "",
    address: profile?.address ?? "",
    city: profile?.city ?? "",
    state: profile?.state ?? "",
    zip_code: profile?.zip_code ?? "",
  });

  const [loadingCep, setLoadingCep] = useState(false);

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCep(e.target.value);
    setForm({ ...form, zip_code: formatted });

    const digits = formatted.replace(/\D/g, "");
    if (digits.length === 8) {
      setLoadingCep(true);
      const endereco = await buscarEnderecoPorCep(formatted);
      setLoadingCep(false);

      if (endereco) {
        setForm((prev) => ({
          ...prev,
          zip_code: formatted,
          address: endereco.address,
          city: endereco.city,
          state: endereco.state,
        }));
      }
    }
  };

  useEffect(() => {
    if (!profile) return;

    setForm({
      company_name: profile.company_name ?? "",
      cnpj: profile.cnpj ?? "",
      whatsapp: profile.whatsapp ?? "",
      website: profile.website ?? "",
      instagram: profile.instagram ?? "",
      address: profile.address ?? "",
      city: profile.city ?? "",
      state: profile.state ?? "",
      zip_code: profile.zip_code ?? "",
    });
  }, [profile]);

  async function handleCompanyLogoChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    const error = await uploadCompanyLogo(file);

    if (error) {
      alert(error);
    }
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

  function formatWhatsapp(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 11); // só números, máx 11 dígitos (DDD + 9 dígitos)

    const ddd = digits.slice(0, 2);
    const parte1 = digits.slice(2, 7);
    const parte2 = digits.slice(7, 11);

    if (digits.length <= 2) return ddd ? `(${ddd}` : "";
    if (digits.length <= 7) return `(${ddd})${parte1}`;
    return `(${ddd})${parte1}.${parte2}`;
  }

  function formatCep(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 8);
    if (digits.length <= 5) return digits;
    return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  }

  async function buscarEnderecoPorCep(cep: string) {
    const digits = cep.replace(/\D/g, "");
    if (digits.length !== 8) return null;

    const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
    const data = await res.json();

    if (data.erro) return null; // CEP não encontrado

    return {
      address: data.logradouro,
      city: data.localidade,
      state: data.uf,
      neighborhood: data.bairro, // caso queira usar
    };
  }

  return (
    <div className="space-y-6 pt-8">
      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        {/* CARD LOGO */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-40 w-40 items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#0d1a35] to-[#071124]">
              {profile?.company_logo_url ? (
                <img
                  src={profile.company_logo_url}
                  alt="Logo da empresa"
                  className="h-full w-full object-contain p-4"
                />
              ) : (
                <Building2 className="h-16 w-16 text-white/20" />
              )}
            </div>

            <label className="mt-6 cursor-pointer rounded-xl border border-white/10 px-5 py-2.5 text-sm font-medium text-white/70 transition hover:bg-white/5 hover:text-white">
              Alterar logo
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCompanyLogoChange}
              />
            </label>

            <h2 className="mt-8 text-lg font-semibold text-white">
              {profile?.company_name || "Minha Empresa"}
            </h2>

            <p className="mt-1 text-sm text-white/40">
              Identidade visual da empresa
            </p>
          </div>
        </div>

        {/* FORMULÁRIO */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <h3 className="mb-6 text-lg font-semibold text-white">
            Informações da empresa
          </h3>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm text-white/60">
                Nome da empresa
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
              <label className="mb-2 block text-sm text-white/60">CNPJ</label>

              <Input
                value={form.cnpj}
                placeholder="65.035.075/0001-00"
                onChange={(e) =>
                  setForm({
                    ...form,
                    cnpj: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-white/60">
                WhatsApp
              </label>

              <Input
                value={form.whatsapp}
                onChange={(e) =>
                  setForm({
                    ...form,
                    whatsapp: formatWhatsapp(e.target.value),
                  })
                }
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-white/60">
                Website
              </label>

              <Input
                value={form.website}
                onChange={(e) =>
                  setForm({
                    ...form,
                    website: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-white/60">
                Instagram
              </label>

              <Input
                value={form.instagram}
                onChange={(e) =>
                  setForm({
                    ...form,
                    instagram: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-white/60">CEP</label>
              <Input
                value={form.zip_code}
                onChange={handleCepChange}
                placeholder="00000-000"
              />
              {loadingCep && (
                <span className="text-xs text-white/40">
                  Buscando endereço...
                </span>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm text-white/60">
                Endereço
              </label>

              <Input
                value={form.address}
                onChange={(e) =>
                  setForm({
                    ...form,
                    address: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-white/60">Cidade</label>

              <Input
                value={form.city}
                onChange={(e) =>
                  setForm({
                    ...form,
                    city: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-white/60">Estado</label>

              <Input
                value={form.state}
                onChange={(e) =>
                  setForm({
                    ...form,
                    state: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <div className="mt-8 flex flex-col items-start gap-4">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="
              inline-flex
              items-center
              m-auto
              justify-center
              rounded-xl
              accent-bg
              px-5
              py-2.5
              text-sm
              font-semibold
              text-white
              transition-all
              duration-200
              hover:bg-[var(--accent)]
              hover:shadow-lg
              hover:shadow-[var(--accent)]/20
              active:scale-[0.98]
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
            >
              {saving ? "Salvando..." : "Salvar alterações"}
            </Button>

            {saved && (
              <div className="flex items-center gap-2 m-auto text-sm text-green-400">
                <Check className="h-4 w-4" />
                Alterações salvas
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
