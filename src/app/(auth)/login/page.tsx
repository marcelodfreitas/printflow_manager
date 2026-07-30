"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/logo.png";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    let errorMsg: string | null;

    if (mode === "login") {
      errorMsg = await login(email, password);
    } else {
      errorMsg = await register(name, email, password);
    }

    if (errorMsg) {
      setError(errorMsg);
    } else {
      router.push("/");
    }
    setLoading(false);
  }

  function toggleMode() {
    setMode(mode === "login" ? "register" : "login");
    setError("");
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050914] px-4">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-[#fd6401]/10 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-[#071124]/60 blur-[120px]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.06)_1px,transparent_0)] bg-[size:32px_32px]" />

      <Card className="relative w-full max-w-sm border border-white/10 bg-white/[0.03] shadow-2xl shadow-black/40 backdrop-blur-2xl">
        {/* subtle top highlight line */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

        <CardHeader>
          <div className="flex flex-col items-center gap-4 pt-2">
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0d1a35] to-[#071124] shadow-lg shadow-[#fd6401]/10 ring-1 ring-white/10">
              <Image
                src={logo}
                alt="PrintFlow Logo"
                width={40}
                height={40}
                className="object-contain"
              />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-semibold tracking-tight text-white">
                PrintFlow Manager
              </h1>
              <p className="mt-1 text-sm text-white/50">
                {mode === "login"
                  ? "Faça login para continuar"
                  : "Crie sua conta para começar"}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <Input
                  id="name"
                  label="Nome"
                  placeholder="Seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#fd6401]/50 focus:ring-[#fd6401]/20"
                />
              </div>
            )}

            <Input
              id="email"
              label="Email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#fd6401]/50 focus:ring-[#fd6401]/20"
            />

            <Input
              id="password"
              label="Senha"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#fd6401]/50 focus:ring-[#fd6401]/20"
            />

            {error && (
              <p className="animate-in fade-in text-sm text-red-400/90 duration-200">
                {error}
              </p>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-[#071124] to-[#0d1a35] font-medium text-white shadow-lg shadow-black/30 ring-1 ring-white/10 transition-all duration-300 hover:shadow-[#fd6401]/20 hover:ring-[#fd6401]/30 disabled:opacity-60"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Aguarde...
                </span>
              ) : mode === "login" ? (
                "Entrar"
              ) : (
                "Criar Conta"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-white/40">
            {mode === "login" ? (
              <>
                Não tem uma conta?{" "}
                <button
                  type="button"
                  onClick={toggleMode}
                  className="font-medium text-white/80 transition-colors duration-300 hover:text-[#fd6401]"
                >
                  Cadastre-se
                </button>
              </>
            ) : (
              <>
                Já tem uma conta?{" "}
                <button
                  type="button"
                  onClick={toggleMode}
                  className="font-medium text-white/80 transition-colors duration-300 hover:text-[#fd6401]"
                >
                  Faça login
                </button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}