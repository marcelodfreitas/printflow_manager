"use client";

import { useState } from "react";
import { Plus, Search, FileDown, Trash2 } from "lucide-react";
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

interface QuoteFormItem {
  description: string;
  quantity: string;
  unitPrice: string;
}
import { mockQuotes, mockClients } from "@/data/mock";
import { formatCurrency, formatDate } from "@/lib/utils";

const quoteStatuses = [
  { value: "draft", label: "Rascunho" },
  { value: "sent", label: "Enviado" },
  { value: "approved", label: "Aprovado" },
  { value: "rejected", label: "Rejeitado" },
  { value: "converted", label: "Convertido" },
];

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>(mockQuotes);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [form, setForm] = useState({
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
      q.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  function openCreate() {
    setEditingQuote(null);
    setForm({
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

    const selectedClient = mockClients.find((c) => c.id === form.clientId);

    const newItems: QuoteItem[] = form.items.map((item, idx) => ({
      id: String(idx),
      description: item.description,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
      total: Number(item.quantity) * Number(item.unitPrice),
    }));

    if (editingQuote) {
      setQuotes((prev) =>
        prev.map((q) =>
          q.id === editingQuote.id
            ? {
                ...q,
                clientId: form.clientId,
                clientName: selectedClient?.name || q.clientName,
                status: form.status,
                items: newItems,
                subtotal,
                tax,
                total,
                notes: form.notes,
                validUntil: form.validUntil,
              }
            : q,
        ),
      );
    } else {
      const newQuote: Quote = {
        id: String(Date.now()),
        clientId: form.clientId,
        clientName: selectedClient?.name || "",
        status: form.status,
        items: newItems,
        subtotal,
        tax,
        total,
        notes: form.notes,
        validUntil: form.validUntil,
        createdAt: new Date().toISOString().split("T")[0],
      };
      setQuotes((prev) => [newQuote, ...prev]);
    }

    setModalOpen(false);
  }

  function handleDelete(id: string) {
    if (confirm("Tem certeza que deseja excluir este orçamento?")) {
      setQuotes((prev) => prev.filter((q) => q.id !== id));
    }
  }

  return (
    <div className="relative min-h-screen bg-[#050914]">
      <div className="pointer-events-none fixed -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-[#071124]/60 blur-[120px]" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.06)_1px,transparent_0)] bg-[size:32px_32px]" />
      <Header
        title="Orçamentos"
        className="border-b border-white/10 bg-white/[0.02] backdrop-blur-xl text-white"
      />

      <div className="p-6 space-y-6">
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
              <div className="flex gap-4 flex-1">
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
                            w-44
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
                  <TableHeadCell>Orçamento</TableHeadCell>
                  <TableHeadCell>Cliente</TableHeadCell>
                  <TableHeadCell>Itens</TableHeadCell>
                  <TableHeadCell>Subtotal</TableHeadCell>
                  <TableHeadCell>Total</TableHeadCell>
                  <TableHeadCell>Status</TableHeadCell>
                  <TableHeadCell>Validade</TableHeadCell>
                  <TableHeadCell>Criação</TableHeadCell>
                  <TableHeadCell className="text-center text-white/50">Ações</TableHeadCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((quote) => (
                  <TableRow key={quote.id}>
                    <TableCell className="font-mono text-xs font-medium">
                      #{quote.id}
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
                          onClick={() => handleDelete(quote.id)}
                        >
                          Excluir
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9}>
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
          id="client"
          label="Cliente"
          options={mockClients.map((c) => ({
            value: c.id,
            label: c.name,
          }))}
          value={form.clientId}
          onChange={(e) =>
            setForm({ ...form, clientId: e.target.value })
          }
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
          onChange={(e) =>
            setForm({ ...form, notes: e.target.value })
          }
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

        <div className="flex items-end gap-3">

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
      w-20
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
      w-28
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
                                {item.quantity} × {formatCurrency(Number(item.unitPrice))}
                            </p>

                        </div>

                        <div className="flex items-center gap-4">

                            <span className="font-semibold text-white">
                                {formatCurrency(
                                    Number(item.quantity) *
                                    Number(item.unitPrice)
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
                <span className="text-xs">{formatCurrency(calcSubtotal())}</span>
            </div>

            <div className="flex justify-between text-white/60">
                <span className="text-xs">Taxa</span>
                <span className="text-xs">{formatCurrency(calcSubtotal() * 0.1)}</span>
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

    <div className="mt-8 flex justify-between border-t border-white/10 pt-6">

      <Button
        type="button"
        variant="secondary"
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

      <div className="flex gap-3">

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
