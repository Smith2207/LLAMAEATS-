"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const chartConfig = {
  comision: { label: "Comisión (S/)", color: "var(--chart-1)" },
} satisfies ChartConfig;

export function CommissionChart({ data }: { data: { date: string; comision: number }[] }) {
  return (
    <ChartContainer config={chartConfig} className="max-h-72 w-full">
      <BarChart data={data}>
        <CartesianGrid vertical={false} stroke="var(--border)" />
        <XAxis
          dataKey="date"
          tickFormatter={(v: string) => v.slice(5)}
          tickLine={false}
          axisLine={false}
          fontSize={11}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="comision" fill="var(--color-comision)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
