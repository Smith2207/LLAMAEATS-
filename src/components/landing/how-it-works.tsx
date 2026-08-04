import { Search, CalendarCheck, QrCode } from "lucide-react";
import { RevealItem } from "@/components/animations/reveal-item";

const STEPS = [
  {
    icon: Search,
    title: "Busca tu restaurante",
    description: "Filtra por categoría, distrito, fecha, hora y número de personas.",
  },
  {
    icon: CalendarCheck,
    title: "Elige tu mesa y listo",
    description: "Selecciona la mesa en el plano y confirma — reservar es gratis, sin tarjeta.",
  },
  {
    icon: QrCode,
    title: "Muestra tu código al llegar",
    description: "Recibe un código único y QR descargable. Sin filas, tu mesa te espera.",
  },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="mx-auto max-w-5xl scroll-mt-20 px-4 py-20">
      <h2 className="text-center font-display text-2xl font-bold text-foreground sm:text-3xl">
        Cómo funciona
      </h2>
      <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
        {STEPS.map((step, i) => (
          <RevealItem
            key={step.title}
            index={i}
            className="group relative rounded-2xl border border-border/60 bg-card p-6 transition-colors hover:border-terracota-400/50"
          >
            <span className="font-display text-sm font-bold text-terracota-400">0{i + 1}</span>
            <step.icon className="mt-3 size-8 text-terracota-400 transition-transform group-hover:scale-110" />
            <h3 className="mt-4 font-display font-semibold text-foreground">{step.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
          </RevealItem>
        ))}
      </div>
    </section>
  );
}
