"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const chartConfig = {
  reservas: { label: "Reservas", color: "var(--chart-1)" },
} satisfies ChartConfig;

export function OccupancyChart({ data }: { data: { date: string; reservas: number }[] }) {
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
        <Bar dataKey="reservas" fill="var(--color-reservas)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
