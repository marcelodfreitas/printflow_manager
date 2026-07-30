"use client";

import { useState, useMemo } from "react";
import { Plus, Search, Crown, Check } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card, CardContent } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { useSubscriptionPlans } from "@/hooks/useSubscriptionPlans";
import { formatCurrency } from "@/lib/utils";
import type { SubscriptionPlan } from "@/types";

const billingCycleLabels: Record<string, string> = {
  monthly: "Mensal",
  quarterly: "Trimestral",
  yearly: "Anual",
};

const billingCycleOptions = [
  { value: "monthly", label: "Mensal" },
  { value: "quarterly", label: "Trimestral" },
  { value: "yearly", label: "Anual" },
];

export default function PlanosPage() {
  const { plans, loading, create, update, remove } = useSubscriptionPlans();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    billingCycle: "monthly" as SubscriptionPlan["billingCycle"],
    maxPrints: "",
    maxFilamentGrams: "",
    maxHours: "",
    features: "",
    isActive: true,
  });

  const filtered = useMemo(
    () =>
      plans.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.description.toLowerCase().includes(search.toLowerCase()),
      ),
    [plans, search],
  );

  function openCreate() {
    setEditingPlan(null);
    setForm({
      name: "",
      description: "",
      price: "",
      billingCycle: "monthly",
      maxPrints: "",
      maxFilamentGrams: "",
      maxHours: "",
      features: "",
      isActive: true,
    });
    setModalOpen(true);
  }

  function openEdit(plan: SubscriptionPlan) {
    setEditingPlan(plan);
    setForm({
      name: plan.name,
      description: plan.description,
      price: String(plan.price),
      billingCycle: plan.billingCycle,
      maxPrints: plan.maxPrints === -1 ? "" : String(plan.maxPrints),
      maxFilamentGrams: String(plan.maxFilamentGrams),
      maxHours: String(plan.maxHours),
      features: plan.features.join("\n"),
      isActive: plan.isActive,
    });
    setModalOpen(true);
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const features = form.features
      .split("\n")
      .map((f) => f.trim())
      .filter(Boolean);

    const data = {
      name: form.name,
      description: form.description,
      price: Number(form.price) || 0,
      billingCycle: form.billingCycle,
      maxPrints: form.maxPrints ? Number(form.maxPrints) : -1,
      maxFilamentGrams: Number(form.maxFilamentGrams) || 0,
      maxHours: Number(form.maxHours) || 0,
      features,
      isActive: form.isActive,
    };

    if (editingPlan) {
      update(editingPlan.id, data);
    } else {
      create(data);
    }
    setModalOpen(false);
  }

  function handleDelete(id: string) {
    if (confirm("Tem certeza que deseja excluir este plano?")) {
      remove(id);
    }
  }

  function toggleActive(id: string, plan: SubscriptionPlan) {
    update(id, { isActive: !plan.isActive });
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
        title="Planos de Assinatura"
        className="border-b border-white/10 bg-white/[0.02] backdrop-blur-xl text-white"
      />

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-4">
          <Card className="border border-white/10 bg-[#0A1120] backdrop-blur-2xl shadow-2xl shadow-black/40">
            <CardContent className="p-5">
              <p className="text-sm text-white/50">Total de Planos</p>
              <p className="text-2xl font-bold text-white">{plans.length}</p>
            </CardContent>
          </Card>
          <Card className="border border-white/10 bg-[#0A1120] backdrop-blur-2xl shadow-2xl shadow-black/40">
            <CardContent className="p-5">
              <p className="text-sm text-white/50">Ativos</p>
              <p className="text-2xl font-bold text-green-400">
                {plans.filter((p) => p.isActive).length}
              </p>
            </CardContent>
          </Card>
          <Card className="border border-white/10 bg-[#0A1120] backdrop-blur-2xl shadow-2xl shadow-black/40">
            <CardContent className="p-5">
              <p className="text-sm text-white/50">Inativos</p>
              <p className="text-2xl font-bold text-white/50">
                {plans.filter((p) => !p.isActive).length}
              </p>
            </CardContent>
          </Card>
          <Card className="border border-white/10 bg-[#0A1120] backdrop-blur-2xl shadow-2xl shadow-black/40">
            <CardContent className="p-5">
              <p className="text-sm text-white/50">Preço Médio</p>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(
                  plans.reduce((a, p) => a + p.price, 0) / plans.length || 0,
                )}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Plans grid */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              placeholder="Buscar planos..."
              className="h-11 w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 text-sm text-white placeholder:text-white/30 outline-none transition-all duration-300 focus:border-[#fd6401]/50 focus:ring-2 focus:ring-[#fd6401]/20"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button
            onClick={openCreate}
            className="bg-gradient-to-r from-[#071124] to-[#0d1a35] text-white ring-1 ring-white/10 hover:ring-[#fd6401]/30"
          >
            <Plus className="h-4 w-4" />
            Novo Plano
          </Button>
        </div>

        {filtered.length === 0 ? (
          <Card className="border border-white/10 bg-[#0A1120] backdrop-blur-2xl shadow-2xl shadow-black/40">
            <CardContent className="p-12 text-center">
              <Crown className="mx-auto h-12 w-12 text-white/20" />
              <p className="mt-4 text-sm text-white/40">
                Nenhum plano encontrado
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((plan) => (
              <Card
                key={plan.id}
                className={`border backdrop-blur-2xl shadow-2xl shadow-black/40 transition-all duration-300 ${
                  plan.isActive
                    ? "border-white/10 bg-[#0A1120]"
                    : "border-white/5 bg-[#0A1120]/50 opacity-60"
                }`}
              >
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white">
                        {plan.name}
                      </h3>
                      <p className="mt-1 text-xs text-white/40 uppercase tracking-wider">
                        {billingCycleLabels[plan.billingCycle]}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-[#fd6401]">
                        {formatCurrency(plan.price)}
                      </p>
                      <p className="text-xs text-white/40">/mês</p>
                    </div>
                  </div>

                  <p className="mt-3 text-sm text-white/60 flex-1">
                    {plan.description}
                  </p>

                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/50">Impressões</span>
                      <span className="text-white font-medium">
                        {plan.maxPrints === -1
                          ? "Ilimitadas"
                          : `Até ${plan.maxPrints}`}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/50">Filamento</span>
                      <span className="text-white font-medium">
                        {plan.maxFilamentGrams}g
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/50">Horas</span>
                      <span className="text-white font-medium">
                        {plan.maxHours}h
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 space-y-1.5">
                    {plan.features.slice(0, 4).map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-400" />
                        <span className="text-white/60">{feature}</span>
                      </div>
                    ))}
                    {plan.features.length > 4 && (
                      <p className="text-xs text-white/30 pl-5">
                        +{plan.features.length - 4} mais
                      </p>
                    )}
                  </div>

                  <div className="mt-6 flex items-center gap-2 pt-4 border-t border-white/10">
                    <button
                      onClick={() => toggleActive(plan.id, plan)}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                        plan.isActive
                          ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                          : "bg-white/5 text-white/40 hover:bg-white/10"
                      }`}
                    >
                      {plan.isActive ? "Ativo" : "Inativo"}
                    </button>
                    <div className="flex-1" />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white/50 hover:text-white hover:bg-white/5"
                      onClick={() => openEdit(plan)}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-400/80 hover:text-red-400 hover:bg-red-500/10"
                      onClick={() => handleDelete(plan.id)}
                    >
                      Excluir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingPlan ? "Editar Plano" : "Novo Plano"}
        size="lg"
      >
        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              id="name"
              label="Nome do Plano"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#fd6401]/50 focus:ring-[#fd6401]/20"
              required
            />
            <Select
              id="billingCycle"
              label="Ciclo de Cobrança"
              options={billingCycleOptions}
              value={form.billingCycle}
              onChange={(e) =>
                setForm({
                  ...form,
                  billingCycle: e.target.value as SubscriptionPlan["billingCycle"],
                })
              }
              className="bg-white/5 border-white/10 text-white"
            />
          </div>

          <Input
            id="description"
            label="Descrição"
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
            className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#fd6401]/50 focus:ring-[#fd6401]/20"
          />

          <div className="grid gap-5 sm:grid-cols-3">
            <Input
              id="price"
              label="Preço (R$)"
              type="number"
              step="0.01"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#fd6401]/50 focus:ring-[#fd6401]/20"
              required
            />
            <Input
              id="maxPrints"
              label="Max. Impressões"
              type="number"
              placeholder="Deixe vazio para ilimitado"
              value={form.maxPrints}
              onChange={(e) =>
                setForm({ ...form, maxPrints: e.target.value })
              }
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#fd6401]/50 focus:ring-[#fd6401]/20"
            />
            <Input
              id="maxFilamentGrams"
              label="Max. Filamento (g)"
              type="number"
              value={form.maxFilamentGrams}
              onChange={(e) =>
                setForm({ ...form, maxFilamentGrams: e.target.value })
              }
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#fd6401]/50 focus:ring-[#fd6401]/20"
            />
          </div>

          <Input
            id="maxHours"
            label="Max. Horas de Impressão"
            type="number"
            value={form.maxHours}
            onChange={(e) => setForm({ ...form, maxHours: e.target.value })}
            className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#fd6401]/50 focus:ring-[#fd6401]/20"
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-white/70">
              Benefícios (um por linha)
            </label>
            <textarea
              value={form.features}
              onChange={(e) =>
                setForm({ ...form, features: e.target.value })
              }
              rows={5}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none transition-all duration-300 focus:border-[#fd6401]/50 focus:ring-2 focus:ring-[#fd6401]/20 resize-none"
              placeholder="Impressione ilimitadas&#10;Suporte prioritário&#10;..."
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) =>
                setForm({ ...form, isActive: e.target.checked })
              }
              className="h-4 w-4 rounded border-white/10 bg-white/5 text-[#fd6401] focus:ring-[#fd6401]/20"
            />
            <span className="text-sm text-white/70">Plano ativo</span>
          </label>

          <div className="flex justify-end gap-3 border-t border-white/10 pt-5">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setModalOpen(false)}
              className="bg-white/5 text-white border-white/10 hover:bg-white/10"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-[#071124] to-[#0d1a35] text-white ring-1 ring-white/10 hover:ring-[#fd6401]/30"
            >
              {editingPlan ? "Salvar" : "Criar Plano"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
