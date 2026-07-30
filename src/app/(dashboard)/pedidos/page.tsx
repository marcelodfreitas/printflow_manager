"use client";

import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
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
import { StatusBadge } from "@/components/ui/Badge";
import type { Order } from "@/types";
import {
  mockOrders,
  mockClients,
  mockPrinters,
  mockFilaments,
} from "@/data/mock";
import { formatCurrency, formatDate } from "@/lib/utils";

const orderStatuses = [
  { value: "pending", label: "Pendente" },
  { value: "approved", label: "Aprovado" },
  { value: "printing", label: "Imprimindo" },
  { value: "paused", label: "Pausado" },
  { value: "completed", label: "Concluído" },
  { value: "delivered", label: "Entregue" },
  { value: "cancelled", label: "Cancelado" },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [form, setForm] = useState({
    clientId: "",
    printerId: "",
    filamentId: "",
    status: "pending" as Order["status"],
    quantity: "1",
    totalHours: "",
    filamentGrams: "",
    price: "",
    notes: "",
    deadline: "",
  });

  const filtered = orders.filter((o) => {
    const matchesSearch =
      o.clientName.toLowerCase().includes(search.toLowerCase()) ||
      o.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  function openCreate() {
    setEditingOrder(null);
    setForm({
      clientId: "",
      printerId: "",
      filamentId: "",
      status: "pending",
      quantity: "1",
      totalHours: "",
      filamentGrams: "",
      price: "",
      notes: "",
      deadline: "",
    });
    setModalOpen(true);
  }

  function openEdit(order: Order) {
    setEditingOrder(order);
    setForm({
      clientId: order.clientId,
      printerId: order.printerId,
      filamentId: order.filamentId,
      status: order.status,
      quantity: String(order.quantity),
      totalHours: String(order.totalHours),
      filamentGrams: String(order.filamentGrams),
      price: String(order.price),
      notes: order.notes || "",
      deadline: order.deadline || "",
    });
    setModalOpen(true);
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();

    const selectedClient = mockClients.find((c) => c.id === form.clientId);
    const selectedPrinter = mockPrinters.find((p) => p.id === form.printerId);
    const selectedFilament = mockFilaments.find(
      (f) => f.id === form.filamentId,
    );

    const filamentCost =
      (selectedFilament?.costPerKg || 0) * (Number(form.filamentGrams) / 1000);
    const cost = filamentCost;

    if (editingOrder) {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === editingOrder.id
            ? {
                ...o,
                clientId: form.clientId,
                clientName: selectedClient?.name || o.clientName,
                printerId: form.printerId,
                printerName: selectedPrinter?.name || o.printerName,
                filamentId: form.filamentId,
                filamentName: selectedFilament?.name || o.filamentName,
                filamentColor: selectedFilament?.colorHex || o.filamentColor,
                status: form.status,
                quantity: Number(form.quantity),
                totalHours: Number(form.totalHours),
                filamentGrams: Number(form.filamentGrams),
                cost,
                price: Number(form.price),
                notes: form.notes,
                deadline: form.deadline,
              }
            : o,
        ),
      );
    } else {
      const newOrder: Order = {
        id: String(Date.now()),
        clientId: form.clientId,
        clientName: selectedClient?.name || "",
        printerId: form.printerId,
        printerName: selectedPrinter?.name || "",
        filamentId: form.filamentId,
        filamentName: selectedFilament?.name || "",
        filamentColor: selectedFilament?.colorHex || "",
        status: form.status,
        quantity: Number(form.quantity),
        totalHours: Number(form.totalHours),
        filamentGrams: Number(form.filamentGrams),
        cost,
        price: Number(form.price),
        notes: form.notes,
        deadline: form.deadline,
        createdAt: new Date().toISOString().split("T")[0],
      };
      setOrders((prev) => [newOrder, ...prev]);
    }

    setModalOpen(false);
  }

  function handleDelete(id: string) {
    if (confirm("Tem certeza que deseja excluir este pedido?")) {
      setOrders((prev) => prev.filter((o) => o.id !== id));
    }
  }

  const totalRevenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((acc, o) => acc + o.price, 0);

  return (
    <div className="relative min-h-screen bg-[#050914]">
      <div className="pointer-events-none fixed -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-[#071124]/60 blur-[120px]" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.06)_1px,transparent_0)] bg-[size:32px_32px]" />

      <div className="relative"></div>

      <Header
        title="Pedidos"
        className="border-b border-white/10 bg-white/[0.02] backdrop-blur-xl text-white"
      />

      <div className="p-6 space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="border border-white/10 bg-[#050914] backdrop-blur-2xl shadow-2xl shadow-black/40">
            <CardContent>
              <p className="text-sm text-gray-500">Total de Pedidos</p>
              <p className="text-2xl font-bold text-white">{orders.length}</p>
            </CardContent>
          </Card>
          <Card className="border border-white/10 bg-[#050914] backdrop-blur-2xl shadow-2xl shadow-black/40">
            <CardContent>
              <p className="text-sm text-gray-500">Receita Total</p>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(totalRevenue)}
              </p>
            </CardContent>
          </Card>
          <Card className="border border-white/10 bg-[#050914] backdrop-blur-2xl shadow-2xl shadow-black/40">
            <CardContent>
              <p className="text-sm text-gray-500">Em Andamento</p>
              <p className="text-2xl font-bold text-white">
                {
                  orders.filter(
                    (o) => o.status === "printing" || o.status === "approved",
                  ).length
                }
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="border border-white/10 bg-[#050914] backdrop-blur-2xl shadow-2xl shadow-black/40">
          <CardHeader className="border-b border-white/5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-1 gap-4">
                {/* Campo de busca */}
                <div className="relative w-full max-w-sm">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    placeholder="Buscar pedidos..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="
                              h-11
                              w-full
                              rounded-xl
                              border
                              border-white/10
                              bg-white/5
                              pl-10
                              pr-4
                              text-sm
                              text-white
                              placeholder:text-white/30
                              outline-none
                              transition-all
                              duration-300
                              focus:border-[#fd6401]/50
                              focus:ring-2
                              focus:ring-[#fd6401]/20
                            "
                  />
                </div>

                {/* Select */}
                <Select
                  options={[
                    { value: "all", label: "Todos Status" },
                    ...orderStatuses,
                  ]}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="
          w-44
          bg-white/5
          border-white/10
          text-white
          focus:border-[#fd6401]/50
          focus:ring-[#fd6401]/20
        "
                />
              </div>

              {/* Botão */}
              <Button
                onClick={openCreate}
                className="
        bg-gradient-to-r
        from-[#071124]
        to-[#0d1a35]
        text-white
        ring-1
        ring-white/10
        hover:ring-[#fd6401]/30
      "
              >
                <Plus className="h-4 w-4" />
                Novo Pedido
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeadCell>Pedido</TableHeadCell>
                  <TableHeadCell>Cliente</TableHeadCell>
                  <TableHeadCell>Impressora</TableHeadCell>
                  <TableHeadCell>Filamento</TableHeadCell>
                  <TableHeadCell>Qtd</TableHeadCell>
                  <TableHeadCell>Horas</TableHeadCell>
                  <TableHeadCell>Valor</TableHeadCell>
                  <TableHeadCell>Status</TableHeadCell>
                  <TableHeadCell>Criação</TableHeadCell>
                  <TableHeadCell className="text-right text-white/50">
                    Ações
                  </TableHeadCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-xs font-medium">
                      #{order.id}
                    </TableCell>
                    <TableCell>{order.clientName}</TableCell>
                    <TableCell className="text-xs">
                      {order.printerName}
                    </TableCell>
                    <TableCell className="text-xs">
                      {order.filamentName}
                    </TableCell>
                    <TableCell>{order.quantity}</TableCell>
                    <TableCell>{order.totalHours}h</TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(order.price)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={order.status} />
                    </TableCell>
                    <TableCell className="text-xs">
                      {formatDate(order.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-white/70 hover:bg-white/5 hover:text-white"
                        >
                          Editar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
                          onClick={() => handleDelete(order.id)}
                        >
                          Excluir
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10}>
                      <div className="py-8 text-center text-sm text-gray-500">
                        Nenhum pedido encontrado
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
        title={editingOrder ? "Editar Pedido" : "Novo Pedido"}
        size="xl"
      >
        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <Select
              id="client"
              label="Cliente"
              className="
                        bg-white/5
                        border-white/10
                        text-white
                        placeholder:text-white/30
                        focus:border-[#fd6401]/50
                        focus:ring-[#fd6401]/20
                        "
              options={mockClients.map((c) => ({
                value: c.id,
                label: c.name,
              }))}
              value={form.clientId}
              onChange={(e) => setForm({ ...form, clientId: e.target.value })}
              required
            />
            <Select
              id="printer"
              label="Impressora"
              className="
                        bg-white/5
                        border-white/10
                        text-white
                        placeholder:text-white/30
                        focus:border-[#fd6401]/50
                        focus:ring-[#fd6401]/20
                        "
              options={mockPrinters.map((p) => ({
                value: p.id,
                label: `${p.name} (${p.status})`,
              }))}
              value={form.printerId}
              onChange={(e) => setForm({ ...form, printerId: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              id="filament"
              label="Filamento"
              className="
                        bg-white/5
                        border-white/10
                        text-white
                        placeholder:text-white/30
                        focus:border-[#fd6401]/50
                        focus:ring-[#fd6401]/20
                        "
              options={mockFilaments.map((f) => ({
                value: f.id,
                label: `${f.name} - ${f.color}`,
              }))}
              value={form.filamentId}
              onChange={(e) => setForm({ ...form, filamentId: e.target.value })}
              required
            />
            <Select
              id="status"
              label="Status"
              className="
                        bg-white/5
                        border-white/10
                        text-white
                        placeholder:text-white/30
                        focus:border-[#fd6401]/50
                        focus:ring-[#fd6401]/20
                        "
              options={orderStatuses}
              value={form.status}
              onChange={(e) =>
                setForm({
                  ...form,
                  status: e.target.value as Order["status"],
                })
              }
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input
              id="quantity"
              label="Quantidade"
              className="
                        bg-white/5
                        border-white/10
                        text-white
                        placeholder:text-white/30
                        focus:border-[#fd6401]/50
                        focus:ring-[#fd6401]/20
                        "
              type="number"
              min="1"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              required
            />
            <Input
              id="hours"
              label="Horas Estimadas"
              className="
                        bg-white/5
                        border-white/10
                        text-white
                        placeholder:text-white/30
                        focus:border-[#fd6401]/50
                        focus:ring-[#fd6401]/20
                        "
              type="number"
              step="0.5"
              value={form.totalHours}
              onChange={(e) => setForm({ ...form, totalHours: e.target.value })}
              required
            />
            <Input
              id="grams"
              label="Filamento (g)"
              className="
                        bg-white/5
                        border-white/10
                        text-white
                        placeholder:text-white/30
                        focus:border-[#fd6401]/50
                        focus:ring-[#fd6401]/20
                        "
              type="number"
              value={form.filamentGrams}
              onChange={(e) =>
                setForm({ ...form, filamentGrams: e.target.value })
              }
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              id="price"
              label="Preço (R$)"
              className="
                        bg-white/5
                        border-white/10
                        text-white
                        placeholder:text-white/30
                        focus:border-[#fd6401]/50
                        focus:ring-[#fd6401]/20
                        "
              type="number"
              step="0.01"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              required
            />
            <Input
              id="deadline"
              label="Prazo"
              className="
                        bg-white/5
                        border-white/10
                        text-white
                        placeholder:text-white/30
                        focus:border-[#fd6401]/50
                        focus:ring-[#fd6401]/20
                        "
              type="date"
              value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
            />
          </div>
          <textarea
            rows={2}
            value={form.notes}
            onChange={(e) =>
              setForm({
                ...form,
                notes: e.target.value,
              })
            }
            className="
                  w-full
                  rounded-xl
                  border
                  border-white/10
                  bg-white/5
                  px-4
                  py-3
                  text-white
                  placeholder:text-white/30
                  outline-none
                  transition
                  focus:border-[#fd6401]/50
                  focus:ring-2
                  focus:ring-[#fd6401]/20
                  "
          />
          <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
            <Button
              type="button"
              variant="secondary"
              className="
                        bg-white/5
                        text-white/70
                        ring-1
                        ring-white/10
                        hover:bg-white/10
                        hover:text-white
                        "
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="
                        bg-gradient-to-r
                        from-[#071124]
                        to-[#0d1a35]
                        text-white
                        ring-1
                        ring-white/10
                        hover:ring-[#fd6401]/30
                        "
            >
              {editingOrder ? "Salvar" : "Criar Pedido"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
