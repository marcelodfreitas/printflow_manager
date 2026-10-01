"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

interface RevenueData {
  date: string;
  revenue: number;
}

interface RevenueChartProps {
  data: RevenueData[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 10,
            left: -15,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient
              id="revenueGradient"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor="var(--accent)"
                stopOpacity={0.35}
              />

              <stop
                offset="100%"
                stopColor="var(--accent)"
                stopOpacity={0}
              />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.06)"
            vertical={false}
          />

          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{
              fill: "rgba(255,255,255,0.35)",
              fontSize: 11,
            }}
          />

          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{
              fill: "rgba(255,255,255,0.35)",
              fontSize: 11,
            }}
            tickFormatter={(value) =>
              `R$ ${Number(value).toLocaleString("pt-BR")}`
            }
          />

          <Tooltip
            cursor={{
              stroke: "var(--accent)",
              strokeOpacity: 0.25,
              strokeWidth: 1,
            }}
            contentStyle={{
              background: "#0a1120",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "12px",
              boxShadow: "0 20px 50px rgba(0,0,0,0.4)",
            }}
            labelStyle={{
              color: "rgba(255,255,255,0.5)",
              marginBottom: "4px",
            }}
            itemStyle={{
              color: "var(--accent)",
            }}
            formatter={(value) => [
              formatCurrency(Number(value)),
              "Receita",
            ]}
          />

          <Area
            type="monotone"
            dataKey="revenue"
            stroke="var(--accent)"
            strokeWidth={2.5}
            fill="url(#revenueGradient)"
            dot={false}
            activeDot={{
              r: 5,
              strokeWidth: 2,
              stroke: "var(--accent)",
              fill: "#0a1120",
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}