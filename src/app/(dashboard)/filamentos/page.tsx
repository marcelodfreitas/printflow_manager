"use client";

import { useState } from "react";
import { Plus, Search, Circle, Trash2, Pencil } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/common";import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from "@/components/ui/Table";
import Modal from "@/components/ui/Modal";
import type { Filament } from "@/types";
import { useFilaments } from "@/hooks/useFilaments";
import { formatCurrency } from "@/lib/utils";

const filamentTypes = [
  { value: "PLA", label: "PLA" },
  { value: "ABS", label: "ABS" },
  { value: "PETG", label: "PETG" },
  { value: "TPU", label: "TPU" },
  { value: "Nylon", label: "Nylon" },
  { value: "Polycarbonate", label: "Policarbonato" },
  { value: "Outro", label: "Outro" },
];

export default function FilamentsPage() {
  const { filaments, loading, create, update, remove } = useFilaments();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFilament, setEditingFilament] = useState<Filament | null>(null);
  const [form, setForm] = useState({
    name: "",
    type: "PLA" as Filament["type"],
    color: "",
    colorHex: "#000000",
    manufacturer: "",
    diameter: "1.75",
    weight: "1000",
    quantity: "1",
    costPerKg: "",
  });

  const filtered = filaments.filter(
    (f) =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.type.toLowerCase().includes(search.toLowerCase()) ||
      f.manufacturer.toLowerCase().includes(search.toLowerCase()),
  );

  const stockOf = (f: Filament) => f.remainingWeight ?? f.weight * f.quantity;

  function openCreate() {
    setEditingFilament(null);
    setForm({
      name: "",
      type: "PLA",
      color: "",
      colorHex: "#000000",
      manufacturer: "",
      diameter: "1.75",
      weight: "1000",
      quantity: "1",
      costPerKg: "",
    });
    setModalOpen(true);
  }

  function openEdit(filament: Filament) {
    setEditingFilament(filament);
    setForm({
      name: filament.name,
      type: filament.type,
      color: filament.color,
      colorHex: filament.colorHex,
      manufacturer: filament.manufacturer,
      diameter: String(filament.diameter),
      weight: String(filament.weight),
      quantity: String(filament.quantity),
      costPerKg: String(filament.costPerKg),
    });
    setModalOpen(true);
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();

    const data = {
      name: form.name,
      type: form.type,
      color: form.color,
      colorHex: form.colorHex,
      manufacturer: form.manufacturer,
      diameter: Number(form.diameter),
      weight: Number(form.weight),
      quantity: Number(form.quantity),
      costPerKg: Number(form.costPerKg),
    } as {
      name: string;
      type: Filament["type"];
      color: string;
      colorHex: string;
      manufacturer: string;
      diameter: number;
      weight: number;
      quantity: number;
      costPerKg: number;
      remainingWeight?: number;
    };

    if (editingFilament) {
      const weightChanged = data.weight !== editingFilament.weight;
      const quantityChanged = data.quantity !== editingFilament.quantity;
      if (weightChanged || quantityChanged) {
        data.remainingWeight = data.weight * data.quantity;
      }
      update(editingFilament.id, data);
    } else {
      create(data);
    }

    setModalOpen(false);
  }

  function handleDelete(id: string) {
    if (confirm("Tem certeza que deseja excluir este filamento?")) {
      remove(id);
    }
  }

  const totalValue = filaments.reduce(
    (acc, f) => acc + f.costPerKg * f.quantity,
    0,
  );

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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
  <Card className="border border-white/10 bg-white/[0.03] backdrop-blur-2xl shadow-2xl shadow-black/40">
    <CardContent className="p-6">
      <p className="text-sm text-white/50">Total de Filamentos</p>
      <p className="text-2xl font-bold text-white">
        {filaments.length}
      </p>
    </CardContent>
  </Card>
  <Card className="border border-white/10 bg-white/[0.03] backdrop-blur-2xl shadow-2xl shadow-black/40">
    <CardContent className="p-6">
      <p className="text-sm text-white/50">Estoque Disponível</p>
      <p className="text-2xl font-bold text-white">
        {filaments
          .reduce(
            (acc, f) =>
              acc + (f.remainingWeight ?? f.weight * f.quantity),
            0,
          )
          .toFixed(0)}
        g
      </p>
    </CardContent>
  </Card>
  <Card className="border border-white/10 bg-white/[0.03] backdrop-blur-2xl shadow-2xl shadow-black/40">
    <CardContent className="p-6">
      <p className="text-sm text-white/50">Unidades em Estoque</p>
      <p className="text-2xl font-bold text-white">
        {filaments.reduce((acc, f) => acc + f.quantity, 0)}
      </p>
    </CardContent>
  </Card>
  <Card className="border border-white/10 bg-white/[0.03] backdrop-blur-2xl shadow-2xl shadow-black/40">
    <CardContent className="p-6">
      <p className="text-sm text-white/50">Valor Total em Estoque</p>
      <p className="text-2xl font-bold text-white">
        {formatCurrency(totalValue)}
      </p>
    </CardContent>
  </Card>
</div>

          <Card className="border border-white/10 bg-white/[0.03] backdrop-blur-2xl shadow-2xl shadow-black/40">
            <CardHeader className="border-b border-white/5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full flex-1 sm:max-w-xs">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                  <input
                    type="text"
                    placeholder="Buscar filamentos..."
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
                  Novo Filamento
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
  {/* =========================
      MOBILE — CARDS
  ========================== */}
  <div className="space-y-3 p-4 md:hidden">
    {filtered.map((filament) => (
      <div
        key={filament.id}
        className="
          rounded-2xl
          border
          border-white/10
          bg-white/[0.03]
          p-4
          shadow-lg
          shadow-black/20
          backdrop-blur-xl
          transition-all
          duration-300
          hover:border-white/15
          hover:bg-white/[0.045]
        "
      >
        {/* Cabeçalho */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-white">
              {filament.name}
            </p>

            <p className="mt-0.5 text-xs text-white/40">
              {filament.manufacturer}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => openEdit(filament)}
              className="
                h-9
                w-9
                rounded-lg
                border
                border-white/10
                bg-white/[0.03]
                text-white/60
                transition-all
                duration-200
                hover:border-[var(--accent)]/40
                hover:accent-bg
                hover:taccent-text
              "
            >
              <Pencil className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(filament.id)}
              className="
                h-9
                w-9
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
        </div>

        {/* Cor + Tipo */}
        <div className="mt-4 flex items-center gap-3">
          <div
            className="h-9 w-9 shrink-0 rounded-full border border-white/10 shadow-inner"
            style={{ backgroundColor: filament.colorHex }}
          />

          <div className="min-w-0">
            <p className="text-sm font-medium text-white">
              {filament.color}
            </p>

            <p className="text-xs text-white/40">
              {filament.type}
            </p>
          </div>
        </div>

        {/* Informações */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
            <p className="text-[11px] text-white/35">
              Diâmetro
            </p>
            <p className="mt-1 text-sm font-medium text-white">
              {filament.diameter}mm
            </p>
          </div>

          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
            <p className="text-[11px] text-white/35">
              Peso
            </p>
            <p className="mt-1 text-sm font-medium text-white">
              {filament.weight}g
            </p>
          </div>

          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
            <p className="text-[11px] text-white/35">
              Estoque
            </p>
            <p
              className={`mt-1 text-sm font-medium ${
                stockOf(filament) <= filament.weight * 0.2
                  ? "text-red-400"
                  : stockOf(filament) <= filament.weight * 0.5
                    ? "text-amber-400"
                    : "text-white"
              }`}
            >
              {stockOf(filament)}g
            </p>
          </div>

          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
            <p className="text-[11px] text-white/35">
              Quantidade
            </p>
            <p
              className={`mt-1 text-sm font-medium ${
                filament.quantity <= 2
                  ? "text-red-400"
                  : "text-white"
              }`}
            >
              {filament.quantity}
            </p>
          </div>

          <div className="col-span-2 rounded-xl border border-white/5 bg-white/[0.02] p-3">
            <p className="text-[11px] text-white/35">
              Custo por Kg
            </p>
            <p className="mt-1 text-sm font-semibold text-white">
              {formatCurrency(filament.costPerKg)}
            </p>
          </div>
        </div>
      </div>
    ))}

    {filtered.length === 0 && (
      <div className="py-8 text-center text-sm text-white/40">
        Nenhum filamento encontrado
      </div>
    )}
  </div>

  {/* =========================
      DESKTOP — TABELA
  ========================== */}
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
            Nome
          </TableHeadCell>

          <TableHeadCell className="text-center text-white/50">
            Cor
          </TableHeadCell>

          <TableHeadCell className="text-center text-white/50">
            Tipo
          </TableHeadCell>

          <TableHeadCell className="text-center text-white/50">
            Fabricante
          </TableHeadCell>

          <TableHeadCell className="text-center text-white/50">
            Diâmetro
          </TableHeadCell>

          <TableHeadCell className="text-center text-white/50">
            Peso
          </TableHeadCell>

          <TableHeadCell className="text-center text-white/50">
            Estoque (g)
          </TableHeadCell>

          <TableHeadCell className="text-center text-white/50">
            Qtd
          </TableHeadCell>

          <TableHeadCell className="text-center text-white/50">
            Custo/Kg
          </TableHeadCell>

          <TableHeadCell className="text-center text-white/50">
            Ações
          </TableHeadCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {filtered.map((filament) => (
          <TableRow key={filament.id}>
            <TableCell className="text-center">
              <p className="font-medium text-white">
                {filament.name}
              </p>
            </TableCell>

            <TableCell className="text-center">
              <div className="mx-auto flex w-fit items-center gap-2">
                <Circle
                  className="h-4 w-4"
                  fill={filament.colorHex}
                  stroke={filament.colorHex}
                />

                <span className="text-sm text-white/70">
                  {filament.color}
                </span>
              </div>
            </TableCell>

            <TableCell className="text-center text-white/70">
              {filament.type}
            </TableCell>

            <TableCell className="text-center text-white/70">
              {filament.manufacturer}
            </TableCell>

            <TableCell className="text-center text-white/70">
              {filament.diameter}mm
            </TableCell>

            <TableCell className="text-center text-white/70">
              {filament.weight}g
            </TableCell>

            <TableCell className="text-center">
              <span
                className={
                  stockOf(filament) <= filament.weight * 0.2
                    ? "font-medium text-red-400"
                    : stockOf(filament) <= filament.weight * 0.5
                      ? "font-medium text-amber-400"
                      : "font-medium text-white"
                }
              >
                {stockOf(filament)}g
              </span>
            </TableCell>

            <TableCell className="text-center">
              <span
                className={
                  filament.quantity <= 2
                    ? "font-medium text-red-400"
                    : "text-white/70"
                }
              >
                {filament.quantity}
              </span>
            </TableCell>

            <TableCell className="text-center text-white/70">
              {formatCurrency(filament.costPerKg)}
            </TableCell>

            <TableCell className="text-center">
              <div className="flex items-center justify-center gap-1.5">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openEdit(filament)}
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
                    hover:taccent-text
                  "
                >
                  <Pencil className="h-4 w-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(filament.id)}
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
              <div className="py-8 text-center text-sm text-white/40">
                Nenhum filamento encontrado
              </div>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  </div>
</CardContent>
          </Card>

          <Modal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            title={editingFilament ? "Editar Filamento" : "Novo Filamento"}
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
                <Select
                  id="type"
                  label="Tipo"
                  options={filamentTypes}
                  value={form.type}
                  className="
                        bg-white/5
                        border-white/10
                        text-white
                        placeholder:text-white/30
                        focus:border-[var(--accent)]/50
                        focus:ring-[var(--accent)]/20
                        "
                  onChange={(e) =>
                    setForm({
                      ...form,
                      type: e.target.value as Filament["type"],
                    })
                  }
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <Input
                  id="color"
                  label="Cor"
                  value={form.color}
                  className="
                        bg-white/5
                        border-white/10
                        text-white
                        placeholder:text-white/30
                        focus:border-[var(--accent)]/50
                        focus:ring-[var(--accent)]/20
                        "
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                  required
                />
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Amostra
                  </label>
                  <input
                    type="color"
                    value={form.colorHex}
                    onChange={(e) =>
                      setForm({ ...form, colorHex: e.target.value })
                    }
                    className="h-10 w-full rounded-lg border border-white/10 bg-white/5 p-1"
                  />
                </div>
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
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <Input
                  id="diameter"
                  label="Diâmetro (mm)"
                  type="number"
                  step="0.05"
                  value={form.diameter}
                  className="
                        bg-white/5
                        border-white/10
                        text-white
                        placeholder:text-white/30
                        focus:border-[var(--accent)]/50
                        focus:ring-[var(--accent)]/20
                        "
                  onChange={(e) =>
                    setForm({ ...form, diameter: e.target.value })
                  }
                  required
                />
                <Input
                  id="weight"
                  label="Peso (g)"
                  type="number"
                  value={form.weight}
                  className="
                        bg-white/5
                        border-white/10
                        text-white
                        placeholder:text-white/30
                        focus:border-[var(--accent)]/50
                        focus:ring-[var(--accent)]/20
                        "
                  onChange={(e) => setForm({ ...form, weight: e.target.value })}
                  required
                />
                <Input
                  id="quantity"
                  label="Quantidade"
                  type="number"
                  value={form.quantity}
                  className="
                        bg-white/5
                        border-white/10
                        text-white
                        placeholder:text-white/30
                        focus:border-[var(--accent)]/50
                        focus:ring-[var(--accent)]/20
                        "
                  onChange={(e) =>
                    setForm({ ...form, quantity: e.target.value })
                  }
                  required
                />
              </div>
              <Input
                id="costPerKg"
                label="Custo por Kg (R$)"
                type="number"
                step="0.01"
                value={form.costPerKg}
                className="
                      bg-white/5
                      border-white/10
                      text-white
                      placeholder:text-white/30
                      focus:border-[var(--accent)]/50
                      focus:ring-[var(--accent)]/20
                      "
                onChange={(e) =>
                  setForm({ ...form, costPerKg: e.target.value })
                }
                required
              />
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
                  {editingFilament ? "Salvar" : "Criar"}
                </Button>
              </div>
            </form>
          </Modal>
        </div>
      )}
    </div>
  );
}
