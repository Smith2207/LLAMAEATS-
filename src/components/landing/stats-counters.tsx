import { AnimatedCounter } from "@/components/animations/counter";

const STATS = [
  { value: 4, suffix: "", label: "Restaurantes aliados en Puno" },
  { value: 90, suffix: " min", label: "Bloques de reserva" },
  { value: 15, suffix: " min", label: "Para confirmar tu pago" },
  { value: 2, suffix: " h", label: "Cancelación con reembolso total" },
];

export function StatsCounters() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-16">
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
        {STATS.map((stat) => (
          <div key={stat.label} className="text-center">
            <AnimatedCounter
              value={stat.value}
              suffix={stat.suffix}
              className="font-display text-3xl font-bold text-primary sm:text-4xl"
            />
            <p className="mt-2 text-xs text-muted-foreground sm:text-sm">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
