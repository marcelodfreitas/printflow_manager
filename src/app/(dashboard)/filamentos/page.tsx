"use client";

import { useState } from "react";
import { Plus, Search, Circle } from "lucide-react";
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
    };

    if (editingFilament) {
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
      <Header
        title="Filamentos"
        className="border-b border-white/10 bg-white/[0.02] backdrop-blur-xl text-white"
      />

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-sm text-white/50">Carregando...</div>
        </div>
      )}

      {!loading && (<>
        <div className="grid gap-4  sm:grid-cols-3">
          <Card className="border border-white/10 bg-white/[0.03] backdrop-blur-2xl shadow-2xl shadow-black/40">
            <CardContent>
              <p className="text-sm text-white/50">Total de Filamentos</p>
              <p className="text-2xl font-bold text-white">
                {filaments.length}
              </p>
            </CardContent>
          </Card>
          <Card className="border border-white/10 bg-white/[0.03] backdrop-blur-2xl shadow-2xl shadow-black/40">
            <CardContent>
              <p className="text-sm text-white/50">Unidades em Estoque</p>
              <p className="text-2xl font-bold text-white">
                {filaments.reduce((acc, f) => acc + f.quantity, 0)}
              </p>
            </CardContent>
          </Card>
          <Card className="border border-white/10 bg-white/[0.03] backdrop-blur-2xl shadow-2xl shadow-black/40">
            <CardContent>
              <p className="text-sm  text-white/50">Valor Total em Estoque</p>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(totalValue)}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="border border-white/10 bg-white/[0.03] backdrop-blur-2xl shadow-2xl shadow-black/40">
          <CardHeader className="border-b border-white/5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1 max-w-xs">
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
                    hover:ring-[#fd6401]/30
                    hover:shadow-[#fd6401]/20
                "
              >
                <Plus className="h-4 w-4" />
                Novo Filamento
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0 bg-[#0a1120] rounded-xl ">
            <Table>
              <TableHead className="border-b border-white/10">
                <TableRow
                      className="
                      border-b
                      border-white/5
                      hover:bg-white/[0.02]
                      transition-colors
                      last:border-0
                  ">
                  <TableHeadCell>Nome</TableHeadCell>
                  <TableHeadCell>Cor</TableHeadCell>
                  <TableHeadCell>Tipo</TableHeadCell>
                  <TableHeadCell>Fabricante</TableHeadCell>
                  <TableHeadCell>Diâmetro</TableHeadCell>
                  <TableHeadCell>Peso</TableHeadCell>
                  <TableHeadCell>Qtd</TableHeadCell>
                  <TableHeadCell>Custo/Kg</TableHeadCell>
                  <TableHeadCell className="text-center">Ações</TableHeadCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((filament) => (
                  <TableRow key={filament.id}>
                    <TableCell>
                      <p className="font-medium text-white">{filament.name}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Circle
                          className="h-4 w-4"
                          fill={filament.colorHex}
                          stroke={filament.colorHex}
                        />
                        <span className="text-sm">{filament.color}</span>
                      </div>
                    </TableCell>
                    <TableCell>{filament.type}</TableCell>
                    <TableCell>{filament.manufacturer}</TableCell>
                    <TableCell>{filament.diameter}mm</TableCell>
                    <TableCell>{filament.weight}g</TableCell>
                    <TableCell>
                      <span
                        className={
                          filament.quantity <= 2
                            ? "font-medium text-red-600"
                            : ""
                        }
                      >
                        {filament.quantity}
                      </span>
                    </TableCell>
                    <TableCell>{formatCurrency(filament.costPerKg)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEdit(filament)}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(filament.id)}
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
                        Nenhum filamento encontrado
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        
        title={editingFilament ? "Editar Filamento" : "Novo Filamento"}
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
                        focus:border-[#fd6401]/50
                        focus:ring-[#fd6401]/20
                        "
              onChange={(e) =>
                setForm({ ...form, type: e.target.value as Filament["type"] })
              }
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input
              id="color"
              label="Cor"
              value={form.color}
              className="
                        bg-white/5
                        border-white/10
                        text-white
                        placeholder:text-white/30
                        focus:border-[#fd6401]/50
                        focus:ring-[#fd6401]/20
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
                onChange={(e) => setForm({ ...form, colorHex: e.target.value })}
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
                        focus:border-[#fd6401]/50
                        focus:ring-[#fd6401]/20
                        "
              onChange={(e) =>
                setForm({ ...form, manufacturer: e.target.value })
              }
              required
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
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
                        focus:border-[#fd6401]/50
                        focus:ring-[#fd6401]/20
                        "
              onChange={(e) => setForm({ ...form, diameter: e.target.value })}
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
                        focus:border-[#fd6401]/50
                        focus:ring-[#fd6401]/20
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
                        focus:border-[#fd6401]/50
                        focus:ring-[#fd6401]/20
                        "
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
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
                      focus:border-[#fd6401]/50
                      focus:ring-[#fd6401]/20
                      "
            onChange={(e) => setForm({ ...form, costPerKg: e.target.value })}
            required
          />
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
            <Button type="submit" className="
                                            bg-gradient-to-r
                                            from-[#071124]
                                            to-[#0d1a35]
                                            text-white
                                            ring-1
                                            ring-white/10
                                            hover:ring-[#fd6401]/30
                                            ">
              {editingFilament ? "Salvar" : "Criar"}
            </Button>
          </div>
        </form>
      </Modal>
      </>
    )}
    </div>
  );
}
