"use client";

import { useState } from "react";
import { Search, ShieldAlert, Users } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { StatsCard } from "@/components/ui/StatsCard";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from "@/components/ui/Table";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminUsers } from "@/hooks/useAdminUsers";
import { formatDateTime, isAdmin } from "@/lib/utils";

export default function AdminPage() {
  const { user } = useAuth();
  const admin = isAdmin(user?.email);
  const { users, loading, error } = useAdminUsers(admin);
  const [search, setSearch] = useState("");

  if (!admin) {
    return (
      <div className="relative min-h-screen bg-[#050914]">
        <div className="pointer-events-none fixed -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-[#071124]/60 blur-[120px]" />
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.06)_1px,transparent_0)] bg-[size:32px_32px]" />

        <div className="relative flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-red-500/10 ring-1 ring-red-500/20">
            <ShieldAlert className="h-10 w-10 text-red-400" />
          </div>
          <h1 className="mt-6 text-2xl font-semibold text-white">
            Acesso restrito
          </h1>
          <p className="mt-2 max-w-md text-sm text-white/50">
            Esta página é exclusiva do administrador da plataforma.
          </p>
        </div>
      </div>
    );
  }

  const filtered = users.filter(
    (u) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative min-h-screen bg-[#050914]">
      <div className="pointer-events-none fixed -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-[#071124]/60 blur-[120px]" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.06)_1px,transparent_0)] bg-[size:32px_32px]" />
      <Header
        title="Administração"
        className="border-b border-white/10 bg-white/[0.02] backdrop-blur-xl text-white"
      />

      <div className="space-y-5 px-4 py-5 sm:p-6 sm:space-y-6">
        <StatsCard
          title="Usuários cadastrados"
          value={users.length}
          icon={<Users className="h-6 w-6" />}
          className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl transition hover:-translate-y-1 hover:border-[#fd6401]/30 hover:shadow-[0_20px_60px_rgba(253,100,1,.15)] text-white [&_svg]:text-[#fd6401]"
        />

        <Card className="border border-white/10 bg-white/[0.03] backdrop-blur-2xl shadow-2xl shadow-black/40">
          <CardHeader className="border-b border-white/5">
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
              <input
                type="text"
                placeholder="Buscar usuários..."
                className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-10 pr-4 text-sm text-white placeholder:text-white/30 focus:border-[#fd6401]/50 focus:outline-none focus:ring-1 focus:ring-[#fd6401]/30"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-sm text-white/50">Carregando...</div>
              </div>
            )}

            {!loading && error && (
              <div className="flex items-center justify-center py-12">
                <div className="text-sm text-red-400">{error}</div>
              </div>
            )}

            {!loading && !error && (
              <Table>
                <TableHead className="border-b border-white/10">
                  <TableRow>
                    <TableHeadCell className="text-center text-white/50">
                      Nome
                    </TableHeadCell>
                    <TableHeadCell className="text-center text-white/50">
                      Email
                    </TableHeadCell>
                    <TableHeadCell className="text-center text-white/50">
                      Cadastro
                    </TableHeadCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.map((item) => (
                    <TableRow
                      key={item.id}
                      className="border-b border-white/5 transition-colors hover:bg-white/[0.02] last:border-0"
                    >
                      <TableCell className="text-center">
                        <p className="font-medium text-white">{item.name || "—"}</p>
                      </TableCell>
                      <TableCell className="text-center text-white/70">
                        {item.email}
                      </TableCell>
                      <TableCell className="text-center text-white/50">
                        {formatDateTime(item.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3}>
                        <div className="py-8 text-center text-sm text-white/40">
                          Nenhum usuário encontrado
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
