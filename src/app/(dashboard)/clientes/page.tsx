"use client";

import { useState } from "react";
import { Plus, Search, Mail, Phone, MapPin } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Pencil, Trash2, Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/common";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from "@/components/ui/Table";
import Modal from "@/components/ui/Modal";
import type { Client } from "@/types";
import { useClients } from "@/hooks/useClients";
import { formatDate } from "@/lib/utils";
import { ClientMobileCard } from "@/components/clients/ClientMobileCard";

export default function ClientPage() {
  const { clients, loading, create, update, remove } = useClients();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    document: "",
    address: "",
  });

  const filtered = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  function openCreate() {
    setEditingClient(null);
    setForm({ name: "", email: "", phone: "", document: "", address: "" });
    setModalOpen(true);
  }

  function openEdit(client: Client) {
    setEditingClient(client);
    setForm({
      name: client.name,
      email: client.email,
      phone: client.phone,
      document: client.document,
      address: client.address,
    });
    setModalOpen(true);
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();

    if (editingClient) {
      update(editingClient.id, form);
    } else {
      create(form);
    }

    setModalOpen(false);
  }

  function handleDelete(id: string) {
    if (confirm("Tem certeza que deseja excluir este cliente?")) {
      remove(id);
    }
  }

  return (
    <div className="relative min-h-screen bg-[#050914]">
      <div className="pointer-events-none fixed -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-[#071124]/60 blur-[120px]" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.06)_1px,transparent_0)] bg-[size:32px_32px]" />
      

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-sm text-white/50">Carregando...</div>
        </div>
      )}

      {!loading && (
        <div className="space-y-5 px-4 py-5 sm:p-6 sm:space-y-6">
<Card className="border border-white/10 bg-white/[0.03] backdrop-blur-2xl shadow-2xl shadow-black/40">            <CardHeader className="border-b border-white/5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full flex-1 sm:max-w-xs">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                  <input
                    type="text"
                    placeholder="Buscar clientes..."
                    className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-10 pr-4 text-sm text-white placeholder:text-white/30 focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <Button
                  onClick={openCreate}
className="bg-gradient-to-r from-[#071124] to-[#0d1a35] text-white shadow-lg shadow-black/30 ring-1 ring-white/10 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(var(--accent-rgb),0.20)] hover:ring-[rgba(var(--accent-rgb),0.30)]"                >
                  <Plus className="h-4 w-4" />
                  Novo Cliente
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {/* DESKTOP / TABLET */}
<div className="hidden md:block overflow-x-auto">
  <Table>
    <TableHead className="border-b border-white/10">
      <TableRow>
        <TableHeadCell className="text-center text-white/50">
          Nome
        </TableHeadCell>

        <TableHeadCell className="text-center text-white/50">
          Contato
        </TableHeadCell>

        <TableHeadCell className="text-center text-white/50">
          Documento
        </TableHeadCell>

        <TableHeadCell className="text-center text-white/50">
          Endereço
        </TableHeadCell>

        <TableHeadCell className="text-center text-white/50">
          Cadastro
        </TableHeadCell>

        <TableHeadCell className="text-center text-white/50">
          Ações
        </TableHeadCell>
      </TableRow>
    </TableHead>

    <TableBody>
      {filtered.map((client) => (
        <TableRow
          key={client.id}
          className="border-b border-white/5 transition-colors hover:bg-white/[0.02] last:border-0"
        >
          <TableCell className="text-center">
            <p className="font-medium text-white">
              {client.name}
            </p>
          </TableCell>

          <TableCell className="text-center">
            <div className="flex flex-col items-center gap-1">
              <span className="flex items-center gap-1 text-xs text-white/40">
                <Mail className="h-3 w-3" />
                {client.email}
              </span>

              <span className="flex items-center justify-center gap-1 text-xs text-white/40">
                <Phone className="h-3 w-3" />
                {client.phone}
              </span>
            </div>
          </TableCell>

          <TableCell className="text-center text-white/70">
            {client.document}
          </TableCell>

          <TableCell className="text-center">
            <span className="flex items-center justify-center gap-1 text-xs text-white/40">
              <MapPin className="h-3 w-3" />
              {client.address}
            </span>
          </TableCell>

          <TableCell className="text-center text-white/50">
            {formatDate(client.createdAt)}
          </TableCell>

          <TableCell className="text-center">
            <div className="flex items-center justify-center gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openEdit(client)}
                className="
                  h-10
                  w-10
                  rounded-lg
                  border
                  border-white/10
                  bg-white/[0.03]
                  text-white/60
                  transition-all
                  duration-200
                  hover:border-[var(--accent)]/40
                  hover:accent-bg
                  hover:accent-text
                "
              >
                <Pencil className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(client.id)}
                className="
                  h-10
                  w-10
                  rounded-lg
                  border
                  border-white/10
                  bg-white/[0.03]
                  text-white/60
                  transition-all
                  duration-200
                  hover:border-red-500/40
                  hover:bg-red-500/10
                  hover:text-red-400
                "
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </TableCell>
        </TableRow>
      ))}

      {filtered.length === 0 && (
        <TableRow>
          <TableCell colSpan={6}>
            <div className="py-8 text-center text-sm text-white/40">
              Nenhum cliente encontrado
            </div>
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  </Table>
</div>

{/* MOBILE */}
<div className="space-y-5 p-4 md:hidden">
  {filtered.map((client) => (
    <div
  key={client.id}
  className="
    rounded-2xl
          border
          border-white/10
          bg-white/[0.03]
          p-4
          shadow-lg
          shadow-black/20
          backdrop-blur-2xl
  "
>
      {/* CABEÇALHO DO CARD */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 ">
          <h3 className="truncate text-base font-semibold text-white">
            {client.name}
          </h3>

          <p className="mt-1 text-xs text-white/40">
            {client.document || "Documento não informado"}
          </p>
        </div>

        <div className="flex shrink-0 items-center rounded-lg accent-bg px-2.5 py-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider accent-text">
            Cliente
          </span>
        </div>
      </div>

      {/* DIVISOR */}
      <div className="my-4 border-t border-white/5" />

      {/* INFORMAÇÕES */}
      <div className="space-y-3">
        {/* E-MAIL */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/5 text-white/50">
            <Mail className="h-4 w-4" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-medium uppercase tracking-wider text-white/30">
              E-mail
            </p>

            <p className="truncate text-sm text-white/70">
              {client.email || "Não informado"}
            </p>
          </div>
        </div>

        {/* TELEFONE */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/5 text-white/50">
            <Phone className="h-4 w-4" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-medium uppercase tracking-wider text-white/30">
              Telefone
            </p>

            <p className="text-sm text-white/70">
              {client.phone || "Não informado"}
            </p>
          </div>
        </div>

        {/* ENDEREÇO */}
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/5 text-white/50">
            <MapPin className="h-4 w-4" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-medium uppercase tracking-wider text-white/30">
              Endereço
            </p>

            <p className="text-sm leading-5 text-white/70">
              {client.address || "Não informado"}
            </p>
          </div>
        </div>
      </div>

      {/* RODAPÉ */}
      <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-white/25">
            Cadastro
          </p>

          <p className="mt-0.5 text-xs text-white/40">
            {formatDate(client.createdAt)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* EDITAR */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openEdit(client)}
            className="
              h-9
              w-9
              rounded-xl
              border
              border-white/10
              bg-white/[0.03]
              p-0
              text-white/60
              transition-all
              hover:border-[var(--accent)]
              hover:accent-bg
              hover:accent-text
            "
          >
            <Pencil className="h-4 w-4" />
          </Button>

          {/* EXCLUIR */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(client.id)}
            className="
              h-9
              w-9
              rounded-xl
              border
              border-white/10
              bg-white/[0.03]
              p-0
              text-white/60
              transition-all
              hover:border-red-500/40
              hover:bg-red-500/10
              hover:text-red-400
            "
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  ))}

  {/* ESTADO VAZIO */}
  {filtered.length === 0 && (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-10 text-center">
      <Users className="mx-auto h-8 w-8 text-white/20" />

      <p className="mt-3 text-sm text-white/40">
        Nenhum cliente encontrado
      </p>
    </div>
  )}
</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingClient ? "Editar Cliente" : "Novo Cliente"}
        className="border border-white/10 bg-[#0a1120]/95 backdrop-blur-2xl text-white"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            id="name"
            label="Nome"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[var(--accent)]/50 focus:ring-[var(--accent)]/20"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              id="email"
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[var(--accent)]/50 focus:ring-[var(--accent)]/20"
            />
            <Input
              id="phone"
              label="Telefone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[var(--accent)]/50 focus:ring-[var(--accent)]/20"
            />
          </div>
          <Input
            id="document"
            label="CPF/CNPJ"
            value={form.document}
            onChange={(e) => setForm({ ...form, document: e.target.value })}
            required
            className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[var(--accent)]/50 focus:ring-[var(--accent)]/20"
          />
          <Input
            id="address"
            label="Endereço"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            required
            className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[var(--accent)]/50 focus:ring-[var(--accent)]/20"
          />
          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              className="bg-white/5 text-white/70 ring-1 ring-white/10 hover:bg-white/10 hover:text-white"
              onClick={() => setModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-[#071124] to-[#0d1a35] text-white ring-1 ring-white/10 hover:ring-[var(--accent)]/30"
            >
              {editingClient ? "Salvar" : "Criar"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
