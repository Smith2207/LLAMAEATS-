import { PhoneOff, UserX, CalendarX2, EyeOff, Notebook } from "lucide-react";
import { RevealItem } from "@/components/animations/reveal-item";

const PAIN_POINTS = [
  {
    icon: UserX,
    text: "Comensales que reservan por teléfono y nunca llegan, sin ninguna manera de evitarlo.",
  },
  {
    icon: PhoneOff,
    text: "El teléfono suena en la hora pico mientras tratas de atender las mesas que ya tienes.",
  },
  {
    icon: CalendarX2,
    text: "Dos personas anotadas para la misma mesa a la misma hora por un cruce de agenda a mano.",
  },
  {
    icon: EyeOff,
    text: "No sabes cómo va la noche si no estás parado frente al cuaderno de reservas.",
  },
  {
    icon: Notebook,
    text: "Ningún registro de quién es cliente frecuente, ni de sus preferencias o alergias.",
  },
];

export function PainPoints() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-16">
      <h2 className="text-center font-display text-2xl font-bold text-foreground sm:text-3xl">
        Lo que ya conoces de manejar reservas a mano
      </h2>
      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {PAIN_POINTS.map((point, i) => (
          <RevealItem
            key={point.text}
            index={i}
            className="flex items-start gap-3 rounded-xl border border-border/60 bg-card p-4"
          >
            <point.icon className="mt-0.5 size-5 shrink-0 text-destructive" />
            <p className="text-sm text-foreground">{point.text}</p>
          </RevealItem>
        ))}
      </div>
    </section>
  );
}
