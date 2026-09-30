"use client";

import { useRef, useState } from "react";
import { Camera, Save } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const BUCKET = "avatars";

export default function ProfilePage() {
  const supabase = createClient();
  const { user, updateProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const metadata = user?.user_metadata ?? {};
  const [company, setCompany] = useState((metadata.company as string) ?? "");
  const [username, setUsername] = useState((metadata.username as string) ?? "");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | undefined>(
    metadata.avatar_url as string | undefined,
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Selecione um arquivo de imagem válido.");
      return;
    }

    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
    setError(null);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!user) return;

    let savedAvatarUrl: string | null = preview ?? null;

    if (selectedFile) {
      setSaving(true);
      const ext = selectedFile.name.split(".").pop() ?? "png";
      const path = `${user.id}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, selectedFile, { upsert: true });

      if (uploadError) {
        setSaving(false);
        setError(uploadError.message);
        return;
      }

      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
      savedAvatarUrl = data.publicUrl;
    }

    const result = await updateProfile({
      company,
      username,
      avatar_url: savedAvatarUrl,
    });
    setSaving(false);
    if (result) setError(result);
  }

  return (
    <div className="relative min-h-screen bg-[#050914]">
      <div className="pointer-events-none fixed -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-[#071124]/60 blur-[120px]" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.06)_1px,transparent_0)] bg-[size:32px_32px]" />
      <Header
        title="Perfil"
        className="border-b border-white/10 bg-white/[0.02] backdrop-blur-xl text-white"
      />

      <div className="mx-auto max-w-xl space-y-6 px-4 py-6 sm:p-6">
        <Card className="border border-white/10 bg-white/[0.03] backdrop-blur-2xl shadow-2xl shadow-black/40">
          <CardHeader className="border-b border-white/5">
            <h2 className="text-sm font-semibold text-white">Dados do perfil</h2>
          </CardHeader>
          <CardContent className="space-y-5 pt-6">
            <form onSubmit={handleSave} className="space-y-5">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="group relative h-20 w-20 shrink-0 overflow-hidden rounded-full ring-2 ring-white/10 transition hover:ring-[#fd6401]/50"
                >
                  {preview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={preview}
                      alt="Avatar"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#0d1a35] to-[#071124] text-2xl font-medium text-[#fd6401]">
                      {company.charAt(0).toUpperCase() || "P"}
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition group-hover:opacity-100">
                    <Camera className="h-6 w-6 text-white" />
                  </div>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white">
                    Foto da empresa
                  </p>
                  <p className="mt-0.5 text-xs text-white/40">
                    Aparece no cabeçalho no lugar do seu nome.
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-2 text-xs font-medium text-[#fd6401] transition hover:text-[#ff7b24]"
                  >
                    Selecionar imagem
                  </button>
                </div>
              </div>

              <Input
                id="company"
                label="Nome da empresa"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#fd6401]/50 focus:ring-[#fd6401]/20"
              />
              <Input
                id="email"
                label="Email"
                type="email"
                value={user?.email ?? ""}
                disabled
                className="bg-white/5 border-white/10 text-white/40 placeholder:text-white/30 focus:border-[#fd6401]/50 focus:ring-[#fd6401]/20"
              />
              <Input
                id="username"
                label="Nome de usuário"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#fd6401]/50 focus:ring-[#fd6401]/20"
              />

              {error && (
                <p className="text-sm text-red-400">{error}</p>
              )}

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-gradient-to-r from-[#fd6401] to-[#ff7b24] text-white ring-1 ring-white/10 hover:ring-white/20"
                >
                  <Save className="h-4 w-4" />
                  {saving ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}