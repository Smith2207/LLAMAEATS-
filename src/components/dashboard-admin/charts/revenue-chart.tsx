"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const chartConfig = {
  ingresos: { label: "Ingresos (S/)", color: "var(--chart-2)" },
} satisfies ChartConfig;

export function RevenueChart({ data }: { data: { date: string; ingresos: number }[] }) {
  return (
    <ChartContainer config={chartConfig} className="max-h-64 w-full">
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
        <Bar dataKey="ingresos" fill="var(--color-ingresos)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
