"use client";

import { useState } from "react";
import { jsPDF } from "jspdf";
import { Plus, Search, FileDown, Trash2, Pencil } from "lucide-react";
import logo from "@/assets/logo.png";
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
import type { Quote, QuoteItem } from "@/types";
import { useQuotes } from "@/hooks/useQuotes";
import { useClients } from "@/hooks/useClients";
import { useProducts } from "@/hooks/useProducts";

interface QuoteFormItem {
  description: string;
  quantity: string;
  unitPrice: string;
}
import { formatCurrency, formatDate, translateStatus } from "@/lib/utils";

const quoteStatuses = [
  { value: "draft", label: "Rascunho" },
  { value: "sent", label: "Enviado" },
  { value: "approved", label: "Aprovado" },
  { value: "rejected", label: "Rejeitado" },
  { value: "converted", label: "Convertido" },
];

export default function QuotesPage() {
  const { quotes, loading, create, update, remove } = useQuotes();
  const { clients } = useClients();
  const { products } = useProducts();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [form, setForm] = useState({
    productId: "",
    clientId: "",
    status: "draft" as Quote["status"],
    notes: "",
    validUntil: "",
    items: [] as QuoteFormItem[],
  });
  const [itemForm, setItemForm] = useState({
    description: "",
    quantity: "1",
    unitPrice: "",
  });

  const filtered = quotes.filter((q) => {
    const matchesSearch =
      q.clientName.toLowerCase().includes(search.toLowerCase()) ||
      (q.productName ?? "").toLowerCase().includes(search.toLowerCase()) ||
      String(q.quoteNumber ?? "").includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  function openCreate() {
    setEditingQuote(null);
    setForm({
      productId: "",
      clientId: "",
      status: "draft",
      notes: "",
      validUntil: "",
      items: [],
    });
    setItemForm({ description: "", quantity: "1", unitPrice: "" });
    setModalOpen(true);
  }

  function openEdit(quote: Quote) {
    setEditingQuote(quote);
    setForm({
      productId: quote.productId || "",
      clientId: quote.clientId,
      status: quote.status,
      notes: quote.notes || "",
      validUntil: quote.validUntil,
      items: quote.items.map((i) => ({
        description: i.description,
        quantity: String(i.quantity),
        unitPrice: String(i.unitPrice),
      })),
    });
    setModalOpen(true);
  }

  function addItem() {
    if (!itemForm.description || !itemForm.unitPrice) return;
    setForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          description: itemForm.description,
          quantity: itemForm.quantity,
          unitPrice: itemForm.unitPrice,
        },
      ],
    }));
    setItemForm({ description: "", quantity: "1", unitPrice: "" });
  }

  function removeItem(index: number) {
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  }

  function calcSubtotal() {
    return form.items.reduce((acc, item) => {
      return acc + Number(item.quantity) * Number(item.unitPrice);
    }, 0);
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();

    const subtotal = calcSubtotal();
    const tax = subtotal * 0.1;
    const total = subtotal + tax;

    const selectedClient = clients.find((c) => c.id === form.clientId);
    const selectedProduct = products.find((p) => p.id === form.productId);

    const items: QuoteItem[] = form.items.map((item, idx) => ({
      id: String(idx),
      description: item.description,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
      total: Number(item.quantity) * Number(item.unitPrice),
    }));

    if (editingQuote) {
      update(editingQuote.id, {
        productId: form.productId || undefined,
        productName: selectedProduct?.name || "",
        clientId: form.clientId,
        clientName: selectedClient?.name || editingQuote.clientName,
        status: form.status,
        items,
        subtotal,
        tax,
        total,
        notes: form.notes,
        validUntil: form.validUntil,
      });
    } else {
      create({
        productId: form.productId || undefined,
        productName: selectedProduct?.name || "",
        clientId: form.clientId,
        clientName: selectedClient?.name || "",
        status: form.status,
        notes: form.notes,
        validUntil: form.validUntil,
        items,
        subtotal,
        tax,
        total,
      });
    }

    setModalOpen(false);
  }

  function handleDelete(id: string) {
    if (confirm("Tem certeza que deseja excluir este orçamento?")) {
      remove(id);
    }
  }

  async function generatePDF() {
    const doc = new jsPDF();
    const client = clients.find((c) => c.id === form.clientId);
    const subtotal = calcSubtotal();
    const tax = subtotal * 0.1;
    const total = subtotal + tax;

    let logoData: string | null = null;
    try {
      const response = await fetch(logo.src);
      const blob = await response.blob();
      logoData = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
    } catch {
      logoData = null;
    }

    doc.setFillColor(10, 17, 32);
    doc.rect(0, 0, 210, 27, "F");
    doc.setFillColor(253, 100, 1);
    doc.rect(0, 27, 210, 1.2, "F");

    if (logoData) {
      doc.addImage(logoData, "PNG", 14, 5, 17, 17);
    }
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("PrintFlow", logoData ? 37 : 14, 14);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(253, 100, 1);
    doc.text("Orçamento de impressão 3D", logoData ? 37 : 14, 20);

    doc.setTextColor(180, 190, 205);
    doc.text("Data:", 150, 12);
    doc.setTextColor(255, 255, 255);
    doc.text(new Date().toLocaleDateString("pt-BR"), 194, 12, {
      align: "right",
    });

    doc.setTextColor(180, 190, 205);
    doc.text("Status:", 150, 18);
    doc.setTextColor(255, 255, 255);
    doc.text(translateStatus(form.status), 194, 18, { align: "right" });

    let y = 40;
    doc.setFontSize(9);
    doc.setTextColor(90, 90, 90);
    doc.text("CLIENTE", 14, y);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(20, 20, 20);
    doc.text(client?.name || "—", 14, y + 6);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    if (form.validUntil) {
      doc.text(`Validade: ${formatDate(form.validUntil)}`, 14, y + 12);
    }

    y += 24;
    doc.setFillColor(245, 245, 245);
    doc.rect(14, y - 5, 182, 7, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    doc.text("Descrição", 16, y);
    doc.text("Qtd", 124, y, { align: "right" });
    doc.text("Unit.", 152, y, { align: "right" });
    doc.text("Total", 194, y, { align: "right" });
    y += 7;

    doc.setFont("helvetica", "normal");
    doc.setTextColor(40, 40, 40);
    form.items.forEach((item) => {
      const itemTotal = Number(item.quantity) * Number(item.unitPrice);
      doc.text(item.description, 16, y);
      doc.text(item.quantity, 124, y, { align: "right" });
      doc.text(formatCurrency(Number(item.unitPrice)), 152, y, {
        align: "right",
      });
      doc.text(formatCurrency(itemTotal), 194, y, { align: "right" });
      y += 7;
    });

    y += 8;
    doc.setDrawColor(220, 220, 220);
    doc.line(14, y - 4, 196, y - 4);

    doc.setFontSize(10);
    doc.text("Subtotal", 150, y, { align: "right" });
    doc.text(formatCurrency(subtotal), 194, y, { align: "right" });
    y += 6;
    doc.text("Taxa (10%)", 150, y, { align: "right" });
    doc.text(formatCurrency(tax), 194, y, { align: "right" });
    y += 8;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(253, 100, 1);
    doc.text("Total", 150, y, { align: "right" });
    doc.text(formatCurrency(total), 194, y, { align: "right" });
    doc.setFont("helvetica", "normal");

    if (form.notes) {
      y += 16;
      doc.setFontSize(9);
      doc.setTextColor(90, 90, 90);
      doc.text("OBSERVAÇÕES", 14, y);
      doc.setFontSize(10);
      doc.setTextColor(50, 50, 50);
      const lines = doc.splitTextToSize(form.notes, 180);
      doc.text(lines, 14, y + 5);
    }

    doc.save(`orcamento-${editingQuote?.quoteNumber ?? "novo"}.pdf`);
  }

  if (loading) {
    return (
      <div className="relative min-h-screen bg-[#050914]">
        <div className="flex items-center justify-center h-96">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-[#fd6401]" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#050914]">
      <div className="pointer-events-none fixed -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-[#071124]/60 blur-[120px]" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.06)_1px,transparent_0)] bg-[size:32px_32px]" />
      <Header
        title="Orçamentos"
        className="border-b border-white/10 bg-white/[0.02] backdrop-blur-xl text-white"
      />

      <div className="space-y-5 px-4 py-5 sm:p-6 sm:space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="border border-white/10 bg-[#050914] backdrop-blur-2xl shadow-2xl shadow-black/40">
            <CardContent>
              <p className="text-sm text-white">Total de Orçamentos</p>
              <p className="text-2xl font-bold text-white/50">
                {quotes.length}
              </p>
            </CardContent>
          </Card>

          <Card className="border border-white/10 bg-[#050914] backdrop-blur-2xl shadow-2xl shadow-black/40">
            <CardContent>
              <p className="text-sm text-white">Aprovados</p>
              <p className="text-2xl font-bold text-green-600">
                {quotes.filter((q) => q.status === "approved").length}
              </p>
            </CardContent>
          </Card>

          <Card className="border border-white/10 bg-[#050914] backdrop-blur-2xl shadow-2xl shadow-black/40">
            <CardContent>
              <p className="text-sm text-white">Valor Total Aprovado</p>
              <p className="text-2xl font-bold text-white/50">
                {formatCurrency(
                  quotes
                    .filter((q) => q.status === "approved")
                    .reduce((acc, q) => acc + q.total, 0),
                )}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="border border-white/10 bg-[#050914] backdrop-blur-2xl shadow-2xl shadow-black/40">
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:gap-4">
                <div className="relative w-full max-w-sm">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    placeholder="Buscar orçamentos..."
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
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <Select
                  options={[
                    { value: "all", label: "Todos Status" },
                    ...quoteStatuses,
                  ]}
                  value={statusFilter}
                  className="
                            w-full
                            sm:w-44
                            bg-white/5
                            border-white/10
                            text-white
                            focus:border-[#fd6401]/50
                            focus:ring-[#fd6401]/20
                          "
                  onChange={(e) => setStatusFilter(e.target.value)}
                />
              </div>

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
                Novo Orçamento
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeadCell className="text-center text-white/50">
                    Orçamento
                  </TableHeadCell>
                  <TableHeadCell className="text-center text-white/50">
                    Produto
                  </TableHeadCell>
                  <TableHeadCell className="text-center text-white/50">
                    Cliente
                  </TableHeadCell>
                  <TableHeadCell className="text-center text-white/50">
                    Itens
                  </TableHeadCell>
                  <TableHeadCell className="text-center text-white/50">
                    Subtotal
                  </TableHeadCell>
                  <TableHeadCell className="text-center text-white/50">
                    Total
                  </TableHeadCell>
                  <TableHeadCell className="text-center text-white/50">
                    Status
                  </TableHeadCell>
                  <TableHeadCell className="text-center text-white/50">
                    Validade
                  </TableHeadCell>
                  <TableHeadCell className="text-center text-white/50">
                    Criação
                  </TableHeadCell>
                  <TableHeadCell className="text-center text-white/50">
                    Ações
                  </TableHeadCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((quote) => (
                  <TableRow key={quote.id}>
                    <TableCell className="text-center font-center font-mono text-xs font-medium">
                      #{quote.quoteNumber ?? quote.id}
                    </TableCell>
                    <TableCell className="text-center text-xs">
                      {quote.productName || "—"}
                    </TableCell>
                    <TableCell>{quote.clientName}</TableCell>
                    <TableCell className="text-xs">
                      {quote.items.length} item(ns)
                    </TableCell>
                    <TableCell>{formatCurrency(quote.subtotal)}</TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(quote.total)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={quote.status} />
                    </TableCell>
                    <TableCell className="text-xs">
                      {formatDate(quote.validUntil)}
                    </TableCell>
                    <TableCell className="text-xs">
                      {formatDate(quote.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEdit(quote)}
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
                                    hover:border-[#fd6401]/40
                                    hover:bg-[#fd6401]/10
                                    hover:text-[#fd6401]
                                  "
                                                      >
                          <Pencil className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(quote.id)}
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
                    <TableCell colSpan={10}>
                      <div className="py-8 text-center text-sm text-gray-500">
                        Nenhum orçamento encontrado
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
        title={editingQuote ? "Editar Orçamento" : "Novo Orçamento"}
        size="2xl"
      >
        <form onSubmit={handleSave}>
          <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
            {/* ================================================= */}
            {/* ESQUERDA */}
            {/* ================================================= */}

            <div className="space-y-3">
              <Select
                id="product"
                label="Produto"
                options={products.map((p) => ({
                  value: p.id,
                  label: p.name,
                }))}
                value={form.productId}
                onChange={(e) =>
                  setForm({ ...form, productId: e.target.value })
                }
                className="bg-white/5 border-white/10 text-white"
                required
              />

              <Select
                id="client"
                label="Cliente"
                options={clients.map((c) => ({
                  value: c.id,
                  label: c.name,
                }))}
                value={form.clientId}
                onChange={(e) => setForm({ ...form, clientId: e.target.value })}
                className="bg-white/5 border-white/10 text-white"
                required
              />

              <Select
                id="status"
                label="Status"
                options={quoteStatuses}
                value={form.status}
                onChange={(e) =>
                  setForm({
                    ...form,
                    status: e.target.value as Quote["status"],
                  })
                }
                className="bg-white/5 border-white/10 text-white"
              />

              <Input
                id="validUntil"
                label="Validade"
                type="date"
                value={form.validUntil}
                onChange={(e) =>
                  setForm({ ...form, validUntil: e.target.value })
                }
                className="bg-white/5 border-white/10 text-white"
              />

              <Input
                id="notes"
                label="Observações"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            {/* ================================================= */}
            {/* DIREITA */}
            {/* ================================================= */}

            <div className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
              <div className="border-b border-white/10 px-6 py-5">
                <h3 className="text-lg font-semibold text-white">
                  Itens do orçamento
                </h3>
              </div>

              <div className="flex-1 space-y-5 p-6">
                {/* Adicionar Item */}

                <Input
                  placeholder="Descrição do item"
                  value={itemForm.description}
                  onChange={(e) =>
                    setItemForm({
                      ...itemForm,
                      description: e.target.value,
                    })
                  }
                  className="bg-white/5 border-white/10 text-white"
                />

                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <Input
                    label="Quantidade"
                    type="number"
                    placeholder="1"
                    value={itemForm.quantity}
                    onChange={(e) =>
                      setItemForm({
                        ...itemForm,
                        quantity: e.target.value,
                      })
                    }
                    className="
      w-full
      sm:w-20
      bg-white/5
      border-white/10
      text-white
    "
                  />

                  <Input
                    label="Valor Unit."
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={itemForm.unitPrice}
                    onChange={(e) =>
                      setItemForm({
                        ...itemForm,
                        unitPrice: e.target.value,
                      })
                    }
                    className="
      w-full
      sm:w-28
      bg-white/5
      border-white/10
      text-white
    "
                  />

                  <Button
                    type="button"
                    onClick={addItem}
                    className="
      h-9
      px-6
      bg-[#fd6401]
      hover:bg-[#ff7b24]
      whitespace-nowrap
    "
                  >
                    Adicionar Item
                  </Button>
                </div>

                <div className="space-y-3 max-h-72 overflow-y-auto">
                  {form.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-white/10 bg-[#071124] p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-white">
                            {item.description}
                          </p>

                          <p className="mt-1 text-sm text-white/50">
                            {item.quantity} ×{" "}
                            {formatCurrency(Number(item.unitPrice))}
                          </p>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="font-semibold text-white">
                            {formatCurrency(
                              Number(item.quantity) * Number(item.unitPrice),
                            )}
                          </span>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(idx)}
                          >
                            <Trash2 className="h-4 w-4 text-red-400" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-white/10 bg-white/[0.03] px-6 py-5">
                <div className="space-y-3">
                  <div className="flex justify-between text-white/60">
                    <span className="text-xs">Subtotal</span>
                    <span className="text-xs">
                      {formatCurrency(calcSubtotal())}
                    </span>
                  </div>

                  <div className="flex justify-between text-white/60">
                    <span className="text-xs">Taxa</span>
                    <span className="text-xs">
                      {formatCurrency(calcSubtotal() * 0.1)}
                    </span>
                  </div>

                  <div className="h-px bg-white/10" />

                  <div className="flex justify-between text-xl font-bold text-white">
                    <span>Total</span>

                    <span>{formatCurrency(calcSubtotal() * 1.1)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:justify-between">
            <Button
              type="button"
              variant="secondary"
              onClick={generatePDF}
              className="
          bg-white/5
          text-white
          border-white/10
          hover:bg-white/10
        "
            >
              <FileDown className="mr-2 h-4 w-4" />
              Gerar PDF
            </Button>

            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setModalOpen(false)}
                className="
            bg-white/5
            text-white
            border-white/10
            hover:bg-white/10
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
                {editingQuote ? "Salvar" : "Criar Orçamento"}
              </Button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
