"use client";

import { useState, useMemo } from "react";
import { Calculator, Beaker, RotateCcw } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card, CardContent } from "@/components/ui/Card";
import { mockFilaments, mockPrinters, mockOrders } from "@/data/mock";
import { formatCurrency } from "@/lib/utils";

interface CalcInputs {
  filamentId: string;
  weight: string;
  waste: string;
  printerId: string;
  printTime: string;
  energyRate: string;
  laborRate: string;
  additionalCosts: string;
  margin: string;
}

const defaultInputs: CalcInputs = {
  filamentId: "",
  weight: "100",
  waste: "10",
  printerId: "",
  printTime: "5",
  energyRate: "0.80",
  laborRate: "15.00",
  additionalCosts: "0",
  margin: "30",
};

const tabs = [
  { id: "calculator", label: "Calculadora", icon: Calculator },
  { id: "simulation", label: "Simulação", icon: Beaker },
];

function useCalculator(inputs: CalcInputs) {
  return useMemo(() => {
    const filament = mockFilaments.find((f) => f.id === inputs.filamentId);
    const printer = mockPrinters.find((p) => p.id === inputs.printerId);

    const weight = Number(inputs.weight) || 0;
    const waste = Number(inputs.waste) || 0;
    const wasteFactor = 1 + waste / 100;
    const printTime = Number(inputs.printTime) || 0;
    const energyRate = Number(inputs.energyRate) || 0;
    const laborRate = Number(inputs.laborRate) || 0;
    const additionalCosts = Number(inputs.additionalCosts) || 0;
    const margin = Number(inputs.margin) || 0;

    const effectiveWeight = weight * wasteFactor;
    const costPerGram = filament ? filament.costPerKg / 1000 : 0;
    const materialCost = effectiveWeight * costPerGram;

    const powerKW = printer?.powerConsumption ? printer.powerConsumption / 1000 : 0;
    const energyCost = printTime * powerKW * energyRate;

    const depreciationCost = printer ? printTime * printer.costPerHour : 0;

    const laborCost = printTime * laborRate;

    const totalCost = materialCost + energyCost + depreciationCost + laborCost + additionalCosts;
    const profit = totalCost * (margin / 100);
    const suggestedPrice = totalCost + profit;

    return {
      filament,
      printer,
      materialCost,
      energyCost,
      depreciationCost,
      laborCost,
      additionalCosts,
      totalCost,
      profit,
      suggestedPrice,
      margin,
      effectiveWeight,
      powerKW,
      printTime,
    };
  }, [inputs]);
}

export default function CalculadoraPage() {
  const [activeTab, setActiveTab] = useState("calculator");
  const [calcInputs, setCalcInputs] = useState<CalcInputs>(defaultInputs);
  const [simInputs, setSimInputs] = useState<CalcInputs>(defaultInputs);

  const calcResult = useCalculator(calcInputs);
  const simResult = useCalculator(simInputs);

  const currentInputs = activeTab === "calculator" ? calcInputs : simInputs;
  const setCurrentInputs = activeTab === "calculator" ? setCalcInputs : setSimInputs;
  const result = activeTab === "calculator" ? calcResult : simResult;
  function handleReset() {
    if (activeTab === "calculator") setCalcInputs(defaultInputs);
    else setSimInputs(defaultInputs);
  }

  const orderOptions = mockOrders.map((o) => ({
    value: o.id,
    label: `#${o.id} - ${o.clientName}`,
  }));

  function handleFilamentChange(id: string) {
    setCurrentInputs((prev) => ({ ...prev, filamentId: id }));
  }

  function handlePrinterChange(id: string) {
    setCurrentInputs((prev) => ({ ...prev, printerId: id }));
  }

  function updateInput(updates: Partial<CalcInputs>) {
    setCurrentInputs((prev) => ({ ...prev, ...updates }));
  }

  return (
    <div className="relative min-h-screen bg-[#050914]">
      <div className="pointer-events-none fixed -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-[#071124]/60 blur-[120px]" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.06)_1px,transparent_0)] bg-[size:32px_32px]" />
      <Header
        title="Calculadora de Custos"
        className="border-b border-white/10 bg-white/[0.02] backdrop-blur-xl text-white"
      />

      <div className="p-6 space-y-6">
        {/* Tabs */}
        <div className="flex gap-1 rounded-xl border border-white/10 bg-[#0A1120] p-1 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-[#fd6401] text-white shadow-lg"
                  : "text-white/50 hover:text-white"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
          {/* Form */}
          <div className="space-y-6">
            {/* Auto-fill */}
            <Card className="border border-white/10 bg-[#0A1120] backdrop-blur-2xl shadow-2xl shadow-black/40">
              <CardContent className="p-5">
                <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
                  Preenchimento Automático
                </h3>
                <div className="grid gap-4 sm:grid-cols-3">
                  <Select
                    label="Pedido (opcional)"
                    placeholder="Selecione um pedido..."
                    options={orderOptions}
                    className="bg-white/5 border-white/10 text-white"
                    onChange={(e) => {
                      const order = mockOrders.find((o) => o.id === e.target.value);
                      if (order) {
                        setCurrentInputs((prev) => ({
                          ...prev,
                          weight: String(order.filamentGrams),
                          printTime: String(order.totalHours),
                          filamentId: order.filamentId,
                          printerId: order.printerId,
                        }));
                      }
                    }}
                  />
                  <Select
                    label="Filamento"
                    placeholder="Selecione..."
                    options={mockFilaments.map((f) => ({
                      value: f.id,
                      label: `${f.name} (${formatCurrency(f.costPerKg)}/kg)`,
                    }))}
                    value={currentInputs.filamentId}
                    className="bg-white/5 border-white/10 text-white"
                    onChange={(e) => handleFilamentChange(e.target.value)}
                  />
                  <Select
                    label="Impressora"
                    placeholder="Selecione..."
                    options={mockPrinters.map((p) => ({
                      value: p.id,
                      label: `${p.name} (${p.costPerHour.toFixed(2)}/h)`,
                    }))}
                    value={currentInputs.printerId}
                    className="bg-white/5 border-white/10 text-white"
                    onChange={(e) => handlePrinterChange(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Parameters */}
            <Card className="border border-white/10 bg-[#0A1120] backdrop-blur-2xl shadow-2xl shadow-black/40">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
                    Parâmetros de Cálculo
                  </h3>
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-1 text-xs text-white/40 hover:text-white transition-colors"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Resetar
                  </button>
                </div>

                <div className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-3">
                    <Input
                      id="weight"
                      label="Peso da peça (g)"
                      type="number"
                      step="0.1"
                      min="0"
                      placeholder="100"
                      value={currentInputs.weight}
                      onChange={(e) => updateInput({ weight: e.target.value })}
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#fd6401]/50 focus:ring-[#fd6401]/20"
                    />
                    <Input
                      id="waste"
                      label="Desperdício (%)"
                      type="number"
                      step="0.1"
                      min="0"
                      placeholder="10"
                      value={currentInputs.waste}
                      onChange={(e) => updateInput({ waste: e.target.value })}
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#fd6401]/50 focus:ring-[#fd6401]/20"
                    />
                    <Input
                      id="printTime"
                      label="Tempo de impressão (h)"
                      type="number"
                      step="0.5"
                      min="0"
                      placeholder="5"
                      value={currentInputs.printTime}
                      onChange={(e) => updateInput({ printTime: e.target.value })}
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#fd6401]/50 focus:ring-[#fd6401]/20"
                    />
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <Input
                      id="energyRate"
                      label="Custo de energia (R$/kWh)"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.80"
                      value={currentInputs.energyRate}
                      onChange={(e) => updateInput({ energyRate: e.target.value })}
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#fd6401]/50 focus:ring-[#fd6401]/20"
                    />
                    <Input
                      id="laborRate"
                      label="Mão de obra (R$/h)"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="15.00"
                      value={currentInputs.laborRate}
                      onChange={(e) => updateInput({ laborRate: e.target.value })}
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#fd6401]/50 focus:ring-[#fd6401]/20"
                    />
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <Input
                      id="additionalCosts"
                      label="Custos adicionais (R$)"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0"
                      value={currentInputs.additionalCosts}
                      onChange={(e) => updateInput({ additionalCosts: e.target.value })}
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#fd6401]/50 focus:ring-[#fd6401]/20"
                    />
                    <Input
                      id="margin"
                      label="Margem de lucro (%)"
                      type="number"
                      step="1"
                      min="0"
                      placeholder="30"
                      value={currentInputs.margin}
                      onChange={(e) => updateInput({ margin: e.target.value })}
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#fd6401]/50 focus:ring-[#fd6401]/20"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="space-y-4">
            {/* Info card */}
            <Card className="border border-white/10 bg-[#0A1120] backdrop-blur-2xl shadow-2xl shadow-black/40">
              <CardContent className="p-5 space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
                  Itens Selecionados
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-white/60">
                    <span>Filamento</span>
                    <span className="text-white">
                      {result.filament
                        ? `${result.filament.name} (${formatCurrency(result.filament.costPerKg)}/kg)`
                        : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between text-white/60">
                    <span>Impressora</span>
                    <span className="text-white">
                      {result.printer ? `${result.printer.name}` : "—"}
                    </span>
                  </div>
                  {result.printer && (
                    <>
                      <div className="flex justify-between text-white/60">
                        <span>Consumo</span>
                        <span className="text-white">{result.powerKW.toFixed(2)} kW</span>
                      </div>
                      <div className="flex justify-between text-white/60">
                        <span>Depreciação</span>
                        <span className="text-white">{formatCurrency(result.printer.costPerHour)}/h</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between text-white/60">
                    <span>Peso efetivo</span>
                    <span className="text-white">{result.effectiveWeight.toFixed(1)} g</span>
                  </div>
                  <div className="flex justify-between text-white/60">
                    <span>Tempo</span>
                    <span className="text-white">{result.printTime.toFixed(1)} h</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cost breakdown */}
            <Card className="border border-white/10 bg-[#0A1120] backdrop-blur-2xl shadow-2xl shadow-black/40">
              <div className="border-b border-white/10 px-5 py-4">
                <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
                  Custos
                </h3>
              </div>
              <CardContent className="p-5 space-y-3">
                <CostRow label="Matéria-prima" value={result.materialCost} />
                <CostRow label="Energia" value={result.energyCost} />
                <CostRow label="Depreciação" value={result.depreciationCost} />
                <CostRow label="Mão de obra" value={result.laborCost} />
                <CostRow label="Custos adicionais" value={result.additionalCosts} />
                <div className="h-px bg-white/10" />
                <CostRow label="Custo total" value={result.totalCost} bold />
                <div className="h-px bg-white/10" />
                <CostRow
                  label={`Lucro (${result.margin}%)`}
                  value={result.profit}
                  color={result.profit >= 0 ? "text-green-400" : "text-red-400"}
                />
              </CardContent>
            </Card>

            {/* Suggested price */}
            <Card className="border border-[#fd6401]/30 bg-[#fd6401]/5 backdrop-blur-2xl shadow-2xl shadow-black/40">
              <CardContent className="p-5 text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#fd6401]/60">
                  Preço Sugerido
                </p>
                <p className="mt-1 text-3xl font-bold text-white">
                  {formatCurrency(result.suggestedPrice)}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function CostRow({
  label,
  value,
  bold,
  color,
}: {
  label: string;
  value: number;
  bold?: boolean;
  color?: string;
}) {
  return (
    <div className="flex justify-between text-sm">
      <span className={bold ? "font-semibold text-white" : "text-white/60"}>
        {label}
      </span>
      <span className={color || (bold ? "font-semibold text-white" : "text-white/80")}>
        {formatCurrency(value)}
      </span>
    </div>
  );
}
