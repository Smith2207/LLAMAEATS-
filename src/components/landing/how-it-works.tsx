import { Search, CalendarCheck, QrCode } from "lucide-react";

const STEPS = [
  {
    icon: Search,
    title: "Busca tu restaurante",
    description: "Filtra por categoría, distrito, fecha, hora y número de personas.",
  },
  {
    icon: CalendarCheck,
    title: "Elige tu mesa y paga la tarifa",
    description: "Selecciona la mesa en el plano y paga solo S/ 3–5 de tarifa de servicio.",
  },
  {
    icon: QrCode,
    title: "Muestra tu código al llegar",
    description: "Recibe un código único y QR descargable. Sin filas, tu mesa te espera.",
  },
];

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-20">
      <h2 className="text-center font-display text-2xl font-bold text-foreground sm:text-3xl">
        Cómo funciona
      </h2>
      <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
        {STEPS.map((step, i) => (
          <div key={step.title} className="relative rounded-2xl border border-border/60 bg-card p-6">
            <span className="font-display text-sm font-bold text-primary">0{i + 1}</span>
            <step.icon className="mt-3 size-8 text-primary" />
            <h3 className="mt-4 font-display font-semibold text-foreground">{step.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
