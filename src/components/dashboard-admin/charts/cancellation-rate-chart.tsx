"use client";

import { Cell, Pie, PieChart } from "recharts";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";

const chartConfig = {
  canceladas: { label: "Canceladas", color: "var(--chart-4)" },
  resto: { label: "Resto", color: "var(--muted)" },
} satisfies ChartConfig;

export function CancellationRateChart({
  cancelled,
  total,
}: {
  cancelled: number;
  total: number;
}) {
  const rate = total > 0 ? (cancelled / total) * 100 : 0;
  const data = [
    { name: "canceladas", value: cancelled },
    { name: "resto", value: Math.max(total - cancelled, 0) },
  ];

  return (
    <div className="relative">
      <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-48">
        <PieChart>
          <Pie data={data} dataKey="value" innerRadius={55} outerRadius={80} strokeWidth={2}>
            <Cell fill="var(--color-canceladas)" />
            <Cell fill="var(--color-resto)" />
          </Pie>
        </PieChart>
      </ChartContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-2xl font-bold text-foreground">
          {rate.toFixed(1)}%
        </span>
        <span className="text-xs text-muted-foreground">cancelación</span>
      </div>
    </div>
  );
}
