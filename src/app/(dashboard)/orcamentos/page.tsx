"use client";

import { useState } from "react";
import { jsPDF } from "jspdf";
import {
  Plus,
  Search,
  FileDown,
  Trash2,
  Pencil,
  Calculator,
} from "lucide-react";
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
import { formatCurrency, formatDate, translateStatus } from "@/lib/utils";

const quoteStatuses = [
  { value: "draft", label: "Rascunho" },
  { value: "sent", label: "Enviado" },
  { value: "approved", label: "Aprovado" },
  { value: "rejected", label: "Rejeitado" },
  { value: "converted", label: "Convertido" },
];

interface QuoteFormItem {
  description: string;
  quantity: string;
  material: string;
  weightGrams: string;
  printTimeHours: string;
  filamentCost: string;
  energyCost: string;
  printerHourlyRate: string;
  laborCost: string;
  otherCost: string;
  marginPercent: string;
}

interface QuoteForm {
  productName: string;
  clientName: string;
  status: Quote["status"];
  notes: string;
  validUntil: string;
  items: QuoteFormItem[];
}

const emptyItem: QuoteFormItem = {
  description: "",
  quantity: "1",
  material: "",
  weightGrams: "",
  printTimeHours: "",
  filamentCost: "",
  energyCost: "",
  printerHourlyRate: "",
  laborCost: "",
  otherCost: "",
  marginPercent: "40",
};

const emptyForm: QuoteForm = {
  productName: "",
  clientName: "",
  status: "draft",
  notes: "",
  validUntil: "",
  items: [],
};

const inputClass =
  "bg-white/5 border-white/10 text-white placeholder:text-white/30";

const labelClass = "mb-1.5 block text-sm font-medium text-white/70";

const errorClass = "mt-1 text-xs text-red-400";

function numberValue(value: string | number | null | undefined) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function calculateItem(item: QuoteFormItem) {
  const quantity = numberValue(item.quantity);
  const weightGrams = numberValue(item.weightGrams);
  const printTimeHours = numberValue(item.printTimeHours);

  const filamentCost = numberValue(item.filamentCost);
  const energyCost = numberValue(item.energyCost);
  const printerHourlyRate = numberValue(item.printerHourlyRate);
  const printerCost = printerHourlyRate * printTimeHours;
  const laborCost = numberValue(item.laborCost);
  const otherCost = numberValue(item.otherCost);
  const marginPercent = numberValue(item.marginPercent);

  const productionCost =
    filamentCost + energyCost + printerCost + laborCost + otherCost;

  const unitPrice =
    marginPercent >= 0 && marginPercent < 100
      ? productionCost / (1 - marginPercent / 100)
      : 0;

  return {
    quantity,
    weightGrams,
    printTimeHours,
    filamentCost,
    energyCost,
    printerHourlyRate,
    printerCost,
    laborCost,
    otherCost,
    marginPercent,
    productionCost,
    unitPrice,
    total: quantity * unitPrice,
  };
}

function createFormItem(item: QuoteItem): QuoteFormItem {
  const printTimeHours = numberValue(item.printTimeHours);
  const printerCost = numberValue(item.printerCost);

  return {
    description: item.description ?? "",
    quantity: String(item.quantity ?? 1),
    material: item.material ?? "",
    weightGrams: String(item.weightGrams ?? ""),
    printTimeHours: String(item.printTimeHours ?? ""),
    filamentCost: String(item.filamentCost ?? ""),
    energyCost: String(item.energyCost ?? ""),
    printerHourlyRate:
      printTimeHours > 0
        ? String(printerCost / printTimeHours)
        : String(printerCost || ""),
    laborCost: String(item.laborCost ?? ""),
    otherCost: String(item.otherCost ?? ""),
    marginPercent: String(item.marginPercent ?? 40),
  };
}

export default function QuotesPage() {
  const { quotes, loading, create, update, remove } = useQuotes();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);

  const [form, setForm] = useState<QuoteForm>(emptyForm);
  const [itemForm, setItemForm] = useState<QuoteFormItem>(emptyItem);
  const [itemErrors, setItemErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");

  const filtered = quotes.filter((quote) => {
    const term = search.toLowerCase();

    const matchesSearch =
      (quote.clientName ?? "").toLowerCase().includes(term) ||
      (quote.productName ?? "").toLowerCase().includes(term) ||
      String(quote.quoteNumber ?? "").includes(term);

    const matchesStatus =
      statusFilter === "all" || quote.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const subtotal = form.items.reduce((total, item) => {
    return total + calculateItem(item).total;
  }, 0);

  const totalProductionCost = form.items.reduce((total, item) => {
    return total + calculateItem(item).productionCost * calculateItem(item).quantity;
  }, 0);

  function openCreate() {
    setEditingQuote(null);
    setForm({ ...emptyForm, items: [] });
    setItemForm({ ...emptyItem });
    setItemErrors({});
    setFormError("");
    setModalOpen(true);
  }

  function openEdit(quote: Quote) {
    setEditingQuote(quote);

    setForm({
      productName: quote.productName ?? "",
      clientName: quote.clientName ?? "",
      status: quote.status,
      notes: quote.notes ?? "",
      validUntil: quote.validUntil ?? "",
      items: quote.items.map(createFormItem),
    });

    setItemForm({ ...emptyItem });
    setItemErrors({});
    setFormError("");
    setModalOpen(true);
  }

  function updateItemField<K extends keyof QuoteFormItem>(
    field: K,
    value: QuoteFormItem[K],
  ) {
    setItemForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setItemErrors((previous) => ({
      ...previous,
      [field]: "",
    }));
  }

  function validateItem() {
    const errors: Record<string, string> = {};

    if (!itemForm.description.trim()) {
      errors.description = "Informe a descrição do item.";
    }

    if (!itemForm.material.trim()) {
      errors.material = "Informe o material utilizado.";
    }

    if (
      itemForm.weightGrams.trim() === "" ||
      numberValue(itemForm.weightGrams) <= 0
    ) {
      errors.weightGrams = "Informe um peso maior que zero.";
    }

    if (
      itemForm.printTimeHours.trim() === "" ||
      numberValue(itemForm.printTimeHours) <= 0
    ) {
      errors.printTimeHours = "Informe um tempo maior que zero.";
    }

    if (
      itemForm.quantity.trim() === "" ||
      numberValue(itemForm.quantity) <= 0
    ) {
      errors.quantity = "Informe uma quantidade maior que zero.";
    }

    if (
      itemForm.marginPercent.trim() === "" ||
      numberValue(itemForm.marginPercent) < 0 ||
      numberValue(itemForm.marginPercent) >= 100
    ) {
      errors.marginPercent = "A margem deve estar entre 0% e 99,99%.";
    }

    const costFields: Array<keyof QuoteFormItem> = [
      "filamentCost",
      "energyCost",
      "printerHourlyRate",
      "laborCost",
      "otherCost",
    ];

    costFields.forEach((field) => {
      const value = itemForm[field];

      if (value.trim() !== "" && numberValue(value) < 0) {
        errors[field] = "O custo não pode ser negativo.";
      }
    });

    setItemErrors(errors);

    return Object.keys(errors).length === 0;
  }

  function addItem() {
    if (!validateItem()) return;

    const calculated = calculateItem(itemForm);

    if (calculated.productionCost <= 0) {
      setItemErrors((previous) => ({
        ...previous,
        costs: "Informe pelo menos um custo de produção maior que zero.",
      }));
      return;
    }

    setForm((previous) => ({
      ...previous,
      items: [...previous.items, { ...itemForm }],
    }));

    setItemForm({ ...emptyItem });
    setItemErrors({});
    setFormError("");
  }

  function removeItem(index: number) {
    setForm((previous) => ({
      ...previous,
      items: previous.items.filter((_, itemIndex) => itemIndex !== index),
    }));
  }

  function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    if (!form.clientName.trim()) {
      setFormError("Informe o nome do cliente.");
      return;
    }

    if (!form.productName.trim()) {
      setFormError("Informe o nome do produto ou projeto.");
      return;
    }

    if (form.items.length === 0) {
      setFormError("Adicione pelo menos um item ao orçamento.");
      return;
    }

    const items: QuoteItem[] = form.items.map((item, index) => {
      const calculated = calculateItem(item);

      return {
        id: editingQuote?.items[index]?.id ?? crypto.randomUUID(),
        description: item.description.trim(),
        quantity: calculated.quantity,
        unitPrice: calculated.unitPrice,
        total: calculated.total,
        material: item.material.trim(),
        weightGrams: calculated.weightGrams,
        printTimeHours: calculated.printTimeHours,
        filamentCost: calculated.filamentCost,
        energyCost: calculated.energyCost,
        printerCost: calculated.printerCost,
        laborCost: calculated.laborCost,
        otherCost: calculated.otherCost,
        productionCost: calculated.productionCost,
        marginPercent: calculated.marginPercent,
      };
    });

    const quoteData = {
      productId: null,
      productName: form.productName.trim(),
      clientId: null,
      clientName: form.clientName.trim(),
      status: form.status,
      items,
      subtotal,
      tax: 0,
      total: subtotal,
      notes: form.notes.trim(),
      validUntil: form.validUntil,
    };

    if (editingQuote) {
      update(editingQuote.id, quoteData);
    } else {
      create(quoteData);
    }

    setModalOpen(false);
  }

  function handleDelete(id: string) {
    if (confirm("Tem certeza que deseja excluir este orçamento?")) {
      remove(id);
    }
  }

  async function generatePDF() {
    if (form.items.length === 0) {
      setFormError("Adicione pelo menos um item antes de gerar o PDF.");
      return;
    }

    const doc = new jsPDF();

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
    doc.rect(0, 0, 210, 29, "F");

    doc.setFillColor(253, 100, 1);
    doc.rect(0, 29, 210, 1.2, "F");

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
    doc.text(translateStatus(form.status), 194, 18, {
      align: "right",
    });

    let y = 41;

    doc.setFontSize(9);
    doc.setTextColor(90, 90, 90);
    doc.text("CLIENTE", 14, y);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(20, 20, 20);
    doc.text(form.clientName || "—", 14, y + 6);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(90, 90, 90);
    doc.text("PRODUTO / PROJETO", 110, y);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(20, 20, 20);
    doc.text(form.productName || "—", 110, y + 6);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);

    if (form.validUntil) {
      doc.text(`Validade: ${formatDate(form.validUntil)}`, 14, y + 13);
    }

    y += 25;

    doc.setFillColor(245, 245, 245);
    doc.rect(14, y - 5, 182, 8, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(60, 60, 60);

    doc.text("Descrição", 16, y);
    doc.text("Qtd.", 118, y, { align: "right" });
    doc.text("Unitário", 157, y, { align: "right" });
    doc.text("Total", 194, y, { align: "right" });

    y += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(40, 40, 40);

    form.items.forEach((item) => {
      const calculated = calculateItem(item);
      const description = `${item.description} (${item.material})`;
      const lines = doc.splitTextToSize(description, 90);

      if (y + lines.length * 5 > 265) {
        doc.addPage();
        y = 20;
      }

      doc.text(lines, 16, y);
      doc.text(String(calculated.quantity), 118, y, { align: "right" });
      doc.text(formatCurrency(calculated.unitPrice), 157, y, {
        align: "right",
      });
      doc.text(formatCurrency(calculated.total), 194, y, {
        align: "right",
      });

      y += Math.max(7, lines.length * 5);
    });

    y += 5;

    if (y > 255) {
      doc.addPage();
      y = 20;
    }

    doc.setDrawColor(220, 220, 220);
    doc.line(14, y, 196, y);

    y += 8;

    doc.setFontSize(9);
    doc.setTextColor(90, 90, 90);
    
    y += 7;

    doc.text("Subtotal", 150, y, { align: "right" });
    doc.text(formatCurrency(subtotal), 194, y, { align: "right" });

    y += 9;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(253, 100, 1);
    doc.text("Total", 150, y, { align: "right" });
    doc.text(formatCurrency(subtotal), 194, y, { align: "right" });

    doc.setFont("helvetica", "normal");

    if (form.notes) {
      y += 16;

      if (y > 260) {
        doc.addPage();
        y = 20;
      }

      doc.setFontSize(9);
      doc.setTextColor(90, 90, 90);
      doc.text("OBSERVAÇÕES", 14, y);

      doc.setFontSize(10);
      doc.setTextColor(50, 50, 50);

      const lines = doc.splitTextToSize(form.notes, 180);
      doc.text(lines, 14, y + 6);
    }

    doc.save(
      `orcamento-${editingQuote?.quoteNumber ?? "novo"}.pdf`,
    );
  }

  if (loading) {
    return (
      <div className="relative min-h-screen bg-[#050914]">
        <div className="flex h-96 items-center justify-center">
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
        className="border-b border-white/10 bg-white/[0.02] text-white backdrop-blur-xl"
      />

      <div className="space-y-5 px-4 py-5 sm:space-y-6 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="border border-white/10 bg-[#050914] shadow-2xl shadow-black/40 backdrop-blur-2xl">
            <CardContent>
              <p className="text-sm text-white">Total de Orçamentos</p>
              <p className="text-2xl font-bold text-white/70">
                {quotes.length}
              </p>
            </CardContent>
          </Card>

          <Card className="border border-white/10 bg-[#050914] shadow-2xl shadow-black/40 backdrop-blur-2xl">
            <CardContent>
              <p className="text-sm text-white">Aprovados</p>
              <p className="text-2xl font-bold text-green-500">
                {quotes.filter((quote) => quote.status === "approved").length}
              </p>
            </CardContent>
          </Card>

          <Card className="border border-white/10 bg-[#050914] shadow-2xl shadow-black/40 backdrop-blur-2xl">
            <CardContent>
              <p className="text-sm text-white">Valor Total Aprovado</p>
              <p className="text-2xl font-bold text-white/70">
                {formatCurrency(
                  quotes
                    .filter((quote) => quote.status === "approved")
                    .reduce((total, quote) => total + quote.total, 0),
                )}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="border border-white/10 bg-[#050914] shadow-2xl shadow-black/40 backdrop-blur-2xl">
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:gap-4">
                <div className="relative w-full max-w-sm">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />

                  <input
                    type="text"
                    placeholder="Buscar orçamentos..."
                    className="h-11 w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 text-sm text-white outline-none transition-all placeholder:text-white/30 focus:border-[#fd6401]/50 focus:ring-2 focus:ring-[#fd6401]/20"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </div>

                <Select
                  options={[
                    { value: "all", label: "Todos Status" },
                    ...quoteStatuses,
                  ]}
                  value={statusFilter}
                  className="w-full border-white/10 bg-white/5 text-white focus:border-[#fd6401]/50 focus:ring-[#fd6401]/20 sm:w-44"
                  onChange={(event) => setStatusFilter(event.target.value)}
                />
              </div>

              <Button
                onClick={openCreate}
                className="bg-gradient-to-r from-[#071124] to-[#0d1a35] text-white ring-1 ring-white/10 hover:ring-[#fd6401]/30"
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
                    <TableCell className="text-center font-mono text-xs font-medium">
                      #{quote.quoteNumber ?? quote.id}
                    </TableCell>

                    <TableCell className="text-center text-xs">
                      {quote.productName || "—"}
                    </TableCell>

                    <TableCell>{quote.clientName || "—"}</TableCell>

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
                      {quote.validUntil ? formatDate(quote.validUntil) : "—"}
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
                          className="h-10 w-10 rounded-lg border border-white/10 bg-white/[0.03] text-white/60 transition-all hover:border-[#fd6401]/40 hover:bg-[#fd6401]/10 hover:text-[#fd6401]"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(quote.id)}
                          className="h-10 w-10 rounded-lg border border-white/10 bg-white/[0.03] text-white/60 transition-all hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400"
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
                      <div className="py-8 text-center text-sm text-white/40">
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
          <div className="grid gap-8 lg:grid-cols-[1fr_440px]">
            <div className="space-y-4">
              <div>
                <Input
                  id="productName"
                  label="Produto ou projeto"
                  placeholder="Ex.: Suporte personalizado"
                  value={form.productName}
                  onChange={(event) =>
                    setForm({ ...form, productName: event.target.value })
                  }
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <Input
                  id="clientName"
                  label="Cliente"
                  placeholder="Nome do cliente"
                  value={form.clientName}
                  onChange={(event) =>
                    setForm({ ...form, clientName: event.target.value })
                  }
                  className={inputClass}
                  required
                />
              </div>

              <Select
                id="status"
                label="Status"
                options={quoteStatuses}
                value={form.status}
                onChange={(event) =>
                  setForm({
                    ...form,
                    status: event.target.value as Quote["status"],
                  })
                }
                className={inputClass}
              />

              <Input
                id="validUntil"
                label="Validade"
                type="date"
                value={form.validUntil}
                onChange={(event) =>
                  setForm({ ...form, validUntil: event.target.value })
                }
                className={inputClass}
              />

              <Input
                id="notes"
                label="Observações"
                value={form.notes}
                onChange={(event) =>
                  setForm({ ...form, notes: event.target.value })
                }
                className={inputClass}
              />

              {formError && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {formError}
                </div>
              )}

              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <div className="mb-2 flex items-center gap-2 text-white">
                  <Calculator className="h-4 w-4 text-[#fd6401]" />
                  <h3 className="font-semibold">Como o preço é calculado</h3>
                </div>

                <p className="text-sm leading-relaxed text-white/50">
                  O custo de produção soma filamento, energia, impressora,
                  mão de obra e outros custos. O preço de venda considera a
                  margem informada sobre o próprio preço final.
                </p>

                <p className="mt-2 text-xs text-white/40">
                  Exemplo: custo de R$ 20,00 com margem de 40% resulta em
                  preço de venda de R$ 33,33.
                </p>
              </div>
            </div>

            <div className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
              <div className="border-b border-white/10 px-5 py-4">
                <h3 className="text-lg font-semibold text-white">
                  Composição do item
                </h3>
                <p className="mt-1 text-xs text-white/40">
                  Preencha os dados para calcular o preço.
                </p>
              </div>

              <div className="max-h-[65vh] flex-1 space-y-4 overflow-y-auto p-5">
                <div>
                  <label className={labelClass}>Descrição *</label>
                  <input
                    value={itemForm.description}
                    onChange={(event) =>
                      updateItemField("description", event.target.value)
                    }
                    placeholder="Ex.: Peça decorativa"
                    className={`w-full rounded-lg border bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-[#fd6401]/50 ${
                      itemErrors.description
                        ? "border-red-500/60"
                        : "border-white/10"
                    }`}
                  />
                  {itemErrors.description && (
                    <p className={errorClass}>{itemErrors.description}</p>
                  )}
                </div>

                <div>
                  <label className={labelClass}>Material *</label>
                  <input
                    value={itemForm.material}
                    onChange={(event) =>
                      updateItemField("material", event.target.value)
                    }
                    placeholder="Ex.: PLA, PETG, ABS"
                    className={`w-full rounded-lg border bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-[#fd6401]/50 ${
                      itemErrors.material
                        ? "border-red-500/60"
                        : "border-white/10"
                    }`}
                  />
                  {itemErrors.material && (
                    <p className={errorClass}>{itemErrors.material}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Quantidade *</label>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={itemForm.quantity}
                      onChange={(event) =>
                        updateItemField("quantity", event.target.value)
                      }
                      className={`w-full rounded-lg border bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-[#fd6401]/50 ${
                        itemErrors.quantity
                          ? "border-red-500/60"
                          : "border-white/10"
                      }`}
                    />
                    {itemErrors.quantity && (
                      <p className={errorClass}>{itemErrors.quantity}</p>
                    )}
                  </div>

                  <div>
                    <label className={labelClass}>Peso (g) *</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={itemForm.weightGrams}
                      onChange={(event) =>
                        updateItemField("weightGrams", event.target.value)
                      }
                      placeholder="Ex.: 85"
                      className={`w-full rounded-lg border bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-[#fd6401]/50 ${
                        itemErrors.weightGrams
                          ? "border-red-500/60"
                          : "border-white/10"
                      }`}
                    />
                    {itemErrors.weightGrams && (
                      <p className={errorClass}>{itemErrors.weightGrams}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Tempo de impressão (h) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={itemForm.printTimeHours}
                    onChange={(event) =>
                      updateItemField("printTimeHours", event.target.value)
                    }
                    placeholder="Ex.: 3.5"
                    className={`w-full rounded-lg border bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-[#fd6401]/50 ${
                      itemErrors.printTimeHours
                        ? "border-red-500/60"
                        : "border-white/10"
                    }`}
                  />
                  {itemErrors.printTimeHours && (
                    <p className={errorClass}>{itemErrors.printTimeHours}</p>
                  )}
                </div>

                <div className="border-t border-white/10 pt-4">
                  <h4 className="mb-3 text-sm font-semibold text-white">
                    Custos de produção
                  </h4>

                  <div className="space-y-3">
                    <div>
                      <label className={labelClass}>Filamento (R$)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={itemForm.filamentCost}
                        onChange={(event) =>
                          updateItemField("filamentCost", event.target.value)
                        }
                        placeholder="0,00"
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-[#fd6401]/50"
                      />
                      {itemErrors.filamentCost && (
                        <p className={errorClass}>{itemErrors.filamentCost}</p>
                      )}
                    </div>

                    <div>
                      <label className={labelClass}>Energia (R$)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={itemForm.energyCost}
                        onChange={(event) =>
                          updateItemField("energyCost", event.target.value)
                        }
                        placeholder="0,00"
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-[#fd6401]/50"
                      />
                      {itemErrors.energyCost && (
                        <p className={errorClass}>{itemErrors.energyCost}</p>
                      )}
                    </div>

                    <div>
                      <label className={labelClass}>
                        Custo da impressora por hora (R$/h)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={itemForm.printerHourlyRate}
                        onChange={(event) =>
                          updateItemField(
                            "printerHourlyRate",
                            event.target.value,
                          )
                        }
                        placeholder="Ex.: 2,50"
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-[#fd6401]/50"
                      />
                      {itemErrors.printerHourlyRate && (
                        <p className={errorClass}>
                          {itemErrors.printerHourlyRate}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className={labelClass}>Mão de obra (R$)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={itemForm.laborCost}
                        onChange={(event) =>
                          updateItemField("laborCost", event.target.value)
                        }
                        placeholder="0,00"
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-[#fd6401]/50"
                      />
                      {itemErrors.laborCost && (
                        <p className={errorClass}>{itemErrors.laborCost}</p>
                      )}
                    </div>

                    <div>
                      <label className={labelClass}>Outros custos (R$)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={itemForm.otherCost}
                        onChange={(event) =>
                          updateItemField("otherCost", event.target.value)
                        }
                        placeholder="0,00"
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-[#fd6401]/50"
                      />
                      {itemErrors.otherCost && (
                        <p className={errorClass}>{itemErrors.otherCost}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-4">
                  <label className={labelClass}>Margem de lucro (%) *</label>
                  <input
                    type="number"
                    min="0"
                    max="99.99"
                    step="0.01"
                    value={itemForm.marginPercent}
                    onChange={(event) =>
                      updateItemField("marginPercent", event.target.value)
                    }
                    className={`w-full rounded-lg border bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-[#fd6401]/50 ${
                      itemErrors.marginPercent
                        ? "border-red-500/60"
                        : "border-white/10"
                    }`}
                  />
                  {itemErrors.marginPercent && (
                    <p className={errorClass}>{itemErrors.marginPercent}</p>
                  )}
                </div>

                {itemErrors.costs && (
                  <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                    {itemErrors.costs}
                  </p>
                )}

                <div className="space-y-3 rounded-xl border border-white/10 bg-[#071124] p-4">
                  <div className="flex justify-between gap-4 text-sm text-white/50">
                    <span>Custo da impressora</span>
                    <span>
                      {formatCurrency(
                        numberValue(itemForm.printerHourlyRate) *
                          numberValue(itemForm.printTimeHours),
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4 text-sm text-white/50">
                    <span>Custo de produção</span>
                    <span>
                      {formatCurrency(
                        calculateItem(itemForm).productionCost,
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4 text-sm text-white/50">
                    <span>Lucro estimado por unidade</span>
                    <span className="text-green-400">
                      {formatCurrency(
                        calculateItem(itemForm).unitPrice -
                          calculateItem(itemForm).productionCost,
                      )}
                    </span>
                  </div>

                  <div className="border-t border-white/10 pt-3">
                    <p className="text-xs text-white/40">Preço de venda</p>
                    <p className="text-2xl font-bold text-[#fd6401]">
                      {formatCurrency(calculateItem(itemForm).unitPrice)}
                    </p>
                  </div>

                  <div className="flex justify-between gap-4 text-sm text-white/50">
                    <span>Total do item</span>
                    <span className="font-semibold text-white">
                      {formatCurrency(calculateItem(itemForm).total)}
                    </span>
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={addItem}
                  className="w-full bg-[#fd6401] text-white hover:bg-[#ff7b24]"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar item ao orçamento
                </Button>
              </div>

              <div className="border-t border-white/10 bg-white/[0.03] p-5">
                <h4 className="mb-3 text-sm font-semibold text-white">
                  Itens adicionados ({form.items.length})
                </h4>

                <div className="max-h-56 space-y-3 overflow-y-auto">
                  {form.items.map((item, index) => {
                    const calculated = calculateItem(item);

                    return (
                      <div
                        key={`${item.description}-${index}`}
                        className="rounded-xl border border-white/10 bg-[#071124] p-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="break-words font-medium text-white">
                              {item.description}
                            </p>

                            <p className="mt-1 text-xs text-white/40">
                              {item.material} · {item.weightGrams} g ·{" "}
                              {item.printTimeHours} h
                            </p>

                            <p className="mt-1 text-xs text-white/50">
                              {calculated.quantity} ×{" "}
                              {formatCurrency(calculated.unitPrice)}
                            </p>
                          </div>

                          <div className="flex shrink-0 items-center gap-2">
                            <span className="text-sm font-semibold text-white">
                              {formatCurrency(calculated.total)}
                            </span>

                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(index)}
                              className="h-8 w-8 p-0"
                            >
                              <Trash2 className="h-4 w-4 text-red-400" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {form.items.length === 0 && (
                    <p className="py-4 text-center text-sm text-white/30">
                      Nenhum item adicionado.
                    </p>
                  )}
                </div>

                <div className="mt-4 space-y-3 border-t border-white/10 pt-4">
                  <div className="flex justify-between text-sm text-white/50">
                    <span>Custo de produção</span>
                    <span>{formatCurrency(totalProductionCost)}</span>
                  </div>

                  <div className="flex justify-between text-sm text-white/50">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>

                  <div className="flex justify-between text-xl font-bold text-white">
                    <span>Total</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {formError && (
            <div className="mt-5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {formError}
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:justify-between">
            <Button
              type="button"
              variant="secondary"
              onClick={generatePDF}
              className="border-white/10 bg-white/5 text-white hover:bg-white/10"
            >
              <FileDown className="mr-2 h-4 w-4" />
              Gerar PDF
            </Button>

            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setModalOpen(false)}
                className="border-white/10 bg-white/5 text-white hover:bg-white/10"
              >
                Cancelar
              </Button>

              <Button
                type="submit"
                className="bg-gradient-to-r from-[#071124] to-[#0d1a35] text-white ring-1 ring-white/10 hover:ring-[#fd6401]/30"
              >
                {editingQuote ? "Salvar alterações" : "Criar Orçamento"}
              </Button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}