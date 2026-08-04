import { AnimatedCounter } from "@/components/animations/counter";
import { RevealItem } from "@/components/animations/reveal-item";

const STATS = [
  { value: 3, prefix: "", suffix: "", label: "Pasos para reservar tu mesa" },
  { value: 90, prefix: "", suffix: " min", label: "Bloques de reserva" },
  { value: 0, prefix: "S/", suffix: "", label: "Costo de reservar tu mesa" },
  { value: 60, prefix: "", suffix: " días", label: "Anticipación máxima para reservar" },
];

export function StatsCounters() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-16">
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
        {STATS.map((stat, i) => (
          <RevealItem key={stat.label} index={i} className="text-center">
            <AnimatedCounter
              value={stat.value}
              prefix={stat.prefix}
              suffix={stat.suffix}
              className="font-display text-3xl font-bold text-terracota-400 sm:text-4xl"
            />
            <p className="mt-2 text-xs text-muted-foreground sm:text-sm">{stat.label}</p>
          </RevealItem>
        ))}
      </div>
    </section>
  );
}
