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
import { mockDashboardStats, mockOrders } from "@/data/mock";
import { formatCurrency, translateStatus } from "@/lib/utils";

export default function DashboardPage() {
  const stats = mockDashboardStats;

  return (
    <div className="relative min-h-screen bg-[#050914]">
      {/* Ambient background glow — same language as login */}
      <div className="pointer-events-none fixed -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-[#071124]/60 blur-[120px]" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.06)_1px,transparent_0)] bg-[size:32px_32px]" />

      <div className="relative">
        <Header
          title="Dashboard"
          className="border-b border-white/10 bg-white/[0.02] backdrop-blur-xl text-white"
        />

        <div className="p-8 space-y-8">
          
          {/* <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#071124] via-[#09162f] to-[#050914] p-8 shadow-2xl">
            <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#fd6401]/10 blur-3xl" />
            <div className="absolute -left-16 bottom-0 h-60 w-60 rounded-full bg-blue-600/10 blur-3xl" />

            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-white/50 text-sm uppercase tracking-[0.25em]">
                  PrintFlow ERP
                </p>

                <h1 className="mt-2 text-4xl font-bold text-white">
                  Bem-vindo 👋
                </h1>

                <p className="mt-3 max-w-xl text-white/60">
                  Hoje você possui{" "}
                  <span className="font-semibold text-white">
                    {stats.pendingOrders}
                  </span>{" "}
                  pedidos aguardando produção e{" "}
                  <span className="font-semibold text-[#fd6401]">
                    {formatCurrency(stats.monthlyRevenue)}
                  </span>{" "}
                  faturados neste mês.
                </p>
              </div>

              <div className="hidden xl:flex h-40 w-40 items-center justify-center rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl">
                <Printer className="h-16 w-16 text-[#fd6401]" />
              </div>
            </div>
          </section> */}

          {/* Cards */}

          <div className="grid gap-5 lg:grid-cols-4">
            <StatsCard
              title="Clientes"
              value={stats.totalClients}
              icon={<Users className="h-6 w-6" />}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl transition hover:-translate-y-1 hover:border-[#fd6401]/30 hover:shadow-[0_20px_60px_rgba(253,100,1,.15)] text-white [&_svg]:text-[#fd6401]"
            />

            <StatsCard
              title="Impressoras"
              value={`${stats.activePrinters}/${stats.totalPrinters}`}
              icon={<Printer className="h-6 w-6" />}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl transition hover:-translate-y-1 hover:border-[#fd6401]/30 hover:shadow-[0_20px_60px_rgba(253,100,1,.15)] text-white [&_svg]:text-[#fd6401]"
            />

            <StatsCard
              title="Pedidos"
              value={stats.pendingOrders}
              icon={<AlertCircle className="h-6 w-6" />}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl transition hover:-translate-y-1 hover:border-[#fd6401]/30 hover:shadow-[0_20px_60px_rgba(253,100,1,.15)] text-white [&_svg]:text-[#fd6401]"
            />

            <StatsCard
              title="Receita"
              value={formatCurrency(stats.monthlyRevenue)}
              icon={
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20 backdrop-blur-sm">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
              }
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-[#fd6401] text-white shadow-[0_20px_60px_rgba(253,100,1,.25)]"
            />
          </div>

          {/* Conteúdo inferior */}

          <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
            <Card className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-2xl">
              <CardHeader className="border-b border-white/10 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Pedidos Recentes
                  </h2>

                  </div>
              </CardHeader>

              <CardContent className="divide-y divide-white/5">
                {mockOrders.slice(0, 5).map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between py-2"
                  >
                    <div>
                      <h3 className="font-medium text-white">
                        {order.clientName}
                      </h3>

                      <p className="text-sm text-white/40">
                        {order.printerName} • {order.filamentName}
                      </p>
                    </div>

                    <div className="flex items-center gap-5">
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
              <CardContent className="flex h-full flex-col items-center justify-center text-center p-8">
                <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-[#fd6401]/10 ring-1 ring-[#fd6401]/20">
                  <Package className="h-12 w-12 text-[#fd6401]" />
                </div>

                <h2 className="mt-6 text-3xl font-bold text-white">
                  {stats.filamentStock}
                </h2>

                <p className="mt-2 text-white/50">
                  Bobinas disponíveis em estoque
                </p>

                <div className="mt-8 w-full rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div className="flex justify-between">
                    <span className="text-white/50">Consumo mensal</span>

                    <span className="font-semibold text-white">38%</span>
                  </div>

                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full w-[38%] rounded-full bg-gradient-to-r from-[#fd6401] to-orange-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
