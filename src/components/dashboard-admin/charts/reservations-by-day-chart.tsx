"use client";

import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const chartConfig = {
  reservas: { label: "Reservas", color: "var(--chart-1)" },
} satisfies ChartConfig;

export function ReservationsByDayChart({ data }: { data: { date: string; reservas: number }[] }) {
  return (
    <ChartContainer config={chartConfig} className="max-h-64 w-full">
      <LineChart data={data}>
        <CartesianGrid vertical={false} stroke="var(--border)" />
        <XAxis
          dataKey="date"
          tickFormatter={(v: string) => v.slice(5)}
          tickLine={false}
          axisLine={false}
          fontSize={11}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Line
          type="monotone"
          dataKey="reservas"
          stroke="var(--color-reservas)"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ChartContainer>
  );
}
