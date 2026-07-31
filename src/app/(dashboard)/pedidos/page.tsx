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
import { Pencil, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { StatusBadge } from "@/components/ui/Badge";
import type { Order } from "@/types";
import { useOrders } from "@/hooks/useOrders";
import { useClients } from "@/hooks/useClients";
import { useProducts } from "@/hooks/useProducts";
import { usePrinters } from "@/hooks/usePrinters";
import { useFilaments } from "@/hooks/useFilaments";
import { formatCurrency, formatDate, translateStatus } from "@/lib/utils";
import { createNotification } from "@/lib/notifications";

const orderStatuses = [
  { value: "pending", label: "Pendente", dot: "bg-amber-400" },
  { value: "approved", label: "Aprovado", dot: "bg-emerald-400" },
  { value: "printing", label: "Imprimindo", dot: "bg-sky-400" },
  { value: "paused", label: "Pausado", dot: "bg-amber-400" },
  { value: "completed", label: "Concluído", dot: "bg-emerald-400" },
  { value: "delivered", label: "Entregue", dot: "bg-emerald-400" },
  { value: "cancelled", label: "Cancelado", dot: "bg-red-400" },
];

export default function OrdersPage() {
  const {
    orders,
    loading: ordersLoading,
    create,
    update,
    remove,
  } = useOrders();
  const { clients } = useClients();
  const { products } = useProducts();
  const { printers: printerOptions } = usePrinters();
  const { filaments, adjustStock } = useFilaments();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    productId: "",
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
      (o.productName ?? "").toLowerCase().includes(search.toLowerCase()) ||
      String(o.orderNumber ?? "").includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  function openCreate() {
    setEditingOrder(null);
    setForm({
      productId: "",
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
      productId: order.productId || "",
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

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (
      !form.productId ||
      !form.clientId ||
      !form.printerId ||
      !form.filamentId
    ) {
      setError("Selecione produto, cliente, impressora e filamento.");
      return;
    }

    const selectedProduct = products.find((p) => p.id === form.productId);
    const selectedClient = clients.find((c) => c.id === form.clientId);
    const selectedPrinter = printerOptions.find((p) => p.id === form.printerId);
    const selectedFilament = filaments.find((f) => f.id === form.filamentId);

    const filamentCost =
      (selectedFilament?.costPerKg || 0) * (Number(form.filamentGrams) / 1000);
    const cost = filamentCost;

    const data = {
      productId: form.productId || undefined,
      productName: selectedProduct?.name || "",
      clientId: form.clientId || undefined,
      clientName: selectedClient?.name || "",
      printerId: form.printerId || undefined,
      printerName: selectedPrinter?.name || "",
      filamentId: form.filamentId || undefined,
      filamentName: selectedFilament?.name || "",
      filamentColor: selectedFilament?.colorHex || "",
      status: form.status as Order["status"],
      quantity: Number(form.quantity),
      totalHours: Number(form.totalHours),
      filamentGrams: Number(form.filamentGrams),
      cost,
      price: Number(form.price),
      notes: form.notes || undefined,
      deadline: form.deadline || undefined,
    };

    const result = editingOrder
      ? await update(editingOrder.id, data)
      : await create(data as Omit<Order, "id" | "createdAt">);

    if (!result) {
      setError(
        "Não foi possível salvar o pedido. Confira o console do navegador para mais detalhes.",
      );
      return;
    }

    const grams = Number(data.filamentGrams) || 0;
    const cancelled = result.status === "cancelled";
    const newConsumed = cancelled ? 0 : grams;

    if (editingOrder) {
      const oldCancelled = editingOrder.status === "cancelled";
      const oldConsumed = oldCancelled ? 0 : editingOrder.filamentGrams;

      if (editingOrder.filamentId !== result.filamentId) {
        if (oldConsumed > 0) {
          await adjustStock(editingOrder.filamentId, oldConsumed);
        }
        if (newConsumed > 0) {
          await adjustStock(result.filamentId, -newConsumed);
        }
      } else {
        const delta = newConsumed - oldConsumed;
        if (delta !== 0) {
          await adjustStock(result.filamentId, -delta);
        }
      }
    } else if (newConsumed > 0) {
      await adjustStock(result.filamentId, -newConsumed);
    }

    if (editingOrder) {
      if (result.status !== editingOrder.status) {
        await createNotification({
          type: "order",
          referenceId: result.id,
          title: "Status do pedido atualizado",
          description: `Pedido #${
            result.orderNumber ?? ""
          } agora está ${translateStatus(result.status)}.`,
        });
      }
    } else {
      await createNotification({
        type: "order",
        referenceId: result.id,
        title: "Novo pedido criado",
        description: `Pedido #${
          result.orderNumber ?? ""
        } de ${result.clientName} criado.`,
      });
    }

    setModalOpen(false);
  }

  async function handleDelete(id: string) {
    if (confirm("Tem certeza que deseja excluir este pedido?")) {
      const order = orders.find((o) => o.id === id);
      if (order && order.status !== "cancelled" && order.filamentGrams > 0) {
        await adjustStock(order.filamentId, order.filamentGrams);
      }
      await remove(id);
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

      {ordersLoading ? (
        <div className="flex min-h-[200px] items-center justify-center px-4 py-5 text-white/50 sm:p-6">
          Carregando...
        </div>
      ) : (
        <div className="space-y-5 px-4 py-5 sm:p-6 sm:space-y-6">
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
                <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:gap-4">
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
          w-full
          sm:w-44
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
                    <TableHeadCell className="text-center text-white/50">Pedido</TableHeadCell>
                    <TableHeadCell className="text-center text-white/50">Produto</TableHeadCell>
                    <TableHeadCell className="text-center text-white/50">Cliente</TableHeadCell>
                    <TableHeadCell className="text-center text-white/50">Impressora</TableHeadCell>
                    <TableHeadCell className="text-center text-white/50">Filamento</TableHeadCell>
                    <TableHeadCell className="text-center text-white/50">Qtd</TableHeadCell>
                    <TableHeadCell className="text-center text-white/50">Horas</TableHeadCell>
                    <TableHeadCell className="text-center text-white/50">Valor</TableHeadCell>
                    <TableHeadCell className="text-center text-white/50">Status</TableHeadCell>
                    <TableHeadCell className="text-center text-white/50">Criação</TableHeadCell>
                    <TableHeadCell className="text-center text-white/50">
                      Ações
                    </TableHeadCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="text-center font-mono text-xs font-medium">
                        #{order.orderNumber ?? order.id}
                      </TableCell>
                      <TableCell className="text-center text-[9px]">
                        {order.productName || "—"}
                      </TableCell>
                      <TableCell className="text-center max-w-[180px] whitespace-nowrap overflow-hidden text-ellipsis text-[10px]">
                        {order.clientName}
                      </TableCell>
                      <TableCell className="text-center text-xs">
                        {order.printerName}
                      </TableCell>
                      <TableCell className="text-center text-xs">
                        {order.filamentName}
                      </TableCell>
                      <TableCell className="text-center">{order.quantity}</TableCell>
                      <TableCell className="text-center">{order.totalHours}h</TableCell>
                      <TableCell className="text-center font-medium">
                        {formatCurrency(order.price)}
                      </TableCell>
                      <TableCell className="text-center">
                        <StatusBadge status={order.status} />
                      </TableCell>
                      <TableCell className="text-center text-xs">
                        {formatDate(order.createdAt)}
                      </TableCell>
                      <TableCell className="text-center">
  <div className="flex items-center justify-center gap-1.5">
  <Button
    variant="ghost"
    size="sm"
    onClick={() => openEdit(order)}
    className="
      h-8
      w-8
      rounded-lg
      border
      border-white/10
      bg-white/[0.03]
      text-white/60
      transition-all
      duration-200
      hover:border-[#fd6401]/40
      hover:bg-[#fd6401]/10
      hover:text-[#fd6401]
    "
  >
    <Pencil className="h-3.5 w-3.5" />
  </Button>

  <Button
    variant="ghost"
    size="sm"
    onClick={() => handleDelete(order.id)}
    className="
      h-8
      w-8
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
    <Trash2 className="h-3.5 w-3.5" />
  </Button>
</div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={11}>
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
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingOrder ? "Editar Pedido" : "Novo Pedido"}
        size="xl"
      >
        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              id="product"
              label="Produto"
              className="
                        bg-white/5
                        border-white/10
                        text-white
                        placeholder:text-white/30
                        focus:border-[#fd6401]/50
                        focus:ring-[#fd6401]/20
                        "
              options={products.map((p) => ({
                value: p.id,
                label: p.name,
              }))}
              value={form.productId}
              onChange={(e) => setForm({ ...form, productId: e.target.value })}
              required
            />
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
              options={clients.map((c) => ({
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
              options={printerOptions.map((p) => ({
                value: p.id,
                label: `${p.name} (${p.status})`,
              }))}
              value={form.printerId}
              onChange={(e) => setForm({ ...form, printerId: e.target.value })}
              required
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
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
              options={filaments.map((f) => ({
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
          <div className="grid gap-4 sm:grid-cols-3">
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
          <div className="grid gap-4 sm:grid-cols-2">
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
          {error && (
            <div className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 border-t border-white/5 pt-4 sm:flex-row sm:justify-end">
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
              onClick={() => setModalOpen(false)}
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
