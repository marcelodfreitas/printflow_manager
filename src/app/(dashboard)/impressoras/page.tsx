"use client";

import { useState } from "react";
import { Plus, Search, Trash2, Pencil } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { Card, CardContent, CardHeader } from "@/components/common";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from "@/components/ui/Table";
import Modal from "@/components/ui/Modal";
import { Badge as StatusBadge } from "@/components/ui/Badge";
import type { Printer } from "@/types";
import { formatDate } from "@/lib/utils";
import { usePrinters } from "@/hooks/usePrinters";

const printerTypes = [
  { value: "FDM", label: "FDM" },
  { value: "SLA", label: "SLA" },
  { value: "SLS", label: "SLS" },
  { value: "DLP", label: "DLP" },
];

const printerStatuses = [
  { value: "active", label: "Ativa" },
  { value: "idle", label: "Ociosa" },
  { value: "maintenance", label: "Manutenção" },
  { value: "offline", label: "Offline" },
];

export default function PrintersPage() {
  const { printers, loading, create, update, remove } = usePrinters();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPrinter, setEditingPrinter] = useState<Printer | null>(null);
  const [form, setForm] = useState({
    name: "",
    model: "",
    manufacturer: "",
    type: "FDM" as Printer["type"],
    status: "idle" as Printer["status"],
    nozzleSize: "",
    buildVolume: "",
    powerConsumption: "",
    costPerHour: "",
  });

  const filtered = printers.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.model.toLowerCase().includes(search.toLowerCase()) ||
      p.manufacturer.toLowerCase().includes(search.toLowerCase()),
  );

  function openCreate() {
    setEditingPrinter(null);
    setForm({
      name: "",
      model: "",
      manufacturer: "",
      type: "FDM",
      status: "idle",
      nozzleSize: "",
      buildVolume: "",
      powerConsumption: "",
      costPerHour: "",
    });
    setModalOpen(true);
  }

  function openEdit(printer: Printer) {
    setEditingPrinter(printer);
    setForm({
      name: printer.name,
      model: printer.model,
      manufacturer: printer.manufacturer,
      type: printer.type,
      status: printer.status,
      nozzleSize: printer.nozzleSize?.toString() || "",
      buildVolume: printer.buildVolume,
      powerConsumption: printer.powerConsumption?.toString() || "",
      costPerHour: printer.costPerHour.toString(),
    });
    setModalOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();

    const data = {
      name: form.name,
      model: form.model,
      manufacturer: form.manufacturer,
      type: form.type as Printer["type"],
      status: form.status as Printer["status"],
      nozzleSize: form.nozzleSize ? Number(form.nozzleSize) : undefined,
      buildVolume: form.buildVolume,
      powerConsumption: form.powerConsumption
        ? Number(form.powerConsumption)
        : undefined,
      costPerHour: Number(form.costPerHour) || 0,
      lastMaintenance: new Date().toISOString().split("T")[0],
    };

    if (editingPrinter) {
      await update(editingPrinter.id, data);
    } else {
      await create(data);
    }

    setModalOpen(false);
  }

  async function handleDelete(id: string) {
    if (confirm("Tem certeza que deseja excluir esta impressora?")) {
      await remove(id);
    }
  }

  return (
    <div className="relative min-h-screen bg-[#050914]">
      <div className="pointer-events-none fixed -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-[#071124]/60 blur-[120px]" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.06)_1px,transparent_0)] bg-[size:32px_32px]" />

      {loading ? (
        <div className="flex min-h-[200px] items-center justify-center px-4 py-5 text-white/50 sm:p-6">
          Carregando...
        </div>
      ) : (
        <div className="space-y-5 px-4 py-5 sm:p-6 sm:space-y-6">
          <Card className="border border-white/10 bg-white/[0.03] backdrop-blur-2xl shadow-2xl shadow-black/40">
            <CardHeader className="border-b border-white/5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full flex-1 sm:max-w-xs">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />{" "}
                  <input
                    type="text"
                    placeholder="Buscar impressoras..."
                    className="
                            w-full
                            rounded-lg
                            border
                            border-white/10
                            bg-white/5
                            py-2
                            pl-10
                            pr-4
                            text-sm
                            text-white
                            placeholder:text-white/30
                            focus:border-[var(--accent)]/50
                            focus:outline-none
                            focus:ring-1
                            focus:ring-[var(--accent)]/30
                            "
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <Button
                  onClick={openCreate}
                  className="bg-gradient-to-r from-[#071124] to-[#0d1a35] text-white shadow-lg shadow-black/30 ring-1 ring-white/10 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(var(--accent-rgb),0.20)] hover:ring-[rgba(var(--accent-rgb),0.30)]"

                >
                  <Plus className="h-4 w-4" />
                  Nova Impressora
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
  {/* DESKTOP */}
  <div className="hidden md:block">
    <Table>
      <TableHead className="border-b border-white/10">
        <TableRow
          className="
            border-b
            border-white/5
            transition-colors
            hover:bg-white/[0.02]
            last:border-0
          "
        >
          <TableHeadCell className="text-center text-white/50">
            Nome / Modelo
          </TableHeadCell>

          <TableHeadCell className="text-center text-white/50">
            Fabricante
          </TableHeadCell>

          <TableHeadCell className="text-center text-white/50">
            Tipo
          </TableHeadCell>

          <TableHeadCell className="text-center text-white/50">
            Status
          </TableHeadCell>

          <TableHeadCell className="text-center text-white/50">
            Bico
          </TableHeadCell>

          <TableHeadCell className="text-center text-white/50">
            Volume
          </TableHeadCell>

          <TableHeadCell className="text-center text-white/50">
            Custo/h
          </TableHeadCell>

          <TableHeadCell className="text-center text-white/50">
            Última Manutenção
          </TableHeadCell>

          <TableHeadCell className="text-center text-white/50">
            Ações
          </TableHeadCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {filtered.map((printer) => (
          <TableRow key={printer.id}>
            <TableCell className="text-center">
              <p className="font-medium text-white">{printer.name}</p>
              <p className="text-xs text-white/40">{printer.model}</p>
            </TableCell>

            <TableCell className="text-center text-white/70">
              {printer.manufacturer}
            </TableCell>

            <TableCell className="text-center text-white/70">
              {printer.type}
            </TableCell>

            <TableCell className="text-center">
              <StatusBadge
                variant={
                  printer.status === "active"
                    ? "success"
                    : printer.status === "idle"
                      ? "warning"
                      : printer.status === "maintenance"
                        ? "info"
                        : "danger"
                }
              >
                {printerStatuses.find(
                  (status) => status.value === printer.status,
                )?.label ?? printer.status}
              </StatusBadge>
            </TableCell>

            <TableCell className="text-center text-white/70">
              {printer.nozzleSize ? `${printer.nozzleSize}mm` : "-"}
            </TableCell>

            <TableCell className="text-center text-xs text-white/70">
              {printer.buildVolume}
            </TableCell>

            <TableCell className="text-center text-white/70">
              R$ {printer.costPerHour.toFixed(2)}
            </TableCell>

            <TableCell className="text-center text-white/70">
              {formatDate(printer.lastMaintenance)}
            </TableCell>

            <TableCell className="text-center">
              <div className="flex items-center justify-center gap-1.5">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openEdit(printer)}
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
                  onClick={() => handleDelete(printer.id)}
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
            <TableCell colSpan={9}>
              <div className="py-8 text-center text-sm text-white/40">
                Nenhuma impressora encontrada
              </div>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  </div>

  {/* MOBILE */}
  <div className="space-y-3 p-4 md:hidden">
    {filtered.map((printer) => (
      <div
        key={printer.id}
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
        {/* Cabeçalho */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-white">
              {printer.name}
            </h3>

            <p className="mt-0.5 text-sm text-white/40">
              {printer.model}
            </p>
          </div>

          <StatusBadge
            variant={
              printer.status === "active"
                ? "success"
                : printer.status === "idle"
                  ? "warning"
                  : printer.status === "maintenance"
                    ? "info"
                    : "danger"
            }
          >
            {printerStatuses.find(
              (status) => status.value === printer.status,
            )?.label ?? printer.status}
          </StatusBadge>
        </div>

        {/* Informações */}
        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-4">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-white/30">
              Fabricante
            </p>
            <p className="mt-1 text-sm text-white/80">
              {printer.manufacturer || "-"}
            </p>
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-wide text-white/30">
              Tipo
            </p>
            <p className="mt-1 text-sm font-medium text-white/80">
              {printer.type}
            </p>
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-wide text-white/30">
              Bico
            </p>
            <p className="mt-1 text-sm text-white/80">
              {printer.nozzleSize
                ? `${printer.nozzleSize}mm`
                : "-"}
            </p>
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-wide text-white/30">
              Volume
            </p>
            <p className="mt-1 text-sm text-white/80">
              {printer.buildVolume || "-"}
            </p>
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-wide text-white/30">
              Consumo
            </p>
            <p className="mt-1 text-sm text-white/80">
              {printer.powerConsumption
                ? `${printer.powerConsumption} W`
                : "-"}
            </p>
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-wide text-white/30">
              Custo / hora
            </p>
            <p className="mt-1 text-sm font-semibold text-white">
              R$ {printer.costPerHour.toFixed(2)}
            </p>
          </div>

          <div className="col-span-2">
            <p className="text-[11px] uppercase tracking-wide text-white/30">
              Última manutenção
            </p>
            <p className="mt-1 text-sm text-white/80">
              {formatDate(printer.lastMaintenance)}
            </p>
          </div>
        </div>

        {/* Ações */}
        <div className="mt-4 flex gap-2 border-t border-white/10 pt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openEdit(printer)}
            className="
              h-10
              flex-1
              rounded-lg
              border
              border-white/10
              bg-white/[0.03]
              text-white/70
              transition-all
              hover:border-[var(--accent)]/40
              hover:accent-bg
              hover:accent-text
            "
          >
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(printer.id)}
            className="
              h-10
              flex-1
              rounded-lg
              border
              border-white/10
              bg-white/[0.03]
              text-white/70
              transition-all
              hover:border-red-500/40
              hover:bg-red-500/10
              hover:text-red-400
            "
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir
          </Button>
        </div>
      </div>
    ))}

    {filtered.length === 0 && (
      <div className="py-8 text-center text-sm text-white/40">
        Nenhuma impressora encontrada
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
        title={editingPrinter ? "Editar Impressora" : "Nova Impressora"}
        className="
                  border
                  border-white/10
                  bg-[#0a1120]/95
                  backdrop-blur-2xl
                  text-white
                "
        size="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              id="name"
              label="Nome"
              value={form.name}
              className="
                        bg-white/5
                        border-white/10
                        text-white
                        placeholder:text-white/30
                        focus:border-[var(--accent)]/50
                        focus:ring-[var(--accent)]/20
                        "
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <Input
              id="model"
              label="Modelo"
              value={form.model}
              className="
                        bg-white/5
                        border-white/10
                        text-white
                        placeholder:text-white/30
                        focus:border-[var(--accent)]/50
                        focus:ring-[var(--accent)]/20
                        "
              onChange={(e) => setForm({ ...form, model: e.target.value })}
              required
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              id="manufacturer"
              label="Fabricante"
              value={form.manufacturer}
              className="
                        bg-white/5
                        border-white/10
                        text-white
                        placeholder:text-white/30
                        focus:border-[var(--accent)]/50
                        focus:ring-[var(--accent)]/20
                        "
              onChange={(e) =>
                setForm({ ...form, manufacturer: e.target.value })
              }
              required
            />
            <Select
              id="type"
              label="Tipo"
              options={printerTypes}
              className="
                        bg-white/5
                        border-white/10
                        text-white
                        placeholder:text-white/30
                        focus:border-[var(--accent)]/50
                        focus:ring-[var(--accent)]/20
                        "
              value={form.type}
              onChange={(e) =>
                setForm({ ...form, type: e.target.value as Printer["type"] })
              }
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              id="status"
              label="Status"
              options={printerStatuses}
              className="
                        bg-white/5
                        border-white/10
                        text-white
                        placeholder:text-white/30
                        focus:border-[var(--accent)]/50
                        focus:ring-[var(--accent)]/20
                        "
              value={form.status}
              onChange={(e) =>
                setForm({
                  ...form,
                  status: e.target.value as Printer["status"],
                })
              }
            />
            <Input
              id="nozzle"
              label="Bico (mm)"
              type="number"
              step="0.1"
              placeholder="0.4"
              value={form.nozzleSize}
              onChange={(e) => setForm({ ...form, nozzleSize: e.target.value })}
              className="
                        bg-white/5
                        border-white/10
                        text-white
                        placeholder:text-white/30
                        focus:border-[var(--accent)]/50
                        focus:ring-[var(--accent)]/20
                        "
            />
          </div>
          <Input
            id="buildVolume"
            label="Volume de Impressão"
            placeholder="220 x 220 x 250 mm"
            value={form.buildVolume}
            className="
                      bg-white/5
                      border-white/10
                      text-white
                      placeholder:text-white/30
                      focus:border-[var(--accent)]/50
                      focus:ring-[var(--accent)]/20
                      "
            onChange={(e) => setForm({ ...form, buildVolume: e.target.value })}
            required
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              id="powerConsumption"
              label="Consumo (W)"
              type="number"
              step="1"
              placeholder="300"
              value={form.powerConsumption}
              onChange={(e) =>
                setForm({ ...form, powerConsumption: e.target.value })
              }
              className="
                        bg-white/5
                        border-white/10
                        text-white
                        placeholder:text-white/30
                        focus:border-[var(--accent)]/50
                        focus:ring-[var(--accent)]/20
                        "
            />
            <Input
              id="costPerHour"
              label="Custo por hora (R$)"
              type="number"
              step="0.01"
              placeholder="0.50"
              value={form.costPerHour}
              onChange={(e) =>
                setForm({ ...form, costPerHour: e.target.value })
              }
              className="
                        bg-white/5
                        border-white/10
                        text-white
                        placeholder:text-white/30
                        focus:border-[var(--accent)]/50
                        focus:ring-[var(--accent)]/20
                        "
            />
          </div>
          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
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
                    hover:ring-[var(--accent)]/30
                      "
            >
              {editingPrinter ? "Salvar" : "Criar"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
