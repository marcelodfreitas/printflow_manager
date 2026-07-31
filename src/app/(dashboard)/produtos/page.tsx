"use client";

import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Pencil, Trash2 } from "lucide-react";
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
      <Header
        title="Produtos"
        className="border-b border-white/10 bg-white/[0.02] backdrop-blur-xl text-white"
      />

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-sm text-white/50">Carregando...</div>
        </div>
      )}

      {!loading && (
        <div className="space-y-5 px-4 py-5 sm:p-6 sm:space-y-6">
          <Card className="border border-white/10 bg-white/[0.03] backdrop-blur-2xl shadow-2xl shadow-black/40">
            <CardHeader className="border-b border-white/5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full flex-1 sm:max-w-xs">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                  <input
                    type="text"
                    placeholder="Buscar produtos..."
                    className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-10 pr-4 text-sm text-white placeholder:text-white/30 focus:border-[#fd6401]/50 focus:outline-none focus:ring-1 focus:ring-[#fd6401]/30"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <Button
                  onClick={openCreate}
                  className="bg-gradient-to-r from-[#071124] to-[#0d1a35] text-white shadow-lg shadow-black/30 ring-1 ring-white/10 transition-all duration-300 hover:shadow-[#fd6401]/20 hover:ring-[#fd6401]/30"
                >
                  <Plus className="h-4 w-4" />
                  Novo Produto
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
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
                        <p className="font-medium text-white">{product.name}</p>
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
                            onClick={() => handleDelete(product.id)}
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
                      <TableCell colSpan={5}>
                        <div className="py-8 text-center text-sm text-white/40">
                          Nenhum produto encontrado
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
            className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#fd6401]/50 focus:ring-[#fd6401]/20"
          />
          <Input
            id="description"
            label="Descrição"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#fd6401]/50 focus:ring-[#fd6401]/20"
          />
          <Input
            id="price"
            label="Preço (R$)"
            type="number"
            step="0.01"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            required
            className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#fd6401]/50 focus:ring-[#fd6401]/20"
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
              className="bg-gradient-to-r from-[#071124] to-[#0d1a35] text-white ring-1 ring-white/10 hover:ring-[#fd6401]/30"
            >
              {editingProduct ? "Salvar" : "Criar"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
