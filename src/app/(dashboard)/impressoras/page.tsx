"use client";

import { useState } from "react";
import { Plus, Search, Wrench } from "lucide-react";
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
      powerConsumption: form.powerConsumption ? Number(form.powerConsumption) : undefined,
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
      <Header
        title="Impressoras"
        className="border-b border-white/10 bg-white/[0.02] backdrop-blur-xl text-white"
      />

      {loading ? (
        <div className="p-6 flex items-center justify-center text-white/50 min-h-[200px]">
          Carregando...
        </div>
      ) : (
        <div className="p-6 space-y-6">
        <Card className="border border-white/10 bg-white/[0.03] backdrop-blur-2xl shadow-2xl shadow-black/40">
          <CardHeader className="border-b border-white/5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1 max-w-xs">
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
focus:border-[#fd6401]/50
focus:outline-none
focus:ring-1
focus:ring-[#fd6401]/30
"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button
                onClick={openCreate}
                className="
    bg-gradient-to-r
    from-[#071124]
    to-[#0d1a35]
    text-white
    shadow-lg
    shadow-black/30
    ring-1
    ring-white/10
    transition-all
    duration-300
    hover:shadow-[#fd6401]/20
    hover:ring-[#fd6401]/30
  "
              >
                <Plus className="h-4 w-4" />
                Nova Impressora
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
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
                  <TableHeadCell>Nome / Modelo</TableHeadCell>
                  <TableHeadCell>Fabricante</TableHeadCell>
                  <TableHeadCell>Tipo</TableHeadCell>
                  <TableHeadCell>Status</TableHeadCell>
                  <TableHeadCell>Bico</TableHeadCell>
                  <TableHeadCell>Volume</TableHeadCell>
                  <TableHeadCell>Custo/h</TableHeadCell>
                  <TableHeadCell>Última Manutenção</TableHeadCell>
                  <TableHeadCell className="text-center text-white/50">
                    Ações
                  </TableHeadCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((printer) => (
                  <TableRow key={printer.id}>
                    <TableCell>
                      <p className="font-medium text-white">{printer.name}</p>
                      <p className="text-xs text-gray-500">{printer.model}</p>
                    </TableCell>
                    <TableCell className="text-white/70">
                      {printer.manufacturer}
                    </TableCell>
                    <TableCell className="text-white/70">
                      {printer.type}
                    </TableCell>
                    <TableCell className="text-white/70">
                      <StatusBadge status={printer.status} />
                    </TableCell>
                    <TableCell className="text-white/70">
                      {printer.nozzleSize ? `${printer.nozzleSize}mm` : "-"}
                    </TableCell>
                    <TableCell className="text-xs text-white/70">
                      {printer.buildVolume}
                    </TableCell>
                    <TableCell className="text-white/70">
                      R$ {printer.costPerHour.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-white/70">
                      {formatDate(printer.lastMaintenance)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-white/60 hover:text-white hover:bg-white/5"
                          onClick={() => openEdit(printer)}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-400/80 hover:text-red-400 hover:bg-red-500/10"
                          onClick={() => handleDelete(printer.id)}
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
                      <div className="py-8 text-center text-sm text-white/40">
                        Nenhuma impressora encontrada
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
          <div className="grid grid-cols-2 gap-4">
            <Input
              id="name"
              label="Nome"
              value={form.name}
              className="
                        bg-white/5
                        border-white/10
                        text-white
                        placeholder:text-white/30
                        focus:border-[#fd6401]/50
                        focus:ring-[#fd6401]/20
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
                        focus:border-[#fd6401]/50
                        focus:ring-[#fd6401]/20
                        "
              onChange={(e) => setForm({ ...form, model: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              id="manufacturer"
              label="Fabricante"
              value={form.manufacturer}
              className="
                        bg-white/5
                        border-white/10
                        text-white
                        placeholder:text-white/30
                        focus:border-[#fd6401]/50
                        focus:ring-[#fd6401]/20
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
                        focus:border-[#fd6401]/50
                        focus:ring-[#fd6401]/20
                        "
              value={form.type}
              onChange={(e) =>
                setForm({ ...form, type: e.target.value as Printer["type"] })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              id="status"
              label="Status"
              options={printerStatuses}
              className="
                        bg-white/5
                        border-white/10
                        text-white
                        placeholder:text-white/30
                        focus:border-[#fd6401]/50
                        focus:ring-[#fd6401]/20
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
                        focus:border-[#fd6401]/50
                        focus:ring-[#fd6401]/20
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
                      focus:border-[#fd6401]/50
                      focus:ring-[#fd6401]/20
                      "
            onChange={(e) => setForm({ ...form, buildVolume: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-4">
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
                        focus:border-[#fd6401]/50
                        focus:ring-[#fd6401]/20
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
                        focus:border-[#fd6401]/50
                        focus:ring-[#fd6401]/20
                        "
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
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
              {editingPrinter ? "Salvar" : "Criar"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
