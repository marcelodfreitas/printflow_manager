"use client";

import { useState } from "react";
import { Plus, Search } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Pencil, Trash2 } from "lucide-react";
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
import type { Product } from "@/types";
import { useProducts } from "@/hooks/useProducts";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function ProductsPage() {
  const { products, loading, create, update, remove } = useProducts();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
  });

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.description ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  function openCreate() {
    setEditingProduct(null);
    setForm({ name: "", description: "", price: "" });
    setModalOpen(true);
  }

  function openEdit(product: Product) {
    setEditingProduct(product);
    setForm({
      name: product.name,
      description: product.description || "",
      price: String(product.price),
    });
    setModalOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();

    if (!form.name) return;

    const data = {
      name: form.name,
      description: form.description || undefined,
      price: Number(form.price) || 0,
    };

    if (editingProduct) {
      await update(editingProduct.id, data);
    } else {
      await create(data);
    }

    setModalOpen(false);
  }

  function handleDelete(id: string) {
    if (confirm("Tem certeza que deseja excluir este produto?")) {
      remove(id);
    }
  }

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
          <Card className="border border-white/10 bg-white/[0.03] backdrop-blur-2xl shadow-2xl shadow-black/40">
            {" "}
            <CardHeader className="border-b border-white/5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full flex-1 sm:max-w-xs">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                  <input
                    type="text"
                    placeholder="Buscar produtos..."
                    className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-10 pr-4 text-sm text-white placeholder:text-white/30 focus:border-[var(--accent)]/50 focus:outline-none focus:ring-1 focus:ring-[var(--accent)]/30"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <Button
                  onClick={openCreate}
                  className="bg-gradient-to-r from-[#071124] to-[#0d1a35] text-white shadow-lg shadow-black/30 ring-1 ring-white/10 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(var(--accent-rgb),0.20)] hover:ring-[rgba(var(--accent-rgb),0.30)]"
                >
                  <Plus className="h-4 w-4" />
                  Novo Produto
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {/* DESKTOP — tabela */}
              <div className="hidden md:block">
                <Table>
                  <TableHead className="border-b border-white/10">
                    <TableRow>
                      <TableHeadCell className="text-center text-white/50">
                        Produto
                      </TableHeadCell>

                      <TableHeadCell className="text-center text-white/50">
                        Descrição
                      </TableHeadCell>

                      <TableHeadCell className="text-center text-white/50">
                        Preço
                      </TableHeadCell>

                      <TableHeadCell className="text-center text-white/50">
                        Cadastro
                      </TableHeadCell>

                      <TableHeadCell className="text-center text-white/50">
                        Ações
                      </TableHeadCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {filtered.map((product) => (
                      <TableRow
                        key={product.id}
                        className="border-b border-white/5 transition-colors hover:bg-white/[0.02] last:border-0"
                      >
                        <TableCell className="text-center">
                          <p className="font-medium text-white">
                            {product.name}
                          </p>
                        </TableCell>

                        <TableCell className="text-center text-white/60">
                          {product.description || "—"}
                        </TableCell>

                        <TableCell className="text-center font-medium text-white">
                          {formatCurrency(product.price)}
                        </TableCell>

                        <TableCell className="text-center text-white/50">
                          {formatDate(product.createdAt)}
                        </TableCell>

                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEdit(product)}
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
                              onClick={() => handleDelete(product.id)}
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
                        <TableCell colSpan={5}>
                          <div className="py-8 text-center text-sm text-white/40">
                            Nenhum produto encontrado
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* MOBILE — cards */}
              <div className="space-y-3 p-4 md:hidden">
                {filtered.map((product) => (
                  <div
                    key={product.id}
                    className="rounded-2xl
          border
          border-white/10
          bg-white/[0.03]
          p-4
          shadow-lg
          shadow-black/20
          backdrop-blur-2xl"
                  >
                    <div className="space-y-4">
                      {/* Produto */}
                      <div>
                        <p className="text-[11px] font-medium uppercase tracking-wider text-white/35">
                          Produto
                        </p>

                        <p className="mt-1 text-sm font-semibold text-white">
                          {product.name}
                        </p>
                      </div>

                      {/* Descrição */}
                      <div>
                        <p className="text-[11px] font-medium uppercase tracking-wider text-white/35">
                          Descrição
                        </p>

                        <p className="mt-1 text-sm leading-relaxed text-white/60">
                          {product.description || "Sem descrição"}
                        </p>
                      </div>

                      {/* Informações */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[11px] font-medium uppercase tracking-wider text-white/35">
                            Preço
                          </p>

                          <p className="mt-1 text-sm font-semibold text-white">
                            {formatCurrency(product.price)}
                          </p>
                        </div>

                        <div>
                          <p className="text-[11px] font-medium uppercase tracking-wider text-white/35">
                            Cadastro
                          </p>

                          <p className="mt-1 text-sm text-white/60">
                            {formatDate(product.createdAt)}
                          </p>
                        </div>
                      </div>

                      {/* Ações */}
                      <div className="flex items-center gap-2 border-t border-white/10 pt-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEdit(product)}
                          className="
                h-10
                flex-1
                rounded-xl
                border
                border-white/10
                bg-transparent
                text-white/60
                transition-all
                duration-200
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
                          onClick={() => handleDelete(product.id)}
                          className="
                h-10
                flex-1
                rounded-xl
                border
                border-white/10
                bg-transparent
                text-white/60
                transition-all
                duration-200
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
                  </div>
                ))}

                {filtered.length === 0 && (
                  <div className="py-8 text-center text-sm text-white/40">
                    Nenhum produto encontrado
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
        title={editingProduct ? "Editar Produto" : "Novo Produto"}
        className="border border-white/10 bg-[#0a1120]/95 backdrop-blur-2xl text-white"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            id="name"
            label="Nome"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[var(--accent)]/50 focus:ring-[var(--accent)]/20"
          />
          <Input
            id="description"
            label="Descrição"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[var(--accent)]/50 focus:ring-[var(--accent)]/20"
          />
          <Input
            id="price"
            label="Preço (R$)"
            type="number"
            step="0.01"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            required
            className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[var(--accent)]/50 focus:ring-[var(--accent)]/20"
          />
          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
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
              className="bg-gradient-to-r from-[#071124] to-[#0d1a35] text-white ring-1 ring-white/10 hover:ring-[var(--accent)]/30"
            >
              {editingProduct ? "Salvar" : "Criar"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
