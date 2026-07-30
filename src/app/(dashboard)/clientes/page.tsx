"use client";

import { useState } from "react";
import { Plus, Search, Mail, Phone, MapPin } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from "@/components/ui/Table";
import { Modal } from "@/components/ui/Modal";
import type { Client } from "@/types";
import { mockClients } from "@/data/mock";
import { formatDate } from "@/lib/utils";

export default function ClientPage() {
  const [clients, setClients] = useState<Client[]>(mockClients);
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
      setClients((prev) =>
        prev.map((c) =>
          c.id === editingClient.id ? { ...c, ...form } : c
        )
      );
    } else {
      const newClient: Client = {
        id: String(Date.now()),
        ...form,
        createdAt: new Date().toISOString().split("T")[0],
      };
      setClients((prev) => [newClient, ...prev]);
    }

    setModalOpen(false);
  }

  function handleDelete(id: string) {
    if (confirm("Tem certeza que deseja excluir este cliente?")) {
      setClients((prev) => prev.filter((c) => c.id !== id));
    }
  }

  return (
    <div className="relative min-h-screen bg-[#050914]">
  
  <div className="pointer-events-none fixed -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-[#071124]/60 blur-[120px]" />
  <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.06)_1px,transparent_0)] bg-[size:32px_32px]" />
      <Header title="Clientes" className="border-b border-white/10 bg-white/[0.02] backdrop-blur-xl text-white" />

      <div className="p-6 space-y-6">
        <Card className="border border-white/10 bg-white/[0.03] backdrop-blur-2xl shadow-2xl shadow-black/40">
          <CardHeader className="border-b border-white/5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                <input
                  type="text"
                  placeholder="Buscar clientes..."
                  className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-10 pr-4 text-sm text-white placeholder:text-white/30 focus:border-[#fd6401]/50 focus:outline-none focus:ring-1 focus:ring-[#fd6401]/30"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button
                onClick={openCreate}
                className="bg-gradient-to-r from-[#071124] to-[#0d1a35] text-white shadow-lg shadow-black/30 ring-1 ring-white/10 transition-all duration-300 hover:shadow-[#fd6401]/20 hover:ring-[#fd6401]/30"
              >
                <Plus className="h-4 w-4" />
                Novo Cliente
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHead className="border-b border-white/10">
                <TableRow>
                  <TableHeadCell className="text-white/50">Nome</TableHeadCell>
                  <TableHeadCell className="text-white/50">Contato</TableHeadCell>
                  <TableHeadCell className="text-white/50">Documento</TableHeadCell>
                  <TableHeadCell className="text-white/50">Endereço</TableHeadCell>
                  <TableHeadCell className="text-white/50">Cadastro</TableHeadCell>
                  <TableHeadCell className="text-right text-white/50">Ações</TableHeadCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((client) => (
                  <TableRow
                    key={client.id}
                    className="border-b border-white/5 transition-colors hover:bg-white/[0.02] last:border-0"
                  >
                    <TableCell>
                      <p className="font-medium text-white">
                        {client.name}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="flex items-center gap-1 text-xs text-white/40">
                          <Mail className="h-3 w-3" />
                          {client.email}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-white/40">
                          <Phone className="h-3 w-3" />
                          {client.phone}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-white/70">{client.document}</TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1 text-xs text-white/40">
                        <MapPin className="h-3 w-3" />
                        {client.address}
                      </span>
                    </TableCell>
                    <TableCell className="text-white/50">{formatDate(client.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-white/60 hover:text-white hover:bg-white/5"
                          onClick={() => openEdit(client)}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-400/80 hover:text-red-400 hover:bg-red-500/10"
                          onClick={() => handleDelete(client.id)}
                        >
                          Excluir
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
          </CardContent>
        </Card>
      </div>

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
            className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#fd6401]/50 focus:ring-[#fd6401]/20"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              id="email"
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#fd6401]/50 focus:ring-[#fd6401]/20"
            />
            <Input
              id="phone"
              label="Telefone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#fd6401]/50 focus:ring-[#fd6401]/20"
            />
          </div>
          <Input
            id="document"
            label="CPF/CNPJ"
            value={form.document}
            onChange={(e) => setForm({ ...form, document: e.target.value })}
            required
            className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#fd6401]/50 focus:ring-[#fd6401]/20"
          />
          <Input
            id="address"
            label="Endereço"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            required
            className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#fd6401]/50 focus:ring-[#fd6401]/20"
          />
          <div className="flex justify-end gap-3 pt-2">
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
              className="bg-gradient-to-r from-[#071124] to-[#0d1a35] text-white ring-1 ring-white/10 hover:ring-[#fd6401]/30"
            >
              {editingClient ? "Salvar" : "Criar"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}