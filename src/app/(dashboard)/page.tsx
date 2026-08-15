"use client";

import {
  Users,
  Printer,
  Package,
  DollarSign,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import { StatsCard } from "@/components/ui/StatsCard";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Header } from "@/components/layout/Header";
import { useClients } from "@/hooks/useClients";
import { usePrinters } from "@/hooks/usePrinters";
import { useOrders } from "@/hooks/useOrders";
import { useFilaments } from "@/hooks/useFilaments";
import { formatCurrency, translateStatus } from "@/lib/utils";
import { RevenueChart } from "@/components/dashboard/RevenueChart";

console.log("COMPONENTES:", {
  StatsCard,
  Card,
  CardContent,
  CardHeader,
  Badge,
  Header,
});

function formatWeight(grams: number) {
  if (grams >= 1000) {
    return `${(grams / 1000).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} kg`;
  }

  return `${grams.toLocaleString("pt-BR", {
    maximumFractionDigits: 0,
  })} g`;
}

export default function DashboardPage() {
  const { clients, loading: loadingClients } = useClients();
  const { printers, loading: loadingPrinters } = usePrinters();
  const { orders, loading: loadingOrders } = useOrders();
  const { filaments, loading: loadingFilaments } = useFilaments();

  const stats = {
    totalClients: clients.length,
    totalPrinters: printers.length,
    activePrinters: printers.filter((p) => p.status === "active").length,
    totalOrders: orders.length,
    pendingOrders: orders.filter(
      (o) => o.status === "pending" || o.status === "approved",
    ).length,
    monthlyRevenue: orders
      .filter((o) => o.status === "delivered")
      .reduce((sum, o) => sum + o.price, 0),
    filamentStock: filaments.reduce(
      (sum, f) => sum + (f.remainingWeight ?? f.weight * f.quantity),
      0,
    ),
  };

  const revenueData = orders
    .filter((order) => order.status === "delivered")
    .reduce(
      (acc, order) => {
        const date = new Date(order.createdAt).toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
        });

        const existing = acc.find((item) => item.date === date);

        if (existing) {
          existing.revenue += order.price;
        } else {
          acc.push({
            date,
            revenue: order.price,
          });
        }

        return acc;
      },
      [] as { date: string; revenue: number }[],
    );

  if (loadingClients || loadingPrinters || loadingOrders || loadingFilaments) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="relative min-h-full bg-[#050914]">
      {/* Ambient background glow — same language as login */}

      <div className="relative">
        <div className="space-y-5 px-4 py-4 sm:p-6 sm:space-y-6">
          <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#071124] via-[#09162f] to-[#050914] p-8 shadow-2xl">
            <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full accent-bg blur-3xl" />
            <div className="absolute -left-16 bottom-0 h-60 w-60 rounded-full bg-blue-600/10 blur-3xl" />

            <div className="relative flex items-center justify-between">
              <div>
                <h1 className="mt-2 text-4xl font-bold text-white">
                  Bem-vindo!!
                </h1>

                <p className="mt-3 max-w-xl text-white/60">
                  Hoje você possui{" "}
                  <span className="font-semibold text-white">
                    {stats.pendingOrders}
                  </span>{" "}
                  pedidos aguardando produção e{" "}
                  <span className="font-semibold accent-text">
                    {formatCurrency(stats.monthlyRevenue)}
                  </span>{" "}
                  faturados neste mês.
                </p>
              </div>

              <div className="hidden xl:flex h-40 w-40 items-center justify-center rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl">
                <Printer className="h-16 w-16 text-white" />
              </div>
            </div>
          </section>

          {/* Cards */}

          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
  <StatsCard
    title="Clientes"
    value={stats.totalClients}
    icon={<Users className="h-5 w-5" />}
    className="
      group relative overflow-hidden rounded-3xl
      border border-white/10
      bg-white/[0.03]
      backdrop-blur-xl
      text-white
      transition-all duration-300
      hover:-translate-y-1
      hover:border-[var(--accent)]
      hover:shadow-[0_20px_60px_rgba(var(--accent-rgb),0.15)]
      [&_svg]:accent-text
    "
  />

  <StatsCard
    title="Impressoras"
    value={`${stats.activePrinters}/${stats.totalPrinters}`}
    icon={<Printer className="h-5 w-5" />}
    className="
      group relative overflow-hidden rounded-3xl
      border border-white/10
      bg-white/[0.03]
      backdrop-blur-xl
      text-white
      transition-all duration-300
      hover:-translate-y-1
      hover:border-[var(--accent)]
      hover:shadow-[0_20px_60px_rgba(var(--accent-rgb),0.15)]
      [&_svg]:accent-text
    "
  />

  <StatsCard
    title="Pedidos"
    value={stats.pendingOrders}
    icon={<AlertCircle className="h-5 w-5" />}
    className="
      group relative overflow-hidden rounded-3xl
      border border-white/10
      bg-white/[0.03]
      backdrop-blur-xl
      text-white
      transition-all duration-300
      hover:-translate-y-1
      hover:border-[var(--accent)]
      hover:shadow-[0_20px_60px_rgba(var(--accent-rgb),0.15)]
      [&_svg]:accent-text
    "
  />

  <StatsCard
    title="Receita"
    value={formatCurrency(stats.monthlyRevenue)}
    icon={
      <div
        className="
          flex h-12 w-12 items-center justify-center
          rounded-2xl
          accent-bg
          ring-1 ring-white/20
          backdrop-blur-sm
        "
      >
        <DollarSign className="h-5 w-5 text-white" />
      </div>
    }
    className="
      group relative overflow-hidden rounded-3xl
      border border-white/10
      bg-white/[0.03]
      text-white
      backdrop-blur-xl
      transition-all duration-300
      hover:-translate-y-1
      hover:border-[var(--accent)]
      hover:shadow-[0_20px_60px_rgba(var(--accent-rgb),0.15)]
    "
  />
</div>

          <Card className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-2xl">
            <CardHeader className="border-b border-white/10">
              <div>
                <h2 className="text-lg font-semibold text-white">Receita</h2>

                <p className="mt-1 text-sm text-white/40">
                  Faturamento dos pedidos entregues
                </p>
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-6">
              {revenueData.length > 0 ? (
                <RevenueChart data={revenueData} />
              ) : (
                <div className="flex h-[280px] items-center justify-center text-sm text-white/30">
                  Ainda não existem dados de receita para exibir.
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Conteúdo inferior */}

          <div className="grid gap-4 sm:gap-5 lg:grid-cols-[2fr_1fr]">
            <Card className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-2xl">
              <CardHeader className="flex items-center justify-between border-b border-white/10 px-4 py-4 sm:px-6">
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Pedidos Recentes
                  </h2>
                </div>
              </CardHeader>

              <CardContent className="divide-y divide-white/5 px-4 sm:px-6">
                {orders.slice(0, 5).map((order) => (
                  <div
                    key={order.id}
                    className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <h3 className="font-medium text-white">
                        {order.clientName}
                      </h3>

                      <p className="truncate text-sm text-white/40">
                        {order.printerName} • {order.filamentName}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 sm:gap-5">
                      <span className="font-semibold text-white">
                        {formatCurrency(order.price)}
                      </span>

                      <Badge
                        variant={
                          order.status === "printing"
                            ? "info"
                            : order.status === "completed" ||
                                order.status === "delivered"
                              ? "success"
                              : order.status === "cancelled"
                                ? "danger"
                                : "warning"
                        }
                      >
                        {translateStatus(order.status)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#071124] to-[#0d1a35] shadow-2xl">
              <CardContent className="flex h-full flex-col items-center justify-center p-6 text-center sm:p-8">
                <div className="flex h-20 w-20 items-center justify-center rounded-3xl accent-bg ring-1 ring-[var(--accent)] sm:h-24 sm:w-24">
                  <Package className="h-10 w-10 text-white sm:h-12 sm:w-12" />
                </div>

                <h2 className="mt-5 text-3xl font-bold tracking-tight text-white sm:mt-6">
                  {formatWeight(stats.filamentStock)}
                </h2>

                <p className="mt-2 max-w-[220px] text-sm text-white/50">
                  Filamento disponível em estoque
                </p>

              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
